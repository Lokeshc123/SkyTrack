import styled from 'styled-components'

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 10px 14px;
  background: var(--primary);
  color: white;
  font-weight: 600;
  transition: 0.18s ease;
  cursor: pointer;

  &:hover { 
    background: var(--primary-hover); 
    transform: translateY(-1px); 
  }
  &:active { transform: translateY(0); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`

export default Button
