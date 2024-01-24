import styled from "styled-components";

export const Container = styled.div`
    max-width: 2000px;
    margin: 0 auto;
    padding: 2.5rem 1rem;
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2rem;

    /* Estilo para o botão */
    .button {
        background-color: #4CAF50; /* Color de fondo */
        border: none; /* Sin borde */
        color: white; /* Color del texto */
        padding: 10px 20px; /* Relleno interno */
        text-align: center; /* Alineación del texto */
        text-decoration: none; /* Sin decoración de texto */
        display: inline-block; /* Mostrar como elemento en línea */
        font-size: 16px; /* Tamaño de fuente */
        margin: 4px 2px; /* Márgenes externos */
        cursor: pointer; /* Cursor tipo puntero al pasar el ratón */
        border-radius: 4px; /* Bordes redondeados */
    }

    /* Estilo para realçar o botão quando está em foco */
    .button:focus {
        outline: none;
        box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    }

    /* Estilo para o botão quando hover */
    .button:hover {
        background-color: #0056b3;
    }

    /* Estilos básicos para o container do input */
    .input-container {
      display: flex;
      flex-direction: column;
      margin-bottom: 16px;
    }
    
    /* Estilo para o rótulo (label) do input */
    .label {
      margin-bottom: 8px;
      font-weight: bold;
    }
    
    /* Estilo para o input text */
    .input-text {
      padding: 8px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 4px;
      outline: none;
    }
    
    /* Estilo para realçar o input quando está em foco */
    .input-text:focus {
      border-color: #007bff;
      box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
    }
    
    @media screen and (max-width: 768px) {
        /* Estilos específicos para telas menores que 768 pixels de largura (celulares) */
        padding: 1.5rem 0.5rem;
    }
`