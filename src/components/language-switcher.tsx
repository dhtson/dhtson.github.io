"use client"

import Link from "next/link"
import { ChevronDown, Globe } from "@/components/icons"
import { useState } from "react"

interface LanguageSwitcherProps {
  availableLanguages: Array<{ code: string; name: string; slug: string }>
  currentSlug: string
}

export function LanguageSwitcher({ availableLanguages, currentSlug }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Find current language
  const currentLanguage = availableLanguages.find(lang => lang.slug === currentSlug)
  
  if (!currentLanguage || availableLanguages.length <= 1) {
    return null
  }

  return (
    <div className="relative inline-block text-left">
      <div>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
          onClick={() => setIsOpen(!isOpen)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        >
          <Globe className="h-4 w-4" />
          <span>{currentLanguage.name}</span>
          <ChevronDown 
            className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-xl bg-background border border-border shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
          <div className="py-1">
            {availableLanguages.map((language) => (
              <Link
                key={language.slug}
                href={`/blogs/${language.slug}`}
                className={`block px-4 py-3 text-sm transition-all duration-300 hover:scale-[1.02] ${
                  language.slug === currentSlug 
                    ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold' 
                    : 'text-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/10 hover:text-primary'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span className="flex items-center gap-2">
                  <span>{language.name}</span>
                  {language.slug === currentSlug && (
                    <span className="text-xs text-white/90">• Current</span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
