import styled from 'styled-components'
import { FaRobot, FaPowerOff } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const Container = styled.div`
  max-width: 600px;
  margin: 80px auto;
  padding: 0 24px;
  text-align: center;
`

const Card = styled(motion.div)`
  background: var(--card, #ffffff);
  border-radius: 24px;
  padding: 48px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--border, #e2e8f0);
`

const IconWrapper = styled.div`
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  font-size: 42px;
  color: white;
  position: relative;
`

const OffBadge = styled.div`
  position: absolute;
  bottom: -6px;
  right: -6px;
  width: 32px;
  height: 32px;
  background: #ef4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  border: 3px solid var(--card, #ffffff);
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
  margin: 0 0 32px;
  line-height: 1.6;
`

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  color: white;
  font-weight: 600;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  }
`

export default function AIDisabled() {
  return (
    <Container>
      <Card
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <IconWrapper>
          <FaRobot />
          <OffBadge>
            <FaPowerOff />
          </OffBadge>
        </IconWrapper>
        <Title>AI Features Disabled</Title>
        <Description>
          AI-powered features have been temporarily disabled by the system administrator. 
          This includes AI insights, confidence scoring, and automated recommendations.
          Please contact your administrator if you need access to these features.
        </Description>
        <BackLink to="/tasks">
          ← Back to Tasks
        </BackLink>
      </Card>
    </Container>
  )
}
