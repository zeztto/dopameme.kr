'use client'

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { registerUser } from "./actions"
import { generateRandomNickname } from "@/lib/nickname-generator"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [nickname, setNickname] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  // 컴포넌트 마운트시 무작위 닉네임 생성
  useEffect(() => {
    setNickname(generateRandomNickname())
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // 비밀번호 확인
    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다")
      setLoading(false)
      return
    }

    // 비밀번호 길이 확인
    if (password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다")
      setLoading(false)
      return
    }

    // 서버 액션으로 회원가입
    const result = await registerUser({
      email,
      password,
      name: nickname,
    })

    if (!result.success) {
      setError(result.error || "회원가입 중 오류가 발생했습니다")
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    await signIn("google", { callbackUrl: "/app" })
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-4xl font-black text-text-primary mb-4">
            회원가입 완료!
          </h1>
          <p className="text-text-secondary text-lg font-medium mb-8">
            <span className="text-primary font-black">10,000 DPMM</span> 웰컴 보너스가 지급되었습니다!
            <br />
            잠시 후 로그인 페이지로 이동합니다...
          </p>
          <Link
            href="/login"
            className="inline-block bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary-dark transition"
          >
            로그인하기
          </Link>
        </div>
      </div>
    )
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
            <span className="text-white text-sm font-black bg-secondary px-8 py-3 rounded-full shadow-xl">
              ✨ 회원가입
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-text-primary mb-4">
            시작하세요!
          </h1>
          <p className="text-text-secondary text-lg font-medium">
            무료로 가입하고 <span className="text-primary font-black">10,000 DPMM</span> 받기
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-white border-3 border-secondary/20 rounded-3xl p-8 shadow-xl">
          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="bg-secondary/10 border-2 border-secondary text-secondary px-4 py-3 rounded-xl text-sm font-semibold">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="nickname" className="block text-text-primary font-bold mb-2">
                닉네임
              </label>
              <input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                maxLength={12}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-secondary focus:outline-none text-text-primary font-medium"
                placeholder="무작위 닉네임이 자동으로 입력됩니다"
              />
              <p className="text-text-tertiary text-xs mt-1 font-medium">
                무작위 닉네임이 자동 생성되었습니다. 원하시면 수정 가능합니다 (최대 12자)
              </p>
            </div>

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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-secondary focus:outline-none text-text-primary font-medium"
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
                minLength={8}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-secondary focus:outline-none text-text-primary font-medium"
                placeholder="8자 이상"
              />
            </div>

            <div>
              <label htmlFor="passwordConfirm" className="block text-text-primary font-bold mb-2">
                비밀번호 확인
              </label>
              <input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-secondary focus:outline-none text-text-primary font-medium"
                placeholder="비밀번호 재입력"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-white px-6 py-4 rounded-full font-black hover:bg-secondary-dark hover:shadow-2xl transition text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "가입 중..." : "회원가입"}
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
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white border-2 border-gray-300 text-text-primary px-6 py-3 rounded-full font-bold hover:border-secondary hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  🔍 Google로 시작하기
                </span>
              </button>
            </div>
          </div>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-text-secondary font-medium">
              이미 계정이 있으신가요?{" "}
              <Link href="/login" className="text-secondary font-bold hover:underline">
                로그인
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-text-tertiary text-sm font-medium">
            가입하면 도파밈의{" "}
            <Link href="/terms" className="text-secondary hover:underline">
              이용약관
            </Link>
            {" "}및{" "}
            <Link href="/privacy" className="text-secondary hover:underline">
              개인정보처리방침
            </Link>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-light-border bg-light-bg-alt mt-40">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-16 mb-12">
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
                <li><Link href="/about" className="text-text-secondary hover:text-primary transition font-semibold">도파밈 소개</Link></li>
                <li><Link href="/terms" className="text-text-secondary hover:text-primary transition font-semibold">이용약관</Link></li>
                <li><Link href="/privacy" className="text-text-secondary hover:text-primary transition font-semibold">개인정보처리방침</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t-2 border-light-border pt-8 text-center">
            <p className="text-text-secondary text-base font-semibold">
              © 2025 도파밈. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
