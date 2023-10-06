import styled from "styled-components";

export const Container = styled.div`
    max-width: 2000px;
    margin: 0 auto;
    padding: 2.5rem 0rem;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;

    select {
        padding: 1.5rem 2rem;
        border-radius: 0.25rem;
    }
`