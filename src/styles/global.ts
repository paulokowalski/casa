import { css } from '@emotion/react';

export const globalStyles = css`
  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: 'Manrope', 'Inter', 'Roboto', Arial, sans-serif;
    background: linear-gradient(120deg, #820AD1 0%, #271A45 60%, #FF5F6D 100%);
    color: #1a202c;
    transition: background 0.3s, color 0.3s;
  }
  *, *::before, *::after {
    box-sizing: border-box;
  }
  a {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s;
  }
  button, input, select, textarea {
    font-family: inherit;
  }
  ::selection {
    background: #667eea22;
  }
  [data-theme='dark'] {
    background: linear-gradient(120deg, #271A45 0%, #820AD1 100%);
    color: #f5f6fa;
  }
`;