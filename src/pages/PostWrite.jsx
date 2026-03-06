import { useState, useEffect } from 'react'
import { useNavigate, useParams, Navigate } from 'react-router-dom'
import {
  addPost,
  checkOperatorPassword,
  getStoredNickname,
  setStoredNickname,
  isBoardProtected,
  getStoredHomeAccess,
} from '../data/mock'
import './PostWrite.css'

export default function PostWrite() {
  const { homeId, boardId } = useParams()
  const navigate = useNavigate()
  const isNotice = boardId === 'notice'
  const protectedBoard = isBoardProtected(boardId)
  const hasAccess = !protectedBoard || getStoredHomeAccess(homeId)

  if (protectedBoard && !hasAccess) {
    return <Navigate to={`/home/${homeId}/board/${boardId}`} replace />
  }

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [nickname, setNickname] = useState('')
  const [operatorPw, setOperatorPw] = useState('')
  const [operatorError, setOperatorError] = useState('')
  const [passwordChecked, setPasswordChecked] = useState(false)

  useEffect(() => {
    if (!isNotice) {
      setNickname(getStoredNickname())
    }
  }, [isNotice])

  const handleSubmit = (e) => {
    e.preventDefault()

    if (isNotice && !passwordChecked) {
        if (!operatorPw.trim()) {
          setOperatorError('운영자 비밀번호를 입력하세요.')
          return
        }
        if (!checkOperatorPassword(operatorPw.trim())) {
          setOperatorError('비밀번호가 일치하지 않습니다.')
          return
        }
        setOperatorError('')
        setPasswordChecked(true)
      return
    }

    if (!title.trim()) return

    if (isNotice) {
      const post = addPost(homeId, boardId, {
        title: title.trim(),
        body: body.trim(),
        author: '운영자',
      })
      navigate(`/home/${homeId}/board/${boardId}/post/${post.id}`)
    } else {
      const author = nickname.trim() || '익명'
      setStoredNickname(author)
      const post = addPost(homeId, boardId, {
        title: title.trim(),
        body: body.trim(),
        author,
      })
      navigate(`/home/${homeId}/board/${boardId}/post/${post.id}`)
    }
  }

  const needPasswordStep = isNotice && !passwordChecked

  return (
    <div className="post-write hitel-card">
      <h2 className="hitel-title">[ 글쓰기 ]</h2>
      {isNotice && (
        <p className="hitel-hint">공지사항은 운영자 비밀번호 입력 후 작성할 수 있습니다.</p>
      )}
      {!isNotice && (
        <p className="hitel-hint">닉네임을 입력하면 해당 이름으로 글이 등록됩니다.</p>
      )}

      <form onSubmit={handleSubmit} className="hitel-write-form">
        {needPasswordStep ? (
          <label>
            <span>운영자 비밀번호</span>
            <input
              type="password"
              className="hitel-input"
              placeholder="비밀번호 입력"
              value={operatorPw}
              onChange={(e) => {
                setOperatorPw(e.target.value)
                setOperatorError('')
              }}
              autoComplete="current-password"
            />
            {operatorError && <p className="hitel-error">{operatorError}</p>}
          </label>
        ) : (
          <>
            {isNotice && (
              <p className="hitel-ok">비밀번호 확인됨. 아래에 공지 내용을 입력하세요.</p>
            )}
            {!isNotice && (
              <label>
                <span>닉네임</span>
                <input
                  type="text"
                  className="hitel-input"
                  placeholder="닉네임 (미입력 시 익명)"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={20}
                />
              </label>
            )}
            <label>
              <span>제목</span>
              <input
                type="text"
                className="hitel-input"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
              />
            </label>
            <label>
              <span>내용</span>
              <textarea
                className="hitel-textarea"
                placeholder="내용을 입력하세요"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
              />
            </label>
          </>
        )}
        <div className="hitel-form-actions">
          <button type="submit" className="hitel-btn">
            {needPasswordStep ? '[ 비밀번호 확인 ]' : '[ 등록 ]'}
          </button>
        </div>
      </form>
    </div>
  )
}
