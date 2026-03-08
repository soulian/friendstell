const HOMES_STORAGE_KEY = 'friends_tell_homes'
const STORAGE_KEY = 'friends_tell_data'
const NICKNAME_KEY = 'friends_tell_nickname'

const AI_IT_HOME_ID = 'home_ai_it_meetup'
const AI_IT_HOME_TITLE = 'AI IT 모임 프렌즈홈'
const AI_AUTOPLAY_META_KEY = 'aiItMeetupLastPlayDate'

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

function toBoardKey(homeId, boardId) {
  return `${homeId}:${boardId}`
}

function toCommentKey(homeId, boardId, postId) {
  return `${homeId}:${boardId}:${postId}`
}

function saveHomes(homes) {
  try {
    localStorage.setItem(HOMES_STORAGE_KEY, JSON.stringify(homes))
  } catch (_) {}
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (_) {}
}

function generateHomeId() {
  return `h_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

function ensureAiHomeSeed(homes) {
  const list = Array.isArray(homes) ? [...homes] : []
  const idx = list.findIndex((home) => home?.id === AI_IT_HOME_ID)
  let changed = false

  if (idx < 0) {
    list.unshift({
      id: AI_IT_HOME_ID,
      title: AI_IT_HOME_TITLE,
      createdAt: Date.now(),
      topic: 'IT모임',
      personas: AI_PERSONAS.map((persona) => persona.name),
      isAiSeedHome: true,
    })
    changed = true
  } else {
    const current = list[idx] || {}
    const next = {
      ...current,
      id: AI_IT_HOME_ID,
      createdAt: current.createdAt || Date.now(),
      topic: current.topic || 'IT모임',
      personas: Array.isArray(current.personas) ? current.personas : AI_PERSONAS.map((persona) => persona.name),
      isAiSeedHome: true,
    }
    if (current.title !== AI_IT_HOME_TITLE && !current.userCustomizedTitle) {
      next.title = AI_IT_HOME_TITLE
      changed = true
    }
    if (JSON.stringify(current) !== JSON.stringify(next)) {
      list[idx] = next
      changed = true
    }
  }

  return { homes: list, changed }
}

function ensureArrayRecord(data, key) {
  if (!Array.isArray(data[key])) data[key] = []
  return data[key]
}

function ensureAiSeedPosts(data) {
  let changed = false

  AI_SEED_POSTS.forEach((seedPost) => {
    const key = toBoardKey(AI_IT_HOME_ID, seedPost.boardId)
    const posts = ensureArrayRecord(data.posts, key)
    const exists = posts.some((post) => post?.id === seedPost.id)
    if (!exists) {
      posts.push({
        id: seedPost.id,
        title: seedPost.title,
        body: seedPost.body,
        author: seedPost.author,
        createdAt: seedPost.createdAt,
        views: seedPost.views || 0,
      })
      changed = true
    }
  })

  AI_SEED_COMMENTS.forEach((seedComment) => {
    const key = toCommentKey(AI_IT_HOME_ID, seedComment.boardId, seedComment.postId)
    const comments = ensureArrayRecord(data.comments, key)
    const exists = comments.some((comment) => comment?.id === seedComment.id)
    if (!exists) {
      comments.push({
        id: seedComment.id,
        body: seedComment.body,
        author: seedComment.author,
        createdAt: seedComment.createdAt,
      })
      changed = true
    }
  })

  return changed
}

function ensureAiDailyPlay(data) {
  const today = new Date().toISOString().slice(0, 10)
  if (data.meta[AI_AUTOPLAY_META_KEY] === today) return false

  const daySeed = Number(today.replaceAll('-', ''))
  const leadPersona = AI_PERSONAS[daySeed % AI_PERSONAS.length]
  const replyPersonaA = AI_PERSONAS[(daySeed + 1) % AI_PERSONAS.length]
  const replyPersonaB = AI_PERSONAS[(daySeed + 2) % AI_PERSONAS.length]
  const dailyPostId = `daily_it_chat_${today}`
  const boardId = 'free'
  const boardKey = toBoardKey(AI_IT_HOME_ID, boardId)
  const posts = ensureArrayRecord(data.posts, boardKey)

  if (!posts.some((post) => post?.id === dailyPostId)) {
    posts.push({
      id: dailyPostId,
      title: `${today} IT 모임 체크인`,
      body: `${leadPersona.role} 관점에서 오늘 가장 기대되는 기술 이슈를 자유롭게 남겨주세요!`,
      author: leadPersona.name,
      createdAt: Date.now(),
      views: 0,
    })
  }

  const commentsKey = toCommentKey(AI_IT_HOME_ID, boardId, dailyPostId)
  const comments = ensureArrayRecord(data.comments, commentsKey)
  const dailyComments = [
    {
      id: `${dailyPostId}_c1`,
      body: `저는 오늘 ${replyPersonaA.role} 업무에서 자동화 한 가지를 꼭 개선해보려고 해요.`,
      author: replyPersonaA.name,
    },
    {
      id: `${dailyPostId}_c2`,
      body: `좋아요! 끝나고 나서 배운 점을 정리해서 다음 모임 안건으로 올려볼게요.`,
      author: replyPersonaB.name,
    },
  ]

  dailyComments.forEach((comment, index) => {
    if (!comments.some((item) => item?.id === comment.id)) {
      comments.push({
        ...comment,
        createdAt: Date.now() + index,
      })
    }
  })

  data.meta[AI_AUTOPLAY_META_KEY] = today
  return true
}

function normalizeDataShape(rawData) {
  const parsed = rawData && typeof rawData === 'object' ? rawData : {}
  return {
    posts: parsed.posts && typeof parsed.posts === 'object' ? parsed.posts : {},
    comments: parsed.comments && typeof parsed.comments === 'object' ? parsed.comments : {},
    meta: parsed.meta && typeof parsed.meta === 'object' ? parsed.meta : {},
  }
}

function loadHomes() {
  let parsed = []
  try {
    const raw = localStorage.getItem(HOMES_STORAGE_KEY)
    if (raw) {
      const candidate = JSON.parse(raw)
      if (Array.isArray(candidate)) parsed = candidate
    }
  } catch (_) {}

  const { homes, changed } = ensureAiHomeSeed(parsed)
  if (changed) saveHomes(homes)
  return homes
}

function loadData() {
  let parsed = {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) parsed = JSON.parse(raw)
  } catch (_) {}

  const data = normalizeDataShape(parsed)
  const seeded = ensureAiSeedPosts(data)
  const autoplayed = ensureAiDailyPlay(data)
  if (seeded || autoplayed) saveData(data)
  return data
}

/** 사용자가 만든 프렌즈홈 목록 */
export function getHomes() {
  return [...loadHomes()].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export function getHome(homeId) {
  return loadHomes().find((h) => h.id === homeId) || null
}

/** 새 프렌즈홈 생성. { title } 필수 */
export function createHome({ title }) {
  const homes = loadHomes()
  const id = generateHomeId()
  const home = {
    id,
    title: (title || '').trim() || '이름 없는 프렌즈홈',
    createdAt: Date.now(),
  }
  homes.unshift(home)
  saveHomes(homes)
  return home
}

/** 프렌즈홈 제목 등 수정 */
export function updateHome(homeId, { title }) {
  const homes = loadHomes()
  const home = homes.find((h) => h.id === homeId)
  if (!home) return null
  if (title !== undefined) {
    const nextTitle = (title || '').trim()
    if (nextTitle) {
      home.title = nextTitle
      if (home.id === AI_IT_HOME_ID) home.userCustomizedTitle = true
    }
  }
  saveHomes(homes)
  return home
}

// ——— 게시판 ———
export const BOARD_IDS = {
  notice: '공지사항',
  free: '자유게시판',
  news: '소식',
  temp: '임시 게시판',
}

export const OPERATOR_PASSWORD = 'village2024'

export function checkOperatorPassword(input) {
  return input === OPERATOR_PASSWORD
}

export function getBoardDisplayName(homeId, boardId) {
  if (boardId === 'news') {
    const home = getHome(homeId)
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

export function getPosts(homeId, boardId) {
  const data = loadData()
  const key = toBoardKey(homeId, boardId)
  const list = data.posts[key] || []
  return [...list].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export function getPost(homeId, boardId, postId) {
  const list = getPosts(homeId, boardId)
  return list.find((p) => p.id === postId) || null
}

export function addPost(homeId, boardId, { title, body, author }) {
  const data = loadData()
  const key = toBoardKey(homeId, boardId)
  if (!data.posts[key]) data.posts[key] = []
  const post = {
    id: `p_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    title,
    body,
    author: author || '익명',
    createdAt: Date.now(),
    views: 0,
  }
  data.posts[key].push(post)
  saveData(data)
  return post
}

export function increaseViews(homeId, boardId, postId) {
  const data = loadData()
  const key = toBoardKey(homeId, boardId)
  const list = data.posts[key] || []
  const post = list.find((p) => p.id === postId)
  if (post) {
    post.views = (post.views || 0) + 1
    saveData(data)
  }
}

export function getComments(homeId, boardId, postId) {
  const data = loadData()
  const key = toCommentKey(homeId, boardId, postId)
  const list = data.comments[key] || []
  return [...list].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
}

export function addComment(homeId, boardId, postId, { body, author }) {
  const data = loadData()
  const key = toCommentKey(homeId, boardId, postId)
  if (!data.comments[key]) data.comments[key] = []
  const comment = {
    id: `c_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    body,
    author: author || '익명',
    createdAt: Date.now(),
  }
  data.comments[key].push(comment)
  saveData(data)
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
export function getHomeUniqueAuthors(homeId, options = {}) {
  const { includeComments = true, excludedBoards = ['notice'] } = options
  const data = loadData()
  const excludedBoardSet = new Set(excludedBoards)
  const authors = new Set()

  Object.entries(data.posts || {}).forEach(([key, posts]) => {
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

  Object.entries(data.comments || {}).forEach(([key, comments]) => {
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
