"use client"
import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type ResumeRendererProps = {
  content: string
}

export const ResumeRenderer: React.FC<ResumeRendererProps> = ({ content }) => {
  return (
    <div className="prose prose-lg max-w-none text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold mb-6 text-primary border-b border-border/20 pb-4">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-bold mb-6 text-primary mt-12 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-foreground mb-2 mt-6">
              {children}
            </h3>
          ),
          p: ({ children }) => {
            // Check if this paragraph contains a date pattern (looks like a subtitle)
            const text = React.Children.toArray(children).join('')
            const isDateLine = /^\*\*\d{4}/.test(text) || /^\d{4}/.test(text)
            
            if (isDateLine) {
              return (
                <p className="text-accent font-medium mb-3 text-lg">
                  {children}
                </p>
              )
            }
            
            return (
              <p className="text-muted-foreground leading-relaxed mb-4">
                {children}
              </p>
            )
          },
          ul: ({ children }) => (
            <ul className="space-y-2 text-muted-foreground mb-6 ml-4">
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className="flex items-start">
              <span className="text-primary mr-2 mt-1">•</span>
              <span>{children}</span>
            </li>
          ),
          strong: ({ children }) => (
            <strong className="text-foreground font-semibold">
              {children}
            </strong>
          ),
          // Custom wrapper for each section
          div: ({ children }) => (
            <div className="border-l-4 border-primary/30 pl-6 mb-8">
              {children}
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
