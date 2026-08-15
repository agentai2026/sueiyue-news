import type { NewsItem } from "@shared/types"
import * as cheerio from "cheerio"
import iconv from "iconv-lite"
import { XMLParser } from "fast-xml-parser"

function item(id: string | number, title: string, url: string, extra?: NewsItem["extra"]): NewsItem {
  return { id: String(id), title, url, extra }
}

const quick = { timeout: 7000, retry: 0 } as const

function parseRssXml(xml: string): NewsItem[] {
  const parsed = new XMLParser({
    attributeNamePrefix: "",
    textNodeName: "$text",
    ignoreAttributes: false,
  }).parse(xml)
  let channel = parsed.rss?.channel ?? parsed.feed
  if (Array.isArray(channel)) channel = channel[0]
  let entries = channel?.item || channel?.entry || []
  if (entries && !Array.isArray(entries)) entries = [entries]
  return (entries as any[]).map((v, i) => {
    const title = v.title?.$text ?? v.title ?? ""
    const url = v.link?.href ?? v.link ?? v.guid?.$text ?? v.guid ?? ""
    return item(v.guid?.$text ?? v.guid ?? url ?? i, String(title).trim(), String(url).trim())
  }).filter(v => v.title && v.url)
}

async function fetchRss(url: string, encoding?: "gbk"): Promise<NewsItem[]> {
  if (encoding === "gbk") {
    const buf = await myFetch<ArrayBuffer>(url, { ...quick, responseType: "arrayBuffer" })
    return parseRssXml(iconv.decode(Buffer.from(buf), "gbk"))
  }
  const xml = await myFetch<string>(url, { ...quick, responseType: "text" })
  const items = parseRssXml(xml)
  if (!items.length) throw new Error("rss empty")
  return items
}

async function fetchDailyHot(route: string): Promise<NewsItem[]> {
  const bases = [
    "https://api-hot.imsyy.top",
    "https://daily-hot.vercel.app",
  ]
  let lastError: unknown
  for (const base of bases) {
    try {
      const res: any = await myFetch(`${base}/${route}`, quick)
      const list = Array.isArray(res) ? res : res?.data
      if (!Array.isArray(list) || !list.length) continue
      return list.filter((k: any) => k.title && (k.url || k.mobileUrl)).map((k: any) => item(
        k.id ?? k.url,
        k.title,
        k.url || k.mobileUrl,
        { hover: k.desc, info: k.hot == null || k.hot === "" ? undefined : String(k.hot) },
      ))
    } catch (error) {
      lastError = error
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`DailyHot ${route} empty`)
}

async function fetchRssHub(route: string): Promise<NewsItem[]> {
  const bases = [
    "https://rsshub.rssforever.com",
    "https://rsshub.pseudoyu.com",
  ]
  let lastError: unknown
  for (const base of bases) {
    try {
      const url = new URL(route, base)
      url.searchParams.set("format", "json")
      const data: any = await myFetch(url, quick)
      const items = (data.items || []).map((v: any) => item(v.id ?? v.url, v.title, v.url || v.link))
        .filter((v: NewsItem) => v.title && v.url)
      if (items.length) return items
    } catch (error) {
      lastError = error
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`RSSHub ${route} empty`)
}

async function fetchMiyoushe(gids: number, path: string): Promise<NewsItem[]> {
  const res: any = await myFetch(`https://bbs-api-static.miyoushe.com/painter/wapi/getNewsList?client_type=4&gids=${gids}&last_id=&page_size=20&type=1`, quick)
  return (res.data?.list || []).map((v: any) => item(
    v.post?.post_id,
    v.post?.subject,
    `https://www.miyoushe.com/${path}/article/${v.post?.post_id}`,
  ))
}

function withFallback(primary: () => Promise<NewsItem[]>, route: string, rsshub?: string) {
  return async () => {
    try {
      const data = await primary()
      if (data.length) return data
    } catch {}
    try {
      return await fetchDailyHot(route)
    } catch {}
    if (rsshub) return await fetchRssHub(rsshub)
    throw new Error(`fetch ${route} failed`)
  }
}

export default defineSource({
  acfun: withFallback(async () => {
    const res: any = await myFetch("https://www.acfun.cn/rest/pc-direct/rank/channel?channelId=&rankLimit=30&rankPeriod=DAY", {
      headers: { Referer: "https://www.acfun.cn/rank/list/" },
    })
    return (res.rankList || []).map((v: any) => item(v.dougaId, v.contentTitle, `https://www.acfun.cn/v/ac${v.dougaId}`, { hover: v.contentDesc }))
  }, "acfun", "/acfun/bangumi"),

  zhihudaily: withFallback(async () => {
    const res: any = await myFetch("https://news-at.zhihu.com/api/4/news/latest")
    return (res.stories || []).map((v: any) => item(v.id, v.title, v.url || `https://daily.zhihu.com/story/${v.id}`))
  }, "zhihu-daily", "/zhihu/daily"),

  doubangroup: withFallback(async () => {
    const html: string = await myFetch("https://www.douban.com/group/explore", { ...quick, responseType: "text" })
    const $ = cheerio.load(html)
    const items: NewsItem[] = []
    $(".article .channel-item, .channel-item").each((_, el) => {
      if (items.length >= 30) return
      const a = $(el).find("h3 a").first()
      const href = a.attr("href")
      const title = a.text().trim()
      if (href && title) items.push(item(href, title, href))
    })
    if (!items.length) throw new Error("douban group empty")
    return items
  }, "douban-group", "/douban/explore/group"),

  xijiayi: withFallback(async () => {
    const html: string = await myFetch("https://www.ithome.com/zt/xijiayi", { ...quick, responseType: "text" })
    const $ = cheerio.load(html)
    const items: NewsItem[] = []
    $(".newslist li, .lst li, .bl li").each((_, el) => {
      if (items.length >= 30) return
      const a = $(el).find("a").first()
      const href = a.attr("href")
      const title = ($(el).find("h2").text() || a.text()).trim()
      if (href && title && title.length > 4) items.push(item(href, title, href))
    })
    if (!items.length) throw new Error("xijiayi empty")
    return items
  }, "ithome-xijiayi", "/ithome/xijiayi"),

  jianshu: withFallback(async () => {
    const html: string = await myFetch("https://www.jianshu.com/")
    const re = /href="(\/p\/[a-z0-9]+)"[^>]*class="title"[^>]*>([^<]+)</g
    const items: NewsItem[] = []
    let m
    while ((m = re.exec(html)) && items.length < 30) {
      items.push(item(m[1], m[2].trim(), `https://www.jianshu.com${m[1]}`))
    }
    if (!items.length) throw new Error("jianshu empty")
    return items
  }, "jianshu", "/jianshu/home"),

  guokr: withFallback(async () => {
    const res: any = await myFetch("https://www.guokr.com/apis/minisite/article.json?retrieve_type=by_subject&limit=20")
    return (res.result || []).map((v: any) => item(v.id, v.title, v.url || `https://www.guokr.com/article/${v.id}/`, { hover: v.summary }))
  }, "guokr", "/guokr/scientific"),

  cto51: withFallback(async () => {
    const res: any = await myFetch("https://api-media.51cto.com/index/index/recommend", {
      ...quick,
      query: { page: 1, page_size: 30, limit_time: 0, name_en: "" },
    })
    const list = res.data?.data?.list || res.data?.list || []
    return list.map((v: any) => item(v.source_id || v.url, v.title, v.url, { hover: v.abstract }))
  }, "51cto", "/51cto/index"),

  nodeseek: withFallback(async () => {
    return await fetchRss("https://rss.nodeseek.com/")
  }, "nodeseek", "/nodeseek/latest"),

  netease: withFallback(async () => {
    const raw = await myFetch<string>("https://3g.163.com/touch/reconstruct/article/list/BBM54PGAwangning/0-20.html", {
      ...quick,
      responseType: "text",
      headers: { Referer: "https://3g.163.com/", Accept: "*/*" },
    })
    const matched = String(raw).match(/artiList\(([\s\S]*)\)/)
    const json = JSON.parse(matched?.[1] || "{}")
    const list = json.BBM54PGAwangning || []
    return list.filter((v: any) => v.docid && v.title && v.docid !== "BBM54PGAwangning").map((v: any) => item(
      v.docid,
      v.title,
      v.url || `https://www.163.com/news/article/${v.docid}.html`,
    ))
  }, "netease-news", "/netease/news/rank"),

  pojie52: withFallback(async () => {
    return await fetchRss("https://www.52pojie.cn/forum.php?mod=guide&view=digest&rss=1", "gbk")
  }, "52pojie", "/52pojie/digest"),

  hostloc: withFallback(async () => {
    return await fetchRssHub("/hostloc/hot")
  }, "hostloc", "/hostloc/hot"),

  huxiu: withFallback(async () => {
    const res: any = await myFetch("https://moment-api.huxiu.com/web-v3/moment/feed?platform=www", {
      ...quick,
      headers: { Referer: "https://www.huxiu.com/moment/", Accept: "application/json" },
    })
    return (res.data?.moment_list?.datalist || []).map((v: any) => {
      const content = String(v.content || "").replace(/<br\s*\/?>/gi, "\n")
      const title = content.split("\n").map((s: string) => s.trim()).filter(Boolean)[0]?.replace(/。$/, "") || String(v.object_id)
      return item(v.object_id, title, `https://www.huxiu.com/moment/${v.object_id}.html`)
    })
  }, "huxiu", "/huxiu/moment"),

  lol: withFallback(async () => {
    const res: any = await myFetch("https://apps.game.qq.com/cmc/zmMcnTargetContentList?r0=json&page=1&num=30&target=24&source=web_pc", quick)
    return (res.data?.result || []).map((v: any) => item(
      v.iNewsId || v.iDocID,
      v.sTitle,
      `https://lol.qq.com/news/detail.shtml?docid=${encodeURIComponent(v.iNewsId || v.iDocID)}`,
    ))
  }, "lol"),

  csdn: withFallback(async () => {
    const res: any = await myFetch("https://blog.csdn.net/phoenix/web/blog/hot-rank?page=0&pageSize=30")
    return (res.data || []).map((v: any) => item(v.productId, v.articleTitle, v.articleDetailUrl, { info: String(v.hotRankScore ?? "") }))
  }, "csdn"),

  qqnews: withFallback(async () => {
    const res: any = await myFetch("https://r.inews.qq.com/gw/event/hot_ranking_list?page_size=50")
    return (res.idlist?.[0]?.newslist || []).slice(1).map((v: any) => item(v.id, v.title, `https://new.qq.com/rain/a/${v.id}`, { hover: v.abstract }))
  }, "qq-news"),

  sina: withFallback(async () => {
    const res: any = await myFetch("https://newsapp.sina.cn/api/hotlist?newsId=HB-1-snhs%2Ftop_news_list-all")
    return (res.data?.hotList || []).map((v: any) => item(v.base.base.uniqueId, v.info.title, v.base.base.url, { info: v.info.hotValue }))
  }, "sina"),

  sinanews: withFallback(async () => {
    const res: any = await myFetch("https://newsapp.sina.cn/api/hotlist?newsId=HB-1-snhs%2Ftop_news_list-hotcmnt")
    return (res.data?.hotList || []).map((v: any) => item(v.base.base.uniqueId, v.info.title, v.base.base.url, { info: v.info.hotValue }))
  }, "sina-news"),

  ifanr: withFallback(async () => {
    const res: any = await myFetch("https://sso.ifanr.com/api/v5/wp/buzz/?limit=20&offset=0")
    return (res.objects || []).map((v: any) => item(v.id, v.post_title, v.buzz_original_url || `https://www.ifanr.com/${v.post_id}`, { hover: v.post_content }))
  }, "ifanr", "/ifanr/digest"),

  miyoushe: withFallback(async () => {
    return await fetchMiyoushe(2, "ys")
  }, "miyoushe"),

  genshin: withFallback(async () => {
    return await fetchMiyoushe(2, "ys")
  }, "genshin"),

  honkai: withFallback(async () => {
    return await fetchMiyoushe(1, "bh3")
  }, "honkai"),

  starrail: withFallback(async () => {
    return await fetchMiyoushe(6, "sr")
  }, "starrail"),

  weread: withFallback(async () => {
    const res: any = await myFetch("https://weread.qq.com/web/bookListInCategory/rising?rank=1")
    return (res.books || []).map((v: any) => item(v.bookInfo.bookId, v.bookInfo.title, `https://weread.qq.com/web/search/books?keyword=${encodeURIComponent(v.bookInfo.title)}`, { hover: v.bookInfo.author }))
  }, "weread"),

  ngabbs: withFallback(async () => {
    throw new Error("use fallback")
  }, "ngabbs", "/nga/forum/-7"),

  hellogithub: withFallback(async () => {
    const res: any = await myFetch("https://abroad.hellogithub.com/v1/?sort_by=featured&tid=&page=1")
    return (res.data || []).map((v: any) => item(v.item_id, v.title, `https://hellogithub.com/repository/${v.item_id}`, { hover: v.summary }))
  }, "hellogithub", "/hellogithub/article"),

  weatheralarm: withFallback(async () => {
    const res: any = await myFetch("http://www.nmc.cn/rest/findAlarm?pageNo=1&pageSize=20&signaltype=&signallevel=&province=", quick)
    return (res.data?.page?.list || []).map((v: any) => item(
      v.alertid,
      v.title,
      v.url?.startsWith("http") ? v.url : `http://www.nmc.cn${v.url || ""}`,
    ))
  }, "weatheralarm"),

  earthquake: withFallback(async () => {
    const res: any = await myFetch("https://api.wolfx.jp/cenc_eqlist.json", quick)
    return Object.values(res)
      .filter((v: any) => v && v.EventID && v.location)
      .map((v: any) => item(
        v.EventID,
        `${v.location}发生${v.magnitude}级地震`,
        "https://news.ceic.ac.cn/",
        { hover: `${v.time} 深度${v.depth}km` },
      ))
  }, "earthquake"),

  history: withFallback(async () => {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    try {
      const res: any = await myFetch(`https://baike.baidu.com/cms/home/eventsOnHistory/${month}.json`, {
        query: { _: Date.now() },
        headers: { Referer: "https://baike.baidu.com/calendar" },
      })
      const list = res?.[month]?.[month + day] || res?.data?.[month]?.[month + day] || []
      const items = list.map((v: any, i: number) => item(
        i,
        `${v.year} ${String(v.title).replace(/<[^>]+>/g, "")}`,
        v.link || "https://baike.baidu.com/calendar",
        { hover: String(v.desc || "").replace(/<[^>]+>/g, "") },
      ))
      if (items.length) return items
    } catch {}
    const wiki: any = await myFetch(`https://zh.wikipedia.org/api/rest_v1/feed/onthisday/events/${Number(month)}/${Number(day)}`)
    return (wiki.events || []).slice(0, 30).map((v: any, i: number) => item(
      `${v.year}-${i}`,
      `${v.year} ${v.text}`,
      v.pages?.[0]?.content_urls?.desktop?.page || "https://zh.wikipedia.org/wiki/Wikipedia:%E5%8E%86%E5%8F%B2%E4%B8%8A%E7%9A%84%E4%BB%8A%E5%A4%A9",
    ))
  }, "history"),
})
