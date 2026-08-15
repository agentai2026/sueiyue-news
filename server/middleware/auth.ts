import process from "node:process"
import { jwtVerify } from "jose"
import { SITE_GATE_COOKIE, sitePasswordEnabled, verifySiteGateToken } from "../utils/site-gate"

function loginConfigured() {
  const hasJwt = !!process.env.JWT_SECRET
  const hasGithub = !!(process.env.G_CLIENT_ID && process.env.G_CLIENT_SECRET)
  const hasDev = process.env.ENABLE_DEV_LOGIN === "true"
  return hasJwt && (hasGithub || hasDev)
}

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  if (!url.pathname.startsWith("/api")) return

  if (sitePasswordEnabled() && !url.pathname.startsWith("/api/site-gate")) {
    const token = getCookie(event, SITE_GATE_COOKIE)
    const unlocked = await verifySiteGateToken(token)
    if (!unlocked) {
      throw createError({ statusCode: 403, message: "需要站点密码" })
    }
  }

  if (!loginConfigured()) {
    event.context.disabledLogin = true
    if (["/api/s", "/api/proxy", "/api/latest", "/api/feedback"].every(p => !url.pathname.startsWith(p)))
      throw createError({ statusCode: 506, message: "Server not configured, disable login" })
  } else {
    if (["/api/s", "/api/me"].find(p => url.pathname.startsWith(p))) {
      const token = getHeader(event, "Authorization")?.replace(/Bearer\s*/, "")?.trim()
      if (token) {
        try {
          const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET)) as { payload?: { id: string, type: string } }
          if (payload?.id) {
            event.context.user = {
              id: payload.id,
              type: payload.type,
            }
          }
        } catch {
          if (url.pathname.startsWith("/api/me"))
            throw createError({ statusCode: 401, message: "JWT verification failed" })
          else logger.warn("JWT verification failed")
        }
      } else if (url.pathname.startsWith("/api/me")) {
        throw createError({ statusCode: 401, message: "JWT verification failed" })
      }
    }
  }
})
