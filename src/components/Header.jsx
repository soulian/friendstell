import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  getHomes,
  getHome,
  getSyncStatus,
  updateHome,
  getAuthErrorMessage,
  getAuthSession,
  getSharedWriteErrorMessage,
  loginUser,
  logoutUser,
  recoverPassword,
  registerUser,
  isSharedWriteError,
} from '../data/mock'
import './Header.css'

function isPreviewRuntime() {
  if (typeof window === 'undefined') return false
  if (import.meta.env.VITE_PREVIEW_BADGE === 'true') return true
  const host = window.location.hostname || ''
  return /\.vercel\.app$/i.test(host) && host.includes('-git-')
}

export default function Header() {
  const { pathname } = useLocation()
  const match = pathname.match(/^\/home\/([^/]+)/)
  const homeId = match ? match[1] : null
  const previewBadgeVisible = isPreviewRuntime()
  const [homes, setHomes] = useState([])
  const [currentHome, setCurrentHome] = useState(null)
  const [loadingHomes, setLoadingHomes] = useState(true)
  const [syncStatus, setSyncStatus] = useState(() => getSyncStatus())
  const [open, setOpen] = useState(false)
  const [shareDone, setShareDone] = useState(false)
  const [editingTitle, setEditingTitle] = useState(false)
  const [editTitleValue, setEditTitleValue] = useState('')
  const [titleEditError, setTitleEditError] = useState('')
  const [savingTitle, setSavingTitle] = useState(false)
  const [authSession, setAuthSession] = useState(() => getAuthSession())
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authError, setAuthError] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authSubmitting, setAuthSubmitting] = useState(false)
  const [recoveredPassword, setRecoveredPassword] = useState('')
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    nickname: '',
  })
  const [recoveryForm, setRecoveryForm] = useState({
    email: '',
    nickname: '',
  })
  const ref = useRef(null)
  const authRef = useRef(null)
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
      if (authRef.current && !authRef.current.contains(e.target)) setAuthOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  useEffect(() => {
    setEditingTitle(false)
    setEditTitleValue('')
    setTitleEditError('')
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

  useEffect(() => {
    const handleAuthUpdated = () => {
      setAuthSession(getAuthSession())
    }
    window.addEventListener('friends-auth-updated', handleAuthUpdated)
    return () => window.removeEventListener('friends-auth-updated', handleAuthUpdated)
  }, [])

  useEffect(() => {
    const handleAuthOpenRequest = (event) => {
      const mode = event?.detail?.mode
      if (mode === 'signup' || mode === 'login' || mode === 'recovery') {
        setAuthMode(mode)
      }
      setAuthError('')
      setAuthMessage('')
      setRecoveredPassword('')
      setAuthOpen(true)
    }
    window.addEventListener('friends-auth-open-request', handleAuthOpenRequest)
    return () => window.removeEventListener('friends-auth-open-request', handleAuthOpenRequest)
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
    setTitleEditError('')
  }

  const handleCancelTitleEdit = () => {
    setEditingTitle(false)
    setEditTitleValue('')
    setTitleEditError('')
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
      setTitleEditError('')
    } catch (error) {
      if (isSharedWriteError(error)) {
        setTitleEditError(getSharedWriteErrorMessage())
      } else {
        setTitleEditError('이름 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      }
    } finally {
      setSavingTitle(false)
    }
  }

  const handleAuthModeChange = (mode) => {
    setAuthMode(mode)
    setAuthError('')
    setAuthMessage('')
    setRecoveredPassword('')
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    const email = loginForm.email.trim()
    const password = loginForm.password.trim()
    if (!email || !password) {
      setAuthError('이메일과 비밀번호를 입력해 주세요.')
      return
    }

    setAuthSubmitting(true)
    setAuthError('')
    setAuthMessage('')
    try {
      const user = await loginUser({ email, password })
      setAuthSession(user)
      setAuthOpen(false)
      setAuthMessage(`${user.nickname}님, 환영합니다.`)
      setLoginForm({ email: '', password: '' })
    } catch (error) {
      setAuthError(getAuthErrorMessage(error))
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleSignupSubmit = async (e) => {
    e.preventDefault()
    const email = signupForm.email.trim()
    const password = signupForm.password.trim()
    const nickname = signupForm.nickname.trim()
    if (!email || !password || !nickname) {
      setAuthError('이메일, 비밀번호, 닉네임을 모두 입력해 주세요.')
      return
    }
    if (!email.includes('@')) {
      setAuthError('올바른 이메일 형식으로 입력해 주세요.')
      return
    }
    if (password.length < 4) {
      setAuthError('비밀번호는 4자 이상 입력해 주세요.')
      return
    }

    setAuthSubmitting(true)
    setAuthError('')
    setAuthMessage('')
    try {
      const user = await registerUser({ email, password, nickname })
      setAuthSession(user)
      setAuthOpen(false)
      setAuthMessage(`${user.nickname}님, 가입과 로그인이 완료되었습니다.`)
      setSignupForm({ email: '', password: '', nickname: '' })
    } catch (error) {
      if (isSharedWriteError(error)) {
        setAuthError(getSharedWriteErrorMessage())
      } else {
        setAuthError(getAuthErrorMessage(error))
      }
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleRecoverySubmit = async (e) => {
    e.preventDefault()
    const email = recoveryForm.email.trim()
    const nickname = recoveryForm.nickname.trim()
    if (!email || !nickname) {
      setAuthError('이메일과 닉네임을 입력해 주세요.')
      return
    }

    setAuthSubmitting(true)
    setAuthError('')
    setRecoveredPassword('')
    setAuthMessage('')
    try {
      const password = await recoverPassword({ email, nickname })
      setRecoveredPassword(password)
    } catch (error) {
      setAuthError(getAuthErrorMessage(error))
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleLogout = () => {
    logoutUser()
    setAuthSession(null)
    setAuthMessage('로그아웃되었습니다. 비회원 닉네임으로도 작성할 수 있습니다.')
    setAuthError('')
    setRecoveredPassword('')
  }

  return (
    <header className="hitel-header">
      <div className="retro-header-inner">
        <div className="header-brand-wrap">
          <Link to={homeId ? `/home/${homeId}` : '/'} className="retro-logo">
            🏘 프렌즈텔
          </Link>
          {previewBadgeVisible && (
            <span className="header-preview-badge" aria-label="프리뷰 환경">
              프리뷰
            </span>
          )}
        </div>

        <div className="header-title-row">
          {currentHome && (
            <>
              {editingTitle ? (
                <form className="header-title-edit-form" onSubmit={handleSaveTitle}>
                  <input
                    type="text"
                    className="hitel-input header-title-edit-input"
                    value={editTitleValue}
                    onChange={(e) => {
                      setEditTitleValue(e.target.value)
                      setTitleEditError('')
                    }}
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
                    title="프렌즈홈 이름 설정"
                    aria-label="프렌즈홈 이름 설정"
                  >
                    ✎
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
        </div>

        <div className="header-right-controls">
          <div className="header-auth" ref={authRef}>
            {authSession ? (
              <div className="header-auth-logged-in">
                <span className="header-auth-user">
                  {authSession.nickname}
                  <span className="author-verified-icon" aria-label="인증 사용자" title="인증 사용자">
                    ✓
                  </span>
                </span>
                <button type="button" className="hitel-btn header-auth-logout-btn" onClick={handleLogout}>
                  로그아웃
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="hitel-btn header-auth-open-btn"
                  onClick={() => setAuthOpen((prev) => !prev)}
                  aria-expanded={authOpen}
                  aria-haspopup="dialog"
                >
                  로그인/회원가입
                </button>
                {authOpen && (
                  <div className="header-auth-panel" role="dialog" aria-label="로그인 및 회원가입">
                    <div className="header-auth-tabs">
                      <button
                        type="button"
                        className={`header-auth-tab ${authMode === 'login' ? 'is-active' : ''}`}
                        onClick={() => handleAuthModeChange('login')}
                      >
                        로그인
                      </button>
                      <button
                        type="button"
                        className={`header-auth-tab ${authMode === 'signup' ? 'is-active' : ''}`}
                        onClick={() => handleAuthModeChange('signup')}
                      >
                        회원가입
                      </button>
                      <button
                        type="button"
                        className={`header-auth-tab ${authMode === 'recovery' ? 'is-active' : ''}`}
                        onClick={() => handleAuthModeChange('recovery')}
                      >
                        비밀번호 찾기
                      </button>
                    </div>

                    {authMode === 'login' && (
                      <form className="header-auth-form" onSubmit={handleLoginSubmit}>
                        <label>
                          <span>이메일</span>
                          <input
                            type="email"
                            className="hitel-input"
                            value={loginForm.email}
                            onChange={(e) => {
                              setLoginForm((prev) => ({ ...prev, email: e.target.value }))
                              setAuthError('')
                            }}
                            autoComplete="email"
                            disabled={authSubmitting}
                          />
                        </label>
                        <label>
                          <span>비밀번호</span>
                          <input
                            type="password"
                            className="hitel-input"
                            value={loginForm.password}
                            onChange={(e) => {
                              setLoginForm((prev) => ({ ...prev, password: e.target.value }))
                              setAuthError('')
                            }}
                            autoComplete="current-password"
                            disabled={authSubmitting}
                          />
                        </label>
                        <button type="submit" className="hitel-btn" disabled={authSubmitting}>
                          {authSubmitting ? '처리중...' : '로그인'}
                        </button>
                      </form>
                    )}

                    {authMode === 'signup' && (
                      <form className="header-auth-form" onSubmit={handleSignupSubmit}>
                        <label>
                          <span>이메일</span>
                          <input
                            type="email"
                            className="hitel-input"
                            value={signupForm.email}
                            onChange={(e) => {
                              setSignupForm((prev) => ({ ...prev, email: e.target.value }))
                              setAuthError('')
                            }}
                            autoComplete="email"
                            disabled={authSubmitting}
                          />
                        </label>
                        <label>
                          <span>비밀번호</span>
                          <input
                            type="password"
                            className="hitel-input"
                            value={signupForm.password}
                            onChange={(e) => {
                              setSignupForm((prev) => ({ ...prev, password: e.target.value }))
                              setAuthError('')
                            }}
                            autoComplete="new-password"
                            disabled={authSubmitting}
                          />
                        </label>
                        <label>
                          <span>닉네임</span>
                          <input
                            type="text"
                            className="hitel-input"
                            value={signupForm.nickname}
                            onChange={(e) => {
                              setSignupForm((prev) => ({ ...prev, nickname: e.target.value }))
                              setAuthError('')
                            }}
                            maxLength={20}
                            disabled={authSubmitting}
                          />
                        </label>
                        <button type="submit" className="hitel-btn" disabled={authSubmitting}>
                          {authSubmitting ? '처리중...' : '회원가입'}
                        </button>
                      </form>
                    )}

                    {authMode === 'recovery' && (
                      <form className="header-auth-form" onSubmit={handleRecoverySubmit}>
                        <label>
                          <span>이메일</span>
                          <input
                            type="email"
                            className="hitel-input"
                            value={recoveryForm.email}
                            onChange={(e) => {
                              setRecoveryForm((prev) => ({ ...prev, email: e.target.value }))
                              setAuthError('')
                              setRecoveredPassword('')
                            }}
                            autoComplete="email"
                            disabled={authSubmitting}
                          />
                        </label>
                        <label>
                          <span>닉네임</span>
                          <input
                            type="text"
                            className="hitel-input"
                            value={recoveryForm.nickname}
                            onChange={(e) => {
                              setRecoveryForm((prev) => ({ ...prev, nickname: e.target.value }))
                              setAuthError('')
                              setRecoveredPassword('')
                            }}
                            maxLength={20}
                            disabled={authSubmitting}
                          />
                        </label>
                        <button type="submit" className="hitel-btn" disabled={authSubmitting}>
                          {authSubmitting ? '조회중...' : '비밀번호 확인'}
                        </button>
                        {recoveredPassword && (
                          <p className="header-auth-recovered-password">
                            비밀번호: <strong>{recoveredPassword}</strong>
                          </p>
                        )}
                      </form>
                    )}

                    {authError && <p className="header-auth-error">{authError}</p>}
                  </div>
                )}
              </>
            )}
          </div>

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
      {titleEditError && <p className="header-title-error">{titleEditError}</p>}
      {authMessage && <p className="header-auth-message">{authMessage}</p>}
      <div className={`header-sync-banner is-${syncStatus.mode}`}>
        {syncStatus.mode === 'shared'
          ? '공용DB 연결됨: 친구와 같은 프렌즈홈/게시판 데이터를 보고 있어요.'
          : syncStatus.mode === 'shared-required'
            ? '공용DB 연결 오류: 운영 환경에서는 로컬 저장을 허용하지 않습니다. 연결 복구 후 다시 시도해 주세요.'
          : syncStatus.mode === 'local-fallback'
            ? `로컬 모드: 현재 기기 데이터만 보입니다. 친구에게 안 보일 수 있어요.${syncStatus.pendingCount > 0 ? ` (원격 동기화 대기 ${syncStatus.pendingCount}건)` : ''}`
            : '공용DB 연결 상태 확인 중...'}
      </div>
    </header>
  )
}
