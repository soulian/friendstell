const DEFAULT_TIMEOUT_MS = 1800

const DEFAULT_META = {
  title: '프렌즈텔 - 친구와 함께 쓰는 게시판',
  description: '친구와 함께 쓰는 게시판을 만들고, 링크를 공유해 보세요.',
}

function toStringValue(value) {
  if (Array.isArray(value)) return value[0] || ''
  return typeof value === 'string' ? value : ''
}

export function getRequestOrigin(req) {
  const proto = toStringValue(req?.headers?.['x-forwarded-proto']) || 'https'
  const host = toStringValue(req?.headers?.['x-forwarded-host']) || toStringValue(req?.headers?.host)
  if (!host) return ''
  return `${proto}://${host}`
}

export function getRequestPath(req) {
  const queryPath = toStringValue(req?.query?.path)
  if (queryPath) return queryPath
  const rawUrl = toStringValue(req?.url)
  if (!rawUrl) return '/'
  return rawUrl.split('?')[0] || '/'
}

export function getHomeId(req, pathname) {
  const queryHomeId = toStringValue(req?.query?.homeId)
  if (queryHomeId) return queryHomeId
  const matched = pathname.match(/^\/home\/([^/]+)/)
  return matched?.[1] || ''
}

export async function fetchSharedSnapshot(origin) {
  if (!origin || typeof fetch !== 'function') return null
  const controller = typeof AbortController === 'function' ? new AbortController() : null
  const timeout = setTimeout(() => controller?.abort(), DEFAULT_TIMEOUT_MS)
  try {
    const res = await fetch(`${origin}/api/shared-data`, {
      method: 'GET',
      headers: {
        'x-og-meta-request': '1',
      },
      signal: controller?.signal,
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = await res.json()
    const data = json?.data
    if (!data || typeof data !== 'object') return null
    return {
      homes: Array.isArray(data.homes) ? data.homes : [],
      posts: data.posts && typeof data.posts === 'object' ? data.posts : {},
      comments: data.comments && typeof data.comments === 'object' ? data.comments : {},
    }
  } catch (_) {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

export function getHomeById(snapshot, homeId) {
  if (!snapshot || !homeId) return null
  return snapshot.homes.find((home) => home?.id === homeId) || null
}

export function getUniqueAuthorCount(snapshot, homeId) {
  if (!snapshot || !homeId) return 0
  const authors = new Set()
  const excludedBoards = new Set(['notice'])

  Object.entries(snapshot.posts || {}).forEach(([key, posts]) => {
    const [postHomeId, boardId] = key.split(':')
    if (postHomeId !== homeId || excludedBoards.has(boardId)) return
    const postList = Array.isArray(posts) ? posts : []
    postList.forEach((post) => {
      const author = normalizeAuthor(post?.author)
      if (author) authors.add(author)
    })
  })

  Object.entries(snapshot.comments || {}).forEach(([key, comments]) => {
    const [commentHomeId, boardId] = key.split(':')
    if (commentHomeId !== homeId || excludedBoards.has(boardId)) return
    const commentList = Array.isArray(comments) ? comments : []
    commentList.forEach((comment) => {
      const author = normalizeAuthor(comment?.author)
      if (author) authors.add(author)
    })
  })

  return authors.size
}

function normalizeAuthor(author) {
  if (typeof author !== 'string') return ''
  return author.trim()
}

export function buildMetaByHome(home) {
  if (!home) {
    return { ...DEFAULT_META }
  }
  return {
    title: `프렌즈텔 - ${home.title}`,
    description: `${home.title} - 친구와 함께 쓰는 프렌즈텔 게시판`,
  }
}

export function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function escapeXml(value) {
  return escapeHtml(value)
}

let cachedIndexTemplate = ''

function fallbackIndexTemplate() {
  return `<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${DEFAULT_META.title}</title>
    <meta name="description" content="${DEFAULT_META.description}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${DEFAULT_META.title}" />
    <meta property="og:description" content="${DEFAULT_META.description}" />
    <meta property="og:url" content="" />
    <meta property="og:image" content="" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`
}

export async function getIndexTemplate(origin) {
  if (cachedIndexTemplate) return cachedIndexTemplate
  if (!origin || typeof fetch !== 'function') {
    cachedIndexTemplate = fallbackIndexTemplate()
    return cachedIndexTemplate
  }

  try {
    const res = await fetch(`${origin}/index.html`, {
      method: 'GET',
      cache: 'no-store',
    })
    if (!res.ok) throw new Error('index-template-fetch-failed')
    cachedIndexTemplate = await res.text()
  } catch (_) {
    cachedIndexTemplate = fallbackIndexTemplate()
  }

  return cachedIndexTemplate
}
