import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  CssBaseline, 
  useTheme, 
  ListItemButton,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import { Link, useLocation } from 'react-router-dom';
import { useFinanca } from '../../contexts/FinancaContext';

const drawerWidth = 240;

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const location = useLocation();

  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, to: '/' },
    { text: 'Finanças', icon: <MonetizationOnIcon />, to: '/financa' },
    { text: 'Gestão de Cartão', icon: <AccountBalanceWalletIcon />, to: '/gestao-cartao' },
    { text: 'Pessoas', icon: <PeopleIcon />, to: '/pessoa' },
  ];

  const { getDespesasProximasTodasPessoas } = useFinanca();
  const [despesasProximas, setDespesasProximas] = useState<any[]>([]);
  useEffect(() => {
    getDespesasProximasTodasPessoas().then(despesas => {
      setDespesasProximas(Array.isArray(despesas) ? despesas.filter((t: any) => !t.paga) : []);
    });
  }, [getDespesasProximasTodasPessoas]);

  // Estado do menu do sino
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: theme.palette.background.default }}>
      <CssBaseline />
      {/* Sidebar Premium */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : 80,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
          backdropFilter: 'blur(18px)',
          borderRight: 'none',
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 80,
            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            backdropFilter: 'blur(18px)',
            borderRight: 'none',
            boxShadow: '0 8px 32px rgba(44,62,80,0.18)',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            overflowX: 'hidden',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', px: 2, py: 2 }}>
          {open && (
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1, color: '#fff' }}>
              Kowalski
            </Typography>
          )}
          <IconButton onClick={() => setOpen(!open)} size="small" sx={{ ml: open ? 0 : 0, color: '#fff' }}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
        <List sx={{ mt: 2 }}>
          {navItems.map((item) => {
            const selected = location.pathname === item.to;
            return (
              <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 1 }}>
                <ListItemButton
                  component={Link}
                  to={item.to}
                  selected={selected}
                  sx={{
                    minHeight: 56,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    borderRadius: 3,
                    boxShadow: selected ? '0 4px 16px rgba(102, 126, 234, 0.25)' : 'none',
                    background: selected ? 'rgba(255,255,255,0.18)' : 'transparent',
                    color: selected ? '#fff' : 'rgba(255,255,255,0.85)',
                    fontWeight: selected ? 700 : 500,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'rgba(255,255,255,0.12)',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(102, 126, 234, 0.18)',
                    },
                  }}
                >
                  <ListItemIcon sx={{
                    minWidth: 0,
                    mr: open ? 2 : 'auto',
                    justifyContent: 'center',
                    color: selected ? '#fff' : 'rgba(255,255,255,0.7)',
                    fontSize: 30,
                    transition: 'color 0.3s',
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {open && (
                    <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0, fontWeight: selected ? 700 : 500, color: '#fff' }} />
                  )}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      {/* Header flutuante */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, background: 'rgba(255,255,255,0.95)', boxShadow: '0 2px 12px rgba(44,62,80,0.08)' }} elevation={2}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 64 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: theme.palette.primary.main, letterSpacing: 1 }}>
            Kowalski House
          </Typography>
          <Box>
            <Tooltip title="Notificações">
              <IconButton color="primary" onClick={handleOpenMenu}>
                <Badge badgeContent={despesasProximas.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleCloseMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Typography sx={{ px: 2, py: 1, fontWeight: 700 }}>Despesas próximas</Typography>
              <Divider />
              {despesasProximas.length === 0 && (
                <MenuItem disabled>Nenhuma despesa próxima não paga</MenuItem>
              )}
              {despesasProximas.map((d, idx) => (
                <MenuItem key={idx} sx={{ whiteSpace: 'normal', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{d.descricao}</Typography>
                    <Typography variant="body2" color="text.secondary">Valor: R$ {Number(d.valor).toFixed(2)}</Typography>
                    <Typography variant="caption" color="text.secondary">Vencimento: {d.data ? new Date(d.data).toLocaleDateString('pt-BR') : '-'}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      {/* Espaço para não sobrepor o conteúdo */}
      <Toolbar sx={{ minHeight: 64 }} />
      {/* Conteúdo Principal */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, minHeight: '100vh', transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        {children}
      </Box>
    </Box>
  );
};
