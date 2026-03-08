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
  const image = origin && homeId
    ? `${origin}/api/og-image?homeId=${encodeURIComponent(homeId)}`
    : origin
      ? `${origin}/api/og-image`
      : '/api/og-image'

  const template = await getIndexTemplate(origin)
  const html = injectMetaTags(template, {
    ...baseMeta,
    url,
    image,
  })

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400')
  return res.status(200).send(html)
}
