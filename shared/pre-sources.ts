import process from "node:process"
import { Interval } from "./consts"
import { typeSafeObjectFromEntries } from "./type.util"
import type { OriginSource, Source, SourceID } from "./types"

const Time = {
  Test: 1,
  Realtime: 2 * 60 * 1000,
  Fast: 5 * 60 * 1000,
  Default: Interval, // 10min
  Common: 30 * 60 * 1000,
  Slow: 60 * 60 * 1000,
}

export const originSources = {
  "v2ex": {
    name: "V2EX",
    color: "slate",
    home: "https://v2ex.com/",
    sub: {
      share: {
        title: "最新分享",
        column: "tech",
      },
    },
  },
  "zhihu": {
    name: "知乎",
    type: "hottest",
    column: "china",
    color: "blue",
    home: "https://www.zhihu.com",
  },
  "weibo": {
    name: "微博",
    title: "实时热搜",
    type: "hottest",
    column: "china",
    color: "red",
    interval: Time.Realtime,
    home: "https://weibo.com",
  },
  "zaobao": {
    name: "联合早报",
    interval: Time.Common,
    type: "realtime",
    column: "world",
    color: "red",
    desc: "来自第三方网站: 早晨报",
    home: "https://www.zaobao.com",
  },
  "coolapk": {
    name: "酷安",
    type: "hottest",
    column: "tech",
    color: "green",
    title: "今日最热",
    home: "https://coolapk.com",
  },
  "mktnews": {
    name: "MKTNews",
    column: "finance",
    home: "https://mktnews.net",
    color: "indigo",
    interval: Time.Realtime,
    sub: {
      flash: {
        title: "快讯",
      },
    },
  },
  "wallstreetcn": {
    name: "华尔街见闻",
    color: "blue",
    column: "finance",
    home: "https://wallstreetcn.com/",
    sub: {
      quick: {
        type: "realtime",
        interval: Time.Fast,
        title: "快讯",
      },
      news: {
        title: "最新",
        interval: Time.Common,
      },
      hot: {
        title: "最热",
        type: "hottest",
        interval: Time.Common,
      },
    },
  },
  "36kr": {
    name: "36氪",
    type: "realtime",
    color: "blue",
    home: "https://36kr.com",
    column: "tech",
    disable: "cf",
    sub: {
      quick: {
        title: "快讯",
      },
      renqi: {
        type: "hottest",
        title: "人气榜",
      },
    },
  },
  "douyin": {
    name: "抖音",
    type: "hottest",
    column: "china",
    color: "gray",
    home: "https://www.douyin.com",
  },
  "hupu": {
    name: "虎扑",
    home: "https://hupu.com",
    column: "sports",
    title: "主干道热帖",
    type: "hottest",
    color: "red",
  },
  "dongqiudi": {
    name: "懂球帝",
    title: "头条",
    type: "realtime",
    column: "sports",
    color: "green",
    home: "https://www.dongqiudi.com",
  },
  "aihot": {
    name: "AIHOT",
    type: "realtime",
    column: "tech",
    color: "blue",
    interval: Time.Fast,
    home: "https://aihot.virxact.com/all",
  },
  "tieba": {
    name: "百度贴吧",
    title: "热议",
    column: "china",
    type: "hottest",
    color: "blue",
    home: "https://tieba.baidu.com",
  },
  "toutiao": {
    name: "今日头条",
    type: "hottest",
    column: "china",
    color: "red",
    home: "https://www.toutiao.com",
  },
  "ithome": {
    name: "IT之家",
    color: "red",
    column: "tech",
    type: "realtime",
    home: "https://www.ithome.com",
  },
  "thepaper": {
    name: "澎湃新闻",
    interval: Time.Common,
    type: "hottest",
    column: "china",
    title: "热榜",
    color: "gray",
    home: "https://www.thepaper.cn",
  },
  "sputniknewscn": {
    name: "卫星通讯社",
    color: "orange",
    column: "world",
    home: "https://sputniknews.cn",
  },
  "cankaoxiaoxi": {
    name: "参考消息",
    color: "red",
    column: "world",
    interval: Time.Common,
    home: "https://china.cankaoxiaoxi.com",
  },
  "pcbeta": {
    name: "远景论坛",
    color: "blue",
    column: "tech",
    home: "https://bbs.pcbeta.com",
    sub: {
      windows11: {
        title: "Win11",
        type: "realtime",
        interval: Time.Fast,
      },
      windows: {
        title: "Windows 资源",
        type: "realtime",
        interval: Time.Fast,
        disable: true,
      },
    },
  },
  "cls": {
    name: "财联社",
    color: "red",
    column: "finance",
    home: "https://www.cls.cn",
    sub: {
      telegraph: {
        title: "电报",
        interval: Time.Fast,
        type: "realtime",
      },
      depth: {
        title: "深度",
      },
      hot: {
        title: "热门",
        type: "hottest",
      },
    },
  },
  "xueqiu": {
    name: "雪球",
    color: "blue",
    home: "https://xueqiu.com",
    column: "finance",
    sub: {
      hotstock: {
        title: "热门股票",
        interval: Time.Realtime,
        type: "hottest",
      },
    },
  },
  "gelonghui": {
    name: "格隆汇",
    color: "blue",
    title: "事件",
    column: "finance",
    type: "realtime",
    interval: Time.Realtime,
    home: "https://www.gelonghui.com",
  },
  "fastbull": {
    name: "法布财经",
    color: "emerald",
    home: "https://www.fastbull.cn",
    column: "finance",
    sub: {
      express: {
        title: "快讯",
        type: "realtime",
        interval: Time.Realtime,
      },
      news: {
        title: "头条",
        interval: Time.Common,
      },
    },
  },
  "solidot": {
    name: "Solidot",
    color: "teal",
    column: "tech",
    home: "https://solidot.org",
    interval: Time.Slow,
  },
  "hackernews": {
    name: "Hacker News",
    color: "orange",
    column: "tech",
    type: "hottest",
    home: "https://news.ycombinator.com/",
  },
  "producthunt": {
    name: "Product Hunt",
    color: "red",
    column: "tech",
    type: "hottest",
    home: "https://www.producthunt.com/",
  },
  "github": {
    name: "Github",
    color: "gray",
    home: "https://github.com/",
    column: "tech",
    sub: {
      "trending-today": {
        title: "Today",
        type: "hottest",
      },
    },
  },
  "bilibili": {
    name: "哔哩哔哩",
    color: "blue",
    home: "https://www.bilibili.com",
    sub: {
      "hot-search": {
        title: "热搜",
        column: "china",
        type: "hottest",
      },
      "hot-video": {
        title: "热门视频",
        disable: "cf",
        column: "china",
        type: "hottest",
      },
      "ranking": {
        title: "排行榜",
        column: "china",
        disable: "cf",
        type: "hottest",
        interval: Time.Common,
      },
    },
  },
  "kuaishou": {
    name: "快手",
    type: "hottest",
    column: "china",
    color: "orange",
    // cloudflare pages cannot access
    disable: "cf",
    home: "https://www.kuaishou.com",
  },
  "kaopu": {
    name: "靠谱新闻",
    column: "world",
    color: "gray",
    interval: Time.Common,
    desc: "不一定靠谱，多看多思考",
    home: "https://kaopu.news/",
  },
  "jin10": {
    name: "金十数据",
    column: "finance",
    color: "blue",
    type: "realtime",
    home: "https://www.jin10.com",
  },
  "baidu": {
    name: "百度热搜",
    column: "china",
    color: "blue",
    type: "hottest",
    home: "https://www.baidu.com",
  },
  "linuxdo": {
    name: "LINUX DO",
    column: "tech",
    color: "slate",
    home: "https://linux.do/",
    disable: true,
    sub: {
      latest: {
        title: "最新",
        home: "https://linux.do/latest",
      },
      hot: {
        title: "今日最热",
        type: "hottest",
        interval: Time.Common,
        home: "https://linux.do/hot",
      },
    },
  },
  "ghxi": {
    name: "果核剥壳",
    column: "china",
    color: "yellow",
    home: "https://www.ghxi.com/",
    disable: true,
  },
  "smzdm": {
    name: "什么值得买",
    column: "china",
    color: "red",
    type: "hottest",
    home: "https://www.smzdm.com",
    disable: true,
  },
  "nowcoder": {
    name: "牛客",
    column: "china",
    color: "blue",
    type: "hottest",
    home: "https://www.nowcoder.com",
  },
  "sspai": {
    name: "少数派",
    column: "tech",
    color: "red",
    type: "hottest",
    home: "https://sspai.com",
  },
  "juejin": {
    name: "稀土掘金",
    column: "tech",
    color: "blue",
    type: "hottest",
    home: "https://juejin.cn",
  },
  "ifeng": {
    name: "凤凰网",
    column: "china",
    color: "red",
    type: "hottest",
    title: "热点资讯",
    home: "https://www.ifeng.com",
  },
  "chongbuluo": {
    name: "虫部落",
    column: "china",
    color: "green",
    home: "https://www.chongbuluo.com",
    sub: {
      latest: {
        title: "最新",
        interval: Time.Common,
        home: "https://www.chongbuluo.com/forum.php?mod=guide&view=newthread",
      },
      hot: {
        title: "最热",
        type: "hottest",
        interval: Time.Common,
        home: "https://www.chongbuluo.com/forum.php?mod=guide&view=hot",
      },
    },
  },
  "douban": {
    name: "豆瓣",
    column: "china",
    title: "热门电影",
    color: "green",
    type: "hottest",
    home: "https://www.douban.com",
  },
  "steam": {
    name: "Steam",
    column: "world",
    title: "在线人数",
    color: "blue",
    type: "hottest",
    home: "https://store.steampowered.com",
  },
  "tencent": {
    name: "腾讯新闻",
    column: "china",
    color: "blue",
    home: "https://news.qq.com",
    sub: {
      hot: {
        title: "综合早报",
        type: "hottest",
        interval: Time.Common,
        home: "https://news.qq.com/tag/aEWqxLtdgmQ=",
      },
    },
  },
  "freebuf": {
    name: "Freebuf",
    column: "china",
    title: "网络安全",
    color: "green",
    type: "hottest",
    home: "https://www.freebuf.com/",
  },

  "qqvideo": {
    name: "腾讯视频",
    column: "china",
    color: "blue",
    home: "https://v.qq.com/",
    sub: {
      "tv-hotsearch": {
        title: "热搜榜",
        type: "hottest",
        interval: Time.Common,
        home: "https://v.qq.com/channel/tv",

      },
    },
  },
  "iqiyi": {
    name: "爱奇艺",
    column: "china",
    color: "green",
    home: "https://www.iqiyi.com",
    sub: {
      "hot-ranklist": {
        title: "热播榜",
        type: "hottest",
        interval: Time.Common,
        home: "https://www.iqiyi.com",
      },
    },
  },
  "acfun": {
    name: "AcFun",
    type: "hottest",
    column: "china",
    color: "orange",
    home: "https://www.acfun.cn",
    title: "排行榜",
  },
  "zhihudaily": {
    name: "知乎日报",
    column: "china",
    color: "blue",
    home: "https://daily.zhihu.com",
    title: "推荐",
  },
  "doubangroup": {
    name: "豆瓣小组",
    type: "hottest",
    column: "china",
    color: "green",
    home: "https://www.douban.com/group",
    title: "讨论精选",
  },
  "xijiayi": {
    name: "IT之家",
    type: "realtime",
    column: "tech",
    color: "red",
    home: "https://www.ithome.com",
    title: "喜加一",
  },
  "jianshu": {
    name: "简书",
    type: "hottest",
    column: "china",
    color: "red",
    home: "https://www.jianshu.com",
    title: "热门推荐",
  },
  "guokr": {
    name: "果壳",
    type: "hottest",
    column: "tech",
    color: "green",
    home: "https://www.guokr.com",
    title: "热门文章",
  },
  "cto51": {
    name: "51CTO",
    type: "hottest",
    column: "tech",
    color: "red",
    home: "https://www.51cto.com",
    title: "推荐榜",
  },
  "csdn": {
    name: "CSDN",
    type: "hottest",
    column: "tech",
    color: "red",
    home: "https://www.csdn.net",
    title: "排行榜",
  },
  "nodeseek": {
    name: "NodeSeek",
    type: "realtime",
    column: "tech",
    color: "blue",
    home: "https://www.nodeseek.com",
    title: "最新",
  },
  "qqnews": {
    name: "腾讯新闻",
    type: "hottest",
    column: "china",
    color: "blue",
    home: "https://news.qq.com",
    title: "热点榜",
  },
  "sina": {
    name: "新浪",
    type: "hottest",
    column: "china",
    color: "red",
    home: "https://www.sina.com.cn",
    title: "热榜",
  },
  "sinanews": {
    name: "新浪新闻",
    type: "hottest",
    column: "china",
    color: "red",
    home: "https://news.sina.com.cn",
    title: "热点",
  },
  "netease": {
    name: "网易新闻",
    type: "hottest",
    column: "china",
    color: "red",
    home: "https://news.163.com",
    title: "热点榜",
  },
  "pojie52": {
    name: "吾爱破解",
    type: "hottest",
    column: "tech",
    color: "red",
    home: "https://www.52pojie.cn",
    title: "热帖",
  },
  "hostloc": {
    name: "全球主机交流",
    type: "hottest",
    column: "tech",
    color: "blue",
    home: "https://hostloc.com",
    title: "热帖",
  },
  "huxiu": {
    name: "虎嗅",
    type: "hottest",
    column: "tech",
    color: "orange",
    home: "https://www.huxiu.com",
    title: "24小时",
  },
  "ifanr": {
    name: "爱范儿",
    type: "realtime",
    column: "tech",
    color: "blue",
    home: "https://www.ifanr.com",
    title: "快讯",
  },
  "lol": {
    name: "英雄联盟",
    column: "sports",
    color: "blue",
    home: "https://lol.qq.com",
    title: "更新公告",
  },
  "miyoushe": {
    name: "米游社",
    type: "realtime",
    column: "china",
    color: "blue",
    home: "https://www.miyoushe.com",
    title: "最新",
  },
  "genshin": {
    name: "原神",
    type: "realtime",
    column: "china",
    color: "yellow",
    home: "https://ys.mihoyo.com",
    title: "最新消息",
  },
  "honkai": {
    name: "崩坏3",
    type: "realtime",
    column: "china",
    color: "pink",
    home: "https://www.honkaiimpact3.com",
    title: "最新动态",
  },
  "starrail": {
    name: "崩坏：星穹铁道",
    type: "realtime",
    column: "china",
    color: "yellow",
    home: "https://sr.mihoyo.com",
    title: "最新动态",
  },
  "weread": {
    name: "微信读书",
    type: "hottest",
    column: "china",
    color: "green",
    home: "https://weread.qq.com",
    title: "飙升榜",
  },
  "ngabbs": {
    name: "NGA",
    type: "hottest",
    column: "china",
    color: "blue",
    home: "https://bbs.nga.cn",
    title: "热帖",
  },
  "hellogithub": {
    name: "HelloGitHub",
    type: "hottest",
    column: "tech",
    color: "gray",
    home: "https://hellogithub.com",
    title: "Trending",
  },
  "weatheralarm": {
    name: "中央气象台",
    type: "realtime",
    column: "china",
    color: "blue",
    home: "https://www.nmc.cn",
    title: "气象预警",
  },
  "earthquake": {
    name: "中国地震台",
    type: "realtime",
    column: "china",
    color: "red",
    home: "https://news.ceic.ac.cn",
    title: "地震速报",
  },
  "history": {
    name: "历史上的今天",
    column: "world",
    color: "orange",
    home: "https://www.lssdjt.com",
    title: "月-日",
  },
} as const satisfies Record<string, OriginSource>

export function genSources() {
  const _: [SourceID, Source][] = []

  Object.entries(originSources).forEach(([id, source]: [any, OriginSource]) => {
    const parent = {
      name: source.name,
      type: source.type,
      disable: source.disable,
      desc: source.desc,
      column: source.column,
      home: source.home,
      color: source.color ?? "primary",
      interval: source.interval ?? Time.Default,
    }
    if (source.sub && Object.keys(source.sub).length) {
      Object.entries(source.sub).forEach(([subId, subSource], i) => {
        if (i === 0) {
          _.push([
            id,
            {
              redirect: `${id}-${subId}`,
              ...parent,
              ...subSource,
            },
          ] as [any, Source])
        }
        _.push([`${id}-${subId}`, { ...parent, ...subSource }] as [
          any,
          Source,
        ])
      })
    } else {
      _.push([
        id,
        {
          title: source.title,
          ...parent,
        },
      ])
    }
  })

  return typeSafeObjectFromEntries(
    _.filter(([_, v]) => {
      if (v.disable === "cf" && process.env.CF_PAGES) {
        return false
      } else {
        return v.disable !== true
      }
    }),
  )
}
