import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import FriendsHome from './pages/FriendsHome'
import CreateHome from './pages/CreateHome'
import AboutPage from './pages/AboutPage'
import BoardList from './pages/BoardList'
import PostView from './pages/PostView'
import PostWrite from './pages/PostWrite'
import { getHomes } from './data/mock'

export default function App() {
  const [homes, setHomes] = useState([])
  const [loading, setLoading] = useState(true)

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

    const reloadHomes = () => {
      loadHomes()
    }

    loadHomes()
    window.addEventListener('friends-data-updated', reloadHomes)
    return () => {
      mounted = false
      window.removeEventListener('friends-data-updated', reloadHomes)
    }
  }, [])

  const firstHomeId = homes.length > 0 ? homes[0].id : null

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={
          loading
            ? <div className="hitel-card">공용 게시판 데이터를 불러오는 중...</div>
            : firstHomeId
            ? <Navigate to={`/home/${firstHomeId}`} replace />
            : <Navigate to="/create" replace />
        } />
        <Route path="create" element={<CreateHome />} />
        <Route path="home/:homeId" element={<FriendsHome />} />
        <Route path="home/:homeId/about" element={<AboutPage />} />
        <Route path="home/:homeId/board/:boardId" element={<BoardList />} />
        <Route path="home/:homeId/board/:boardId/post/:postId" element={<PostView />} />
        <Route path="home/:homeId/board/:boardId/write" element={<PostWrite />} />
      </Route>
    </Routes>
  )
}
