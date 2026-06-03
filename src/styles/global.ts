import { css } from '@emotion/react';
import { colors } from './colors';

export const globalStyles = css`
  html, body, #root {
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: 'Inter', 'Manrope', 'Roboto', Arial, sans-serif;
    background: ${colors.bg.default};
    color: ${colors.text.primary};
    transition: background 0.2s, color 0.2s;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
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
    background: ${colors.primary.subtle};
    color: ${colors.text.primary};
  }
  html[data-theme='light'], body[data-theme='light'], #root[data-theme='light'] {
    background: ${colors.bg.default};
    color: ${colors.text.primary};
  }
`;
