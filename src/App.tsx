import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { LinearProgress } from '@mui/material';
import { Layout } from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PessoaProvider } from './contexts/PessoaContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginView } from './views/Login';

const Home = lazy(() => import('./views/Home').then((m) => ({ default: m.Home })));
const GestaoCartao = lazy(() => import('./views/GestaoCartao').then((m) => ({ default: m.GestaoCartao })));
const GestaoFinanceira = lazy(() => import('./views/GestaoFinanceira').then((m) => ({ default: m.GestaoFinanceira })));
const Energia = lazy(() => import('./views/Energia').then((m) => ({ default: m.EnergiaWithProvider })));
const Pessoas = lazy(() => import('./views/Pessoa').then((m) => ({ default: m.PessoaView })));

function RotaProtegida() {
  const { usuario } = useAuth();
  const location = useLocation();
  if (!usuario) return <Navigate to="/login" replace state={{ de: location.pathname }} />;
  return (
    <PessoaProvider key={usuario.id}>
      <Layout>
        <Suspense fallback={<LinearProgress aria-label="Carregando página" />}>
          <Outlet />
        </Suspense>
      </Layout>
    </PessoaProvider>
  );
}

function SoAdmin({ children }: Readonly<{ children: ReactNode }>) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route element={<RotaProtegida />}>
            <Route path="/" element={<Home />} />
            <Route path="/gestao-cartao" element={<GestaoCartao />} />
            <Route path="/gestao-financeira" element={<GestaoFinanceira />} />
            <Route path="/energia" element={<Energia />} />
            <Route
              path="/pessoa"
              element={
                <SoAdmin>
                  <Pessoas />
                </SoAdmin>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
}
