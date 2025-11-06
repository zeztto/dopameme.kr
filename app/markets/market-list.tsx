'use client'

import { useState } from 'react'
import Link from 'next/link'

type MarketOption = {
  id: string
  title: string
  totalAmount: number
  totalPredictions: number
  percentage: number
  isWinner: boolean
}

type Market = {
  id: string
  title: string
  category: string
  status: string
  endsAt: Date
  createdAt: Date
  winningOptionId: string | null
  hidden?: boolean
  options: MarketOption[]
  totalAmount: number
}

type Props = {
  markets: Market[]
  isAdmin?: boolean
}

const categories = ['전체', '정치', '경제', '기술', '스포츠', '연예', '날씨', '이슈', '국제']

export default function MarketList({ markets, isAdmin }: Props) {
  const [selectedCategory, setSelectedCategory] = useState('전체')

  const filteredMarkets = selectedCategory === '전체'
    ? markets
    : markets.filter(market => market.category === selectedCategory)

  return (
    <>
      {/* Category Filter */}
      <div className="flex justify-center mb-12">
        <div className="inline-flex bg-gray-100 rounded-full p-1.5 gap-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${
                selectedCategory === category
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-transparent text-text-secondary hover:text-primary'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Market Cards */}
      {filteredMarkets.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-6">🎲</div>
          <h2 className="text-3xl font-black text-text-primary mb-4">
            아직 활성 예측 시장이 없습니다
          </h2>
          <p className="text-text-secondary text-lg font-medium">
            곧 새로운 예측 시장이 열립니다!
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMarkets.map((market) => (
            <Link
              key={market.id}
              href={`/markets/${market.id}`}
              className={`bg-white border-3 rounded-3xl p-6 hover:shadow-2xl transition group ${
                market.status === 'resolved'
                  ? 'border-gray-200 opacity-60 hover:opacity-80 hover:border-gray-300'
                  : 'border-primary/20 hover:border-primary'
              }`}
            >
              {/* Category Badge and Status */}
              <div className="mb-4 flex items-center gap-2 flex-wrap">
                <span className="inline-block bg-secondary/10 text-secondary px-4 py-1.5 rounded-full text-xs font-black">
                  {market.category}
                </span>
                {market.status === 'resolved' && (
                  <span className="inline-block bg-success/10 text-success px-4 py-1.5 rounded-full text-xs font-black">
                    ✓ 결과 확정
                  </span>
                )}
                {isAdmin && market.hidden && (
                  <span className="inline-block bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-xs font-black">
                    🔒 가려짐
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className={`text-xl font-black mb-6 transition line-clamp-2 ${
                market.status === 'resolved'
                  ? 'text-gray-600'
                  : 'text-text-primary group-hover:text-primary'
              }`}>
                {market.title}
              </h3>

              {/* Options with Percentages */}
              {market.options.length === 2 ? (
                // 2개 선택지: 좌우 비율 막대
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-bold text-sm flex items-center gap-1 ${
                      market.options[0].isWinner ? 'text-success' : market.status === 'resolved' ? 'text-gray-600' : 'text-text-primary'
                    }`}>
                      {market.options[0].isWinner && '👑 '}
                      {market.options[0].title}
                    </span>
                    <span className={`font-bold text-sm flex items-center gap-1 ${
                      market.options[1].isWinner ? 'text-success' : market.status === 'resolved' ? 'text-gray-600' : 'text-text-primary'
                    }`}>
                      {market.options[1].isWinner && '👑 '}
                      {market.options[1].title}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-black text-xl ${
                      market.options[0].isWinner ? 'text-success' : market.status === 'resolved' ? 'text-gray-500' : 'text-primary'
                    }`}>
                      {market.options[0].percentage}%
                    </span>
                    <span className={`font-black text-xl ${
                      market.options[1].isWinner ? 'text-success' : market.status === 'resolved' ? 'text-gray-500' : 'text-primary'
                    }`}>
                      {market.options[1].percentage}%
                    </span>
                  </div>
                  <div className="h-12 bg-gray-100 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full transition-all ${
                        market.options[0].isWinner
                          ? 'bg-gradient-to-r from-success to-success/80'
                          : market.status === 'resolved'
                          ? 'bg-gray-400'
                          : 'bg-gradient-to-r from-primary to-primary/70'
                      }`}
                      style={{ width: `${market.options[0].percentage}%` }}
                    />
                    <div
                      className={`h-full transition-all ${
                        market.options[1].isWinner
                          ? 'bg-gradient-to-l from-success to-success/80'
                          : market.status === 'resolved'
                          ? 'bg-gray-400'
                          : 'bg-gradient-to-l from-secondary to-secondary/70'
                      }`}
                      style={{ width: `${market.options[1].percentage}%` }}
                    />
                  </div>
                </div>
              ) : (
                // 3개 이상 선택지: 개별 막대
                <div className="space-y-3 mb-6">
                  {market.options.map((option) => (
                    <div key={option.id} className="relative">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className={`font-bold text-sm flex items-center gap-2 ${
                          option.isWinner ? 'text-success' : market.status === 'resolved' ? 'text-gray-600' : 'text-text-primary'
                        }`}>
                          {option.isWinner && '👑 '}
                          {option.title}
                        </span>
                        <span className={`font-black text-lg ${
                          option.isWinner ? 'text-success' : market.status === 'resolved' ? 'text-gray-500' : 'text-primary'
                        }`}>
                          {option.percentage}%
                        </span>
                      </div>
                      <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            option.isWinner
                              ? 'bg-success'
                              : market.status === 'resolved'
                              ? 'bg-gray-400'
                              : 'bg-gradient-to-r from-primary to-secondary'
                          }`}
                          style={{ width: `${option.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t-2 border-gray-100">
                <div className={`text-xs font-semibold ${
                  market.status === 'resolved' ? 'text-gray-500' : 'text-text-tertiary'
                }`}>
                  총 {market.totalAmount.toLocaleString()} DPMM
                </div>
                <div className={`text-xs font-semibold ${
                  market.status === 'resolved' ? 'text-gray-500' : 'text-text-tertiary'
                }`}>
                  {new Date(market.endsAt).toLocaleDateString('ko-KR', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} 마감
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
