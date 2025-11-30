import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { FaBell, FaCheck, FaTrash, FaCheckDouble, FaExternalLinkAlt } from 'react-icons/fa'
import api from '../lib/api'

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 32px 32px 72px;
`

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 12px;
`

const Actions = styled.div`
  display: flex;
  gap: 12px;
`

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  ${props => props.$primary ? `
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    color: white;
    border: none;
    
    &:hover {
      filter: brightness(1.1);
    }
  ` : `
    background: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
    
    &:hover {
      background: #f8fafc;
      color: #0f172a;
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const Card = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`

const Tabs = styled.div`
  display: flex;
  border-bottom: 1px solid #e2e8f0;
`

const Tab = styled.button`
  flex: 1;
  padding: 14px;
  font-size: 14px;
  font-weight: 600;
  background: ${props => props.$active ? 'white' : '#f8fafc'};
  color: ${props => props.$active ? '#0f172a' : '#64748b'};
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: ${props => props.$active ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)' : 'transparent'};
  }
  
  &:hover {
    color: #0f172a;
  }
`

const TabBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  margin-left: 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 700;
  background: ${props => props.$active ? '#3b82f6' : '#e2e8f0'};
  color: ${props => props.$active ? 'white' : '#64748b'};
`

const NotificationList = styled.div`
  max-height: 600px;
  overflow-y: auto;
`

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  background: ${props => props.$read ? 'white' : '#f8fafc'};
  transition: background 0.2s;
  cursor: pointer;
  
  &:hover {
    background: #f1f5f9;
  }
  
  &:last-child {
    border-bottom: none;
  }
`

const IconWrap = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch(props.$type) {
      case 'task_update': return '#dbeafe'
      case 'task_assigned': return '#dcfce7'
      case 'deadline_soon': return '#fef3c7'
      case 'ai_recommendation': return '#f3e8ff'
      default: return '#f1f5f9'
    }
  }};
  color: ${props => {
    switch(props.$type) {
      case 'task_update': return '#2563eb'
      case 'task_assigned': return '#16a34a'
      case 'deadline_soon': return '#d97706'
      case 'ai_recommendation': return '#9333ea'
      default: return '#64748b'
    }
  }};
  flex-shrink: 0;
`

const Content = styled.div`
  flex: 1;
  min-width: 0;
`

const NotificationTitle = styled.div`
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`

const UnreadDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
`

const Message = styled.p`
  margin: 0;
  font-size: 14px;
  color: #64748b;
  line-height: 1.5;
`

const Time = styled.div`
  font-size: 12px;
  color: #94a3b8;
  margin-top: 6px;
`

const ItemActions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f1f5f9;
    color: ${props => props.$color || '#0f172a'};
  }
`

const Empty = styled.div`
  padding: 64px 24px;
  text-align: center;
  color: #94a3b8;
`

const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const navigate = useNavigate()

  const fetchNotifications = async () => {
    try {
      const params = tab === 'unread' ? '?read=false' : ''
      const res = await api.get(`/api/notifications${params}`)
      setNotifications(res.data.notifications || [])
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    } finally {
      setLoading(false)
    }
  }

  // Mark all as read when page opens
  useEffect(() => {
    const markAllReadOnOpen = async () => {
      try {
        await api.post('/api/notifications/read-all')
      } catch (err) {
        console.error('Failed to mark all as read', err)
      }
    }
    markAllReadOnOpen()
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [tab])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = async (id, e) => {
    e.stopPropagation()
    try {
      await api.patch(`/api/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n))
    } catch (err) {
      console.error(err)
    }
  }

  const markAllRead = async () => {
    try {
      await api.post('/api/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error(err)
    }
  }

  const deleteNotification = async (id, e) => {
    e.stopPropagation()
    try {
      await api.delete(`/api/notifications/${id}`)
      setNotifications(prev => prev.filter(n => n._id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleNotificationClick = (notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
    }
  }

  const formatTime = (date) => {
    const now = new Date()
    const d = new Date(date)
    const diff = now - d
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
    return d.toLocaleDateString()
  }

  const getIcon = (type) => {
    switch(type) {
      case 'task_update': return '📝'
      case 'task_assigned': return '👤'
      case 'deadline_soon': return '⏰'
      case 'ai_recommendation': return '🤖'
      case 'eod_reminder': return '📋'
      default: return '🔔'
    }
  }

  const filtered = tab === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications

  return (
    <PageContainer>
      <Header>
        <Title>
          <FaBell /> Notifications
        </Title>
        <Actions>
          {unreadCount > 0 && (
            <Button onClick={markAllRead}>
              <FaCheckDouble /> Mark all read
            </Button>
          )}
        </Actions>
      </Header>

      <Card>
        <Tabs>
          <Tab $active={tab === 'all'} onClick={() => setTab('all')}>
            All
            <TabBadge $active={tab === 'all'}>{notifications.length}</TabBadge>
          </Tab>
          <Tab $active={tab === 'unread'} onClick={() => setTab('unread')}>
            Unread
            <TabBadge $active={tab === 'unread'}>{unreadCount}</TabBadge>
          </Tab>
        </Tabs>

        <NotificationList>
          {loading ? (
            <Empty>Loading...</Empty>
          ) : filtered.length === 0 ? (
            <Empty>
              <EmptyIcon>🔔</EmptyIcon>
              <div>{tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}</div>
            </Empty>
          ) : (
            filtered.map(n => (
              <NotificationItem 
                key={n._id} 
                $read={n.read}
                onClick={() => handleNotificationClick(n)}
              >
                <IconWrap $type={n.type}>
                  {getIcon(n.type)}
                </IconWrap>
                <Content>
                  <NotificationTitle>
                    {!n.read && <UnreadDot />}
                    {n.title || 'Notification'}
                  </NotificationTitle>
                  <Message>{n.message}</Message>
                  <Time>{formatTime(n.createdAt)}</Time>
                </Content>
                <ItemActions>
                  {n.actionUrl && (
                    <IconButton 
                      onClick={(e) => { e.stopPropagation(); navigate(n.actionUrl) }}
                      title="View"
                    >
                      <FaExternalLinkAlt size={12} />
                    </IconButton>
                  )}
                  {!n.read && (
                    <IconButton 
                      onClick={(e) => markAsRead(n._id, e)} 
                      $color="#10b981" 
                      title="Mark as read"
                    >
                      <FaCheck size={12} />
                    </IconButton>
                  )}
                  <IconButton 
                    onClick={(e) => deleteNotification(n._id, e)} 
                    $color="#ef4444" 
                    title="Delete"
                  >
                    <FaTrash size={12} />
                  </IconButton>
                </ItemActions>
              </NotificationItem>
            ))
          )}
        </NotificationList>
      </Card>
    </PageContainer>
  )
}
