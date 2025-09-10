import "server-only"
import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { execSync } from "child_process"

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

function getGitTimestamps(filePath: string): { created?: string; updated?: string } {
  try {
    // Get ISO-8601 author dates for all commits touching this file (newest first)
    const out = execSync(`git log --follow --format=%aI -- "${filePath.replace(/"/g, '\\"')}"`, {
      stdio: ["ignore", "pipe", "ignore"],
      cwd: process.cwd(),
    })
    const lines = out.toString().trim().split("\n").filter(Boolean)
    if (!lines.length) return {}
    const updated = lines[0] // newest
    const created = lines[lines.length - 1] // oldest
    // Ensure valid ISO strings
    const updatedISO = new Date(updated).toISOString()
    const createdISO = new Date(created).toISOString()
    return { created: createdISO, updated: updatedISO }
  } catch {
    return {}
  }
}

export function getResume(): Resume | null {
  if (!fs.existsSync(RESUME_FILE)) return null

  const raw = fs.readFileSync(RESUME_FILE, "utf8")
  const { content, data } = matter(raw)

  // Get file stats and git timestamps for automatic date handling
  const stat = fs.statSync(RESUME_FILE)
  const gitDates = getGitTimestamps(RESUME_FILE)
  
  let lastUpdated: string
  if (data.lastUpdated) {
    // Use explicit date from frontmatter if provided
    lastUpdated = new Date(data.lastUpdated).toISOString()
  } else if (gitDates.updated) {
    // Use Git's last modification date if available
    // Only use updated if it differs from created
    if (!gitDates.created || new Date(gitDates.updated).getTime() !== new Date(gitDates.created).getTime()) {
      lastUpdated = gitDates.updated
    } else {
      // If git updated equals created, use created date
      lastUpdated = gitDates.created
    }
  } else if (gitDates.created) {
    // Use Git's creation date if no updates
    lastUpdated = gitDates.created
  } else {
    // Fall back to file system modification time
    lastUpdated = stat.mtime.toISOString()
  }

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
