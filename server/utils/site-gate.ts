import process from "node:process"
import { SignJWT, jwtVerify } from "jose"

export const SITE_GATE_COOKIE = "sy_site_gate_v2"

export function sitePasswordEnabled() {
  return !!process.env.SITE_PASSWORD?.trim()
}

function secretKey() {
  const secret = process.env.JWT_SECRET || process.env.SITE_PASSWORD || "sueiyue-site-gate"
  return new TextEncoder().encode(secret)
}

export async function createSiteGateToken() {
  return await new SignJWT({ gate: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secretKey())
}

export async function verifySiteGateToken(token?: string | null) {
  if (!token) return false
  try {
    const { payload } = await jwtVerify(token, secretKey())
    return payload?.gate === true
  } catch {
    return false
  }
}

export function checkSitePassword(input: string) {
  const expected = process.env.SITE_PASSWORD?.trim()
  if (!expected) return true
  return input === expected
}
