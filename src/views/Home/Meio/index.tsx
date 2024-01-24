import { useContext } from "react";
import { GeracaoContext } from "../../../contexts/GeracaoContext";
import Card from "../../../components/Card/Card";
import { Container } from "./styles";

export function Meio() {

    const { geracao, geracaoMes } = useContext(GeracaoContext);

    const gridContainerStyle = {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridGap: '10px', // Espaço entre as colunas
    };
  
  
    return (
      <Container>
        <div><Card title="Geração Atual" content={geracao?.geracao + ' kWh' || '0 kWh'} className="highlight-background-green"/></div>
        <div><Card title="Geração Mês" content={geracaoMes?.geracao + ' kWh' || '0 kWh'} className="highlight-background-green"/></div>
      </Container>
    )

}