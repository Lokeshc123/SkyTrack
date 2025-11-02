// src/components/Logo.jsx
import styled from 'styled-components'
import { AltivioWordmark } from '../assets/AltivioLogo'

const Click = styled.div`
  display: inline-flex; align-items: center; cursor: pointer; user-select: none;
`
export default function Logo({ size = 22, onClick }) {
  return (
    <Click onClick={onClick} title="Altivio">
      <AltivioWordmark size={size} />
    </Click>
  )
}
