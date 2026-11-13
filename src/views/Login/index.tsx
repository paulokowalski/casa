import { useState, type FormEvent } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import { useAuth } from '../../contexts/AuthContext';
import { palette } from '../../styles/tokens';

const DESTAQUES = [
  'Cartão, contas e renda separados por pessoa',
  'Energia solar compartilhada com a casa',
  'A sessão expira sozinha depois de algumas horas',
];

export function LoginView() {
  const { usuario, aviso, entrar } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const destino = (location.state as { de?: string } | null)?.de ?? '/';
  if (usuario) return <Navigate to={destino} replace />;

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !senha) {
      setErro('Informe o e-mail e a senha.');
      return;
    }
    setEnviando(true);
    setErro(null);
    try {
      await entrar(email, senha);
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível entrar.');
      setSenha('');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          bgcolor: palette.sidebar.bg,
          color: palette.sidebar.text,
          px: { xs: 3, md: 6 },
          py: { xs: 3, md: 6 },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            aria-hidden="true"
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: palette.brand[600],
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HomeRoundedIcon sx={{ fontSize: 21 }} />
          </Box>
          <Typography sx={{ fontWeight: 700, color: '#fff' }}>Kowalski House</Typography>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', gap: 3, maxWidth: 420 }}>
          <Typography component="p" sx={{ color: '#fff', fontSize: '2rem', fontWeight: 700, lineHeight: 1.2 }}>
            Suas finanças da casa, só para você.
          </Typography>
          <Box
            component="ul"
            sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 1.25 }}
          >
            {DESTAQUES.map((d) => (
              <Box component="li" key={d} sx={{ display: 'flex', gap: 1.25, color: palette.sidebar.textMuted }}>
                <CheckRoundedIcon sx={{ fontSize: 18, mt: '2px', color: palette.sidebar.accent }} />
                {d}
              </Box>
            ))}
          </Box>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'block' } }} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 3, py: { xs: 4, md: 6 } }}>
        <Box
          component="form"
          noValidate
          onSubmit={enviar}
          sx={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
          <Box>
            <Typography component="h1" variant="h5" sx={{ fontWeight: 700 }}>
              Entrar
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Use o e-mail cadastrado em Pessoas.
            </Typography>
          </Box>

          {(erro || aviso) && (
            <Alert severity={erro ? 'error' : 'info'} role="alert">
              {erro ?? aviso}
            </Alert>
          )}

          <TextField
            id="login-email"
            label="E-mail"
            type="email"
            autoComplete="username"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <TextField
            id="login-senha"
            label="Senha"
            type={mostrarSenha ? 'text' : 'password'}
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={() => setMostrarSenha((v) => !v)}
                      edge="end"
                    >
                      {mostrarSenha ? <VisibilityOffOutlinedIcon /> : <VisibilityOutlinedIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button type="submit" variant="contained" size="large" disabled={enviando}>
            {enviando ? <CircularProgress size={22} color="inherit" aria-label="Entrando" /> : 'Entrar'}
          </Button>
          <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            Esqueceu a senha? Peça ao administrador para definir uma nova.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
