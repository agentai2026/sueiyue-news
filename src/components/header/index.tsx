import { Link } from "@tanstack/react-router"
import { useIsFetching } from "@tanstack/react-query"
import type { SourceID } from "@shared/types"
import { NavBar } from "../navbar"
import { Menu } from "./menu"
import { IconArrowUp, IconRefresh } from "./icons"
import { currentSourcesAtom, goToTopAtom } from "~/atoms"

function useNowClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [])
  return now.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

function GoTop() {
  const { ok, fn: goToTop } = useAtomValue(goToTopAtom)
  if (!ok) return null
  return (
    <button type="button" title="回到顶部" className="sy-icon-btn" onClick={goToTop}>
      <IconArrowUp />
    </button>
  )
}

function Refresh() {
  const currentSources = useAtomValue(currentSourcesAtom)
  const { refresh } = useRefetch()
  const refreshAll = useCallback(() => refresh(...currentSources), [refresh, currentSources])

  const isFetching = useIsFetching({
    predicate: (query) => {
      const [type, id] = query.queryKey as ["source" | "entire", SourceID]
      return (type === "source" && currentSources.includes(id)) || type === "entire"
    },
  })

  return (
    <button type="button" title="刷新全部" className="sy-icon-btn" onClick={refreshAll}>
      <IconRefresh spinning={!!isFetching} />
    </button>
  )
}

function RefreshCountdown() {
  const { ready, label } = useRefreshCountdown()
  return (
    <span className={$("sy-countdown", ready && "is-ready")} title="距离下次信息刷新">
      <span className="sy-countdown-label">刷新</span>
      <span className="sy-countdown-time">{label}</span>
    </span>
  )
}

export function Header() {
  const time = useNowClock()

  return (
    <div className="sy-topbar">
      <Link to="/" className="sy-brand">
        <span className="sy-brand-mark">
          <img src="/icon.png" alt="岁月新闻" />
        </span>
        <span className="min-w-0">
          <span className="sy-brand-title">岁月实时新闻</span>
          <div className="sy-brand-sub hidden sm:block">热点聚合 · 一眼看见今天</div>
        </span>
      </Link>

      <span className="sy-topbar-nav hidden lg:inline-flex">
        <NavBar />
      </span>

      <span className="sy-actions">
        <RefreshCountdown />
        <Refresh />
        <Menu />
        <span className="sy-live hidden md:inline-flex">
          <span className="sy-live-dot" />
          LIVE
        </span>
        <span className="sy-time">{time}</span>
        <GoTop />
      </span>
    </div>
  )
}
