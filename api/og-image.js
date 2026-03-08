import {
  buildMetaByHome,
  escapeXml,
  fetchSharedSnapshot,
  getHomeById,
  getHomeId,
  getRequestOrigin,
  getUniqueAuthorCount,
} from './_og-shared.js'
import { Resvg } from '@resvg/resvg-js'

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

function clampText(input, maxLength) {
  const text = String(input || '').trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, Math.max(0, maxLength - 1))}…`
}

function buildSvg({ title, subtitle, uniqueAuthorCount, isMainHome }) {
  const mood = getMood(uniqueAuthorCount)
  const moodColor = getMoodColor(mood)
  const totalAvatars = Math.min(uniqueAuthorCount, 4) + 1
  const safeTitle = escapeXml(clampText(title, 30))
  const safeSubtitle = escapeXml(clampText(subtitle, 48))
  const avatarSvg = buildAvatarSvg(totalAvatars)
  const mainBadge = isMainHome
    ? `<rect x="70" y="350" width="290" height="54" rx="14" fill="#0f172acc" />
  <text x="98" y="386" font-size="28" font-family="'Malgun Gothic', 'Noto Sans KR', sans-serif" fill="#facc15">
    메인홈 공유 이미지
  </text>`
    : ''

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
  <rect x="70" y="40" width="520" height="40" rx="12" fill="#1d4ed8" />
  <text x="94" y="67" font-size="22" font-family="'Malgun Gothic', 'Noto Sans KR', sans-serif" fill="#e2e8f0" font-weight="700">
    FRIENDSTELL PREVIEW
  </text>
  <rect x="70" y="94" width="1060" height="104" rx="20" fill="#0f172acc" />
  <text x="100" y="156" font-size="52" font-family="'Malgun Gothic', 'Noto Sans KR', sans-serif" fill="#f8fafc" font-weight="700">
    ${safeTitle}
  </text>
  <rect x="70" y="214" width="930" height="56" rx="14" fill="#0f172acc" />
  <text x="100" y="252" font-size="28" font-family="'Malgun Gothic', 'Noto Sans KR', sans-serif" fill="#dbeafe">
    ${safeSubtitle}
  </text>
  <rect x="70" y="286" width="320" height="66" rx="14" fill="#0f172acc" />
  <circle cx="114" cy="303" r="14" fill="${moodColor}" />
  <text x="142" y="313" font-size="28" font-family="'Malgun Gothic', 'Noto Sans KR', sans-serif" fill="#f8fafc">
    미니룸 분위기: ${mood}
  </text>
  ${mainBadge}
  <rect x="70" y="364" width="430" height="74" rx="14" fill="#f59e0b" />
  <text x="96" y="410" font-size="30" font-family="'Malgun Gothic', 'Noto Sans KR', sans-serif" fill="#111827" font-weight="700">
    지금 링크 열고 같이 글쓰기 ->
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
  const view = typeof req?.query?.view === 'string' ? req.query.view : ''
  const snapshot = await fetchSharedSnapshot(origin)
  const home = getHomeById(snapshot, homeId)
  const uniqueAuthorCount = getUniqueAuthorCount(snapshot, homeId)
  const baseMeta = buildMetaByHome(home)
  const isMainHome = !home && view === 'main'
  const ogTitle = isMainHome ? '프렌즈텔 메인홈' : baseMeta.title
  const subtitle = home
    ? `오늘 방문 친구 ${uniqueAuthorCount}명과 함께하는 캠핑장 미니룸`
    : isMainHome
      ? '친구와 함께 쓰는 게시판을 만들고 링크를 공유해 보세요.'
      : '프렌즈텔 공유 이미지'

  const svg = buildSvg({
    title: ogTitle,
    subtitle,
    uniqueAuthorCount: home ? uniqueAuthorCount : 0,
    isMainHome,
  })

  const png = new Resvg(svg).render().asPng()
  res.setHeader('Content-Type', 'image/png')
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400')
  return res.status(200).send(Buffer.from(png))
}
