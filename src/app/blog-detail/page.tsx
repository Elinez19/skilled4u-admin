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

const defaultArticle = getBlogArticleBySlug(
  landingContent.blogPage.detail.defaultArticleId
);

export const metadata: Metadata = {
  title: `${defaultArticle.title} | Skilled4U Blog`,
  description: defaultArticle.description,
};

export default function DefaultBlogDetailPage() {
  const relatedArticles = getRelatedBlogArticles(defaultArticle.id, 2);

  return (
    <div className="min-h-screen flex flex-col bg-surface-pearl text-ink-primary overflow-x-hidden">
      <Preloader />
      <LandingNavbar />

      <main className="flex-1 space-y-2 sm:space-y-4">
        <BlogDetailHeroSection article={defaultArticle} />
        <BlogDetailArticleSection article={defaultArticle} />
        <MoreNewsSection items={relatedArticles} />
        <AudienceGridSection />
      </main>

      <LandingFooter />
    </div>
  );
}

