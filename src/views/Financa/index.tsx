
import Container from "../../styles/global";
import { FinancaProvider } from "../../contexts/FinancaContext";
import { DespesaProvider } from "../../contexts/DespesaContext";
import { Summary } from "./Summary";
import { Cadastro } from "./Cadastro";
import { Filtro } from "./Filtro";
import { TabelaTransacao } from "./TabelaTransacao";
import styled from 'styled-components';
import GraficoPizza from "./GraficoPizza";

export function Financa() {

  interface HalfScreenProps {
    width?: string;
  }

  const HalfScreen = styled.div<HalfScreenProps>`
    padding: 0rem 0rem 1rem;
    width:  ${({ width }) => width || '50%'};
    height: 100%;
    float: left;
  `;

  // Define o componente principal da tela dividida
  const SplitScreen = styled.div`
    width: 100%;
    height: 100vh; /* Usar a altura total da janela de visualização */
  `;

    return (
      <FinancaProvider>
          <DespesaProvider>

            <Container>
                <Summary/>
                <Cadastro/>
                <Filtro/>

                <SplitScreen>
                  <HalfScreen width="70%">
                    <TabelaTransacao/>
                  </HalfScreen>
                  <HalfScreen width="30%">
                    <GraficoPizza/>
                  </HalfScreen>
                </SplitScreen>

            </Container>

          </DespesaProvider>
        </FinancaProvider>
    )
}


