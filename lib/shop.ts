import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/db'
import { createDpmmLedgerEntry } from '@/lib/dpmm/ledger'

type ShopItemCatalogItem = {
  code: string
  name: string
  description: string
  category: 'profile_theme' | 'badge' | 'emote'
  rarity: 'common' | 'rare' | 'epic'
  priceDpmm: number
  previewText: string
  sortOrder: number
}

type ShopItemLike = ShopItemCatalogItem & {
  id: string
  isActive: boolean
}

type OwnedShopItemLike = {
  id: string
  isEquipped: boolean
  purchasedAt: Date
  item: ShopItemLike
}

export type ShopItemCategory = ShopItemCatalogItem['category']

export type ShopCatalogRow = ShopItemLike & {
  owned: boolean
  equipped: boolean
  purchasedAt: Date | null
  inventoryId: string | null
  affordable: boolean
}

export type ShopOverview = {
  balance: number
  ownedCount: number
  equippedCount: number
  items: ShopCatalogRow[]
  equippedItems: OwnedShopItemLike[]
}

export const SHOP_ITEM_CATALOG: ShopItemCatalogItem[] = [
  {
    code: 'theme_signal_green',
    name: '시그널 그린 테마',
    description: '프로필 Hero에 초록색 성공 시그널 톤을 적용합니다.',
    category: 'profile_theme',
    rarity: 'common',
    priceDpmm: 1200,
    previewText: 'GREEN',
    sortOrder: 10,
  },
  {
    code: 'theme_market_blue',
    name: '마켓 블루 테마',
    description: '프로필 Hero에 차분한 블루 마켓 톤을 적용합니다.',
    category: 'profile_theme',
    rarity: 'rare',
    priceDpmm: 2200,
    previewText: 'BLUE',
    sortOrder: 20,
  },
  {
    code: 'badge_signal_hunter',
    name: '시그널 헌터 배지',
    description: '프로필 이름 옆에 시그널 헌터 배지를 표시합니다.',
    category: 'badge',
    rarity: 'common',
    priceDpmm: 900,
    previewText: 'SIGNAL',
    sortOrder: 30,
  },
  {
    code: 'badge_dopameme_vip',
    name: '도파밈 VIP 배지',
    description: '프로필에 VIP 배지를 표시하는 epic cosmetic입니다.',
    category: 'badge',
    rarity: 'epic',
    priceDpmm: 4500,
    previewText: 'VIP',
    sortOrder: 40,
  },
  {
    code: 'emote_prediction_hit',
    name: '적중 코멘트 이모티콘',
    description: '프로필 cosmetic 영역에 적중 코멘트 문구를 표시합니다.',
    category: 'emote',
    rarity: 'common',
    priceDpmm: 700,
    previewText: '적중',
    sortOrder: 50,
  },
  {
    code: 'emote_market_maker',
    name: '마켓 메이커 이모티콘',
    description: '프로필 cosmetic 영역에 마켓 메이커 문구를 표시합니다.',
    category: 'emote',
    rarity: 'rare',
    priceDpmm: 1600,
    previewText: '메이커',
    sortOrder: 60,
  },
]

export function categoryLabel(category: string) {
  if (category === 'profile_theme') return '프로필 테마'
  if (category === 'badge') return '배지'
  if (category === 'emote') return '이모티콘'
  return category
}

export function rarityLabel(rarity: string) {
  if (rarity === 'epic') return 'EPIC'
  if (rarity === 'rare') return 'RARE'
  return 'COMMON'
}

export function profileThemeClass(code?: string | null) {
  if (code === 'theme_signal_green') return 'border-success/25 bg-success/5'
  if (code === 'theme_market_blue') return 'border-primary/25 bg-primary/5'
  return 'border-primary/20 bg-primary/5'
}

export async function syncShopItems(client: Prisma.TransactionClient | typeof prisma = prisma) {
  for (const item of SHOP_ITEM_CATALOG) {
    await client.shopItem.upsert({
      where: { code: item.code },
      update: {
        name: item.name,
        description: item.description,
        category: item.category,
        rarity: item.rarity,
        priceDpmm: item.priceDpmm,
        previewText: item.previewText,
        sortOrder: item.sortOrder,
        isActive: true,
      },
      create: {
        code: item.code,
        name: item.name,
        description: item.description,
        category: item.category,
        rarity: item.rarity,
        priceDpmm: item.priceDpmm,
        previewText: item.previewText,
        sortOrder: item.sortOrder,
        isActive: true,
      },
    })
  }
}

export async function getShopOverview(userId: string): Promise<ShopOverview> {
  await syncShopItems()

  const [user, items, ownedItems] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { dpmmBalance: true },
    }),
    prisma.shopItem.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { sortOrder: 'asc' }],
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        category: true,
        rarity: true,
        priceDpmm: true,
        previewText: true,
        sortOrder: true,
        isActive: true,
      },
    }),
    prisma.userShopItem.findMany({
      where: { userId },
      select: {
        id: true,
        isEquipped: true,
        purchasedAt: true,
        item: {
          select: {
            id: true,
            code: true,
            name: true,
            description: true,
            category: true,
            rarity: true,
            priceDpmm: true,
            previewText: true,
            sortOrder: true,
            isActive: true,
          },
        },
      },
    }),
  ])

  const balance = user?.dpmmBalance ?? 0
  const normalizedOwnedItems: OwnedShopItemLike[] = ownedItems.map((ownedItem) => ({
    ...ownedItem,
    item: {
      ...ownedItem.item,
      category: ownedItem.item.category as ShopItemCategory,
      rarity: ownedItem.item.rarity as ShopItemCatalogItem['rarity'],
    },
  }))
  const ownedByItemId = new Map(normalizedOwnedItems.map((ownedItem) => [ownedItem.item.id, ownedItem]))

  return {
    balance,
    ownedCount: normalizedOwnedItems.length,
    equippedCount: normalizedOwnedItems.filter((item) => item.isEquipped).length,
    equippedItems: normalizedOwnedItems.filter((item) => item.isEquipped),
    items: items.map((item) => {
      const ownedItem = ownedByItemId.get(item.id)

      return {
        ...item,
        category: item.category as ShopItemCategory,
        rarity: item.rarity as ShopItemCatalogItem['rarity'],
        owned: Boolean(ownedItem),
        equipped: Boolean(ownedItem?.isEquipped),
        purchasedAt: ownedItem?.purchasedAt ?? null,
        inventoryId: ownedItem?.id ?? null,
        affordable: balance >= item.priceDpmm,
      }
    }),
  }
}

export async function getEquippedShopItems(userId: string) {
  return prisma.userShopItem.findMany({
    where: {
      userId,
      isEquipped: true,
      item: { isActive: true },
    },
    orderBy: { purchasedAt: 'asc' },
    select: {
      id: true,
      item: {
        select: {
          id: true,
          code: true,
          name: true,
          description: true,
          category: true,
          rarity: true,
          priceDpmm: true,
          previewText: true,
          sortOrder: true,
          isActive: true,
        },
      },
      isEquipped: true,
      purchasedAt: true,
    },
  })
}

export async function purchaseShopItem(userId: string, itemId: string) {
  try {
    return await prisma.$transaction(async (tx) => {
      await syncShopItems(tx)

      const [user, item, existingOwnedItem] = await Promise.all([
        tx.user.findUnique({
          where: { id: userId },
          select: { id: true, status: true },
        }),
        tx.shopItem.findFirst({
          where: { id: itemId, isActive: true },
          select: {
            id: true,
            code: true,
            name: true,
            category: true,
            priceDpmm: true,
          },
        }),
        tx.userShopItem.findUnique({
          where: {
            userId_itemId: {
              userId,
              itemId,
            },
          },
          select: { id: true },
        }),
      ])

      if (!user || user.status !== 'active') {
        throw new Error('활성 사용자만 아이템을 구매할 수 있습니다')
      }

      if (!item) {
        throw new Error('구매할 수 없는 아이템입니다')
      }

      if (existingOwnedItem) {
        return { status: 'already_owned' as const, itemId: item.id }
      }

      const inventoryItem = await tx.userShopItem.create({
        data: {
          userId,
          itemId: item.id,
        },
        select: { id: true },
      })

      const debit = await tx.user.updateMany({
        where: {
          id: userId,
          status: 'active',
          dpmmBalance: { gte: item.priceDpmm },
        },
        data: {
          dpmmBalance: { decrement: item.priceDpmm },
        },
      })

      if (debit.count !== 1) {
        throw new Error('DPMM 잔액이 부족합니다')
      }

      const updatedUser = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { dpmmBalance: true },
      })

      await createDpmmLedgerEntry(tx, {
        userId,
        type: 'item_purchase',
        delta: -item.priceDpmm,
        balanceAfter: updatedUser.dpmmBalance,
        reason: `${item.name} 구매`,
        sourceType: 'shop_item',
        sourceId: item.id,
      })

      return {
        status: 'purchased' as const,
        itemId: item.id,
        inventoryItemId: inventoryItem.id,
      }
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { status: 'already_owned' as const, itemId }
    }

    throw error
  }
}

export async function equipShopItem(userId: string, itemId: string) {
  return prisma.$transaction(async (tx) => {
    const ownedItem = await tx.userShopItem.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId,
        },
      },
      select: {
        id: true,
        itemId: true,
        item: {
          select: {
            category: true,
            isActive: true,
          },
        },
      },
    })

    if (!ownedItem || !ownedItem.item.isActive) {
      throw new Error('보유한 아이템만 장착할 수 있습니다')
    }

    await tx.userShopItem.updateMany({
      where: {
        userId,
        item: {
          category: ownedItem.item.category,
        },
      },
      data: { isEquipped: false },
    })

    await tx.userShopItem.update({
      where: { id: ownedItem.id },
      data: { isEquipped: true },
    })

    return {
      status: 'equipped' as const,
      itemId: ownedItem.itemId,
      category: ownedItem.item.category,
    }
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  })
}
