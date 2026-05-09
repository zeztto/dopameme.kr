'use server'

import { auth } from '@/auth'
import { createDpmmLedgerEntry } from '@/lib/dpmm/ledger'
import { prisma } from '@/lib/db'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { Prisma } from '@prisma/client'
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

    const amount = Number(formData.amount)
    const marketId = formData.marketId
    const optionId = formData.optionId

    // 금액 검증
    if (!Number.isInteger(amount)) {
      return {
        success: false,
        error: '유효하지 않은 베팅 금액입니다',
      }
    }

    if (amount < 100) {
      return {
        success: false,
        error: '최소 베팅 금액은 100 DPMM입니다',
      }
    }

    if (amount > 10000) {
      return {
        success: false,
        error: '최대 베팅 금액은 10,000 DPM입니다',
      }
    }

    const userId = session.user.id

    // 사용자 잔액 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dpmmBalance: true, status: true },
    })

    if (!user || user.status !== 'active') {
      return {
        success: false,
        error: '이 계정은 현재 예측에 참여할 수 없습니다',
      }
    }

    if (user.dpmmBalance < amount) {
      return {
        success: false,
        error: 'DPMM 잔액이 부족합니다',
      }
    }

    // 마켓 상태 확인
    const market = await prisma.market.findUnique({
      where: { id: marketId },
      select: { id: true, status: true, endsAt: true, hidden: true },
    })

    if (!market || market.status !== 'active' || market.hidden) {
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
    const existingPrediction = await prisma.prediction.findFirst({
      where: {
        userId,
        marketId,
      },
      select: { id: true },
    })

    if (existingPrediction) {
      return {
        success: false,
        error: '이미 이 마켓에 참여하셨습니다. 한 마켓당 하나의 포지션만 가질 수 있습니다.',
      }
    }

    const option = await prisma.marketOption.findFirst({
      where: {
        id: optionId,
        marketId,
      },
      select: { id: true },
    })

    if (!option) {
      return {
        success: false,
        error: '유효하지 않은 선택지입니다',
      }
    }

    // 트랜잭션: 예측 생성 + 사용자 잔액 차감 + 옵션 통계 업데이트
    await prisma.$transaction(async (tx) => {
      const availableMarket = await tx.market.findFirst({
        where: {
          id: marketId,
          status: 'active',
          hidden: false,
          endsAt: { gt: new Date() },
        },
        select: { id: true },
      })

      if (!availableMarket) {
        throw new Error('MARKET_NOT_AVAILABLE')
      }

      const validOption = await tx.marketOption.findFirst({
        where: {
          id: optionId,
          marketId,
        },
        select: { id: true },
      })

      if (!validOption) {
        throw new Error('INVALID_OPTION')
      }

      const duplicatePrediction = await tx.prediction.findFirst({
        where: {
          userId,
          marketId,
        },
        select: { id: true },
      })

      if (duplicatePrediction) {
        throw new Error('DUPLICATE_PREDICTION')
      }

      const balanceUpdate = await tx.user.updateMany({
        where: {
          id: userId,
          status: 'active',
          dpmmBalance: { gte: amount },
        },
        data: {
          dpmmBalance: { decrement: amount },
        },
      })

      if (balanceUpdate.count !== 1) {
        throw new Error('INSUFFICIENT_BALANCE')
      }

      // 1. 예측 생성
      const prediction = await tx.prediction.create({
        data: {
          userId,
          marketId,
          optionId,
          amount,
        },
      })

      const updatedUser = await tx.user.findUnique({
        where: { id: userId },
        select: { dpmmBalance: true },
      })

      if (!updatedUser) {
        throw new Error('USER_NOT_FOUND')
      }

      await createDpmmLedgerEntry(tx, {
        userId,
        type: 'prediction_stake',
        delta: -amount,
        balanceAfter: updatedUser.dpmmBalance,
        reason: '예측 참여',
        sourceType: 'prediction',
        sourceId: prediction.id,
      })

      // 3. 옵션 통계 업데이트
      await tx.marketOption.update({
        where: { id: optionId },
        data: {
          totalPredictions: { increment: 1 },
          totalAmount: { increment: amount },
        },
      })
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })

    // 페이지 재검증
    revalidatePath(`/markets/${marketId}`)
    revalidatePath('/markets')
    revalidatePath('/app')

    return {
      success: true,
      message: `${amount.toLocaleString()} DPMM을 성공적으로 베팅했습니다!`,
    }
  } catch (error) {
    console.error('Prediction error:', error)

    if (error instanceof Error && error.message === 'DUPLICATE_PREDICTION') {
      return {
        success: false,
        error: '이미 이 마켓에 참여하셨습니다. 한 마켓당 하나의 포지션만 가질 수 있습니다.',
      }
    }

    if (error instanceof Error && error.message === 'INSUFFICIENT_BALANCE') {
      return {
        success: false,
        error: 'DPMM 잔액이 부족합니다',
      }
    }

    if (error instanceof Error && error.message === 'MARKET_NOT_AVAILABLE') {
      return {
        success: false,
        error: '현재 참여할 수 없는 마켓입니다',
      }
    }

    if (error instanceof Error && error.message === 'INVALID_OPTION') {
      return {
        success: false,
        error: '유효하지 않은 선택지입니다',
      }
    }

    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return {
        success: false,
        error: '회원을 찾을 수 없습니다',
      }
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return {
        success: false,
        error: '이미 이 마켓에 참여하셨습니다. 한 마켓당 하나의 포지션만 가질 수 있습니다.',
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
      error: '예측 참여 중 오류가 발생했습니다',
    }
  }
}

export async function createMarketComment(formData: {
  marketId: string
  content: string
}) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: '로그인이 필요합니다',
      }
    }

    const marketId = typeof formData.marketId === 'string' ? formData.marketId : ''
    const rawContent = typeof formData.content === 'string' ? formData.content : ''
    const content = rawContent.replace(/\r\n/g, '\n').trim()

    if (!marketId) {
      return {
        success: false,
        error: '마켓 정보가 올바르지 않습니다',
      }
    }

    if (!content || content.length < 2) {
      return {
        success: false,
        error: '댓글은 2자 이상 입력해주세요',
      }
    }

    if (content.length > 500) {
      return {
        success: false,
        error: '댓글은 500자 이하로 입력해주세요',
      }
    }

    const ip = await getRequestIp()
    const rateLimit = checkRateLimit(`market-comment:${session.user.id}:${ip}:${marketId}`, {
      limit: 8,
      windowMs: 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `댓글 작성이 너무 빠릅니다. ${rateLimit.retryAfterSeconds}초 후 다시 시도해주세요.`,
      }
    }

    const [user, market] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, role: true, status: true },
      }),
      prisma.market.findUnique({
        where: { id: marketId },
        select: { id: true, hidden: true },
      }),
    ])

    if (!user || user.status !== 'active') {
      return {
        success: false,
        error: '이 계정은 현재 댓글을 작성할 수 없습니다',
      }
    }

    if (!market || (market.hidden && user.role !== 'admin')) {
      return {
        success: false,
        error: '댓글을 작성할 수 없는 마켓입니다',
      }
    }

    await prisma.marketComment.create({
      data: {
        marketId,
        userId: user.id,
        content,
      },
    })

    revalidatePath(`/markets/${marketId}`)

    return {
      success: true,
      message: '댓글을 등록했습니다',
    }
  } catch (error) {
    console.error('Market comment error:', error)

    return {
      success: false,
      error: '댓글 등록 중 오류가 발생했습니다',
    }
  }
}
