import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useParams, Navigate, useNavigate } from 'react-router-dom'
import {
  getHome,
  getPosts,
  getHomeUniqueAuthors,
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

export default function FriendsHome() {
  const { homeId } = useParams()
  const navigate = useNavigate()
  const menuRef = useRef(null)
  const [home, setHome] = useState(null)
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({
    notice: 0,
    free: 0,
    news: 0,
    temp: 0,
  })
  const [uniqueWriterCount, setUniqueWriterCount] = useState(0)

  const loadHomeData = useCallback(async () => {
    setLoading(true)
    const [nextHome, noticePosts, freePosts, newsPosts, tempPosts, uniqueAuthors] = await Promise.all([
      getHome(homeId),
      getPosts(homeId, 'notice'),
      getPosts(homeId, 'free'),
      getPosts(homeId, 'news'),
      getPosts(homeId, 'temp'),
      getHomeUniqueAuthors(homeId),
    ])

    setHome(nextHome)
    setCounts({
      notice: noticePosts.length,
      free: freePosts.length,
      news: newsPosts.length,
      temp: tempPosts.length,
    })
    setUniqueWriterCount(uniqueAuthors.length)
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

  const friendAvatarCount = Math.min(uniqueWriterCount, 4)
  const miniroomMood = uniqueWriterCount === 0 ? 'quiet' : uniqueWriterCount >= 4 ? 'busy' : 'warm'
  const miniroomSummary = uniqueWriterCount === 0
    ? '아직 방문한 친구가 없어요. 첫 글을 남겨 친구를 초대해 보세요.'
    : `오늘 방문한 친구 ${uniqueWriterCount}명과 함께 미니룸이 더 활기차졌어요.`
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

  return (
    <div className="friends-home hitel-card">
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

      <section className={`friends-home-miniroom is-${miniroomMood}`} aria-label="캠핑장 감성 미니룸 그래픽">
        <h3 className="hitel-title">[ 미니룸 ]</h3>
        <div className="friends-home-miniroom-scene friends-home-camp-scene" aria-hidden="true">
          <div className="friends-home-camp-sky">
            <span className="friends-home-camp-star is-s1" />
            <span className="friends-home-camp-star is-s2" />
            <span className="friends-home-camp-star is-s3" />
            <span className="friends-home-camp-star is-s4" />
            <span className="friends-home-camp-star is-s5" />
            <span className="friends-home-camp-moon" />
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
            {Array.from({ length: friendAvatarCount + 1 }).map((_, index) => (
              <span
                key={`mini-avatar-${index}`}
                className={`friends-home-miniroom-avatar ${avatarSeatClasses[index]} ${getAvatarVariantClass(index)}`}
              />
            ))}
          </div>
        </div>
        <p className="friends-home-miniroom-status">{miniroomSummary}</p>
      </section>
    </div>
  )
}
