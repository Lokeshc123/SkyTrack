import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  :root {
    --text: #0f172a;
    --muted: #64748b;
    --border: rgba(226, 232, 240, 0.9);

    /* glass tokens */
    --glass-bg: rgba(255,255,255,0.82);
    --glass-blur: 10px;
    --glass-shadow: 0 22px 48px rgba(2, 6, 23, 0.12);

    /* gradient tokens */
    --g1: #e8eefc;   /* soft blue */
    --g2: #f8e8ff;   /* soft pink */
    --bg-grad:
      radial-gradient(1100px 600px at 90% -10%, var(--g1) 0%, transparent 60%),
      radial-gradient(1000px 600px at -10% 120%, var(--g2) 0%, transparent 60%),
      #f6f7fb; /* base */
  }

  * { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    margin: 0;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
    color: var(--text);
    background: var(--bg-grad);   /* <<< gradient everywhere */
  }

  a { color: inherit; text-decoration: none; }
  button, input, select, textarea { font: inherit; }
`
export default GlobalStyle
