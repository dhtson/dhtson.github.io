import "server-only"
import fs from "fs"
import path from "path"
import matter from "gray-matter"
import readingTime from "reading-time"
import { execSync } from "child_process"

export type PostMeta = {
  slug: string
  title: string
  excerpt: string
  // Preferred: multiple categories; keep legacy single 'category' for compatibility
  categories?: string[]
  category?: string
  tags: string[]
  date: string // ISO string
  updated?: string // ISO string
  readTime: string // e.g. "5 min read"
  // Preferred: multiple languages with full names; keep legacy single 'language' for compatibility
  languages?: string[]
  language?: string
  authors?: string[]
  // Language support for multi-language posts
  baseName?: string // Base name without language suffix
  detectedLanguage?: string // Language detected from folder name
  availableLanguages?: Array<{ code: string; name: string; slug: string }> // Available translations
}

export type Post = PostMeta & {
  content: string
  format: "md" | "mdx"
}

// Language code to full name mapping
const LANGUAGE_MAP: Record<string, string> = {
  en: 'English',
  vi: 'Vietnamese',
  vn: 'Vietnamese',
  ja: 'Japanese',
  jp: 'Japanese',
  zh: 'Chinese',
  'zh-cn': 'Chinese (Simplified)',
  'zh-sg': 'Chinese (Simplified)',
  'zh-tw': 'Chinese (Traditional)',
  'zh-hk': 'Chinese (Traditional)',
  fr: 'French',
  de: 'German',
  es: 'Spanish',
  it: 'Italian',
  ko: 'Korean',
  ru: 'Russian',
  pt: 'Portuguese',
  'pt-br': 'Portuguese (Brazil)',
  'pt-pt': 'Portuguese (Portugal)',
  ar: 'Arabic',
  hi: 'Hindi',
  th: 'Thai',
  id: 'Indonesian',
  ms: 'Malay',
  tl: 'Filipino',
  nl: 'Dutch',
  sv: 'Swedish',
  no: 'Norwegian',
  da: 'Danish',
  fi: 'Finnish',
  pl: 'Polish',
  cs: 'Czech',
  sk: 'Slovak',
  hu: 'Hungarian',
  ro: 'Romanian',
  bg: 'Bulgarian',
  hr: 'Croatian',
  sr: 'Serbian',
  sl: 'Slovenian',
  et: 'Estonian',
  lv: 'Latvian',
  lt: 'Lithuanian',
  uk: 'Ukrainian',
  be: 'Belarusian',
  tr: 'Turkish',
  he: 'Hebrew',
  fa: 'Persian',
  ur: 'Urdu',
  bn: 'Bengali',
  ta: 'Tamil',
  te: 'Telugu',
  ml: 'Malayalam',
  kn: 'Kannada',
  gu: 'Gujarati',
  pa: 'Punjabi',
  ne: 'Nepali',
  si: 'Sinhala',
  my: 'Burmese',
  km: 'Khmer',
  lo: 'Lao',
}

// Function to get all available languages for a post slug
function getAvailableLanguagesForSlug(slug: string): Array<{ code: string; name: string; slug: string }> {
  const availableLanguages: Array<{ code: string; name: string; slug: string }> = []
  const folderPath = path.join(CONTENT_DIR, slug)
  
  if (!fs.existsSync(folderPath)) return availableLanguages
  
  const files = fs.readdirSync(folderPath)
  const langFiles = files.filter(file => file.match(/^[a-z]{2,3}(-[a-z]{2,4})?\.(mdx?|md)$/i))
  
  for (const file of langFiles) {
    const langCode = file.split('.')[0].toLowerCase()
    if (LANGUAGE_MAP[langCode]) {
      availableLanguages.push({
        code: langCode,
        name: LANGUAGE_MAP[langCode],
        slug: slug
      })
    }
  }
  
  // Sort languages with priority: English first, Vietnamese second, then alphabetically
  return availableLanguages.sort((a, b) => {
    // English gets highest priority
    if (a.code === 'en' && b.code !== 'en') return -1
    if (b.code === 'en' && a.code !== 'en') return 1
    
    // Vietnamese gets second priority
    if ((a.code === 'vi' || a.code === 'vn') && b.code !== 'vi' && b.code !== 'vn' && b.code !== 'en') return -1
    if ((b.code === 'vi' || b.code === 'vn') && a.code !== 'vi' && a.code !== 'vn' && a.code !== 'en') return 1
    
    // For everything else, sort alphabetically by name
    return a.name.localeCompare(b.name)
  })
}

const CONTENT_DIR = path.join(process.cwd(), "content", "blogs")

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

export function getPostSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return []
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((name) => fs.statSync(path.join(CONTENT_DIR, name)).isDirectory())
}

function getFileForSlug(slug: string, language?: string): { filePath: string; format: "md" | "mdx" } | null {
  // If language is specified, look for [language].mdx/md files
  if (language) {
    const mdx = path.join(CONTENT_DIR, slug, `${language}.mdx`)
    const md = path.join(CONTENT_DIR, slug, `${language}.md`)
    if (fs.existsSync(mdx)) return { filePath: mdx, format: "mdx" }
    if (fs.existsSync(md)) return { filePath: md, format: "md" }
  }
  
  // Fallback to index files (for backward compatibility)
  const mdx = path.join(CONTENT_DIR, slug, "index.mdx")
  const md = path.join(CONTENT_DIR, slug, "index.md")
  if (fs.existsSync(mdx)) return { filePath: mdx, format: "mdx" }
  if (fs.existsSync(md)) return { filePath: md, format: "md" }
  
  // If no index files, try to find any language file (default to first available)
  const folderPath = path.join(CONTENT_DIR, slug)
  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath)
    const langFiles = files.filter(file => file.match(/^[a-z]{2,3}(-[a-z]{2,4})?\.(mdx?|md)$/i))
    if (langFiles.length > 0) {
      // Sort to prefer English first, then Vietnamese, then alphabetically
      langFiles.sort((a, b) => {
        const aLang = a.split('.')[0]
        const bLang = b.split('.')[0]
        if (aLang === 'en' && bLang !== 'en') return -1
        if (bLang === 'en' && aLang !== 'en') return 1
        if ((aLang === 'vi' || aLang === 'vn') && bLang !== 'vi' && bLang !== 'vn') return -1
        if ((bLang === 'vi' || bLang === 'vn') && aLang !== 'vi' && aLang !== 'vn') return 1
        return aLang.localeCompare(bLang)
      })
      
      const selectedFile = langFiles[0]
      const filePath = path.join(folderPath, selectedFile)
      const format = selectedFile.endsWith('.mdx') ? 'mdx' : 'md' as const
      return { filePath, format }
    }
  }
  
  return null
}

export function getPostBySlug(slug: string, language?: string): Post | null {
  const file = getFileForSlug(slug, language)
  if (!file) return null

  const raw = fs.readFileSync(file.filePath, "utf8")
  const { content, data } = matter(raw)

  // Get available languages for this slug
  const availableLanguages = getAvailableLanguagesForSlug(slug)
  
  // If language was specified but file doesn't exist, try to get default language
  let actualLanguageCode = language
  if (language && !availableLanguages.find(lang => lang.code === language)) {
    // Fallback to first available language
    if (availableLanguages.length > 0) {
      actualLanguageCode = availableLanguages[0].code
    }
  } else if (!language && availableLanguages.length > 0) {
    // If no language specified, use the first available (which is sorted by priority)
    actualLanguageCode = availableLanguages[0].code
  }

  const title: string = data.title ?? slug.replace(/-/g, " ")
  const excerpt: string = data.excerpt ?? ""
  // Normalize categories: accept 'categories' (array) or 'category' (string)
  const categories: string[] | undefined = Array.isArray(data.categories)
    ? data.categories.map(String)
    : Array.isArray(data.category)
    ? data.category.map(String)
    : typeof data.category === 'string'
    ? [String(data.category)]
    : undefined
  const tags: string[] = Array.isArray(data.tags) ? data.tags : []
  // Normalize languages: accept 'languages' (array) or 'language' (string)
  const rawLangs: string[] | undefined = Array.isArray(data.languages)
    ? data.languages.map(String)
    : typeof data.language === 'string'
    ? [String(data.language)]
    : undefined

  const langMap: Record<string, string> = LANGUAGE_MAP
  const normalizeLang = (s: string) => {
    const k = s.trim().toLowerCase()
    // if already a known code, map to label; otherwise return with first-letter uppercase
    if (langMap[k]) return langMap[k]
    // If string contains only letters and hyphens and is short => maybe code, try without region
    if (k.includes('-') && langMap[k.split('-')[0]]) return langMap[k.split('-')[0]]
    // Otherwise treat as already a name; capitalize first letter of each word
    return s
      .split(' ')
      .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
      .join(' ')
  }

  const languages: string[] | undefined = rawLangs?.map(normalizeLang)

  const authors: string[] | undefined = Array.isArray(data.authors)
    ? data.authors.map(String)
    : typeof data.author === 'string'
    ? [data.author]
    : undefined

  const stat = fs.statSync(file.filePath)
  const gitDates = getGitTimestamps(file.filePath)
  const dateISO: string = data.date
    ? new Date(data.date).toISOString()
    : gitDates.created ?? stat.birthtime.toISOString()
  let updatedISO: string | undefined
  if (data.updated) {
    updatedISO = new Date(data.updated).toISOString()
  } else if (gitDates.updated) {
    // Only set updated if it differs from created/published
    if (!gitDates.created || new Date(gitDates.updated).getTime() !== new Date(gitDates.created).getTime()) {
      if (new Date(gitDates.updated).getTime() !== new Date(dateISO).getTime()) {
        updatedISO = gitDates.updated
      }
    }
  } else if (stat.mtime && stat.mtime.getTime() !== stat.birthtime.getTime()) {
    const m = stat.mtime.toISOString()
    if (new Date(m).getTime() !== new Date(dateISO).getTime()) updatedISO = m
  }

  const rt = readingTime(content)

  const post: Post = {
    slug,
    title,
    excerpt,
    categories,
    category: categories?.[0],
    tags,
    languages,
    language: languages?.[0],
    authors,
    date: dateISO,
    updated: updatedISO,
    readTime: `${Math.max(1, Math.round(rt.minutes))} min read`,
    content,
    format: file.format,
    baseName: slug, // Now baseName is just the slug since we removed language suffixes
    detectedLanguage: actualLanguageCode ? LANGUAGE_MAP[actualLanguageCode] : undefined,
    availableLanguages: availableLanguages.length > 1 ? availableLanguages : undefined,
  }
  return post
}

export function getAllPosts(): PostMeta[] {
  const slugs = getPostSlugs()
  const posts = slugs
    .map((slug) => getPostBySlug(slug)) // This will get the default/first available language
    .filter((p): p is Post => Boolean(p))

  return posts
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      categories: p.categories,
      category: p.category,
      tags: p.tags,
      languages: p.languages,
      language: p.language,
      authors: p.authors,
      date: p.date,
      updated: p.updated,
      readTime: p.readTime,
      baseName: p.baseName,
      detectedLanguage: p.detectedLanguage,
      availableLanguages: p.availableLanguages,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Function to get ALL post slugs (including all language versions) for static generation
export function getAllPostSlugs(): string[] {
  return getPostSlugs()
}
