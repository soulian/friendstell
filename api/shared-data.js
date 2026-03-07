import { Redis } from '@upstash/redis'

const DB_KEY = 'friends_tell:shared_db:v1'
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
  return {
    homes: Array.isArray(input?.homes) ? input.homes : [],
    posts: input?.posts && typeof input.posts === 'object' ? input.posts : {},
    comments: input?.comments && typeof input.comments === 'object' ? input.comments : {},
  }
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

function homeId() {
  return `h_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function postId() {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function commentId() {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function applyMutation(db, op, payload = {}) {
  const next = normalizeDb(db)

  if (op === 'createHome') {
    const title = (payload.title || '').trim() || '이름 없는 프렌즈홈'
    const home = {
      id: homeId(),
      title,
      createdAt: Date.now(),
    }
    next.homes = [home, ...next.homes]
    return { db: next, result: home }
  }

  if (op === 'updateHome') {
    const targetHomeId = payload.homeId
    const title = (payload.title || '').trim()
    const home = next.homes.find((item) => item.id === targetHomeId)
    if (!home) return { db: next, result: null }
    if (title) {
      home.title = title
    }
    return { db: next, result: home }
  }

  if (op === 'addPost') {
    const key = `${payload.homeId}:${payload.boardId}`
    const list = Array.isArray(next.posts[key]) ? [...next.posts[key]] : []
    const post = {
      id: postId(),
      title: payload.title || '',
      body: payload.body || '',
      author: payload.author || '익명',
      createdAt: Date.now(),
      views: 0,
    }
    list.push(post)
    next.posts[key] = list
    return { db: next, result: post }
  }

  if (op === 'increaseViews') {
    const key = `${payload.homeId}:${payload.boardId}`
    const list = Array.isArray(next.posts[key]) ? [...next.posts[key]] : []
    const post = list.find((item) => item.id === payload.postId)
    if (!post) return { db: next, result: null }
    post.views = (post.views || 0) + 1
    next.posts[key] = list
    return { db: next, result: post }
  }

  if (op === 'addComment') {
    const key = `${payload.homeId}:${payload.boardId}:${payload.postId}`
    const list = Array.isArray(next.comments[key]) ? [...next.comments[key]] : []
    const comment = {
      id: commentId(),
      body: payload.body || '',
      author: payload.author || '익명',
      createdAt: Date.now(),
    }
    list.push(comment)
    next.comments[key] = list
    return { db: next, result: comment }
  }

  return { db: next, result: null }
}

async function loadDb() {
  const raw = await redis.get(DB_KEY)
  if (!raw) return createEmptyDb()
  return normalizeDb(raw)
}

async function saveDb(db) {
  await redis.set(DB_KEY, normalizeDb(db))
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
      await saveDb(db)
      return res.status(200).json({ ok: true, data: db, result })
    } catch (_) {
      return res.status(500).json({ ok: false, error: 'db-mutation-failed' })
    }
  }

  return res.status(405).json({ ok: false, error: 'method-not-allowed' })
}
