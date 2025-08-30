"use client"

import { useEffect, useState } from "react"

export function useScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const updateScrollProgress = () => {
      const currentProgress = window.scrollY
      const scrollHeight = document.body.scrollHeight - window.innerHeight
      if (scrollHeight > 0) {
        setScrollProgress((currentProgress / scrollHeight) * 100)
      }
    }

    window.addEventListener("scroll", updateScrollProgress)
    return () => window.removeEventListener("scroll", updateScrollProgress)
  }, [])

  return scrollProgress
}

export function ScrollProgressBar() {
  const progress = useScrollProgress()

  return (
    <div className="fixed top-0 left-0 right-0 z-[110] h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-150 ease-out shadow-sm"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
