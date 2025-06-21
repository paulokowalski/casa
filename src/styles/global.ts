import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    :root {
        --background-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        --card-background: rgba(255, 255, 255, 0.95);
        --text-primary: #1a202c;
        --text-secondary: #4a5568;
        --accent-blue: #667eea;
        --accent-purple: #764ba2;
        --success-color: #10b981;
        --error-color: #ef4444;
        --warning-color: #f59e0b;
        --info-color: #36d1dc;
    }

    * {
        box-sizing: border-box;
    }

    body, input, textarea, button {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        font-weight: 400;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    h1, h2, h3, h4, h5, h6, strong {
        font-weight: 600;
        color: var(--text-primary);
    }

    html {
        scroll-behavior: smooth;
        
        @media (max-width: 1080px) {
            font-size: 93.75%
        }

        @media (max-width: 720px) {
            font-size: 87.5%
        }
    }

    body {
        background: var(--background-gradient) !important;
        min-height: 100vh;
        margin: 0;
        padding: 0;
        overflow-x: hidden;
    }

    /* Scrollbar personalizada */
    ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    ::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
    }

    ::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.5) 0%, rgba(118, 75, 162, 0.5) 100%);
        border-radius: 4px;
        transition: background 0.3s ease;
    }

    ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%);
    }

    /* Animações globais */
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-30px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }

    /* Classes de animação */
    .fade-in-up {
        animation: fadeInUp 0.6s ease-out;
    }

    .fade-in {
        animation: fadeIn 0.4s ease-out;
    }

    .slide-in-left {
        animation: slideInLeft 0.5s ease-out;
    }

    .pulse {
        animation: pulse 2s infinite;
    }

    /* Efeitos de hover globais */
    .hover-lift {
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .hover-lift:hover {
        transform: translateY(-4px);
    }

    /* Glassmorphism */
    .glass {
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 16px;
    }

    /* Gradientes de texto */
    .gradient-text {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    button {
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    button:focus {
        outline: none;
    }

    [disabled] {
        opacity: 0.6;
        cursor: not-allowed;
    }

    /* Melhorias para inputs */
    input, textarea, select {
        font-family: inherit;
        transition: all 0.3s ease;
    }

    input:focus, textarea:focus, select:focus {
        outline: none;
    }

    /* Melhorias para links */
    a {
        text-decoration: none;
        color: inherit;
        transition: all 0.3s ease;
    }

    a:hover {
        color: var(--accent-blue);
    }

    /* Responsividade melhorada */
    @media (max-width: 768px) {
        .mobile-hidden {
            display: none !important;
        }
    }

    @media (min-width: 769px) {
        .desktop-hidden {
            display: none !important;
        }
    }

    /* Chips modernos */
    .modern-chip {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 6px;
        padding: 4px 12px;
        font-size: 0.75rem;
        font-weight: 600;
        box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
        transition: all 0.2s ease;
    }

    .modern-chip:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }
`