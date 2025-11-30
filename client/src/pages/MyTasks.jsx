import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import Card from '../components/Card'
import StatusBadge from '../components/StatusBadge'
import Confidence from '../components/Confidence'
import EmptyState from '../components/EmptyState'
import Button from '../components/Button'
import DailyUpdateModal from '../components/DailyUpdateModal'

// ---------- Styled Components ----------

const PageWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 80vh;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 32px 72px;
`

const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
`

const Title = styled.h1`
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 0.3px;
  background: linear-gradient(90deg, var(--text) 0%, var(--primary) 55%, #8b5cf6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`

const Tools = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`

const Input = styled.input`
  border: 1px solid var(--border);
  background: var(--card);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 10px 14px;
  min-width: 240px;
  font-size: 14px;
  color: var(--text);
  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light);
  }
`

const Select = styled.select`
  border: 1px solid var(--border);
  background: var(--card);
  backdrop-filter: blur(8px);
  border-radius: 12px;
  padding: 10px 14px;
  font-size: 14px;
  color: var(--text);
  cursor: pointer;
  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px var(--primary-light);
  }
`

const TableWrap = styled.div`
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--card);
  backdrop-filter: blur(10px);
  box-shadow: 0 18px 40px var(--shadow);
`

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`

const Thead = styled.thead`
  background: var(--surface-alt);
  th {
    text-align: left;
    padding: 14px;
    font-weight: 700;
    color: var(--text);
  }
`

const Tbody = styled.tbody`
  td {
    padding: 14px;
    border-top: 1px solid var(--border);
    color: var(--text);
  }
  tr:hover td {
    background: var(--surface-hover);
  }
`

const TaskTitle = styled(Link)`
  color: var(--text);
  font-weight: 600;
  text-decoration: none;
  &:hover {
    color: var(--primary);
    text-decoration: underline;
  }
`

const CellMuted = styled.span`
  color: var(--muted);
`

// ---------- Component ----------

export default function MyTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('all')
  const [query, setQuery] = useState('')
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  useEffect(() => {
    if (!user) return
    (async () => {
      try {
        const res = await api.get('/api/tasks', { params: { assignee: user.id } })
        setTasks(res.data)
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tasks.filter(t => {
      const matchesStatus = status === 'all' || t.status === status
      const matchesQuery =
        !q ||
        t.title?.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      return matchesStatus && matchesQuery
    })
  }, [tasks, status, query])

  return (
    <PageWrap>
      <TopBar>
        <Title>My Tasks</Title>
        <Tools>
          <Button onClick={() => setShowUpdateModal(true)}>Daily Update</Button>
          <Input
            placeholder="Search tasks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Select value={status} onChange={e => setStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="blocked">Blocked</option>
            <option value="done">Done</option>
          </Select>
        </Tools>
      </TopBar>

      <Card>
        <TableWrap>
          <Table>
            <Thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Progress</th>
                <th>Due</th>
                <th>Confidence</th>
              </tr>
            </Thead>
            <Tbody>
              {loading && (
                <tr>
                  <td colSpan="6">
                    <EmptyState>Loading...</EmptyState>
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan="6">
                    <EmptyState>No matching tasks.</EmptyState>
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map(t => (
                  <tr key={t._id}>
                    <td>
                      <TaskTitle to={`/tasks/${t._id}`}>{t.title}</TaskTitle>
                    </td>
                    <td>
                      <StatusBadge status={t.status} />
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{t.priority}</td>
                    <td>{t.progress ?? 0}%</td>
                    <td>
                      <CellMuted>
                        {t.dueDate
                          ? new Date(t.dueDate).toLocaleDateString()
                          : '—'}
                      </CellMuted>
                    </td>
                    <td>
                      <Confidence value={t.aiConfidence ?? 0} />
                    </td>
                  </tr>
                ))}
            </Tbody>
          </Table>
        </TableWrap>
      </Card>
      {showUpdateModal && <DailyUpdateModal onClose={() => setShowUpdateModal(false)} />}
    </PageWrap>
  )
}
