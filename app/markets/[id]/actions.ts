'use server'

import { auth } from '@/auth'
import { createDpmmLedgerEntry } from '@/lib/dpmm/ledger'
import { prisma } from '@/lib/db'
import { quoteAmmStake } from '@/lib/markets/amm'
import { recordMarketPriceSnapshot } from '@/lib/markets/price-snapshots'
import { createNotification, deliverPushForNotification } from '@/lib/notifications'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const MIN_PREDICTION_AMOUNT = 100
const LIQUIDATION_FEE_RATE = 0.01
const MIN_POSITION_LISTING_PRICE = 100
const MAX_POSITION_LISTING_PRICE = 1_000_000
const POSITION_LISTING_FEE_RATE = 0.01

function revalidatePositionTransferPaths(marketId: string, userIds: string[]) {
  revalidatePath(`/markets/${marketId}`)
  revalidatePath('/markets')
  revalidatePath('/app')
  revalidatePath('/feed')
  revalidatePath('/notifications')

  for (const userId of Array.from(new Set(userIds))) {
    revalidatePath(`/users/${userId}`)
  }
}

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
    const result = await prisma.$transaction(async (tx) => {
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

      const [quoteOptions, ammConfig] = await Promise.all([
        tx.marketOption.findMany({
          where: { marketId },
          select: {
            id: true,
            totalAmount: true,
          },
          orderBy: { createdAt: 'asc' },
        }),
        tx.marketAmmConfig.findUnique({
          where: { marketId },
          select: {
            enabled: true,
            virtualLiquidity: true,
          },
        }),
      ])
      const quote = quoteAmmStake({
        options: quoteOptions,
        optionId,
        amount,
        config: ammConfig,
      })

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

      await recordMarketPriceSnapshot(tx, {
        marketId,
        source: 'prediction_stake',
      })

      return { quote }
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })

    // 페이지 재검증
    revalidatePath(`/markets/${marketId}`)
    revalidatePath('/markets')
    revalidatePath('/app')
    revalidatePath('/feed')

    return {
      success: true,
      message: result.quote
        ? `${amount.toLocaleString()} DPMM을 베팅했습니다. AMM 평균가 ${(result.quote.averagePriceBps / 100).toFixed(1)}%`
        : `${amount.toLocaleString()} DPMM을 성공적으로 베팅했습니다!`,
      quote: result.quote,
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

export async function liquidatePrediction(formData: {
  predictionId: string
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

    const predictionId = typeof formData?.predictionId === 'string'
      ? formData.predictionId.trim()
      : ''
    const amount = Number(formData?.amount)

    if (!predictionId || predictionId.length > 100) {
      return {
        success: false,
        error: '포지션 정보가 올바르지 않습니다',
      }
    }

    if (!Number.isInteger(amount) || amount < MIN_PREDICTION_AMOUNT) {
      return {
        success: false,
        error: `최소 청산 금액은 ${MIN_PREDICTION_AMOUNT.toLocaleString()} DPMM입니다`,
      }
    }

    const userId = session.user.id
    const ip = await getRequestIp()
    const rateLimit = checkRateLimit(`prediction-liquidation:${userId}:${ip}:${predictionId}`, {
      limit: 8,
      windowMs: 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `청산 요청이 너무 빠릅니다. ${rateLimit.retryAfterSeconds}초 후 다시 시도해주세요.`,
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const prediction = await tx.prediction.findFirst({
        where: {
          id: predictionId,
          userId,
          resolved: 0,
        },
        select: {
          id: true,
          amount: true,
          optionId: true,
          marketId: true,
          market: {
            select: {
              id: true,
              status: true,
              hidden: true,
              endsAt: true,
            },
          },
          user: {
            select: {
              status: true,
            },
          },
        },
      })

      if (!prediction) {
        throw new Error('PREDICTION_NOT_FOUND')
      }

      if (prediction.user.status !== 'active') {
        throw new Error('USER_NOT_AVAILABLE')
      }

      if (
        prediction.market.status !== 'active'
        || prediction.market.hidden
        || prediction.market.endsAt <= new Date()
      ) {
        throw new Error('MARKET_NOT_AVAILABLE')
      }

      const maxLiquidationAmount = prediction.amount - MIN_PREDICTION_AMOUNT

      if (maxLiquidationAmount < MIN_PREDICTION_AMOUNT) {
        throw new Error('POSITION_TOO_SMALL')
      }

      if (amount > maxLiquidationAmount) {
        throw new Error('LIQUIDATION_TOO_LARGE')
      }

      const activeListing = await tx.positionListing.findFirst({
        where: {
          predictionId: prediction.id,
          status: 'active',
        },
        select: { id: true },
      })

      if (activeListing) {
        throw new Error('POSITION_LISTED')
      }

      const fee = Math.floor(amount * LIQUIDATION_FEE_RATE)
      const refundAmount = amount - fee

      await tx.prediction.update({
        where: { id: prediction.id },
        data: {
          amount: { decrement: amount },
          liquidatedAmount: { increment: amount },
        },
      })

      await tx.marketOption.update({
        where: { id: prediction.optionId },
        data: {
          totalAmount: { decrement: amount },
        },
      })

      await recordMarketPriceSnapshot(tx, {
        marketId: prediction.marketId,
        source: 'prediction_liquidation',
      })

      const balanceUpdate = await tx.user.updateMany({
        where: {
          id: userId,
          status: 'active',
        },
        data: {
          dpmmBalance: { increment: refundAmount },
        },
      })

      if (balanceUpdate.count !== 1) {
        throw new Error('USER_NOT_FOUND')
      }

      const updatedUser = await tx.user.findUnique({
        where: { id: userId },
        select: { dpmmBalance: true },
      })

      if (!updatedUser) {
        throw new Error('USER_NOT_FOUND')
      }

      await createDpmmLedgerEntry(tx, {
        userId,
        type: 'prediction_liquidation',
        delta: refundAmount,
        balanceAfter: updatedUser.dpmmBalance,
        reason: '부분 청산',
        sourceType: 'prediction',
        sourceId: prediction.id,
      })

      if (fee > 0) {
        const feeUpdate = await tx.user.updateMany({
          where: { id: 'fee-burn-account' },
          data: {
            dpmmBalance: { increment: fee },
          },
        })

        if (feeUpdate.count === 1) {
          const feeBurnUser = await tx.user.findUnique({
            where: { id: 'fee-burn-account' },
            select: { dpmmBalance: true },
          })

          if (feeBurnUser) {
            await createDpmmLedgerEntry(tx, {
              userId: 'fee-burn-account',
              actorId: userId,
              type: 'prediction_liquidation_fee',
              delta: fee,
              balanceAfter: feeBurnUser.dpmmBalance,
              reason: '부분 청산 수수료',
              sourceType: 'prediction',
              sourceId: prediction.id,
            })
          }
        }
      }

      return {
        marketId: prediction.marketId,
        refundAmount,
        fee,
        remainingAmount: prediction.amount - amount,
      }
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })

    revalidatePath(`/markets/${result.marketId}`)
    revalidatePath('/markets')
    revalidatePath('/app')
    revalidatePath('/feed')
    revalidatePath(`/users/${userId}`)

    return {
      success: true,
      message: `${result.refundAmount.toLocaleString()} DPMM을 회수했습니다.`,
      refundAmount: result.refundAmount,
      fee: result.fee,
      remainingAmount: result.remainingAmount,
    }
  } catch (error) {
    console.error('Prediction liquidation error:', error)

    if (error instanceof Error && error.message === 'PREDICTION_NOT_FOUND') {
      return {
        success: false,
        error: '청산할 포지션을 찾을 수 없습니다',
      }
    }

    if (error instanceof Error && error.message === 'MARKET_NOT_AVAILABLE') {
      return {
        success: false,
        error: '현재 청산할 수 없는 마켓입니다',
      }
    }

    if (error instanceof Error && error.message === 'USER_NOT_AVAILABLE') {
      return {
        success: false,
        error: '현재 계정 상태에서는 청산할 수 없습니다',
      }
    }

    if (error instanceof Error && error.message === 'POSITION_TOO_SMALL') {
      return {
        success: false,
        error: `최소 ${MIN_PREDICTION_AMOUNT.toLocaleString()} DPMM은 포지션에 남아 있어야 합니다`,
      }
    }

    if (error instanceof Error && error.message === 'LIQUIDATION_TOO_LARGE') {
      return {
        success: false,
        error: `최소 ${MIN_PREDICTION_AMOUNT.toLocaleString()} DPMM은 포지션에 남겨야 합니다`,
      }
    }

    if (error instanceof Error && error.message === 'POSITION_LISTED') {
      return {
        success: false,
        error: '거래 등록 중인 포지션은 청산할 수 없습니다. 먼저 판매 등록을 취소해주세요.',
      }
    }

    if (error instanceof Error && error.message === 'USER_NOT_FOUND') {
      return {
        success: false,
        error: '회원을 찾을 수 없습니다',
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
      error: '부분 청산 중 오류가 발생했습니다',
    }
  }
}

export async function createPositionListing(formData: {
  predictionId: string
  price: number
}) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: '로그인이 필요합니다',
      }
    }

    const predictionId = typeof formData?.predictionId === 'string'
      ? formData.predictionId.trim()
      : ''
    const price = Number(formData?.price)

    if (!predictionId || predictionId.length > 100) {
      return {
        success: false,
        error: '포지션 정보가 올바르지 않습니다',
      }
    }

    if (
      !Number.isInteger(price)
      || price < MIN_POSITION_LISTING_PRICE
      || price > MAX_POSITION_LISTING_PRICE
    ) {
      return {
        success: false,
        error: `${MIN_POSITION_LISTING_PRICE.toLocaleString()}~${MAX_POSITION_LISTING_PRICE.toLocaleString()} DPMM 사이로 입력해주세요`,
      }
    }

    const userId = session.user.id
    const ip = await getRequestIp()
    const rateLimit = checkRateLimit(`position-listing-create:${userId}:${ip}:${predictionId}`, {
      limit: 10,
      windowMs: 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `판매 등록 요청이 너무 빠릅니다. ${rateLimit.retryAfterSeconds}초 후 다시 시도해주세요.`,
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const prediction = await tx.prediction.findFirst({
        where: {
          id: predictionId,
          userId,
          resolved: 0,
        },
        select: {
          id: true,
          amount: true,
          optionId: true,
          marketId: true,
          market: {
            select: {
              id: true,
              status: true,
              hidden: true,
              endsAt: true,
            },
          },
          user: {
            select: {
              status: true,
            },
          },
        },
      })

      if (!prediction) {
        throw new Error('PREDICTION_NOT_FOUND')
      }

      if (prediction.user.status !== 'active') {
        throw new Error('USER_NOT_AVAILABLE')
      }

      if (
        prediction.market.status !== 'active'
        || prediction.market.hidden
        || prediction.market.endsAt <= new Date()
      ) {
        throw new Error('MARKET_NOT_AVAILABLE')
      }

      if (prediction.amount < MIN_PREDICTION_AMOUNT) {
        throw new Error('POSITION_TOO_SMALL')
      }

      const activeListing = await tx.positionListing.findFirst({
        where: {
          predictionId: prediction.id,
          status: 'active',
        },
        select: { id: true },
      })

      if (activeListing) {
        throw new Error('LISTING_ALREADY_ACTIVE')
      }

      const listing = await tx.positionListing.create({
        data: {
          sellerId: userId,
          predictionId: prediction.id,
          marketId: prediction.marketId,
          optionId: prediction.optionId,
          amount: prediction.amount,
          price,
        },
      })

      return {
        listingId: listing.id,
        marketId: prediction.marketId,
      }
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })

    revalidatePositionTransferPaths(result.marketId, [userId])

    return {
      success: true,
      listingId: result.listingId,
      message: `${price.toLocaleString()} DPMM에 판매 등록했습니다.`,
    }
  } catch (error) {
    console.error('Position listing create error:', error)

    if (error instanceof Error && error.message === 'PREDICTION_NOT_FOUND') {
      return {
        success: false,
        error: '판매할 포지션을 찾을 수 없습니다',
      }
    }

    if (error instanceof Error && error.message === 'USER_NOT_AVAILABLE') {
      return {
        success: false,
        error: '현재 계정 상태에서는 판매 등록을 할 수 없습니다',
      }
    }

    if (error instanceof Error && error.message === 'MARKET_NOT_AVAILABLE') {
      return {
        success: false,
        error: '현재 거래할 수 없는 마켓입니다',
      }
    }

    if (error instanceof Error && error.message === 'POSITION_TOO_SMALL') {
      return {
        success: false,
        error: '판매할 수 있는 포지션 금액이 부족합니다',
      }
    }

    if (error instanceof Error && error.message === 'LISTING_ALREADY_ACTIVE') {
      return {
        success: false,
        error: '이미 판매 등록 중인 포지션입니다',
      }
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return {
        success: false,
        error: '이미 판매 등록 중인 포지션입니다',
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
      error: '포지션 판매 등록 중 오류가 발생했습니다',
    }
  }
}

export async function cancelPositionListing(formData: {
  listingId: string
}) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: '로그인이 필요합니다',
      }
    }

    const listingId = typeof formData?.listingId === 'string'
      ? formData.listingId.trim()
      : ''

    if (!listingId || listingId.length > 100) {
      return {
        success: false,
        error: '판매 등록 정보가 올바르지 않습니다',
      }
    }

    const userId = session.user.id
    const ip = await getRequestIp()
    const rateLimit = checkRateLimit(`position-listing-cancel:${userId}:${ip}:${listingId}`, {
      limit: 20,
      windowMs: 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `판매 취소 요청이 너무 빠릅니다. ${rateLimit.retryAfterSeconds}초 후 다시 시도해주세요.`,
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const listing = await tx.positionListing.findFirst({
        where: {
          id: listingId,
          sellerId: userId,
          status: 'active',
        },
        select: {
          id: true,
          marketId: true,
        },
      })

      if (!listing) {
        throw new Error('LISTING_NOT_FOUND')
      }

      const cancelUpdate = await tx.positionListing.updateMany({
        where: {
          id: listing.id,
          sellerId: userId,
          status: 'active',
        },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      })

      if (cancelUpdate.count !== 1) {
        throw new Error('LISTING_NOT_FOUND')
      }

      return {
        marketId: listing.marketId,
      }
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })

    revalidatePositionTransferPaths(result.marketId, [userId])

    return {
      success: true,
      message: '판매 등록을 취소했습니다',
    }
  } catch (error) {
    console.error('Position listing cancel error:', error)

    if (error instanceof Error && error.message === 'LISTING_NOT_FOUND') {
      return {
        success: false,
        error: '취소할 판매 등록을 찾을 수 없습니다',
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
      error: '판매 등록 취소 중 오류가 발생했습니다',
    }
  }
}

export async function buyPositionListing(formData: {
  listingId: string
}) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return {
        success: false,
        error: '로그인이 필요합니다',
      }
    }

    const listingId = typeof formData?.listingId === 'string'
      ? formData.listingId.trim()
      : ''

    if (!listingId || listingId.length > 100) {
      return {
        success: false,
        error: '판매 등록 정보가 올바르지 않습니다',
      }
    }

    const buyerId = session.user.id
    const ip = await getRequestIp()
    const rateLimit = checkRateLimit(`position-listing-buy:${buyerId}:${ip}:${listingId}`, {
      limit: 10,
      windowMs: 60 * 1000,
    })

    if (!rateLimit.allowed) {
      return {
        success: false,
        error: `구매 요청이 너무 빠릅니다. ${rateLimit.retryAfterSeconds}초 후 다시 시도해주세요.`,
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const listing = await tx.positionListing.findFirst({
        where: {
          id: listingId,
          status: 'active',
        },
        select: {
          id: true,
          sellerId: true,
          predictionId: true,
          marketId: true,
          optionId: true,
          amount: true,
          price: true,
          market: {
            select: {
              id: true,
              title: true,
              status: true,
              hidden: true,
              endsAt: true,
            },
          },
          option: {
            select: {
              title: true,
            },
          },
          prediction: {
            select: {
              id: true,
              userId: true,
              marketId: true,
              optionId: true,
              amount: true,
              resolved: true,
            },
          },
        },
      })

      if (!listing) {
        throw new Error('LISTING_NOT_FOUND')
      }

      if (listing.sellerId === buyerId) {
        throw new Error('SELF_PURCHASE')
      }

      if (
        listing.market.status !== 'active'
        || listing.market.hidden
        || listing.market.endsAt <= new Date()
      ) {
        throw new Error('MARKET_NOT_AVAILABLE')
      }

      if (
        listing.prediction.userId !== listing.sellerId
        || listing.prediction.marketId !== listing.marketId
        || listing.prediction.optionId !== listing.optionId
        || listing.prediction.amount !== listing.amount
        || listing.prediction.resolved !== 0
      ) {
        throw new Error('LISTING_STALE')
      }

      const [buyer, seller, existingBuyerPrediction] = await Promise.all([
        tx.user.findUnique({
          where: { id: buyerId },
          select: { id: true, status: true, dpmmBalance: true },
        }),
        tx.user.findUnique({
          where: { id: listing.sellerId },
          select: { id: true, status: true, dpmmBalance: true },
        }),
        tx.prediction.findFirst({
          where: {
            userId: buyerId,
            marketId: listing.marketId,
          },
          select: { id: true },
        }),
      ])

      if (!buyer || buyer.status !== 'active') {
        throw new Error('BUYER_NOT_AVAILABLE')
      }

      if (!seller || seller.status !== 'active') {
        throw new Error('SELLER_NOT_AVAILABLE')
      }

      if (existingBuyerPrediction) {
        throw new Error('BUYER_ALREADY_PARTICIPATED')
      }

      const fee = Math.floor(listing.price * POSITION_LISTING_FEE_RATE)
      const sellerReceives = listing.price - fee

      const buyerUpdate = await tx.user.updateMany({
        where: {
          id: buyerId,
          status: 'active',
          dpmmBalance: { gte: listing.price },
        },
        data: {
          dpmmBalance: { decrement: listing.price },
        },
      })

      if (buyerUpdate.count !== 1) {
        throw new Error('INSUFFICIENT_BALANCE')
      }

      const updatedBuyer = await tx.user.findUnique({
        where: { id: buyerId },
        select: { dpmmBalance: true },
      })

      if (!updatedBuyer) {
        throw new Error('BUYER_NOT_AVAILABLE')
      }

      await createDpmmLedgerEntry(tx, {
        userId: buyerId,
        actorId: listing.sellerId,
        type: 'position_purchase',
        delta: -listing.price,
        balanceAfter: updatedBuyer.dpmmBalance,
        reason: '포지션 구매',
        sourceType: 'position_listing',
        sourceId: listing.id,
      })

      const sellerUpdate = await tx.user.updateMany({
        where: {
          id: listing.sellerId,
          status: 'active',
        },
        data: {
          dpmmBalance: { increment: sellerReceives },
        },
      })

      if (sellerUpdate.count !== 1) {
        throw new Error('SELLER_NOT_AVAILABLE')
      }

      const updatedSeller = await tx.user.findUnique({
        where: { id: listing.sellerId },
        select: { dpmmBalance: true },
      })

      if (!updatedSeller) {
        throw new Error('SELLER_NOT_AVAILABLE')
      }

      await createDpmmLedgerEntry(tx, {
        userId: listing.sellerId,
        actorId: buyerId,
        type: 'position_sale',
        delta: sellerReceives,
        balanceAfter: updatedSeller.dpmmBalance,
        reason: '포지션 판매',
        sourceType: 'position_listing',
        sourceId: listing.id,
      })

      if (fee > 0) {
        const feeUpdate = await tx.user.updateMany({
          where: { id: 'fee-burn-account' },
          data: {
            dpmmBalance: { increment: fee },
          },
        })

        if (feeUpdate.count === 1) {
          const feeBurnUser = await tx.user.findUnique({
            where: { id: 'fee-burn-account' },
            select: { dpmmBalance: true },
          })

          if (feeBurnUser) {
            await createDpmmLedgerEntry(tx, {
              userId: 'fee-burn-account',
              actorId: buyerId,
              type: 'position_sale_fee',
              delta: fee,
              balanceAfter: feeBurnUser.dpmmBalance,
              reason: '포지션 판매 수수료',
              sourceType: 'position_listing',
              sourceId: listing.id,
            })
          }
        }
      }

      const predictionUpdate = await tx.prediction.updateMany({
        where: {
          id: listing.predictionId,
          userId: listing.sellerId,
          amount: listing.amount,
          resolved: 0,
        },
        data: {
          userId: buyerId,
        },
      })

      if (predictionUpdate.count !== 1) {
        throw new Error('LISTING_STALE')
      }

      const listingUpdate = await tx.positionListing.updateMany({
        where: {
          id: listing.id,
          status: 'active',
        },
        data: {
          status: 'sold',
          buyerId,
          soldAt: new Date(),
        },
      })

      if (listingUpdate.count !== 1) {
        throw new Error('LISTING_STALE')
      }

      const notification = await createNotification(tx, {
        userId: listing.sellerId,
        actorId: buyerId,
        type: 'position_sold',
        title: '포지션 판매 완료',
        body: `${listing.option.title} 포지션이 ${listing.price.toLocaleString()} DPMM에 판매되었습니다.`,
        targetType: 'market',
        targetId: listing.marketId,
        targetPath: `/markets/${listing.marketId}`,
      })

      return {
        marketId: listing.marketId,
        sellerId: listing.sellerId,
        price: listing.price,
        fee,
        notification,
      }
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    })

    revalidatePositionTransferPaths(result.marketId, [buyerId, result.sellerId])
    await deliverPushForNotification(result.notification)

    return {
      success: true,
      message: `${result.price.toLocaleString()} DPMM에 포지션을 구매했습니다.`,
      price: result.price,
      fee: result.fee,
    }
  } catch (error) {
    console.error('Position listing buy error:', error)

    if (error instanceof Error && error.message === 'LISTING_NOT_FOUND') {
      return {
        success: false,
        error: '구매할 판매 등록을 찾을 수 없습니다',
      }
    }

    if (error instanceof Error && error.message === 'SELF_PURCHASE') {
      return {
        success: false,
        error: '본인 포지션은 구매할 수 없습니다',
      }
    }

    if (error instanceof Error && error.message === 'MARKET_NOT_AVAILABLE') {
      return {
        success: false,
        error: '현재 거래할 수 없는 마켓입니다',
      }
    }

    if (error instanceof Error && error.message === 'LISTING_STALE') {
      return {
        success: false,
        error: '포지션 상태가 변경되어 구매할 수 없습니다',
      }
    }

    if (error instanceof Error && error.message === 'BUYER_NOT_AVAILABLE') {
      return {
        success: false,
        error: '현재 계정 상태에서는 구매할 수 없습니다',
      }
    }

    if (error instanceof Error && error.message === 'SELLER_NOT_AVAILABLE') {
      return {
        success: false,
        error: '판매자 계정 상태 때문에 구매할 수 없습니다',
      }
    }

    if (error instanceof Error && error.message === 'BUYER_ALREADY_PARTICIPATED') {
      return {
        success: false,
        error: '이미 이 마켓에 참여했습니다. 한 마켓당 하나의 포지션만 가질 수 있습니다.',
      }
    }

    if (error instanceof Error && error.message === 'INSUFFICIENT_BALANCE') {
      return {
        success: false,
        error: 'DPMM 잔액이 부족합니다',
      }
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return {
        success: false,
        error: '이미 이 마켓에 참여했습니다. 한 마켓당 하나의 포지션만 가질 수 있습니다.',
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
      error: '포지션 구매 중 오류가 발생했습니다',
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
        select: { id: true, title: true, hidden: true, creatorId: true },
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

    const notification = await prisma.$transaction(async (tx) => {
      await tx.marketComment.create({
        data: {
          marketId,
          userId: user.id,
          content,
        },
      })

      if (market.creatorId !== user.id) {
        return createNotification(tx, {
          userId: market.creatorId,
          actorId: user.id,
          type: 'market_comment',
          title: '새 마켓 댓글',
          body: market.title,
          targetType: 'market',
          targetId: market.id,
          targetPath: `/markets/${market.id}`,
        })
      }

      return null
    })

    revalidatePath(`/markets/${marketId}`)
    revalidatePath('/feed')
    revalidatePath('/notifications')
    await deliverPushForNotification(notification)

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
