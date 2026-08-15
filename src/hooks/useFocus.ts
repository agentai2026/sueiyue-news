import type { SourceID } from "@shared/types"
import { focusSourcesAtom } from "~/atoms"

export function useFocus() {
  const [focusSources, setFocusSources] = useAtom(focusSourcesAtom)
  const { enableLogin, loggedIn, login } = useLogin()
  const toaster = useToast()

  const toggleFocus = useCallback((id: SourceID) => {
    if (enableLogin && !loggedIn) {
      toaster("登录后才能关注来源", {
        type: "warning",
        action: {
          label: "登录",
          onClick: login,
        },
      })
      return
    }
    setFocusSources(focusSources.includes(id) ? focusSources.filter(i => i !== id) : [...focusSources, id])
  }, [setFocusSources, focusSources, enableLogin, loggedIn, login, toaster])

  const isFocused = useCallback((id: SourceID) => focusSources.includes(id), [focusSources])

  return {
    toggleFocus,
    isFocused,
  }
}

export function useFocusWith(id: SourceID) {
  const [focusSources, setFocusSources] = useAtom(focusSourcesAtom)
  const { enableLogin, loggedIn, login } = useLogin()
  const toaster = useToast()

  const toggleFocus = useCallback(() => {
    if (enableLogin && !loggedIn) {
      toaster("登录后才能关注来源", {
        type: "warning",
        action: {
          label: "登录",
          onClick: login,
        },
      })
      return
    }
    setFocusSources(focusSources.includes(id) ? focusSources.filter(i => i !== id) : [...focusSources, id])
  }, [setFocusSources, focusSources, id, enableLogin, loggedIn, login, toaster])

  const isFocused = useMemo(() => focusSources.includes(id), [id, focusSources])

  return {
    toggleFocus,
    isFocused,
  }
}
