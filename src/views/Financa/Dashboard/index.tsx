import { Cadastro } from "../Cadastro";
import { Filtro } from "../Filtro";
import { Summary } from "../Summary";
import { TabelaTransacao } from "../TabelaTransacao";
import { Container } from "./styles";

export function Dashboard() {
    return (
        <Container>
            <Summary/>
            <Cadastro/>
            <Filtro/>
            <TabelaTransacao/>
        </Container>
    )
}