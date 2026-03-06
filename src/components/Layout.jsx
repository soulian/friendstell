import { Outlet } from 'react-router-dom'
import Header from './Header'
import KeyboardHelp from './KeyboardHelp'
import { usePageMeta } from '../usePageMeta'

export default function Layout() {
  usePageMeta()
  return (
    <div className="layout">
      <Header />
      <main className="retro-main">
        <Outlet />
      </main>
      <KeyboardHelp />
    </div>
  )
}
