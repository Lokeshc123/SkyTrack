import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import GlobalStyle from './styles/global'
import Layout from './components/Layout'
import Login from './pages/Login'
import MyTasks from './pages/MyTasks'
import Projects from './pages/Projects'
import TaskDetails from './pages/TaskDetails'
import NewTask from './pages/NewTask'


function Protected({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <GlobalStyle />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Protected><Layout><MyTasks /></Layout></Protected>} />
        <Route path="/tasks" element={<Protected><Layout><MyTasks /></Layout></Protected>} />
        <Route path="/projects" element={<Protected><Layout><Projects /></Layout></Protected>} />
        <Route path="/tasks/:id" element={<Protected><Layout><TaskDetails /></Layout></Protected>} />
        <Route path="/tasks/new" element={<Protected><Layout><NewTask/></Layout></Protected>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
