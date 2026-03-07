import { Link, useParams } from 'react-router-dom'
import {
  getPosts,
  getBoardDisplayName,
} from '../data/mock'
import './BoardList.css'

export default function BoardList() {
  const { homeId, boardId } = useParams()
  const boardName = getBoardDisplayName(homeId, boardId)
  const posts = getPosts(homeId, boardId)

  return (
    <div className="board-list hitel-card">
      <nav className="hitel-nav">
        <Link to={`/home/${homeId}`}>◀ 메인</Link>
        <span># {boardName}</span>
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
