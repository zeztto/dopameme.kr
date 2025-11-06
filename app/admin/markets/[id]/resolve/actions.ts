'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { markets, marketOptions, predictions, users } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

export async function resolveMarket(formData: {
  marketId: string
  winningOptionId: string
}) {
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

    // 마켓 존재 및 상태 확인
    const [market] = await db
      .select()
      .from(markets)
      .where(eq(markets.id, formData.marketId))
      .limit(1)

    if (!market) {
      return {
        success: false,
        error: '마켓을 찾을 수 없습니다',
      }
    }

    if (market.status === 'resolved') {
      return {
        success: false,
        error: '이미 결과가 확정된 마켓입니다',
      }
    }

    // 옵션 유효성 확인
    const [winningOption] = await db
      .select()
      .from(marketOptions)
      .where(eq(marketOptions.id, formData.winningOptionId))
      .limit(1)

    if (!winningOption || winningOption.marketId !== formData.marketId) {
      return {
        success: false,
        error: '유효하지 않은 선택지입니다',
      }
    }

    // 모든 옵션 정보 가져오기
    const allOptions = await db
      .select()
      .from(marketOptions)
      .where(eq(marketOptions.marketId, formData.marketId))

    const totalBetAmount = allOptions.reduce((sum, opt) => sum + opt.totalAmount, 0)
    const winningTotalAmount = winningOption.totalAmount

    if (totalBetAmount === 0) {
      return {
        success: false,
        error: '베팅이 없는 마켓은 확정할 수 없습니다',
      }
    }

    // 승리한 선택지에 베팅한 사용자들 조회
    const winnerPredictions = await db
      .select()
      .from(predictions)
      .where(eq(predictions.optionId, formData.winningOptionId))

    // 패배한 선택지들에 베팅한 사용자들 조회
    const loserOptions = allOptions.filter((opt) => opt.id !== formData.winningOptionId)
    const loserPredictions = await db
      .select()
      .from(predictions)
      .where(
        sql`${predictions.marketId} = ${formData.marketId} AND ${predictions.optionId} != ${formData.winningOptionId}`
      )

    // 트랜잭션으로 결과 확정 및 보상 지급
    let totalFees = 0
    await db.transaction(async (tx) => {
      // 1. 마켓 상태 업데이트
      await tx
        .update(markets)
        .set({
          status: 'resolved',
          resolvedAt: new Date(),
          winningOptionId: formData.winningOptionId,
        })
        .where(eq(markets.id, formData.marketId))

      // 2. 승리자들에게 보상 지급 (1% 수수료 공제)
      for (const prediction of winnerPredictions) {
        // 보상 계산: (개인 베팅액 / 승리 선택지 총액) * 전체 베팅액
        const grossPayout = Math.floor((prediction.amount / winningTotalAmount) * totalBetAmount)

        // 1% 수수료 계산 (소수점 버림)
        const fee = Math.floor(grossPayout * 0.01)

        // 실제 지급액 (수수료 공제)
        const netPayout = grossPayout - fee

        totalFees += fee

        // 예측 레코드 업데이트
        await tx
          .update(predictions)
          .set({
            resolved: 1, // 승리
            payout: netPayout,
          })
          .where(eq(predictions.id, prediction.id))

        // 사용자에게 보상 지급
        await tx
          .update(users)
          .set({
            dpmBalance: sql`${users.dpmBalance} + ${netPayout}`,
          })
          .where(eq(users.id, prediction.userId))
      }

      // 3. 수수료를 수수료 소각 계정에 입금
      if (totalFees > 0) {
        await tx
          .update(users)
          .set({
            dpmBalance: sql`${users.dpmBalance} + ${totalFees}`,
          })
          .where(eq(users.id, 'fee-burn-account'))
      }

      // 4. 패배자 예측 레코드 업데이트
      for (const prediction of loserPredictions) {
        await tx
          .update(predictions)
          .set({
            resolved: -1, // 패배
            payout: 0,
          })
          .where(eq(predictions.id, prediction.id))
      }
    })

    // 캐시 재검증
    revalidatePath(`/markets/${formData.marketId}`)
    revalidatePath('/markets')
    revalidatePath('/app')

    return {
      success: true,
      winnersCount: winnerPredictions.length,
      losersCount: loserPredictions.length,
      totalPayout: totalBetAmount,
    }
  } catch (error) {
    console.error('Market resolution error:', error)

    if (error instanceof Error && error.message === '관리자 권한이 필요합니다') {
      return {
        success: false,
        error: '관리자 권한이 필요합니다',
      }
    }

    return {
      success: false,
      error: '마켓 결과 확정 중 오류가 발생했습니다',
    }
  }
}
