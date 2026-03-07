import { useEffect, useRef } from 'react'
import { Link, useParams, Navigate, useNavigate } from 'react-router-dom'
import {
  getHome,
  getPosts,
  getHomeUniqueAuthors,
} from '../data/mock'
import './FriendsHome.css'

export default function FriendsHome() {
  const { homeId } = useParams()
  const navigate = useNavigate()
  const home = getHome(homeId)
  const menuRef = useRef(null)

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

  if (!home) {
    return <Navigate to="/create" replace />
  }

  const noticeCount = getPosts(homeId, 'notice').length
  const freeCount = getPosts(homeId, 'free').length
  const newsCount = getPosts(homeId, 'news').length
  const tempCount = getPosts(homeId, 'temp').length
  const uniqueAuthors = getHomeUniqueAuthors(homeId)
  const uniqueWriterCount = uniqueAuthors.length
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

  return (
    <div className="friends-home hitel-card">
      <div ref={menuRef} onKeyDown={handleMenuKeyDown} className="friends-home-menu-wrap">
        <h2 className="hitel-section-basic">[ 기본메뉴 ]</h2>
        <ul className="hitel-menu-list" role="menu" aria-label="기본 메뉴">
          <li role="none">
            <Link to={`/home/${homeId}/board/notice`} className="hitel-menu-link" role="menuitem" tabIndex={0}>
              1. 공지사항({noticeCount})
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
              3. 자유게시판({freeCount})
            </Link>
          </li>
          <li role="none">
            <Link to={`/home/${homeId}/board/news`} className="hitel-menu-link" role="menuitem" tabIndex={0}>
              4. {home.title} 소식({newsCount})
            </Link>
          </li>
          <li role="none">
            <Link to={`/home/${homeId}/board/temp`} className="hitel-menu-link" role="menuitem" tabIndex={0}>
              5. 임시 게시판({tempCount})
            </Link>
          </li>
        </ul>
      </div>

      <section className={`friends-home-miniroom is-${miniroomMood}`} aria-label="싸이월드 감성 미니룸 그래픽">
        <h3 className="hitel-title">[ 미니룸 ]</h3>
        <div className="friends-home-miniroom-scene" aria-hidden="true">
          <div className="friends-home-miniroom-wall">
            <span className="friends-home-wall-frame is-frame-1" />
            <span className="friends-home-wall-frame is-frame-2" />
            <span className="friends-home-wall-window" />
          </div>
          <div className="friends-home-miniroom-floor" />
          <span className="friends-home-miniroom-furniture is-sofa" />
          <span className="friends-home-miniroom-furniture is-table" />
          <span className="friends-home-miniroom-furniture is-plant" />
          <div className="friends-home-miniroom-avatars">
            {Array.from({ length: friendAvatarCount + 1 }).map((_, index) => (
              <span
                key={`mini-avatar-${index}`}
                className={`friends-home-miniroom-avatar ${avatarSeatClasses[index]}`}
              />
            ))}
          </div>
        </div>
        <p className="friends-home-miniroom-status">{miniroomSummary}</p>
      </section>
    </div>
  )
}
