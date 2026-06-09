import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server'
import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  PublicKeyCredentialDescriptorFuture,
  RegistrationResponseJSON,
} from '@simplewebauthn/types'
import { prisma } from '@/lib/db'
import { checkRateLimit, getRequestIp } from '@/lib/rate-limit'
import { isValidEmail, normalizeEmail } from '@/lib/validation'

const RP_NAME = '도파밈'
const CHALLENGE_TTL_MS = 5 * 60 * 1000
const MAX_PASSKEYS_PER_USER = 10

type StoredCredential = {
  credentialId: string
  publicKey: string
  counter: number
  transports: string | null
}

export function getWebAuthnConfig() {
  const origin = process.env.WEBAUTHN_ORIGIN?.trim()
    || process.env.NEXTAUTH_URL?.trim()
    || process.env.AUTH_URL?.trim()
    || 'https://dopameme.kr'
  const rpID = process.env.WEBAUTHN_RP_ID?.trim() || new URL(origin).hostname

  return {
    origin,
    rpID,
    rpName: RP_NAME,
  }
}

function encodeBase64Url(value: Uint8Array) {
  return Buffer.from(value).toString('base64url')
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, 'base64url')
}

function parseTransports(value: string | null): AuthenticatorTransportFuture[] | undefined {
  if (!value) return undefined

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter((item): item is AuthenticatorTransportFuture => typeof item === 'string')
      : undefined
  } catch {
    return undefined
  }
}

function stringifyTransports(value: AuthenticatorTransportFuture[] | undefined) {
  return value && value.length > 0 ? JSON.stringify(value) : null
}

function toCredentialDescriptor(
  credential: Pick<StoredCredential, 'credentialId' | 'transports'>,
): PublicKeyCredentialDescriptorFuture {
  return {
    id: decodeBase64Url(credential.credentialId),
    type: 'public-key',
    transports: parseTransports(credential.transports),
  }
}

function toAuthenticatorDevice(credential: StoredCredential) {
  return {
    credentialID: decodeBase64Url(credential.credentialId),
    credentialPublicKey: decodeBase64Url(credential.publicKey),
    counter: credential.counter,
    transports: parseTransports(credential.transports),
  }
}

async function getLatestChallenge(input: {
  userId: string
  type: 'registration' | 'authentication'
}) {
  return prisma.webAuthnChallenge.findFirst({
    where: {
      userId: input.userId,
      type: input.type,
      consumedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getRegistrationOptions(userId: string) {
  const ip = await getRequestIp()
  const rateLimit = checkRateLimit(`passkey-registration-options:${ip}:${userId}`, {
    limit: 20,
    windowMs: 10 * 60 * 1000,
  })

  if (!rateLimit.allowed) {
    return {
      ok: false as const,
      status: 429,
      code: 'rate_limit.exceeded',
      message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    }
  }

  const config = getWebAuthnConfig()
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      webAuthnCredentials: {
        select: {
          credentialId: true,
          transports: true,
        },
      },
    },
  })

  if (!user || user.status !== 'active') {
    return {
      ok: false as const,
      status: 403,
      code: 'auth.inactive',
      message: '이용할 수 없는 계정입니다.',
    }
  }

  if (user.webAuthnCredentials.length >= MAX_PASSKEYS_PER_USER) {
    return {
      ok: false as const,
      status: 400,
      code: 'webauthn.limit_exceeded',
      message: '등록 가능한 패스키 개수를 초과했습니다.',
    }
  }

  const options = await generateRegistrationOptions({
    rpName: config.rpName,
    rpID: config.rpID,
    userID: user.id,
    userName: user.email || user.name || user.id,
    userDisplayName: user.name || user.email || '도파밈 사용자',
    timeout: 60_000,
    attestationType: 'none',
    excludeCredentials: user.webAuthnCredentials.map(toCredentialDescriptor),
    authenticatorSelection: {
      residentKey: 'preferred',
      userVerification: 'required',
    },
  })

  await prisma.webAuthnChallenge.create({
    data: {
      userId: user.id,
      email: user.email ? normalizeEmail(user.email) : null,
      type: 'registration',
      challenge: options.challenge,
      expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
    },
  })

  return {
    ok: true as const,
    options,
  }
}

export async function verifyRegistration(userId: string, response: RegistrationResponseJSON) {
  const config = getWebAuthnConfig()
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      webAuthnCredentials: {
        select: { id: true },
      },
    },
  })

  if (!user || user.status !== 'active') {
    return {
      ok: false as const,
      status: 403,
      code: 'auth.inactive',
      message: '이용할 수 없는 계정입니다.',
    }
  }

  if (user.webAuthnCredentials.length >= MAX_PASSKEYS_PER_USER) {
    return {
      ok: false as const,
      status: 400,
      code: 'webauthn.limit_exceeded',
      message: '등록 가능한 패스키 개수를 초과했습니다.',
    }
  }

  const challenge = await getLatestChallenge({
    userId: user.id,
    type: 'registration',
  })

  if (!challenge) {
    return {
      ok: false as const,
      status: 400,
      code: 'webauthn.challenge_expired',
      message: '패스키 등록 요청이 만료되었습니다.',
    }
  }

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge: challenge.challenge,
    expectedOrigin: config.origin,
    expectedRPID: config.rpID,
    requireUserVerification: true,
  })

  if (!verification.verified || !verification.registrationInfo) {
    return {
      ok: false as const,
      status: 400,
      code: 'webauthn.verification_failed',
      message: '패스키 등록을 확인하지 못했습니다.',
    }
  }

  const { registrationInfo } = verification
  const credentialId = encodeBase64Url(registrationInfo.credentialID)

  await prisma.$transaction(async (tx) => {
    await tx.webAuthnCredential.create({
      data: {
        userId: user.id,
        credentialId,
        publicKey: encodeBase64Url(registrationInfo.credentialPublicKey),
        counter: registrationInfo.counter,
        transports: stringifyTransports(response.response.transports),
        deviceType: registrationInfo.credentialDeviceType,
        backedUp: registrationInfo.credentialBackedUp,
        name: '패스키',
      },
    })

    await tx.webAuthnChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    })
  })

  return {
    ok: true as const,
  }
}

export async function getAuthenticationOptions(emailInput: unknown) {
  const email = normalizeEmail(emailInput)

  if (!email || !isValidEmail(email)) {
    return {
      ok: false as const,
      status: 400,
      code: 'webauthn.email_required',
      message: '이메일을 입력해주세요.',
    }
  }

  const ip = await getRequestIp()
  const rateLimit = checkRateLimit(`passkey-options:${ip}:${email}`, {
    limit: 20,
    windowMs: 10 * 60 * 1000,
  })

  if (!rateLimit.allowed) {
    return {
      ok: false as const,
      status: 429,
      code: 'rate_limit.exceeded',
      message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      retryAfterSeconds: rateLimit.retryAfterSeconds,
    }
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      status: true,
      webAuthnCredentials: {
        select: {
          credentialId: true,
          transports: true,
        },
      },
    },
  })

  if (!user || user.status !== 'active' || user.webAuthnCredentials.length === 0) {
    return {
      ok: false as const,
      status: 400,
      code: 'webauthn.unavailable',
      message: '이메일 또는 패스키가 올바르지 않습니다.',
    }
  }

  const config = getWebAuthnConfig()
  const options = await generateAuthenticationOptions({
    rpID: config.rpID,
    timeout: 60_000,
    userVerification: 'required',
    allowCredentials: user.webAuthnCredentials.map(toCredentialDescriptor),
  })

  await prisma.webAuthnChallenge.create({
    data: {
      userId: user.id,
      email,
      type: 'authentication',
      challenge: options.challenge,
      expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
    },
  })

  return {
    ok: true as const,
    options,
  }
}

export async function verifyPasskeyLogin(input: {
  email: unknown
  responseJson: unknown
}) {
  const email = normalizeEmail(input.email)

  if (!email || !isValidEmail(email)) {
    throw new Error('이메일을 입력해주세요')
  }

  const response = typeof input.responseJson === 'string'
    ? JSON.parse(input.responseJson) as AuthenticationResponseJSON
    : input.responseJson as AuthenticationResponseJSON

  if (!response?.id || typeof response.id !== 'string') {
    throw new Error('패스키 응답이 올바르지 않습니다')
  }

  const ip = await getRequestIp()
  const rateLimit = checkRateLimit(`passkey-login:${ip}:${email}`, {
    limit: 10,
    windowMs: 15 * 60 * 1000,
  })

  if (!rateLimit.allowed) {
    throw new Error('로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요')
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      status: true,
      webAuthnCredentials: {
        where: { credentialId: response.id },
        select: {
          id: true,
          credentialId: true,
          publicKey: true,
          counter: true,
          transports: true,
        },
        take: 1,
      },
    },
  })

  const credential = user?.webAuthnCredentials[0]

  if (!user || user.status !== 'active' || !credential) {
    throw new Error('이메일 또는 패스키가 올바르지 않습니다')
  }

  const challenge = await getLatestChallenge({
    userId: user.id,
    type: 'authentication',
  })

  if (!challenge) {
    throw new Error('패스키 로그인 요청이 만료되었습니다')
  }

  const config = getWebAuthnConfig()
  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge: challenge.challenge,
    expectedOrigin: config.origin,
    expectedRPID: config.rpID,
    authenticator: toAuthenticatorDevice(credential),
    requireUserVerification: true,
  })

  if (!verification.verified) {
    throw new Error('패스키 인증을 확인하지 못했습니다')
  }

  await prisma.$transaction(async (tx) => {
    await tx.webAuthnCredential.update({
      where: { id: credential.id },
      data: {
        counter: verification.authenticationInfo.newCounter,
        deviceType: verification.authenticationInfo.credentialDeviceType,
        backedUp: verification.authenticationInfo.credentialBackedUp,
        lastUsedAt: new Date(),
      },
    })

    await tx.webAuthnChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    })
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
  }
}
