"use client"
import { useEffect, useMemo, useState } from "react"
import { BlogGrid, type BlogPostCardData } from "@/components/blog-grid"

export default function BlogsListClient({ posts }: { posts: BlogPostCardData[] }) {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([])
  const [showAllTags, setShowAllTags] = useState(false)
  const [showAllLanguages, setShowAllLanguages] = useState(false)
  const [showAllAuthors, setShowAllAuthors] = useState(false)

  const MAX_TAGS = 12
  const MAX_LANGS = 12
  const MAX_AUTHORS = 12

  const categories = useMemo(() => {
    // Count frequencies across single or multiple categories
    const counts = posts.reduce<Record<string, number>>((acc, p) => {
      const cats = (p.categories && p.categories.length > 0) ? p.categories : (p.category ? [p.category] : [])
      cats.forEach((c) => {
        if (!c) return
        acc[c] = (acc[c] || 0) + 1
      })
      return acc
    }, {})
    // Sort by count desc, then name asc, and take top 5
    const top = Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 5)
      .map(([name]) => name)
    return ["All", ...top]
  }, [posts])

  // Unique tags, languages, authors for filters
  const tags = useMemo(() => {
    const all = new Set<string>()
    posts.forEach(p => (p.tags || []).forEach(t => all.add(t)))
    return Array.from(all).sort((a,b) => a.localeCompare(b))
  }, [posts])
  const languages = useMemo(() => {
    const all = new Set<string>()
    posts.forEach(p => (p.languages || []).forEach(l => all.add(l)))
    return Array.from(all).sort((a,b) => a.localeCompare(b))
  }, [posts])
  const authors = useMemo(() => {
    const all = new Set<string>()
    posts.forEach(p => (p.authors || []).forEach(a => all.add(a.startsWith('@') ? a : `@${a}`)))
    return Array.from(all).sort((a,b) => a.localeCompare(b))
  }, [posts])

  const displayTags = showAllTags ? tags : tags.slice(0, MAX_TAGS)
  const displayLanguages = showAllLanguages ? languages : languages.slice(0, MAX_LANGS)
  const displayAuthors = showAllAuthors ? authors : authors.slice(0, MAX_AUTHORS)

  // Ensure selected category is valid when categories list changes
  useEffect(() => {
    if (!categories.includes(selectedCategory)) {
      setSelectedCategory("All")
    }
  }, [categories, selectedCategory])

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      const cats = (post.categories && post.categories.length > 0) ? post.categories : (post.category ? [post.category] : [])
      const matchesCategory = selectedCategory === "All" || cats.includes(selectedCategory)

      // Advanced filters
      const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => (post.tags || []).includes(tag))
      const matchesLanguages = selectedLanguages.length === 0 || selectedLanguages.every(l => (post.languages || []).includes(l))
      const normAuthors = (post.authors || []).map(a => a.startsWith('@') ? a : `@${a}`)
      const matchesAuthors = selectedAuthors.length === 0 || selectedAuthors.every(a => normAuthors.includes(a))

      // Text search across title, excerpt, tags, categories, languages, authors
      const q = searchQuery.trim().toLowerCase()
      const haystacks = [
        post.title,
        post.excerpt,
        ...(post.tags || []),
        ...cats,
        ...(post.languages || []),
        ...normAuthors,
      ].map(s => (s || "").toLowerCase())
      const matchesSearch = q === "" || haystacks.some(h => h.includes(q))

      return matchesCategory && matchesTags && matchesLanguages && matchesAuthors && matchesSearch
    })
  }, [posts, selectedCategory, selectedTags, selectedLanguages, selectedAuthors, searchQuery])

  return (
    <>
      <div className="mb-12 space-y-6 animate-slideInUp" style={{ animationDelay: "0.2s" }}>
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-primary/30 bg-background/50 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-0 focus:border-primary/60 transition-all duration-300"
          />
        </div>

        {categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "bg-card border border-border/30 text-muted-foreground hover:text-foreground hover:border-primary/50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {/* Advanced filters: tags, languages, authors */}
        {(tags.length > 0 || languages.length > 0 || authors.length > 0) && (
          <div className="space-y-4">
            {/* Tags and Authors centered */}
            {(tags.length > 0 || authors.length > 0) && (
              <div className="flex justify-center">
                <div className="grid gap-4 md:grid-cols-2 max-w-4xl w-full">
                  {tags.length > 0 && (
                    <div className="bg-card/50 border border-border/80 rounded-lg p-3">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Tags</div>
                      <div className="flex flex-wrap gap-2">
                        {displayTags.map(t => {
                          const active = selectedTags.includes(t)
                          return (
                            <button
                              key={t}
                              onClick={() => setSelectedTags(prev => active ? prev.filter(x => x !== t) : [...prev, t])}
                              className={`px-2 py-1 rounded text-xs border transition-all duration-300 ${active ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground hover:bg-muted/80 border-border/30"}`}
                            >
                              #{t}
                            </button>
                          )
                        })}
                      </div>
                      {tags.length > MAX_TAGS && (
                        <button
                          className="mt-3 text-xs text-muted-foreground hover:text-foreground underline"
                          onClick={() => setShowAllTags(v => !v)}
                        >
                          {showAllTags ? "Show less" : `Show more (+${tags.length - MAX_TAGS})`}
                        </button>
                      )}
                    </div>
                  )}
                  {authors.length > 0 && (
                    <div className="bg-card/50 border border-border/80 rounded-lg p-3">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Authors</div>
                      <div className="flex flex-wrap gap-2">
                        {displayAuthors.map(a => {
                          const active = selectedAuthors.includes(a)
                          return (
                            <button
                              key={a}
                              onClick={() => setSelectedAuthors(prev => active ? prev.filter(x => x !== a) : [...prev, a])}
                              className={`px-2 py-1 rounded text-xs border transition-all duration-300 ${active ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground hover:bg-muted/80 border-border/30"}`}
                            >
                              {a}
                            </button>
                          )
                        })}
                      </div>
                      {authors.length > MAX_AUTHORS && (
                        <button
                          className="mt-3 text-xs text-muted-foreground hover:text-foreground underline"
                          onClick={() => setShowAllAuthors(v => !v)}
                        >
                          {showAllAuthors ? "Show less" : `Show more (+${authors.length - MAX_AUTHORS})`}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Languages section below, also centered */}
            {languages.length > 0 && (
              <div className="flex justify-center">
                <div className="max-w-2xl w-full">
                  <div className="bg-card/50 border border-border/80 rounded-lg p-3">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Languages</div>
                    <div className="flex flex-wrap gap-2">
                      {displayLanguages.map(l => {
                        const active = selectedLanguages.includes(l)
                        return (
                          <button
                            key={l}
                            onClick={() => setSelectedLanguages(prev => active ? prev.filter(x => x !== l) : [...prev, l])}
                            className={`px-2 py-1 rounded text-xs border transition-all duration-300 ${active ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground hover:bg-muted/80 border-border/30"}`}
                          >
                            {l}
                          </button>
                        )
                      })}
                    </div>
                    {languages.length > MAX_LANGS && (
                      <button
                        className="mt-3 text-xs text-muted-foreground hover:text-foreground underline"
                        onClick={() => setShowAllLanguages(v => !v)}
                      >
                        {showAllLanguages ? "Show less" : `Show more (+${languages.length - MAX_LANGS})`}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center mb-8 animate-slideInUp" style={{ animationDelay: "0.4s" }}>
        <p className="text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "post" : "posts"} found
        </p>
      </div>

      <div className="animate-slideInUp" style={{ animationDelay: "0.6s" }}>
        <BlogGrid posts={filtered} />
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 animate-slideInUp" style={{ animationDelay: "0.8s" }}>
          <h3 className="text-2xl font-bold text-muted-foreground mb-4">No posts found</h3>
      <p className="text-muted-foreground mb-6">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => {
              setSearchQuery("")
              setSelectedCategory("All")
        setSelectedTags([])
        setSelectedLanguages([])
        setSelectedAuthors([])
            }}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-300"
          >
            Reset Filters
          </button>
        </div>
      )}
    </>
  )
}
