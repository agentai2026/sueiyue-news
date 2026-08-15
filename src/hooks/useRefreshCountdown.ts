import { useIsFetching, useQueryClient } from "@tanstack/react-query"
import type { SourceID, SourceResponse } from "@shared/types"
import { currentSourcesAtom } from "~/atoms"

function pad(n: number) {
  return String(n).padStart(2, "0")
}

/**
 * 根据当前栏目最近更新时间，倒计时到下一次刷新点（默认 Interval = 10 分钟）
 */
export function useRefreshCountdown() {
  const currentSources = useAtomValue(currentSourcesAtom)
  const queryClient = useQueryClient()
  const [now, setNow] = useState(() => Date.now())
  const fetching = useIsFetching({
    predicate: (query) => {
      const [type, id] = query.queryKey as ["source" | "entire", SourceID]
      return type === "source" && currentSources.includes(id)
    },
  })

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  // 拉取中或数据变化时重新计算
  const latestUpdated = useMemo(() => {
    let max = 0
    for (const id of currentSources) {
      const cached = cacheSources.get(id)
      if (cached?.updatedTime && cached.updatedTime > max) max = cached.updatedTime
      const q = queryClient.getQueryData<SourceResponse>(["source", id])
      if (q?.updatedTime && q.updatedTime > max) max = q.updatedTime
    }
    return max
  }, [currentSources, queryClient, now, fetching])

  const nextAt = latestUpdated > 0 ? latestUpdated + Interval : now + Interval
  const remainMs = Math.max(0, nextAt - now)
  const totalSec = Math.floor(remainMs / 1000)
  const mm = Math.floor(totalSec / 60)
  const ss = totalSec % 60
  const ready = remainMs <= 0

  return {
    ready,
    label: ready ? "可刷新" : `${pad(mm)}:${pad(ss)}`,
    remainMs,
  }
}
