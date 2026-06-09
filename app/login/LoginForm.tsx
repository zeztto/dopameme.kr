'use client'

import Link from "next/link"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { startAuthentication } from "@simplewebauthn/browser"
import LanguageSwitcher from "@/components/LanguageSwitcher"
import type { authEntryCopy, landingCopy, Locale } from "@/lib/i18n"

type LoginFormProps = {
  currentLocale: Locale
  copy: (typeof authEntryCopy)['ko']
  footerCopy: (typeof landingCopy)['ko']
}

export default function LoginForm({ currentLocale, copy, footerCopy }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push("/app")
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    await signIn("google", { callbackUrl: "/app" })
  }

  const handlePasskeyLogin = async () => {
    setLoading(true)
    setError("")

    try {
      const optionsResponse = await fetch("/api/webauthn/authenticate/options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })
      const optionsJson = await optionsResponse.json()

      if (!optionsResponse.ok) {
        throw new Error(optionsJson?.error?.message || copy.login.passkeyStartError)
      }

      const authenticationResponse = await startAuthentication(optionsJson.data)
      const result = await signIn("credentials", {
        mode: "passkey",
        email,
        webauthnResponse: JSON.stringify(authenticationResponse),
        redirect: false,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      router.push("/app")
      router.refresh()
    } catch (passkeyError) {
      setError(passkeyError instanceof Error ? passkeyError.message : copy.login.passkeyFailError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 border-b-2 border-primary/20 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                <span className="text-primary">도</span>
                <span className="text-secondary">파</span>
                <span className="text-primary">밈</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher currentLocale={currentLocale} />
              <Link
                href="/"
                className="text-sm font-semibold text-text-secondary transition hover:text-primary"
              >
                {copy.common.backHome}
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-md px-4 py-20">
        <div className="mb-12 text-center">
          <div className="mb-6 inline-block">
            <span className="rounded-full bg-primary px-8 py-3 text-sm font-black text-white shadow-xl">
              {copy.login.badge}
            </span>
          </div>
          <h1 className="mb-4 text-4xl font-black text-text-primary md:text-5xl">
            {copy.login.title}
          </h1>
          <p className="text-lg font-medium text-text-secondary">
            {copy.login.subtitle}
          </p>
        </div>

        <div className="rounded-3xl border-3 border-primary/20 bg-white p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="rounded-xl border-2 border-secondary bg-secondary/10 px-4 py-3 text-sm font-semibold text-secondary">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block font-bold text-text-primary">
                {copy.common.emailLabel}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username webauthn"
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 font-medium text-text-primary focus:border-primary focus:outline-none"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block font-bold text-text-primary">
                {copy.common.passwordLabel}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border-2 border-gray-300 px-4 py-3 font-medium text-text-primary focus:border-primary focus:outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-primary px-6 py-4 text-lg font-black text-white transition hover:bg-primary-dark hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? copy.login.submitting : copy.login.submit}
            </button>
            <button
              type="button"
              onClick={handlePasskeyLogin}
              disabled={loading || !email}
              className="w-full rounded-full border-2 border-primary bg-white px-6 py-4 text-lg font-black text-primary transition hover:bg-primary hover:text-white hover:shadow-2xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copy.login.passkeySubmit}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 font-semibold text-text-secondary">
                  {copy.common.orLabel}
                </span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full rounded-full border-2 border-gray-300 bg-white px-6 py-3 font-bold text-text-primary transition hover:border-primary hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copy.login.googleSubmit}
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="font-medium text-text-secondary">
              {copy.login.signupPrompt}{" "}
              <Link href="/signup" className="font-bold text-primary hover:underline">
                {copy.login.signupLink}
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-text-tertiary">
            {copy.login.agreementPrefix}{" "}
            <Link href="/terms" className="text-primary hover:underline">
              {copy.common.termsLabel}
            </Link>{" "}
            {copy.login.agreementMiddle}{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              {copy.common.privacyLabel}
            </Link>
            {copy.login.agreementSuffix}
          </p>
        </div>
      </main>

      <footer className="mt-40 border-t-2 border-light-border bg-light-bg-alt">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-12 grid gap-16 md:grid-cols-3">
            <div>
              <div className="mb-6 flex items-center gap-2">
                <span className="text-3xl font-black">
                  <span className="text-primary">도</span>
                  <span className="text-secondary">파</span>
                  <span className="text-primary">밈</span>
                </span>
              </div>
              <p className="text-base font-medium leading-relaxed text-text-secondary">
                {footerCopy.footerTagline}
              </p>
            </div>

            <div>
              <h4 className="mb-6 text-lg font-black text-text-primary">{footerCopy.serviceTitle}</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/app" className="font-semibold text-text-secondary transition hover:text-primary">{footerCopy.footerLinks.activity}</Link></li>
                <li><Link href="/markets" className="font-semibold text-text-secondary transition hover:text-primary">{footerCopy.footerLinks.markets}</Link></li>
                <li><Link href="/leaderboard" className="font-semibold text-text-secondary transition hover:text-primary">{footerCopy.footerLinks.leaderboard}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 text-lg font-black text-text-primary">{footerCopy.infoTitle}</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/about" className="font-semibold text-text-secondary transition hover:text-primary">{footerCopy.footerLinks.about}</Link></li>
                <li><Link href="/terms" className="font-semibold text-text-secondary transition hover:text-primary">{footerCopy.footerLinks.terms}</Link></li>
                <li><Link href="/privacy" className="font-semibold text-text-secondary transition hover:text-primary">{footerCopy.footerLinks.privacy}</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t-2 border-light-border pt-8 text-center">
            <p className="text-base font-semibold text-text-secondary">
              © 2025 도파밈. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
