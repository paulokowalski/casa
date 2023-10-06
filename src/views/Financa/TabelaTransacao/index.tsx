import { useContext } from "react";
import { Container } from "./styles";
import { DateFormat, FormatNumber } from '../../../functions/global';
import { FinancaContext } from "../../../contexts/FinancaContext";

export function TabelaTransacao () {

    const { compras } = useContext(FinancaContext);

    return (
        <Container>
            <table>
                <thead>
                    <tr>
                        <th>Compra</th>
                        <th>Data da Parcela</th>
                        <th>Valor da Parcela</th>
                        <th>Número da Parcela</th>
                        <th>Número Total de Parcelas</th>
                        <th>Última Parcela ?</th>
                        <th>Nome do Cartão</th>
                        <th>Valor Faltante</th>
                        <th>Valor Total</th>
                        <th>Pessoa</th>
                    </tr>
                </thead>
                <tbody>
                {compras?.map((row, index) =>
                    <tr>
                        <td>{row.nomeCompra}</td>
                        <td>{DateFormat(row.dataParcela)}</td>
                        <td>{FormatNumber(row.valorParcela)}</td>
                        <td>{row.numeroParcela}</td>
                        <td>{row.numeroTotalParcela}</td>
                        <td>{row.ultimaParcela}</td>
                        <td>{row.nomeCartao}</td>
                        <td>{FormatNumber(row.valorFaltante)}</td>
                        <td>{FormatNumber(row.valorTotal)}</td>
                        <td>{row.nomePessoa}</td>
                    </tr>
                )}
                </tbody>
            </table>
        </Container>
    )
}