import { Link, createFileRoute } from "@tanstack/react-router"
import type { FormEvent } from "react"
import { useTitle } from "react-use"

export const Route = createFileRoute("/about")({
  component: AboutPage,
})

type FeedbackType = "bug" | "idea" | "other"

function AboutPage() {
  useTitle("关于 · 岁月实时新闻")
  const toaster = useToast()
  const [name, setName] = useState("")
  const [contact, setContact] = useState("")
  const [type, setType] = useState<FeedbackType>("idea")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const submitFeedback = async (e: FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    try {
      const res = await myFetch<{ ok: boolean, message: string }>("/feedback", {
        method: "POST",
        body: { name, contact, type, content },
      })
      toaster(res.message || "感谢反馈，我们已收到", { type: "success" })
      setContent("")
      setName("")
      setContact("")
      setType("idea")
    } catch (err: any) {
      toaster(err?.data?.message || err?.message || "提交失败，请稍后再试", { type: "error" })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="sy-about-page">
      <section className="sy-about-hero">
        <Link to="/" className="sy-about-back">← 返回首页</Link>
        <div className="sy-about-hero-row">
          <span className="sy-about-mark">
            <img src="/icon.png" alt="岁月新闻" />
          </span>
          <div>
            <p className="sy-about-kicker">ABOUT</p>
            <h1>关于岁月实时新闻</h1>
            <p className="sy-about-lead">聚合当下热点，也欢迎你把想法告诉我们。</p>
          </div>
        </div>
      </section>

      <div className="sy-about-layout">
        <div className="sy-about-main">
          <section className="sy-about-card">
            <h2>我们做什么</h2>
            <p>
              岁月实时新闻把各平台热榜收进同一页，帮你快速看见今天正在发生的事。
              可以直接关注常用站点，需要时再手动刷新。
            </p>
            <div className="sy-about-tags">
              <span>多源热榜</span>
              <span>关注来源</span>
              <span>一键官网</span>
              <span>实时刷新</span>
            </div>
          </section>

          <section className="sy-about-card">
            <h2>项目信息</h2>
            <ul className="sy-about-meta">
              <li>
                <span>当前版本</span>
                <span>{`v${Version}`}</span>
              </li>
              <li>
                <span>开源协议</span>
                <a href={`${Homepage}/blob/main/LICENSE`} target="_blank" rel="noreferrer">Apache-2.0</a>
              </li>
              <li>
                <span>代码仓库</span>
                <a href={Homepage} target="_blank" rel="noreferrer">GitHub</a>
              </li>
              <li>
                <span>维护者</span>
                <a href={Author.url} target="_blank" rel="noreferrer">{Author.name}</a>
              </li>
            </ul>
          </section>
        </div>

        <section className="sy-about-card sy-feedback-card">
          <h2>意见反馈</h2>
          <p className="sy-feedback-desc">
            填写后直接提交到项目仓库 Issue，不用你再去 GitHub 里发帖。
          </p>

          <form className="sy-feedback-form" onSubmit={submitFeedback}>
            <div className="sy-feedback-types" role="radiogroup" aria-label="反馈类型">
              {([
                ["idea", "功能建议"],
                ["bug", "问题反馈"],
                ["other", "其他"],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={$("sy-feedback-type", type === value && "is-active")}
                  onClick={() => setType(value)}
                >
                  {label}
                </button>
              ))}
            </div>

            <label className="sy-field">
              <span>你的称呼（可选）</span>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="怎么称呼你"
                maxLength={40}
              />
            </label>

            <label className="sy-field">
              <span>联系方式（可选）</span>
              <input
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder="邮箱 / 微信 / QQ"
                maxLength={80}
              />
            </label>

            <label className="sy-field">
              <span>反馈内容</span>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="说说你的想法、遇到的问题，或希望增加的功能…"
                rows={6}
                maxLength={2000}
                required
              />
              <em>{content.length}/2000</em>
            </label>

            <button type="submit" className="sy-feedback-submit" disabled={submitting}>
              {submitting ? "提交中…" : "提交反馈"}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}
