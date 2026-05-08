'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toggleMarketHidden } from '@/app/admin/markets/[id]/toggle-hidden/actions'
import { deleteMarket } from '@/app/admin/markets/[id]/delete/actions'

type Props = {
  marketId: string
  initialHidden: boolean
  canDelete?: boolean
}

export default function ToggleHiddenButton({ marketId, initialHidden, canDelete = false }: Props) {
  const [hidden, setHidden] = useState(initialHidden)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    if (loading) return

    setLoading(true)
    const result = await toggleMarketHidden(marketId)

    if (result.success) {
      setHidden(result.hidden ?? false)
    } else {
      alert(result.error || '오류가 발생했습니다')
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (loading) return

    const confirmed = confirm('정말로 이 예측을 삭제하시겠습니까?\n삭제된 예측은 복구할 수 없습니다.')
    if (!confirmed) return

    setLoading(true)
    const result = await deleteMarket(marketId)

    if (result.success) {
      // 삭제 성공 시 마켓 목록으로 리다이렉트
      router.push('/markets')
      router.refresh()
    } else {
      alert(result.error || '오류가 발생했습니다')
      setLoading(false)
    }
  }

  if (hidden) {
    // 가려진 상태: 보이기 + 삭제하기 버튼
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggle}
          disabled={loading}
          className="px-4 py-2 rounded-full font-bold text-sm transition bg-success text-white hover:bg-success/80 disabled:opacity-50"
        >
          {loading ? '처리중...' : '보이기'}
        </button>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 rounded-full font-bold text-sm transition bg-secondary-dark text-white hover:bg-secondary disabled:opacity-50"
          >
            {loading ? '처리중...' : '삭제하기'}
          </button>
        )}
      </div>
    )
  }

  // 보이는 상태: 가리기 버튼만
  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="px-4 py-2 rounded-full font-bold text-sm transition bg-gray-200 text-text-secondary hover:bg-gray-300 disabled:opacity-50"
    >
      {loading ? '처리중...' : '가리기'}
    </button>
  )
}
