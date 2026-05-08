'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteMarket } from '@/app/admin/markets/[id]/delete/actions'
import { toggleMarketHidden } from '@/app/admin/markets/[id]/toggle-hidden/actions'

type AdminMarketActionsProps = {
  marketId: string
  hidden: boolean
  canDelete: boolean
}

export default function AdminMarketActions({ marketId, hidden, canDelete }: AdminMarketActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleToggleHidden = async () => {
    if (loading) return

    setLoading(true)
    const result = await toggleMarketHidden(marketId)

    if (!result.success) {
      alert(result.error || '처리 중 오류가 발생했습니다')
    }

    setLoading(false)
    router.refresh()
  }

  const handleDelete = async () => {
    if (loading) return

    const confirmed = confirm('정말로 이 마켓을 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.')
    if (!confirmed) return

    setLoading(true)
    const result = await deleteMarket(marketId)

    if (!result.success) {
      alert(result.error || '삭제 중 오류가 발생했습니다')
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Link
        href={`/markets/${marketId}`}
        className="rounded-dopameme-pill border-2 border-primary px-3 py-2 text-xs font-black text-primary transition hover:bg-primary hover:text-white"
      >
        보기
      </Link>
      <button
        type="button"
        onClick={handleToggleHidden}
        disabled={loading}
        className="rounded-dopameme-pill border-2 border-light-border px-3 py-2 text-xs font-black text-text-secondary transition hover:border-secondary hover:text-secondary disabled:opacity-50"
      >
        {hidden ? '보이기' : '숨기기'}
      </button>
      {canDelete && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="rounded-dopameme-pill bg-secondary px-3 py-2 text-xs font-black text-white transition hover:bg-secondary-dark disabled:opacity-50"
        >
          삭제
        </button>
      )}
    </div>
  )
}
