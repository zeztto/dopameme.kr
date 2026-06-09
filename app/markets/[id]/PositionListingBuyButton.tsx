'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { buyPositionListing } from './actions'

type PositionListingBuyButtonProps = {
  listingId: string
  disabledReason?: string
}

export default function PositionListingBuyButton({
  listingId,
  disabledReason,
}: PositionListingBuyButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const disabled = Boolean(disabledReason) || loading

  const handleBuy = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await buyPositionListing({ listingId })

      if (result.success) {
        router.refresh()
      } else {
        setError(result.error || '포지션 구매 중 오류가 발생했습니다')
      }
    } catch {
      setError('포지션 구매 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-start gap-2 md:items-end">
      <button
        type="button"
        onClick={handleBuy}
        disabled={disabled}
        className="rounded-dopameme-pill bg-primary px-5 py-3 text-sm font-black text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? '구매 중' : '구매'}
      </button>
      {disabledReason && (
        <div className="max-w-48 text-xs font-bold text-text-tertiary md:text-right">
          {disabledReason}
        </div>
      )}
      {error && (
        <div className="max-w-64 rounded-dopameme-md border-2 border-secondary bg-secondary/10 px-3 py-2 text-xs font-bold text-secondary md:text-right">
          {error}
        </div>
      )}
    </div>
  )
}
