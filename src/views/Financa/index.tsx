import { Dashboard } from "./Dashboard";
import { Header } from "./Header";
import { GlobalStyle } from "../../styles/global";
import { FinancaProvider } from "../../contexts/FinancaContext";
import { DespesaContext, DespesaProvider } from "../../contexts/DespesaContext";

export function Financa() {
    return (
      <>
        <Header/>
        <FinancaProvider>
          <DespesaProvider>
            <Dashboard/>
            <GlobalStyle/>
          </DespesaProvider>
        </FinancaProvider>
      </>
    )
}


