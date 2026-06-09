export const SITE_URL = "https://dopameme.kr"
export const SITE_NAME = "도파밈"
export const DEFAULT_OG_IMAGE = "/opengraph-image"

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString()
}

export function createSeoDescription(value: string, maxLength = 155) {
  const normalized = value.replace(/\s+/g, " ").trim()

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`
}

export function buildJsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c")
}
