import { useContext } from "react";
import { Container } from "./styles";
import { FormatNumber } from '../../../functions/global';
import { DespesaContext } from "../../../contexts/DespesaContext";

export function Summary () {

    const { despesa } = useContext(DespesaContext);

    return (
        <Container>
            <div className="highlight-background">
                <header>
                    <p>Total</p>
                </header>
                <strong>{FormatNumber(despesa?.valorMes as number)}</strong>
            </div>

            <div>
                <header>
                    <p>Valor Próximo Mês</p>
                </header>
                <strong>{FormatNumber(despesa?.valorProximoMes as number)}</strong>
            </div>

            <div>
                <header>
                    <p>Valor Saindo</p>
                </header>
                <strong>- {FormatNumber(despesa?.valorSaindo as number)}</strong>
            </div>
        </Container>
    )
}