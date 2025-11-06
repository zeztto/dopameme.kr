'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { markets } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

export async function toggleMarketHidden(marketId: string) {
  try {
    // 관리자 권한 확인
    await requireAdmin()

    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: '로그인이 필요합니다',
      }
    }

    // 마켓 존재 확인
    const [market] = await db
      .select()
      .from(markets)
      .where(eq(markets.id, marketId))
      .limit(1)

    if (!market) {
      return {
        success: false,
        error: '마켓을 찾을 수 없습니다',
      }
    }

    // hidden 상태 토글
    const newHiddenState = !market.hidden

    await db
      .update(markets)
      .set({
        hidden: newHiddenState,
      })
      .where(eq(markets.id, marketId))

    // 캐시 재검증
    revalidatePath(`/markets/${marketId}`)
    revalidatePath('/markets')
    revalidatePath('/app')
    revalidatePath(`/admin/markets/${marketId}`)

    return {
      success: true,
      hidden: newHiddenState,
    }
  } catch (error) {
    console.error('Toggle market hidden error:', error)

    if (error instanceof Error && error.message === '관리자 권한이 필요합니다') {
      return {
        success: false,
        error: '관리자 권한이 필요합니다',
      }
    }

    return {
      success: false,
      error: '예측 가리기/보이기 처리 중 오류가 발생했습니다',
    }
  }
}
