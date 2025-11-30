import { useEffect, useState } from 'react'
import styled from 'styled-components'

const Box = styled.div`
  position: fixed; right: 18px; bottom: 18px; z-index: 60;
  background:#0f172a; color:#fff; padding:12px 14px; border-radius:12px;
  box-shadow:0 12px 30px rgba(2,6,23,.18); font-weight:700; font-size:14px;
`

export default function Toast({ text, show, onDone, duration=1800 }) {
  const [open, setOpen] = useState(show)
  useEffect(() => { if (show) { setOpen(true); const t=setTimeout(()=>{setOpen(false); onDone?.()}, duration); return ()=>clearTimeout(t) }}, [show])
  if (!open) return null
  return <Box>{text}</Box>
}
