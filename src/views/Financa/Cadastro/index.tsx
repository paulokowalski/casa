import { useContext, useState } from "react";
import { Container } from "./styles";
import { FinancaContext } from "../../../contexts/FinancaContext";
import InputText from "../../../components/InputText";

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
            <InputText label="Produto" value={produto} onChange={e => setProduto(e.target.value)} type="text"></InputText>
            <InputText label="Valor Compra:" value={valorProduto} onChange={e => setValorProduto(e.target.value)} type="text"></InputText>
            <InputText label="Data Compra:" value={dataCompra} onChange={e => setDataCompra(e.target.value)} type="date"></InputText>
            <InputText label="Parcelas:" value={parcela} onChange={e => setParcela(e.target.value)} type="text"></InputText>
            <InputText label="Pessoa:" value={pessoa} onChange={e => setPessoa(e.target.value)} type="text"></InputText>
            <InputText label="Cartão:" value={cartao} onChange={e => setCartao(e.target.value)} type="text"></InputText>
            <button className="button" onClick={cadastraCompra}>Cadastrar</button>
        </Container>
    )
}