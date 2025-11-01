import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  :root {
    --bg: #f7f7fb;
    --text: #0f172a;
    --muted: #64748b;
    --card: #ffffff;
    --border: #e5e7eb;
    --primary: #111827;
    --primary-contrast: #ffffff;
  }

  * { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    margin: 0;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
    background: var(--bg);
    color: var(--text);
  }

  a { color: inherit; text-decoration: none; }
  button { font: inherit; }
  input, select, textarea { font: inherit; }
`

export default GlobalStyle
