import { auth } from '@/auth'
import Header from '@/components/Header'
import { prisma } from '@/lib/db'
import { getUnreadNotificationCount } from '@/lib/notifications'
import { redirect } from 'next/navigation'
import WalletClient from './WalletClient'

export default async function WalletPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const [dbUser, unreadNotificationCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, dpmmBalance: true, status: true },
    }),
    getUnreadNotificationCount(session.user.id),
  ])

  if (!dbUser || dbUser.status !== 'active') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-light-bg-alt">
      <Header
        userBalance={dbUser.dpmmBalance}
        unreadNotificationCount={unreadNotificationCount}
      />

      <main className="container mx-auto px-4 py-12">
        <WalletClient />
      </main>
    </div>
  )
}
