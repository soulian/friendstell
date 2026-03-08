const HOMES_STORAGE_KEY = 'friends_tell_homes'
const STORAGE_KEY = 'friends_tell_data'
const NICKNAME_KEY = 'friends_tell_nickname'
const SHARED_API_ENDPOINT = '/api/shared-data'
const SHARED_SYNC_TTL_MS = 5000
const REMOTE_RETRY_INTERVAL_MS = 30000
const PENDING_MUTATIONS_KEY = 'friends_tell_pending_mutations_v1'
const SHARED_WRITE_ERROR_MESSAGE = '공용 DB 연결 문제로 저장할 수 없습니다. 잠시 후 다시 시도해 주세요.'

const AI_IT_HOME_ID = 'home_ai_it_meetup'
const AI_IT_HOME_TITLE = '분당IT 모임'
const AI_SEED_HOME_CREATED_AT = Date.parse('2026-03-07T08:30:00+09:00')
const AI_DEFAULT_TOPIC = 'IT모임'
const AI_ACTIVITY_INTERVAL_MS = 30 * 60 * 1000
const AI_ACTIVITY_START_AT = Date.parse('2026-03-07T12:00:00+09:00')
const AI_ACTIVITY_LOOKBACK_MS = 7 * 24 * 60 * 60 * 1000
const AI_ACTIVITY_BOARDS = ['free', 'news', 'temp']
const AI_HOME_TITLE_ALIASES = new Set([
  'ai it 모임',
  'ai it 모임 프렌즈홈',
  'it 모임',
  'it 모임 프렌즈홈',
  '분당it 모임',
])
const AI_AUTO_POST_TOPICS = [
  '이번 스프린트 진행 상황 공유',
  '오늘 배운 기술 인사이트',
  '배포/운영 체크포인트',
  '코드리뷰에서 발견한 개선점',
  '다음 모임 아젠다 제안',
]
const AI_AUTO_COMMENT_SNIPPETS = [
  '좋은 포인트네요. 바로 적용 가능한 액션으로 정리해둘게요.',
  '관련 사례를 한 가지 더 찾아서 다음 스레드에 공유하겠습니다.',
  '성능/안정성 기준으로 우선순위를 잡아 진행하면 좋겠습니다.',
  '테스트 관점에서도 동일하게 확인해보면 좋겠어요.',
  '다음 업데이트 때 진행 결과를 공유해볼게요.',
]

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
let flushPromise = null
let lastSyncedAt = 0
let lastRemoteAttemptAt = 0
let remoteStatus = 'unknown' // unknown | enabled | disabled
let lastRemoteError = ''

function now() {
  return Date.now()
}

function isPreviewRuntime() {
  if (typeof window === 'undefined') return false
  if (import.meta.env.VITE_PREVIEW_BADGE === 'true') return true
  const host = window.location.hostname || ''
  return /\.vercel\.app$/i.test(host) && host.includes('-git-')
}

function allowsLocalFallback() {
  if (typeof window === 'undefined') return true
  if (import.meta.env.DEV) return true
  if (isPreviewRuntime()) return true
  return false
}

function createSharedRequiredError(reason = 'shared-db-unavailable') {
  const error = new Error('shared-required')
  error.code = 'shared-required'
  error.reason = reason
  return error
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
  if (AI_HOME_TITLE_ALIASES.has(simplified)) {
    return AI_IT_HOME_TITLE
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

function loadPendingMutations() {
  if (!allowsLocalFallback()) return []
  try {
    const raw = localStorage.getItem(PENDING_MUTATIONS_KEY)
    if (!raw) return []
    const list = JSON.parse(raw)
    if (!Array.isArray(list)) return []
    return list.filter((item) => item && typeof item === 'object')
  } catch (_) {
    return []
  }
}

function mutationKey(op, payload = {}) {
  if (payload?.id) return `${op}:${payload.id}`
  if (payload?.homeId && op === 'updateHome') {
    return `${op}:${payload.homeId}:${payload.title || ''}`
  }
  return `${op}:${JSON.stringify(payload)}`
}

function savePendingMutations(list) {
  if (!allowsLocalFallback()) return
  try {
    localStorage.setItem(PENDING_MUTATIONS_KEY, JSON.stringify(list))
  } catch (_) {}
}

function hasPendingMutationKey(key) {
  return loadPendingMutations().some((item) => item?.key === key)
}

function enqueuePendingMutation(op, payload = {}) {
  const key = mutationKey(op, payload)
  if (hasPendingMutationKey(key)) return
  const list = loadPendingMutations()
  list.push({
    key,
    op,
    payload,
    createdAt: now(),
  })
  savePendingMutations(list)
  emitSyncStatusChanged()
}

function clearPendingMutationKeys(keys = []) {
  if (!keys.length) return
  const keySet = new Set(keys)
  const filtered = loadPendingMutations().filter((item) => !keySet.has(item?.key))
  savePendingMutations(filtered)
  emitSyncStatusChanged()
}

function loadLocalSnapshot() {
  if (!allowsLocalFallback()) {
    return normalizeSnapshot({
      homes: [],
      posts: {},
      comments: {},
    })
  }
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
  if (allowsLocalFallback()) {
    saveHomesToLocal(normalized.homes)
    saveDataToLocal({ posts: normalized.posts, comments: normalized.comments })
  }
  emitDataChanged()
}

function emitDataChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('friends-data-updated'))
}

function emitSyncStatusChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('friends-sync-status-updated'))
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

function formatAiActivityTime(createdAt) {
  try {
    return new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Seoul',
    }).format(createdAt)
  } catch (_) {
    return ''
  }
}

function findLatestAiPostBefore(posts, timestamp) {
  let latestPost = null
  Object.entries(posts || {}).forEach(([key, postList]) => {
    const [homeId] = key.split(':')
    if (homeId !== AI_IT_HOME_ID) return
    ;(postList || []).forEach((post) => {
      const createdAt = Number(post?.createdAt)
      if (!Number.isFinite(createdAt) || createdAt > timestamp) return
      if (!latestPost || createdAt > Number(latestPost.createdAt || 0)) {
        latestPost = post
      }
    })
  })
  return latestPost
}

function ensureAiRollingActivity(postsMap, commentsMap) {
  const posts = { ...(postsMap || {}) }
  const comments = { ...(commentsMap || {}) }
  const nowTimestamp = now()
  const latestSlot = Math.floor(nowTimestamp / AI_ACTIVITY_INTERVAL_MS) * AI_ACTIVITY_INTERVAL_MS
  const earliestSlot = Math.max(
    AI_ACTIVITY_START_AT,
    latestSlot - AI_ACTIVITY_LOOKBACK_MS
  )

  for (let slotAt = earliestSlot; slotAt <= latestSlot; slotAt += AI_ACTIVITY_INTERVAL_MS) {
    const slotIndex = Math.floor((slotAt - AI_ACTIVITY_START_AT) / AI_ACTIVITY_INTERVAL_MS)
    if (slotIndex < 0) continue
    const persona = AI_PERSONAS[slotIndex % AI_PERSONAS.length]
    if (!persona) continue

    // 30분 슬롯마다 글/댓글을 번갈아 생성한다.
    if (slotIndex % 2 === 0) {
      const boardId = AI_ACTIVITY_BOARDS[slotIndex % AI_ACTIVITY_BOARDS.length]
      const postId = `ai_auto_post_${slotAt}`
      const boardKey = toBoardKey(AI_IT_HOME_ID, boardId)
      const list = Array.isArray(posts[boardKey]) ? [...posts[boardKey]] : []
      if (!list.some((post) => post?.id === postId)) {
        const topic = AI_AUTO_POST_TOPICS[slotIndex % AI_AUTO_POST_TOPICS.length]
        list.push({
          id: postId,
          title: topic,
          body: `${persona.role} 관점으로 ${topic}을(를) 정리합니다. (${formatAiActivityTime(slotAt)})`,
          author: persona.name,
          createdAt: slotAt,
          views: 0,
        })
      }
      posts[boardKey] = list
      continue
    }

    const targetPost = findLatestAiPostBefore(posts, slotAt)
    if (!targetPost?.id || !targetPost?.boardId) continue
    const commentId = `ai_auto_comment_${slotAt}`
    const commentKey = toCommentKey(AI_IT_HOME_ID, targetPost.boardId, targetPost.id)
    const list = Array.isArray(comments[commentKey]) ? [...comments[commentKey]] : []
    if (!list.some((comment) => comment?.id === commentId)) {
      const snippet = AI_AUTO_COMMENT_SNIPPETS[slotIndex % AI_AUTO_COMMENT_SNIPPETS.length]
      list.push({
        id: commentId,
        body: `${snippet} (${persona.role})`,
        author: persona.name,
        createdAt: slotAt,
      })
    }
    comments[commentKey] = list
  }

  return { posts, comments }
}

function applyAiSeed(snapshot) {
  const seededHomes = ensureAiHomeSeed(snapshot?.homes || [])
  const seededContent = ensureAiSeedContent(snapshot?.posts, snapshot?.comments)
  const rollingContent = ensureAiRollingActivity(seededContent.posts, seededContent.comments)
  return {
    homes: seededHomes,
    posts: rollingContent.posts,
    comments: rollingContent.comments,
  }
}

function setRemoteConnection(status, errorCode = '') {
  const changed = remoteStatus !== status || lastRemoteError !== errorCode
  remoteStatus = status
  lastRemoteError = errorCode
  if (changed) {
    emitSyncStatusChanged()
  }
}

async function requestRemoteSnapshot() {
  if (!shouldAttemptRemote()) return null
  try {
    lastRemoteAttemptAt = now()
    const res = await fetch(SHARED_API_ENDPOINT, { method: 'GET' })
    if (!res.ok) {
      let errorCode = 'shared-api-get-failed'
      try {
        const json = await res.json()
        if (json?.error) errorCode = json.error
      } catch (_) {}
      throw new Error(errorCode)
    }
    const json = await res.json()
    const snapshot = normalizeSnapshot(json?.data)
    setRemoteConnection('enabled', '')
    lastSyncedAt = now()
    persistSnapshot(snapshot)
    return snapshot
  } catch (error) {
    const nextError = error?.message || 'shared-api-get-failed'
    setRemoteConnection('disabled', nextError)
    return null
  }
}

async function postRemoteMutation(op, payload = {}) {
  lastRemoteAttemptAt = now()
  const res = await fetch(SHARED_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ op, payload }),
  })
  if (!res.ok) {
    let errorCode = 'shared-api-post-failed'
    try {
      const json = await res.json()
      if (json?.error) errorCode = json.error
    } catch (_) {}
    return { ok: false, errorCode }
  }
  const json = await res.json()
  return {
    ok: true,
    result: json?.result ?? null,
    snapshot: normalizeSnapshot(json?.data),
  }
}

async function flushPendingMutations() {
  if (!shouldAttemptRemote()) return false
  if (flushPromise) return flushPromise

  flushPromise = (async () => {
    const queue = loadPendingMutations()
    if (!queue.length) return true

    const completedKeys = []
    for (const mutation of queue) {
      const response = await postRemoteMutation(mutation.op, mutation.payload)
      if (!response.ok) {
        setRemoteConnection('disabled', response.errorCode)
        return false
      }
      completedKeys.push(mutation.key)
      if (response.snapshot) {
        persistSnapshot(response.snapshot)
      }
    }

    clearPendingMutationKeys(completedKeys)
    setRemoteConnection('enabled', '')
    lastSyncedAt = now()
    return true
  })()

  try {
    return await flushPromise
  } finally {
    flushPromise = null
  }
}

async function runRemoteMutation(op, payload = {}, options = {}) {
  const { enqueueOnFailure = false, requireSharedWrite = false } = options
  if (!shouldAttemptRemote()) {
    if (requireSharedWrite && !allowsLocalFallback()) {
      throw createSharedRequiredError('shared-api-unreachable')
    }
    if (enqueueOnFailure) enqueuePendingMutation(op, payload)
    return null
  }
  try {
    const response = await postRemoteMutation(op, payload)
    if (!response.ok) {
      if (enqueueOnFailure) enqueuePendingMutation(op, payload)
      setRemoteConnection('disabled', response.errorCode)
      if (requireSharedWrite && !allowsLocalFallback()) {
        throw createSharedRequiredError(response.errorCode)
      }
      return null
    }

    setRemoteConnection('enabled', '')
    lastSyncedAt = now()
    persistSnapshot(response.snapshot)

    const key = mutationKey(op, payload)
    clearPendingMutationKeys([key])
    if (loadPendingMutations().length > 0) {
      await flushPendingMutations()
    }
    return response.result
  } catch (error) {
    const nextError = error?.message || 'shared-api-post-failed'
    if (enqueueOnFailure) enqueuePendingMutation(op, payload)
    setRemoteConnection('disabled', nextError)
    if (requireSharedWrite && !allowsLocalFallback()) {
      throw createSharedRequiredError(nextError)
    }
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
    if (remoteStatus === 'enabled' && loadPendingMutations().length > 0) {
      await flushPendingMutations()
    }
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

export function getSyncStatus() {
  const pendingCount = loadPendingMutations().length
  const mode = remoteStatus === 'enabled'
    ? 'shared'
    : remoteStatus === 'disabled'
      ? (allowsLocalFallback() ? 'local-fallback' : 'shared-required')
      : 'checking'
  return {
    mode,
    pendingCount,
    remoteStatus,
    lastRemoteError,
  }
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
  const home = {
    id: generateHomeId(),
    title: nextTitle,
    createdAt: now(),
  }
  const remote = await runRemoteMutation('createHome', home, { enqueueOnFailure: true, requireSharedWrite: true })
  if (remote) return remote

  const homes = [home, ...cache.homes]
  persistSnapshot({ ...cache, homes })
  return home
}

/** 프렌즈홈 제목 등 수정 */
export async function updateHome(homeId, { title }) {
  const nextTitle = title === undefined ? undefined : normalizeHomeTitle(title)
  const remote = await runRemoteMutation('updateHome', { homeId, title: nextTitle }, { enqueueOnFailure: true, requireSharedWrite: true })
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
  const post = {
    id: generatePostId(),
    homeId,
    boardId,
    title,
    body,
    author: author || '익명',
    createdAt: now(),
    views: 0,
  }
  const remote = await runRemoteMutation('addPost', post, { enqueueOnFailure: true, requireSharedWrite: true })
  if (remote) return remote

  const key = `${homeId}:${boardId}`
  const posts = { ...cache.posts }
  const list = Array.isArray(posts[key]) ? [...posts[key]] : []
  list.push({
    id: post.id,
    title: post.title,
    body: post.body,
    author: post.author,
    createdAt: post.createdAt,
    views: post.views,
  })
  posts[key] = list
  persistSnapshot({ ...cache, posts })
  return {
    id: post.id,
    title: post.title,
    body: post.body,
    author: post.author,
    createdAt: post.createdAt,
    views: post.views,
  }
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
  const comment = {
    id: generateCommentId(),
    homeId,
    boardId,
    postId,
    body,
    author: author || '익명',
    createdAt: now(),
  }
  const remote = await runRemoteMutation('addComment', comment, { enqueueOnFailure: true, requireSharedWrite: true })
  if (remote) return remote

  const key = `${homeId}:${boardId}:${postId}`
  const comments = { ...cache.comments }
  const list = Array.isArray(comments[key]) ? [...comments[key]] : []
  list.push({
    id: comment.id,
    body: comment.body,
    author: comment.author,
    createdAt: comment.createdAt,
  })
  comments[key] = list
  persistSnapshot({ ...cache, comments })
  return {
    id: comment.id,
    body: comment.body,
    author: comment.author,
    createdAt: comment.createdAt,
  }
}

function normalizeAuthor(author) {
  if (typeof author !== 'string') return ''
  return author.trim()
}

function collectHomeAuthorActivity(homeId, options = {}) {
  const { includeComments = true, excludedBoards = ['notice'] } = options
  const excludedBoardSet = new Set(excludedBoards)
  const activityByAuthor = new Map()
  const updateActivity = (author, createdAt) => {
    const normalizedAuthor = normalizeAuthor(author)
    if (!normalizedAuthor) return
    const current = activityByAuthor.get(normalizedAuthor) || 0
    const nextCreatedAt = Number(createdAt)
    const safeCreatedAt = Number.isFinite(nextCreatedAt) ? nextCreatedAt : 0
    activityByAuthor.set(normalizedAuthor, Math.max(current, safeCreatedAt))
  }

  Object.entries(cache.posts || {}).forEach(([key, posts]) => {
    const [postHomeId, boardId] = key.split(':')
    if (postHomeId !== homeId || excludedBoardSet.has(boardId)) return
    const postList = posts || []
    postList.forEach((post) => {
      updateActivity(post?.author, post?.createdAt)
    })
  })

  if (!includeComments) {
    return activityByAuthor
  }

  Object.entries(cache.comments || {}).forEach(([key, comments]) => {
    const [commentHomeId, boardId] = key.split(':')
    if (commentHomeId !== homeId || excludedBoardSet.has(boardId)) return
    const commentList = comments || []
    commentList.forEach((comment) => {
      updateActivity(comment?.author, comment?.createdAt)
    })
  })

  return activityByAuthor
}

/**
 * homeId 기준 유니크 작성자 목록(닉네임 문자열 기준)을 반환한다.
 * 현재 제품에는 userId가 없으므로 동일 닉네임은 같은 사용자로 본다.
 */
export async function getHomeUniqueAuthors(homeId, options = {}) {
  await ensureSynced()
  const activityByAuthor = collectHomeAuthorActivity(homeId, options)
  return Array.from(activityByAuthor.keys())
}

export async function getHomeAuthorActivity(homeId, options = {}) {
  await ensureSynced()
  const activityByAuthor = collectHomeAuthorActivity(homeId, options)
  return Array.from(activityByAuthor.entries())
    .map(([name, lastActivityAt]) => ({
      name,
      lastActivityAt: Number(lastActivityAt) || 0,
    }))
    .sort((a, b) => (b.lastActivityAt || 0) - (a.lastActivityAt || 0))
}

export function isSharedWriteError(error) {
  return error?.code === 'shared-required'
}

export function getSharedWriteErrorMessage() {
  return SHARED_WRITE_ERROR_MESSAGE
}
