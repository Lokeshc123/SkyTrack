import styled from 'styled-components'

const Label = styled.label`
  display: block;
  font-size: 14px;
  margin-bottom: 10px;
`
const Name = styled.span`
  color: var(--text);
  display: block;
  margin-bottom: 6px;
`
const InputWrap = styled.div``
const Error = styled.div`
  color: #dc2626;
  font-size: 12px;
  margin-top: 6px;
`

export default function Field({ label, error, children }) {
  return (
    <Label>
      <Name>{label}</Name>
      <InputWrap>{children}</InputWrap>
      {error && <Error>{error}</Error>}
    </Label>
  )
}
