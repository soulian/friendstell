import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { getHomes, getHome, getSyncStatus, updateHome } from '../data/mock'
import './Header.css'

export default function Header() {
  const { pathname } = useLocation()
  const match = pathname.match(/^\/home\/([^/]+)/)
  const homeId = match ? match[1] : null
  const [homes, setHomes] = useState([])
  const [currentHome, setCurrentHome] = useState(null)
  const [loadingHomes, setLoadingHomes] = useState(true)
  const [syncStatus, setSyncStatus] = useState(() => getSyncStatus())
  const [open, setOpen] = useState(false)
  const [shareDone, setShareDone] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [editTitleValue, setEditTitleValue] = useState('')
  const [savingTitle, setSavingTitle] = useState(false)
  const ref = useRef(null)
  const listRef = useRef(null)

  const loadHeaderData = useCallback(async () => {
    try {
      const [nextHomes, nextHome] = await Promise.all([
        getHomes(),
        homeId ? getHome(homeId) : Promise.resolve(null),
      ])
      setHomes(nextHomes)
      setCurrentHome(nextHome)
      setSyncStatus(getSyncStatus())
    } finally {
      setLoadingHomes(false)
    }
  }, [homeId])

  useEffect(() => {
    function close(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  useEffect(() => {
    setEditingTitle(false)
    setEditTitleValue('')
  }, [homeId])

  useEffect(() => {
    loadHeaderData()
  }, [loadHeaderData])

  useEffect(() => {
    const handleDataUpdated = () => {
      loadHeaderData()
    }
    window.addEventListener('friends-data-updated', handleDataUpdated)
    return () => window.removeEventListener('friends-data-updated', handleDataUpdated)
  }, [loadHeaderData])

  useEffect(() => {
    const handleSyncStatusUpdated = () => {
      setSyncStatus(getSyncStatus())
    }
    window.addEventListener('friends-sync-status-updated', handleSyncStatusUpdated)
    return () => window.removeEventListener('friends-sync-status-updated', handleSyncStatusUpdated)
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

  const handleStartTitleEdit = () => {
    if (!currentHome) return
    setEditingTitle(true)
    setEditTitleValue(currentHome.title)
  }

  const handleCancelTitleEdit = () => {
    setEditingTitle(false)
    setEditTitleValue('')
  }

  const handleSaveTitle = async (e) => {
    e.preventDefault()
    if (!homeId) return
    const nextTitle = editTitleValue.trim()
    if (!nextTitle) return
    setSavingTitle(true)
    try {
      await updateHome(homeId, { title: nextTitle })
      await loadHeaderData()
      setEditingTitle(false)
      setEditTitleValue('')
    } finally {
      setSavingTitle(false)
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
              {editingTitle ? (
                <form className="header-title-edit-form" onSubmit={handleSaveTitle}>
                  <input
                    type="text"
                    className="hitel-input header-title-edit-input"
                    value={editTitleValue}
                    onChange={(e) => setEditTitleValue(e.target.value)}
                    maxLength={50}
                    placeholder="프렌즈홈 이름"
                    autoFocus
                    disabled={savingTitle}
                  />
                  <button type="submit" className="hitel-btn header-title-edit-btn" disabled={savingTitle}>
                    {savingTitle ? '저장중...' : '저장'}
                  </button>
                  <button type="button" className="hitel-btn header-title-edit-btn header-title-edit-btn-cancel" onClick={handleCancelTitleEdit} disabled={savingTitle}>
                    취소
                  </button>
                </form>
              ) : (
                <>
                  <span className="header-home-title">{currentHome.title}</span>
                  <button
                    type="button"
                    className="header-title-edit-trigger"
                    onClick={handleStartTitleEdit}
                  >
                    이름설정
                  </button>
                </>
              )}
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
              <span className="apt-name">
                {loadingHomes
                  ? '불러오는 중...'
                  : currentHome
                    ? currentHome.title
                    : (homes.length ? '프렌즈홈 선택' : '메뉴')}
              </span>
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
      <div className={`header-sync-banner is-${syncStatus.mode}`}>
        {syncStatus.mode === 'shared'
          ? '공용DB 연결됨: 친구와 같은 프렌즈홈/게시판 데이터를 보고 있어요.'
          : syncStatus.mode === 'local-fallback'
            ? `로컬 모드: 현재 기기 데이터만 보입니다. 친구에게 안 보일 수 있어요.${syncStatus.pendingCount > 0 ? ` (원격 동기화 대기 ${syncStatus.pendingCount}건)` : ''}`
            : '공용DB 연결 상태 확인 중...'}
      </div>
    </header>
  )
}
