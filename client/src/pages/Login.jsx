import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styled from 'styled-components'
import Field from '../components/Field'
import Button from '../components/Button'

const Card = styled.form`
  width: 100%; max-width: 380px; margin: 10vh auto 0;
  background: var(--card); border: 1px solid var(--border);
  border-radius: 14px; padding: 20px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.04);
`
const Title = styled.h1`font-size: 20px; margin: 0 0 12px;`
const Input = styled.input`
  width: 100%; border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px;
`

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await login({ email, password })
      nav('/tasks')
    } catch (err) {
      setError(err?.response?.data?.error || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <Card onSubmit={onSubmit}>
      <Title>Sign in</Title>
      <Field label="Email">
        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
      </Field>
      <Field label="Password">
        <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
      </Field>
      {error && <div style={{ color:'#dc2626', fontSize:12, margin:'6px 0 10px'}}>{error}</div>}
      <Button disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</Button>
    </Card>
  )
}
