'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  approveWithdrawalRequest,
  confirmWithdrawalRequest,
  failWithdrawalRequest,
  rejectWithdrawalRequest,
  submitWithdrawalTransaction,
} from './actions'

type AdminWithdrawalActionsProps = {
  requestId: string
  status: string
}

export default function AdminWithdrawalActions({
  requestId,
  status,
}: AdminWithdrawalActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')
  const [txSignature, setTxSignature] = useState('')

  async function runAction(action: () => Promise<{ success: boolean; error?: string }>) {
    setLoading(true)

    try {
      const result = await action()

      if (!result.success) {
        alert(result.error || '출금 요청 처리 중 오류가 발생했습니다')
      } else {
        setNote('')
        setTxSignature('')
      }
    } catch {
      alert('출금 요청 처리 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
      router.refresh()
    }
  }

  const handleApprove = () => {
    const confirmed = confirm('출금 요청을 승인하시겠습니까?')
    if (!confirmed) return
    void runAction(() => approveWithdrawalRequest({ requestId, note }))
  }

  const handleReject = () => {
    if (note.trim().length < 2) {
      alert('거절 사유를 입력해주세요')
      return
    }
    const confirmed = confirm('출금 요청을 거절하고 차감된 DPMM을 복원하시겠습니까?')
    if (!confirmed) return
    void runAction(() => rejectWithdrawalRequest({ requestId, note }))
  }

  const handleSubmitTx = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const confirmed = confirm('입력한 transaction signature를 기록하시겠습니까?')
    if (!confirmed) return
    void runAction(() => submitWithdrawalTransaction({ requestId, txSignature }))
  }

  const handleConfirm = () => {
    const confirmed = confirm('on-chain 전송을 확정 처리하시겠습니까?')
    if (!confirmed) return
    void runAction(() => confirmWithdrawalRequest({ requestId }))
  }

  const handleFail = () => {
    if (note.trim().length < 2) {
      alert('실패 사유를 입력해주세요')
      return
    }
    const confirmed = confirm('출금 실패 처리하고 차감된 DPMM을 복원하시겠습니까?')
    if (!confirmed) return
    void runAction(() => failWithdrawalRequest({ requestId, note }))
  }

  if (status === 'confirmed' || status === 'rejected' || status === 'failed') {
    return (
      <div className="text-right text-xs font-bold text-text-tertiary">
        완료 상태
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {(status === 'pending' || status === 'approved' || status === 'submitted') && (
        <input
          type="text"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={status === 'submitted' ? '실패 사유' : '관리 메모 / 거절 사유'}
          maxLength={500}
          disabled={loading}
          className="min-h-10 w-full rounded-dopameme-md border-2 border-light-border px-3 text-xs font-bold text-text-primary outline-none transition focus:border-primary disabled:opacity-50"
        />
      )}

      {status === 'pending' && (
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={handleReject}
            disabled={loading}
            className="rounded-dopameme-pill border-2 border-secondary px-3 py-2 text-xs font-black text-secondary transition hover:bg-secondary hover:text-white disabled:opacity-50"
          >
            거절
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={loading}
            className="rounded-dopameme-pill bg-primary px-3 py-2 text-xs font-black text-white transition hover:bg-primary-dark disabled:opacity-50"
          >
            승인
          </button>
        </div>
      )}

      {status === 'approved' && (
        <>
          <form onSubmit={handleSubmitTx} className="grid gap-2">
            <input
              type="text"
              value={txSignature}
              onChange={(event) => setTxSignature(event.target.value)}
              placeholder="Solana transaction signature"
              required
              disabled={loading}
              className="min-h-10 rounded-dopameme-md border-2 border-light-border px-3 font-mono text-xs font-bold text-text-primary outline-none transition focus:border-primary disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-dopameme-pill bg-primary px-3 py-2 text-xs font-black text-white transition hover:bg-primary-dark disabled:opacity-50"
            >
              Tx 기록
            </button>
          </form>
          <button
            type="button"
            onClick={handleReject}
            disabled={loading}
            className="w-full rounded-dopameme-pill border-2 border-secondary px-3 py-2 text-xs font-black text-secondary transition hover:bg-secondary hover:text-white disabled:opacity-50"
          >
            승인 취소/거절
          </button>
        </>
      )}

      {status === 'submitted' && (
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={handleFail}
            disabled={loading}
            className="rounded-dopameme-pill border-2 border-secondary px-3 py-2 text-xs font-black text-secondary transition hover:bg-secondary hover:text-white disabled:opacity-50"
          >
            실패
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="rounded-dopameme-pill bg-success px-3 py-2 text-xs font-black text-white transition hover:bg-success-dark disabled:opacity-50"
          >
            확정
          </button>
        </div>
      )}
    </div>
  )
}
