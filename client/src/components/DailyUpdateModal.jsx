import { useState } from 'react'
import styled from 'styled-components'
import { FaMagic, FaTimes } from 'react-icons/fa'
import api from '../lib/api'
import Button from './Button'

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`

const Modal = styled.div`
  background: white;
  width: 100%;
  max-width: 600px;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  position: relative;
`

const Title = styled.h2`
  margin: 0 0 16px;
  font-size: 20px;
  color: #0f172a;
`

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  font-size: 20px;
  &:hover { color: #0f172a; }
`

const TextArea = styled.textarea`
  width: 100%;
  height: 150px;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 16px;
  &:focus { outline: 2px solid #3b82f6; border-color: transparent; }
`

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const AIButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  
  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

export default function DailyUpdateModal({ onClose }) {
  const [content, setContent] = useState('')
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEnhance = async () => {
    if (!content.trim()) return
    setIsEnhancing(true)
    try {
      const res = await api.post('/api/ai/enhance-update', { content })
      if (res.data.enhancedContent) {
        setContent(res.data.enhancedContent)
      }
    } catch (err) {
      console.error('Failed to enhance update', err)
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) return
    setIsSubmitting(true)
    try {
      await api.post('/api/daily-updates/new-update', { 
        content,
        date: new Date().toISOString()
      })
      onClose()
    } catch (err) {
      console.error('Failed to submit update', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}><FaTimes /></CloseButton>
        <Title>Daily Update</Title>
        <TextArea 
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="What did you work on today? What are your blockers?"
        />
        <ButtonGroup>
          <AIButton onClick={handleEnhance} disabled={isEnhancing || !content.trim()}>
            <FaMagic />
            {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
          </AIButton>
          <Button onClick={handleSubmit} disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? 'Submitting...' : 'Submit Update'}
          </Button>
        </ButtonGroup>
      </Modal>
    </Overlay>
  )
}
