'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { equipShopItem, purchaseShopItem } from '@/lib/shop'
import { revalidatePath } from 'next/cache'

async function requireActiveUserId() {
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
    throw new Error('활성 사용자만 아이템샵을 사용할 수 있습니다')
  }

  return user.id
}

function itemIdFromForm(formData: FormData) {
  const itemId = String(formData.get('itemId') || '').trim()

  if (!itemId) {
    throw new Error('아이템 ID가 필요합니다')
  }

  return itemId
}

function revalidateShopViews(userId: string) {
  revalidatePath('/app/shop')
  revalidatePath('/app')
  revalidatePath(`/users/${userId}`)
  revalidatePath('/leaderboard')
}

export async function purchaseShopItemAction(formData: FormData) {
  const userId = await requireActiveUserId()
  const itemId = itemIdFromForm(formData)

  await purchaseShopItem(userId, itemId)
  revalidateShopViews(userId)
}

export async function equipShopItemAction(formData: FormData) {
  const userId = await requireActiveUserId()
  const itemId = itemIdFromForm(formData)

  await equipShopItem(userId, itemId)
  revalidateShopViews(userId)
}
