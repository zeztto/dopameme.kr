'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { liquidatePrediction } from './actions'

const MIN_PREDICTION_AMOUNT = 100
const LIQUIDATION_FEE_RATE = 0.01

type PositionLiquidationFormProps = {
  predictionId: string
  currentAmount: number
}

export default function PositionLiquidationForm({
  predictionId,
  currentAmount,
}: PositionLiquidationFormProps) {
  const router = useRouter()
  const maxLiquidationAmount = Math.max(0, currentAmount - MIN_PREDICTION_AMOUNT)
  const [amount, setAmount] = useState(Math.min(maxLiquidationAmount, MIN_PREDICTION_AMOUNT))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (maxLiquidationAmount < MIN_PREDICTION_AMOUNT) {
    return (
      <div className="rounded-dopameme-md border-2 border-light-border bg-white px-4 py-3 text-xs font-semibold text-text-tertiary">
        최소 {MIN_PREDICTION_AMOUNT.toLocaleString()} DPMM은 포지션에 남아 있어야 합니다.
      </div>
    )
  }

  const normalizedAmount = Number.isFinite(amount) ? amount : 0
  const fee = Math.floor(normalizedAmount * LIQUIDATION_FEE_RATE)
  const refundAmount = Math.max(0, normalizedAmount - fee)

  const setQuickAmount = (nextAmount: number) => {
    setAmount(Math.min(maxLiquidationAmount, Math.max(MIN_PREDICTION_AMOUNT, nextAmount)))
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!Number.isInteger(normalizedAmount) || normalizedAmount < MIN_PREDICTION_AMOUNT) {
      setError(`최소 청산 금액은 ${MIN_PREDICTION_AMOUNT.toLocaleString()} DPMM입니다`)
      setLoading(false)
      return
    }

    if (normalizedAmount > maxLiquidationAmount) {
      setError(`최대 ${maxLiquidationAmount.toLocaleString()} DPMM까지 청산할 수 있습니다`)
      setLoading(false)
      return
    }

    try {
      const result = await liquidatePrediction({
        predictionId,
        amount: normalizedAmount,
      })

      if (result.success) {
        setSuccess(result.message || '부분 청산이 완료되었습니다')
        setAmount(MIN_PREDICTION_AMOUNT)
        router.refresh()
      } else {
        setError(result.error || '부분 청산 중 오류가 발생했습니다')
      }
    } catch {
      setError('부분 청산 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-dopameme-lg border-2 border-primary/20 bg-white p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-black text-text-primary">부분 청산</div>
          <div className="mt-1 text-xs font-semibold text-text-tertiary">
            최대 {maxLiquidationAmount.toLocaleString()} DPMM 청산 가능
          </div>
        </div>
        <div className="text-xs font-bold text-text-secondary">
          수수료 1%
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-dopameme-md border-2 border-secondary bg-secondary/10 px-3 py-2 text-xs font-bold text-secondary">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 rounded-dopameme-md border-2 border-success bg-success/10 px-3 py-2 text-xs font-bold text-success">
          {success}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          type="number"
          min={MIN_PREDICTION_AMOUNT}
          max={maxLiquidationAmount}
          step={1}
          value={amount}
          onChange={(event) => {
            setAmount(Number(event.target.value))
            setError('')
            setSuccess('')
          }}
          className="w-full rounded-dopameme-md border-2 border-light-border px-4 py-3 text-sm font-bold text-text-primary outline-none transition focus:border-primary"
        />
        <button
          type="submit"
          disabled={loading || normalizedAmount < MIN_PREDICTION_AMOUNT || normalizedAmount > maxLiquidationAmount}
          className="rounded-dopameme-pill bg-primary px-5 py-3 text-sm font-black text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? '청산 중' : '청산'}
        </button>
      </div>

      <div className="mt-3 grid gap-2 text-xs font-bold text-text-secondary sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setQuickAmount(MIN_PREDICTION_AMOUNT)}
          className="rounded-dopameme-pill bg-light-bg-alt px-3 py-2 transition hover:text-primary"
        >
          최소
        </button>
        <button
          type="button"
          onClick={() => setQuickAmount(Math.floor(maxLiquidationAmount / 2))}
          className="rounded-dopameme-pill bg-light-bg-alt px-3 py-2 transition hover:text-primary"
        >
          50%
        </button>
        <button
          type="button"
          onClick={() => setQuickAmount(maxLiquidationAmount)}
          className="rounded-dopameme-pill bg-light-bg-alt px-3 py-2 transition hover:text-primary"
        >
          최대
        </button>
      </div>

      <div className="mt-3 rounded-dopameme-md bg-light-bg-alt px-3 py-2 text-xs font-semibold text-text-secondary">
        예상 환급 {refundAmount.toLocaleString()} DPMM · 수수료 {fee.toLocaleString()} DPMM
      </div>
    </form>
  )
}
