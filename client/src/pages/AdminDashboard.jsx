import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FaUsersCog, FaUsers, FaUserPlus, FaUserEdit, FaTrash, FaSearch,
  FaChartBar, FaProjectDiagram, FaTasks, FaCheckCircle, FaClock,
  FaShieldAlt, FaCog, FaDatabase, FaRobot, FaExclamationTriangle,
  FaTimes, FaCheck, FaEye, FaEyeSlash, FaSave, FaSync
} from 'react-icons/fa'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'

/* ===== Design Tokens ===== */
const colors = {
  bg: '#f8fafc',
  surface: '#ffffff',
  surfaceHover: '#f1f5f9',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  text: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  primary: '#3b82f6',
  primaryLight: '#eff6ff',
  primaryGradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
  adminGradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
  success: '#10b981',
  successBg: '#ecfdf5',
  warning: '#f59e0b',
  warningBg: '#fffbeb',
  danger: '#ef4444',
  dangerBg: '#fef2f2',
  purple: '#8b5cf6',
  purpleBg: '#f5f3ff',
}

/* ===== Layout ===== */
const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 32px 72px;
`

const Header = styled.div`
  margin-bottom: 32px;
`

const HeaderTop = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
`

const TitleGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const AdminBadge = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: ${colors.adminGradient};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  box-shadow: 0 10px 20px -5px rgba(239, 68, 68, 0.4);
`

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: ${colors.text};
`

const Subtitle = styled.p`
  margin: 4px 0 0;
  font-size: 14px;
  color: ${colors.textSecondary};
`

/* ===== Tabs ===== */
const TabBar = styled.div`
  display: flex;
  gap: 4px;
  padding: 4px;
  background: ${colors.surfaceHover};
  border-radius: 12px;
  margin-bottom: 24px;
  overflow-x: auto;
`

const Tab = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${props => props.$active ? 'white' : 'transparent'};
  color: ${props => props.$active ? colors.text : colors.textSecondary};
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.$active ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'};
  white-space: nowrap;
  
  &:hover:not([disabled]) {
    color: ${colors.text};
  }
`

/* ===== Stats Cards ===== */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const StatCard = styled(motion.div)`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
`

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${props => props.$bg};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: ${props => props.$color};
`

const StatInfo = styled.div``

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 800;
  color: ${colors.text};
`

const StatLabel = styled.div`
  font-size: 13px;
  color: ${colors.textSecondary};
`

/* ===== Card ===== */
const Card = styled.div`
  background: ${colors.surface};
  border: 1px solid ${colors.border};
  border-radius: 16px;
  overflow: hidden;
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid ${colors.border};
`

const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: ${colors.text};
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    color: ${colors.primary};
  }
`

const CardBody = styled.div`
  padding: 24px;
`

/* ===== Search & Actions ===== */
const SearchBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: ${colors.bg};
  border: 1px solid ${colors.border};
  border-radius: 8px;
  width: 280px;
  
  input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 13px;
    color: ${colors.text};
    outline: none;
    
    &::placeholder {
      color: ${colors.textMuted};
    }
  }
  
  svg {
    color: ${colors.textMuted};
    font-size: 14px;
  }
`

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: ${props => props.$primary ? colors.primaryGradient : 'white'};
  color: ${props => props.$primary ? 'white' : colors.textSecondary};
  border: 1px solid ${props => props.$primary ? 'transparent' : colors.border};
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`

/* ===== Table ===== */
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`

const Th = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: ${colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${colors.bg};
  border-bottom: 1px solid ${colors.border};
`

const Td = styled.td`
  padding: 16px;
  font-size: 14px;
  color: ${colors.text};
  border-bottom: 1px solid ${colors.borderLight};
  vertical-align: middle;
`

const Tr = styled.tr`
  transition: background 0.2s;
  
  &:hover {
    background: ${colors.surfaceHover};
  }
`

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${props => props.$bg || colors.primaryGradient};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
`

const UserName = styled.div`
  font-weight: 600;
  color: ${colors.text};
`

const UserEmail = styled.div`
  font-size: 12px;
  color: ${colors.textMuted};
`

const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
  
  ${props => {
    switch (props.$role) {
      case 'admin':
        return `background: ${colors.dangerBg}; color: ${colors.danger};`
      case 'manager':
        return `background: ${colors.purpleBg}; color: ${colors.purple};`
      case 'dev':
      default:
        return `background: ${colors.primaryLight}; color: ${colors.primary};`
    }
  }}
`

const StatusDot = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.$active ? colors.success : colors.textMuted};
  }
`

const ActionIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid ${colors.border};
  background: white;
  color: ${props => props.$danger ? colors.danger : colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.$danger ? colors.dangerBg : colors.surfaceHover};
    border-color: ${props => props.$danger ? colors.danger : colors.primary};
    color: ${props => props.$danger ? colors.danger : colors.primary};
  }
`

/* ===== Modal ===== */
const ModalOverlay = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`

const Modal = styled(motion.div)`
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid ${colors.border};
`

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: ${colors.text};
`

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  background: ${colors.surfaceHover};
  color: ${colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: ${colors.border};
  }
`

const ModalBody = styled.div`
  padding: 24px;
`

const FormGroup = styled.div`
  margin-bottom: 20px;
`

const FormLabel = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: 8px;
`

const FormInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid ${colors.border};
  border-radius: 10px;
  font-size: 14px;
  color: ${colors.text};
  outline: none;
  transition: all 0.2s;
  
  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const FormSelect = styled.select`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid ${colors.border};
  border-radius: 10px;
  font-size: 14px;
  color: ${colors.text};
  outline: none;
  background: white;
  cursor: pointer;
  
  &:focus {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid ${colors.border};
`

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.$primary ? `
    background: ${colors.primaryGradient};
    color: white;
    border: none;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
  ` : `
    background: white;
    color: ${colors.textSecondary};
    border: 1px solid ${colors.border};
    
    &:hover {
      background: ${colors.surfaceHover};
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const DangerButton = styled(Button)`
  background: ${colors.danger};
  color: white;
  border: none;
  
  &:hover {
    background: #dc2626;
  }
`

/* ===== Settings ===== */
const SettingsGrid = styled.div`
  display: grid;
  gap: 24px;
`

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid ${colors.borderLight};
  
  &:last-child {
    border-bottom: none;
  }
`

const SettingInfo = styled.div``

const SettingTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${colors.text};
  margin-bottom: 4px;
`

const SettingDesc = styled.div`
  font-size: 12px;
  color: ${colors.textSecondary};
`

const Toggle = styled.button`
  width: 48px;
  height: 26px;
  border-radius: 13px;
  border: none;
  background: ${props => props.$active ? colors.success : colors.border};
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  
  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${props => props.$active ? '25px' : '3px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    transition: all 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`

/* ===== Activity Log ===== */
const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
`

const ActivityItem = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid ${colors.borderLight};
  
  &:last-child {
    border-bottom: none;
  }
`

const ActivityIcon = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: ${props => props.$bg || colors.primaryLight};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$color || colors.primary};
  font-size: 14px;
  flex-shrink: 0;
`

const ActivityContent = styled.div`
  flex: 1;
`

const ActivityText = styled.div`
  font-size: 14px;
  color: ${colors.text};
  margin-bottom: 4px;
  
  strong {
    font-weight: 600;
  }
`

const ActivityTime = styled.div`
  font-size: 12px;
  color: ${colors.textMuted};
`

/* ===== Empty & Loading ===== */
const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 16px;
  padding: 60px 20px;
  color: ${colors.textSecondary};
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${colors.textMuted};
`

/* ===== Component ===== */
export default function AdminDashboard() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('users')
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'dev'
  })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  
  // Settings states
  const [settings, setSettings] = useState({
    aiEnabled: true,
    notificationsEnabled: true,
    autoAssign: false,
    dailyUpdatesRequired: true
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [usersRes, projectsRes, tasksRes] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/projects'),
        api.get('/api/tasks')
      ])
      
      setUsers(usersRes.data || [])
      setProjects(projectsRes.data || [])
      setTasks(tasksRes.data || [])
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStats = () => {
    const totalUsers = users.length
    const totalProjects = projects.length
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'done').length
    const activeUsers = users.filter(u => {
      const lastActive = new Date(u.updatedAt || u.createdAt)
      const daysDiff = (Date.now() - lastActive) / (1000 * 60 * 60 * 24)
      return daysDiff < 7
    }).length
    
    return { totalUsers, totalProjects, totalTasks, completedTasks, activeUsers }
  }

  const filteredUsers = users.filter(u => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return u.name?.toLowerCase().includes(query) || 
           u.email?.toLowerCase().includes(query)
  })

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return colors.adminGradient
      case 'manager': return `linear-gradient(135deg, ${colors.purple} 0%, #a855f7 100%)`
      default: return colors.primaryGradient
    }
  }

  // User Management
  const openCreateModal = () => {
    setEditingUser(null)
    setFormData({ name: '', email: '', password: '', role: 'dev' })
    setFormError('')
    setShowUserModal(true)
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setFormData({ 
      name: user.name, 
      email: user.email, 
      password: '', 
      role: user.role 
    })
    setFormError('')
    setShowUserModal(true)
  }

  const openDeleteModal = (user) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const handleSaveUser = async () => {
    if (!formData.name || !formData.email) {
      setFormError('Name and email are required')
      return
    }
    
    if (!editingUser && !formData.password) {
      setFormError('Password is required for new users')
      return
    }
    
    setSaving(true)
    setFormError('')
    
    try {
      if (editingUser) {
        const updateData = { 
          name: formData.name, 
          email: formData.email, 
          role: formData.role 
        }
        if (formData.password) {
          updateData.password = formData.password
        }
        
        await api.put(`/api/users/${editingUser._id}`, updateData)
        setUsers(prev => prev.map(u => 
          u._id === editingUser._id ? { ...u, ...updateData } : u
        ))
      } else {
        const res = await api.post('/api/users', formData)
        setUsers(prev => [...prev, res.data])
      }
      
      setShowUserModal(false)
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save user')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    
    setSaving(true)
    try {
      await api.delete(`/api/users/${userToDelete._id}`)
      setUsers(prev => prev.filter(u => u._id !== userToDelete._id))
      setShowDeleteModal(false)
      setUserToDelete(null)
    } catch (err) {
      console.error('Failed to delete user:', err)
    } finally {
      setSaving(false)
    }
  }

  const stats = getStats()

  if (loading) {
    return (
      <PageContainer>
        <LoadingState>
          <FaSync size={32} />
          <p>Loading admin dashboard...</p>
        </LoadingState>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <Header>
        <HeaderTop>
          <TitleGroup>
            <AdminBadge>
              <FaUsersCog />
            </AdminBadge>
            <div>
              <Title>Admin Dashboard</Title>
              <Subtitle>Manage users, projects, and system settings</Subtitle>
            </div>
          </TitleGroup>
        </HeaderTop>
      </Header>

      {/* Stats Overview */}
      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatIcon $bg={colors.primaryLight} $color={colors.primary}>
            <FaUsers />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.totalUsers}</StatValue>
            <StatLabel>Total Users</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatIcon $bg={colors.purpleBg} $color={colors.purple}>
            <FaProjectDiagram />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.totalProjects}</StatValue>
            <StatLabel>Total Projects</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatIcon $bg={colors.warningBg} $color={colors.warning}>
            <FaTasks />
          </StatIcon>
          <StatInfo>
            <StatValue>{stats.totalTasks}</StatValue>
            <StatLabel>Total Tasks</StatLabel>
          </StatInfo>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatIcon $bg={colors.successBg} $color={colors.success}>
            <FaCheckCircle />
          </StatIcon>
          <StatInfo>
            <StatValue>{Math.round((stats.completedTasks / (stats.totalTasks || 1)) * 100)}%</StatValue>
            <StatLabel>Completion Rate</StatLabel>
          </StatInfo>
        </StatCard>
      </StatsGrid>

      {/* Tabs */}
      <TabBar>
        <Tab $active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
          <FaUsers /> User Management
        </Tab>
        <Tab $active={activeTab === 'activity'} onClick={() => setActiveTab('activity')}>
          <FaClock /> Activity Log
        </Tab>
        <Tab $active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>
          <FaCog /> System Settings
        </Tab>
      </TabBar>

      <AnimatePresence mode="wait">
        {activeTab === 'users' && (
          <motion.div
            key="users"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  <FaUsers /> All Users ({filteredUsers.length})
                </CardTitle>
                <SearchBar>
                  <SearchInput>
                    <FaSearch />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </SearchInput>
                  <ActionButton $primary onClick={openCreateModal}>
                    <FaUserPlus /> Add User
                  </ActionButton>
                </SearchBar>
              </CardHeader>
              
              <div style={{ overflowX: 'auto' }}>
                <Table>
                  <thead>
                    <tr>
                      <Th>User</Th>
                      <Th>Role</Th>
                      <Th>Tasks</Th>
                      <Th>Status</Th>
                      <Th>Joined</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(u => {
                      const userTasks = tasks.filter(t => 
                        t.assignee?._id === u._id || t.assignee === u._id
                      )
                      const completedUserTasks = userTasks.filter(t => t.status === 'done')
                      
                      return (
                        <Tr key={u._id}>
                          <Td>
                            <UserInfo>
                              <Avatar $bg={getRoleColor(u.role)}>
                                {getInitials(u.name)}
                              </Avatar>
                              <div>
                                <UserName>{u.name}</UserName>
                                <UserEmail>{u.email}</UserEmail>
                              </div>
                            </UserInfo>
                          </Td>
                          <Td>
                            <RoleBadge $role={u.role}>
                              {u.role === 'admin' && <FaShieldAlt size={10} />}
                              {u.role}
                            </RoleBadge>
                          </Td>
                          <Td>
                            {completedUserTasks.length}/{userTasks.length} completed
                          </Td>
                          <Td>
                            <StatusDot $active={true}>
                              Active
                            </StatusDot>
                          </Td>
                          <Td>
                            {new Date(u.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Td>
                          <Td>
                            <ActionIcons>
                              <IconButton onClick={() => openEditModal(u)} title="Edit user">
                                <FaUserEdit size={14} />
                              </IconButton>
                              {u._id !== user._id && (
                                <IconButton 
                                  $danger 
                                  onClick={() => openDeleteModal(u)}
                                  title="Delete user"
                                >
                                  <FaTrash size={14} />
                                </IconButton>
                              )}
                            </ActionIcons>
                          </Td>
                        </Tr>
                      )
                    })}
                  </tbody>
                </Table>
              </div>
              
              {filteredUsers.length === 0 && (
                <EmptyState>No users found</EmptyState>
              )}
            </Card>
          </motion.div>
        )}

        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  <FaClock /> Recent Activity
                </CardTitle>
              </CardHeader>
              <CardBody>
                <ActivityList>
                  {tasks.slice(0, 10).map((task, index) => (
                    <ActivityItem key={task._id}>
                      <ActivityIcon 
                        $bg={task.status === 'done' ? colors.successBg : colors.primaryLight}
                        $color={task.status === 'done' ? colors.success : colors.primary}
                      >
                        {task.status === 'done' ? <FaCheckCircle /> : <FaTasks />}
                      </ActivityIcon>
                      <ActivityContent>
                        <ActivityText>
                          <strong>{task.assignee?.name || 'Someone'}</strong>
                          {task.status === 'done' ? ' completed ' : ' updated '}
                          task <strong>"{task.title}"</strong>
                        </ActivityText>
                        <ActivityTime>
                          {new Date(task.updatedAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </ActivityTime>
                      </ActivityContent>
                    </ActivityItem>
                  ))}
                  
                  {projects.slice(0, 5).map(project => (
                    <ActivityItem key={project._id}>
                      <ActivityIcon $bg={colors.purpleBg} $color={colors.purple}>
                        <FaProjectDiagram />
                      </ActivityIcon>
                      <ActivityContent>
                        <ActivityText>
                          <strong>{project.owner?.name || 'Admin'}</strong>
                          {' created project '}
                          <strong>"{project.name}"</strong>
                        </ActivityText>
                        <ActivityTime>
                          {new Date(project.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </ActivityTime>
                      </ActivityContent>
                    </ActivityItem>
                  ))}
                </ActivityList>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>
                  <FaCog /> System Settings
                </CardTitle>
              </CardHeader>
              <CardBody>
                <SettingsGrid>
                  <SettingItem>
                    <SettingInfo>
                      <SettingTitle>
                        <FaRobot style={{ marginRight: 8, color: colors.purple }} />
                        AI Features
                      </SettingTitle>
                      <SettingDesc>
                        Enable AI-powered task confidence scoring and insights
                      </SettingDesc>
                    </SettingInfo>
                    <Toggle 
                      $active={settings.aiEnabled}
                      onClick={() => setSettings(s => ({ ...s, aiEnabled: !s.aiEnabled }))}
                    />
                  </SettingItem>
                  
                  <SettingItem>
                    <SettingInfo>
                      <SettingTitle>
                        <FaExclamationTriangle style={{ marginRight: 8, color: colors.warning }} />
                        Notifications
                      </SettingTitle>
                      <SettingDesc>
                        Send email and in-app notifications for task updates
                      </SettingDesc>
                    </SettingInfo>
                    <Toggle 
                      $active={settings.notificationsEnabled}
                      onClick={() => setSettings(s => ({ ...s, notificationsEnabled: !s.notificationsEnabled }))}
                    />
                  </SettingItem>
                  
                  <SettingItem>
                    <SettingInfo>
                      <SettingTitle>
                        <FaUsers style={{ marginRight: 8, color: colors.primary }} />
                        Auto-Assign Tasks
                      </SettingTitle>
                      <SettingDesc>
                        Automatically assign new tasks based on workload
                      </SettingDesc>
                    </SettingInfo>
                    <Toggle 
                      $active={settings.autoAssign}
                      onClick={() => setSettings(s => ({ ...s, autoAssign: !s.autoAssign }))}
                    />
                  </SettingItem>
                  
                  <SettingItem>
                    <SettingInfo>
                      <SettingTitle>
                        <FaClock style={{ marginRight: 8, color: colors.success }} />
                        Daily Updates Required
                      </SettingTitle>
                      <SettingDesc>
                        Require team members to submit daily task updates
                      </SettingDesc>
                    </SettingInfo>
                    <Toggle 
                      $active={settings.dailyUpdatesRequired}
                      onClick={() => setSettings(s => ({ ...s, dailyUpdatesRequired: !s.dailyUpdatesRequired }))}
                    />
                  </SettingItem>
                </SettingsGrid>
              </CardBody>
            </Card>

            <Card style={{ marginTop: 24 }}>
              <CardHeader>
                <CardTitle>
                  <FaDatabase /> System Info
                </CardTitle>
              </CardHeader>
              <CardBody>
                <SettingsGrid>
                  <SettingItem>
                    <SettingInfo>
                      <SettingTitle>Database Status</SettingTitle>
                      <SettingDesc>MongoDB connection status</SettingDesc>
                    </SettingInfo>
                    <StatusDot $active>Connected</StatusDot>
                  </SettingItem>
                  
                  <SettingItem>
                    <SettingInfo>
                      <SettingTitle>AI Service</SettingTitle>
                      <SettingDesc>Google Gemini API status</SettingDesc>
                    </SettingInfo>
                    <StatusDot $active={settings.aiEnabled}>
                      {settings.aiEnabled ? 'Active' : 'Disabled'}
                    </StatusDot>
                  </SettingItem>
                  
                  <SettingItem>
                    <SettingInfo>
                      <SettingTitle>Storage Used</SettingTitle>
                      <SettingDesc>Total data storage consumed</SettingDesc>
                    </SettingInfo>
                    <span style={{ fontWeight: 600, color: colors.text }}>
                      {((tasks.length * 2 + projects.length * 5 + users.length * 3) / 1000).toFixed(2)} MB
                    </span>
                  </SettingItem>
                </SettingsGrid>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create/Edit User Modal */}
      <AnimatePresence>
        {showUserModal && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowUserModal(false)}
          >
            <Modal
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <ModalHeader>
                <ModalTitle>
                  {editingUser ? 'Edit User' : 'Create New User'}
                </ModalTitle>
                <CloseButton onClick={() => setShowUserModal(false)}>
                  <FaTimes />
                </CloseButton>
              </ModalHeader>
              
              <ModalBody>
                {formError && (
                  <div style={{
                    padding: '10px 14px',
                    background: colors.dangerBg,
                    color: colors.danger,
                    borderRadius: 8,
                    marginBottom: 20,
                    fontSize: 13
                  }}>
                    {formError}
                  </div>
                )}
                
                <FormGroup>
                  <FormLabel>Full Name</FormLabel>
                  <FormInput
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={e => setFormData(d => ({ ...d, name: e.target.value }))}
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel>Email Address</FormLabel>
                  <FormInput
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel>
                    Password {editingUser && '(leave blank to keep current)'}
                  </FormLabel>
                  <FormInput
                    type="password"
                    placeholder={editingUser ? '••••••••' : 'Enter password'}
                    value={formData.password}
                    onChange={e => setFormData(d => ({ ...d, password: e.target.value }))}
                  />
                </FormGroup>
                
                <FormGroup>
                  <FormLabel>Role</FormLabel>
                  <FormSelect
                    value={formData.role}
                    onChange={e => setFormData(d => ({ ...d, role: e.target.value }))}
                  >
                    <option value="dev">Developer</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </FormSelect>
                </FormGroup>
              </ModalBody>
              
              <ModalFooter>
                <Button onClick={() => setShowUserModal(false)}>
                  Cancel
                </Button>
                <Button $primary onClick={handleSaveUser} disabled={saving}>
                  <FaSave />
                  {saving ? 'Saving...' : (editingUser ? 'Update User' : 'Create User')}
                </Button>
              </ModalFooter>
            </Modal>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <ModalOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
          >
            <Modal
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: 400 }}
            >
              <ModalHeader>
                <ModalTitle style={{ color: colors.danger }}>
                  <FaExclamationTriangle style={{ marginRight: 8 }} />
                  Delete User
                </ModalTitle>
                <CloseButton onClick={() => setShowDeleteModal(false)}>
                  <FaTimes />
                </CloseButton>
              </ModalHeader>
              
              <ModalBody>
                <p style={{ margin: 0, fontSize: 14, color: colors.textSecondary }}>
                  Are you sure you want to delete <strong>{userToDelete?.name}</strong>? 
                  This action cannot be undone and will remove all their data.
                </p>
              </ModalBody>
              
              <ModalFooter>
                <Button onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <DangerButton onClick={handleDeleteUser} disabled={saving}>
                  <FaTrash />
                  {saving ? 'Deleting...' : 'Delete User'}
                </DangerButton>
              </ModalFooter>
            </Modal>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </PageContainer>
  )
}
