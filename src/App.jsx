import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import MainPage from './pages/MainPage'
import FriendsHome from './pages/FriendsHome'
import CreateHome from './pages/CreateHome'
import AboutPage from './pages/AboutPage'
import BoardList from './pages/BoardList'
import PostView from './pages/PostView'
import PostWrite from './pages/PostWrite'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<MainPage />} />
        <Route path="create" element={<CreateHome />} />
        <Route path="home/:homeId" element={<FriendsHome />} />
        <Route path="home/:homeId/about" element={<AboutPage />} />
        <Route path="home/:homeId/board/:boardId" element={<BoardList />} />
        <Route path="home/:homeId/board/:boardId/post/:postId" element={<PostView />} />
        <Route path="home/:homeId/board/:boardId/write" element={<PostWrite />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
