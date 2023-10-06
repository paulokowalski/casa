import styled from "styled-components";

export const Container = styled.header`
    background-color: var(--blue);
`

export const Content = styled.div`
    max-width: 2000px;
    margin: 0 auto;

    padding: 0 1rem 5rem;
    display: flex;
    justify-content: space-between;

    h1 {
        color: var(--shape);
    }

    button {
        font-size: 1rem;
        color: #fff;
        background: var(--blue-light);
        border: 0;
        padding: 0 2rem;
        border-radius: 0.25rem;
        height: 3rem;

        transition: filter 0.2;

        &.hover {
            filter: brightness(0.9);
        }
    }
`