import {
  buildMetaByHome,
  escapeXml,
  fetchSharedSnapshot,
  getHomeById,
  getHomeId,
  getRequestOrigin,
  getUniqueAuthorCount,
} from './_og-shared.js'

function getMood(uniqueAuthorCount) {
  if (uniqueAuthorCount === 0) return 'quiet'
  if (uniqueAuthorCount >= 4) return 'busy'
  return 'warm'
}

function getMoodColor(mood) {
  if (mood === 'busy') return '#ff9f43'
  if (mood === 'warm') return '#f6c560'
  return '#8ac6ff'
}

function buildAvatarSvg(totalAvatars) {
  const colors = ['#e0f2fe', '#fde68a', '#fca5a5', '#c4b5fd', '#86efac']
  const startX = 760
  const gap = 72
  return Array.from({ length: totalAvatars })
    .map((_, index) => {
      const x = startX + index * gap
      const y = 450 + (index % 2 === 0 ? 0 : -14)
      const fill = colors[index % colors.length]
      return `<circle cx="${x}" cy="${y}" r="24" fill="${fill}" stroke="#0f172a" stroke-width="4" />
<circle cx="${x}" cy="${y - 7}" r="4" fill="#0f172a" />
<path d="M ${x - 8} ${y + 8} Q ${x} ${y + 18} ${x + 8} ${y + 8}" stroke="#0f172a" stroke-width="3" fill="none" />`
    })
    .join('\n')
}

function buildSvg({ title, subtitle, uniqueAuthorCount }) {
  const mood = getMood(uniqueAuthorCount)
  const moodColor = getMoodColor(mood)
  const totalAvatars = Math.min(uniqueAuthorCount, 4) + 1
  const safeTitle = escapeXml(title)
  const safeSubtitle = escapeXml(subtitle)
  const avatarSvg = buildAvatarSvg(totalAvatars)

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${safeTitle}">
  <defs>
    <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="#0b1f3b" />
      <stop offset="100%" stop-color="#1e3a8a" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#sky)" />
  <circle cx="120" cy="90" r="4" fill="#dbeafe" />
  <circle cx="180" cy="62" r="3" fill="#dbeafe" />
  <circle cx="260" cy="105" r="3" fill="#dbeafe" />
  <circle cx="340" cy="84" r="2.5" fill="#dbeafe" />
  <circle cx="430" cy="58" r="3.5" fill="#dbeafe" />
  <circle cx="540" cy="102" r="3" fill="#dbeafe" />
  <circle cx="1030" cy="96" r="32" fill="#e2e8f0" />
  <path d="M0 410 L200 280 L430 410 Z" fill="#334155" />
  <path d="M260 410 L520 240 L780 410 Z" fill="#1f2937" />
  <path d="M660 410 L900 250 L1140 410 Z" fill="#334155" />
  <rect y="410" width="1200" height="220" fill="#14532d" />
  <polygon points="870,420 980,330 1090,420" fill="#f59e0b" />
  <polygon points="895,420 980,360 1065,420" fill="#d97706" />
  <rect x="575" y="460" width="50" height="20" rx="8" fill="#fb923c" />
  <circle cx="600" cy="446" r="15" fill="#f97316" />
  <circle cx="600" cy="436" r="10" fill="#fde68a" />
  <rect x="70" y="76" width="620" height="96" rx="20" fill="#0f172acc" />
  <text x="100" y="132" font-size="56" font-family="'Malgun Gothic', 'Noto Sans KR', sans-serif" fill="#f8fafc" font-weight="700">
    ${safeTitle}
  </text>
  <rect x="70" y="190" width="760" height="58" rx="14" fill="#0f172acc" />
  <text x="100" y="230" font-size="30" font-family="'Malgun Gothic', 'Noto Sans KR', sans-serif" fill="#dbeafe">
    ${safeSubtitle}
  </text>
  <rect x="70" y="270" width="320" height="66" rx="14" fill="#0f172acc" />
  <circle cx="114" cy="303" r="14" fill="${moodColor}" />
  <text x="142" y="313" font-size="28" font-family="'Malgun Gothic', 'Noto Sans KR', sans-serif" fill="#f8fafc">
    미니룸 분위기: ${mood}
  </text>
  ${avatarSvg}
</svg>`
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'method-not-allowed' })
  }

  const origin = getRequestOrigin(req)
  const pathname = req?.query?.path || req?.url || ''
  const homeId = getHomeId(req, pathname)
  const snapshot = await fetchSharedSnapshot(origin)
  const home = getHomeById(snapshot, homeId)
  const uniqueAuthorCount = getUniqueAuthorCount(snapshot, homeId)
  const baseMeta = buildMetaByHome(home)
  const subtitle = home
    ? `오늘 방문 친구 ${uniqueAuthorCount}명과 함께하는 캠핑장 미니룸`
    : '친구와 함께 쓰는 게시판을 만들고 링크를 공유해 보세요.'

  const svg = buildSvg({
    title: baseMeta.title,
    subtitle,
    uniqueAuthorCount,
  })

  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400')
  return res.status(200).send(svg)
}
