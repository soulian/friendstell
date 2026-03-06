import { useState, useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import {
  getPost,
  getComments,
  addComment,
  increaseViews,
  getBoardDisplayName,
  getStoredNickname,
  setStoredNickname,
  isBoardProtected,
  getStoredHomeAccess,
} from '../data/mock'
import './PostView.css'

export default function PostView() {
  const { homeId, boardId, postId } = useParams()
  const boardName = getBoardDisplayName(homeId, boardId)
  const [post, setPost] = useState(null)
  const protectedBoard = isBoardProtected(boardId)
  const hasAccess = !protectedBoard || getStoredHomeAccess(homeId)

  if (protectedBoard && !hasAccess) {
    return <Navigate to={`/home/${homeId}/board/${boardId}`} replace />
  }
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [commentNickname, setCommentNickname] = useState('')

  useEffect(() => {
    setCommentNickname(getStoredNickname())
  }, [])

  useEffect(() => {
    const p = getPost(homeId, boardId, postId)
    setPost(p)
    if (p) {
      increaseViews(homeId, boardId, postId)
    }
  }, [homeId, boardId, postId])

  useEffect(() => {
    setComments(getComments(homeId, boardId, postId))
  }, [homeId, boardId, postId])

  const handleSubmitComment = (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    const author = commentNickname.trim() || '익명'
    setStoredNickname(author)
    addComment(homeId, boardId, postId, { body: commentText.trim(), author })
    setComments(getComments(homeId, boardId, postId))
    setCommentText('')
  }

  if (!post) {
    return (
      <div className="hitel-card hitel-post-missing">
        <p>글이 없거나 삭제되었습니다.</p>
        <Link to={`/home/${homeId}/board/${boardId}`}>[ 목록으로 ]</Link>
      </div>
    )
  }

  return (
    <div className="post-view hitel-card">
      <nav className="hitel-nav">
        <Link to={`/home/${homeId}/board/${boardId}`}>◀ 목록</Link>
        <span># {boardName}</span>
      </nav>
      <article className="hitel-article">
        <h1 className="hitel-post-title">{post.title}</h1>
        <div className="hitel-post-meta">
          <span>{post.author}</span>
          <span>조회 {post.views || 0}</span>
        </div>
        <div className="hitel-post-body">{post.body}</div>
      </article>

      <section className="hitel-comments">
        <h3 className="hitel-title">[ 댓글 ] ({comments.length})</h3>
        <form onSubmit={handleSubmitComment} className="hitel-comment-form">
          <label>
            <span>닉네임</span>
            <input
              type="text"
              className="hitel-input"
              placeholder="닉네임 (미입력 시 익명)"
              value={commentNickname}
              onChange={(e) => setCommentNickname(e.target.value)}
              maxLength={20}
            />
          </label>
          <textarea
            className="hitel-textarea"
            placeholder="댓글을 입력하세요..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
          />
          <button type="submit" className="hitel-btn">[ 댓글 쓰기 ]</button>
        </form>
        <ul className="hitel-comment-list">
          {comments.map((c) => (
            <li key={c.id} className="hitel-comment-item">
              <span className="hitel-comment-author">{c.author}</span>
              <span className="hitel-comment-body">{c.body}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
