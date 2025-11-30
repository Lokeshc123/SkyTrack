import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  :root, html, .light-mode {
    --bg: #f8fafc;
    --surface: #f8fafc;
    --surface-alt: #f1f5f9;
    --surface-hover: #e2e8f0;
    --surface-secondary: #ffffff;
    --border: #e2e8f0;
    --border-light: #f1f5f9;
    --text: #0f172a;
    --text-secondary: #475569;
    --text-muted: #64748b;
    --muted: #94a3b8;
    --primary: #3b82f6;
    --primary-hover: #2563eb;
    --primary-light: #eff6ff;
    --shadow: rgba(0, 0, 0, 0.08);
    --shadow-strong: rgba(0, 0, 0, 0.12);
    --card: #ffffff;
    --card-hover: #f8fafc;
    --input-bg: #ffffff;
    --input-border: #d1d5db;
    
    /* Status colors */
    --success: #10b981;
    --success-bg: #ecfdf5;
    --warning: #f59e0b;
    --warning-bg: #fffbeb;
    --danger: #ef4444;
    --danger-bg: #fef2f2;
    --info: #3b82f6;
    --info-bg: #eff6ff;
    
    /* glass tokens */
    --glass-bg: rgba(255,255,255,0.85);
    --glass-blur: 12px;
    --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    --glass-border: rgba(255, 255, 255, 0.5);
  }

  html.dark-mode, .dark-mode {
    --bg: #0a0a0f;
    --surface: #12121a;
    --surface-alt: #1a1a24;
    --surface-hover: #22222e;
    --surface-secondary: #16161e;
    --border: #2a2a3a;
    --border-light: #3a3a4a;
    --text: #f0f0f5;
    --text-secondary: #a0a0b0;
    --text-muted: #707080;
    --muted: #606070;
    --primary: #5b8def;
    --primary-hover: #7ba3f7;
    --primary-light: rgba(91, 141, 239, 0.15);
    --shadow: rgba(0, 0, 0, 0.4);
    --shadow-strong: rgba(0, 0, 0, 0.6);
    --card: #16161e;
    --card-hover: #1e1e28;
    --input-bg: #1a1a24;
    --input-border: #3a3a4a;
    
    /* Status colors - slightly muted for dark mode */
    --success: #34d399;
    --success-bg: rgba(52, 211, 153, 0.12);
    --warning: #fbbf24;
    --warning-bg: rgba(251, 191, 36, 0.12);
    --danger: #f87171;
    --danger-bg: rgba(248, 113, 113, 0.12);
    --info: #60a5fa;
    --info-bg: rgba(96, 165, 250, 0.12);
    
    /* glass tokens */
    --glass-bg: rgba(18, 18, 26, 0.9);
    --glass-blur: 12px;
    --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    --glass-border: rgba(255, 255, 255, 0.08);
  }

  * { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body {
    margin: 0;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
    color: var(--text);
    background: var(--bg);
    transition: background-color 0.2s ease, color 0.2s ease;
  }
  
  /* Scrollbar styling for dark mode */
  html.dark-mode ::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  html.dark-mode ::-webkit-scrollbar-track {
    background: var(--surface);
  }
  html.dark-mode ::-webkit-scrollbar-thumb {
    background: var(--border-light);
    border-radius: 5px;
  }
  html.dark-mode ::-webkit-scrollbar-thumb:hover {
    background: var(--muted);
  }

  a { color: inherit; text-decoration: none; }
  button, input, select, textarea { font: inherit; }
  
  /* Input styling for dark mode */
  html.dark-mode input, 
  html.dark-mode select, 
  html.dark-mode textarea {
    background: var(--input-bg);
    border-color: var(--input-border);
    color: var(--text);
  }
  
  html.dark-mode input::placeholder,
  html.dark-mode textarea::placeholder {
    color: var(--text-muted);
  }
  
  html.dark-mode input:focus,
  html.dark-mode select:focus,
  html.dark-mode textarea:focus {
    border-color: var(--primary);
    outline: none;
    box-shadow: 0 0 0 3px var(--primary-light);
  }
`
export default GlobalStyle
