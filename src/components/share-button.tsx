"use client"

import { useState } from "react"
import { Share, Check } from "@/components/icons"

interface ShareButtonProps {
  title: string
  url?: string
  className?: string
}

export function ShareButton({ title, url, className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareUrl = url || window.location.href
    const shareData = {
      title: title,
      url: shareUrl,
    }

    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    // Try using Web Share API first (mobile devices)
    if (navigator.share && isMobile) {
      try {
        await navigator.share(shareData)
        return // Don't show "Copied!" on mobile when share menu is used
      } catch (error) {
        // Fall back to clipboard if share fails
        console.log("Share failed, falling back to clipboard")
      }
    }

    // Fall back to copying to clipboard (desktop or mobile fallback)
    try {
      await navigator.clipboard.writeText(shareUrl)
      // Only show "Copied!" feedback on desktop or when mobile share fails
      if (!isMobile || !navigator.share) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      // Final fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = shareUrl
      textArea.style.position = "fixed"
      textArea.style.left = "-999999px"
      textArea.style.top = "-999999px"
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      
      try {
        document.execCommand("copy")
        // Only show "Copied!" feedback on desktop or when mobile share fails
        if (!isMobile || !navigator.share) {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
      } catch (err) {
        console.error("Failed to copy to clipboard:", err)
      }
      
      document.body.removeChild(textArea)
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-border/20 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-accent/10 transition-all duration-300 hover:scale-105 ${className}`}
      title={copied ? "Link copied!" : "Share this post"}
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-green-500" />
          <span className="text-green-500">Copied!</span>
        </>
      ) : (
        <>
          <Share className="h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </>
      )}
    </button>
  )
}
