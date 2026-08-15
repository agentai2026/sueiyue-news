import type { NewsItem, SourceID, SourceResponse } from "@shared/types"
import { useQuery } from "@tanstack/react-query"
import { AnimatePresence, motion, useInView } from "framer-motion"
import { useWindowSize } from "react-use"
import { forwardRef, useImperativeHandle } from "react"
import { OverlayScrollbar } from "../common/overlay-scrollbar"
import { safeParseString } from "~/utils"

export interface ItemsProps extends React.HTMLAttributes<HTMLDivElement> {
  id: SourceID
  isDragging?: boolean
  setHandleRef?: (ref: HTMLElement | null) => void
}

interface NewsCardProps {
  id: SourceID
  setHandleRef?: (ref: HTMLElement | null) => void
}

export const CardWrapper = forwardRef<HTMLElement, ItemsProps>(({ id, isDragging, setHandleRef, style, ...props }, dndRef) => {
  const ref = useRef<HTMLDivElement>(null)

  const inView = useInView(ref, {
    once: true,
  })

  useImperativeHandle(dndRef, () => ref.current! as HTMLDivElement)

  return (
    <div
      ref={ref}
      className={$("sy-card", isDragging && "op-50")}
      style={{
        transformOrigin: "50% 50%",
        ...style,
      }}
      {...props}
    >
      <div className={$("absolute left-0 top-4 bottom-4 w-1 rounded-r-md", `bg-${sources[id].color}-500`)} />
      {inView && <NewsCard id={id} setHandleRef={setHandleRef} />}
    </div>
  )
})

function NewsCard({ id, setHandleRef }: NewsCardProps) {
  const { refresh } = useRefetch()
  const { data, isFetching, isError } = useQuery({
    queryKey: ["source", id],
    queryFn: async ({ queryKey }) => {
      const id = queryKey[1] as SourceID
      let url = `/s?id=${id}`
      const headers: Record<string, any> = {}
      if (refetchSources.has(id)) {
        url = `/s?id=${id}&latest`
        const jwt = safeParseString(localStorage.getItem("jwt"))
        if (jwt) headers.Authorization = `Bearer ${jwt}`
        refetchSources.delete(id)
      } else if (cacheSources.has(id)) {
        await delay(200)
        return cacheSources.get(id)
      }

      const response: SourceResponse = await myFetch(url, {
        headers,
      })

      function diff() {
        try {
          if (response.items && sources[id].type === "hottest" && cacheSources.has(id)) {
            response.items.forEach((item, i) => {
              const o = cacheSources.get(id)!.items.findIndex(k => k.id === item.id)
              item.extra = {
                ...item?.extra,
                diff: o === -1 ? undefined : o - i,
              }
            })
          }
        } catch (e) {
          console.error(e)
        }
      }

      diff()
      cacheSources.set(id, response)
      return response
    },
    placeholderData: prev => prev,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const { isFocused, toggleFocus } = useFocusWith(id)

  return (
    <>
      <div className="sy-card-head">
        <div className="flex gap-2.5 items-center min-w-0">
          <a
            className="w-9 h-9 rounded-xl bg-cover shrink-0 border border-[var(--line)]"
            target="_blank"
            href={sources[id].home}
            title={sources[id].desc}
            style={{ backgroundImage: `url(/icons/${id.split("-")[0]}.png)` }}
          />
          <span className="flex flex-col min-w-0">
            <span className="flex items-center gap-2 min-w-0">
              <span className="text-[15px] font-bold tracking-wide truncate" title={sources[id].desc}>
                {sources[id].name}
              </span>
              {sources[id]?.title && (
                <span className="text-[11px] shrink-0 px-1.5 py-0.5 rounded-md bg-[var(--bg)] text-[var(--muted)] font-medium">
                  {sources[id].title}
                </span>
              )}
            </span>
            <span className="text-[11px] text-[var(--muted)]">
              <UpdatedTime isError={isError} updatedTime={data?.updatedTime} />
            </span>
          </span>
        </div>
        <div className="flex gap-1.5 items-center shrink-0">
          <a
            href={sources[id].home}
            target="_blank"
            rel="noopener noreferrer"
            className="sy-home-btn"
            title={`打开 ${sources[id].name} 官网`}
          >
            官网
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
          <button
            type="button"
            className="sy-card-icon-btn"
            title="刷新"
            onClick={() => refresh(id)}
          >
            <svg className={isFetching ? "animate-spin" : undefined} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <polyline points="21 3 21 9 15 9" />
            </svg>
          </button>
          <button
            type="button"
            className={$("sy-card-icon-btn", isFocused && "is-active")}
            title={isFocused ? "取消关注" : "关注"}
            onClick={toggleFocus}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={isFocused ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
          {setHandleRef && (
            <div
              ref={setHandleRef}
              className="sy-card-icon-btn cursor-grab"
              title="拖拽排序"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="9" cy="6" r="1.5" />
                <circle cx="15" cy="6" r="1.5" />
                <circle cx="9" cy="12" r="1.5" />
                <circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="18" r="1.5" />
                <circle cx="15" cy="18" r="1.5" />
              </svg>
            </div>
          )}
        </div>
      </div>

      <OverlayScrollbar
        className={$("sy-card-list overflow-y-auto", isFetching && "animate-pulse")}
        options={{ overflow: { x: "hidden" } }}
        defer
      >
        <div className={$("transition-opacity-500", isFetching && "op-25")}>
          {!!data?.items?.length && (sources[id].type === "hottest" ? <NewsListHot items={data.items} /> : <NewsListTimeLine items={data.items} />)}
        </div>
      </OverlayScrollbar>
    </>
  )
}

function UpdatedTime({ isError, updatedTime }: { updatedTime: any, isError: boolean }) {
  const relativeTime = useRelativeTime(updatedTime ?? "")
  if (relativeTime) return `${relativeTime}更新`
  if (isError) return "获取失败"
  return "加载中..."
}

function DiffNumber({ diff }: { diff: number }) {
  const [shown, setShown] = useState(true)
  useEffect(() => {
    setShown(true)
    const timer = setTimeout(() => setShown(false), 5000)
    return () => clearTimeout(timer)
  }, [diff])

  return (
    <AnimatePresence>
      {shown && (
        <motion.span
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 0.8, y: -7 }}
          exit={{ opacity: 0, y: -15 }}
          className={$("absolute left-0 text-xs font-bold", diff < 0 ? "text-emerald-600" : "text-[var(--accent)]")}
        >
          {diff > 0 ? `+${diff}` : diff}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

function ExtraInfo({ item }: { item: NewsItem }) {
  if (item?.extra?.info) return <>{item.extra.info}</>
  if (item?.extra?.icon) {
    const { url, scale } = typeof item.extra.icon === "string" ? { url: item.extra.icon, scale: undefined } : item.extra.icon
    return (
      <img
        src={url}
        style={{ transform: `scale(${scale ?? 1})` }}
        className="h-4 inline mt--1"
        referrerPolicy="no-referrer"
        onError={e => e.currentTarget.style.display = "none"}
      />
    )
  }
}

function NewsUpdatedTime({ date }: { date: string | number }) {
  const relativeTime = useRelativeTime(date)
  return <>{relativeTime}</>
}

function NewsListHot({ items }: { items: NewsItem[] }) {
  const { width } = useWindowSize()
  return (
    <ol className="flex flex-col">
      {items?.map((item, i) => (
        <a
          href={width < 768 ? item.mobileUrl || item.url : item.url}
          target="_blank"
          key={item.id}
          title={item.extra?.hover}
          className="sy-item relative"
        >
          <span className={$("sy-rank", i < 3 && "is-hot")}>{i + 1}</span>
          {!!item.extra?.diff && <DiffNumber diff={item.extra.diff} />}
          <span className="min-w-0">
            <span className="sy-item-title mr-2">{item.title}</span>
            <span className="text-[11px] text-[var(--muted)]">
              <ExtraInfo item={item} />
            </span>
          </span>
        </a>
      ))}
    </ol>
  )
}

function NewsListTimeLine({ items }: { items: NewsItem[] }) {
  const { width } = useWindowSize()
  return (
    <ol className="border-s border-[var(--line)] flex flex-col ml-2 gap-1">
      {items?.map(item => (
        <li key={`${item.id}-${item.pubDate || item?.extra?.date || ""}`} className="flex flex-col pl-1">
          <span className="flex items-center gap-1.5 text-[var(--muted)] text-[11px]">
            <span className="text-[var(--accent)]">●</span>
            {(item.pubDate || item?.extra?.date) && <NewsUpdatedTime date={(item.pubDate || item?.extra?.date)!} />}
            <ExtraInfo item={item} />
          </span>
          <a
            className="sy-item ml-0.5"
            href={width < 768 ? item.mobileUrl || item.url : item.url}
            title={item.extra?.hover}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sy-item-title">{item.title}</span>
          </a>
        </li>
      ))}
    </ol>
  )
}
