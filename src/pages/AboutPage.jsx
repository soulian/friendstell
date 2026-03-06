import { Link, useParams } from 'react-router-dom'
import './AboutPage.css'

export default function AboutPage() {
  const { homeId } = useParams()

  return (
    <div className="about-page hitel-card">
      <nav className="hitel-nav">
        <Link to={`/home/${homeId}`}>◀ 메인</Link>
      </nav>
      <h1 className="about-heading">[ 프렌즈텔? ]</h1>
      <div className="about-body">
        <p>
          프렌즈텔은 <strong>친구와 함께 쓰는 게시판</strong>을 만드는 서비스입니다.
        </p>
        <p>
          새 프렌즈홈을 만들고, 친구에게 링크를 공유하면 공지사항, 자유게시판, 소식, 임시 게시판을
          함께 쓸 수 있습니다. 상단 메뉴에서 다른 프렌즈홈으로 이동할 수 있습니다.
        </p>
        <p>
          공지사항은 운영자 비밀번호를 아시는 분만 작성할 수 있으며,
          나머지 게시판은 닉네임을 입력해 자유롭게 글을 쓸 수 있습니다.
        </p>
        <p>
          키보드 1~5번으로 메뉴를 선택할 수 있습니다.
        </p>
        <p className="about-sign">- 프렌즈텔 -</p>
      </div>
    </div>
  )
}
