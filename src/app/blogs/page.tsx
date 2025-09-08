import { BlogHeader } from "@/components/blog-header"
import { ScrollToTop } from "@/components/scroll-to-top"
import { getAllPosts } from "@/lib/blog"
import BlogsListClient from "@/components/blogs-list-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blogs",
  description: "Explore my journey in cybersecurity, CTF writeups, daily experiences, and personal insights. Deep dives into machine learning challenges, security research, and technical tutorials.",
  keywords: ["cybersecurity", "CTF", "writeups", "machine learning", "security", "tutorials", "hacking", "programming"],
  openGraph: {
    title: "Blogs - Harshfeudal",
    description: "Explore my journey in cybersecurity, CTF writeups, daily experiences, and personal insights.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blogs - Harshfeudal",
    description: "Explore my journey in cybersecurity, CTF writeups, daily experiences, and personal insights.",
  },
}

export default function BlogsPage() {
  const posts = getAllPosts()
  return (
    <div className="bg-background relative overflow-hidden">
      <BlogHeader />
      
      <main className="container mx-auto px-6 py-12 max-w-7xl relative pt-24">
        <div className="text-center mb-16 animate-slideInUp">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-6 text-balance">
            My Blogs
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Explore my journey in cybersecurity, daily experiences, and more personal insights along the way
          </p>
        </div>
        <BlogsListClient posts={posts.map(p => ({
          id: p.slug,
          title: p.title,
          excerpt: p.excerpt,
          category: p.category,
          categories: p.categories,
          languages: p.languages,
          authors: p.authors,
          tags: p.tags,
          date: p.date,
          readTime: p.readTime,
          slug: p.slug,
        }))} />
      </main>
      
      <ScrollToTop />
    </div>
  )
}
