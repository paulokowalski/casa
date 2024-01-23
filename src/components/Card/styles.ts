import styled from "styled-components";

export const Container = styled.div`

    display: grid;
    gap: 2rem;

    div {
        background: var(--shape);
        border-radius: 0.25rem;
        color: var(--text-title);
        width: 400px;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

        header {
            display: flex;
            align-items: center;
            justity-content: space-between;
        }

        strong {
            display: block;
            margint-top: 1rem;
            font-size: 2rem;
            font-weight: 500;
            line-height: 3rem;
        }

        &.highlight-background-red {
            background: var(--red);
            color: #fff;
        }

        &.highlight-background {
            background: var(--green);
            color: #fff;
        }
    }

        @media screen and (max-width: 768px) {
            /* Estilos específicos para telas menores que 768 pixels de largura (celulares) */
            padding: 1.5rem 0.5rem;
        }
    
`