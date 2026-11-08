/**
 * Skilled4U Centralized Design System Tokens
 * Strictly used across all landing page components, SVGs, and interactive UI.
 * Never use hardcoded hex colors or ad-hoc classes outside this token registry.
 */

export const tokens = {
  colors: {
    brand: {
      50: "var(--brand-50)",
      100: "var(--brand-100)",
      200: "var(--brand-200)",
      300: "var(--brand-300)",
      400: "var(--brand-400)",
      500: "var(--brand-500)",
      600: "var(--brand-600)",
      700: "var(--brand-700)",
      800: "var(--brand-800)",
      900: "var(--brand-900)",
      950: "var(--brand-950)",
    },
    surface: {
      porcelain: "var(--surface-porcelain)",
      pearl: "var(--surface-pearl)",
      mist: "var(--surface-mist)",
      frost: "var(--surface-frost)",
      glass: "var(--surface-glass)",
      glassDark: "var(--surface-glass-dark)",
    },
    accent: {
      sky: "var(--accent-sky)",
      gold: "var(--accent-gold)",
      success: "var(--accent-success)",
      warm: "var(--accent-warm)",
      warmDark: "var(--accent-warm-dark)",
      warmDeep: "var(--accent-warm-deep)",
    },
    ink: {
      primary: "var(--ink-primary)",
      secondary: "var(--ink-secondary)",
      muted: "var(--ink-muted)",
      onBlue: "var(--ink-on-blue)",
      onBlueMuted: "var(--ink-on-blue-muted)",
    },
  },
  layout: {
    containerSlab: "var(--container-slab)",
  },
  radii: {
    xs: "var(--radius-xs)",
    sm: "var(--radius-sm)",
    md: "var(--radius-md)",
    lg: "var(--radius-lg)",
    card: "var(--radius-card)",
    slab: "var(--radius-slab)",
    pill: "var(--radius-pill)",
  },
  shadows: {
    ctaPrimary: "var(--shadow-cta-primary)",
    ctaSecondary: "var(--shadow-cta-secondary)",
    glossCard: "var(--shadow-gloss-card)",
    glossCardHover: "var(--shadow-gloss-card-hover)",
    glossFloat: "var(--shadow-gloss-float)",
    glossSlab: "var(--shadow-gloss-slab)",
  },
  gradients: {
    primaryCta: "var(--gloss-primary-cta)",
    secondaryCta: "var(--gloss-secondary-cta)",
    card: "var(--gloss-card)",
    slabBlue: "var(--gloss-slab-blue)",
    slabInk: "var(--gloss-slab-ink)",
    slabPearl: "var(--gloss-slab-pearl)",
    sheenWhite: "var(--gloss-sheen-white)",
    sheenBlue: "var(--gloss-sheen-blue)",
  },
} as const;

export type SlabTone = "blue" | "ink" | "pearl";
export type CtaVariant = "primary" | "secondary";

