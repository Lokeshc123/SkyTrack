import { useState } from 'react'
import styled from 'styled-components'
import { motion } from 'framer-motion'
import GlassCard, { Pane } from '../components/GlassCard'
import Button from '../components/Button'
import Logo from '../components/Logo'
import { EmailInput, PasswordInput } from '../components/TextInput'
import { useAuth } from '../context/AuthContext'
import { Link, useNavigate } from 'react-router-dom'

const Screen = styled.div`
  min-height: 100dvh; display: grid; place-items: center; position: relative; overflow: hidden;
  background:
    radial-gradient(900px 500px at 95% -10%, #e8eefc 0%, transparent 60%),
    radial-gradient(900px 500px at -10% 120%, #f8e8ff 0%, transparent 60%),
    var(--bg);
`
const Blob = styled(motion.div)`
  position: absolute; width: 480px; height: 480px; border-radius: 999px; filter: blur(60px);
  opacity: 0.36; z-index: 0;
`
const Form = styled.form`
  display: grid; gap: 14px; width: 340px; z-index: 1;
`
const Row = styled.div`
  display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: var(--muted);
`
const Checkbox = styled.label`
  display: inline-flex; gap: 8px; align-items: center; cursor: pointer;
  input { accent-color: #111827; }
`
const Title = styled.h1`margin: 6px 0 4px; font-size: 22px;`
const Subtitle = styled.p`margin: 0 0 14px; font-size: 14px; color: var(--muted);`
const Err = styled.div`color:#dc2626; font-size:12px; min-height:16px;`

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await login({ email, password })
      if (!remember) sessionStorage.setItem('token', localStorage.getItem('token') || '')
      nav('/tasks')
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <Screen>
      <Blob
        initial={{ x: -260, y: -260, background: '#c7d2fe' }}
        animate={{ x: -180, y: -200 }}
        transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
      />
      <Blob
        initial={{ x: 260, y: 260, background: '#fbcfe8' }}
        animate={{ x: 200, y: 200 }}
        transition={{ duration: 5.5, repeat: Infinity, repeatType: 'reverse' }}
      />

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <GlassCard>
          <Pane>
            <Logo />
            <Title>Welcome back</Title>
            <Subtitle>Sign in to continue managing your tasks.</Subtitle>

            <Form onSubmit={onSubmit}>
              <EmailInput value={email} onChange={e => setEmail(e.target.value)} />
              <PasswordInput value={password} onChange={e => setPassword(e.target.value)} />

              <Row>
                <Checkbox>
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                  Remember me
                </Checkbox>
                <Link to="#" style={{ color:'#111827' }}>Forgot password?</Link>
              </Row>

              <Err>{error}</Err>

              <Button type="submit" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </Form>
          </Pane>

          <Pane>
            {/* Illustration area — minimal brand message */}
            <div style={{ textAlign:'center', maxWidth: 220 }}>
              <div style={{ fontWeight:700, marginBottom:6 }}>Ship faster with clarity</div>
              <div style={{ fontSize:13, color:'var(--muted)' }}>
                Track daily progress, unblock early, and let AI predict delivery risk.
              </div>
            </div>
          </Pane>
        </GlassCard>
      </motion.div>
    </Screen>
  )
}
