import styled from 'styled-components'

export const Bar = styled.div`
  display: flex; flex-wrap: wrap; gap: 10px;
  align-items: center; justify-content: space-between;
  margin-bottom: 14px;
`

export const Left = styled.div`display: flex; gap: 10px; align-items: center;`
export const Right = styled.div`display: flex; gap: 10px; align-items: center;`

export const Input = styled.input`
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.8);
  padding: 10px 12px; border-radius: 12px; min-width: 240px;
  backdrop-filter: blur(var(--glass-blur));
  &:focus { border-color:#94a3b8; box-shadow: 0 0 0 3px rgba(148,163,184,.25) }
`

export const Select = styled.select`
  border: 1px solid var(--border);
  background: rgba(255,255,255,0.8);
  padding: 10px 12px; border-radius: 12px;
  backdrop-filter: blur(var(--glass-blur));
  &:focus { border-color:#94a3b8; box-shadow: 0 0 0 3px rgba(148,163,184,.25) }
`

export const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: .2px;
  background: linear-gradient(90deg, #0f172a 0%, #1d4ed8 55%, #6d28d9 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
`
