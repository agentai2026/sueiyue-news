import process from "node:process"

function hasGithubOAuth() {
  return !!(process.env.G_CLIENT_ID && process.env.G_CLIENT_SECRET)
}

function hasDevLogin() {
  return process.env.ENABLE_DEV_LOGIN === "true"
}

export default defineEventHandler(async () => {
  if (hasGithubOAuth()) {
    return {
      enable: true,
      url: `https://github.com/login/oauth/authorize?client_id=${process.env.G_CLIENT_ID}`,
    }
  }
  if (hasDevLogin() && process.env.JWT_SECRET) {
    return {
      enable: true,
      url: "/api/oauth/dev",
    }
  }
  return {
    enable: false,
  }
})
