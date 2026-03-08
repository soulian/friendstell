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
  const participantCount = uniqueAuthors.length
  const friendsRoomMood = participantCount === 0 ? 'quiet' : participantCount >= 8 ? 'busy' : 'warm'
  const friendsRoomSummary = participantCount === 0
    ? '아직 방문한 친구가 없어요. 첫 글이나 댓글을 남겨 프렌즈룸을 채워보세요.'
    : `현재 활동 중인 친구 ${participantCount}명의 미니미가 프렌즈룸에서 IT 이야기를 나누고 있어요.`

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

      <section className={`friends-home-friendsroom is-${friendsRoomMood}`} aria-label="싸이월드 감성 픽셀 프렌즈룸">
        <h3 className="hitel-title">[ 프렌즈룸 ]</h3>
        <div className="friends-home-friendsroom-scene" aria-hidden="true">
          <div className="friends-home-friendsroom-wall">
            <span className="friends-home-wall-frame is-frame-1" />
            <span className="friends-home-wall-frame is-frame-2" />
            <span className="friends-home-wall-window" />
          </div>
          <div className="friends-home-friendsroom-floor" />
          <span className="friends-home-friendsroom-furniture is-sofa" />
          <span className="friends-home-friendsroom-furniture is-table" />
          <span className="friends-home-friendsroom-furniture is-monitor" />
          <div className="friends-home-friendsroom-avatars">
            {uniqueAuthors.map((author, index) => (
              <span
                key={`mini-avatar-${author}-${index}`}
                className="friends-home-friendsroom-avatar"
                style={{ '--avatar-color': `var(--avatar-color-${(index % 6) + 1})` }}
                title={author}
              >
                <span className="friends-home-friendsroom-avatar-label">
                  {author.slice(0, 1)}
                </span>
              </span>
            ))}
          </div>
        </div>
        <p className="friends-home-friendsroom-status">{friendsRoomSummary}</p>
      </section>
    </div>
  )
}
