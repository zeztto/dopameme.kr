import { auth } from '@/auth'
import { verifyRegistration } from '@/lib/webauthn'
import type { RegistrationResponseJSON } from '@simplewebauthn/types'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function jsonError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status })
}

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session?.user?.id) {
    return jsonError('auth.required', '로그인이 필요합니다.', 401)
  }

  let body: RegistrationResponseJSON

  try {
    body = await request.json()
  } catch {
    return jsonError('request.invalid_json', '요청 본문이 올바른 JSON이 아닙니다.', 400)
  }

  try {
    const result = await verifyRegistration(session.user.id, body)

    if (!result.ok) {
      return jsonError(result.code, result.message, result.status)
    }

    return NextResponse.json({ data: { registered: true } })
  } catch (error) {
    console.error('WebAuthn registration verify error:', error)
    return jsonError('webauthn.verification_failed', '패스키 등록을 확인하지 못했습니다.', 400)
  }
}
