import styled from "styled-components"

export const Container = styled.div`

    margin-top: 1rem;

    table {
        width: 100%;
        border-spacing: 0 0.5rem;
    }

    th {
        color: var(--text-body);
        font-weight: 400;
        padding: 1rem 2rem;
        text-align: left;
        line-height: 1.5rem;
    }

    td {
        padding: 1rem 2rem;
        border: 0;
        background: var(--shape);
        color: var(--text-body);
        border-radius: 0.25rem;

        &:first-child {
            color: var(--text-title);
        }
    }

        @media screen and (max-width: 768px) {
            /* Estilos específicos para telas menores que 768 pixels de largura (celulares) */
            padding: 1.5rem 0.5rem;
        }
`