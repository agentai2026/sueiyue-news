import { Link } from "@tanstack/react-router"

export function Footer() {
  return (
    <>
      <span>岁月实时新闻 · 热点聚合</span>
      <span className="flex items-center gap-2">
        <Link to="/about">关于</Link>
        <span>·</span>
        <a href={`${Homepage}/blob/main/LICENSE`} target="_blank" rel="noreferrer">Apache-2.0</a>
        <span>·</span>
        <span>
          © 2026
          {" "}
          <a href={Author.url} target="_blank" rel="noreferrer">{Author.name}</a>
        </span>
      </span>
    </>
  )
}
