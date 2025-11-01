import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import styled from 'styled-components'

const Card = styled.div`
  background: var(--card); border: 1px solid var(--border);
  border-radius: 14px; padding: 16px; box-shadow: 0 10px 20px rgba(0,0,0,0.04);
`
const Row = styled.div`display: grid; gap: 10px; grid-template-columns: 1fr 120px 1fr;`
const Input = styled.input`border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px;`
const Text = styled.textarea`border: 1px solid var(--border); border-radius: 10px; padding: 10px 12px; resize: vertical;`
const Button = styled.button`
  background: var(--primary); color: var(--primary-contrast);
  border: 1px solid transparent; border-radius: 10px; padding: 10px 14px; cursor: pointer;
`
export default function TaskDetails() {
  const { id } = useParams()
  const [task, setTask] = useState(null)
  const [note, setNote] = useState('')
  const [progress, setProgress] = useState('')
  const [blockers, setBlockers] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    // If you later add GET /tasks/:id, switch to that
    api.get('/api/tasks').then(res => {
      const item = res.data.find(t => t._id === id) || null
      setTask(item)
    })
  }, [id])

  const submitUpdate = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      const payload = {
        task: id,
        note: note || undefined,
        progress: progress ? Number(progress) : undefined,
        blockers: blockers ? blockers.split(',').map(s => s.trim()) : undefined
      }
      const res = await api.post('/api/updates', payload)
      setTask(res.data.task)
      setNote(''); setProgress(''); setBlockers('')
    } catch (error) {
      setErr(error?.response?.data?.error || 'Failed to post update')
    }
  }

  if (!task) return <div>Loading…</div>

  return (
    <div className="grid gap-6">
      <Card>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>{task.title}</h1>
        <div style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 10 }}>
          {task.status} · priority {task.priority} · progress {task.progress ?? 0}% · confidence {task.aiConfidence ?? 0}%
        </div>
        <div style={{ marginTop: 18, whiteSpace: 'pre-wrap' }}>{task.description || 'No description'}</div>
      </Card>

      <Card as="form" onSubmit={submitUpdate}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 10 }}>Daily Update</h2>
        <Row>
          <Text placeholder="What did you do today?" value={note} onChange={e => setNote(e.target.value)} rows={3} />
          <Input placeholder="Progress %" value={progress} onChange={e => setProgress(e.target.value)} />
          <Input placeholder="Blockers (comma separated)" value={blockers} onChange={e => setBlockers(e.target.value)} />
        </Row>
        {err && <div style={{ color:'#dc2626', fontSize:12, marginTop:8 }}>{err}</div>}
        <div style={{ marginTop: 12 }}>
          <Button type="submit">Submit Update</Button>
        </div>
      </Card>
    </div>
  )
}
