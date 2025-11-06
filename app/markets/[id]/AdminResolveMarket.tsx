'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { resolveMarket } from '@/app/admin/markets/[id]/resolve/actions'

export default function AdminResolveMarket({
  marketId,
  options,
}: {
  marketId: string
  options: Array<{ id: string; title: string }>
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [selectedOption, setSelectedOption] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const handleResolve = async () => {
    if (!selectedOption) {
      setError('승리한 선택지를 선택해주세요')
      return
    }

    setLoading(true)
    setError('')

    const result = await resolveMarket({
      marketId,
      winningOptionId: selectedOption,
    })

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } else {
      setError(result.error || '결과 확정 중 오류가 발생했습니다')
      setLoading(false)
      setShowConfirm(false)
    }
  }

  if (success) {
    return (
      <div className="bg-success/10 border-3 border-success rounded-3xl p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-2xl font-black text-text-primary mb-2">
          결과가 확정되었습니다!
        </h3>
        <p className="text-text-secondary font-medium">
          당첨자들에게 보상이 지급되었습니다
        </p>
      </div>
    )
  }

  if (showConfirm) {
    const selectedOptionData = options.find((opt) => opt.id === selectedOption)

    return (
      <div className="bg-secondary/10 border-3 border-secondary rounded-3xl p-8">
        <h3 className="text-2xl font-black text-text-primary mb-4">⚠️ 확인</h3>
        <p className="text-text-secondary font-medium mb-6">
          정말로 <span className="text-secondary font-black">&quot;{selectedOptionData?.title}&quot;</span>을(를) 승리
          선택지로 확정하시겠습니까?
          <br />
          <br />
          이 작업은 되돌릴 수 없으며, 즉시 당첨자들에게 보상이 지급됩니다.
        </p>

        {error && (
          <div className="bg-secondary/20 border-2 border-secondary text-secondary px-4 py-3 rounded-xl text-sm font-semibold mb-4">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => setShowConfirm(false)}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-600 px-6 py-3 rounded-full font-bold hover:bg-gray-300 transition disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleResolve}
            disabled={loading}
            className="flex-[2] bg-secondary text-white px-6 py-3 rounded-full font-black hover:bg-secondary-dark hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '처리 중...' : '확정하기'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-secondary/5 to-white border-3 border-secondary/30 rounded-3xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">👑</span>
        <h3 className="text-2xl font-black text-text-primary">마켓 결과 확정</h3>
      </div>

      <p className="text-text-secondary font-medium mb-6">
        승리한 선택지를 선택하고 결과를 확정하세요. 당첨자들에게 자동으로 보상이 지급됩니다.
      </p>

      {error && (
        <div className="bg-secondary/10 border-2 border-secondary text-secondary px-4 py-3 rounded-xl text-sm font-semibold mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3 mb-6">
        {options.map((option) => (
          <label
            key={option.id}
            className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition ${
              selectedOption === option.id
                ? 'border-secondary bg-secondary/10'
                : 'border-gray-300 hover:border-secondary/50'
            }`}
          >
            <input
              type="radio"
              name="winningOption"
              value={option.id}
              checked={selectedOption === option.id}
              onChange={(e) => setSelectedOption(e.target.value)}
              className="w-5 h-5 text-secondary"
            />
            <span className="text-text-primary font-bold flex-1">{option.title}</span>
          </label>
        ))}
      </div>

      <button
        onClick={() => setShowConfirm(true)}
        disabled={!selectedOption}
        className="w-full bg-secondary text-white px-6 py-4 rounded-full font-black hover:bg-secondary-dark hover:shadow-2xl transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        결과 확정하기
      </button>
    </div>
  )
}
