import styled from 'styled-components'
import { FaTools, FaCog } from 'react-icons/fa'
import { motion } from 'framer-motion'

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(8px);
`

const Card = styled(motion.div)`
  background: var(--card, #ffffff);
  border-radius: 24px;
  padding: 48px;
  max-width: 480px;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
`

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #f59e0b 0%, #ef4444 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 36px;
  color: white;
  position: relative;
  
  svg:last-child {
    position: absolute;
    animation: spin 3s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`

const Title = styled.h1`
  font-size: 28px;
  font-weight: 800;
  color: var(--text, #0f172a);
  margin: 0 0 12px;
`

const Description = styled.p`
  font-size: 16px;
  color: var(--text-secondary, #64748b);
  margin: 0 0 24px;
  line-height: 1.6;
`

const StatusBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #f59e0b;
`

const Dot = styled.span`
  width: 8px;
  height: 8px;
  background: #f59e0b;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }
`

export default function MaintenanceMode({ isAdmin = false }) {
  if (isAdmin) {
    // Admins see a banner instead of being blocked
    return null
  }

  return (
    <Overlay
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <IconWrapper>
          <FaTools />
          <FaCog size={20} style={{ top: -8, right: -8 }} />
        </IconWrapper>
        <Title>System Maintenance</Title>
        <Description>
          We're currently performing scheduled maintenance to improve your experience. 
          Please check back shortly. We apologize for any inconvenience.
        </Description>
        <StatusBar>
          <Dot />
          Maintenance in progress
        </StatusBar>
      </Card>
    </Overlay>
  )
}
