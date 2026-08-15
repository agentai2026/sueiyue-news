import { Link, useRouterState } from "@tanstack/react-router"
import { IconGithub } from "./icons"

export function Menu() {
  const aboutActive = useRouterState({ select: s => s.location.pathname === "/about" })

  return (
    <>
      <Link
        to="/about"
        className={$("sy-about-link", aboutActive && "is-active")}
        title="关于与反馈"
      >
        关于
      </Link>
      <button
        type="button"
        className="sy-icon-btn"
        title="GitHub"
        onClick={() => window.open(Homepage)}
      >
        <IconGithub />
      </button>
    </>
  )
}
