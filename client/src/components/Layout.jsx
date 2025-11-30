import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { FaRobot, FaUsers, FaColumns, FaUsersCog } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import Notifications from './Notifications'
// src/components/Layout.jsx
const Shell = styled.div`
  min-height: 100vh;
  position: relative;
  background: #f8fafc;
`
const Header = styled.header`
  background: #f8fafc;
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #e2e8f0;
`


/* Full width container for header */
const Container = styled.div`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0 32px;
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
  a.nav-link::after {
    content: ""; position: absolute; left:0; right:0; bottom:-4px; height:2px;
    background: linear-gradient(90deg,#60a5fa,#a78bfa); opacity:0; transform:scaleX(0);
    transition: transform .25s ease, opacity .25s ease;
  }
  a.nav-link:hover { color:#1d4ed8; }
  a.nav-link:hover::after { opacity:1; transform:scaleX(1); }

  span { color: var(--muted); font-weight: 500; }
`

const LogoutButton = styled.button`
  border: 1px solid rgba(255,255,255,0.55);
  background: linear-gradient(145deg,#ffffff 0%,#f8fafc 100%);
  border-radius: 12px; padding: 9px 14px; font-weight: 700; cursor: pointer;
  box-shadow: 0 2px 4px rgba(15,23,42,0.1); transition: all .2s ease;
  &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15,23,42,0.12); }
`

const NewTaskButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  padding: 9px 16px;
  border-radius: 12px;
  font-weight: 600;
  background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
  color: #fff;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2), 0 2px 4px -1px rgba(37, 99, 235, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  font-size: 14px;
  
  &:hover {
    filter: brightness(1.1);
    transform: translateY(-1px);
    box-shadow: 0 6px 8px -1px rgba(37, 99, 235, 0.3);
    color: white;
  }
  
  &:active {
    transform: translateY(0);
  }
`

/* Full width main content */
const Main = styled.main`
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 0;
  background: #f8fafc;
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
      <Link to="/tasks" className="nav-link">My Tasks</Link>
      <Link to="/board" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <FaColumns size={14} /> Board
      </Link>
      <Link to="/projects" className="nav-link">Projects</Link>
      <Link to="/ai" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <FaRobot size={14} /> AI Insights
      </Link>
      {['manager', 'admin'].includes(user.role) && (
        <Link to="/manager" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FaUsers size={14} /> Manager
        </Link>
      )}
      {user.role === 'admin' && (
        <Link to="/admin" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FaUsersCog size={14} /> Admin
        </Link>
      )}
      
      <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />
      
      <Notifications />

      {/* Add new task button here */}
      <NewTaskButton to="/tasks/new">
        + New Task
      </NewTaskButton>

      <div style={{ width: 1, height: 24, background: '#e2e8f0', margin: '0 4px' }} />

      <span>{user.name}</span>
      <LogoutButton onClick={logout}>Logout</LogoutButton>
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
