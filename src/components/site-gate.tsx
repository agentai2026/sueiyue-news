import { useEffect, useState } from "react"

type GateStatus = {
  enabled: boolean
  unlocked: boolean
}

export function SiteGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<GateStatus | null>(null)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetchingPassword, setFetchingPassword] = useState(false)

  useEffect(() => {
    myFetch<GateStatus>("/site-gate")
      .then(setStatus)
      .catch(() => setStatus({ enabled: true, unlocked: false }))
  }, [])

  async function fetchPassword() {
    if (fetchingPassword) return
    setFetchingPassword(true)
    setError("")
    try {
      const res = await myFetch<{ password: string }>("/site-gate/password")
      setPassword(res.password || "")
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "获取密码失败")
    } finally {
      setFetchingPassword(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!password.trim() || loading) return
    setLoading(true)
    setError("")
    try {
      await myFetch("/site-gate", {
        method: "POST",
        body: { password },
      })
      setStatus({ enabled: true, unlocked: true })
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "密码错误")
    } finally {
      setLoading(false)
    }
  }

  if (!status) {
    return (
      <div className="sy-gate">
        <div className="sy-gate-card">
          <p className="sy-gate-loading">加载中…</p>
        </div>
      </div>
    )
  }

  if (status.enabled && !status.unlocked) {
    return (
      <div className="sy-gate">
        <form className="sy-gate-card" onSubmit={submit}>
          <img src="/icon.png" alt="岁月新闻" className="sy-gate-logo" />
          <h1>岁月实时新闻</h1>
          <p>此站点已开启访问密码，请输入后继续浏览。</p>
          <div className="sy-gate-field">
            <input
              type="text"
              className="sy-gate-input"
              placeholder="请输入访问密码"
              value={password}
              autoFocus
              autoComplete="off"
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="sy-gate-get-pwd"
              onClick={fetchPassword}
              disabled={fetchingPassword}
            >
              {fetchingPassword ? "获取中…" : "获取密码"}
            </button>
          </div>
          {error && <p className="sy-gate-error">{error}</p>}
          <button type="submit" className="sy-login-btn sy-gate-submit" disabled={loading}>
            {loading ? "验证中…" : "进入"}
          </button>
        </form>
      </div>
    )
  }

  return <>{children}</>
}
