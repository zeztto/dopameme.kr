import { prisma } from '@/lib/db'
import { ACHIEVEMENT_CATALOG, syncAchievementDefinitions } from '@/lib/achievements'
import { LEVEL_DEFINITIONS, syncLevelDefinitions } from '@/lib/levels'
import { syncSeasonEvents } from '@/lib/seasons'
import { SHOP_ITEM_CATALOG, syncShopItems } from '@/lib/shop'
import { normalizeEmail } from '@/lib/validation'
import { seedMockMarkets } from '@/scripts/generate-markets'
import bcrypt from 'bcryptjs'

function requireEnv(name: string) {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new Error(`${name} is required for database seed`)
  }

  return value
}

async function main() {
  const adminEmail = normalizeEmail(requireEnv('SEED_ADMIN_EMAIL'))
  const adminPassword = requireEnv('SEED_ADMIN_PASSWORD')
  const adminName = process.env.SEED_ADMIN_NAME?.trim() || 'dopameme-admin'

  if (adminPassword.length < 12) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 12 characters')
  }

  await prisma.user.upsert({
    where: { id: 'fee-burn-account' },
    update: {},
    create: {
      id: 'fee-burn-account',
      email: 'fee-burn@dopameme.local',
      name: 'fee-burn-account',
      role: 'system',
      status: 'active',
      dpmmBalance: 0,
    },
  })

  const hashedPassword = await bcrypt.hash(adminPassword, 12)
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
    select: { id: true },
  })

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
    },
    create: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      dpmmBalance: 10000,
      emailVerified: new Date(),
    },
  })

  if (!existingAdmin) {
    await prisma.dpmmLedgerTransaction.create({
      data: {
        userId: admin.id,
        type: 'welcome_bonus',
        delta: 10000,
        balanceAfter: 10000,
        reason: 'Seed admin welcome bonus',
        sourceType: 'seed',
        sourceId: 'admin-bootstrap',
      },
    })
  }

  const result = await seedMockMarkets(admin.id)
  await syncAchievementDefinitions()
  await syncLevelDefinitions()
  await syncSeasonEvents()
  await syncShopItems()

  console.log(
    `Seed complete: admin=${admin.email}, markets_created=${result.createdCount}, markets_existing=${result.existingCount}, markets_total=${result.totalCount}, achievements=${ACHIEVEMENT_CATALOG.length}, levels=${LEVEL_DEFINITIONS.length}, seasons=2, shop_items=${SHOP_ITEM_CATALOG.length}`
  )
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
