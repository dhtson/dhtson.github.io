"use client"

import { Calendar, Clock } from "@/components/icons"
import { ClientDate } from "@/components/client-date"

export interface BlogPostCardData {
  id?: string
  title: string
  excerpt: string
  category?: string
  categories?: string[]
  languages?: string[]
  authors?: string[]
  tags: string[]
  date: string
  readTime: string
  slug: string
}

interface BlogGridProps {
  posts: BlogPostCardData[]
  // showRecent?: boolean // unused prop
}

export function BlogGrid({ posts }: BlogGridProps) {
  // const showRecent = posts.length <= 3 // unused variable commented out
  const few = posts.length <= 2
  const count = posts.length
  let gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
  if (count === 1) {
    gridCols = "grid-cols-1"
  } else if (count === 2) {
    gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
  }
  const cardWidthClass = count === 1 ? "max-w-xl" : count === 2 ? "max-w-lg" : ""
  const getCategoryColor = (category: string) => {
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
      default:
        // Fallback: deterministically pick a nice color based on the category name
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

  const getTagColor = (tag: string) => {
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

  return (
    <div
      className={`grid gap-6 ${gridCols} ${few ? "justify-items-center" : ""}`}
    >
    {posts.map((post, index) => (
        <a
      href={`/blogs/${post.slug}`}
      key={post.slug || post.id || String(index)}
          className={`bg-card border border-border rounded-lg hover:shadow-xl transition-all duration-500 group premium-hover relative overflow-hidden animate-slideInUp block w-full ${few ? cardWidthClass : ""} h-full flex flex-col`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
          
          <div className="p-6 pb-3 relative z-10">
            <div className="flex items-center justify-between mb-2 min-h-6">
              <div className="flex flex-wrap gap-2">
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
            </div>
            <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 mb-3">
              {post.title}
            </h3>
          </div>
          <div className="px-6 pb-6 relative z-10 flex-1 flex flex-col">
            <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3 group-hover:text-muted-foreground/90 transition-colors duration-300">
              {post.excerpt}
            </p>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.slice(0, 3).map((tag) => (
                  <span 
                    key={tag} 
                    className={`px-2 py-1 rounded text-xs border transition-all duration-300 ${getTagColor(tag)}`}
                  >
                    #{tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="px-2 py-1 rounded text-xs border bg-muted text-muted-foreground hover:bg-muted/80 transition-all duration-300">
                    +{post.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
              <div className="flex items-center space-x-1 group-hover:text-muted-foreground/80 transition-colors duration-300">
                <Calendar className="h-3 w-3" />
                <ClientDate dateString={post.date} />
              </div>
              <div className="flex items-center space-x-1 group-hover:text-primary transition-colors duration-300">
                <Clock className="h-3 w-3" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
  </a>
      ))}
    </div>
  )
}
