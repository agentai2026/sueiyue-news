import process from "node:process"

function hasGithubOAuth() {
  return !!(process.env.G_CLIENT_ID && process.env.G_CLIENT_SECRET)
}

function hasDevLogin() {
  return process.env.ENABLE_DEV_LOGIN === "true"
}

export default defineEventHandler(async (event) => {
  if (hasGithubOAuth()) {
    return sendRedirect(event, `https://github.com/login/oauth/authorize?client_id=${process.env.G_CLIENT_ID}`)
  }
  if (hasDevLogin()) {
    return sendRedirect(event, "/api/oauth/dev")
  }
  throw createError({ statusCode: 506, message: "Login not configured" })
})
