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
  // Custom syntax highlighter
  const highlightCode = (code: string, language: string): React.ReactNode => {
    const normalizedLang = language.toLowerCase()
    
    // Language aliases
    const langMap: { [key: string]: string } = {
      'py': 'python',
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'sh': 'bash',
      'shell': 'bash',
    }
    
    const lang = langMap[normalizedLang] || normalizedLang
    
    if (lang === 'python') {
      return highlightPython(code)
    } else if (lang === 'javascript') {
      return highlightJavaScript(code)
    } else if (lang === 'typescript') {
      return highlightTypeScript(code)
    } else if (lang === 'html') {
      return highlightHTML(code)
    } else if (lang === 'css') {
      return highlightCSS(code)
    } else if (lang === 'json') {
      return highlightJSON(code)
    } else if (lang === 'bash') {
      return highlightBash(code)
    } else {
      return <span style={{ color: '#D4D4D4' }}>{code}</span> // VS Code default text color
    }
  }

  const highlightPython = (code: string): React.ReactNode => {
    const keywords = /\b(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|pass|break|continue|and|or|not|in|is|lambda|async|await|global|nonlocal|assert|del|raise|True|False|None)\b/g
    const strings = /(["'])((?:(?!\1)[^\\]|\\.)*)(\1)/g
    const comments = /#.*$/gm
    const numbers = /\b\d+\.?\d*\b/g
    const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g
    const decorators = /@[a-zA-Z_][a-zA-Z0-9_]*/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' }, // VS Code comment green
      { pattern: strings, className: 'text-[#CE9178]' }, // VS Code string orange
      { pattern: keywords, className: 'text-[#569CD6]' }, // VS Code keyword blue
      { pattern: decorators, className: 'text-[#4EC9B0]' }, // VS Code decorator cyan
      { pattern: functions, className: 'text-[#DCDCAA]' }, // VS Code function yellow
      { pattern: numbers, className: 'text-[#B5CEA8]' }, // VS Code number light green
    ])
  }

  const highlightJavaScript = (code: string): React.ReactNode => {
    const keywords = /\b(function|const|let|var|if|else|for|while|do|switch|case|default|try|catch|finally|return|break|continue|class|extends|import|export|from|async|await|typeof|instanceof|new|this|super|static|get|set|true|false|null|undefined)\b/g
    const strings = /(["'`])((?:(?!\1)[^\\]|\\.)*)(\1)/g
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm
    const numbers = /\b\d+\.?\d*\b/g
    const functions = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' }, // VS Code comment green
      { pattern: strings, className: 'text-[#CE9178]' }, // VS Code string orange
      { pattern: keywords, className: 'text-[#569CD6]' }, // VS Code keyword blue
      { pattern: functions, className: 'text-[#DCDCAA]' }, // VS Code function yellow
      { pattern: numbers, className: 'text-[#B5CEA8]' }, // VS Code number light green
    ])
  }

  const highlightTypeScript = (code: string): React.ReactNode => {
    const keywords = /\b(function|const|let|var|if|else|for|while|do|switch|case|default|try|catch|finally|return|break|continue|class|extends|import|export|from|async|await|typeof|instanceof|new|this|super|static|get|set|true|false|null|undefined|interface|type|enum|namespace|module|declare|public|private|protected|readonly|abstract)\b/g
    const strings = /(["'`])((?:(?!\1)[^\\]|\\.)*)(\1)/g
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm
    const numbers = /\b\d+\.?\d*\b/g
    const functions = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g
    const types = /:\s*([A-Z][a-zA-Z0-9_]*)/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' }, // VS Code comment green
      { pattern: strings, className: 'text-[#CE9178]' }, // VS Code string orange
      { pattern: keywords, className: 'text-[#569CD6]' }, // VS Code keyword blue
      { pattern: types, className: 'text-[#4EC9B0]' }, // VS Code type cyan
      { pattern: functions, className: 'text-[#DCDCAA]' }, // VS Code function yellow
      { pattern: numbers, className: 'text-[#B5CEA8]' }, // VS Code number light green
    ])
  }

  const highlightHTML = (code: string): React.ReactNode => {
    const tags = /<\/?[a-zA-Z][a-zA-Z0-9]*[^>]*>/g
    const attributes = /\s([a-zA-Z-]+)=("[^"]*"|'[^']*')/g
    const comments = /<!--[\s\S]*?-->/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' }, // VS Code comment green
      { pattern: tags, className: 'text-[#569CD6]' }, // VS Code tag blue
      { pattern: attributes, className: 'text-[#92C5F8]' }, // VS Code attribute light blue
    ])
  }

  const highlightCSS = (code: string): React.ReactNode => {
    const selectors = /[.#]?[a-zA-Z][a-zA-Z0-9-_]*(?=\s*{)/g
    const properties = /([a-zA-Z-]+)(?=\s*:)/g
    const values = /:([^;{}]+)/g
    const comments = /\/\*[\s\S]*?\*\//g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' }, // VS Code comment green
      { pattern: selectors, className: 'text-[#D7BA7D]' }, // VS Code selector yellow-tan
      { pattern: properties, className: 'text-[#92C5F8]' }, // VS Code property light blue
      { pattern: values, className: 'text-[#CE9178]' }, // VS Code value orange
    ])
  }

  const highlightJSON = (code: string): React.ReactNode => {
    const strings = /"[^"]*"/g
    const numbers = /\b\d+\.?\d*\b/g
    const booleans = /\b(true|false|null)\b/g
    const keys = /"[^"]*"(?=\s*:)/g
    
    return tokenizeCode(code, [
      { pattern: keys, className: 'text-[#9CDCFE]' }, // VS Code JSON key light blue
      { pattern: strings, className: 'text-[#CE9178]' }, // VS Code string orange
      { pattern: booleans, className: 'text-[#569CD6]' }, // VS Code boolean blue
      { pattern: numbers, className: 'text-[#B5CEA8]' }, // VS Code number light green
    ])
  }

  const highlightBash = (code: string): React.ReactNode => {
    const commands = /\b(ls|cd|mkdir|rm|cp|mv|cat|grep|sed|awk|find|chmod|chown|ps|kill|top|sudo|apt|yum|npm|yarn|git|docker|kubectl)\b/g
    const flags = /-{1,2}[a-zA-Z0-9-]+/g
    const strings = /(["'])((?:(?!\1)[^\\]|\\.)*)(\1)/g
    const comments = /#.*$/gm
    const variables = /\$[a-zA-Z_][a-zA-Z0-9_]*/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' }, // VS Code comment green
      { pattern: strings, className: 'text-[#CE9178]' }, // VS Code string orange
      { pattern: commands, className: 'text-[#569CD6]' }, // VS Code command blue
      { pattern: flags, className: 'text-[#DCDCAA]' }, // VS Code flag yellow
      { pattern: variables, className: 'text-[#4EC9B0]' }, // VS Code variable cyan
    ])
  }

  const tokenizeCode = (code: string, rules: { pattern: RegExp; className: string }[]): React.ReactNode => {
    const tokens: { start: number; end: number; className: string; match: string }[] = []
    
    rules.forEach(rule => {
      let match
      while ((match = rule.pattern.exec(code)) !== null) {
        tokens.push({
          start: match.index,
          end: match.index + match[0].length,
          className: rule.className,
          match: match[0]
        })
        if (!rule.pattern.global) break
      }
    })
    
    // Sort tokens by start position
    tokens.sort((a, b) => a.start - b.start)
    
    // Remove overlapping tokens (keep the first one)
    const filteredTokens = tokens.filter((token, index) => {
      return !tokens.slice(0, index).some(prevToken => 
        token.start < prevToken.end && token.end > prevToken.start
      )
    })
    
    const result: React.ReactNode[] = []
    let lastIndex = 0
    
    filteredTokens.forEach((token, index) => {
      // Add text before token
      if (token.start > lastIndex) {
        result.push(
          <span key={`text-${index}`} style={{ color: '#D4D4D4' }}>
            {code.slice(lastIndex, token.start)}
          </span>
        )
      }
      
      // Add highlighted token
      result.push(
        <span key={`token-${index}`} className={token.className}>
          {token.match}
        </span>
      )
      
      lastIndex = token.end
    })
    
    // Add remaining text
    if (lastIndex < code.length) {
      result.push(
        <span key="text-end" style={{ color: '#D4D4D4' }}>
          {code.slice(lastIndex)}
        </span>
      )
    }
    
    return <>{result}</>
  }

  // Get display name for language
  const getLanguageDisplayName = (lang: string): string => {
    const displayNames: { [key: string]: string } = {
      'python': 'Python',
      'py': 'Python',
      'javascript': 'JavaScript',
      'js': 'JavaScript',
      'typescript': 'TypeScript',
      'ts': 'TypeScript',
      'jsx': 'React',
      'tsx': 'React',
      'html': 'HTML',
      'css': 'CSS',
      'json': 'JSON',
      'bash': 'Bash',
      'sh': 'Shell',
      'shell': 'Shell',
      'sql': 'SQL',
      'xml': 'XML',
      'yaml': 'YAML',
      'yml': 'YAML',
      'markdown': 'Markdown',
      'md': 'Markdown',
    }
    
    return displayNames[lang.toLowerCase()] || lang.toUpperCase()
  }

  // Pre block with Copy button and language tag; separate component to satisfy hooks rule
  const PreBlock: React.FC<React.HTMLAttributes<HTMLPreElement> & { language?: string }> = (props) => {
    const { children, className, language, ...rest } = props
    const preRef = React.useRef<HTMLPreElement>(null)
    const [copied, setCopied] = useState(false)

    const onCopy = async () => {
      if (preRef.current) {
        const codeElement = preRef.current.querySelector('code');
        const codeText = codeElement ? codeElement.innerText : '';
        try {
          await navigator.clipboard.writeText(codeText.replace(/\n$/, ''))
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch (err) {
          console.error('Failed to copy text: ', err)
        }
      }
    }

    return (
      <div className="relative my-6">
        {language && (
          <div className="absolute left-3 top-3 z-10 px-2 py-1 text-xs rounded-md bg-muted/80 text-muted-foreground font-medium">
            {getLanguageDisplayName(language)}
          </div>
        )}
        <button
          type="button"
          onClick={onCopy}
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-border bg-card/80 hover:bg-card hover:border-border/80 transition-all duration-200 cursor-pointer hover:shadow-sm text-foreground"
          title="Copy code"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
        <pre {...rest} ref={preRef} className={"rounded-xl p-6 pt-12 border border-border shadow-lg overflow-x-auto bg-transparent" + (className ? ` ${className}` : '')}>
          {children}
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
          pre: (props) => {
            const { children } = props
            // Try to extract language from code element
            let language = ''
            if (React.isValidElement(children)) {
              const codeProps = children.props as { className?: string }
              if (codeProps?.className) {
                const match = /language-(\w+)/.exec(codeProps.className || '')
                language = match ? match[1] : ''
              }
            }
            return <PreBlock {...props} language={language} />
          },
          code: ({ inline, className, children }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
            if (inline) {
              return <code className="px-1 text-sm font-mono text-primary">{String(children)}</code>;
            }
            
            // Extract language from className (e.g., "language-python" -> "python")
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            const codeString = String(children).replace(/\n$/, '')
            
            if (language) {
              return (
                <code className={`${className} text-sm font-medium`} style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                  {highlightCode(codeString, language)}
                </code>
              )
            }
            
            // For block code without language, render normally
            return (
              <code className={`${className} text-sm font-medium`} style={{ fontSize: '0.9rem', color: '#D4D4D4', fontWeight: '500' }}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
