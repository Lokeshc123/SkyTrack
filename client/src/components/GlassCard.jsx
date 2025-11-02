import styled from 'styled-components'

const GlassCard = styled.div`
  display: grid; grid-template-columns: 1fr 260px; gap: 0;
  background: rgba(255,255,255,0.7);
  border: 1px solid rgba(229,231,235,0.9);
  backdrop-filter: blur(8px);
  border-radius: 20px; overflow: hidden;
  box-shadow: 0 18px 40px rgba(2,6,23,0.15);
  @media (max-width: 820px) { grid-template-columns: 1fr; }
`
export const Pane = styled.div`
  padding: 22px;
  &:last-child {
    background: linear-gradient(140deg, #eef2ff 0%, #fdf2f8 100%);
    border-left: 1px solid rgba(229,231,235,0.9);
    display: grid; place-items: center;
  }
`
export default GlassCard
