import { Routes, Route } from "react-router-dom";
import { GlobalStyle } from "./styles/global";
import { Layout } from "./components/Layout";
import { Home } from "./views/Home";
import { GestaoCartao } from './views/GestaoCartao';
import PessoaView from './views/Pessoa';
import { Financa, FinancaProvider } from './views/Financa';
import { PessoaProvider } from './contexts/PessoaContext';

function App() {
  return (
    <PessoaProvider>
      <GlobalStyle/>
      <FinancaProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/financa" element={<Financa />} />
            <Route path="/gestao-cartao" element={<GestaoCartao />} />
            <Route path="/pessoa" element={<PessoaView />} />
          </Routes>
        </Layout>
      </FinancaProvider>
    </PessoaProvider>
  )
}

export default App;