import styled from 'styled-components'

const Badge = styled.span`
  padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 700;
  color: ${({ $fg }) => $fg}; background: ${({ $bg }) => $bg};
  border: 1px solid ${({ $bd }) => $bd};
`

export default function Confidence({ value=0 }) {
  let bg = '#fee2e2', bd = '#fecaca', fg = '#991b1b'
  if (value >= 80) { bg='#ecfdf5'; bd='#a7f3d0'; fg='#065f46' }
  else if (value >= 50) { bg='#fffbeb'; bd='#fde68a'; fg='#92400e' }
  return <Badge $bg={bg} $bd={bd} $fg={fg}>{value}%</Badge>
}
