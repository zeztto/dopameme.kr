'use server'

import { auth } from '@/auth'
import { evaluateUserAchievements } from '@/lib/achievements'
import { prisma } from '@/lib/db'
import { claimLevelRewards } from '@/lib/levels'
import { revalidatePath } from 'next/cache'

export async function claimLevelRewardsAction() {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error('로그인이 필요합니다')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      status: true,
    },
  })

  if (!user || user.status !== 'active') {
    throw new Error('활성 사용자만 레벨 보상을 받을 수 있습니다')
  }

  await evaluateUserAchievements(user.id)
  await claimLevelRewards(user.id)

  revalidatePath('/app/level')
  revalidatePath('/app')
}
