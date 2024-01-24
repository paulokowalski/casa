import styled from "styled-components";

export const Container = styled.main`

    max-width: 2000px;
    margin: 0 auto;
    padding: 0rem 1rem;
    display: grid;
    grid-template-columns: repeat(4, 1fr);

    @media screen and (max-width: 768px) {
        /* Estilos específicos para telas menores que 768 pixels de largura (celulares) */
        padding: 1.5rem 0.5rem;
    }
`
