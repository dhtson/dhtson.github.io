import { BlogHeader } from "@/components/blog-header"
import { ScrollToTop } from "@/components/scroll-to-top"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { getAllPosts, getPostBySlug } from "@/lib/blog"
import { Calendar, Clock } from "@/components/icons"
import { ClientDate } from "@/components/client-date"
import { ShareButton } from "@/components/share-button"
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
  const posts = getAllPosts()
  return posts.map((p) => ({ slug: p.slug }))
}

// Match tag color palette used in BlogGrid
function getTagColor(tag: string) {
  const colors = [
    "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20",
    "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20",
    "bg-pink-500/10 text-pink-500 border-pink-500/20 hover:bg-pink-500/20",
    "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20",
    "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/20",
    "bg-teal-500/10 text-teal-500 border-teal-500/20 hover:bg-teal-500/20",
  ]
  const hash = tag.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

// Match category color palette used in BlogGrid
function getCategoryColor(category: string) {
  switch (category) {
    case "Career":
      return "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
    case "CTF":
      return "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20"
    case "AI/ML":
      return "bg-accent/10 text-accent border-accent/20 hover:bg-accent/20"
    case "Security":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20"
    case "Tutorial":
      return "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20"
    default: {
      const colors = [
        "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20",
        "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20",
        "bg-pink-500/10 text-pink-500 border-pink-500/20 hover:bg-pink-500/20",
        "bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20",
        "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 hover:bg-indigo-500/20",
        "bg-teal-500/10 text-teal-500 border-teal-500/20 hover:bg-teal-500/20",
        "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20",
        "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20",
      ]
      const hash = category.split("").reduce((a, b) => a + b.charCodeAt(0), 0)
      return colors[hash % colors.length]
    }
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <BlogHeader />
        <main className="container mx-auto px-6 py-24 max-w-3xl">
          <h1 className="text-2xl font-bold">Post not found</h1>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      <main className="container mx-auto px-6 py-12 max-w-3xl pt-24">
        <article>
          <header className="mb-8">
            {(post.categories?.length || post.category) && (
              <div className="mb-3 flex flex-wrap gap-2">
                {(() => {
                  const cats = (post.categories && post.categories.length > 0) ? post.categories : (post.category ? [post.category] : [])
                  const shown = cats.slice(0, 2)
                  const extra = Math.max(0, cats.length - shown.length)
                  return (
                    <>
                      {shown.map((c) => (
                        <span key={c} className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300 ${getCategoryColor(c)}`}>
                          {c}
                        </span>
                      ))}
                      {extra > 0 && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-muted text-muted-foreground">
                          +{extra} more
                        </span>
                      )}
                    </>
                  )
                })()}
              </div>
            )}
            <h1 className="text-4xl font-bold mb-4 text-balance">{post.title}</h1>
            <p className="text-muted-foreground mb-4">{post.excerpt}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> <ClientDate dateString={post.date} /></span>
              <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" /> {post.readTime}</span>
              {post.updated && (
                <span className="inline-flex items-center gap-1">Updated: <ClientDate dateString={post.updated} /></span>
              )}
            </div>
            {(post.languages?.length || post.language || (post.authors && post.authors.length > 0)) && (
              <>
                {(post.languages?.length || post.language) && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {(() => {
                        const langs = post.languages && post.languages.length > 0 ? post.languages : (post.language ? [post.language] : [])
                        const shown = langs.slice(0, 2)
                        const extra = Math.max(0, langs.length - shown.length)
                        const label = `Language${langs.length > 1 ? 's' : ''}: `
                        return label + shown.join(', ') + (extra > 0 ? `, ... +${extra} more` : '')
                      })()}
                    </span>
                  </div>
                )}
                {post.authors && post.authors.length > 0 && (
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {(() => {
                        const authors = post.authors
                        const shown = authors.slice(0, 2).map(a => a.startsWith('@') ? a : `@${a}`)
                        const extra = Math.max(0, authors.length - 2)
                        const label = `Author${authors.length > 1 ? 's' : ''}: `
                        return label + shown.join(', ') + (extra > 0 ? `, ... +${extra} more` : '')
                      })()}
                    </span>
                  </div>
                )}
              </>
            )}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className={`px-2 py-1 rounded text-xs border transition-all duration-300 ${getTagColor(t)}`}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
            
            {/* Share Button */}
            <div className="mt-4">
              <ShareButton title={post.title} />
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <MarkdownRenderer content={post.content} baseImagePath={`/blogs/${slug}`} />
          </div>
        </article>
      </main>
      <ScrollToTop />
    </div>
  )
}
