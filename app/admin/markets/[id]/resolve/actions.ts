'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-utils'
import { Prisma } from '@prisma/client'
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

    // 트랜잭션으로 결과 확정 및 보상 지급
    const result = await prisma.$transaction(async (tx) => {
      // 마켓 존재 및 상태 확인
      const market = await tx.market.findUnique({
        where: { id: formData.marketId },
        select: { id: true, status: true },
      })

      if (!market) {
        throw new Error('MARKET_NOT_FOUND')
      }

      if (market.status === 'resolved') {
        throw new Error('ALREADY_RESOLVED')
      }

      // 옵션 유효성 확인
      const winningOption = await tx.marketOption.findFirst({
        where: {
          id: formData.winningOptionId,
          marketId: formData.marketId,
        },
      })

      if (!winningOption) {
        throw new Error('INVALID_OPTION')
      }

      const transition = await tx.market.updateMany({
        where: {
          id: formData.marketId,
          status: { not: 'resolved' },
        },
        data: {
          status: 'resolved',
          resolvedAt: new Date(),
          winningOptionId: formData.winningOptionId,
        },
      })

      if (transition.count !== 1) {
        throw new Error('ALREADY_RESOLVED')
      }

      // 모든 옵션 정보 가져오기
      const allOptions = await tx.marketOption.findMany({
        where: { marketId: formData.marketId },
      })

      const totalBetAmount = allOptions.reduce((sum, opt) => sum + opt.totalAmount, 0)
      const selectedWinningOption = allOptions.find((option) => option.id === formData.winningOptionId)
      const winningTotalAmount = selectedWinningOption?.totalAmount ?? 0

      if (totalBetAmount === 0) {
        throw new Error('NO_BETS')
      }

      // 승리한 선택지에 베팅한 사용자들 조회
      const winnerPredictions = await tx.prediction.findMany({
        where: {
          marketId: formData.marketId,
          optionId: formData.winningOptionId,
        },
      })

      // 패배한 선택지들에 베팅한 사용자들 조회
      const loserPredictions = await tx.prediction.findMany({
        where: {
          marketId: formData.marketId,
          optionId: { not: formData.winningOptionId },
        },
      })

      if (winnerPredictions.length > 0 && winningTotalAmount <= 0) {
        throw new Error('INVALID_MARKET_TOTALS')
      }

      let totalFees = 0

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
        await tx.prediction.update({
          where: { id: prediction.id },
          data: {
            resolved: 1, // 승리
            payout: netPayout,
          },
        })

        // 사용자에게 보상 지급
        await tx.user.update({
          where: { id: prediction.userId },
          data: {
            dpmmBalance: { increment: netPayout },
          },
        })
      }

      // 3. 수수료를 수수료 소각 계정에 입금
      if (totalFees > 0) {
        await tx.user.updateMany({
          where: { id: 'fee-burn-account' },
          data: {
            dpmmBalance: { increment: totalFees },
          },
        })
      }

      // 4. 패배자 예측 레코드 업데이트
      for (const prediction of loserPredictions) {
        await tx.prediction.update({
          where: { id: prediction.id },
          data: {
            resolved: -1, // 패배
            payout: 0,
          },
        })
      }

      return {
        winnersCount: winnerPredictions.length,
        losersCount: loserPredictions.length,
        totalPayout: totalBetAmount,
      }
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })

    // 캐시 재검증
    revalidatePath(`/markets/${formData.marketId}`)
    revalidatePath('/markets')
    revalidatePath('/app')

    return {
      success: true,
      winnersCount: result.winnersCount,
      losersCount: result.losersCount,
      totalPayout: result.totalPayout,
    }
  } catch (error) {
    console.error('Market resolution error:', error)

    if (error instanceof Error && error.message === '관리자 권한이 필요합니다') {
      return {
        success: false,
        error: '관리자 권한이 필요합니다',
      }
    }

    if (error instanceof Error && error.message === 'MARKET_NOT_FOUND') {
      return {
        success: false,
        error: '마켓을 찾을 수 없습니다',
      }
    }

    if (error instanceof Error && error.message === 'ALREADY_RESOLVED') {
      return {
        success: false,
        error: '이미 결과가 확정된 마켓입니다',
      }
    }

    if (error instanceof Error && error.message === 'INVALID_OPTION') {
      return {
        success: false,
        error: '유효하지 않은 선택지입니다',
      }
    }

    if (error instanceof Error && error.message === 'NO_BETS') {
      return {
        success: false,
        error: '베팅이 없는 마켓은 확정할 수 없습니다',
      }
    }

    if (error instanceof Error && error.message === 'INVALID_MARKET_TOTALS') {
      return {
        success: false,
        error: '마켓 베팅 합계가 올바르지 않습니다',
      }
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return {
        success: false,
        error: '요청이 동시에 처리되어 실패했습니다. 다시 시도해주세요.',
      }
    }

    return {
      success: false,
      error: '마켓 결과 확정 중 오류가 발생했습니다',
    }
  }
}
