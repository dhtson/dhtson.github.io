"use client"
import React from "react"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"

type MDXProps = {
	content: string
}

export const MarkdownRenderer: React.FC<MDXProps> = ({ content }) => {
	return (
		<div className="prose prose-invert max-w-none">
			<ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
				{content}
			</ReactMarkdown>
		</div>
	)
}