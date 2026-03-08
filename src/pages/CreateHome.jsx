import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  createHome,
  getHomes,
  getSharedWriteErrorMessage,
  isSharedWriteError,
} from '../data/mock'
import './CreateHome.css'

export default function CreateHome() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [homes, setHomes] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true

    const loadHomes = async () => {
      try {
        const list = await getHomes()
        if (mounted) setHomes(list)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    const handleDataUpdated = () => {
      loadHomes()
    }

    loadHomes()
    window.addEventListener('friends-data-updated', handleDataUpdated)
    return () => {
      mounted = false
      window.removeEventListener('friends-data-updated', handleDataUpdated)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const t = title.trim()
    if (!t) {
      setError('프렌즈홈 제목을 입력하세요.')
      return
    }
    setSubmitting(true)
    try {
      const home = await createHome({ title: t })
      navigate(`/home/${home.id}`, { replace: true })
    } catch (err) {
      if (isSharedWriteError(err)) {
        setError(getSharedWriteErrorMessage())
      } else {
        setError('프렌즈홈 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const firstHomeId = homes.length > 0 ? homes[0].id : null

  return (
    <div className="create-home hitel-card">
      <h2 className="hitel-section-basic">[ 새 프렌즈홈 만들기 ]</h2>
      <p className="create-home-desc">친구와 함께 쓸 게시판의 이름을 정해주세요.</p>
      <form onSubmit={handleSubmit} className="hitel-write-form">
        <label>
          <span>프렌즈홈 제목</span>
          <input
            type="text"
            className="hitel-input"
            placeholder="예: 우리 동네 모임"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError('') }}
            maxLength={50}
            autoFocus
            aria-label="프렌즈홈 제목"
            disabled={submitting}
          />
        </label>
        {error && <p className="hitel-error">{error}</p>}
        {loading && <p className="hitel-hint">공용 홈 목록을 불러오는 중...</p>}
        <div className="hitel-form-actions">
          <button type="submit" className="hitel-btn" disabled={submitting}>
            {submitting ? '[ 생성중... ]' : '[ 만들기 ]'}
          </button>
          {firstHomeId && (
            <button
              type="button"
              className="hitel-btn hitel-btn-secondary"
              onClick={() => navigate(`/home/${firstHomeId}`)}
              disabled={submitting}
            >
              [ 취소 ]
            </button>
          )}
        </div>
      </form>
      {homes.length > 0 && (
        <p className="hitel-footer">
          <Link to="/" className="hitel-link">◀ 메인으로</Link>
        </p>
      )}
    </div>
  )
}
