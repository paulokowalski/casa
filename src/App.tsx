import React from 'react';
import { Routes, Route } from "react-router-dom";
import { GlobalStyle } from "./styles/global";
import { Layout } from "./components/Layout";
import { Home } from "./views/Home";
import { GestaoCartao } from './views/GestaoCartao';
import PessoaView from './views/Pessoa';
import { Financa, FinancaProvider } from './views/Financa';
import { PessoaProvider } from './contexts/PessoaContext';

// ErrorBoundary simples
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    // Aqui você pode logar o erro em um serviço externo se quiser
    // console.error(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{padding: 32, textAlign: 'center'}}><h2>Ocorreu um erro inesperado.</h2><p>Tente recarregar a página.</p></div>;
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}

export default App;