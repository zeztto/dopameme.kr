'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-utils'
import { DEFAULT_AMM_VIRTUAL_LIQUIDITY } from '@/lib/markets/amm'
import {
  MARKET_CATEGORIES,
  normalizeMarketLanguage,
  normalizeMarketRegion,
  normalizeMarketTimeZone,
  parseMarketLocalDateTime,
} from '@/lib/markets/regions'
import { Prisma } from '@prisma/client'
import { revalidatePath } from 'next/cache'

const MIN_MARKET_OPTIONS = 2
const MAX_MARKET_OPTIONS = 6
const MAX_OPTION_TITLE_LENGTH = 40

export async function createMarket(formData: {
  title: string
  description: string
  category: string
  region?: string
  languageCode?: string
  timeZone?: string
  imageUrl?: string
  endsAt: string // ISO date string
  options: string[] // 선택지 제목 배열
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

    const userId = session.user.id

    const title = typeof formData.title === 'string' ? formData.title.trim() : ''
    const description = typeof formData.description === 'string' ? formData.description.trim() : ''
    const category = typeof formData.category === 'string' ? formData.category.trim() : ''
    const region = normalizeMarketRegion(formData.region)
    const languageCode = normalizeMarketLanguage(formData.languageCode)
    const timeZone = normalizeMarketTimeZone(formData.timeZone)
    const imageUrl = typeof formData.imageUrl === 'string' ? formData.imageUrl.trim() : ''

    if (title.length < 5 || title.length > 120) {
      return {
        success: false,
        error: '제목은 5자 이상 120자 이하로 입력해주세요',
      }
    }

    if (description.length < 10 || description.length > 2000) {
      return {
        success: false,
        error: '설명은 10자 이상 2,000자 이하로 입력해주세요',
      }
    }

    if (!MARKET_CATEGORIES.includes(category as (typeof MARKET_CATEGORIES)[number])) {
      return {
        success: false,
        error: '카테고리가 올바르지 않습니다',
      }
    }

    if (imageUrl) {
      try {
        const parsedImageUrl = new URL(imageUrl)
        if (!['http:', 'https:'].includes(parsedImageUrl.protocol)) {
          return {
            success: false,
            error: '이미지 URL은 http 또는 https만 사용할 수 있습니다',
          }
        }
      } catch {
        return {
          success: false,
          error: '이미지 URL 형식이 올바르지 않습니다',
        }
      }
    }

    const normalizedOptions = Array.isArray(formData.options)
      ? formData.options
        .map((option) => typeof option === 'string' ? option.trim() : '')
        .filter(Boolean)
      : []

    if (normalizedOptions.length < MIN_MARKET_OPTIONS) {
      return {
        success: false,
        error: `최소 ${MIN_MARKET_OPTIONS}개 이상의 선택지가 필요합니다`,
      }
    }

    if (normalizedOptions.length > MAX_MARKET_OPTIONS) {
      return {
        success: false,
        error: `선택지는 최대 ${MAX_MARKET_OPTIONS}개까지 만들 수 있습니다`,
      }
    }

    if (normalizedOptions.some((option) => option.length > MAX_OPTION_TITLE_LENGTH)) {
      return {
        success: false,
        error: `선택지는 ${MAX_OPTION_TITLE_LENGTH}자 이하로 입력해주세요`,
      }
    }

    const optionLocale = languageCode === 'ja' ? 'ja-JP' : languageCode === 'en' ? 'en-US' : 'ko-KR'
    const uniqueOptions = new Set(normalizedOptions.map((option) => option.toLocaleLowerCase(optionLocale)))

    if (uniqueOptions.size !== normalizedOptions.length) {
      return {
        success: false,
        error: '선택지 이름은 중복될 수 없습니다',
      }
    }

    // 마감일 검증
    const endsAt = parseMarketLocalDateTime(formData.endsAt, timeZone)
    if (Number.isNaN(endsAt.getTime()) || endsAt <= new Date()) {
      return {
        success: false,
        error: '마감일은 선택한 타임존 기준 현재 시간 이후여야 합니다',
      }
    }

    // 트랜잭션으로 마켓과 옵션 동시 생성
    const marketId = crypto.randomUUID()

    await prisma.$transaction(async (tx) => {
      // 마켓 생성
      await tx.market.create({
        data: {
          id: marketId,
          title,
          description,
          category,
          region,
          languageCode,
          timeZone,
          imageUrl: imageUrl || null,
          status: 'active',
          source: 'admin',
          creatorId: userId,
          endsAt: endsAt,
        },
      })

      // 옵션 생성
      const optionsData = normalizedOptions.map((optionTitle) => ({
        marketId: marketId,
        title: optionTitle,
      }))

      await tx.marketOption.createMany({
        data: optionsData,
      })

      await tx.marketAmmConfig.create({
        data: {
          marketId,
          enabled: true,
          virtualLiquidity: DEFAULT_AMM_VIRTUAL_LIQUIDITY,
        },
      })
    })

    // 캐시 재검증
    revalidatePath('/admin')
    revalidatePath('/markets')
    revalidatePath('/admin/markets')

    return {
      success: true,
      marketId,
    }
  } catch (error) {
    console.error('Market creation error:', error)

    if (error instanceof Error && error.message === '관리자 권한이 필요합니다') {
      return {
        success: false,
        error: '관리자 권한이 필요합니다',
      }
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return {
        success: false,
        error: '선택지 이름은 중복될 수 없습니다',
      }
    }

    return {
      success: false,
      error: '마켓 생성 중 오류가 발생했습니다',
    }
  }
}
