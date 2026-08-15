import type { PropsWithChildren } from "react"
import type { SourceID } from "@shared/types"
import type { BaseEventPayload, ElementDragType } from "@atlaskit/pragmatic-drag-and-drop/dist/types/internal-types"
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { reorderWithEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge"
import { createPortal } from "react-dom"
import { useThrottleFn } from "ahooks"
import { useAutoAnimate } from "@formkit/auto-animate/react"
import { motion } from "framer-motion"
import { useWindowSize } from "react-use"
import { isMobile } from "react-device-detect"
import { DndContext } from "../common/dnd"
import { useSortable } from "../common/dnd/useSortable"
import { OverlayScrollbar } from "../common/overlay-scrollbar"
import type { ItemsProps } from "./card"
import { CardWrapper } from "./card"
import { currentColumnIDAtom, currentSourcesAtom } from "~/atoms"

const AnimationDuration = 200
const WIDTH = 350
export function Dnd() {
  const [items, setItems] = useAtom(currentSourcesAtom)
  const currentColumnID = useAtomValue(currentColumnIDAtom)
  const sortable = currentColumnID === "focus"
  const [parent] = useAutoAnimate({ duration: AnimationDuration })
  useEntireQuery(items)
  const { width } = useWindowSize()
  const minWidth = useMemo(() => {
    // double padding = 32
    return Math.min(width - 32, WIDTH)
  }, [width])

  if (!items.length) return null

  return (
    <DndWrapper items={items} setItems={setItems} isSingleColumn={isMobile} sortable={sortable}>
      <OverlayScrollbar defer className="overflow-x-auto">
        <motion.ol
          className={isMobile
            ? "flex px-1 gap-4 pb-4 scroll-smooth"
            : "grid w-full gap-4"}
          ref={parent}
          style={isMobile
            ? {
              }
            : {
                gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
              }}
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {
              opacity: 0,
            },
            visible: {
              opacity: 1,
              transition: {
                delayChildren: 0.05,
                staggerChildren: 0.05,
              },
            },
          }}
        >
          {items.map((id, index) => (
            <motion.li
              key={id}
              className={$(isMobile && "flex-shrink-0", isMobile && index === items.length - 1 && "mr-2")}
              style={isMobile ? { width: `${width - 16 > WIDTH ? WIDTH : width - 16}px` } : undefined}
              transition={{
                type: "tween",
                duration: AnimationDuration / 1000,
              }}
              variants={{
                hidden: {
                  y: 20,
                  opacity: 0,
                },
                visible: {
                  y: 0,
                  opacity: 1,
                },
              }}
            >
              <SortableCardWrapper id={id} sortable={sortable} />
            </motion.li>
          ))}
        </motion.ol>
      </OverlayScrollbar>
      {isMobile && (
        <div className="flex justify-center">
          <span className="text-sm text-gray-500 text-center">左右滑动查看更多</span>
        </div>
      )}
    </DndWrapper>
  )
}

function DndWrapper({ items, setItems, isSingleColumn, sortable, children }: PropsWithChildren<{
  items: SourceID[]
  setItems: (items: SourceID[]) => void
  isSingleColumn: boolean
  sortable: boolean
}>) {
  const onDropTargetChange = useCallback(({ location, source }: BaseEventPayload<ElementDragType>) => {
    const traget = location.current.dropTargets[0]
    if (!traget?.data || !source?.data) return
    const closestEdgeOfTarget = extractClosestEdge(traget.data)
    const fromIndex = items.indexOf(source.data.id as SourceID)
    const toIndex = items.indexOf(traget.data.id as SourceID)
    if (fromIndex === toIndex || fromIndex === -1 || toIndex === -1) return
    const update = reorderWithEdge({
      list: items,
      startIndex: fromIndex,
      indexOfTarget: toIndex,
      closestEdgeOfTarget,
      axis: isSingleColumn ? "horizontal" : "vertical",
    })
    setItems(update)
  }, [items, setItems, isSingleColumn])
  // 避免动画干扰
  const { run } = useThrottleFn(onDropTargetChange, {
    leading: true,
    trailing: true,
    wait: AnimationDuration,
  })
  const { el } = useAtomValue(goToTopAtom)
  if (!sortable) return children

  return (
    <DndContext onDropTargetChange={run} autoscroll={el ? { element: el } : undefined}>
      {children}
    </DndContext>
  )
}

function CardOverlay({ id }: { id: SourceID }) {
  return (
    <div className={$("sy-card", !isiOS() && "rounded-20px")}>
      <div className={$("absolute left-0 top-4 bottom-4 w-1 rounded-r-md", `bg-${sources[id].color}-500`)} />
      <div className="sy-card-head">
        <div className="flex gap-2.5 items-center">
          <div
            className="w-9 h-9 rounded-xl bg-cover border border-[var(--line)]"
            style={{ backgroundImage: `url(/icons/${id.split("-")[0]}.png)` }}
          />
          <span className="flex flex-col">
            <span className="text-[15px] font-bold tracking-wide">{sources[id].name}</span>
            <span className="text-[11px] text-[var(--muted)]">拖拽中</span>
          </span>
        </div>
        <button type="button" className="i-ph:dots-six-vertical-duotone text-base cursor-grabbing text-[var(--ink-2)]" />
      </div>
    </div>
  )
}

function SortableCardWrapper({ id, sortable }: ItemsProps & { sortable: boolean }) {
  const {
    isDragging,
    setNodeRef,
    setHandleRef,
    OverlayContainer,
  } = useSortable({ id })

  useEffect(() => {
    if (OverlayContainer) {
      OverlayContainer!.className += $("overflow-hidden", !isiOS() && "rounded-24px")
    }
  }, [OverlayContainer])

  return (
    <>
      <CardWrapper
        ref={setNodeRef}
        id={id}
        isDragging={isDragging}
        setHandleRef={sortable ? setHandleRef : undefined}
      />
      {OverlayContainer && createPortal(<CardOverlay id={id} />, OverlayContainer)}
    </>
  )
}
