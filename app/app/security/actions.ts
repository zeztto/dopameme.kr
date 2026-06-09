'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function deletePasskey(input: { credentialId: string }) {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      success: false,
      error: '로그인이 필요합니다',
    }
  }

  const credentialId = typeof input?.credentialId === 'string'
    ? input.credentialId.trim()
    : ''

  if (!credentialId || credentialId.length > 100) {
    return {
      success: false,
      error: '패스키 정보가 올바르지 않습니다',
    }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, status: true },
  })

  if (!user || user.status !== 'active') {
    return {
      success: false,
      error: '이용할 수 없는 계정입니다',
    }
  }

  await prisma.webAuthnCredential.deleteMany({
    where: {
      id: credentialId,
      userId: user.id,
    },
  })

  revalidatePath('/app/security')

  return {
    success: true,
  }
}
