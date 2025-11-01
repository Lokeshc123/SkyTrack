import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Shell = styled.div`min-height: 100vh;`
const Header = styled.header`
  position: sticky; top: 0; z-index: 10;
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid var(--border);
`
const HeaderInner = styled.div`
  max-width: 1100px; margin: 0 auto; height: 56px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 16px;
`
const Nav = styled.nav`
  display: flex; align-items: center; gap: 12px; font-size: 14px;
`
const Main = styled.main`
  max-width: 1100px; margin: 0 auto; padding: 24px 16px;
`

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  return (
    <Shell>
      <Header>
        <HeaderInner>
          <Link to="/" style={{ fontWeight: 600 }}>SkyTrack</Link>
          <Nav>
            {user && (
              <>
                <Link to="/tasks">My Tasks</Link>
                <Link to="/projects">Projects</Link>
                <span style={{ color: 'var(--muted)' }}>{user.name} · {user.role}</span>
                <button onClick={logout}>Logout</button>
              </>
            )}
          </Nav>
        </HeaderInner>
      </Header>
      <Main>{children}</Main>
    </Shell>
  )
}
