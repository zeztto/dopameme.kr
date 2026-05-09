'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createMarketComment } from './actions'

type MarketComment = {
  id: string
  content: string
  createdAt: string
  authorId: string | null
  authorName: string
  authorRole: string
}

type MarketCommentsProps = {
  marketId: string
  comments: MarketComment[]
  commentCount: number
  canComment: boolean
  isAuthenticated: boolean
}

function formatCommentDate(value: string) {
  return new Date(value).toLocaleString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function roleLabel(role: string) {
  if (role === 'admin') return '관리자'
  return '회원'
}

function CommentAuthor({ comment }: { comment: MarketComment }) {
  const content = (
    <>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-black text-primary">
        {comment.authorName.slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-black text-text-primary">
          {comment.authorName}
        </div>
        <div className="text-xs font-bold text-text-tertiary">
          {roleLabel(comment.authorRole)}
        </div>
      </div>
    </>
  )

  if (!comment.authorId) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        {content}
      </div>
    )
  }

  return (
    <Link href={`/users/${comment.authorId}`} className="flex min-w-0 items-center gap-2 transition hover:text-primary">
      {content}
    </Link>
  )
}

export default function MarketComments({
  marketId,
  comments,
  commentCount,
  canComment,
  isAuthenticated,
}: MarketCommentsProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const remaining = 500 - content.length

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const trimmed = content.trim()

    if (trimmed.length < 2) {
      setError('댓글은 2자 이상 입력해주세요')
      return
    }

    if (trimmed.length > 500) {
      setError('댓글은 500자 이하로 입력해주세요')
      return
    }

    setLoading(true)
    const result = await createMarketComment({
      marketId,
      content: trimmed,
    })

    if (result.success) {
      setContent('')
      setSuccess(result.message || '댓글을 등록했습니다')
      router.refresh()
    } else {
      setError(result.error || '댓글 등록 중 오류가 발생했습니다')
    }

    setLoading(false)
  }

  return (
    <section className="mt-12 border-t-3 border-primary/15 pt-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-primary">
            Community
          </p>
          <h2 className="mt-1 text-2xl font-black text-text-primary">
            마켓 토론
          </h2>
        </div>
        <div className="rounded-dopameme-pill border-2 border-primary/20 px-4 py-2 text-sm font-black text-primary">
          {commentCount.toLocaleString()}개 댓글
        </div>
      </div>

      {canComment ? (
        <form onSubmit={handleSubmit} className="mb-8 rounded-dopameme-lg border-3 border-primary/15 bg-white p-5 shadow-token-sm">
          {error && (
            <div className="mb-3 rounded-dopameme-md border-2 border-secondary bg-secondary/10 px-4 py-3 text-sm font-bold text-secondary">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-3 rounded-dopameme-md border-2 border-success bg-success/10 px-4 py-3 text-sm font-bold text-success">
              {success}
            </div>
          )}

          <label htmlFor="market-comment" className="sr-only">
            댓글 작성
          </label>
          <textarea
            id="market-comment"
            value={content}
            onChange={(event) => setContent(event.target.value.slice(0, 500))}
            placeholder="이 마켓에 대한 근거, 관점, 참고 링크를 남겨보세요."
            rows={4}
            disabled={loading}
            className="w-full resize-none rounded-dopameme-md border-2 border-light-border bg-light-bg-alt px-4 py-3 text-sm font-semibold text-text-primary outline-none transition placeholder:text-text-tertiary focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <span className={`text-xs font-bold ${remaining < 50 ? 'text-secondary' : 'text-text-tertiary'}`}>
              {remaining.toLocaleString()}자 남음
            </span>
            <button
              type="submit"
              disabled={loading || content.trim().length < 2}
              className="rounded-dopameme-pill bg-primary px-6 py-3 text-sm font-black text-white transition hover:bg-primary-dark hover:shadow-token-md disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? '등록 중' : '댓글 등록'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mb-8 rounded-dopameme-lg border-2 border-light-border bg-light-bg-alt p-5 text-sm font-bold text-text-secondary">
          {isAuthenticated
            ? '현재 계정 상태에서는 댓글을 작성할 수 없습니다.'
            : '로그인하면 마켓 토론에 참여할 수 있습니다.'}
        </div>
      )}

      <div className="space-y-4">
        {comments.length ? comments.map((comment) => (
          <article
            key={comment.id}
            className="rounded-dopameme-lg border-2 border-light-border bg-white p-5"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <CommentAuthor comment={comment} />
              <time className="text-xs font-bold text-text-tertiary" dateTime={comment.createdAt}>
                {formatCommentDate(comment.createdAt)}
              </time>
            </div>
            <p className="whitespace-pre-wrap break-words text-sm font-medium leading-6 text-text-secondary">
              {comment.content}
            </p>
          </article>
        )) : (
          <div className="rounded-dopameme-lg border-2 border-dashed border-primary/20 bg-primary/5 p-8 text-center">
            <h3 className="text-lg font-black text-text-primary">
              아직 댓글이 없습니다
            </h3>
            <p className="mt-2 text-sm font-semibold text-text-secondary">
              첫 의견을 남겨 마켓 토론을 시작하세요.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
