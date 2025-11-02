import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import api from '../lib/api'
import Card from '../components/Card'

/* ---------- Layout ---------- */
const Page = styled.div`
  width: min(920px, 92vw);
  margin: 24px auto 80px;
  display: grid;
  gap: 18px;
`

const Title = styled.h1`
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: .2px;
  background: linear-gradient(90deg,#0f172a 0%,#1d4ed8 55%,#6d28d9 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
`

const FormCard = styled(Card)`
  padding: 22px;
  border-radius: 16px;
`

/* ---------- Form ---------- */
const Form = styled.form`
  display: grid;
  gap: 18px;
`

const Group = styled.div`
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr 1fr;
  @media (max-width: 720px) { grid-template-columns: 1fr; }
`

const Label = styled.label`
  display: grid; gap: 8px;
  font-size: 14px; color: #0f172a;
`

const BaseControl = `
  border: 1px solid var(--border);
  background: #fff;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  height: 40px;
  outline: none;
  &:focus { border-color:#94a3b8; box-shadow: 0 0 0 3px rgba(148,163,184,.22); }
`

const Input = styled.input`${BaseControl}`
const Select = styled.select`${BaseControl}`
const Textarea = styled.textarea`
  ${BaseControl};
  height: auto; min-height: 120px; resize: vertical; line-height: 1.5;
`

const Help = styled.div` color: var(--muted); font-size: 12px; `
const Actions = styled.div` display:flex; gap:10px; justify-content:flex-end; `
const Button = styled.button`
  border: 1px solid var(--border);
  background: #fff; color: #0f172a;
  border-radius: 10px; padding: 10px 16px; font-weight: 700; cursor: pointer;
  transition: background .15s ease, transform .15s ease;
  &:hover { background:#f8fafc; } &:active { transform: translateY(1px); }
`
const Primary = styled(Button)`
  background:#0f172a; color:#fff; border-color:#0f172a;
  &:hover { filter: brightness(1.05); }
`
const Error = styled.div` color:#dc2626; font-size:12px; min-height:16px; `

export default function NewTask() {
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [project, setProject] = useState('')
  const [assignee, setAssignee] = useState('')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState('todo')
  const [startDate, setStartDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        console.log('Loading projects and users for NewTask page')
        const [p, u] = await Promise.all([
          api.get('/api/projects'),
          api.get('/api/users?role=dev')
        ])
        setProjects(p.data || [])
        setUsers(u.data || [])
      } catch { 
        console.error('Failed to load projects or users')
       }
    })()
  }, [])

  const canSubmit = useMemo(() => title.trim().length >= 3, [title])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true); setError('')
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        project: project || undefined,
        assignee: assignee || undefined,
        priority, status,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
      }
      const res = await api.post('/api/tasks/new-task', payload)
      window.location.assign(`/tasks/${res.data._id}`)
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to create task')
    } finally { setSubmitting(false) }
  }

  const reset = () => {
    setTitle(''); setDescription(''); setProject(''); setAssignee('')
    setPriority('medium'); setStatus('todo'); setStartDate(''); setDueDate('')
    setEstimatedHours(''); setError('')
  }

  return (
    <Page>
      <Title>New Task</Title>

      <FormCard as="section">
        <Form onSubmit={onSubmit}>
          <Label>
            Title *
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Short, action-oriented title"
              required
            />
            <Help>At least 3 characters.</Help>
          </Label>

          <Label>
            Description
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What’s the goal, scope, and acceptance criteria?"
            />
          </Label>

          <Group>
            <Label>
              Project
              <Select value={project} onChange={e => setProject(e.target.value)}>
                <option value="">— None —</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
              </Select>
            </Label>

            <Label>
              Assignee
              <Select value={assignee} onChange={e => setAssignee(e.target.value)}>
                <option value="">— Unassigned —</option>
                {users.map(u => <option key={u._id} value={u._id}>{u.name || u.email}</option>)}
              </Select>
            </Label>
          </Group>

          <Group>
            <Label>
              Priority
              <Select value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </Label>

            <Label>
              Status
              <Select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="blocked">Blocked</option>
                <option value="done">Done</option>
              </Select>
            </Label>
          </Group>

          <Group>
            <Label>
              Start date
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </Label>
            <Label>
              Due date
              <Input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </Label>
          </Group>

          <Group>
            <Label>
              Estimated hours
              <Input
                type="number" min="0" step="0.5"
                value={estimatedHours}
                onChange={e => setEstimatedHours(e.target.value)}
                placeholder="e.g., 8"
              />
            </Label>
            <div />
          </Group>

          <Error>{error}</Error>

          <Actions>
            <Button type="button" onClick={reset} disabled={submitting}>Clear</Button>
            <Primary type="submit" disabled={!canSubmit || submitting}>
              {submitting ? 'Creating…' : 'Create task'}
            </Primary>
          </Actions>
        </Form>
      </FormCard>
    </Page>
  )
}
