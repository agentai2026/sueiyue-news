import { Link } from "@tanstack/react-router"
import { useIsFetching, useQueryClient } from "@tanstack/react-query"
import type { SourceID, SourceResponse } from "@shared/types"
import { Menu } from "./menu"
import { IconArrowUp, IconRefresh } from "./icons"
import { currentSourcesAtom, goToTopAtom } from "~/atoms"
import { cacheSources } from "~/utils/data"

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

function SourceHealth() {
  const currentSources = useAtomValue(currentSourcesAtom)
  const queryClient = useQueryClient()
  const [, tick] = useReducer(n => n + 1, 0)

  useEffect(() => {
    return queryClient.getQueryCache().subscribe(() => tick())
  }, [queryClient])

  let failed = 0
  for (const id of currentSources) {
    const state = queryClient.getQueryState<SourceResponse>(["source", id])
    const data = state?.data ?? cacheSources.get(id)
    const hasItems = !!data?.items?.length
    // 只有真正请求失败且没有任何可展示内容，才算失效。
    // 空列表、尚未加载、刷新失败但旧数据还在，都不算失效。
    if (state?.status === "error" && !hasItems) failed += 1
  }
  const available = Math.max(0, currentSources.length - failed)

  return (
    <span className="sy-health" title={`当前栏目共 ${currentSources.length} 个站点`}>
      <span className="sy-health-ok">可用站点 {available}</span>
      <span className="sy-health-bad">失效站点 {failed}</span>
    </span>
  )
}

export function Header() {
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

      <span className="sy-actions">
        <RefreshCountdown />
        <Refresh />
        <Menu />
        <SourceHealth />
        <GoTop />
      </span>
    </div>
  )
}
