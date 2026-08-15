import process from "node:process"
import { SignJWT } from "jose"
import { UserTable } from "#/database/user"

/**
 * 本地测试登录（无需 GitHub OAuth）
 * 仅当 ENABLE_DEV_LOGIN=true 时可用
 */
export default defineEventHandler(async (event) => {
  if (process.env.ENABLE_DEV_LOGIN !== "true") {
    throw createError({ statusCode: 403, message: "Dev login disabled" })
  }
  if (!process.env.JWT_SECRET) {
    throw createError({ statusCode: 500, message: "JWT_SECRET missing" })
  }

  const db = useDatabase()
  const userTable = db ? new UserTable(db) : undefined
  if (!userTable) throw new Error("db is not defined")
  if (process.env.INIT_TABLE !== "false") await userTable.init()

  const userID = "dev-user-001"
  await userTable.addUser(userID, "dev@localhost", "github")

  const jwtToken = await new SignJWT({
    id: userID,
    type: "github",
  })
    .setExpirationTime("60d")
    .setProtectedHeader({ alg: "HS256" })
    .sign(new TextEncoder().encode(process.env.JWT_SECRET))

  const params = new URLSearchParams({
    login: "dev",
    jwt: jwtToken,
    user: JSON.stringify({
      avatar: "https://avatars.githubusercontent.com/u/583231?v=4",
      name: "测试用户",
    }),
  })
  return sendRedirect(event, `/?${params.toString()}`)
})
