import React, { createContext, useContext, useEffect, useState } from 'react'
import api from '../lib/api'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token') || null)

  useEffect(() => {
    if (!token) return
    const raw = localStorage.getItem('user')
    if (raw) setUser(JSON.parse(raw))
  }, [token])

  const login = async ({ email, password }) => {
    const res = await api.post('/api/users/login', { email, password })
    const { token: t, user: u } = res.data
    setToken(t); setUser(u)
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(u))
    return u
  }

  const logout = () => {
    setToken(null); setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  return (
    <AuthCtx.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}
