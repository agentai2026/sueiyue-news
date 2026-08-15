import "~/styles/globals.css"
import "virtual:uno.css"
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import type { QueryClient } from "@tanstack/react-query"
import { isMobile } from "react-device-detect"
import { Header } from "~/components/header"
import { GlobalOverlayScrollbar } from "~/components/common/overlay-scrollbar"
import { Footer } from "~/components/footer"
import { Toast } from "~/components/common/toast"
import { SearchBar } from "~/components/common/search-bar"
import { SiteGate } from "~/components/site-gate"

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
})

function NotFoundComponent() {
  const nav = Route.useNavigate()
  nav({ to: "/" })
}

function RootComponent() {
  useOnReload()
  useSync()
  usePWA()
  const { isDark } = useDark()

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark)
  }, [isDark])

  return (
    <SiteGate>
      <GlobalOverlayScrollbar
        className={$([
          !isMobile && "px-3",
          "h-full overflow-x-auto",
          "md:(px-5)",
          "lg:(px-8)",
        ])}
      >
        <div className="sy-shell py-3">
          <header className="sticky top-0 z-20 py-2">
            <Header />
          </header>
          <main className="mt-3 min-h-[calc(100vh-200px)] pb-4">
            <Outlet />
          </main>
          <footer className="sy-footer py-7 flex flex-col items-center justify-center gap-1 text-xs tracking-wide">
            <Footer />
          </footer>
        </div>
      </GlobalOverlayScrollbar>
      <Toast />
      <SearchBar />
      {import.meta.env.DEV && (
        <>
          <ReactQueryDevtools buttonPosition="bottom-left" />
          <TanStackRouterDevtools position="bottom-right" />
        </>
      )}
    </SiteGate>
  )
}
