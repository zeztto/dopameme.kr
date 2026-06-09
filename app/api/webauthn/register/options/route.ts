import { auth } from '@/auth'
import { getRegistrationOptions } from '@/lib/webauthn'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function jsonError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status })
}

export async function POST() {
  const session = await auth()

  if (!session?.user?.id) {
    return jsonError('auth.required', '로그인이 필요합니다.', 401)
  }

  const result = await getRegistrationOptions(session.user.id)

  if (!result.ok) {
    return jsonError(result.code, result.message, result.status)
  }

  return NextResponse.json({ data: result.options })
}
