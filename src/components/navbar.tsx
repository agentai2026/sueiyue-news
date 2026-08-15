import { fixedColumnIds, metadata } from "@shared/metadata"
import { Link, useRouterState } from "@tanstack/react-router"
import { currentColumnIDAtom } from "~/atoms"

export function NavBar() {
  const currentId = useAtomValue(currentColumnIDAtom)
  const { toggle } = useSearchBar()
  const pathname = useRouterState({ select: s => s.location.pathname })
  const aboutActive = pathname === "/about"

  return (
    <nav className="sy-nav">
      <button type="button" onClick={() => toggle(true)}>
        更多
      </button>
      {fixedColumnIds.map(columnId => (
        <Link
          key={columnId}
          to="/c/$column"
          params={{ column: columnId }}
          className={!aboutActive && currentId === columnId ? "is-active" : undefined}
        >
          {metadata[columnId].name}
        </Link>
      ))}
      <Link to="/about" className={aboutActive ? "is-active" : undefined}>
        关于
      </Link>
    </nav>
  )
}
