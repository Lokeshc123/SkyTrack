import styled from 'styled-components'

export const TableWrap = styled.div`
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--glass-shadow);
`

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
`

export const Thead = styled.thead`
  background: linear-gradient(180deg, rgba(248,250,252,0.75), rgba(241,245,249,0.9));
  th { text-align: left; padding: 12px; font-weight: 700; color: #0f172a; }
`

export const Tbody = styled.tbody`
  td { padding: 12px; border-top: 1px solid rgba(229,231,235,0.85); color:#0f172a; }
  tr:hover td { background: rgba(249,250,251,0.55); }
`

export const CellMuted = styled.span`color: var(--muted);`
