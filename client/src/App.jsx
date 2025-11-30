import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import GlobalStyle from './styles/global'
import Layout from './components/Layout'
import MaintenanceMode from './components/MaintenanceMode'
import AIDisabled from './components/AIDisabled'
import Login from './pages/Login'
import MyTasks from './pages/MyTasks'
import Projects from './pages/Projects'
import TaskDetailsNew from './pages/TaskDetailsNew'
import NewTask from './pages/NewTask'
import TaskJourney from './pages/TaskJourney'
import NotificationsPage from './pages/NotificationsPage'
import AIDashboard from './pages/AIDashboard'
import ManagerDashboard from './pages/ManagerDashboard'
import KanbanBoard from './pages/KanbanBoard'
import AdminDashboard from './pages/AdminDashboard'


function Protected({ children }) {
  const { user } = useAuth()
  const { isMaintenanceMode } = useSettings()
  
  if (!user) return <Navigate to="/login" replace />
  
  // Show maintenance mode for non-admin users
  if (isMaintenanceMode() && user.role !== 'admin') {
    return <MaintenanceMode />
  }
  
  return children
}

function ManagerProtected({ children }) {
  const { user } = useAuth()
  const { isMaintenanceMode } = useSettings()
  
  if (!user) return <Navigate to="/login" replace />
  if (!['manager', 'admin'].includes(user.role)) return <Navigate to="/" replace />
  
  // Show maintenance mode for non-admin users
  if (isMaintenanceMode() && user.role !== 'admin') {
    return <MaintenanceMode />
  }
  
  return children
}

function AdminProtected({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

// AI route protection - blocks access when AI is disabled
function AIProtected({ children }) {
  const { user } = useAuth()
  const { isAIEnabled, isMaintenanceMode } = useSettings()
  
  if (!user) return <Navigate to="/login" replace />
  
  // Show maintenance mode for non-admin users
  if (isMaintenanceMode() && user.role !== 'admin') {
    return <MaintenanceMode />
  }
  
  // Show AI disabled message if AI is turned off (except for admins)
  if (!isAIEnabled() && user.role !== 'admin') {
    return <Layout><AIDisabled /></Layout>
  }
  
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Layout><MyTasks /></Layout></Protected>} />
      <Route path="/tasks" element={<Protected><Layout><MyTasks /></Layout></Protected>} />
      <Route path="/projects" element={<Protected><Layout><Projects /></Layout></Protected>} />
      <Route path="/tasks/:id" element={<Protected><Layout><TaskDetailsNew /></Layout></Protected>} />
      <Route path="/tasks/:id/journey" element={<Protected><Layout><TaskJourney /></Layout></Protected>} />
      <Route path="/tasks/new" element={<Protected><Layout><NewTask/></Layout></Protected>} />
      <Route path="/notifications" element={<Protected><Layout><NotificationsPage /></Layout></Protected>} />
      <Route path="/ai" element={<AIProtected><Layout><AIDashboard /></Layout></AIProtected>} />
      <Route path="/board" element={<Protected><Layout><KanbanBoard /></Layout></Protected>} />
      <Route path="/manager" element={<ManagerProtected><Layout><ManagerDashboard /></Layout></ManagerProtected>} />
      <Route path="/admin" element={<AdminProtected><Layout><AdminDashboard /></Layout></AdminProtected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <AuthProvider>
          <GlobalStyle />
          <AppRoutes />
        </AuthProvider>
      </SettingsProvider>
    </ThemeProvider>
  )
}
