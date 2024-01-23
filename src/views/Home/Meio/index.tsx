import { useContext } from "react";
import { GeracaoContext } from "../../../contexts/GeracaoContext";
import Card from "../../../components/Card/Card";

export function Meio() {

    const { geracao, geracaoMes } = useContext(GeracaoContext);

    const gridContainerStyle = {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gridGap: '10px', // Espaço entre as colunas
    };
  
  
    return (
      <>
      <div style={gridContainerStyle}>
        <div><Card title="Geração Atual" content={geracao?.geracao + ' kWh' || '0 kWh'}/></div>
        <div><Card title="Geração Mês" content={geracaoMes?.geracao + ' kWh' || '0 kWh'}/></div>
      </div>
      </>
    )

}