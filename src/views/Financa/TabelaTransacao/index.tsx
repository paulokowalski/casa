import { useContext } from "react";
import { FinancaContext } from "../../../contexts/FinancaContext";
import Tabela from "../../../components/Tabela";

export function TabelaTransacao () {

    const { compras, removerCompra } = useContext(FinancaContext);

    const handleRemoverCompra = (id:any) => {
        removerCompra(id);
    };

    const COLUNAS = [
        { name: 'Compra', field: 'nomeCompra'},
        { name: 'Data da Parcela', field: 'dataParcela', tipo: 'data' },
        { name: 'Número da Parcela', field: 'numeroParcela' },
        { name: 'Número Total de Parcelas', field: 'numeroTotalParcela' },
        { name: 'Última Parcela ?', field: 'ultimaParcela', tipo: 'ultimaParcela' },
        { name: 'Cartão', field: 'nomeCartao' },
        { name: 'Valor da Parcela', field: 'valorParcela', tipo: 'numero' },
        { name: 'Valor Faltante', field: 'valorFaltante', tipo: 'numero'  },
        { name: '', tipo: 'btnRemover', onAction: handleRemoverCompra }
    ]

    return (   
        <Tabela columns={COLUNAS} data={compras}></Tabela>
    )
}