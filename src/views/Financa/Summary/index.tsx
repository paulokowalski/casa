import { useContext } from "react";
import { Container } from "./styles";
import { FormatNumber } from '../../../functions/global';
import { FinancaContext } from "../../../contexts/FinancaContext";

export function Summary () {

    const { compras } = useContext(FinancaContext);

    const valorTotal = compras.reduce((acc, compra) => {
        return acc + compra.valorParcela;
    }, 0);

    const valorProximoMes = compras.reduce((acc, compra) => {
        if(compra.ultimaParcela === 'Não'){
            return acc + compra.valorParcela;
        }
        return acc;
    }, 0);

    const valorSaindo = valorTotal - valorProximoMes;

    return (
        <Container>
            <div className="highlight-background">
                <header>
                    <p>Total</p>
                </header>
                <strong>{FormatNumber(valorTotal as number)}</strong>
            </div>

            <div>
                <header>
                    <p>Valor Próximo Mês</p>
                </header>
                <strong>{FormatNumber(valorProximoMes as number)}</strong>
            </div>

            <div>
                <header>
                    <p>Valor Saindo</p>
                </header>
                <strong>- {FormatNumber(valorSaindo as number)}</strong>
            </div>
        </Container>
    )
}