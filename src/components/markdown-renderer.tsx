"use client"
import React, { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import Image from "next/image"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"

// Custom colorful theme without grey backgrounds
const customTheme = {
  'code[class*="language-"]': {
    color: '#f8f8f2',
    background: 'transparent',
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    tabSize: '4',
    hyphens: 'none',
  },
  'pre[class*="language-"]': {
    color: '#f8f8f2',
    background: 'transparent',
    fontFamily: 'Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    tabSize: '4',
    hyphens: 'none',
    padding: '1rem',
    margin: '0',
    overflow: 'auto',
  },
  'comment': { color: '#6272a4' },
  'prolog': { color: '#6272a4' },
  'doctype': { color: '#6272a4' },
  'cdata': { color: '#6272a4' },
  'punctuation': { color: '#f8f8f2' },
  'property': { color: '#ff79c6' },
  'tag': { color: '#ff79c6' },
  'constant': { color: '#bd93f9' },
  'symbol': { color: '#bd93f9' },
  'deleted': { color: '#ff5555' },
  'boolean': { color: '#bd93f9' },
  'number': { color: '#bd93f9' },
  'selector': { color: '#50fa7b' },
  'attr-name': { color: '#50fa7b' },
  'string': { color: '#f1fa8c' },
  'char': { color: '#f1fa8c' },
  'builtin': { color: '#8be9fd' },
  'inserted': { color: '#50fa7b' },
  'operator': { color: '#ff79c6' },
  'entity': { color: '#f1fa8c' },
  'url': { color: '#f1fa8c' },
  'variable': { color: '#f8f8f2' },
  'atrule': { color: '#ff79c6' },
  'attr-value': { color: '#f1fa8c' },
  'function': { color: '#50fa7b' },
  'class-name': { color: '#8be9fd' },
  'keyword': { color: '#ff79c6' },
  'regex': { color: '#f1fa8c' },
  'important': { color: '#ff79c6', fontWeight: 'bold' },
  'bold': { fontWeight: 'bold' },
  'italic': { fontStyle: 'italic' },
}

type Props = {
  content: string
  baseImagePath?: string // e.g. `/blogs/my-post`
  showImageCaptions?: boolean
}

export const MarkdownRenderer: React.FC<Props> = ({ content, baseImagePath, showImageCaptions = false }) => {
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
          code: ({ className, children }: { className?: string; children?: React.ReactNode }) => {
            const isInline = !className || !className.includes("language-")
            const codeText = Array.isArray(children) ? children.join("") : String(children ?? "")
            if (isInline) {
              return <code className="px-1 text-sm font-mono text-primary">{codeText}</code>
            }
            const lang = className?.replace("language-", "").trim() || undefined
            
            const CodeBlock = () => {
              const [copied, setCopied] = useState(false)
              const onCopy = async () => {
                try {
                  await navigator.clipboard.writeText(codeText.replace(/\n$/, ""))
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1500)
                } catch {}
              }
              
              return (
                <div className="code-container relative">
                  <button
                    type="button"
                    onClick={onCopy}
                    className="absolute right-0 top-0 z-10 inline-flex items-center gap-1 px-2 py-1 text-xs rounded-bl-md border-l border-b border-border bg-card/80 hover:bg-card hover:border-border/80 transition-all duration-200 cursor-pointer hover:shadow-sm"
                    title="Copy code"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <SyntaxHighlighter
                    language={lang}
                    style={customTheme}
                    PreTag="div"
                    CodeTag="code"
                    className=""
                    customStyle={{ 
                      margin: "0", 
                      background: "transparent", 
                      padding: "0",
                      fontSize: "0.875rem",
                      lineHeight: "1.5",
                      border: "none",
                      borderRadius: "0",
                      boxShadow: "none",
                      outline: "none",
                      width: "100%",
                      overflowX: "auto"
                    }}
                    wrapLongLines
                  >
                    {codeText}
                  </SyntaxHighlighter>
                </div>
              )
            }
            
            return <CodeBlock />
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
