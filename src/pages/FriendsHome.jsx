import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useParams, Navigate, useNavigate } from 'react-router-dom'
import {
  getHome,
  getPosts,
  getHomeAuthorActivity,
  getBoardDisplayName,
} from '../data/mock'
import './FriendsHome.css'

const AVATAR_VARIANTS = [
  'is-variant-1',
  'is-variant-2',
  'is-variant-3',
  'is-variant-4',
  'is-variant-5',
  'is-variant-6',
  'is-variant-7',
  'is-variant-8',
  'is-variant-9',
  'is-variant-10',
]

function hashString(input) {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function getFallbackWeatherTheme() {
  const hour = new Date().getHours()
  if (hour < 6 || hour >= 20) {
    return {
      theme: 'night-clear',
      label: '현재 시각 기준 밤하늘 테마를 적용했어요.',
    }
  }
  if (hour < 12) {
    return {
      theme: 'day-clear',
      label: '현재 시각 기준 맑은 아침 하늘 테마를 적용했어요.',
    }
  }
  if (hour < 17) {
    return {
      theme: 'day-cloudy',
      label: '현재 시각 기준 구름 낀 낮 하늘 테마를 적용했어요.',
    }
  }
  return {
    theme: 'day-rain',
    label: '현재 시각 기준 비 오는 저녁 하늘 테마를 적용했어요.',
  }
}

function getThemeByWeatherCode(weatherCode, isDaytime) {
  const code = Number(weatherCode)
  const snowCodes = new Set([71, 73, 75, 77, 85, 86])
  const rainCodes = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99])
  const cloudyCodes = new Set([2, 3, 45, 48])

  if (!isDaytime) {
    if (snowCodes.has(code)) return { theme: 'night-snow', label: '현재 날씨: 눈 내리는 밤' }
    if (rainCodes.has(code)) return { theme: 'night-rain', label: '현재 날씨: 비 오는 밤' }
    if (cloudyCodes.has(code)) return { theme: 'night-cloudy', label: '현재 날씨: 구름 낀 밤' }
    return { theme: 'night-clear', label: '현재 날씨: 맑은 밤' }
  }

  if (snowCodes.has(code)) return { theme: 'day-snow', label: '현재 날씨: 눈' }
  if (rainCodes.has(code)) return { theme: 'day-rain', label: '현재 날씨: 비' }
  if (cloudyCodes.has(code)) return { theme: 'day-cloudy', label: '현재 날씨: 흐림' }
  return { theme: 'day-clear', label: '현재 날씨: 맑음' }
}

function formatRecentPostTime(createdAt) {
  const createdAtMs = Number(createdAt)
  if (!Number.isFinite(createdAtMs)) return ''

  const diffMs = Math.max(0, Date.now() - createdAtMs)
  const minuteMs = 60 * 1000
  const hourMs = 60 * minuteMs
  const dayMs = 24 * hourMs
  const monthMs = 30 * dayMs
  const yearMs = 365 * dayMs

  if (diffMs < hourMs) {
    const minutes = Math.max(1, Math.floor(diffMs / minuteMs))
    return `${minutes}분 전`
  }
  if (diffMs < dayMs) {
    const hours = Math.floor(diffMs / hourMs)
    return `${hours}시간 전`
  }
  if (diffMs < monthMs) {
    const days = Math.floor(diffMs / dayMs)
    return `${days}일 전`
  }
  if (diffMs < yearMs) {
    const months = Math.floor(diffMs / monthMs)
    return `${months}달 전`
  }

  const years = Math.floor(diffMs / yearMs)
  return `${years}년 전`
}

function isActiveToday(createdAt) {
  const timestamp = Number(createdAt)
  if (!Number.isFinite(timestamp)) return false
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  return timestamp >= startOfToday.getTime()
}

export default function FriendsHome() {
  const { homeId } = useParams()
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [home, setHome] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentPosts, setRecentPosts] = useState([])
  const [authorActivity, setAuthorActivity] = useState([])
  const [weatherTheme, setWeatherTheme] = useState(getFallbackWeatherTheme().theme)
  const [weatherLabel, setWeatherLabel] = useState(getFallbackWeatherTheme().label)
  const [counts, setCounts] = useState({
    notice: 0,
    free: 0,
    news: 0,
    temp: 0,
  })

  const loadHomeData = useCallback(async () => {
    setLoading(true)
    const [nextHome, noticePosts, freePosts, newsPosts, tempPosts, nextAuthorActivity] = await Promise.all([
      getHome(homeId),
      getPosts(homeId, 'notice'),
      getPosts(homeId, 'free'),
      getPosts(homeId, 'news'),
      getPosts(homeId, 'temp'),
      getHomeAuthorActivity(homeId),
    ])

    setHome(nextHome)
    setCounts({
      notice: noticePosts.length,
      free: freePosts.length,
      news: newsPosts.length,
      temp: tempPosts.length,
    })
    setAuthorActivity(nextAuthorActivity)
    setRecentPosts(
      [
        { boardId: 'notice', list: noticePosts },
        { boardId: 'free', list: freePosts },
        { boardId: 'news', list: newsPosts },
        { boardId: 'temp', list: tempPosts },
      ]
        .flatMap(({ boardId, list }) => (list || []).map((post) => ({ ...post, boardId })))
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 8)
    )
    setLoading(false)
  }, [homeId])

  useEffect(() => {
    const handleKey = (e) => {
      const inInput = /^(input|textarea|select)$/i.test(e.target?.tagName) || e.target?.isContentEditable
      if (inInput) return
      const key = e.key
      if (key >= '1' && key <= '5') {
        e.preventDefault()
        e.stopPropagation()
        const n = parseInt(key, 10)
        const base = `/home/${homeId}/`
        if (n === 1) navigate(base + 'board/notice')
        else if (n === 2) navigate(base + 'about')
        else if (n === 3) navigate(base + 'board/free')
        else if (n === 4) navigate(base + 'board/news')
        else if (n === 5) navigate(base + 'board/temp')
      } else if (key.toLowerCase() === 'n') {
        e.preventDefault()
        e.stopPropagation()
        navigate('/create')
      }
    }
    window.addEventListener('keydown', handleKey, true)
    return () => window.removeEventListener('keydown', handleKey, true)
  }, [homeId, navigate])

  useEffect(() => {
    loadHomeData()
  }, [loadHomeData])

  useEffect(() => {
    const handleDataUpdated = () => {
      loadHomeData()
    }
    window.addEventListener('friends-data-updated', handleDataUpdated)
    return () => window.removeEventListener('friends-data-updated', handleDataUpdated)
  }, [loadHomeData])

  useEffect(() => {
    let cancelled = false

    const applyFallback = () => {
      const fallback = getFallbackWeatherTheme()
      if (!cancelled) {
        setWeatherTheme(fallback.theme)
        setWeatherLabel(fallback.label)
      }
    }

    const loadWeather = async () => {
      try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=weather_code,is_day&timezone=Asia%2FSeoul')
        if (!response.ok) throw new Error('weather-fetch-failed')
        const json = await response.json()
        const current = json?.current
        const nextTheme = getThemeByWeatherCode(current?.weather_code, Number(current?.is_day) === 1)
        if (!cancelled) {
          setWeatherTheme(nextTheme.theme)
          setWeatherLabel(`${nextTheme.label} (서울 기준)`)
        }
      } catch (_) {
        applyFallback()
      }
    }

    loadWeather()
    const timer = setInterval(loadWeather, 20 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [homeId])

  const handleMenuKeyDown = (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter') return
    const container = menuRef.current
    if (!container) return
    const links = container.querySelectorAll('.hitel-menu-link')
    if (!links.length) return
    const idx = Array.from(links).findIndex((el) => el === document.activeElement)
    if (e.key === 'ArrowDown' && idx < links.length - 1) {
      e.preventDefault()
      links[idx + 1].focus()
    } else if (e.key === 'ArrowUp' && idx > 0) {
      e.preventDefault()
      links[idx - 1].focus()
    } else if (e.key === 'Enter' && idx >= 0) {
      e.preventDefault()
      links[idx].click()
    }
  }

  if (loading) {
    return (
      <div className="friends-home hitel-card">
        <p className="hitel-hint">공용 프렌즈홈 데이터를 불러오는 중...</p>
      </div>
    )
  }

  if (!home) {
    return <Navigate to="/create" replace />
  }

  const uniqueWriterCount = authorActivity.length
  const friendAvatarCount = Math.min(uniqueWriterCount, 5)
  const miniroomMood = uniqueWriterCount === 0 ? 'quiet' : uniqueWriterCount >= 4 ? 'busy' : 'warm'
  const miniroomSummary = uniqueWriterCount === 0
    ? '아직 글이나 댓글을 남긴 사람이 없어요.'
    : `글/댓글을 남긴 친구 ${uniqueWriterCount}명과 함께 미니룸이 더 활기차졌어요.`
  const avatarSeatClasses = [
    'is-host',
    'is-seat-1',
    'is-seat-2',
    'is-seat-3',
    'is-seat-4',
  ]
  const getAvatarVariantClass = (seatIndex) => {
    const seed = `${home.id}:${uniqueWriterCount}:${seatIndex}`
    const idx = hashString(seed) % AVATAR_VARIANTS.length
    return AVATAR_VARIANTS[idx]
  }
  const avatarsToRender = authorActivity.slice(0, friendAvatarCount)

  return (
    <div className="friends-home hitel-card">
      <div className="friends-home-board-grid">
        <div ref={menuRef} onKeyDown={handleMenuKeyDown} className="friends-home-menu-wrap">
          <h2 className="hitel-section-basic">[ 기본메뉴 ]</h2>
          <ul className="hitel-menu-list" role="menu" aria-label="기본 메뉴">
            <li role="none">
              <Link to={`/home/${homeId}/board/notice`} className="hitel-menu-link" role="menuitem" tabIndex={0}>
                1. 공지사항({counts.notice})
              </Link>
            </li>
            <li role="none">
              <Link to={`/home/${homeId}/about`} className="hitel-menu-link" role="menuitem" tabIndex={0}>
                2. 프렌즈텔?
              </Link>
            </li>
          </ul>

          <h2 className="hitel-section-community">[ 커뮤니티 ]</h2>
          <ul className="hitel-menu-list" role="menu" aria-label="커뮤니티 메뉴">
            <li role="none">
              <Link to={`/home/${homeId}/board/free`} className="hitel-menu-link" role="menuitem" tabIndex={0}>
                3. 자유게시판({counts.free})
              </Link>
            </li>
            <li role="none">
              <Link to={`/home/${homeId}/board/news`} className="hitel-menu-link" role="menuitem" tabIndex={0}>
                4. {home.title} 소식({counts.news})
              </Link>
            </li>
            <li role="none">
              <Link to={`/home/${homeId}/board/temp`} className="hitel-menu-link" role="menuitem" tabIndex={0}>
                5. 임시 게시판({counts.temp})
              </Link>
            </li>
          </ul>
        </div>

        <section className="friends-home-recent-wrap" aria-label="최근 글 목록">
          <h2 className="friends-home-recent-heading">최근 올라온 글</h2>
          {recentPosts.length === 0 ? (
            <p className="hitel-hint">아직 게시글이 없습니다. 첫 글을 작성해 보세요.</p>
          ) : (
            <ul className="friends-home-recent-list">
              {recentPosts.map((post) => (
                <li key={`${post.boardId}-${post.id}`} className="friends-home-recent-item">
                  <Link to={`/home/${homeId}/board/${post.boardId}/post/${post.id}`} className="friends-home-recent-link">
                    <span className="friends-home-recent-board">[{getBoardDisplayName(homeId, post.boardId)}]</span>
                    <span className="friends-home-recent-main">
                      <span className="friends-home-recent-title">{post.title}</span>
                      <span className="friends-home-recent-time">{formatRecentPostTime(post.createdAt)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className={`friends-home-miniroom is-${miniroomMood}`} aria-label="캠핑장 감성 미니룸 그래픽">
        <h3 className="hitel-title">[ {home.title} 프렌즈홈 ]</h3>
        <div className={`friends-home-miniroom-scene friends-home-camp-scene is-weather-${weatherTheme}`} aria-hidden="true">
          <div className="friends-home-camp-sky">
            <span className="friends-home-camp-star is-s1" />
            <span className="friends-home-camp-star is-s2" />
            <span className="friends-home-camp-star is-s3" />
            <span className="friends-home-camp-star is-s4" />
            <span className="friends-home-camp-star is-s5" />
            <span className="friends-home-camp-moon" />
            <span className="friends-home-camp-sun" />
          </div>
          <span className="friends-home-camp-mountain is-back" />
          <span className="friends-home-camp-mountain is-front" />
          <div className="friends-home-camp-ground" />
          <span className="friends-home-camp-tree is-left" />
          <span className="friends-home-camp-tree is-right" />
          <span className="friends-home-camp-tent is-main" />
          <span className="friends-home-camp-tent is-sub" />
          <span className="friends-home-camp-fire" />
          <div className="friends-home-miniroom-avatars">
            {avatarsToRender.map((author, index) => (
              <div
                key={`mini-avatar-${author.name}`}
                className={`friends-home-miniroom-avatar-wrap ${avatarSeatClasses[index]} ${isActiveToday(author.lastActivityAt) ? '' : 'is-sleeping'}`}
              >
                {!isActiveToday(author.lastActivityAt) && (
                  <span className="friends-home-miniroom-avatar-sleep" aria-label={`${author.name} 휴식 중`}>
                    zzz
                  </span>
                )}
                <span className={`friends-home-miniroom-avatar ${getAvatarVariantClass(index)}`} />
                <span className="friends-home-miniroom-avatar-name">{author.name}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="friends-home-miniroom-status">{miniroomSummary}</p>
        <p className="friends-home-miniroom-weather">{weatherLabel}</p>
      </section>
    </div>
  )
}
