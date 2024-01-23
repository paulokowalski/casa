import { Dashboard } from "./Dashboard";
import { GlobalStyle } from "../../styles/global";
import { FinancaProvider } from "../../contexts/FinancaContext";
import { DespesaProvider } from "../../contexts/DespesaContext";

export function Financa() {
    return (
      <FinancaProvider>
          <DespesaProvider>
            <Dashboard/>
            <GlobalStyle/>
          </DespesaProvider>
        </FinancaProvider>
    )
}


