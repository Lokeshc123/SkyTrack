import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import styled from 'styled-components'

const TableWrap = styled.div`
  background: var(--card); border: 1px solid var(--border);
  border-radius: 14px; overflow: hidden; box-shadow: 0 10px 20px rgba(0,0,0,0.04);
`
const Table = styled.table`width: 100%; border-collapse: collapse; font-size: 14px;`
const Th = styled.th`text-align: left; padding: 12px; background: #f3f4f6;`
const Td = styled.td`padding: 12px; border-top: 1px solid var(--border);`
const Badge = styled.span`
  padding: 2px 8px; border-radius: 999px; font-size: 12px;
  background: ${({v}) => v>=80?'#d1fae5':v>=50?'#fef3c7':'#fee2e2'};
  color: ${({v}) => v>=80?'#065f46':v>=50?'#92400e':'#991b1b'};
`

export default function MyTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    (async () => {
      try {
        const res = await api.get('/api/tasks', { params: { assignee: user.id } })
        setTasks(res.data)
      } finally { setLoading(false) }
    })()
  }, [user])

  if (loading) return <div>Loading…</div>

  return (
    <div>
      <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>My Tasks</h1>
      <TableWrap>
        <Table>
          <thead>
            <tr>
              <Th>Title</Th><Th>Status</Th><Th>Priority</Th><Th>Progress</Th><Th>Due</Th><Th>Confidence</Th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(t => (
              <tr key={t._id}>
                <Td><Link to={`/tasks/${t._id}`} style={{ color:'#0f172a', textDecoration:'underline' }}>{t.title}</Link></Td>
                <Td className="capitalize">{t.status?.replace('_', ' ')}</Td>
                <Td className="capitalize">{t.priority}</Td>
                <Td>{t.progress ?? 0}%</Td>
                <Td>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}</Td>
                <Td><Badge v={t.aiConfidence ?? 0}>{t.aiConfidence ?? 0}%</Badge></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </TableWrap>
    </div>
  )
}
