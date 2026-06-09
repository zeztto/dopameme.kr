'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { cancelPositionListing, createPositionListing } from './actions'

const MIN_LISTING_PRICE = 100
const MAX_LISTING_PRICE = 1_000_000

type ActiveListing = {
  id: string
  amount: number
  price: number
}

type PositionTransferFormProps = {
  predictionId: string
  currentAmount: number
  activeListing: ActiveListing | null
}

export default function PositionTransferForm({
  predictionId,
  currentAmount,
  activeListing,
}: PositionTransferFormProps) {
  const router = useRouter()
  const [price, setPrice] = useState(
    Math.min(MAX_LISTING_PRICE, Math.max(MIN_LISTING_PRICE, currentAmount))
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const resetMessages = () => {
    setError('')
    setSuccess('')
  }

  const setQuickPrice = (nextPrice: number) => {
    setPrice(Math.min(MAX_LISTING_PRICE, Math.max(MIN_LISTING_PRICE, nextPrice)))
    resetMessages()
  }

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()
    resetMessages()

    if (!Number.isInteger(price) || price < MIN_LISTING_PRICE || price > MAX_LISTING_PRICE) {
      setError(`${MIN_LISTING_PRICE.toLocaleString()}~${MAX_LISTING_PRICE.toLocaleString()} DPMM 사이로 입력해주세요`)
      return
    }

    setLoading(true)

    try {
      const result = await createPositionListing({
        predictionId,
        price,
      })

      if (result.success) {
        setSuccess(result.message || '판매 등록이 완료되었습니다')
        router.refresh()
      } else {
        setError(result.error || '판매 등록 중 오류가 발생했습니다')
      }
    } catch {
      setError('판매 등록 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!activeListing) return

    resetMessages()
    setLoading(true)

    try {
      const result = await cancelPositionListing({
        listingId: activeListing.id,
      })

      if (result.success) {
        setSuccess(result.message || '판매 등록을 취소했습니다')
        router.refresh()
      } else {
        setError(result.error || '판매 등록 취소 중 오류가 발생했습니다')
      }
    } catch {
      setError('판매 등록 취소 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  if (activeListing) {
    return (
      <div className="rounded-dopameme-lg border-2 border-success/25 bg-success/5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-black text-text-primary">판매 등록 중</div>
            <div className="mt-1 text-xs font-semibold text-text-secondary">
              {activeListing.amount.toLocaleString()} DPMM 포지션 · {activeListing.price.toLocaleString()} DPMM
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="rounded-dopameme-pill border-2 border-secondary bg-white px-5 py-2 text-xs font-black text-secondary transition hover:bg-secondary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? '처리 중' : '판매 취소'}
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-dopameme-md border-2 border-secondary bg-secondary/10 px-3 py-2 text-xs font-bold text-secondary">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-3 rounded-dopameme-md border-2 border-success bg-success/10 px-3 py-2 text-xs font-bold text-success">
            {success}
          </div>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleCreate} className="rounded-dopameme-lg border-2 border-light-border bg-light-bg-alt p-4">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-black text-text-primary">포지션 판매</div>
          <div className="mt-1 text-xs font-semibold text-text-tertiary">
            전체 포지션을 고정가로 양도합니다
          </div>
        </div>
        <div className="text-xs font-bold text-text-secondary">
          판매 수수료 1%
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
          min={MIN_LISTING_PRICE}
          max={MAX_LISTING_PRICE}
          step={1}
          value={price}
          onChange={(event) => {
            setPrice(Number(event.target.value))
            resetMessages()
          }}
          className="w-full rounded-dopameme-md border-2 border-light-border bg-white px-4 py-3 text-sm font-bold text-text-primary outline-none transition focus:border-primary"
        />
        <button
          type="submit"
          disabled={loading || price < MIN_LISTING_PRICE || price > MAX_LISTING_PRICE}
          className="rounded-dopameme-pill bg-success px-5 py-3 text-sm font-black text-white transition hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? '등록 중' : '판매 등록'}
        </button>
      </div>

      <div className="mt-3 grid gap-2 text-xs font-bold text-text-secondary sm:grid-cols-3">
        <button
          type="button"
          onClick={() => setQuickPrice(Math.floor(currentAmount * 0.8))}
          className="rounded-dopameme-pill bg-white px-3 py-2 transition hover:text-primary"
        >
          80%
        </button>
        <button
          type="button"
          onClick={() => setQuickPrice(currentAmount)}
          className="rounded-dopameme-pill bg-white px-3 py-2 transition hover:text-primary"
        >
          원금
        </button>
        <button
          type="button"
          onClick={() => setQuickPrice(Math.floor(currentAmount * 1.2))}
          className="rounded-dopameme-pill bg-white px-3 py-2 transition hover:text-primary"
        >
          120%
        </button>
      </div>
    </form>
  )
}
