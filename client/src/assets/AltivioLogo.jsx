// src/assets/AltivioLogo.jsx
import styled from 'styled-components'

const Wrap = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  line-height: 1;
  svg { display: block; }
`
const Word = styled.span`
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial;
  font-weight: 700;
  font-size: ${({ $size }) => Math.round($size * 0.64)}px;
  color: ${({ $color }) => $color};
  transform: translateY(1px);
`

/** Props:
 *  - size (number) icon px
 *  - color, textColor (override if needed)
 *  - withText (bool)
 */
export default function AltivioLogo({
  size = 24,
  color = '#1d9bf0',
  textColor = '#0f172a',
  withText = true,
  style,
}) {
  return (
    <Wrap style={style}>
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Altivio">
        <path d="M44.5 50H22.5C16.149 50 11 44.851 11 38.5c0-5.149 3.322-9.51 7.93-11.067C20.41 20.9 26.02 17 32.5 17c7.18 0 13.2 4.84 14.96 11.4 3.71 1.35 6.04 4.79 6.04 8.6C53.5 45.077 49.077 50 44.5 50Z"
          stroke={color} strokeWidth="3" strokeLinejoin="round"/>
        <path d="M18.5 39.5c8.4 4.2 16.4 3.2 24-3l5.4-4.5" stroke={color} strokeWidth="5" strokeLinecap="round"/>
        <path d="M44.2 27.7l7.9 2-2.1 7.8-5.8-5.8z" fill={color}/>
        <path d="M41.8 50h7.2" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      </svg>

      {withText && <Word $size={size} $color={textColor}>Altivio</Word>}
    </Wrap>
  )
}

export function AltivioMark(props) { return <AltivioLogo {...props} withText={false} /> }
export function AltivioWordmark(props) { return <AltivioLogo {...props} withText /> }
