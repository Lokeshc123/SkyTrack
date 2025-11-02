import styled from 'styled-components'

const Pill = styled.span`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600;
  color: ${({ $c }) => $c.fg};
  background: ${({ $c }) => $c.bg};
  border: 1px solid ${({ $c }) => $c.bd};
`

function palette(status) {
  switch (status) {
    case 'done':        return { bg:'#ecfdf5', bd:'#a7f3d0', fg:'#065f46' }
    case 'in_progress': return { bg:'#eff6ff', bd:'#bfdbfe', fg:'#1e40af' }
    case 'blocked':     return { bg:'#fef2f2', bd:'#fecaca', fg:'#991b1b' }
    case 'todo':
    default:            return { bg:'#f8fafc', bd:'#e2e8f0', fg:'#334155' }
  }
}

export default function StatusBadge({ status='todo' }) {
  const c = palette(status)
  const label = status.replace('_', ' ')
  return <Pill $c={c}>{label}</Pill>
}
