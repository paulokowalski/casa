import { Routes, Route } from "react-router-dom";
import { GlobalStyle } from "./styles/global";
import { Layout } from "./components/Layout";
import { Home } from "./views/Home";
import { GestaoCartao } from './views/Financa';
import PessoaView from './views/Pessoa';

function App() {
  return (
    <>
      <GlobalStyle/>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gestao-cartao" element={<GestaoCartao />} />
          <Route path="/pessoa" element={<PessoaView />} />
        </Routes>
      </Layout>
    </>
  )
}

export default App;