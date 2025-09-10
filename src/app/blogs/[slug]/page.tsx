import { BlogPostClient } from "./blog-post-client"
import { getPostBySlug, getAllPostSlugs, type Post } from "@/lib/blog"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  
  if (!post) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    }
  }

  const categories = post.categories || (post.category ? [post.category] : [])
  const keywords = [
    ...categories,
    ...(post.tags || []),
    "cybersecurity",
    "CTF",
    "writeup",
    "harshfeudal"
  ]

  return {
    title: post.title,
    description: post.excerpt,
    keywords: keywords.join(", "),
    authors: [{ name: "Đặng Hữu Trung Sơn (harshfeudal)" }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated || post.date,
      authors: ["Đặng Hữu Trung Sơn"],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  }
}

export async function generateStaticParams() {
  // Get ALL post slugs including all language versions for static generation
  const allSlugs = getAllPostSlugs()
  return allSlugs.map((slug: string) => ({ slug }))
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  
  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-24 max-w-3xl">
          <h1 className="text-2xl font-bold">Post not found</h1>
        </div>
      </div>
    )
  }

  // Pre-load all language versions for client-side switching
  const allLanguageVersions: Record<string, Post> = {}
  if (post.availableLanguages) {
    for (const lang of post.availableLanguages) {
      const langPost = getPostBySlug(slug, lang.code)
      if (langPost) {
        allLanguageVersions[lang.code] = langPost
      }
    }
  }

  return <BlogPostClient initialPost={post} allLanguageVersions={allLanguageVersions} slug={slug} />
}
