import { useState } from 'react';
import { Avatar, Box, Divider, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Typography } from '@mui/material';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import { useUsuario, useAuth } from '../../contexts/AuthContext';
import { palette } from '../../styles/tokens';

const iniciais = (nome: string) =>
  nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

function AvatarUsuario({ nome, size = 32 }: Readonly<{ nome: string; size?: number }>) {
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: '0.75rem',
        fontWeight: 600,
        bgcolor: palette.brand[100],
        color: palette.brand[700],
      }}
    >
      {iniciais(nome)}
    </Avatar>
  );
}

export function UsuarioMenu({ variante }: Readonly<{ variante: 'sidebar' | 'compacto' }>) {
  const usuario = useUsuario();
  const { sair } = useAuth();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const papel = usuario.isAdmin ? 'Administrador' : usuario.email;

  if (variante === 'sidebar') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.25,
          p: 1.25,
          borderRadius: 2,
          bgcolor: palette.sidebar.active,
        }}
      >
        <AvatarUsuario nome={usuario.nome} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography noWrap sx={{ color: '#fff', fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.3 }}>
            {usuario.nome}
          </Typography>
          <Typography noWrap sx={{ color: palette.sidebar.textMuted, fontSize: '0.75rem' }}>
            {papel}
          </Typography>
        </Box>
        <Tooltip title="Sair">
          <IconButton
            aria-label="Sair"
            onClick={sair}
            size="small"
            sx={{ color: palette.sidebar.textMuted, '&:hover': { color: '#fff' } }}
          >
            <LogoutRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <>
      <Tooltip title={usuario.nome}>
        <IconButton
          aria-label={`Conta de ${usuario.nome}`}
          aria-haspopup="menu"
          onClick={(e) => setAnchor(e.currentTarget)}
          sx={{ p: 0.5 }}
        >
          <AvatarUsuario nome={usuario.nome} />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ px: 2, py: 1, maxWidth: 260 }}>
          <Typography sx={{ fontWeight: 600 }} noWrap>
            {usuario.nome}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {papel}
          </Typography>
        </Box>
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchor(null);
            sair();
          }}
        >
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          Sair
        </MenuItem>
      </Menu>
    </>
  );
}
