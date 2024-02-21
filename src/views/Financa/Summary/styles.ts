import styled from "styled-components";

export const Container = styled.div`

    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 2rem;

    @media screen and (max-width: 768px) {
        /* Estilos específicos para telas menores que 768 pixels de largura (celulares) */
        padding: 1.5rem 0.5rem;
    }
    
`