import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PessoaProvider } from './contexts/PessoaContext';

// Cada tela é carregada sob demanda (o app abre mais rápido)
const Home = lazy(() => import('./views/Home').then((m) => ({ default: m.Home })));
const GestaoCartao = lazy(() => import('./views/GestaoCartao').then((m) => ({ default: m.GestaoCartao })));
const GestaoFinanceira = lazy(() => import('./views/GestaoFinanceira').then((m) => ({ default: m.GestaoFinanceira })));
const Energia = lazy(() => import('./views/Energia').then((m) => ({ default: m.EnergiaWithProvider })));
const Pessoas = lazy(() => import('./views/Pessoa').then((m) => ({ default: m.PessoaView })));

export default function App() {
  return (
    <ErrorBoundary>
      <PessoaProvider>
        <Layout>
          <Suspense fallback={<LinearProgress aria-label="Carregando página" />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/gestao-cartao" element={<GestaoCartao />} />
              <Route path="/gestao-financeira" element={<GestaoFinanceira />} />
              <Route path="/energia" element={<Energia />} />
              <Route path="/pessoa" element={<Pessoas />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </PessoaProvider>
    </ErrorBoundary>
  );
}
