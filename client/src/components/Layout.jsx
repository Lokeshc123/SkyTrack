import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
// src/components/Layout.jsx
const Shell = styled.div`
  min-height: 100vh;
  position: relative;
  /* Safety: a fixed gradient layer behind everything */
  &::before {
    content: "";
    position: fixed;
    inset: 0;
    z-index: -1;
    background: var(--bg-grad);
    pointer-events: none;
  }
`
const Header = styled.header`
  /* keep this translucent so gradient shows through */
  backdrop-filter: blur(16px);
  background: rgba(255,255,255,0.65);
  /* ...rest unchanged */
`


/* Wider, fluid container */
const Container = styled.div`
  width: min(1200px, 96vw);
  margin: 0 auto;
  padding: 0 16px;
`

const HeaderInner = styled.div`
  height: 72px;
  display: flex; align-items: center; justify-content: space-between; gap: 14px;
`

const Brand = styled(Link)`
  display: inline-flex; align-items: center; gap: 10px;
  text-decoration: none; color: #0f172a; font-weight: 800; letter-spacing: .2px;
  &:hover { opacity: .9; }
`

const Nav = styled.nav`
  display: flex; align-items: center; gap: 22px; font-size: 15px;

  a {
    position: relative; color: #0f172a; font-weight: 600; text-decoration: none;
    transition: color .2s ease;
  }
  a::after {
    content: ""; position: absolute; left:0; right:0; bottom:-4px; height:2px;
    background: linear-gradient(90deg,#60a5fa,#a78bfa); opacity:0; transform:scaleX(0);
    transition: transform .25s ease, opacity .25s ease;
  }
  a:hover { color:#1d4ed8; }
  a:hover::after { opacity:1; transform:scaleX(1); }

  span { color: var(--muted); font-weight: 500; }

  button {
    border: 1px solid rgba(255,255,255,0.55);
    background: linear-gradient(145deg,#ffffff 0%,#f8fafc 100%);
    border-radius: 12px; padding: 9px 14px; font-weight: 700; cursor: pointer;
    box-shadow: 0 2px 4px rgba(15,23,42,0.1); transition: all .2s ease;
  }
  button:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15,23,42,0.12); }
`

/* Wider main content to match header */
const Main = styled.main`
  width: min(1200px, 96vw);
  margin: 0 auto;
  padding: 32px 16px 72px;
`

export default function Layout({ children }) {
  const { user, logout } = useAuth()

  return (
    <Shell>
      <Header>
        <Container>
          <HeaderInner>
            <Brand to="/" aria-label="Altivio">
              <Logo size={26} />
            </Brand>
            <Nav>
  {user && (
    <>
      <Link to="/tasks">My Tasks</Link>
      <Link to="/projects">Projects</Link>

      {/* Add new task button here */}
      <Link to="/tasks/new">
        <button
          style={{
            border: '1px solid var(--border)',
            padding: '8px 14px',
            borderRadius: '10px',
            fontWeight: 600,
            background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
            color: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          + New Task
        </button>
      </Link>

      <span>{user.name} · {user.role}</span>
      <button onClick={logout}>Logout</button>
    </>
  )}
</Nav>

          </HeaderInner>
        </Container>
      </Header>

      <Main>{children}</Main>
    </Shell>
  )
}
