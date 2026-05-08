import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import AdminSidebar from './AdminSidebar'

export const metadata: Metadata = {
  title: '관리자',
  robots: {
    index: false,
    follow: false,
  },
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      role: true,
    },
  })

  if (user?.role !== 'admin') {
    redirect('/markets')
  }

  return (
    <div className="min-h-screen bg-light-bg-alt text-text-primary">
      <div className="lg:flex lg:min-h-screen">
        <div className="lg:shrink-0">
          <AdminSidebar
            userName={user.name || 'Admin'}
            userEmail={user.email || session.user.email || ''}
          />
        </div>
        <main className="min-w-0 flex-1 px-5 py-6 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

