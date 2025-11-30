import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import styled from 'styled-components'
import { FaChartLine } from 'react-icons/fa'
import api from '../lib/api'
import StatusBadge from '../components/StatusBadge'
import Confidence from '../components/Confidence'
import AssigneeSelect from '../components/AssigneeSelect'
import { useAuth } from '../context/AuthContext'


/* ===== Calm tokens ===== */
const SURFACE = '#ffffff'
const BORDER = '#e5e7eb'
const TEXT = '#0f172a'
const MUTED = '#64748b'
const SHADOW = '0 8px 24px rgba(2,6,23,0.06)'

/* ===== Layout ===== */
const Page = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  align-items: start;
  width: 100%;
  @media (max-width: 980px) { grid-template-columns: 1fr; }
`

/* ===== Card ===== */
const Card = styled.section`
  background: ${SURFACE};
  border: 1px solid ${BORDER};
  border-radius: 16px;
  box-shadow: ${SHADOW};
  padding: 20px;
`

/* ===== Typography ===== */
const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 24px;
  line-height: 1.2;
  font-weight: 800;
  color: ${TEXT};
`
const H3 = styled.h3`
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 800;
  color: ${TEXT};
`
const Sub = styled.div`
  color: ${MUTED};
  font-size: 14px;
`
const Section = styled.div`
  margin-top: 16px;
  color: ${TEXT};
  line-height: 1.6;
  white-space: pre-wrap;
`

/* ===== Meta / Chips ===== */
const MetaRow = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px;
  margin: 12px 0 6px;
`
const Chip = styled.span`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 10px;
  border: 1px solid ${BORDER};
  border-radius: 999px;
  background: #fff;
  color: ${TEXT};
  font-size: 12px; font-weight: 600;
`

/* ===== Form ===== */
const Form = styled.form`display: grid; gap: 12px;`
const Label = styled.label`display: grid; gap: 8px; font-size: 14px; color: ${TEXT};`
const Input = styled.input`
  border: 1px solid ${BORDER}; border-radius: 12px; padding: 10px 12px; background: #fff; color: ${TEXT};
  &:focus { outline: none; border-color: #94a3b8; box-shadow: 0 0 0 3px rgba(148,163,184,.25); }
`
const Textarea = styled.textarea`
  border: 1px solid ${BORDER}; border-radius: 12px; padding: 12px 14px; background: #fff; color: ${TEXT};
  resize: vertical; min-height: 110px;
  &:focus { outline: none; border-color: #94a3b8; box-shadow: 0 0 0 3px rgba(148,163,184,.25); }
`
const RangeRow = styled.div`display: grid; grid-template-columns: 1fr auto; gap: 12px; align-items: center;`
const Range = styled.input.attrs({ type: 'range', min: 0, max: 100, step: 1 })``
const Actions = styled.div`display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px;`
const Btn = styled.button`
  border: 1px solid ${BORDER}; background: #fff; color: ${TEXT}; border-radius: 12px; padding: 10px 16px;
  font-weight: 700; cursor: pointer; transition: background .15s ease, transform .15s ease;
  &:hover { background: #f8fafc; } &:active { transform: translateY(1px); }
`
const BtnPrimary = styled(Btn)`
  background: ${TEXT}; color: #fff; border-color: ${TEXT};
  &:hover { filter: brightness(1.05); }
`
const ErrorText = styled.div`color: #dc2626; font-size: 12px; min-height: 16px;`

/* ===== AI Insights ===== */
const InsightsCard = styled(Card)`margin-top: 16px;`
const Row = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 10px; @media (max-width: 640px){ grid-template-columns:1fr; }`
const Bullet = styled.li`margin-left: 18px;`

const RiskBadge = styled.span`
  display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; border-radius: 999px; font-weight: 700; font-size: 12px;
  color: ${({fg}) => fg}; background: ${({bg}) => bg}; border: 1px solid ${({bd}) => bd};
`

/* ===== Utils ===== */
const fmtDate = d => (d ? new Date(d).toLocaleDateString() : '—')
const daysBetween = (a, b) => Math.ceil((b - a) / (1000*60*60*24))

// computeInsights removed

/* ===== Component ===== */
export default function TaskDetails() {
  const { id } = useParams()
  const [task, setTask] = useState(null)
  const [note, setNote] = useState('')
  const [progress, setProgress] = useState('')
  const [blockers, setBlockers] = useState('')
  const [err, setErr] = useState('')
  const [aiAnalysis, setAiAnalysis] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        let item = null
        try {
          const r = await api.get(`/api/tasks/${id}`)
          item = r.data
        } catch {
          const r = await api.get('/api/tasks')
          item = r.data.find(t => t._id === id) || null
        }
        if (!cancelled) {
            setTask(item)
            if (item) {
                try {
                    const aiRes = await api.get(`/api/notifications/task-confidence/${id}`)
                    setAiAnalysis(aiRes.data)
                } catch (e) {
                    console.error("Failed to fetch AI analysis", e)
                }
            }
        }
      } catch {
        if (!cancelled) setTask(null)
      }
    })()
    return () => { cancelled = true }
  }, [id])

  const blockerPreview = useMemo(
    () => (blockers || '')
      .split(',').map(s => s.trim()).filter(Boolean).slice(0, 6),
    [blockers]
  )

  const submitUpdate = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      const payload = {
        task: id,
        note: note || undefined,
        progress: progress !== '' ? Number(progress) : undefined,
        blockers: blockers ? blockers.split(',').map(s => s.trim()).filter(Boolean) : undefined
      }
      const res = await api.post('/api/daily-updates/new-update', payload)
      setTask(res.data.task)
      setNote(''); setProgress(''); setBlockers('')
      
      // Refresh AI analysis
      const aiRes = await api.get(`/api/notifications/task-confidence/${id}`)
      setAiAnalysis(aiRes.data)
    } catch (error) {
      setErr(error?.response?.data?.error || 'Failed to post update')
    }
  }

  if (!task) return <div>Loading…</div>

  const getRiskColor = (risk) => {
      const colors = {
        Low:    { bg:'#ecfdf5', bd:'#a7f3d0', fg:'#065f46' },
        Medium: { bg:'#fffbeb', bd:'#fde68a', fg:'#92400e' },
        High:   { bg:'#fef2f2', bd:'#fecaca', fg:'#991b1b' },
        Critical: { bg:'#fef2f2', bd:'#fecaca', fg:'#991b1b' }
      }
      return colors[risk] || colors.Low
  }

  const riskColor = aiAnalysis ? getRiskColor(aiAnalysis.riskLevel) : getRiskColor('Low')

  return (
    <Page>
      {/* LEFT: Overview + AI insights */}
      <div>
        <Card>
          <Title>{task.title}</Title>

          <MetaRow>
            <StatusBadge status={task.status} />
            <Chip>Priority: <strong style={{ marginLeft:4, textTransform:'capitalize' }}>{task.priority}</strong></Chip>
            <Chip>Progress: <strong style={{ marginLeft:4 }}>{task.progress ?? 0}%</strong></Chip>
            <Chip>Due: <strong style={{ marginLeft:4 }}>{fmtDate(task.dueDate)}</strong></Chip>
            <Chip><Confidence value={aiAnalysis?.score ?? task.aiConfidence ?? 0} /></Chip>
          </MetaRow>

          <Sub>Project: {task.project?.name || '—'} · Assignee: {task.assignee?.name || 'You'}</Sub>

          <Section>{task.description || 'No description.'}</Section>
          
          <Link 
            to={`/tasks/${id}/journey`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 16,
              padding: '10px 16px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: 'white',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s'
            }}
          >
            <FaChartLine /> View Progress Journey
          </Link>
        </Card>

        {/* AI Insights */}
        {aiAnalysis && (
            <InsightsCard>
            <H3>AI Insights</H3>
            <Sub style={{ marginBottom: 8 }}>
                {aiAnalysis.analysis.progressDelta < 0 
                    ? `You are ${Math.abs(aiAnalysis.analysis.progressDelta)}% behind schedule.` 
                    : `You are on track.`}
                {' '}{aiAnalysis.analysis.daysRemaining} days remaining.
            </Sub>

            <Row>
                <div>
                <Sub style={{ marginBottom: 6 }}>Delivery risk</Sub>
                <RiskBadge bg={riskColor.bg} bd={riskColor.bd} fg={riskColor.fg}>
                    {aiAnalysis.riskLevel}
                </RiskBadge>
                <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none' }}>
                    <li style={{ color: MUTED, fontSize: 13, marginBottom: 4 }}>• Time Score: {aiAnalysis.factors.timeScore}/25</li>
                    <li style={{ color: MUTED, fontSize: 13, marginBottom: 4 }}>• Blocker Score: {aiAnalysis.factors.blockerScore}/25</li>
                </ul>
                </div>

                <div>
                <Sub style={{ marginBottom: 6 }}>Analysis</Sub>
                <Chip style={{ marginBottom: 6 }}>
                    {aiAnalysis.analysis.blockerCount} Blockers
                </Chip>
                <div style={{ color: MUTED, fontSize: 13 }}>Expected Progress: {aiAnalysis.analysis.expectedProgress}%</div>
                </div>
            </Row>

            <div style={{ marginTop: 10 }}>
                <Sub style={{ marginBottom: 6 }}>Recommendations</Sub>
                <ul style={{ margin: 0 }}>
                {aiAnalysis.recommendations.map((r, i) => <Bullet key={i}>{r.message}</Bullet>)}
                </ul>
            </div>
            </InsightsCard>
        )}
      </div>

      {/* RIGHT: Daily update */}
      <Card>
        <Title style={{ fontSize: 20, marginBottom: 4 }}>Daily update</Title>
        <Sub>(Markdown supported soon)</Sub>

        <Form onSubmit={submitUpdate}>
          <Label>
            What did you do today?
            <Textarea
              placeholder="E.g., Implemented API routes, wrote unit tests, verified edge cases…"
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={5}
            />
          </Label>

          <Label>
            Progress
            <RangeRow>
              <Range
                value={progress === '' ? (task.progress ?? 0) : progress}
                onChange={e => setProgress(e.target.value)}
              />
              <Chip>{progress === '' ? (task.progress ?? 0) : progress}%</Chip>
            </RangeRow>
          </Label>

          <Label>
            Blockers <span style={{ color: MUTED }}>(comma separated)</span>
            <Input
              placeholder="vpn down, waiting for review, missing API key"
              value={blockers}
              onChange={e => setBlockers(e.target.value)}
            />
          </Label>

          {blockerPreview.length > 0 && (
            <MetaRow>
              {blockerPreview.map((b, i) => <Chip key={i}>{b}</Chip>)}
            </MetaRow>
          )}

          <ErrorText>{err}</ErrorText>

          <Actions>
            <Btn type="button" onClick={() => { setNote(''); setProgress(''); setBlockers(''); }}>
              Clear
            </Btn>
            <BtnPrimary type="submit">Submit update</BtnPrimary>
          </Actions>
        </Form>
      </Card>
    </Page>
  )
}

