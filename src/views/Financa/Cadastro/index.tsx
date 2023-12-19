import { useContext, useState } from "react";
import { Container } from "./styles";
import { FinancaContext } from "../../../contexts/FinancaContext";

export function Cadastro() {

    const { cadastrarCompra } = useContext(FinancaContext);
    const [produto, setProduto] = useState('');
    const [valorProduto, setValorProduto] = useState('');
    const [dataCompra, setDataCompra] = useState('');
    const [parcela, setParcela] = useState('');
    const [pessoa, setPessoa] = useState('');
    const [cartao, setCartao] = useState('');

    function cadastraCompra(){
        cadastrarCompra(produto, valorProduto, dataCompra, parcela, pessoa, cartao);
    }

    return (
        <Container>
            <label>Produto:{' '}
                <input value={produto} onChange={e => setProduto(e.target.value)}/>
            </label>
            <label>Valor Compra:{' '}
                <input value={valorProduto} onChange={e => setValorProduto(e.target.value)}/>
            </label>
            <label>Data Compra:{' '}
                <input value={dataCompra} onChange={e => setDataCompra(e.target.value)} type="date"/>
            </label>
            <label>Parcelas:{' '}
                <input value={parcela} onChange={e => setParcela(e.target.value)}/>
            </label>
            <label>Pessoa:{' '}
                <input value={pessoa} onChange={e => setPessoa(e.target.value)}/>
            </label>
            <label>Cartão:{' '}
                <input value={cartao} onChange={e => setCartao(e.target.value)}/>
            </label>
            <button onClick={cadastraCompra}>Cadastrar</button>
        </Container>
    )
}