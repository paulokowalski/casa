import styled from "styled-components";

export const Container = styled.div`
    max-width: 2000px;
    margin: 0 auto;
    padding: 2.5rem 0rem;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2rem;

    input {
        padding: 1.0rem 1rem;
        border-radius: 0.25rem;
    }

    @media screen and (max-width: 768px) {
        /* Estilos específicos para telas menores que 768 pixels de largura (celulares) */
        padding: 1.5rem 0.5rem;
    }
`