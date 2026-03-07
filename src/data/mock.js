const HOMES_STORAGE_KEY = 'friends_tell_homes'

function loadHomes() {
  try {
    const raw = localStorage.getItem(HOMES_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return []
}

function saveHomes(homes) {
  try {
    localStorage.setItem(HOMES_STORAGE_KEY, JSON.stringify(homes))
  } catch (_) {}
}

function generateHomeId() {
  return `h_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
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
  if (title !== undefined) home.title = (title || '').trim() || home.title
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

const STORAGE_KEY = 'friends_tell_data'
const NICKNAME_KEY = 'friends_tell_nickname'

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

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return { posts: {}, comments: {} }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (_) {}
}

export function getPosts(homeId, boardId) {
  const data = loadData()
  const key = `${homeId}:${boardId}`
  const list = data.posts[key] || []
  return [...list].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

export function getPost(homeId, boardId, postId) {
  const list = getPosts(homeId, boardId)
  return list.find((p) => p.id === postId) || null
}

export function addPost(homeId, boardId, { title, body, author }) {
  const data = loadData()
  const key = `${homeId}:${boardId}`
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
  const key = `${homeId}:${boardId}`
  const list = data.posts[key] || []
  const post = list.find((p) => p.id === postId)
  if (post) {
    post.views = (post.views || 0) + 1
    saveData(data)
  }
}

export function getComments(homeId, boardId, postId) {
  const data = loadData()
  const key = `${homeId}:${boardId}:${postId}`
  const list = data.comments[key] || []
  return [...list].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
}

export function addComment(homeId, boardId, postId, { body, author }) {
  const data = loadData()
  const key = `${homeId}:${boardId}:${postId}`
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
