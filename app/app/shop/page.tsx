import { auth } from '@/auth'
import Header from '@/components/Header'
import { prisma } from '@/lib/db'
import { getUnreadNotificationCount } from '@/lib/notifications'
import { categoryLabel, getShopOverview, rarityLabel } from '@/lib/shop'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { equipShopItemAction, purchaseShopItemAction } from './actions'

export const dynamic = 'force-dynamic'

type Tone = 'primary' | 'secondary' | 'success' | 'warning' | 'neutral'

function toneClass(tone: Tone) {
  return {
    primary: 'border-primary/25 bg-primary/5 text-primary',
    secondary: 'border-secondary/25 bg-secondary/5 text-secondary',
    success: 'border-success/25 bg-success/5 text-success',
    warning: 'border-warning/25 bg-warning/5 text-warning',
    neutral: 'border-light-border bg-white text-text-primary',
  }[tone]
}

function categoryTone(category: string): Tone {
  if (category === 'profile_theme') return 'primary'
  if (category === 'badge') return 'secondary'
  if (category === 'emote') return 'success'
  return 'neutral'
}

function rarityClass(rarity: string) {
  if (rarity === 'epic') return 'border-secondary bg-secondary text-white'
  if (rarity === 'rare') return 'border-primary bg-primary text-white'
  return 'border-light-border bg-white text-text-tertiary'
}

function StatCard({
  label,
  value,
  helper,
  tone = 'neutral',
}: {
  label: string
  value: string
  helper: string
  tone?: Tone
}) {
  return (
    <div className={`rounded-dopameme-lg border-3 p-5 shadow-token-sm ${toneClass(tone)}`}>
      <div className="text-sm font-black text-text-tertiary">{label}</div>
      <div className="mt-3 text-2xl font-black">{value}</div>
      <div className="mt-2 text-sm font-bold text-text-secondary">{helper}</div>
    </div>
  )
}

export default async function ShopPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      status: true,
      dpmmBalance: true,
    },
  })

  if (!currentUser || currentUser.status !== 'active') {
    redirect('/login')
  }

  const [overview, unreadNotificationCount] = await Promise.all([
    getShopOverview(currentUser.id),
    getUnreadNotificationCount(currentUser.id),
  ])
  const categories = ['profile_theme', 'badge', 'emote']

  return (
    <div className="min-h-screen bg-white">
      <Header
        userBalance={currentUser.dpmmBalance}
        unreadNotificationCount={unreadNotificationCount}
      />

      <main className="container mx-auto px-4 py-20">
        <section className="mb-12 text-center">
          <div className="mb-6 inline-block">
            <span className="rounded-dopameme-pill bg-primary px-8 py-3 text-sm font-black text-white shadow-token-brand">
              아이템샵
            </span>
          </div>
          <h1 className="mb-4 text-5xl font-black text-text-primary">
            프로필을 꾸미는 DPMM 상점
          </h1>
          <p className="text-xl font-medium text-text-secondary">
            테마, 배지, 이모티콘을 구매하고 프로필에 장착합니다
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="보유 DPMM"
            value={overview.balance.toLocaleString()}
            helper="구매 가능 장부 잔액"
            tone="primary"
          />
          <StatCard
            label="보유 아이템"
            value={overview.ownedCount.toLocaleString()}
            helper={`전체 ${overview.items.length.toLocaleString()}개 중`}
            tone="success"
          />
          <StatCard
            label="장착 중"
            value={overview.equippedCount.toLocaleString()}
            helper="카테고리별 최대 1개"
            tone="secondary"
          />
          <StatCard
            label="미보유"
            value={(overview.items.length - overview.ownedCount).toLocaleString()}
            helper="구매 가능한 cosmetic"
            tone="warning"
          />
        </section>

        <section className="mb-12 rounded-dopameme-xl border-3 border-light-border bg-white p-6 shadow-token-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-text-primary">장착 중인 아이템</h2>
              <p className="mt-2 text-sm font-semibold text-text-secondary">
                장착 상태는 공개 프로필에서 표시됩니다.
              </p>
            </div>
            <Link
              href={`/users/${currentUser.id}`}
              className="rounded-dopameme-pill border-3 border-primary bg-white px-6 py-3 text-center text-sm font-black text-primary transition hover:bg-primary hover:text-white"
            >
              프로필 보기
            </Link>
          </div>

          {overview.equippedItems.length === 0 ? (
            <div className="mt-6 rounded-dopameme-lg border-3 border-dashed border-light-border bg-light-bg-alt px-5 py-8 text-center text-sm font-semibold text-text-secondary">
              아직 장착한 아이템이 없습니다.
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {overview.equippedItems.map((ownedItem) => (
                <div
                  key={ownedItem.id}
                  className={`rounded-dopameme-lg border-3 p-5 shadow-token-sm ${toneClass(categoryTone(ownedItem.item.category))}`}
                >
                  <div className="text-xs font-black text-text-tertiary">
                    {categoryLabel(ownedItem.item.category)}
                  </div>
                  <div className="mt-2 text-xl font-black">{ownedItem.item.name}</div>
                  <div className="mt-3 inline-flex rounded-dopameme-pill bg-white px-4 py-2 text-sm font-black text-text-primary">
                    {ownedItem.item.previewText}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {categories.map((category) => {
          const categoryItems = overview.items.filter((item) => item.category === category)

          return (
            <section key={category} className="mb-12">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-text-primary">
                    {categoryLabel(category)}
                  </h2>
                  <p className="mt-2 text-sm font-semibold text-text-secondary">
                    {category === 'profile_theme'
                      ? '프로필 Hero 배경 톤을 바꿉니다.'
                      : category === 'badge'
                        ? '프로필 이름 옆에 표시할 배지를 선택합니다.'
                        : '프로필 cosmetic 영역에 짧은 표현을 표시합니다.'}
                  </p>
                </div>
                <div className="text-sm font-black text-text-tertiary">
                  {categoryItems.filter((item) => item.owned).length.toLocaleString()} / {categoryItems.length.toLocaleString()} 보유
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {categoryItems.map((item) => (
                  <article
                    key={item.id}
                    className={`overflow-hidden rounded-dopameme-xl border-3 bg-white shadow-token-md ${
                      item.equipped ? 'border-primary' : 'border-light-border'
                    }`}
                  >
                    <div className={`border-b-3 p-6 ${toneClass(categoryTone(item.category))}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-black text-text-tertiary">
                            {categoryLabel(item.category)}
                          </div>
                          <h3 className="mt-2 text-xl font-black text-text-primary">
                            {item.name}
                          </h3>
                        </div>
                        <span className={`rounded-dopameme-pill border px-3 py-1 text-xs font-black ${rarityClass(item.rarity)}`}>
                          {rarityLabel(item.rarity)}
                        </span>
                      </div>
                      <div className="mt-6 inline-flex min-h-12 items-center rounded-dopameme-pill border-3 border-light-border bg-white px-5 py-2 text-lg font-black text-text-primary">
                        {item.previewText}
                      </div>
                    </div>

                    <div className="p-6">
                      <p className="min-h-12 text-sm font-semibold leading-6 text-text-secondary">
                        {item.description}
                      </p>
                      <div className="mt-5 flex items-center justify-between gap-4">
                        <div>
                          <div className="text-xs font-black text-text-tertiary">가격</div>
                          <div className="mt-1 text-2xl font-black text-secondary">
                            {item.priceDpmm.toLocaleString()} DPMM
                          </div>
                        </div>
                        {item.equipped ? (
                          <span className="rounded-dopameme-pill bg-success px-5 py-3 text-sm font-black text-white">
                            장착됨
                          </span>
                        ) : item.owned ? (
                          <form action={equipShopItemAction}>
                            <input type="hidden" name="itemId" value={item.id} />
                            <button
                              type="submit"
                              className="rounded-dopameme-pill bg-primary px-5 py-3 text-sm font-black text-white shadow-token-md transition hover:bg-primary-dark"
                            >
                              장착
                            </button>
                          </form>
                        ) : (
                          <form action={purchaseShopItemAction}>
                            <input type="hidden" name="itemId" value={item.id} />
                            <button
                              type="submit"
                              disabled={!item.affordable}
                              className="rounded-dopameme-pill bg-secondary px-5 py-3 text-sm font-black text-white shadow-token-md transition hover:bg-secondary-dark disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              구매
                            </button>
                          </form>
                        )}
                      </div>
                      {!item.owned && !item.affordable && (
                        <div className="mt-4 rounded-dopameme-md bg-light-bg-alt px-3 py-2 text-xs font-bold text-text-tertiary">
                          잔액이 부족합니다.
                        </div>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )
        })}

        <section className="rounded-dopameme-xl border-3 border-light-border bg-white p-6 shadow-token-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-text-primary">다음 행동</h2>
              <p className="mt-2 text-sm font-semibold text-text-secondary">
                DPMM은 예측 참여, 레벨 보상, 시즌 경쟁으로 확보할 수 있습니다.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/markets"
                className="rounded-dopameme-pill bg-secondary px-6 py-3 text-center text-sm font-black text-white shadow-token-md transition hover:bg-secondary-dark"
              >
                예측 시장
              </Link>
              <Link
                href="/app/level"
                className="rounded-dopameme-pill border-3 border-primary bg-white px-6 py-3 text-center text-sm font-black text-primary transition hover:bg-primary hover:text-white"
              >
                레벨
              </Link>
              <Link
                href="/app/seasons"
                className="rounded-dopameme-pill border-3 border-primary bg-white px-6 py-3 text-center text-sm font-black text-primary transition hover:bg-primary hover:text-white"
              >
                시즌
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
