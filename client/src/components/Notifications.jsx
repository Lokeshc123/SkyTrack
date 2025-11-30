import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { FaBell } from 'react-icons/fa'
import api from '../lib/api'

const Container = styled.div`
  position: relative;
`

const BellLink = styled(Link)`
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  color: #64748b;
  font-size: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;

  &:hover {
    background: rgba(15, 23, 42, 0.05);
    color: #0f172a;
  }
  
  &:active {
    transform: scale(0.95);
  }
`

const Badge = styled.span`
  position: absolute;
  top: 0;
  right: 0;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
  line-height: 1.3;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.4);
  border: 2px solid white;
`

export default function Notifications() {
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/api/notifications/unread-count')
      setUnreadCount(res.data.total || 0)
    } catch (err) {
      console.error('Failed to fetch unread count', err)
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 60000) // Poll every minute
    return () => clearInterval(interval)
  }, [])

  return (
    <Container>
      <BellLink to="/notifications">
        <FaBell />
        {unreadCount > 0 && <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>}
      </BellLink>
    </Container>
  )
}
