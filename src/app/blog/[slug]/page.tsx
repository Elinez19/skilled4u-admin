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

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);
  const relatedArticles = getRelatedBlogArticles(article.id, 2);

  return (
    <div className="min-h-screen flex flex-col bg-surface-pearl text-ink-primary overflow-x-hidden">
      {/* Entrance Loading Animation */}
      <Preloader />

      {/* Floating Cobalt Slab Navbar ("Blog" Active in Gold) */}
      <LandingNavbar />

      {/* Main Blog Detail Page Sections (1:1 Reference Match) */}
      <main className="flex-1 space-y-2 sm:space-y-4">
        {/* 1. Article Hero Slab + Category/ReadTime Pills + Featured Visual Stage */}
        <BlogDetailHeroSection article={article} />

        {/* 2. Article Rich Body Copy + Bullet Lists + OffsetRing Share Row */}
        <BlogDetailArticleSection article={article} />

        {/* 3. "More News" Cobalt Slab + Related Article Cards */}
        <MoreNewsSection items={relatedArticles} />

        {/* 4. "Join Skilled4U Your Way." 3-Column Character Cards */}
        <AudienceGridSection />
      </main>

      {/* Rounded Cobalt Slab Footer + Giant Outlined Wordmark */}
      <LandingFooter />
    </div>
  );
}

