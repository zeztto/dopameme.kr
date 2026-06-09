'use client'

import { useState } from 'react'
import { placePrediction } from './actions'
import { useRouter } from 'next/navigation'
import { quoteAmmStake, type AmmConfigInput, type AmmOptionInput } from '@/lib/markets/amm'

export default function PredictionForm({
  marketId,
  optionId,
  optionTitle,
  userBalance,
  quoteOptions,
  ammConfig,
}: {
  marketId: string
  optionId: string
  optionTitle: string
  userBalance: number
  quoteOptions: AmmOptionInput[]
  ammConfig: AmmConfigInput
}) {
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const quote = quoteAmmStake({
    options: quoteOptions,
    optionId,
    amount,
    config: ammConfig,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (amount < 100) {
      setError('최소 베팅 금액은 100 DPMM입니다')
      setLoading(false)
      return
    }

    if (amount > userBalance) {
      setError('DPMM 잔액이 부족합니다')
      setLoading(false)
      return
    }

    const result = await placePrediction({
      marketId,
      optionId,
      amount,
    })

    if (result.success) {
      setSuccess(result.message || '베팅이 완료되었습니다!')
      setAmount(0)
      setTimeout(() => {
        router.refresh()
      }, 1000)
    } else {
      setError(result.error || '베팅 중 오류가 발생했습니다')
    }

    setLoading(false)
  }

  const addAmount = (value: number) => {
    const newAmount = amount + value
    if (newAmount <= Math.min(userBalance, 10000)) {
      setAmount(newAmount)
      setError('')
    } else {
      setError(`최대 ${Math.min(userBalance, 10000).toLocaleString()} DPMM까지 가능합니다`)
    }
  }

  const quickAmounts = [100, 500, 1000, 5000]

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border-2 border-gray-200">
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="bg-secondary/10 border-2 border-secondary text-secondary px-3 py-2 rounded-lg text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-success/10 border-2 border-success text-success px-3 py-2 rounded-lg text-xs font-semibold">
            {success}
          </div>
        )}

        {/* Current Amount Display */}
        <div className="bg-white border-2 border-primary/30 rounded-xl p-4 text-center">
          <div className="text-text-tertiary text-xs font-semibold mb-1">베팅 금액</div>
          <div className="text-3xl font-black text-primary mb-1">
            {amount.toLocaleString()}
          </div>
          <div className="text-text-tertiary text-xs font-semibold">DPMM</div>
        </div>

        {quote && amount >= 100 && (
          <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-3 text-xs font-bold text-text-secondary">
            <div className="flex items-center justify-between gap-3">
              <span>{optionTitle} AMM 평균가</span>
              <span className="text-primary">{(quote.averagePriceBps / 100).toFixed(1)}%</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <span>예상 확률 변화</span>
              <span className="text-text-primary">
                {(quote.beforeProbabilityBps / 100).toFixed(1)}% → {(quote.afterProbabilityBps / 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {/* Quick Amount Buttons - Add on Click */}
        <div className="grid grid-cols-4 gap-2">
          {quickAmounts.map((quickAmount) => (
            <button
              key={quickAmount}
              type="button"
              onClick={() => addAmount(quickAmount)}
              disabled={loading}
              className="bg-white border-2 border-primary/20 text-primary px-2 py-3 rounded-lg font-bold hover:bg-primary hover:text-white hover:scale-105 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +{quickAmount.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Reset and Submit Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setAmount(0)
              setError('')
            }}
            disabled={loading || amount === 0}
            className="flex-1 bg-gray-200 text-gray-600 px-4 py-3 rounded-full font-bold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            초기화
          </button>
          <button
            type="submit"
            disabled={loading || amount < 100 || amount > userBalance}
            className="flex-[2] bg-primary text-white px-4 py-3 rounded-full font-black hover:bg-primary-dark hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '처리 중...' : `${amount.toLocaleString()} DPMM 베팅`}
          </button>
        </div>

        <div className="text-text-tertiary text-xs font-semibold text-center">
          보유: {userBalance.toLocaleString()} DPMM
        </div>
      </form>
    </div>
  )
}
