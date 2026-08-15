import {
  SITE_GATE_COOKIE,
  checkSitePassword,
  createSiteGateToken,
  sitePasswordEnabled,
} from "../utils/site-gate"

export default defineEventHandler(async (event) => {
  if (!sitePasswordEnabled()) {
    return { ok: true, unlocked: true }
  }

  const body = await readBody<{ password?: string }>(event)
  const password = body?.password?.trim() || ""

  if (!checkSitePassword(password)) {
    throw createError({ statusCode: 401, message: "密码错误" })
  }

  const token = await createSiteGateToken()
  setCookie(event, SITE_GATE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  })

  return { ok: true, unlocked: true }
})
