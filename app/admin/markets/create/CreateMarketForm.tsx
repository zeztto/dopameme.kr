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
      <div className="bg-success/10 border-3 border-success rounded-3xl p-12 text-center">
        <div className="text-6xl mb-6">🎉</div>
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
    <div className="bg-white border-3 border-primary/20 rounded-3xl p-8 shadow-xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-secondary/10 border-2 border-secondary text-secondary px-4 py-3 rounded-xl text-sm font-semibold">
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
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-text-primary font-medium"
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
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-text-primary font-medium"
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
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-text-primary font-medium"
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
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-text-primary font-medium"
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
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-text-primary font-medium"
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
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-primary focus:outline-none text-text-primary font-medium"
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="bg-secondary text-white px-4 py-3 rounded-xl font-bold hover:bg-secondary-dark transition"
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
            className="mt-3 bg-primary/10 text-primary px-6 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition"
          >
            + 선택지 추가
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white px-6 py-4 rounded-full font-black hover:bg-primary-dark hover:shadow-2xl transition text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '생성 중...' : '마켓 생성'}
        </button>
      </form>
    </div>
  )
}
