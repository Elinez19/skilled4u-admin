import dns from "node:dns";
import net from "node:net";
import { neon, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Prefer IPv4 and increase Node's Happy Eyeballs attempt timeout (default 250ms is too low for cross-continent TLS to us-east-2)
dns.setDefaultResultOrder("ipv4first");
if (typeof net.setDefaultAutoSelectFamilyAttemptTimeout === "function") {
  net.setDefaultAutoSelectFamilyAttemptTimeout(5000);
}

// Configure a dedicated c-ares DNS resolver with public DNS servers + in-memory cache
// to prevent Windows OS getaddrinfo (192.168.1.1) from failing with EAI_AGAIN under concurrent queries.
const neonDnsResolver = new dns.promises.Resolver();
try {
  neonDnsResolver.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4", "1.0.0.1"]);
} catch {
  // Ignore if DNS servers cannot be set
}

const DNS_CACHE_TTL_MS = 10 * 60 * 1000;
const neonDnsCache = new Map<string, { ips: string[]; expiresAt: number }>();
const neonDnsInflight = new Map<string, Promise<string[]>>();
const FALLBACK_NEON_IPS = ["3.142.41.151", "3.14.138.241"];

async function resolveNeonHost(hostname: string): Promise<string[]> {
  const now = Date.now();
  const cached = neonDnsCache.get(hostname);
  if (cached && cached.expiresAt > now) {
    return cached.ips;
  }

  const inflight = neonDnsInflight.get(hostname);
  if (inflight) {
    return inflight;
  }

  const promise = (async () => {
    try {
      const ips = await neonDnsResolver.resolve4(hostname);
      // Prioritize low-latency AWS us-east-2 IPs (3.*) over slower secondary routes
      const sorted = [...ips].sort((a, b) =>
        a.startsWith("3.") === b.startsWith("3.")
          ? 0
          : a.startsWith("3.")
            ? -1
            : 1
      );
      if (sorted.length > 0) {
        neonDnsCache.set(hostname, {
          ips: sorted,
          expiresAt: Date.now() + DNS_CACHE_TTL_MS,
        });
        return sorted;
      }
    } catch {
      // Fallback to known Neon US-East-2 proxy IPs when local DNS times out
    }
    return FALLBACK_NEON_IPS;
  })().finally(() => {
    neonDnsInflight.delete(hostname);
  });

  neonDnsInflight.set(hostname, promise);
  return promise;
}

const globalForDns = globalThis as unknown as {
  __neonDnsPatched?: boolean;
};

if (!globalForDns.__neonDnsPatched) {
  globalForDns.__neonDnsPatched = true;
  const originalLookup = dns.lookup.bind(dns);

  // @ts-expect-error -- Node dns.lookup has multiple overload signatures
  dns.lookup = function patchedNeonLookup(
    hostname: string,
    options: dns.LookupOptions | ((err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void),
    callback?: (err: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void
  ) {
    let opts: dns.LookupOptions = {};
    let cb = callback;
    if (typeof options === "function") {
      cb = options;
    } else if (typeof options === "number") {
      opts = { family: options };
    } else if (options && typeof options === "object") {
      opts = options;
    }

    if (typeof hostname === "string" && hostname.endsWith(".neon.tech") && cb) {
      resolveNeonHost(hostname)
        .then((ips) => {
          if (opts.all) {
            cb(
              null,
              ips.map((address) => ({ address, family: 4 }))
            );
          } else {
            cb(null, ips[0], 4);
          }
        })
        .catch(() => {
          originalLookup(hostname, opts, cb);
        });
      return;
    }

    return originalLookup(hostname, opts, cb!);
  };
}

const MAX_FETCH_RETRIES = 4;

neonConfig.fetchFunction = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  let lastError: unknown;

  for (let attempt = 0; attempt < MAX_FETCH_RETRIES; attempt++) {
    try {
      const response = await fetch(input, init);
      if (
        response.status >= 502 &&
        response.status <= 504 &&
        attempt < MAX_FETCH_RETRIES - 1
      ) {
        await new Promise((resolve) =>
          setTimeout(resolve, 250 * (attempt + 1))
        );
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_FETCH_RETRIES - 1) {
        await new Promise((resolve) =>
          setTimeout(resolve, 250 * (attempt + 1))
        );
      }
    }
  }

  throw lastError;
};

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://neondb_owner:npg_bnVFW46HRuBS@ep-calm-dream-bdk3yjpp-pooler.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require";

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });



