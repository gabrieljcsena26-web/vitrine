import { randomBytes, scryptSync, timingSafeEqual } from 'crypto'

const PASSWORD_HASH_BYTES = 64

export function safeEqual(leftValue: string, rightValue: string) {
  const left = Buffer.from(leftValue)
  const right = Buffer.from(rightValue)
  return left.length === right.length && timingSafeEqual(left, right)
}

export function hashPassword(password: string, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(password, salt, PASSWORD_HASH_BYTES).toString('hex')
  return { salt, hash }
}

export function verifyPassword(password: string, salt: string, hash: string) {
  return safeEqual(hashPassword(password, salt).hash, hash)
}