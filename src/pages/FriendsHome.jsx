import { useEffect, useRef, useState } from 'react'
import { Link, useParams, Navigate, useNavigate } from 'react-router-dom'
import {
  getHome,
  getPosts,
  updateHome,
} from '../data/mock'
import './FriendsHome.css'

export default function FriendsHome() {
  const { homeId } = useParams()
  const navigate = useNavigate()
  const home = getHome(homeId)
  const [editingTitle, setEditingTitle] = useState(false)
  const [editTitleValue, setEditTitleValue] = useState('')
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

  const handleSaveTitle = (e) => {
    e.preventDefault()
    const t = editTitleValue.trim()
    if (t) {
      updateHome(homeId, { title: t })
      setEditingTitle(false)
      setEditTitleValue('')
    }
  }

  if (!home) {
    return <Navigate to="/create" replace />
  }

  const noticeCount = getPosts(homeId, 'notice').length
  const freeCount = getPosts(homeId, 'free').length
  const newsCount = getPosts(homeId, 'news').length
  const tempCount = getPosts(homeId, 'temp').length

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

      <section className="friends-home-settings">
        <h3 className="hitel-title">[ 설정 ]</h3>
        <div className="friends-home-edit-title">
          {editingTitle ? (
            <form onSubmit={handleSaveTitle} className="friends-home-edit-form">
              <input
                type="text"
                className="hitel-input"
                value={editTitleValue}
                onChange={(e) => setEditTitleValue(e.target.value)}
                placeholder="프렌즈홈 이름"
                maxLength={50}
                autoFocus
              />
              <button type="submit" className="hitel-btn">저장</button>
              <button type="button" className="hitel-btn hitel-btn-secondary" onClick={() => { setEditingTitle(false); setEditTitleValue(''); }}>
                취소
              </button>
            </form>
          ) : (
            <p className="friends-home-setting-row">
              <span>프렌즈홈 이름: {home.title}</span>
              <button type="button" className="hitel-btn friends-home-btn-small" onClick={() => { setEditingTitle(true); setEditTitleValue(home.title); }}>
                이름 수정
              </button>
            </p>
          )}
        </div>
      </section>

      <p className="hitel-footer">* 프렌즈텔 - 친구와 함께 쓰는 게시판</p>

      <div className="friends-home-create-wrap">
        <Link to="/create" className="hitel-btn friends-home-create-btn" data-shortcut="n">
          [ 새 프렌즈홈 만들기 ]
        </Link>
      </div>
    </div>
  )
}
