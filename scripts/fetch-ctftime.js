import fs from "node:fs/promises"
import path from "node:path"

const TEAM_ID = 405509
const TEAM_URL = `https://ctftime.org/team/${TEAM_ID}/`
const OUTPUT = path.join(process.cwd(), "data", "ctftime.json")

function text(html) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
}

function requiredMatch(value, label) {
  if (!value) throw new Error(`Could not find ${label} on ${TEAM_URL}`)
  return value
}

async function main() {
  const response = await fetch(TEAM_URL, {
    headers: {
      "user-agent": "dhtson.github.io resume builder (+https://dhtson.github.io/)",
      accept: "text/html",
    },
  })
  if (!response.ok) throw new Error(`CTFTime returned HTTP ${response.status}`)

  const html = await response.text()
  const page = text(html)
  const heading = requiredMatch(
    html.match(/<h2[^>]*>.*?<img[^>]+alt="([A-Z]{2})"[^>]*>.*?&nbsp;\s*([^<]+)<\/h2>/s),
    "team heading",
  )
  const overall = requiredMatch(
    page.match(/Overall rating place:\s*(\d+)\s*with\s*([\d.]+)\s*pts\s*in\s*(\d{4})/i),
    "overall rating",
  )
  const country = requiredMatch(page.match(/Country place:\s*(\d+)/i), "country place")

  const result = {
    teamId: TEAM_ID,
    teamName: heading[2].trim(),
    countryCode: heading[1],
    overallPlace: Number(overall[1]),
    countryPlace: Number(country[1]),
    points: Number(overall[2]),
    ratingYear: Number(overall[3]),
    fetchedAt: new Date().toISOString(),
  }

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true })
  await fs.writeFile(OUTPUT, `${JSON.stringify(result, null, 2)}\n`)
  console.log(`CTFTime: ${result.teamName}, country #${result.countryPlace}, overall #${result.overallPlace}`)
}

main().catch(async (error) => {
  try {
    await fs.access(OUTPUT)
    console.warn(`Warning: ${error.message}. Using the last known CTFTime snapshot.`)
  } catch {
    console.error(error)
    process.exitCode = 1
  }
})
