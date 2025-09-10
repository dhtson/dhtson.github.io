"use client"

import { useState, useEffect } from "react"
import { BlogHeader } from "@/components/blog-header"
import { ScrollToTop } from "@/components/scroll-to-top"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { Calendar, Clock, Globe, ChevronDown } from "@/components/icons"
import { ClientDate } from "@/components/client-date"
import { ShareButton } from "@/components/share-button"
import type { Post } from "@/lib/blog"

interface BlogPostClientProps {
  initialPost: Post
  allLanguageVersions: Record<string, Post>
  slug: string
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

function LanguageSwitcher({ 
  availableLanguages, 
  currentLanguage, 
  onLanguageChange,
  isLoading 
}: {
  availableLanguages: Array<{ code: string; name: string; slug: string }>
  currentLanguage: string
  onLanguageChange: (languageCode: string) => void
  isLoading: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.language-switcher')) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])
  
  // Find current language
  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage)
  
  if (!currentLang || availableLanguages.length <= 1) {
    return null
  }

  return (
    <div className="relative inline-block text-left language-switcher">
      <div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm disabled:opacity-50"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
        >
          <Globe className="h-4 w-4" />
          <span>{currentLang.name}</span>
          <ChevronDown 
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-36 origin-top-right rounded-xl bg-background border-2 border-border shadow-lg ring-1 ring-black ring-opacity-10 focus:outline-none overflow-hidden">
          <div className="py-1">
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => {
                  onLanguageChange(language.code)
                  setIsOpen(false)
                }}
                className={`block w-full text-left px-3 py-2 text-sm transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 ${
                  language.code === currentLanguage 
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold' 
                    : 'text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-primary'
                }`}
                disabled={isLoading}
              >
                <span>{language.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function BlogPostClient({ initialPost, allLanguageVersions, slug }: BlogPostClientProps) {
  const [post, setPost] = useState<Post>(initialPost)
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    // Determine current language from the initial post
    if (initialPost.availableLanguages) {
      const detected = initialPost.availableLanguages.find(lang => 
        lang.name === initialPost.detectedLanguage
      )
      return detected?.code || initialPost.availableLanguages[0].code
    }
    return 'en'
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === currentLanguage || isLoading) return
    
    setIsLoading(true)
    try {
      // Get the post content in the new language from pre-loaded versions
      const newPost = allLanguageVersions[languageCode]
      if (newPost) {
        setPost(newPost)
        setCurrentLanguage(languageCode)
      }
    } catch (error) {
      console.error('Failed to switch language:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <BlogHeader />
      <main className="container mx-auto px-6 py-12 max-w-3xl pt-24">
        <article>
          <header className="mb-8">
            {/* Language Switcher */}
            {post.availableLanguages && (
              <div className="mb-4 flex justify-end">
                <LanguageSwitcher 
                  availableLanguages={post.availableLanguages} 
                  currentLanguage={currentLanguage}
                  onLanguageChange={handleLanguageChange}
                  isLoading={isLoading}
                />
              </div>
            )}

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
            {(post.languages?.length || post.language || post.detectedLanguage || (post.authors && post.authors.length > 0)) && (
              <>
                {(post.languages?.length || post.language || post.detectedLanguage) && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      {(() => {
                        // Prioritize detected language from folder name
                        if (post.detectedLanguage) {
                          return `Language: ${post.detectedLanguage}`
                        }
                        // Fall back to frontmatter languages
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
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Loading content...</span>
              </div>
            ) : (
              <MarkdownRenderer content={post.content} baseImagePath={`/blogs/${slug}`} />
            )}
          </div>
        </article>
      </main>
      <ScrollToTop />
    </div>
  )
}
