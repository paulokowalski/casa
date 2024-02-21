import { useContext } from "react";
import { GeracaoContext } from "../../../contexts/GeracaoContext";
import Card from "../../../components/Card";
import { Container } from "./styles";

export function Meio() {

    const { geracao, geracaoMes } = useContext(GeracaoContext);

    const gridContainerStyle = {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridGap: '10px', // Espaço entre as colunas
    };
  
  
    return (
      <></>
    )

}