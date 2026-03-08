import {
  buildMetaByHome,
  escapeHtml,
  fetchSharedSnapshot,
  getHomeById,
  getHomeId,
  getIndexTemplate,
  getRequestOrigin,
  getRequestPath,
} from './_og-shared.js'

function upsertTag(html, pattern, replacementTag) {
  if (pattern.test(html)) {
    return html.replace(pattern, replacementTag)
  }
  return html.replace('</head>', `  ${replacementTag}\n</head>`)
}

function injectMetaTags(indexHtml, meta) {
  let html = indexHtml
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`)
  html = upsertTag(html, /<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeHtml(meta.description)}" />`)
  html = upsertTag(html, /<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${escapeHtml(meta.title)}" />`)
  html = upsertTag(html, /<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${escapeHtml(meta.description)}" />`)
  html = upsertTag(html, /<meta\s+property=["']og:url["'][^>]*>/i, `<meta property="og:url" content="${escapeHtml(meta.url)}" />`)
  html = upsertTag(html, /<meta\s+property=["']og:image["'][^>]*>/i, `<meta property="og:image" content="${escapeHtml(meta.image)}" />`)
  html = upsertTag(html, /<meta\s+property=["']og:image:type["'][^>]*>/i, '<meta property="og:image:type" content="image/png" />')
  html = upsertTag(html, /<meta\s+property=["']og:image:width["'][^>]*>/i, '<meta property="og:image:width" content="1200" />')
  html = upsertTag(html, /<meta\s+property=["']og:image:height["'][^>]*>/i, '<meta property="og:image:height" content="630" />')
  html = upsertTag(html, /<meta\s+property=["']og:image:alt["'][^>]*>/i, `<meta property="og:image:alt" content="${escapeHtml(meta.imageAlt)}" />`)
  html = upsertTag(html, /<meta\s+name=["']twitter:card["'][^>]*>/i, '<meta name="twitter:card" content="summary_large_image" />')
  html = upsertTag(html, /<meta\s+name=["']twitter:title["'][^>]*>/i, `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`)
  html = upsertTag(html, /<meta\s+name=["']twitter:description["'][^>]*>/i, `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`)
  html = upsertTag(html, /<meta\s+name=["']twitter:image["'][^>]*>/i, `<meta name="twitter:image" content="${escapeHtml(meta.image)}" />`)
  html = upsertTag(html, /<meta\s+property=["']og:locale["'][^>]*>/i, '<meta property="og:locale" content="ko_KR" />')
  return html
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'method-not-allowed' })
  }

  const origin = getRequestOrigin(req)
  const pathname = getRequestPath(req)
  const homeId = getHomeId(req, pathname)
  const snapshot = await fetchSharedSnapshot(origin)
  const home = getHomeById(snapshot, homeId)
  const baseMeta = buildMetaByHome(home)
  const url = origin ? `${origin}${pathname}` : pathname
  const isCreatePage = pathname === '/create'
  const imagePath = homeId
    ? `/api/og-image?homeId=${encodeURIComponent(homeId)}`
    : '/api/og-image?view=main'
  const image = isCreatePage
    ? ''
    : origin
      ? `${origin}${imagePath}`
      : imagePath

  const template = await getIndexTemplate(origin)
  const html = injectMetaTags(template, {
    ...baseMeta,
    url,
    image,
    imageAlt: home
      ? `${home.title} 프렌즈홈 대표 이미지 - 친구들과 함께 글을 남겨 미니룸 분위기를 키워보세요`
      : '프렌즈텔 대표 이미지 - 링크로 친구를 초대해 함께 게시판을 써보세요',
  })

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400')
  return res.status(200).send(html)
}
