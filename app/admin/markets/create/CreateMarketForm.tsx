'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createMarket } from './actions'

export default function CreateMarketForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('경제')
  const [imageUrl, setImageUrl] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [options, setOptions] = useState(['', ''])

  const categories = ['경제', '정치', '스포츠', '엔터테인먼트', '기술', '기타']

  const addOption = () => {
    setOptions([...options, ''])
  }

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      setError('최소 2개 이상의 선택지가 필요합니다')
      return
    }
    setOptions(options.filter((_, i) => i !== index))
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 빈 옵션 제거
    const filteredOptions = options.filter((opt) => opt.trim().length > 0)

    if (filteredOptions.length < 2) {
      setError('최소 2개 이상의 선택지를 입력해주세요')
      setLoading(false)
      return
    }

    const result = await createMarket({
      title,
      description,
      category,
      imageUrl: imageUrl || undefined,
      endsAt,
      options: filteredOptions,
    })

    if (result.success) {
      setSuccess(true)
      setTimeout(() => {
        router.push(`/markets/${result.marketId}`)
      }, 2000)
    } else {
      setError(result.error || '마켓 생성 중 오류가 발생했습니다')
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-dopameme-lg border-3 border-success bg-success/10 p-12 text-center">
        <h2 className="text-3xl font-black text-text-primary mb-4">
          마켓이 생성되었습니다!
        </h2>
        <p className="text-text-secondary text-lg font-medium">
          잠시 후 마켓 페이지로 이동합니다...
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-dopameme-lg border-3 border-primary/20 bg-white p-8 shadow-token-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-dopameme-md border-2 border-secondary bg-secondary/10 px-4 py-3 text-sm font-semibold text-secondary">
            {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-text-primary font-bold mb-2">
            마켓 제목 *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={5}
            className="w-full rounded-dopameme-md border-2 border-light-border px-4 py-3 font-medium text-text-primary outline-none transition focus:border-primary"
            placeholder="예: 2025년 비트코인 가격이 10만 달러를 돌파할까요?"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-text-primary font-bold mb-2">
            설명 *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={10}
            rows={4}
            className="w-full rounded-dopameme-md border-2 border-light-border px-4 py-3 font-medium text-text-primary outline-none transition focus:border-primary"
            placeholder="마켓에 대한 자세한 설명을 입력하세요"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-text-primary font-bold mb-2">
            카테고리 *
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full rounded-dopameme-md border-2 border-light-border px-4 py-3 font-medium text-text-primary outline-none transition focus:border-primary"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Image URL (optional) */}
        <div>
          <label htmlFor="imageUrl" className="block text-text-primary font-bold mb-2">
            이미지 URL (선택)
          </label>
          <input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full rounded-dopameme-md border-2 border-light-border px-4 py-3 font-medium text-text-primary outline-none transition focus:border-primary"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Ends At */}
        <div>
          <label htmlFor="endsAt" className="block text-text-primary font-bold mb-2">
            마감 날짜/시간 *
          </label>
          <input
            id="endsAt"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            required
            className="w-full rounded-dopameme-md border-2 border-light-border px-4 py-3 font-medium text-text-primary outline-none transition focus:border-primary"
          />
        </div>

        {/* Options */}
        <div>
          <label className="block text-text-primary font-bold mb-2">선택지 *</label>
          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`선택지 ${index + 1}`}
                  className="flex-1 rounded-dopameme-md border-2 border-light-border px-4 py-3 font-medium text-text-primary outline-none transition focus:border-primary"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="rounded-dopameme-md bg-secondary px-4 py-3 font-bold text-white transition hover:bg-secondary-dark"
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addOption}
            className="mt-3 rounded-dopameme-pill bg-primary/10 px-6 py-3 font-bold text-primary transition hover:bg-primary hover:text-white"
          >
            + 선택지 추가
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-dopameme-pill bg-primary px-6 py-4 text-lg font-black text-white shadow-token-brand transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? '생성 중...' : '마켓 생성'}
        </button>
      </form>
    </div>
  )
}
