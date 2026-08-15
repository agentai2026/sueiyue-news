import { motion } from "framer-motion"
import { Link } from "@tanstack/react-router"
import { IconGithub, IconLogin, IconLogout } from "./icons"

export function Menu() {
  const { loggedIn, login, logout, userInfo, enableLogin } = useLogin()
  const [shown, show] = useState(false)

  return (
    <span
      className="relative inline-flex items-center gap-2"
      onMouseEnter={() => show(true)}
      onMouseLeave={() => show(false)}
    >
      {!loggedIn && (
        <button
          type="button"
          onClick={login}
          className="sy-login-btn"
          title="Github 登录"
        >
          <IconLogin size={16} />
          <span>登录</span>
        </button>
      )}

      {loggedIn && (
        <button
          type="button"
          className="flex items-center"
          onClick={() => show(v => !v)}
          title="账户菜单"
        >
          {userInfo.avatar
            ? (
                <span
                  className="h-8 w-8 rounded-full bg-cover border border-[var(--line)]"
                  style={{ backgroundImage: `url(${userInfo.avatar}&s=32)` }}
                />
              )
            : (
                <span className="sy-login-btn">
                  <span>已登录</span>
                </span>
              )}
        </button>
      )}

      {!loggedIn && (
        <button
          type="button"
          className="sy-icon-btn"
          title="GitHub"
          onClick={() => window.open(Homepage)}
        >
          <IconGithub />
        </button>
      )}

      {shown && loggedIn && (
        <div className="absolute right-0 z-99 bg-transparent pt-3 top-8">
          <motion.div
            id="dropdown-menu"
            className="w-210px rounded-2xl border border-[var(--line)] bg-[var(--panel)] shadow-[var(--shadow)] overflow-hidden"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <ol className="p-2 text-sm text-[var(--ink)]">
              {enableLogin && (
                <li onClick={logout} className="cursor-pointer">
                  <IconLogout size={16} />
                  <span>退出登录</span>
                </li>
              )}
              <li onClick={() => window.open(Homepage)} className="cursor-pointer [&_*]:cursor-pointer">
                <IconGithub size={16} />
                <span>打开 GitHub</span>
              </li>
              <li className="cursor-pointer p-0!">
                <Link
                  to="/about"
                  className="flex items-center gap-2 w-full px-0 py-0 color-inherit no-underline"
                  onClick={() => show(false)}
                >
                  <span className="inline-flex w-4 h-4 items-center justify-center text-xs font-bold">关</span>
                  <span>关于</span>
                </Link>
              </li>
            </ol>
          </motion.div>
        </div>
      )}
    </span>
  )
}
