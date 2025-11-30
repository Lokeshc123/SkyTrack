import { useEffect, useState } from 'react'
import styled from 'styled-components'
import api from '../lib/api'
import Toast from './Toast'
import { useAuth } from '../context/AuthContext'

const Wrap = styled.div`display:flex; align-items:center; gap:10px;`
const Select = styled.select`
  border:1px solid var(--border); background:#fff; border-radius:10px; padding:10px 12px; min-width:220px;
  &:focus{ border-color:#94a3b8; box-shadow:0 0 0 3px rgba(148,163,184,.25) }
`
const Btn = styled.button`
  border:1px solid var(--border); background:#fff; border-radius:10px; padding:10px 12px; font-weight:700; cursor:pointer;
  &:hover{ background:#f8fafc }
`

export default function AssigneeSelect({ taskId, value, onChanged }) {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [assignee, setAssignee] = useState(value || '')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(false)

  // Only managers/admins should be able to change
  const canEdit = user?.role === 'manager' || user?.role === 'admin'

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/users?role=dev')
        setUsers(res.data || [])
      } catch { /* ignore */ }
    })()
  }, [])

  const save = async () => {
    if (!canEdit) return
    setSaving(true)
    try {
      const res = await api.patch(`/api/tasks/${taskId}`, { assignee: assignee || undefined })
      onChanged?.(res.data)
      setToast(true)
    } catch (e) {
      alert(e?.response?.data?.error || 'Failed to update assignee')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Wrap>
        <Select value={assignee} onChange={e=>setAssignee(e.target.value)} disabled={!canEdit || saving}>
          <option value="">— Unassigned —</option>
          {users.map(u => <option key={u._id} value={u._id}>{u.name || u.email}</option>)}
        </Select>
        <Btn onClick={save} disabled={!canEdit || saving}>{saving ? 'Saving…' : 'Update'}</Btn>
      </Wrap>
      <Toast text="Assignee updated" show={toast} onDone={()=>setToast(false)} />
    </>
  )
}
