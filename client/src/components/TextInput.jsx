import styled from 'styled-components'
import { useId, useState } from 'react'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'

const Field = styled.label`
  display: grid; gap: 6px; font-size: 14px; color: var(--text);
`
const InputWrap = styled.div`
  position: relative;
`
const Icon = styled.span`
  position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
  font-size: 16px; color: var(--text-muted);
`
const BaseInput = styled.input`
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 10px 12px 10px 36px;
  outline: none; 
  background: var(--input-bg);
  color: var(--text);
  transition: box-shadow .15s ease, border-color .15s ease;
  
  &::placeholder {
    color: var(--text-muted);
  }
  
  &:focus { 
    border-color: var(--primary); 
    box-shadow: 0 0 0 3px var(--primary-light); 
  }
`
const Toggle = styled.button`
  position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
  border: 0; background: transparent; color: var(--text-secondary); padding: 0; display: grid; place-items: center;
  cursor: pointer;
  
  &:hover {
    color: var(--text);
  }
`
const Error = styled.div`
  color: var(--danger); font-size: 12px; min-height: 16px;
`

export function EmailInput({ label='Email', value, onChange, error }) {
  const id = useId()
  return (
    <Field htmlFor={id}>
      {label}
      <InputWrap>
        <Icon><FiMail /></Icon>
        <BaseInput id={id} type="email" value={value} onChange={onChange} placeholder="you@company.com" required />
      </InputWrap>
      <Error>{error}</Error>
    </Field>
  )
}

export function PasswordInput({ label='Password', value, onChange, error }) {
  const id = useId()
  const [show, setShow] = useState(false)
  return (
    <Field htmlFor={id}>
      {label}
      <InputWrap>
        <Icon><FiLock /></Icon>
        <BaseInput id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder="••••••••" required />
        <Toggle type="button" onClick={() => setShow(s => !s)} aria-label="toggle password">
          {show ? <FiEyeOff /> : <FiEye />}
        </Toggle>
      </InputWrap>
      <Error>{error}</Error>
    </Field>
  )
}
