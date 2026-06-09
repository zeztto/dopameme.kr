import { auth } from '@/auth'
import Header from '@/components/Header'
import { prisma } from '@/lib/db'
import { getWebPushPublicKey } from '@/lib/push'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import NotificationControls from './NotificationControls'
import PushNotificationSettings from './PushNotificationSettings'

export const dynamic = 'force-dynamic'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function notificationTypeLabel(type: string) {
  if (type === 'new_follower') return '팔로우'
  if (type === 'market_comment') return '댓글'
  if (type === 'position_sold') return '거래'
  return '알림'
}

function notificationTypeClass(type: string) {
  if (type === 'new_follower') return 'bg-primary text-white'
  if (type === 'market_comment') return 'bg-secondary text-white'
  if (type === 'position_sold') return 'bg-success text-white'
  return 'bg-light-bg-alt text-text-secondary'
}

function displayActor(actor: { name: string | null } | null) {
  return actor?.name || '도파밈 유저'
}

export default async function NotificationsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      status: true,
      dpmmBalance: true,
    },
  })

  if (!currentUser || currentUser.status !== 'active') {
    redirect('/login')
  }

  const [notifications, unreadCount, enabledPushSubscriptionCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: currentUser.id },
      take: 50,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        targetPath: true,
        readAt: true,
        createdAt: true,
        actor: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.notification.count({
      where: {
        userId: currentUser.id,
        readAt: null,
      },
    }),
    prisma.pushSubscription.count({
      where: {
        userId: currentUser.id,
        enabled: true,
      },
    }),
  ])
  const webPushPublicKey = getWebPushPublicKey()

  return (
    <div className="min-h-screen bg-white">
      <Header
        userBalance={currentUser.dpmmBalance}
        unreadNotificationCount={unreadCount}
      />

      <main className="container mx-auto px-4 py-20">
        <section className="mb-12 text-center">
          <div className="mb-6 inline-block">
            <span className="rounded-dopameme-pill bg-primary px-8 py-3 text-sm font-black text-white shadow-token-brand">
              알림
            </span>
          </div>
          <h1 className="mb-4 text-5xl font-black text-text-primary">
            놓치지 말아야 할 활동
          </h1>
          <p className="text-xl font-medium text-text-secondary">
            팔로우와 마켓 토론 알림을 확인합니다
          </p>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-dopameme-lg border-3 border-primary/25 bg-primary/5 p-6 shadow-token-sm">
            <div className="text-sm font-black text-text-tertiary">읽지 않은 알림</div>
            <div className="mt-3 text-3xl font-black text-primary">
              {unreadCount.toLocaleString()}
            </div>
            <div className="mt-2 text-sm font-bold text-text-secondary">
              현재 계정 기준
            </div>
          </div>
          <div className="rounded-dopameme-lg border-3 border-light-border bg-white p-6 shadow-token-sm">
            <div className="text-sm font-black text-text-tertiary">최근 알림</div>
            <div className="mt-3 text-3xl font-black text-text-primary">
              {notifications.length.toLocaleString()}
            </div>
            <div className="mt-2 text-sm font-bold text-text-secondary">
              최대 50개 표시
            </div>
          </div>
        </section>

        <PushNotificationSettings
          publicKey={webPushPublicKey}
          enabledSubscriptionCount={enabledPushSubscriptionCount}
        />

        <section className="overflow-hidden rounded-dopameme-xl border-3 border-light-border bg-white shadow-token-md">
          <div className="flex flex-col gap-3 border-b-3 border-light-border bg-light-bg-alt px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-text-primary">알림함</h2>
              <p className="mt-1 text-sm font-semibold text-text-tertiary">
                새 팔로워와 내가 만든 마켓의 댓글 기준
              </p>
            </div>
            {unreadCount > 0 && (
              <NotificationControls mode="all" />
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <h3 className="text-2xl font-black text-text-primary">
                아직 알림이 없습니다
              </h3>
              <p className="mt-3 text-base font-semibold text-text-secondary">
                팔로우나 마켓 댓글 활동이 발생하면 이곳에 표시됩니다.
              </p>
            </div>
          ) : (
            <div className="divide-y-2 divide-light-border">
              {notifications.map((notification) => {
                const content = (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-dopameme-pill px-3 py-1 text-xs font-black ${notificationTypeClass(notification.type)}`}>
                        {notificationTypeLabel(notification.type)}
                      </span>
                      {!notification.readAt && (
                        <span className="rounded-dopameme-pill bg-success/10 px-3 py-1 text-xs font-black text-success">
                          새 알림
                        </span>
                      )}
                      <span className="text-xs font-bold text-text-tertiary">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <h3 className="mt-3 text-lg font-black text-text-primary">
                      {notification.title}
                    </h3>
                    <p className="mt-2 text-sm font-semibold text-text-secondary">
                      {displayActor(notification.actor)}
                      {notification.body ? ` · ${notification.body}` : ''}
                    </p>
                  </>
                )

                return (
                  <div
                    key={notification.id}
                    className={`grid gap-4 px-5 py-5 md:grid-cols-[1fr_auto] md:items-start ${
                      notification.readAt ? 'bg-white' : 'bg-primary/5'
                    }`}
                  >
                    {notification.targetPath ? (
                      <Link
                        href={notification.targetPath}
                        className="block min-w-0 transition hover:text-primary"
                      >
                        {content}
                      </Link>
                    ) : (
                      <div className="min-w-0">{content}</div>
                    )}

                    {!notification.readAt && (
                      <NotificationControls
                        mode="single"
                        notificationId={notification.id}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
