import { auth } from '@/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function isAdmin() {
  const session = await auth()

  if (!session?.user?.id) {
    return false
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  return user?.role === 'admin'
}

export async function requireAdmin() {
  const admin = await isAdmin()

  if (!admin) {
    throw new Error('관리자 권한이 필요합니다')
  }

  return true
}
