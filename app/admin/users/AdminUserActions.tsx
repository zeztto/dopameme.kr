'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  adjustUserBalance,
  updateUserRole,
  updateUserStatus,
} from './actions'

type AdminUserActionsProps = {
  userId: string
  role: string
  status: string
  isSelf: boolean
  isSystem: boolean
  isLastActiveAdmin: boolean
}

export default function AdminUserActions({
  userId,
  role,
  status,
  isSelf,
  isSystem,
  isLastActiveAdmin,
}: AdminUserActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [delta, setDelta] = useState('')
  const [reason, setReason] = useState('')

  const locked = loading || isSystem

  const handleRoleChange = async (nextRole: string) => {
    if (locked || nextRole === role) return

    const confirmed = confirm(`회원 권한을 ${nextRole === 'admin' ? '관리자' : '일반 회원'}로 변경하시겠습니까?`)
    if (!confirmed) return

    setLoading(true)
    const result = await updateUserRole({ userId, role: nextRole })

    if (!result.success) {
      alert(result.error || '권한 변경 중 오류가 발생했습니다')
    }

    setLoading(false)
    router.refresh()
  }

  const handleStatusToggle = async () => {
    if (locked) return

    const nextStatus = status === 'active' ? 'suspended' : 'active'
    const confirmed = confirm(nextStatus === 'suspended' ? '이 회원을 정지하시겠습니까?' : '이 회원을 활성화하시겠습니까?')
    if (!confirmed) return

    setLoading(true)
    const result = await updateUserStatus({ userId, status: nextStatus })

    if (!result.success) {
      alert(result.error || '상태 변경 중 오류가 발생했습니다')
    }

    setLoading(false)
    router.refresh()
  }

  const handleBalanceAdjust = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (locked) return

    const parsedDelta = Number(delta)
    const confirmed = confirm(`${parsedDelta.toLocaleString()} DPMM을 조정하시겠습니까?`)
    if (!confirmed) return

    setLoading(true)
    const result = await adjustUserBalance({
      userId,
      delta: parsedDelta,
      reason,
    })

    if (!result.success) {
      alert(result.error || '잔액 조정 중 오류가 발생했습니다')
    } else {
      setDelta('')
      setReason('')
    }

    setLoading(false)
    router.refresh()
  }

  const roleLocked = locked || (isSelf && role === 'admin') || isLastActiveAdmin
  const statusLocked = locked || isSelf || isLastActiveAdmin

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <select
          value={role === 'system' ? 'system' : role}
          onChange={(event) => handleRoleChange(event.target.value)}
          disabled={roleLocked || role === 'system'}
          className="min-h-10 rounded-dopameme-pill border-2 border-light-border bg-white px-3 text-xs font-black text-text-secondary outline-none transition focus:border-primary disabled:opacity-50"
        >
          <option value="user">일반</option>
          <option value="admin">관리자</option>
          {role === 'system' && <option value="system">시스템</option>}
        </select>
        <button
          type="button"
          onClick={handleStatusToggle}
          disabled={statusLocked}
          className={`rounded-dopameme-pill px-3 py-2 text-xs font-black text-white transition disabled:opacity-50 ${
            status === 'active'
              ? 'bg-secondary hover:bg-secondary-dark'
              : 'bg-success hover:bg-success/80'
          }`}
        >
          {status === 'active' ? '정지' : '활성화'}
        </button>
      </div>

      {!isSystem && (
        <form onSubmit={handleBalanceAdjust} className="grid gap-2 lg:grid-cols-[110px_1fr_auto]">
          <input
            type="number"
            value={delta}
            onChange={(event) => setDelta(event.target.value)}
            placeholder="+/- DPMM"
            min="-1000000"
            max="1000000"
            required
            disabled={loading}
            className="min-h-10 rounded-dopameme-md border-2 border-light-border px-3 text-xs font-bold text-text-primary outline-none transition focus:border-primary disabled:opacity-50"
          />
          <input
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="조정 사유"
            minLength={3}
            maxLength={160}
            required
            disabled={loading}
            className="min-h-10 rounded-dopameme-md border-2 border-light-border px-3 text-xs font-bold text-text-primary outline-none transition focus:border-primary disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-dopameme-pill border-2 border-primary px-3 py-2 text-xs font-black text-primary transition hover:bg-primary hover:text-white disabled:opacity-50"
          >
            조정
          </button>
        </form>
      )}
    </div>
  )
}
