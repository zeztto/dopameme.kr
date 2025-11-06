'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { users, predictions, marketOptions, markets } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export async function placePrediction(formData: {
  marketId: string
  optionId: string
  amount: number
}) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: '로그인이 필요합니다',
      }
    }

    // 금액 검증
    if (formData.amount < 100) {
      return {
        success: false,
        error: '최소 베팅 금액은 100 DPM입니다',
      }
    }

    if (formData.amount > 10000) {
      return {
        success: false,
        error: '최대 베팅 금액은 10,000 DPM입니다',
      }
    }

    // 사용자 잔액 확인
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    if (!user || user.dpmBalance < formData.amount) {
      return {
        success: false,
        error: 'DPM 잔액이 부족합니다',
      }
    }

    // 마켓 상태 확인
    const [market] = await db
      .select()
      .from(markets)
      .where(eq(markets.id, formData.marketId))
      .limit(1)

    if (!market || market.status !== 'active') {
      return {
        success: false,
        error: '현재 참여할 수 없는 마켓입니다',
      }
    }

    // 마켓 마감 시간 확인
    if (new Date() > new Date(market.endsAt)) {
      return {
        success: false,
        error: '마감된 마켓입니다',
      }
    }

    // 이미 이 마켓에 베팅했는지 확인 (중복 베팅 방지)
    const existingPrediction = await db
      .select()
      .from(predictions)
      .where(
        sql`${predictions.userId} = ${session.user.id} AND ${predictions.marketId} = ${formData.marketId}`
      )
      .limit(1)

    if (existingPrediction.length > 0) {
      return {
        success: false,
        error: '이미 이 마켓에 참여하셨습니다. 한 마켓당 하나의 포지션만 가질 수 있습니다.',
      }
    }

    // 트랜잭션: 예측 생성 + 사용자 잔액 차감 + 옵션 통계 업데이트
    await db.transaction(async (tx) => {
      // 1. 예측 생성
      await tx.insert(predictions).values({
        userId: session.user.id as string,
        marketId: formData.marketId,
        optionId: formData.optionId,
        amount: formData.amount,
      })

      // 2. 사용자 잔액 차감
      await tx
        .update(users)
        .set({
          dpmBalance: sql`${users.dpmBalance} - ${formData.amount}`,
        })
        .where(eq(users.id, session.user.id as string))

      // 3. 옵션 통계 업데이트
      await tx
        .update(marketOptions)
        .set({
          totalPredictions: sql`${marketOptions.totalPredictions} + 1`,
          totalAmount: sql`${marketOptions.totalAmount} + ${formData.amount}`,
        })
        .where(eq(marketOptions.id, formData.optionId))
    })

    // 페이지 재검증
    revalidatePath(`/markets/${formData.marketId}`)
    revalidatePath('/markets')
    revalidatePath('/app')

    return {
      success: true,
      message: `${formData.amount.toLocaleString()} DPM을 성공적으로 베팅했습니다!`,
    }
  } catch (error) {
    console.error('Prediction error:', error)
    return {
      success: false,
      error: '예측 참여 중 오류가 발생했습니다',
    }
  }
}
