import styled from 'styled-components'

const GlassCard = styled.div`
  display: grid; grid-template-columns: 1fr 260px; gap: 0;
  background: var(--glass-bg);
  border: 1px solid var(--border);
  backdrop-filter: blur(var(--glass-blur));
  border-radius: 20px; overflow: hidden;
  box-shadow: var(--glass-shadow);
  @media (max-width: 820px) { grid-template-columns: 1fr; }
`
export const Pane = styled.div`
  padding: 22px;
  &:last-child {
    background: linear-gradient(140deg, var(--primary-light) 0%, rgba(139, 92, 246, 0.1) 100%);
    border-left: 1px solid var(--border);
    display: grid; place-items: center;
  }
`
export default GlassCard
