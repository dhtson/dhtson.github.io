"use client"
import { BlogHeader } from "@/components/blog-header"
import { BlogGrid } from "@/components/blog-grid"
import { AboutSection } from "@/components/about-section"
import { ScrollToTop } from "@/components/scroll-to-top"
import { Mail, Github, Linkedin } from "@/components/icons"
import { useEffect, useState, useMemo } from "react"
import Link from "next/link"

export interface BlogPostClientMeta {
  id?: string
  title: string
  excerpt: string
  category?: string
  tags: string[]
  date: string
  readTime: string
  slug: string
}

export default function HomeClient({ blogPosts }: { blogPosts: BlogPostClientMeta[] }) {
  const recentPosts = blogPosts.slice(0, 3)
  const [visitorCount, setVisitorCount] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isMounted, setIsMounted] = useState(false)
  // Randomized greeting (client-side) with SSR-safe default
  const greetings = useMemo(() => ["Hi there", "Xin chào", "こんにちは", "Hallo"], [])
  const [greeting, setGreeting] = useState<string>(greetings[0])

  const socialLinks = {
    email: "harshfeudal@gmail.com",
    github: "https://github.com/harshfeudal",
    linkedin: "https://www.linkedin.com/in/dhtson/",
  }

  const getGithubUsername = (url: string) => {
    const match = url.match(/github\.com\/([^\/]+)/)
    return match ? match[1] : "GitHub"
  }

  const getLinkedinUsername = (url: string) => {
    const match = url.match(/linkedin\.com\/in\/([^\/]+)/)
    return match ? match[1] : "LinkedIn"
  }

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZoneName: "short",
    }
    return date.toLocaleString("en-US", options)
  }

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Pick a random greeting on mount; keeps SSR content stable initially
  useEffect(() => {
    const idx = Math.floor(Math.random() * greetings.length)
    setGreeting(greetings[idx])
  }, [greetings])

  const generateFingerprint = () => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    ctx!.textBaseline = "top"
    ctx!.font = "14px Arial"
    ctx!.fillText("Browser fingerprint", 2, 2)

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
    ].join("|")

    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash
    }
    return Math.abs(hash).toString()
  }

  useEffect(() => {
    const today = new Date().toDateString()
    const fingerprintKey = `fingerprint_${today}`
    const totalVisitorsKey = "totalVisitors"
    const lastVisitKey = "lastVisitDate"

    const fingerprint = generateFingerprint()
    const storedFingerprint = localStorage.getItem(fingerprintKey)
    const lastVisitDate = localStorage.getItem(lastVisitKey)

    // Check if this is a new unique visit (new day OR new fingerprint)
    const isNewVisit = !storedFingerprint || 
                      storedFingerprint !== fingerprint || 
                      lastVisitDate !== today

    if (isNewVisit) {
      // Only increment if this is genuinely a new visit
      const currentTotal = Number.parseInt(localStorage.getItem(totalVisitorsKey) || "0")
      const newTotal = currentTotal + 1
      
      localStorage.setItem(totalVisitorsKey, newTotal.toString())
      localStorage.setItem(fingerprintKey, fingerprint)
      localStorage.setItem(lastVisitKey, today)
      setVisitorCount(newTotal)
    } else {
      // Returning visitor (same day, same fingerprint)
      const currentTotal = Number.parseInt(localStorage.getItem(totalVisitorsKey) || "1")
      setVisitorCount(Math.max(currentTotal, 1))
    }

    const cleanupOldData = () => {
      const keys = Object.keys(localStorage)
      const today = new Date()
      keys.forEach((key) => {
        if (key.startsWith("fingerprint_")) {
          const dateStr = key.split("_").slice(1).join("_")
          if (dateStr) {
            const keyDate = new Date(dateStr)
            const daysDiff = (today.getTime() - keyDate.getTime()) / (1000 * 60 * 60 * 24)
            // Keep fingerprints for 30 days to prevent re-counting recent visits
            if (daysDiff > 30) {
              localStorage.removeItem(key)
            }
          }
        }
      })
    }
    cleanupOldData()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // const scrollToAbout = () => {
  //   const element = document.getElementById("about-me")
  //   if (element) {
  //     const yOffset = -100
  //     const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
  //     window.scrollTo({ top: y, behavior: "smooth" })
  //   }
  // }

  return (
    <div className="bg-background relative overflow-hidden">
      <BlogHeader />
  <main className="container mx-auto px-6 py-12 max-w-7xl relative pt-24">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-6 text-balance animate-slideInUp">
            {greeting} <span className="text-yellow-400">👋</span>
          </h1>
          <div className="flex flex-col items-center gap-4 mb-6 animate-slideInUp px-4" style={{ animationDelay: "0.2s" }}>
            <a
              href={`mailto:${socialLinks.email}`}
              className="flex items-center space-x-1 sm:space-x-2 text-muted-foreground hover:text-green-500 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>{socialLinks.email}</span>
            </a>
            <div className="flex gap-6">
              <a
                href={socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 sm:space-x-2 text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 text-sm sm:text-base"
              >
                <Github className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>@{getGithubUsername(socialLinks.github)}</span>
              </a>
              <a
                href={socialLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 sm:space-x-2 text-muted-foreground hover:text-blue-500 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
              >
                <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>@{getLinkedinUsername(socialLinks.linkedin)}</span>
              </a>
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center gap-2 text-sm text-muted-foreground animate-slideInUp" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center justify-center gap-1">
              👥 {visitorCount.toLocaleString()} {visitorCount === 1 ? "visitor" : "visitors"}
            </div>
            <div className="flex items-center justify-center gap-1">🕐 {isMounted ? formatDate(currentTime) : "Loading..."}</div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-20">
          <section id="about-me" className="text-center mb-16 animate-slideInUp" style={{ animationDelay: "0.6s" }}>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-4">About Me</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mb-8"></div>
            <div className="max-w-2xl mx-auto">
              <AboutSection blogPosts={blogPosts} />
            </div>
          </section>

          <section className="text-center mb-16 animate-slideInUp" style={{ animationDelay: "0.8s" }}>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-4">Recent Blogs</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mb-8"></div>
            <BlogGrid posts={recentPosts} />
            <div className="mt-8 animate-slideInUp" style={{ animationDelay: "1.0s" }}>
              <Link
                href="/blogs"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl group"
              >
                View All Posts
                <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </section>
        </div>
      </main>
      <ScrollToTop />
    </div>
  )
}
