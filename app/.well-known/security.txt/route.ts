import { SITE_URL } from "@/lib/seo"

const SECURITY_TXT = [
  `Contact: ${SITE_URL}`,
  `Expires: 2027-05-11T00:00:00Z`,
  "Preferred-Languages: ko, en",
  `Canonical: ${SITE_URL}/.well-known/security.txt`,
  "",
].join("\n")

export function GET() {
  return new Response(SECURITY_TXT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, must-revalidate",
    },
  })
}
