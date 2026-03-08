import { Redis } from '@upstash/redis'

const PRIMARY_DB_KEY = 'friends_tell:shared_db:v1'
const LEGACY_DB_KEYS = [
  'friends_tell:shared_db',
  'friends_tell:shared_db:v0',
]
const BACKUP_DB_KEY = 'friends_tell:shared_db:v1:backup'
const REMOVED_BOARD_ID_TOKENS = new Set(['test1', 'test2', '테스트1', '테스트2'])
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? Redis.fromEnv()
  : null

function createEmptyDb() {
  return {
    homes: [],
    posts: {},
    comments: {},
  }
}

function normalizeDb(input) {
  const normalizedHomes = Array.isArray(input?.homes) ? input.homes.map((home) => ({
    ...home,
    title: normalizeHomeTitle(home?.title),
  })) : []
  const normalizedPosts = {}
  Object.entries(input?.posts && typeof input.posts === 'object' ? input.posts : {}).forEach(([key, list]) => {
    const [, boardId] = key.split(':')
    if (isRemovedBoardId(boardId)) return
    normalizedPosts[key] = Array.isArray(list) ? list : []
  })
  const normalizedComments = {}
  Object.entries(input?.comments && typeof input.comments === 'object' ? input.comments : {}).forEach(([key, list]) => {
    const [, boardId] = key.split(':')
    if (isRemovedBoardId(boardId)) return
    normalizedComments[key] = Array.isArray(list) ? list : []
  })
  return {
    homes: normalizedHomes,
    posts: normalizedPosts,
    comments: normalizedComments,
  }
}

function normalizeBoardToken(boardId) {
  if (typeof boardId !== 'string') return ''
  return boardId.replace(/\s+/g, '').trim().toLowerCase()
}

function isRemovedBoardId(boardId) {
  return REMOVED_BOARD_ID_TOKENS.has(normalizeBoardToken(boardId))
}

function normalizeHomeTitle(title) {
  const trimmed = (title || '').trim()
  if (!trimmed) return trimmed
  const simplified = trimmed.replace(/\s+/g, ' ').toLowerCase()
  if (simplified === 'ai it 모임') {
    return 'IT 모임'
  }
  return trimmed
}

function hasContent(db) {
  const normalized = normalizeDb(db)
  return (
    normalized.homes.length > 0 ||
    Object.keys(normalized.posts).length > 0 ||
    Object.keys(normalized.comments).length > 0
  )
}

function mergeRecordsById(left = [], right = []) {
  const map = new Map()
  left.forEach((item) => {
    if (!item?.id) return
    map.set(item.id, item)
  })
  right.forEach((item) => {
    if (!item?.id) return
    const prev = map.get(item.id)
    if (!prev) {
      map.set(item.id, item)
      return
    }
    const prevTs = prev.createdAt || 0
    const nextTs = item.createdAt || 0
    map.set(item.id, nextTs >= prevTs ? item : prev)
  })
  return Array.from(map.values())
}

function mergeListMap(left = {}, right = {}) {
  const result = { ...left }
  Object.entries(right).forEach(([key, value]) => {
    const rightList = Array.isArray(value) ? value : []
    const leftList = Array.isArray(result[key]) ? result[key] : []
    result[key] = mergeRecordsById(leftList, rightList)
  })
  return result
}

function mergeSnapshots(snapshots) {
  return snapshots.reduce((acc, snapshot) => {
    const next = normalizeDb(snapshot)
    const homes = mergeRecordsById(acc.homes, next.homes)
    return {
      homes: homes.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
      posts: mergeListMap(acc.posts, next.posts),
      comments: mergeListMap(acc.comments, next.comments),
    }
  }, createEmptyDb())
}

function isSameDb(left, right) {
  return JSON.stringify(normalizeDb(left)) === JSON.stringify(normalizeDb(right))
}

function parseBody(req) {
  if (!req?.body) return {}
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch (_) {
      return {}
    }
  }
  return req.body
}

function nextTimestamp(input) {
  return Number.isFinite(input) ? input : Date.now()
}

function homeId(providedId) {
  if (typeof providedId === 'string' && providedId.trim()) return providedId.trim()
  return `h_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function postId(providedId) {
  if (typeof providedId === 'string' && providedId.trim()) return providedId.trim()
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function commentId(providedId) {
  if (typeof providedId === 'string' && providedId.trim()) return providedId.trim()
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function applyMutation(db, op, payload = {}) {
  const next = normalizeDb(db)

  if (op === 'createHome') {
    const title = normalizeHomeTitle(payload.title) || '이름 없는 프렌즈홈'
    const id = homeId(payload.id)
    const existing = next.homes.find((item) => item.id === id)
    if (existing) {
      return { db: next, result: existing }
    }
    const home = {
      id,
      title,
      createdAt: nextTimestamp(payload.createdAt),
    }
    next.homes = [home, ...next.homes]
    return { db: next, result: home }
  }

  if (op === 'updateHome') {
    const targetHomeId = payload.homeId
    const title = normalizeHomeTitle(payload.title)
    const home = next.homes.find((item) => item.id === targetHomeId)
    if (!home) return { db: next, result: null }
    if (title) {
      home.title = title
    }
    return { db: next, result: home }
  }

  if (op === 'addPost') {
    if (isRemovedBoardId(payload.boardId)) {
      return { db: next, result: null }
    }
    const key = `${payload.homeId}:${payload.boardId}`
    const list = Array.isArray(next.posts[key]) ? [...next.posts[key]] : []
    const id = postId(payload.id)
    const existing = list.find((item) => item.id === id)
    if (existing) {
      next.posts[key] = list
      return { db: next, result: existing }
    }
    const post = {
      id,
      title: payload.title || '',
      body: payload.body || '',
      author: payload.author || '익명',
      createdAt: nextTimestamp(payload.createdAt),
      views: Number.isFinite(payload.views) ? payload.views : 0,
    }
    list.push(post)
    next.posts[key] = list
    return { db: next, result: post }
  }

  if (op === 'increaseViews') {
    if (isRemovedBoardId(payload.boardId)) {
      return { db: next, result: null }
    }
    const key = `${payload.homeId}:${payload.boardId}`
    const list = Array.isArray(next.posts[key]) ? [...next.posts[key]] : []
    const post = list.find((item) => item.id === payload.postId)
    if (!post) return { db: next, result: null }
    post.views = (post.views || 0) + 1
    next.posts[key] = list
    return { db: next, result: post }
  }

  if (op === 'addComment') {
    if (isRemovedBoardId(payload.boardId)) {
      return { db: next, result: null }
    }
    const key = `${payload.homeId}:${payload.boardId}:${payload.postId}`
    const list = Array.isArray(next.comments[key]) ? [...next.comments[key]] : []
    const id = commentId(payload.id)
    const existing = list.find((item) => item.id === id)
    if (existing) {
      next.comments[key] = list
      return { db: next, result: existing }
    }
    const comment = {
      id,
      body: payload.body || '',
      author: payload.author || '익명',
      createdAt: nextTimestamp(payload.createdAt),
    }
    list.push(comment)
    next.comments[key] = list
    return { db: next, result: comment }
  }

  return { db: next, result: null }
}

async function getDbByKey(key) {
  const raw = await redis.get(key)
  if (!raw) return null
  return normalizeDb(raw)
}

async function persistPrimaryAndBackup(db) {
  const normalized = normalizeDb(db)
  await redis.set(PRIMARY_DB_KEY, normalized)
  await redis.set(BACKUP_DB_KEY, normalized)
}

async function loadDb() {
  const keys = [PRIMARY_DB_KEY, ...LEGACY_DB_KEYS, BACKUP_DB_KEY]
  const collected = []
  for (const key of keys) {
    const snapshot = await getDbByKey(key)
    if (snapshot && hasContent(snapshot)) {
      collected.push(snapshot)
    }
  }
  if (collected.length === 0) {
    return createEmptyDb()
  }

  const merged = mergeSnapshots(collected)
  const primary = await getDbByKey(PRIMARY_DB_KEY)
  if (!primary || !isSameDb(primary, merged)) {
    try {
      await persistPrimaryAndBackup(merged)
    } catch (_) {
      // Self-healing write is best-effort only.
    }
  }
  return merged
}

async function saveDb(db) {
  const next = normalizeDb(db)
  const current = await getDbByKey(PRIMARY_DB_KEY)
  if (hasContent(current) && !hasContent(next)) {
    return current
  }
  await persistPrimaryAndBackup(next)
  return next
}

export default async function handler(req, res) {
  if (!redis) {
    return res.status(503).json({
      ok: false,
      error: 'redis-not-configured',
    })
  }

  if (req.method === 'GET') {
    try {
      const db = await loadDb()
      return res.status(200).json({ ok: true, data: db })
    } catch (_) {
      return res.status(500).json({ ok: false, error: 'db-load-failed' })
    }
  }

  if (req.method === 'POST') {
    try {
      const body = parseBody(req)
      const op = body?.op
      const payload = body?.payload || {}
      const current = await loadDb()
      const { db, result } = applyMutation(current, op, payload)
      const saved = await saveDb(db)
      return res.status(200).json({ ok: true, data: saved, result })
    } catch (_) {
      return res.status(500).json({ ok: false, error: 'db-mutation-failed' })
    }
  }

  return res.status(405).json({ ok: false, error: 'method-not-allowed' })
}
