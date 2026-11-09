import * as React from "react";
import type { Metadata } from "next";
import {
  BlogDetailArticleSection,
  BlogDetailHeroSection,
  MoreNewsSection,
} from "@/components/landing/composites/blog-page-sections";
import {
  LandingFooter,
  LandingNavbar,
  Preloader,
} from "@/components/landing/composites/navigation";
import { AudienceGridSection } from "@/components/landing/composites/whats-new-grid";
import {
  getBlogArticleBySlug,
  getRelatedBlogArticles,
  landingContent,
} from "@/content/landing";

export function generateStaticParams() {
  return landingContent.blogPage.items.flatMap((item) => [
    { slug: item.slug },
    { slug: item.id },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);

  return {
    title: `${article.title} | Skilled4U Blog`,
    description: article.description,
  };
}

async function BlogDetailArticleContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);
  const relatedArticles = getRelatedBlogArticles(article.id, 2);

  return (
    <>
      {/* 1. Article Hero Slab + Category/ReadTime Pills + Featured Visual Stage */}
      <BlogDetailHeroSection article={article} />

      {/* 2. Article Rich Body Copy + Bullet Lists + OffsetRing Share Row */}
      <BlogDetailArticleSection article={article} />

      {/* 3. "More News" Cobalt Slab + Related Article Cards */}
      <MoreNewsSection items={relatedArticles} />
    </>
  );
}

function BlogDetailArticleFallback() {
  return (
    <>
      <div id="top" className="px-3 sm:px-5 lg:px-7 pt-3 pb-2" aria-busy="true">
        <div className="surface-slab-blue relative mx-auto max-w-slab overflow-hidden rounded-slab">
          <div className="relative z-10 mx-auto max-w-4xl px-5 sm:px-8 pt-14 sm:pt-20 lg:pt-24 pb-10 sm:pb-14 text-center">
            <div className="mx-auto h-12 sm:h-16 max-w-2xl rounded-2xl bg-brand-800/70 animate-pulse" />
            <div className="mx-auto mt-5 h-5 sm:h-6 max-w-xl rounded-pill bg-brand-800/55 animate-pulse" />
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="h-8 w-28 rounded-pill border border-brand-700 bg-brand-950/80 animate-pulse" />
              <div className="h-8 w-28 rounded-pill border border-brand-700 bg-brand-950/80 animate-pulse" />
            </div>
            <div className="mx-auto mt-10 sm:mt-12 h-76 sm:h-96 lg:h-[410px] max-w-3xl rounded-card border-2 border-brand-400/40 bg-brand-950/90 shadow-gloss-float animate-pulse" />
          </div>
        </div>
      </div>

      <div className="px-3 sm:px-5 lg:px-7 py-2">
        <div className="surface-slab-pearl mx-auto max-w-slab rounded-slab px-5 sm:px-8 py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-2xl lg:max-w-3xl space-y-5">
            <div className="h-5 w-full rounded-pill bg-brand-100/70 animate-pulse" />
            <div className="h-5 w-11/12 rounded-pill bg-brand-100/70 animate-pulse" />
            <div className="h-5 w-4/5 rounded-pill bg-brand-100/70 animate-pulse" />
          </div>
        </div>
      </div>
    </>
  );
}

export default function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-pearl text-ink-primary overflow-x-hidden">
      {/* Entrance Loading Animation */}
      <Preloader />

      {/* Floating Cobalt Slab Navbar ("Blog" Active in Gold) */}
      <LandingNavbar />

      {/* Main Blog Detail Page Sections (1:1 Reference Match) */}
      <main className="flex-1 space-y-2 sm:space-y-4">
        <React.Suspense fallback={<BlogDetailArticleFallback />}>
          <BlogDetailArticleContent params={params} />
        </React.Suspense>

        {/* 4. "Join Skilled4U Your Way." 3-Column Character Cards */}
        <AudienceGridSection />
      </main>

      {/* Rounded Cobalt Slab Footer + Giant Outlined Wordmark */}
      <LandingFooter />
    </div>
  );
}

