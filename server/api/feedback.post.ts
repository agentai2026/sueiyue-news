import process from "node:process"

interface FeedbackBody {
  name?: string
  contact?: string
  type?: string
  content?: string
}

const ALLOWED_TYPES = new Set(["bug", "idea", "other"])
const TYPE_LABEL: Record<string, string> = {
  bug: "问题反馈",
  idea: "功能建议",
  other: "其他",
}

function repoSlug() {
  return process.env.GITHUB_REPO || "agentai2026/sueiyue-news"
}

export default defineEventHandler(async (event) => {
  const token = process.env.GITHUB_FEEDBACK_TOKEN || process.env.GITHUB_TOKEN
  if (!token) {
    throw createError({
      statusCode: 503,
      message: "反馈服务未配置：请在服务器设置 GITHUB_FEEDBACK_TOKEN",
    })
  }

  const body = await readBody<FeedbackBody>(event).catch(() => ({} as FeedbackBody))
  const content = String(body.content || "").trim()
  const name = String(body.name || "").trim().slice(0, 40) || "匿名用户"
  const contact = String(body.contact || "").trim().slice(0, 80)
  const type = ALLOWED_TYPES.has(String(body.type)) ? String(body.type) : "other"

  if (content.length < 5) {
    throw createError({ statusCode: 400, message: "请至少写 5 个字的反馈内容" })
  }
  if (content.length > 2000) {
    throw createError({ statusCode: 400, message: "反馈内容过长，请控制在 2000 字内" })
  }

  const title = `[反馈·${TYPE_LABEL[type]}] ${content.slice(0, 40)}${content.length > 40 ? "…" : ""}`
  const issueBody = [
    `## 反馈类型`,
    TYPE_LABEL[type],
    ``,
    `## 反馈内容`,
    content,
    ``,
    `## 提交信息`,
    `- 称呼：${name}`,
    `- 联系方式：${contact || "未填写"}`,
    `- 时间：${new Date().toISOString()}`,
    `- 来源：岁月实时新闻站点反馈表单`,
  ].join("\n")

  const repo = repoSlug()
  let issue: { html_url?: string, number?: number }
  try {
    issue = await myFetch(`https://api.github.com/repos/${repo}/issues`, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "Sueiyue-News-Feedback",
      },
      body: {
        title,
        body: issueBody,
        labels: ["feedback", type],
      },
    })
  } catch (e: any) {
    logger.error(e)
    throw createError({
      statusCode: 502,
      message: "提交到 GitHub 失败，请稍后重试或检查 Token 权限",
    })
  }

  logger.success(`feedback -> issue #${issue.number}`)
  return {
    ok: true,
    message: "感谢反馈，已同步到仓库 Issue",
    issueUrl: issue.html_url,
    issueNumber: issue.number,
  }
})
