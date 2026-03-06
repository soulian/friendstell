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
  const homes = getHomes()
  const firstHomeId = homes.length > 0 ? homes[0].id : null

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={
          firstHomeId
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
