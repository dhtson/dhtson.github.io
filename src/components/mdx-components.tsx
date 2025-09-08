import Image from 'next/image'
import { ReactNode, type MouseEvent } from 'react'

// Remove syntax highlighting; render plain code blocks

// Custom components for MDX
export const mdxComponents = {
  // Custom Image component with optimization
  img: ({ src, alt, ...props }: { src?: string; alt?: string; [key: string]: unknown }) => {
    if (!src) return null
    
    return (
      <div className="my-8 rounded-xl overflow-hidden shadow-lg">
        <Image
          src={src}
          alt={alt || ''}
          width={800}
          height={400}
          className="w-full h-auto"
          {...props}
        />
        {alt && (
          <p className="text-sm text-muted-foreground text-center p-2 bg-muted/30">
            {alt}
          </p>
        )}
      </div>
    )
  },
  
  // Custom headings with better styling
  h1: ({ children }: { children: ReactNode }) => (
    <h1 className="text-4xl font-bold mt-12 mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
      {children}
    </h1>
  ),
  
  h2: ({ children }: { children: ReactNode }) => (
    <h2 className="text-3xl font-semibold mt-10 mb-4 text-foreground border-b border-border/20 pb-2">
      {children}
    </h2>
  ),
  
  h3: ({ children }: { children: ReactNode }) => (
    <h3 className="text-2xl font-medium mt-8 mb-3 text-foreground">
      {children}
    </h3>
  ),
  
  h4: ({ children }: { children: ReactNode }) => (
    <h4 className="text-xl font-medium mt-6 mb-2 text-foreground">
      {children}
    </h4>
  ),
  
  // Enhanced paragraphs
  p: ({ children }: { children: ReactNode }) => (
    <p className="text-lg leading-relaxed mb-6 text-muted-foreground">
      {children}
    </p>
  ),
  
  // Code blocks without syntax highlighting + copy button
  code: ({ children, className }: { children: ReactNode; className?: string }) => {
    const isInline = !className?.includes('language-')
    
    if (isInline) {
      return (
        <code className="bg-muted px-2 py-1 rounded text-sm font-mono text-primary">
          {children}
        </code>
      )
    }
    
    const codeString = String(children).trim()
    
    return (
      <div className="relative my-6 rounded-xl border border-border bg-[oklch(0.08_0.005_240_/_0.5)]">
        <button
          type="button"
          onClick={async (e: MouseEvent<HTMLButtonElement>) => {
            try {
              await navigator.clipboard.writeText(codeString)
              const btn = e.currentTarget
              const prev = btn.textContent
              btn.textContent = 'Copied'
              setTimeout(() => { btn.textContent = prev || 'Copy' }, 1500)
            } catch {}
          }}
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-border bg-card/80 hover:bg-card hover:border-border/80 transition-all duration-200 cursor-pointer hover:shadow-sm"
          title="Copy code"
        >
          Copy
        </button>
        <div className="overflow-x-auto">
          <pre className="m-0 p-6 pt-12 bg-transparent">
            <code className="text-sm font-mono whitespace-pre">{codeString}</code>
          </pre>
        </div>
      </div>
    )
  },
  
  // Enhanced lists
  ul: ({ children }: { children: ReactNode }) => (
    <ul className="list-disc list-inside mb-6 space-y-2 text-muted-foreground ml-4">
      {children}
    </ul>
  ),
  
  ol: ({ children }: { children: ReactNode }) => (
    <ol className="list-decimal list-inside mb-6 space-y-2 text-muted-foreground ml-4">
      {children}
    </ol>
  ),
  
  li: ({ children }: { children: ReactNode }) => (
    <li className="text-lg leading-relaxed">{children}</li>
  ),
  
  // Blockquotes
  blockquote: ({ children }: { children: ReactNode }) => (
    <blockquote className="border-l-4 border-primary pl-6 my-6 italic text-lg text-muted-foreground bg-muted/30 py-4 rounded-r-lg">
      {children}
    </blockquote>
  ),
  
  // Tables
  table: ({ children }: { children: ReactNode }) => (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse border border-border rounded-lg overflow-hidden">
        {children}
      </table>
    </div>
  ),
  
  th: ({ children }: { children: ReactNode }) => (
    <th className="border border-border px-4 py-2 bg-muted font-semibold text-left">
      {children}
    </th>
  ),
  
  td: ({ children }: { children: ReactNode }) => (
    <td className="border border-border px-4 py-2">
      {children}
    </td>
  ),
  
  // Links
  a: ({ href, children }: { href?: string; children: ReactNode }) => (
    <a
      href={href}
      className="text-primary hover:text-primary/80 underline underline-offset-4 transition-colors"
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      {children}
    </a>
  ),
  
  // Horizontal rule
  hr: () => (
    <hr className="my-12 border-none h-px bg-gradient-to-r from-transparent via-border to-transparent" />
  ),
}
