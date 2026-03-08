const HOMES_STORAGE_KEY = 'friends_tell_homes'
const STORAGE_KEY = 'friends_tell_data'
const NICKNAME_KEY = 'friends_tell_nickname'
const SHARED_API_ENDPOINT = '/api/shared-data'
const SHARED_SYNC_TTL_MS = 5000
const REMOTE_RETRY_INTERVAL_MS = 30000

const AI_IT_HOME_ID = 'home_ai_it_meetup'
const AI_IT_HOME_TITLE = 'AI IT 모임 프렌즈홈'
const AI_SEED_HOME_CREATED_AT = Date.parse('2026-03-07T08:30:00+09:00')
const AI_DEFAULT_TOPIC = 'IT모임'

const AI_PERSONAS = [
  { name: 'FE 유나', role: '프론트엔드' },
  { name: 'BE 도윤', role: '백엔드' },
  { name: '데이터 소민', role: '데이터 엔지니어' },
  { name: 'DevOps 태성', role: 'DevOps' },
  { name: 'PM 하린', role: '프로덕트 매니저' },
]

const AI_SEED_POSTS = [
  {
    id: 'seed_it_standup',
    boardId: 'free',
    title: '오늘 IT 모임 스탠드업 시작!',
    body: '각자 오늘 집중할 기술 주제 하나씩 공유해요. 저는 프론트 번들 최적화를 가져왔어요.',
    author: 'PM 하린',
    createdAt: Date.parse('2026-03-07T09:00:00+09:00'),
    views: 14,
  },
  {
    id: 'seed_ai_code_review',
    boardId: 'free',
    title: 'AI 코드리뷰 툴, 어디까지 자동화하시나요?',
    body: 'PR 요약/리스크 체크/테스트 추천 중에서 어디를 가장 많이 자동화하는지 궁금합니다.',
    author: 'BE 도윤',
    createdAt: Date.parse('2026-03-07T10:30:00+09:00'),
    views: 11,
  },
  {
    id: 'seed_react_meetup_news',
    boardId: 'news',
    title: '이번 주 모임 주제: React 성능 체감 개선',
    body: '리렌더 추적, 메모이제이션 기준, 번들 스플리팅 사례를 같이 정리해봅시다.',
    author: 'FE 유나',
    createdAt: Date.parse('2026-03-07T11:20:00+09:00'),
    views: 9,
  },
  {
    id: 'seed_offline_vote',
    boardId: 'temp',
    title: '오프라인 모임 장소 후보 (의견 주세요)',
    body: '강남/홍대/온라인 줌 중 어디가 좋을까요? 교통/장비/소음 기준으로 추천 부탁해요.',
    author: 'DevOps 태성',
    createdAt: Date.parse('2026-03-07T13:10:00+09:00'),
    views: 7,
  },
]

const AI_SEED_COMMENTS = [
  {
    id: 'seed_it_standup_c1',
    boardId: 'free',
    postId: 'seed_it_standup',
    body: '저는 ETL 배치 시간을 20분 줄이는 작업을 우선순위로 잡았어요.',
    author: '데이터 소민',
    createdAt: Date.parse('2026-03-07T09:08:00+09:00'),
  },
  {
    id: 'seed_it_standup_c2',
    boardId: 'free',
    postId: 'seed_it_standup',
    body: '좋아요! 저는 IaC 리팩터링으로 배포 안정성 지표부터 챙겨볼게요.',
    author: 'DevOps 태성',
    createdAt: Date.parse('2026-03-07T09:14:00+09:00'),
  },
  {
    id: 'seed_ai_code_review_c1',
    boardId: 'free',
    postId: 'seed_ai_code_review',
    body: '저희는 AI가 먼저 회귀 위험 파일을 태깅하고, 최종 판단은 사람이 해요.',
    author: 'FE 유나',
    createdAt: Date.parse('2026-03-07T10:46:00+09:00'),
  },
  {
    id: 'seed_ai_code_review_c2',
    boardId: 'free',
    postId: 'seed_ai_code_review',
    body: '배포 전 체크리스트 자동 코멘트가 특히 효과가 좋았습니다.',
    author: 'PM 하린',
    createdAt: Date.parse('2026-03-07T10:51:00+09:00'),
  },
  {
    id: 'seed_react_meetup_news_c1',
    boardId: 'news',
    postId: 'seed_react_meetup_news',
    body: '좋아요. 백엔드에서는 API 응답 캐시 전략도 같이 공유해볼게요.',
    author: 'BE 도윤',
    createdAt: Date.parse('2026-03-07T11:32:00+09:00'),
  },
]

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
  const seeded = applyAiSeed({
    homes,
    posts: snapshot?.posts && typeof snapshot.posts === 'object' ? snapshot.posts : {},
    comments: snapshot?.comments && typeof snapshot.comments === 'object' ? snapshot.comments : {},
  })
  return {
    homes: seeded.homes,
    posts: seeded.posts,
    comments: seeded.comments,
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

function toBoardKey(homeId, boardId) {
  return `${homeId}:${boardId}`
}

function toCommentKey(homeId, boardId, postId) {
  return `${homeId}:${boardId}:${postId}`
}

function ensureAiHomeSeed(homes) {
  const list = Array.isArray(homes) ? [...homes] : []
  const idx = list.findIndex((home) => home?.id === AI_IT_HOME_ID)
  if (idx < 0) {
    list.unshift({
      id: AI_IT_HOME_ID,
      title: AI_IT_HOME_TITLE,
      createdAt: AI_SEED_HOME_CREATED_AT,
      topic: AI_DEFAULT_TOPIC,
      personas: AI_PERSONAS.map((persona) => persona.name),
      isAiSeedHome: true,
    })
    return list
  }

  const current = list[idx] || {}
  list[idx] = {
    ...current,
    id: AI_IT_HOME_ID,
    title: current.userCustomizedTitle ? current.title || AI_IT_HOME_TITLE : AI_IT_HOME_TITLE,
    createdAt: current.createdAt || AI_SEED_HOME_CREATED_AT,
    topic: current.topic || AI_DEFAULT_TOPIC,
    personas: Array.isArray(current.personas) ? current.personas : AI_PERSONAS.map((persona) => persona.name),
    isAiSeedHome: true,
  }
  return list
}

function ensureAiSeedContent(postsMap, commentsMap) {
  const posts = { ...(postsMap || {}) }
  const comments = { ...(commentsMap || {}) }

  AI_SEED_POSTS.forEach((seedPost) => {
    const key = toBoardKey(AI_IT_HOME_ID, seedPost.boardId)
    const list = Array.isArray(posts[key]) ? [...posts[key]] : []
    if (!list.some((post) => post?.id === seedPost.id)) {
      list.push({
        id: seedPost.id,
        title: seedPost.title,
        body: seedPost.body,
        author: seedPost.author,
        createdAt: seedPost.createdAt,
        views: seedPost.views || 0,
      })
    }
    posts[key] = list
  })

  AI_SEED_COMMENTS.forEach((seedComment) => {
    const key = toCommentKey(AI_IT_HOME_ID, seedComment.boardId, seedComment.postId)
    const list = Array.isArray(comments[key]) ? [...comments[key]] : []
    if (!list.some((comment) => comment?.id === seedComment.id)) {
      list.push({
        id: seedComment.id,
        body: seedComment.body,
        author: seedComment.author,
        createdAt: seedComment.createdAt,
      })
    }
    comments[key] = list
  })

  return { posts, comments }
}

function applyAiSeed(snapshot) {
  const seededHomes = ensureAiHomeSeed(snapshot?.homes || [])
  const seededContent = ensureAiSeedContent(snapshot?.posts, snapshot?.comments)
  return {
    homes: seededHomes,
    posts: seededContent.posts,
    comments: seededContent.comments,
  }
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
    if (home.id === AI_IT_HOME_ID) {
      home.userCustomizedTitle = true
    }
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
