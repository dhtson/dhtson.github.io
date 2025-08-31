"use client"
import React, { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import Image from "next/image"
// Use the light Prism build and register only the languages we need
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"
// Prism languages
import python from "react-syntax-highlighter/dist/esm/languages/prism/python"
import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript"
import typescript from "react-syntax-highlighter/dist/esm/languages/prism/typescript"
import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx"
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx"
import bash from "react-syntax-highlighter/dist/esm/languages/prism/bash"
import powershell from "react-syntax-highlighter/dist/esm/languages/prism/powershell"
import json from "react-syntax-highlighter/dist/esm/languages/prism/json"
import yaml from "react-syntax-highlighter/dist/esm/languages/prism/yaml"
import markdown from "react-syntax-highlighter/dist/esm/languages/prism/markdown"
import java from "react-syntax-highlighter/dist/esm/languages/prism/java"
import cpp from "react-syntax-highlighter/dist/esm/languages/prism/cpp"
import csharp from "react-syntax-highlighter/dist/esm/languages/prism/csharp"
import go from "react-syntax-highlighter/dist/esm/languages/prism/go"
import rust from "react-syntax-highlighter/dist/esm/languages/prism/rust"
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql"
import docker from "react-syntax-highlighter/dist/esm/languages/prism/docker"
import makefile from "react-syntax-highlighter/dist/esm/languages/prism/makefile"
import markup from "react-syntax-highlighter/dist/esm/languages/prism/markup"
import css from "react-syntax-highlighter/dist/esm/languages/prism/css"

// Register languages with Prism
SyntaxHighlighter.registerLanguage("python", python)
SyntaxHighlighter.registerLanguage("javascript", javascript)
SyntaxHighlighter.registerLanguage("typescript", typescript)
SyntaxHighlighter.registerLanguage("jsx", jsx)
SyntaxHighlighter.registerLanguage("tsx", tsx)
SyntaxHighlighter.registerLanguage("bash", bash)
SyntaxHighlighter.registerLanguage("powershell", powershell)
SyntaxHighlighter.registerLanguage("json", json)
SyntaxHighlighter.registerLanguage("yaml", yaml)
SyntaxHighlighter.registerLanguage("markdown", markdown)
SyntaxHighlighter.registerLanguage("java", java)
SyntaxHighlighter.registerLanguage("cpp", cpp)
SyntaxHighlighter.registerLanguage("csharp", csharp)
SyntaxHighlighter.registerLanguage("go", go)
SyntaxHighlighter.registerLanguage("rust", rust)
SyntaxHighlighter.registerLanguage("sql", sql)
SyntaxHighlighter.registerLanguage("docker", docker)
SyntaxHighlighter.registerLanguage("makefile", makefile)
SyntaxHighlighter.registerLanguage("markup", markup)
SyntaxHighlighter.registerLanguage("css", css)

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
    // padding and overflow are handled by Tailwind classes on the PreTag
    margin: '0',
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

// Map user shorthand/aliases to Prism canonical language IDs.
function normalizeLanguage(input?: string | null): string | undefined {
  if (!input) return undefined
  const raw = input.toLowerCase()
  const map: Record<string, string> = {
    js: 'javascript', jsx: 'jsx', mjs: 'javascript', cjs: 'javascript',
    ts: 'typescript', tsx: 'tsx',
    py: 'python', py3: 'python',
    sh: 'bash', zsh: 'bash', shell: 'bash', bash: 'bash', console: 'bash',
    ps: 'powershell', ps1: 'powershell', powershell: 'powershell',
    rb: 'ruby',
    c: 'c', h: 'c',
    cpp: 'cpp', cxx: 'cpp', cc: 'cpp', 'c++': 'cpp', hpp: 'cpp',
    cs: 'csharp', csharp: 'csharp',
    go: 'go', golang: 'go',
    rs: 'rust', rust: 'rust',
    java: 'java', kotlin: 'kotlin', kt: 'kotlin', swift: 'swift',
    php: 'php',
    html: 'markup', xml: 'markup', svg: 'markup',
    json: 'json', yaml: 'yaml', yml: 'yaml', toml: 'toml', ini: 'ini',
    md: 'markdown', markdown: 'markdown',
    sql: 'sql',
    docker: 'dockerfile', dockerfile: 'dockerfile',
    make: 'makefile', makefile: 'makefile',
    txt: 'plaintext', text: 'plaintext', plaintext: 'plaintext'
  }
  return map[raw] ?? raw
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
          pre: (props) => {
            const { children } = props;
            const codeEl = React.Children.toArray(children)[0] as React.ReactElement<{className?: string, children: string}>;
            
            if (codeEl?.type !== 'code' || typeof codeEl.props.children !== 'string') {
                return <pre className="my-6 rounded-xl p-6 border border-border shadow-lg overflow-x-auto" {...props} />;
            }

            const rawLang = codeEl.props.className?.replace("language-", "").trim() || null;
            const lang = normalizeLanguage(rawLang);
            const codeText = codeEl.props.children.replace(/\n$/, '');

            const CodeBlock = () => {
              const [copied, setCopied] = useState(false);
              const onCopy = async () => {
                try {
                  await navigator.clipboard.writeText(codeText);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                } catch {}
              };

              return (
                <div className="relative my-6">
                  <button
                    type="button"
                    onClick={onCopy}
                    className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-border bg-card/80 hover:bg-card hover:border-border/80 transition-all duration-200 cursor-pointer hover:shadow-sm"
                    title="Copy code"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <SyntaxHighlighter
                    language={lang}
                    style={vscDarkPlus}
                    PreTag="pre"
                    className="rounded-xl p-6 pt-12 border border-border shadow-lg overflow-x-auto"
                    customStyle={{ 
                      margin: "0",
                      background: "transparent",
                      // When no language is provided/recognized, ensure readable plain white text
                      color: lang ? undefined : 'var(--color-foreground, var(--foreground, #ffffff))'
                    }}
                    wrapLongLines
                  >
                    {codeText}
                  </SyntaxHighlighter>
                </div>
              );
            }
            return <CodeBlock />;
          },
          code: ({ inline, className, children }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
            if (inline) {
              return <code className="px-1 text-sm font-mono text-primary">{String(children)}</code>;
            }
            return <code className={className}>{children}</code>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
