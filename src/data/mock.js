const HOMES_STORAGE_KEY = 'friends_tell_homes'
const STORAGE_KEY = 'friends_tell_data'
const NICKNAME_KEY = 'friends_tell_nickname'
const SHARED_API_ENDPOINT = '/api/shared-data'
const SHARED_SYNC_TTL_MS = 5000
const REMOTE_RETRY_INTERVAL_MS = 30000

// ——— 게시판 ———
export const BOARD_IDS = {
  notice: '공지사항',
  free: '자유게시판',
  news: '소식',
  temp: '임시 게시판',
}

export const OPERATOR_PASSWORD = 'village2024'

let cache = loadLocalSnapshot()
let syncPromise = null
let lastSyncedAt = 0
let lastRemoteAttemptAt = 0
let remoteStatus = 'unknown' // unknown | enabled | disabled

function now() {
  return Date.now()
}

function shouldAttemptRemote() {
  if (typeof window === 'undefined' || typeof fetch !== 'function') return false
  if (remoteStatus !== 'disabled') return true
  return now() - lastRemoteAttemptAt >= REMOTE_RETRY_INTERVAL_MS
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

function normalizeSnapshot(snapshot) {
  const homes = Array.isArray(snapshot?.homes)
    ? snapshot.homes.map((home) => ({
      ...home,
      title: normalizeHomeTitle(home?.title),
    }))
    : []
  return {
    homes,
    posts: snapshot?.posts && typeof snapshot.posts === 'object' ? snapshot.posts : {},
    comments: snapshot?.comments && typeof snapshot.comments === 'object' ? snapshot.comments : {},
  }
}

function loadHomesFromLocal() {
  try {
    const raw = localStorage.getItem(HOMES_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return []
}

function saveHomesToLocal(homes) {
  try {
    localStorage.setItem(HOMES_STORAGE_KEY, JSON.stringify(homes))
  } catch (_) {}
}

function loadDataFromLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return { posts: {}, comments: {} }
}

function saveDataToLocal(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (_) {}
}

function loadLocalSnapshot() {
  const homes = loadHomesFromLocal()
  const data = loadDataFromLocal()
  return normalizeSnapshot({
    homes,
    posts: data.posts,
    comments: data.comments,
  })
}

function persistSnapshot(snapshot) {
  const normalized = normalizeSnapshot(snapshot)
  cache = normalized
  saveHomesToLocal(normalized.homes)
  saveDataToLocal({ posts: normalized.posts, comments: normalized.comments })
  emitDataChanged()
}

function emitDataChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('friends-data-updated'))
}

function generateHomeId() {
  return `h_${now()}_${Math.random().toString(36).slice(2, 9)}`
}

function generatePostId() {
  return `p_${now()}_${Math.random().toString(36).slice(2, 9)}`
}

function generateCommentId() {
  return `c_${now()}_${Math.random().toString(36).slice(2, 9)}`
}

async function requestRemoteSnapshot() {
  if (!shouldAttemptRemote()) return null
  try {
    lastRemoteAttemptAt = now()
    const res = await fetch(SHARED_API_ENDPOINT, { method: 'GET' })
    if (!res.ok) throw new Error('shared-api-get-failed')
    const json = await res.json()
    const snapshot = normalizeSnapshot(json?.data)
    remoteStatus = 'enabled'
    lastSyncedAt = now()
    persistSnapshot(snapshot)
    return snapshot
  } catch (_) {
    remoteStatus = 'disabled'
    return null
  }
}

async function runRemoteMutation(op, payload = {}) {
  if (!shouldAttemptRemote()) return null
  try {
    lastRemoteAttemptAt = now()
    const res = await fetch(SHARED_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ op, payload }),
    })
    if (!res.ok) throw new Error('shared-api-post-failed')
    const json = await res.json()
    const snapshot = normalizeSnapshot(json?.data)
    remoteStatus = 'enabled'
    lastSyncedAt = now()
    persistSnapshot(snapshot)
    return json?.result ?? null
  } catch (_) {
    remoteStatus = 'disabled'
    return null
  }
}

async function ensureSynced(options = {}) {
  const { force = false } = options
  if (!force && now() - lastSyncedAt < SHARED_SYNC_TTL_MS) {
    return cache
  }
  if (syncPromise) {
    return syncPromise
  }
  syncPromise = (async () => {
    await requestRemoteSnapshot()
    return cache
  })()
  try {
    return await syncPromise
  } finally {
    syncPromise = null
  }
}

export function checkOperatorPassword(input) {
  return input === OPERATOR_PASSWORD
}

export function getBoardDisplayName(homeId, boardId) {
  if (boardId === 'news') {
    const home = cache.homes.find((h) => h.id === homeId)
    return home ? `${home.title} 소식` : '소식'
  }
  return BOARD_IDS[boardId] || boardId
}

export function getStoredNickname() {
  try {
    return sessionStorage.getItem(NICKNAME_KEY) || ''
  } catch (_) {
    return ''
  }
}

export function setStoredNickname(nick) {
  try {
    sessionStorage.setItem(NICKNAME_KEY, nick || '')
  } catch (_) {}
}

/** 사용자가 만든 프렌즈홈 목록 */
export async function getHomes() {
  await ensureSynced()
  return [...cache.homes].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export async function getHome(homeId) {
  await ensureSynced()
  return cache.homes.find((h) => h.id === homeId) || null
}

/** 새 프렌즈홈 생성. { title } 필수 */
export async function createHome({ title }) {
  const nextTitle = normalizeHomeTitle(title) || '이름 없는 프렌즈홈'
  const remote = await runRemoteMutation('createHome', { title: nextTitle })
  if (remote) return remote

  const home = {
    id: generateHomeId(),
    title: nextTitle,
    createdAt: now(),
  }
  const homes = [home, ...cache.homes]
  persistSnapshot({ ...cache, homes })
  return home
}

/** 프렌즈홈 제목 등 수정 */
export async function updateHome(homeId, { title }) {
  const nextTitle = title === undefined ? undefined : normalizeHomeTitle(title)
  const remote = await runRemoteMutation('updateHome', { homeId, title: nextTitle })
  if (remote) return remote

  const homes = [...cache.homes]
  const home = homes.find((h) => h.id === homeId)
  if (!home) return null
  if (nextTitle !== undefined && nextTitle) {
    home.title = nextTitle
  }
  persistSnapshot({ ...cache, homes })
  return home
}

export async function getPosts(homeId, boardId) {
  await ensureSynced()
  const key = `${homeId}:${boardId}`
  const list = cache.posts[key] || []
  return [...list].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export async function getPost(homeId, boardId, postId) {
  const list = await getPosts(homeId, boardId)
  return list.find((p) => p.id === postId) || null
}

export async function addPost(homeId, boardId, { title, body, author }) {
  const payload = {
    homeId,
    boardId,
    title,
    body,
    author: author || '익명',
  }
  const remote = await runRemoteMutation('addPost', payload)
  if (remote) return remote

  const key = `${homeId}:${boardId}`
  const posts = { ...cache.posts }
  const list = Array.isArray(posts[key]) ? [...posts[key]] : []
  const post = {
    id: generatePostId(),
    title,
    body,
    author: author || '익명',
    createdAt: now(),
    views: 0,
  }
  list.push(post)
  posts[key] = list
  persistSnapshot({ ...cache, posts })
  return post
}

export async function increaseViews(homeId, boardId, postId) {
  const remote = await runRemoteMutation('increaseViews', { homeId, boardId, postId })
  if (remote) return

  const key = `${homeId}:${boardId}`
  const posts = { ...cache.posts }
  const list = Array.isArray(posts[key]) ? [...posts[key]] : []
  const post = list.find((item) => item.id === postId)
  if (!post) return
  post.views = (post.views || 0) + 1
  posts[key] = list
  persistSnapshot({ ...cache, posts })
}

export async function getComments(homeId, boardId, postId) {
  await ensureSynced()
  const key = `${homeId}:${boardId}:${postId}`
  const list = cache.comments[key] || []
  return [...list].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
}

export async function addComment(homeId, boardId, postId, { body, author }) {
  const payload = {
    homeId,
    boardId,
    postId,
    body,
    author: author || '익명',
  }
  const remote = await runRemoteMutation('addComment', payload)
  if (remote) return remote

  const key = `${homeId}:${boardId}:${postId}`
  const comments = { ...cache.comments }
  const list = Array.isArray(comments[key]) ? [...comments[key]] : []
  const comment = {
    id: generateCommentId(),
    body,
    author: author || '익명',
    createdAt: now(),
  }
  list.push(comment)
  comments[key] = list
  persistSnapshot({ ...cache, comments })
  return comment
}

function normalizeAuthor(author) {
  if (typeof author !== 'string') return ''
  return author.trim()
}

/**
 * homeId 기준 유니크 작성자 목록(닉네임 문자열 기준)을 반환한다.
 * 현재 제품에는 userId가 없으므로 동일 닉네임은 같은 사용자로 본다.
 */
export async function getHomeUniqueAuthors(homeId, options = {}) {
  await ensureSynced()
  const { includeComments = true, excludedBoards = ['notice'] } = options
  const excludedBoardSet = new Set(excludedBoards)
  const authors = new Set()

  Object.entries(cache.posts || {}).forEach(([key, posts]) => {
    const [postHomeId, boardId] = key.split(':')
    if (postHomeId !== homeId || excludedBoardSet.has(boardId)) return
    const postList = posts || []
    postList.forEach((post) => {
      const author = normalizeAuthor(post?.author)
      if (author) authors.add(author)
    })
  })

  if (!includeComments) {
    return Array.from(authors)
  }

  Object.entries(cache.comments || {}).forEach(([key, comments]) => {
    const [commentHomeId, boardId] = key.split(':')
    if (commentHomeId !== homeId || excludedBoardSet.has(boardId)) return
    const commentList = comments || []
    commentList.forEach((comment) => {
      const author = normalizeAuthor(comment?.author)
      if (author) authors.add(author)
    })
  })

  return Array.from(authors)
}
