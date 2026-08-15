import { SITE_GATE_COOKIE, sitePasswordEnabled, verifySiteGateToken } from "../utils/site-gate"

export default defineEventHandler(async (event) => {
  const enabled = sitePasswordEnabled()
  if (!enabled) {
    return { enabled: false, unlocked: true }
  }

  const token = getCookie(event, SITE_GATE_COOKIE)
  const unlocked = await verifySiteGateToken(token)
  return { enabled: true, unlocked }
})
