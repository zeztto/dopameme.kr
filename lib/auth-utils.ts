import { auth } from '@/auth'
import { prisma } from '@/lib/db'

export async function isAdmin() {
  const session = await auth()

  if (!session?.user?.id) {
    return false
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  return user?.role === 'admin'
}

export async function requireAdmin() {
  const admin = await isAdmin()

  if (!admin) {
    throw new Error('관리자 권한이 필요합니다')
  }

  return true
}
