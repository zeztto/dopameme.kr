'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-utils'
import { revalidatePath } from 'next/cache'

export async function createMarket(formData: {
  title: string
  description: string
  category: string
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

    // 유효성 검증
    if (!formData.title || formData.title.length < 5) {
      return {
        success: false,
        error: '제목은 최소 5자 이상이어야 합니다',
      }
    }

    if (!formData.description || formData.description.length < 10) {
      return {
        success: false,
        error: '설명은 최소 10자 이상이어야 합니다',
      }
    }

    if (!formData.options || formData.options.length < 2) {
      return {
        success: false,
        error: '최소 2개 이상의 선택지가 필요합니다',
      }
    }

    // 마감일 검증
    const endsAt = new Date(formData.endsAt)
    if (endsAt <= new Date()) {
      return {
        success: false,
        error: '마감일은 현재 시간 이후여야 합니다',
      }
    }

    // 트랜잭션으로 마켓과 옵션 동시 생성
    const marketId = crypto.randomUUID()

    await prisma.$transaction(async (tx) => {
      // 마켓 생성
      await tx.market.create({
        data: {
          id: marketId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          imageUrl: formData.imageUrl || null,
          status: 'active',
          source: 'admin',
          creatorId: userId,
          endsAt: endsAt,
        },
      })

      // 옵션 생성
      const optionsData = formData.options.map((optionTitle) => ({
        marketId: marketId,
        title: optionTitle.trim(),
      }))

      await tx.marketOption.createMany({
        data: optionsData,
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

    return {
      success: false,
      error: '마켓 생성 중 오류가 발생했습니다',
    }
  }
}
