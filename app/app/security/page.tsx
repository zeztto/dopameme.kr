import { auth } from '@/auth'
import Header from '@/components/Header'
import { prisma } from '@/lib/db'
import { getUnreadNotificationCount } from '@/lib/notifications'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import DeletePasskeyButton from './DeletePasskeyButton'
import PasskeyRegistrationCard from './PasskeyRegistrationCard'

export const dynamic = 'force-dynamic'

function formatDate(date: Date | null) {
  if (!date) return '-'

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export default async function SecurityPage() {
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
      webAuthnCredentials: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          deviceType: true,
          backedUp: true,
          createdAt: true,
          lastUsedAt: true,
        },
      },
    },
  })

  if (!currentUser || currentUser.status !== 'active') {
    redirect('/login')
  }

  const unreadNotificationCount = await getUnreadNotificationCount(currentUser.id)

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
              보안
            </span>
          </div>
          <h1 className="mb-4 text-5xl font-black text-text-primary">
            계정 보안
          </h1>
          <p className="text-xl font-medium text-text-secondary">
            패스키를 등록해 생체 인증 로그인을 사용할 수 있습니다
          </p>
        </section>

        <div className="mx-auto max-w-4xl space-y-8">
          <PasskeyRegistrationCard credentialCount={currentUser.webAuthnCredentials.length} />

          <section className="overflow-hidden rounded-dopameme-xl border-3 border-light-border bg-white shadow-token-md">
            <div className="border-b-3 border-light-border bg-light-bg-alt px-5 py-4">
              <h2 className="text-xl font-black text-text-primary">등록된 패스키</h2>
              <p className="mt-1 text-sm font-semibold text-text-tertiary">
                이 계정으로 로그인할 수 있는 브라우저/기기 인증 정보입니다
              </p>
            </div>

            {currentUser.webAuthnCredentials.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <h3 className="text-2xl font-black text-text-primary">
                  등록된 패스키가 없습니다
                </h3>
                <p className="mt-3 text-base font-semibold text-text-secondary">
                  현재 기기에서 패스키를 등록하면 다음 로그인부터 사용할 수 있습니다.
                </p>
              </div>
            ) : (
              <div className="divide-y-2 divide-light-border">
                {currentUser.webAuthnCredentials.map((credential) => (
                  <div
                    key={credential.id}
                    className="grid gap-4 px-5 py-5 md:grid-cols-[1fr_auto] md:items-start"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-dopameme-pill bg-primary/10 px-3 py-1 text-xs font-black text-primary">
                          {credential.deviceType || 'passkey'}
                        </span>
                        {credential.backedUp && (
                          <span className="rounded-dopameme-pill bg-success/10 px-3 py-1 text-xs font-black text-success">
                            동기화됨
                          </span>
                        )}
                      </div>
                      <h3 className="mt-3 text-lg font-black text-text-primary">
                        {credential.name || '패스키'}
                      </h3>
                      <p className="mt-2 text-sm font-semibold text-text-secondary">
                        등록 {formatDate(credential.createdAt)} · 마지막 사용 {formatDate(credential.lastUsedAt)}
                      </p>
                    </div>
                    <DeletePasskeyButton credentialId={credential.id} />
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="text-center">
            <Link
              href="/app"
              className="inline-flex rounded-dopameme-pill border-2 border-primary px-6 py-3 text-sm font-black text-primary transition hover:bg-primary hover:text-white"
            >
              내 활동으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
