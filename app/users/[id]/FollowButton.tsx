'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { followUser, unfollowUser } from './actions'

type FollowButtonProps = {
  userId: string
  initialFollowing: boolean
}

export default function FollowButton({
  userId,
  initialFollowing,
}: FollowButtonProps) {
  const router = useRouter()
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleClick = async () => {
    setLoading(true)
    setError('')

    try {
      const result = following
        ? await unfollowUser({ userId })
        : await followUser({ userId })

      if (result.success) {
        setFollowing(Boolean(result.following))
        router.refresh()
      } else {
        setError(result.error || '요청 처리 중 오류가 발생했습니다')
      }
    } catch {
      setError('요청 처리 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`rounded-dopameme-pill px-6 py-3 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
          following
            ? 'border-3 border-primary bg-white text-primary hover:bg-primary/5'
            : 'bg-primary text-white shadow-token-brand hover:bg-primary-dark'
        }`}
      >
        {loading ? '처리 중' : following ? '팔로잉' : '팔로우'}
      </button>
      {error && (
        <div className="rounded-dopameme-md border-2 border-secondary bg-secondary/10 px-3 py-2 text-xs font-bold text-secondary">
          {error}
        </div>
      )}
    </div>
  )
}
