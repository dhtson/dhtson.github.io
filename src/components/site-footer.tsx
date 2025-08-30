"use client"

import { useEffect, useState } from "react"

export function SiteFooter() {
  // Initialize with the server-rendered year to avoid hydration mismatch,
  // then update to the client's local year after mount.
  const [year, setYear] = useState(() => new Date().getFullYear())
  useEffect(() => {
    const localYear = new Date().getFullYear()
    if (localYear !== year) setYear(localYear)
  }, [year])

  return (
    <footer className="border-t border-border/80 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-6 py-6 text-sm text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>
          © {year} Harshfeudal. All rights reserved.
        </span>
        <span className="opacity-80">
          Built with Next.js • Content © respective authors
        </span>
      </div>
    </footer>
  )
}
