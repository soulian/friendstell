import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  getPosts,
  getBoardDisplayName,
  isBoardProtected,
  getStoredHomeAccess,
  setHomeBoardAccess,
  checkHomeBoardPassword,
} from '../data/mock'
import './BoardList.css'

export default function BoardList() {
  const { homeId, boardId } = useParams()
  const boardName = getBoardDisplayName(homeId, boardId)
  const posts = getPosts(homeId, boardId)
  const protectedBoard = isBoardProtected(boardId)
  const hasAccess = !protectedBoard || getStoredHomeAccess(homeId)

  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleUnlock = (e) => {
    e.preventDefault()
    setPasswordError('')
    if (!passwordInput.trim()) {
      setPasswordError('비밀번호를 입력하세요.')
      return
    }
    if (!checkHomeBoardPassword(homeId, passwordInput.trim())) {
      setPasswordError('비밀번호가 일치하지 않습니다.')
      return
    }
    setHomeBoardAccess(homeId)
    setPasswordInput('')
  }

  if (protectedBoard && !hasAccess) {
    return (
      <div className="board-list hitel-card board-unlock">
        <nav className="hitel-nav">
          <Link to={`/home/${homeId}`}>◀ 메인</Link>
          <span># {boardName} 🔑</span>
        </nav>
        <p className="board-unlock-desc">이 게시판은 프렌즈홈 비밀번호를 입력해야 열람할 수 있습니다.</p>
        <form onSubmit={handleUnlock} className="board-unlock-form">
          <label>
            <span>프렌즈홈 비밀번호</span>
            <input
              type="password"
              className="hitel-input"
              placeholder="비밀번호 입력 (미설정 시 friends)"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError('') }}
              autoComplete="current-password"
            />
          </label>
          {passwordError && <p className="hitel-error">{passwordError}</p>}
          <button type="submit" className="hitel-btn">[ 확인 ]</button>
        </form>
      </div>
    )
  }

  return (
    <div className="board-list hitel-card">
      <nav className="hitel-nav">
        <Link to={`/home/${homeId}`}>◀ 메인</Link>
        <span># {boardName}{protectedBoard ? ' 🔑' : ''}</span>
      </nav>
      <h2 className="hitel-board-title">게시판 총 {posts.length}건</h2>
      <table className="hitel-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>작성자</th>
            <th>제목</th>
            <th>조회</th>
          </tr>
        </thead>
        <tbody>
          {posts.length === 0 ? (
            <tr>
              <td colSpan={4} className="hitel-empty">아직 글이 없습니다. 첫 글을 남겨보세요.</td>
            </tr>
          ) : (
            posts.map((post, i) => (
              <tr key={post.id}>
                <td>{posts.length - i}</td>
                <td>{post.author}</td>
                <td>
                  <Link to={`/home/${homeId}/board/${boardId}/post/${post.id}`}>
                    {post.title}
                  </Link>
                </td>
                <td>{post.views || 0}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      <div className="hitel-actions">
        <Link to={`/home/${homeId}/board/${boardId}/write`} className="hitel-btn">
          [ 글쓰기 ]
        </Link>
      </div>
    </div>
  )
}
