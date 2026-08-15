import process from "node:process"
import { sitePasswordEnabled } from "../../utils/site-gate"

export default defineEventHandler(() => {
  if (!sitePasswordEnabled()) {
    throw createError({ statusCode: 404, message: "未开启站点密码" })
  }

  return {
    password: process.env.SITE_PASSWORD?.trim() || "",
  }
})
