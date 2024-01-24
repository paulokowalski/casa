import styled from "styled-components";

export const Container = styled.header`
    background-color: var(--blue);
`

export const Content = styled.div`
    
    margin: 0 auto;

    padding: 2200 1rem 1rem;
    display: flex;
    justify-content: space-between;

    h1 {
        padding-left: 20px;
        color: var(--shape);
    }

    @media screen and (max-width: 768px) {
        /* Estilos específicos para telas menores que 768 pixels de largura (celulares) */
        padding: 1.5rem 0.5rem;
    }
`