interface BlogPost {
  id?: string
  title: string
  excerpt: string
  category?: string
  categories?: string[]
  tags: string[]
  date: string
  readTime: string
  slug: string
}

interface AboutSectionProps {
  blogPosts: BlogPost[]
}

export function AboutSection({ blogPosts }: AboutSectionProps) {
  // Calculate actual stats from blog posts
  const blogPostsCount = blogPosts.length
  const uniqueCategories = [
    ...new Set(
      blogPosts.flatMap(post => (post.categories && post.categories.length > 0) ? post.categories : (post.category ? [post.category] : [])).filter(Boolean)
    )
  ]
  const topicsCount = uniqueCategories.length

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground leading-relaxed text-lg">
        I’m Son, a.k.a Harshfeudal, a student at Vietnamese-German University, currently spending a 6-month exchange at Frankfurt University of Applied Sciences. My main interest is cybersecurity, with some curiosity in machine learning and AI. This space is where I share my journey, studies, and personal learnings.
      </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="text-center p-6 rounded-lg border border-border/30 hover:border-green-500/50 transition-all duration-300">
      <div className="text-3xl font-bold text-green-500 mb-2">{blogPostsCount}</div>
      <div className="text-sm text-muted-foreground">{blogPostsCount === 1 ? "Blog Post Written" : "Blog Posts Written"}</div>
        </div>
        <div className="text-center p-6 rounded-lg border border-border/30 hover:border-blue-500/50 transition-all duration-300">
      <div className="text-3xl font-bold text-blue-500 mb-2">{topicsCount}</div>
      <div className="text-sm text-muted-foreground">{topicsCount === 1 ? "Topic Covered" : "Topics Covered"}</div>
        </div>
      </div>
    </div>
  )
}
