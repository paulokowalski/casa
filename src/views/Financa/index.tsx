import { Dashboard } from "./Dashboard";
import { Header } from "./Header";
import { GlobalStyle } from "../../styles/global";
import { FinancaProvider } from "../../contexts/FinancaContext";

export function Financa() {
    return (
      <>
        <Header/>
        <FinancaProvider>
          <Dashboard/>
          <GlobalStyle/>
        </FinancaProvider>
      </>
    )
}


