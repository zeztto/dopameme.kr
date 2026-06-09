import type { Metadata } from "next"
import { authEntryCopy, landingCopy, publicMetadataCopy } from "@/lib/i18n"
import { getCurrentLocale } from "@/lib/i18n-server"
import SignupForm from "./SignupForm"

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getCurrentLocale()
  const copy = publicMetadataCopy[locale].signup

  return {
    title: { absolute: copy.title },
    description: copy.description,
    robots: {
      index: false,
      follow: false,
    },
  }
}

export default async function SignupPage() {
  const locale = await getCurrentLocale()

  return (
    <SignupForm
      currentLocale={locale}
      copy={authEntryCopy[locale]}
      footerCopy={landingCopy[locale]}
    />
  )
}
