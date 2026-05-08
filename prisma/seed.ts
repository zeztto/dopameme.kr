import { prisma } from '@/lib/db'
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
      dpmmBalance: 0,
    },
  })

  const hashedPassword = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: adminName,
      password: hashedPassword,
      role: 'admin',
    },
    create: {
      email: adminEmail,
      name: adminName,
      password: hashedPassword,
      role: 'admin',
      dpmmBalance: 10000,
      emailVerified: new Date(),
    },
  })

  const result = await seedMockMarkets(admin.id)

  console.log(
    `Seed complete: admin=${admin.email}, markets_created=${result.createdCount}, markets_existing=${result.existingCount}, markets_total=${result.totalCount}`
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
