import fs from "node:fs/promises"
import { execFileSync } from "node:child_process"
import path from "node:path"
import matter from "gray-matter"

const root = process.cwd()
const resumePath = path.join(root, "content", "resume.mdx")
const templatePath = path.join(root, "template", "main.tex")
const buildDir = path.join(root, "build", "resume")

function escapeLatex(value) {
  return String(value)
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([%$#&_{}])/g, "\\$1")
    .replace(/\^/g, "\\textasciicircum{}")
    .replace(/~/g, "\\textasciitilde{}")
}

function interpolateResume(content, ctftime) {
  const fetchedAt = new Date(ctftime.fetchedAt)
  const snapshot = `${String(fetchedAt.getUTCMonth() + 1).padStart(2, "0")}/${fetchedAt.getUTCFullYear()}`
  return content
    .replaceAll("{{ctftime_country_place}}", String(ctftime.countryPlace))
    .replaceAll("{{ctftime_overall_place}}", String(ctftime.overallPlace))
    .replaceAll("{{ctftime_points}}", String(ctftime.points))
    .replaceAll("{{ctftime_snapshot}}", snapshot)
}

async function main() {
  const [{ content, data }, template, ctftimeRaw] = await Promise.all([
    fs.readFile(resumePath, "utf8").then(matter),
    fs.readFile(templatePath, "utf8"),
    fs.readFile(path.join(root, "data", "ctftime.json"), "utf8"),
  ])
  const ctftime = JSON.parse(ctftimeRaw)
  await fs.mkdir(buildDir, { recursive: true })

  const markdownPath = path.join(buildDir, "resume.md")
  const bodyPath = path.join(buildDir, "body.tex")
  await fs.writeFile(markdownPath, interpolateResume(content, ctftime))
  execFileSync(
    "pandoc",
    [markdownPath, "--from=gfm", "--to=latex", "--shift-heading-level-by=-1", "--output", bodyPath],
    { stdio: "inherit" },
  )

  const body = await fs.readFile(bodyPath, "utf8")
  const fetched = new Date(ctftime.fetchedAt)
  const snapshot = `${String(fetched.getUTCMonth() + 1).padStart(2, "0")}/${fetched.getUTCFullYear()}`
  const replacements = {
    "@@NAME@@": escapeLatex(data.name ?? ""),
    "@@TITLE@@": escapeLatex(data.title ?? ""),
    "@@CTFTIME_TEAM_ID@@": String(ctftime.teamId),
    "@@CTFTIME_TEAM@@": escapeLatex(ctftime.teamName),
    "@@CTFTIME_COUNTRY_PLACE@@": String(ctftime.countryPlace),
    "@@CTFTIME_OVERALL_PLACE@@": String(ctftime.overallPlace),
    "@@CTFTIME_POINTS@@": String(ctftime.points),
    "@@CTFTIME_SNAPSHOT@@": snapshot,
    "@@RESUME_BODY@@": body,
  }
  let tex = template
  for (const [placeholder, value] of Object.entries(replacements)) {
    tex = tex.replaceAll(placeholder, value)
  }
  const unresolved = tex.match(/@@[A-Z0-9_]+@@/g)
  if (unresolved) throw new Error(`Unresolved LaTeX placeholders: ${unresolved.join(", ")}`)
  await fs.writeFile(path.join(buildDir, "main.tex"), tex)

  execFileSync("latexmk", ["-xelatex", "-interaction=nonstopmode", "-halt-on-error", "main.tex"], {
    cwd: buildDir,
    stdio: "inherit",
  })
  await fs.mkdir(path.join(root, "public"), { recursive: true })
  await fs.copyFile(path.join(buildDir, "main.pdf"), path.join(root, "public", "resume.pdf"))
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
