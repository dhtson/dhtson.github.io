"use client"
import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type ResumeRendererProps = {
  content: string
}

function nodeText(node: React.ReactNode): string {
  if (node == null) return ""
  if (typeof node === "string" || typeof node === "number") return String(node)
  if (Array.isArray(node)) return node.map(nodeText).join("")
  if (React.isValidElement(node)) {
    const el = node as React.ReactElement<{ children?: React.ReactNode }>
    return nodeText(el.props.children)
  }
  return ""
}

function hasChildren(node: unknown): node is { children: unknown[] } {
  return (
    typeof node === "object" &&
    node !== null &&
    "children" in node &&
    Array.isArray((node as { children?: unknown[] }).children)
  )
}

function getTagName(node: unknown): string | undefined {
  if (typeof node !== "object" || node === null || !("tagName" in node)) return undefined
  const tagName = (node as { tagName?: unknown }).tagName
  return typeof tagName === "string" ? tagName : undefined
}

function getFirstChildTagName(node: unknown): string | undefined {
  if (!hasChildren(node) || node.children.length === 0) return undefined
  return getTagName(node.children[0])
}

function hasSingleChildTag(node: unknown, tag: string): boolean {
  if (!hasChildren(node) || node.children.length !== 1) return false
  return getTagName(node.children[0]) === tag
}

function isMonthLike(text: string): boolean {
  return /^(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|jun(e)?|jul(y)?|aug(ust)?|sep(tember)?|oct(ober)?|nov(ember)?|dec(ember)?)\b/i.test(
    text.trim(),
  )
}

function isDateLike(text: string): boolean {
  const t = text.trim()
  return (
    /^\d{1,2}\/\d{4}/.test(t) ||
    /^\d{4}/.test(t) ||
    isMonthLike(t)
  )
}

function stripLeadingBreaks(nodes: React.ReactNode[]): React.ReactNode[] {
  let start = 0
  while (start < nodes.length) {
    const n = nodes[start]
    if (typeof n === "string" && n.trim() === "") {
      start += 1
      continue
    }
    if (React.isValidElement(n) && n.type === "br") {
      start += 1
      continue
    }
    break
  }
  const sliced = nodes.slice(start)
  if (sliced.length > 0 && typeof sliced[0] === "string") {
    sliced[0] = sliced[0].replace(/^\s+/, "")
  }
  return sliced
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
          p: ({ children, node }) => {
            const nodes = React.Children.toArray(children)
            const first = nodes[0]

            const firstChildTag = getFirstChildTagName(node)
            const hasStrongFirst = firstChildTag === "strong"

            // Resume "date line" pattern:
            // **10/2024**\nConsolation Prize
            // **11/2023 – 01/2024**\nInterface Developer...
            // **October 2025 – February 2026**\nSemester Exchange Program
            if (hasStrongFirst) {
              const dateText = nodeText(first)
              if (isDateLike(dateText)) {
                const rest = stripLeadingBreaks(nodes.slice(1))
                return (
                  <p className="mb-3">
                    <span className="block text-accent font-medium text-lg leading-snug">{first}</span>
                    {rest.length > 0 ? (
                      <span className="block text-muted-foreground text-lg leading-snug">{rest}</span>
                    ) : null}
                  </p>
                )
              }
            }

            return <p className="text-muted-foreground leading-relaxed mb-4">{children}</p>
          },
          ul: ({ children }) => (
            <ul className="list-none space-y-2 text-muted-foreground mb-6 pl-0 ml-0">
              {children}
            </ul>
          ),
          li: ({ children, node }) => {
            const childNodes = React.Children.toArray(children).filter(
              (n) => !(typeof n === "string" && n.trim() === ""),
            )

            const hasParagraphOnly = hasSingleChildTag(node, "p")
            const firstChild = childNodes[0]
            const content =
              hasParagraphOnly && React.isValidElement(firstChild)
                ? (firstChild as React.ReactElement<{ children?: React.ReactNode }>).props.children
                : children

            return (
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span className="min-w-0">{content}</span>
              </li>
            )
          },
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
