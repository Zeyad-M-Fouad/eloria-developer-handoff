import { randomInt } from "crypto"

// Unambiguous alphabet (no O/0, I/1) for codes read over WhatsApp.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

export function generateOrderCode(): string {
  let body = ""
  for (let i = 0; i < 6; i++) body += ALPHABET[randomInt(ALPHABET.length)]
  return `ELR-${body}`
}

export function generateRefCode(prefix: string): string {
  let body = ""
  for (let i = 0; i < 5; i++) body += ALPHABET[randomInt(ALPHABET.length)]
  return `${prefix}-${body}`
}
