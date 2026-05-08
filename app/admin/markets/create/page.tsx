import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth-utils'
import Link from 'next/link'
import CreateMarketForm from './CreateMarketForm'
import Header from '@/components/Header'

export default async function CreateMarketPage() {
  const admin = await isAdmin()

  if (!admin) {
    redirect('/markets')
  }

  return (
    <div className="min-h-screen bg-white">
      <Header showBackToMarkets={true} isAuthenticated={true} />

      <main className="container mx-auto px-4 py-20 max-w-3xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-6">
            <span className="text-white text-sm font-black bg-secondary px-8 py-3 rounded-full shadow-xl">
              🎯 관리자
            </span>
          </div>
          <h1 className="text-5xl font-black text-text-primary mb-4">
            새 마켓 생성
          </h1>
          <p className="text-text-secondary text-xl font-medium">
            사용자들이 예측할 수 있는 새로운 마켓을 만드세요
          </p>
        </div>

        {/* Form */}
        <CreateMarketForm />
      </main>
    </div>
  )
}
