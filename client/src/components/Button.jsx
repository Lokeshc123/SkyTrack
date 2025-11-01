import styled from 'styled-components'

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 10px 14px;
  background: var(--primary);
  color: var(--primary-contrast);
  cursor: pointer;
  transition: 0.15s ease;
  &:hover { opacity: 0.92; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

export default Button
