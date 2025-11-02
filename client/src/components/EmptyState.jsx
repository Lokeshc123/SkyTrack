import styled from 'styled-components'

const Box = styled.div`
  padding: 40px; text-align: center; color: var(--muted);
`

export default function EmptyState({ children='No tasks found.' }) {
  return <Box>{children}</Box>
}
