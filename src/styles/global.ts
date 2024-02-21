import { createGlobalStyle, styled } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
    :root {
        --background: #dae6f7;
        --red: #E52E4D;
        --blue: #5429cc;
        --green: #33cc95;

        --blue-light: #6933ff;

        --text-title: #393f5f;
        --text-body: #969cb3;

        --shape: #ffffff
    }

    body, input, textarea, button {
        font-family: 'Poppins', sans-serif;
        font-weight: 400;
    }

    h1, h2, h3, h4, h5, h6, strong {
        font-weight: 600;
    }

    html {
        @media (max-width: 1080px) {
            font-size: 93.75%
        }

        @media (max-width: 720px) {
            font-size: 87.5%
        }
    }

    body {
        background: var(--background);
        -webkit-font-smoothing: antialiased;
    }

    button {
        cursor: pointer;
    }

    [disabled] {
        opacity: 0.6;
        cursor: not-allowed;
    }
`

export const Container = styled.div`

    display: grid;
    gap: 2rem;
    padding: 20px;

    @media screen and (max-width: 768px) {
        /* Estilos específicos para telas menores que 768 pixels de largura (celulares) */
        padding: 1.5rem 0.5rem;
    }
    
`

export default Container