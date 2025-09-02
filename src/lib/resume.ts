import "server-only"
import fs from "fs"
import path from "path"
import matter from "gray-matter"

export type ResumeMeta = {
  name: string
  title: string
  contacts: Record<string, string>
  lastUpdated: string
}

export type Resume = ResumeMeta & {
  content: string
}

const RESUME_FILE = path.join(process.cwd(), "content", "resume.mdx")

export function getResume(): Resume | null {
  if (!fs.existsSync(RESUME_FILE)) return null

  const raw = fs.readFileSync(RESUME_FILE, "utf8")
  const { content, data } = matter(raw)

  // Get file stats for automatic date handling
  const stat = fs.statSync(RESUME_FILE)
  const lastUpdated = data.lastUpdated 
    ? new Date(data.lastUpdated).toISOString()
    : stat.mtime.toISOString()

  // Extract all contact fields dynamically (exclude name, title, lastUpdated)
  const excludedFields = new Set(['name', 'title', 'lastUpdated', 'phone'])
  const contacts: Record<string, string> = {}
  
  Object.entries(data).forEach(([key, value]) => {
    if (!excludedFields.has(key) && typeof value === 'string') {
      contacts[key] = value
    }
  })

  const resume: Resume = {
    name: data.name ?? "Your Name",
    title: data.title ?? "Your Title",
    contacts,
    lastUpdated,
    content,
  }

  return resume
}
