"use client"
import React, { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import Image from "next/image"
// No syntax highlighting; render plain code blocks for reliability.

type Props = {
  content: string
  baseImagePath?: string // e.g. `/blogs/my-post`
  showImageCaptions?: boolean
}

export const MarkdownRenderer: React.FC<Props> = ({ content, baseImagePath, showImageCaptions = false }) => {
  // Helper: convert React children to plain text
  const nodeToText = (node: React.ReactNode): string => {
    if (typeof node === 'string' || typeof node === 'number') return String(node)
    if (Array.isArray(node)) return node.map(nodeToText).join('')
    if (React.isValidElement(node)) {
      const el = node as React.ReactElement<{ children?: React.ReactNode }>
      return nodeToText(el.props?.children)
    }
    return ''
  }

  // Pre block with Copy button; separate component to satisfy hooks rule
  const PreBlock: React.FC<React.HTMLAttributes<HTMLPreElement>> = (props) => {
    const { children, className, ...rest } = props
    const arr = React.Children.toArray(children)
    const codeEl = arr.find((child): child is React.ReactElement<{ className?: string; children?: React.ReactNode }> => {
      if (!React.isValidElement(child)) return false
      const t = child.type
      return typeof t === 'string' && t.toLowerCase() === 'code'
    })

    const rawText = nodeToText(codeEl?.props?.children)
    const codeText = rawText.replace(/\n$/, '')

    const [copied, setCopied] = useState(false)
    const onCopy = async () => {
      try {
        await navigator.clipboard.writeText(codeText)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      } catch {}
    }

    return (
      <div className="relative my-6">
        <button
          type="button"
          onClick={onCopy}
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-border bg-card/80 hover:bg-card hover:border-border/80 transition-all duration-200 cursor-pointer hover:shadow-sm text-foreground"
          title="Copy code"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
        <pre {...rest} className={"rounded-xl p-6 pt-12 border border-border shadow-lg overflow-x-auto bg-transparent" + (className ? ` ${className}` : '')}>
          {codeEl ? (
            <code className={`text-sm font-mono whitespace-pre ${codeEl.props.className || ''}`}>{codeText}</code>
          ) : (
            children
          )}
        </pre>
      </div>
    )
  }

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: "ignore", throwOnError: false }], rehypeRaw]}
        components={{
          img: (props) => {
            const { src, alt, style, width, height } = props as unknown as { 
              src?: string; 
              alt?: string; 
              style?: React.CSSProperties | string;
              width?: string | number;
              height?: string | number;
            }
            if (!src) return null
            let resolved: string
            if (baseImagePath) {
              if (src.startsWith("/blogs/")) {
                // If a baseImagePath is provided, rewrite blog-rooted paths against it
                const rest = src.replace(/^\/blogs\/[^/]+\/?/, "")
                resolved = `${baseImagePath}/${rest}`
              } else if (src.startsWith("/")) {
                resolved = src
              } else {
                resolved = `${baseImagePath}/${src.replace(/^\.\//, "")}`
              }
            } else {
              // Without a baseImagePath, treat relative paths as public-rooted
              if (src.startsWith("/")) {
                resolved = src
              } else {
                resolved = "/" + src.replace(/^\.\//, "")
              }
            }

            // Parse style object or string for Next/Image compatibility
            let imageStyle: React.CSSProperties = {}
            let imageWidth = 1200
            let imageHeight = 630
            
            if (style) {
              if (typeof style === 'string') {
                // Parse inline style string
                const styleObj: Record<string, string> = {}
                style.split(';').forEach(rule => {
                  const [prop, value] = rule.split(':').map(s => s.trim())
                  if (prop && value) {
                    const camelProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
                    styleObj[camelProp] = value
                  }
                })
                imageStyle = styleObj as React.CSSProperties
              } else {
                imageStyle = style
              }
            }

            // Handle explicit width/height props
            if (width) imageWidth = typeof width === 'string' ? parseInt(width) || 1200 : width
            if (height) imageHeight = typeof height === 'string' ? parseInt(height) || 630 : height

            return (
              <span className="block my-6">
                <Image 
                  src={resolved} 
                  alt={alt || ""} 
                  width={imageWidth} 
                  height={imageHeight} 
                  className="rounded-lg" 
                  style={imageStyle}
                />
                {showImageCaptions && alt && (
                  <span className="block text-center text-sm text-muted-foreground mt-2">{alt}</span>
                )}
              </span>
            )
          },
          a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
            <a
              href={href}
              className="text-primary hover:text-primary/80 underline underline-offset-4"
              target={href && href.startsWith("http") ? "_blank" : undefined}
              rel={href && href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          code: ({ inline, className, children }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
            if (inline) {
              return <code className="px-1 text-sm font-mono text-primary">{String(children)}</code>;
            }
            // For block code, let the `pre` renderer handle the wrapper & copy button.
            return <code className={className}>{children}</code>;
          },
          pre: PreBlock,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
