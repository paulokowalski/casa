import { useContext } from "react";
import { FormatNumber } from '../../../functions/global';
import { DespesaContext } from "../../../contexts/DespesaContext";
import Card from "../../../components/Card/Card";
import { Container } from "./styles";

export function Summary () {

    const { despesa } = useContext(DespesaContext);

    return (
        <Container>
            <div><Card title="Total" content={FormatNumber(despesa?.valorMes as number)} className="highlight-background-green"/></div>
            <div><Card title="Valor Próximo Mês" content={FormatNumber(despesa?.valorProximoMes as number)} className="highlight-background-green"/></div>
            <div><Card title="Valor Saindo" content={FormatNumber(despesa?.valorSaindo as number)} className="highlight-background-red"/></div>
        </Container>
    )
}