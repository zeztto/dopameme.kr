import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const timestamp = new Date().toISOString()

  try {
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      ok: true,
      service: 'dopameme-kr',
      database: 'ok',
      timestamp,
    })
  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json(
      {
        ok: false,
        service: 'dopameme-kr',
        database: 'unavailable',
        timestamp,
      },
      { status: 503 }
    )
  }
}
