export function normalizeEmail(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim().toLowerCase()
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

export function normalizeName(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim()
}

export function isValidNickname(name: string) {
  return name.length >= 2 && name.length <= 12 && !/[\p{C}\s]/u.test(name)
}

export function isValidPassword(password: unknown) {
  return typeof password === 'string' && password.length >= 8 && password.length <= 128
}
