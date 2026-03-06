import { useState, useRef, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getHomes, getHome } from '../data/mock'
import './Header.css'

export default function Header() {
  const { pathname } = useLocation()
  const match = pathname.match(/^\/home\/([^/]+)/)
  const homeId = match ? match[1] : null
  const homes = getHomes()
  const currentHome = homeId ? getHome(homeId) : null
  const [open, setOpen] = useState(false)
  const [shareDone, setShareDone] = useState(false)
  const ref = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    function close(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  const handleShare = (e) => {
    e.preventDefault()
    const url = window.location.origin + pathname
    navigator.clipboard.writeText(url).then(() => {
      setShareDone(true)
      setTimeout(() => setShareDone(false), 2000)
    }).catch(() => {
      try {
        const ta = document.createElement('textarea')
        ta.value = url
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        setShareDone(true)
        setTimeout(() => setShareDone(false), 2000)
      } catch (_) {}
    })
  }

  const handleKeyDown = (e) => {
    if (!open) return
    const items = listRef.current?.querySelectorAll('a, [role="menuitem"]')
    if (!items?.length) return
    const idx = Array.from(items).findIndex((el) => el === document.activeElement)
    if (e.key === 'ArrowDown' && idx < items.length - 1) {
      e.preventDefault()
      items[idx + 1].focus()
    } else if (e.key === 'ArrowUp' && idx > 0) {
      e.preventDefault()
      items[idx - 1].focus()
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <header className="hitel-header">
      <div className="retro-header-inner">
        <Link to={homeId ? `/home/${homeId}` : '/'} className="retro-logo">
          🏘 프렌즈텔
        </Link>

        <div className="header-title-row">
          {currentHome && (
            <>
              <span className="header-home-title">{currentHome.title}</span>
              <button
                type="button"
                className="header-share-btn"
                onClick={handleShare}
                title="퍼머링크 복사 (친구에게 공유)"
                aria-label="퍼머링크 복사"
              >
                {shareDone ? '✓' : '🔗'}
              </button>
            </>
          )}

          <div className="apt-dropdown" ref={ref} onKeyDown={handleKeyDown}>
            <button
              type="button"
              className="apt-dropdown-trigger"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-label="프렌즈홈 선택"
            >
              <span className="apt-name">{currentHome ? currentHome.title : (homes.length ? '프렌즈홈 선택' : '메뉴')}</span>
              <span className="apt-arrow">{open ? '▲' : '▼'}</span>
            </button>
            {open && (
              <ul className="apt-dropdown-menu" ref={listRef} role="listbox">
                {homes.map((home) => (
                  <li key={home.id}>
                    <Link
                      to={`/home/${home.id}`}
                      className={home.id === homeId ? 'current' : ''}
                      onClick={() => setOpen(false)}
                      role="option"
                      aria-selected={home.id === homeId}
                      tabIndex={0}
                    >
                      {home.title}
                    </Link>
                  </li>
                ))}
                <li className="apt-dropdown-create">
                  <Link
                    to="/create"
                    className="create-link"
                    onClick={() => setOpen(false)}
                    role="option"
                    tabIndex={0}
                  >
                    + 새 프렌즈홈 만들기
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
