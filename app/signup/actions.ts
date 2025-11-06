'use server'

import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq, or } from 'drizzle-orm'
import bcrypt from 'bcryptjs'

export async function registerUser(formData: {
  email: string
  password: string
  name: string
}) {
  try {
    // 이메일 및 닉네임 중복 확인
    const existingUser = await db
      .select()
      .from(users)
      .where(or(eq(users.email, formData.email), eq(users.name, formData.name)))
      .limit(1)

    if (existingUser.length > 0) {
      if (existingUser[0].email === formData.email) {
        return {
          success: false,
          error: '이미 존재하는 이메일입니다',
        }
      }
      if (existingUser[0].name === formData.name) {
        return {
          success: false,
          error: '이미 사용 중인 닉네임입니다. 다른 닉네임을 선택해주세요.',
        }
      }
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(formData.password, 10)

    // 사용자 생성
    const [newUser] = await db
      .insert(users)
      .values({
        email: formData.email,
        name: formData.name,
        password: hashedPassword, // 해시화된 비밀번호 저장
        dpmmBalance: 10000, // 웰컴 보너스
        emailVerified: null, // 이메일 인증 없이 바로 사용 가능
      })
      .returning()

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
    return {
      success: false,
      error: '회원가입 중 오류가 발생했습니다',
    }
  }
}
