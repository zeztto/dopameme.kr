'use client'

import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/app")
      router.refresh()
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'kakao') => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b-2 border-primary/20 bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                <span className="text-primary">도</span>
                <span className="text-secondary">파</span>
                <span className="text-primary">밈</span>
              </span>
            </Link>
            <Link
              href="/"
              className="text-text-secondary hover:text-primary transition text-sm font-semibold"
            >
              ← 홈으로
            </Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20 max-w-md">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <span className="text-white text-sm font-black bg-primary px-8 py-3 rounded-full shadow-xl">
              🔐 로그인
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-text-primary mb-4">
            환영합니다!
          </h1>
          <p className="text-text-secondary text-lg font-medium">
            도파밈 계정으로 로그인하세요
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white border-3 border-primary/20 rounded-3xl p-8 shadow-xl">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-secondary/10 border-2 border-secondary text-secondary px-4 py-3 rounded-xl text-sm font-semibold">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-text-primary font-bold mb-2">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-text-primary font-medium"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-text-primary font-bold mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-text-primary font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white px-6 py-4 rounded-full font-black hover:bg-primary-dark hover:shadow-2xl transition text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-text-secondary font-semibold">
                  또는
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={loading}
                className="w-full bg-white border-2 border-gray-300 text-text-primary px-6 py-3 rounded-full font-bold hover:border-primary hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  🔍 Google로 계속하기
                </span>
              </button>

              <button
                onClick={() => handleSocialLogin('kakao')}
                disabled={loading}
                className="w-full bg-[#FEE500] border-2 border-[#FEE500] text-[#191919] px-6 py-3 rounded-full font-bold hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  💬 Kakao로 계속하기
                </span>
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-text-secondary font-medium">
              계정이 없으신가요?{" "}
              <Link href="/signup" className="text-primary font-bold hover:underline">
                회원가입
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-text-tertiary text-sm font-medium">
            로그인하면 도파밈의{" "}
            <Link href="/terms" className="text-primary hover:underline">
              이용약관
            </Link>
            {" "}및{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              개인정보처리방침
            </Link>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-light-border bg-light-bg-alt mt-40">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-16 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-3xl font-black">
                  <span className="text-primary">도</span>
                  <span className="text-secondary">파</span>
                  <span className="text-primary">밈</span>
                </span>
              </div>
              <p className="text-text-secondary text-base leading-relaxed font-medium">
                게임처럼 즐기는 예측 플랫폼
              </p>
            </div>

            <div>
              <h4 className="text-text-primary font-black mb-6 text-lg">서비스</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/app" className="text-text-secondary hover:text-primary transition font-semibold">대시보드</Link></li>
                <li><Link href="/markets" className="text-text-secondary hover:text-primary transition font-semibold">마켓</Link></li>
                <li><Link href="/leaderboard" className="text-text-secondary hover:text-primary transition font-semibold">리더보드</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-text-primary font-black mb-6 text-lg">정보</h4>
              <ul className="space-y-4 text-base">
                <li><Link href="/about" className="text-text-secondary hover:text-primary transition font-semibold">소개</Link></li>
                <li><Link href="/terms" className="text-text-secondary hover:text-primary transition font-semibold">이용약관</Link></li>
                <li><Link href="/privacy" className="text-text-secondary hover:text-primary transition font-semibold">개인정보처리방침</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t-2 border-light-border pt-10 text-center">
            <p className="text-text-secondary text-base mb-3 font-semibold">
              © 2025 도파밈. All rights reserved.
            </p>
            <p className="text-text-tertiary text-sm font-medium">
              도파밈은 게임용 포인트를 사용하는 예측 플랫폼입니다.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
