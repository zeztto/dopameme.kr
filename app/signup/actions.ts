'use server'

import { prisma } from '@/lib/db'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import {
  isValidEmail,
  isValidNickname,
  isValidPassword,
  normalizeEmail,
  normalizeName,
} from '@/lib/validation'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function registerUser(formData: {
  email: string
  password: string
  name: string
}) {
  try {
    const email = normalizeEmail(formData.email)
    const name = normalizeName(formData.name)
    const password = formData.password
    const ip = await getRequestIp()

    const ipLimit = checkRateLimit(`signup:ip:${ip}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    })

    if (!ipLimit.allowed) {
      return {
        success: false,
        error: '회원가입 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      }
    }

    if (!isValidEmail(email)) {
      return {
        success: false,
        error: '올바른 이메일 주소를 입력해주세요',
      }
    }

    const emailLimit = checkRateLimit(`signup:email:${email}`, {
      limit: 3,
      windowMs: 15 * 60 * 1000,
    })

    if (!emailLimit.allowed) {
      return {
        success: false,
        error: '회원가입 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      }
    }

    if (!isValidNickname(name)) {
      return {
        success: false,
        error: '닉네임은 공백 없이 2자 이상 12자 이하로 입력해주세요',
      }
    }

    if (!isValidPassword(password)) {
      return {
        success: false,
        error: '비밀번호는 8자 이상 128자 이하로 입력해주세요',
      }
    }

    // 이메일 및 닉네임 중복 확인
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { name },
        ],
      },
    })

    if (existingUser) {
      if (existingUser.email === email) {
        return {
          success: false,
          error: '이미 존재하는 이메일입니다',
        }
      }
      if (existingUser.name === name) {
        return {
          success: false,
          error: '이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해주세요.',
        }
      }
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(formData.password, 10)

    // 사용자 생성
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword, // 해시화된 비밀번호 저장
        dpmmBalance: 10000, // 웰컴 보너스
        emailVerified: null, // 이메일 인증 없이 바로 사용 가능
      },
    })

    return {
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    }
  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return {
        success: false,
        error: '이미 사용 중인 이메일 또는 닉네임입니다',
      }
    }

    return {
      success: false,
      error: '회원가입 중 오류가 발생했습니다',
    }
  }
}
