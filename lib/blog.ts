import "server-only"
import fs from "fs"
import path from "path"
import matter from "gray-matter"
import readingTime from "reading-time"

export type PostMeta = {
	slug: string
	title: string
	excerpt: string
	category?: string
	tags: string[]
	date: string // ISO string
	updated?: string // ISO string
	readTime: string // e.g. "5 min read"
}

export type Post = PostMeta & {
	content: string
	format: "md" | "mdx"
}

const CONTENT_DIR = path.join(process.cwd(), "content", "blogs")

export function getPostSlugs(): string[] {
	if (!fs.existsSync(CONTENT_DIR)) return []
	return fs
		.readdirSync(CONTENT_DIR)
		.filter((name) => fs.statSync(path.join(CONTENT_DIR, name)).isDirectory())
}

function getFileForSlug(slug: string): { filePath: string; format: "md" | "mdx" } | null {
	const mdx = path.join(CONTENT_DIR, slug, "index.mdx")
	const md = path.join(CONTENT_DIR, slug, "index.md")
	if (fs.existsSync(mdx)) return { filePath: mdx, format: "mdx" }
	if (fs.existsSync(md)) return { filePath: md, format: "md" }
	return null
}

export function getPostBySlug(slug: string): Post | null {
	const file = getFileForSlug(slug)
	if (!file) return null

	const raw = fs.readFileSync(file.filePath, "utf8")
	const { content, data } = matter(raw)

	// Frontmatter fields
	const title: string = data.title ?? slug.replace(/-/g, " ")
	const excerpt: string = data.excerpt ?? ""
	const category: string | undefined = data.category
	const tags: string[] = Array.isArray(data.tags) ? data.tags : []

	// Dates: prefer frontmatter, fallback to file stats
	const stat = fs.statSync(file.filePath)
	const dateISO: string = (data.date ? new Date(data.date) : stat.birthtime).toISOString()
	const updatedISO: string | undefined = data.updated
		? new Date(data.updated).toISOString()
		: stat.mtime && stat.mtime.getTime() !== stat.birthtime.getTime()
		? stat.mtime.toISOString()
		: undefined

	const rt = readingTime(content)

	const post: Post = {
		slug,
		title,
		excerpt,
		category,
		tags,
		date: dateISO,
		updated: updatedISO,
		readTime: `${Math.max(1, Math.round(rt.minutes))} min read`,
		content,
		format: file.format,
	}
	return post
}

export function getAllPosts(): PostMeta[] {
	const slugs = getPostSlugs()
	const posts = slugs
		.map((slug) => getPostBySlug(slug))
		.filter((p): p is Post => Boolean(p))
		.map((p) => ({
			slug: p.slug,
			title: p.title,
			excerpt: p.excerpt,
			category: p.category,
			tags: p.tags,
			date: p.date,
			updated: p.updated,
			readTime: p.readTime,
		}))
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
	return posts
}

