import clamp from './clamp'

const salt = Math.random() * 256 + 1

export default function generate (length = 1) {
  const preProtectedLength = clamp(1, length, 9)
  const protectedLength = isNaN(preProtectedLength) ? 1 : preProtectedLength
  const scale = 10 ** protectedLength

  return Math.round(Math.random() * scale * salt)
    .toString()
    .slice(-1 - protectedLength, -1)
    .padStart(protectedLength, '0')
}