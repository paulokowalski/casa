import { useContext } from "react";
import { FormatNumber } from '../../../functions/global';
import { DespesaContext } from "../../../contexts/DespesaContext";
import { Container } from "./styles";
import CardPeronalizado from "../../../components/Card";

export function Summary () {

    const { despesa } = useContext(DespesaContext);
    return (
        <Container>
            <CardPeronalizado title="Total" content={FormatNumber(despesa?.valorMes as number)} backGroundColor="green-300"/>
            <CardPeronalizado title="Valor Proximo Mês" content={FormatNumber(despesa?.valorProximoMes as number)} backGroundColor="blue-300"/>
            <CardPeronalizado title="Valor Saindo" content={FormatNumber(despesa?.valorSaindo as number)} backGroundColor="blue-300"/>
            <CardPeronalizado title="Valor Parcela Saindo" content={FormatNumber(despesa?.valorParcelaSaindo as number)} backGroundColor="blue-300"/>
            <CardPeronalizado title="Valor Total Saindo" content={FormatNumber(despesa?.valorSaindoTotal as number)} backGroundColor="red-400"/>
        </Container>
    )
}