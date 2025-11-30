import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { FaRobot, FaUsers, FaColumns, FaUsersCog, FaMoon, FaSun, FaTools, FaExclamationTriangle } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useSettings } from '../context/SettingsContext'
import Logo from './Logo'
import Notifications from './Notifications'

// src/components/Layout.jsx
const Shell = styled.div`
  min-height: 100vh;
  position: relative;
  background: var(--surface);
  transition: background 0.3s ease;
`

const MaintenanceBanner = styled.div`
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
  color: white;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  
  svg {
    animation: pulse 1.5s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`

const AIDisabledBanner = styled.div`
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: white;
  padding: 8px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 500;
`

const Header = styled.header`
  background: var(--surface);
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--border);
  transition: background 0.3s ease, border-color 0.3s ease;
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
  text-decoration: none; color: var(--text); font-weight: 800; letter-spacing: .2px;
  &:hover { opacity: .9; }
`

const Nav = styled.nav`
  display: flex; align-items: center; gap: 22px; font-size: 15px;

  a {
    position: relative; color: var(--text); font-weight: 600; text-decoration: none;
    transition: color .2s ease;
  }
  a.nav-link::after {
    content: ""; position: absolute; left:0; right:0; bottom:-4px; height:2px;
    background: linear-gradient(90deg,#60a5fa,#a78bfa); opacity:0; transform:scaleX(0);
    transition: transform .25s ease, opacity .25s ease;
  }
  a.nav-link:hover { color:#60a5fa; }
  a.nav-link:hover::after { opacity:1; transform:scaleX(1); }

  span { color: var(--muted); font-weight: 500; }
`

const LogoutButton = styled.button`
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
  border-radius: 12px; padding: 9px 14px; font-weight: 700; cursor: pointer;
  box-shadow: 0 2px 4px rgba(15,23,42,0.1); transition: all .2s ease;
  &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(15,23,42,0.12); }
`

const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: var(--card);
  color: var(--text);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--surface-alt);
    transform: scale(1.05);
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: rotate(15deg);
  }
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
  background: var(--surface);
  transition: background 0.3s ease;
`

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: var(--border);
  margin: 0 4px;
`

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  const { isMaintenanceMode, isAIEnabled } = useSettings()
  
  const showMaintenanceBanner = isMaintenanceMode() && user?.role === 'admin'
  const showAIDisabledBanner = !isAIEnabled() && user?.role === 'admin'

  return (
    <Shell>
      {/* Admin warning banners */}
      {showMaintenanceBanner && (
        <MaintenanceBanner>
          <FaTools /> Maintenance Mode Active - Only admins can access the system
        </MaintenanceBanner>
      )}
      {showAIDisabledBanner && (
        <AIDisabledBanner>
          <FaExclamationTriangle /> AI Features Disabled - Users cannot access AI insights
        </AIDisabledBanner>
      )}
      
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
      {/* Only show AI link if AI is enabled OR user is admin */}
      {(isAIEnabled() || user.role === 'admin') && (
        <Link to="/ai" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <FaRobot size={14} /> AI Insights
        </Link>
      )}
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
      
      <Divider />
      
      <Notifications />

      {/* Theme toggle */}
      <ThemeToggle onClick={toggleTheme} title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}>
        {isDarkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
      </ThemeToggle>

      {/* Add new task button here */}
      <NewTaskButton to="/tasks/new">
        + New Task
      </NewTaskButton>

      <Divider />

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
