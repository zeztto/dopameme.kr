'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { markets } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteMarket(marketId: string) {
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

    // hidden 상태가 아니면 삭제 불가
    if (!market.hidden) {
      return {
        success: false,
        error: '가려진 예측만 삭제할 수 있습니다. 먼저 예측을 가려주세요.',
      }
    }

    // 마켓 삭제 (CASCADE로 관련 데이터도 자동 삭제됨)
    await db
      .delete(markets)
      .where(eq(markets.id, marketId))

    // 캐시 재검증
    revalidatePath('/markets')
    revalidatePath('/app')

    return {
      success: true,
      redirectTo: '/markets',
    }
  } catch (error) {
    console.error('Delete market error:', error)

    if (error instanceof Error && error.message === '관리자 권한이 필요합니다') {
      return {
        success: false,
        error: '관리자 권한이 필요합니다',
      }
    }

    return {
      success: false,
      error: '예측 삭제 중 오류가 발생했습니다',
    }
  }
}
