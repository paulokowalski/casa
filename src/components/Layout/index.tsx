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
import ViewListIcon from '@mui/icons-material/ViewList';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import SolarPowerIcon from '@mui/icons-material/SolarPower';
import { Link, useLocation } from 'react-router-dom';
import { useFinanca } from '../../contexts/FinancaContext';

const drawerWidth = 240;
const collapsedDrawerWidth = 80;

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(true);
  const theme = useTheme();
  const location = useLocation();

  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, to: '/' },
    { text: 'Finanças', icon: <MonetizationOnIcon />, to: '/financa' },
    { text: 'Gestão de Cartão', icon: <AccountBalanceWalletIcon />, to: '/gestao-cartao' },
    { text: 'Energia Solar', icon: <SolarPowerIcon />, to: '/energia' },
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

  const currentWidth = collapsed ? collapsedDrawerWidth : drawerWidth;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: theme.palette.background.default }}>
      <CssBaseline />
      {/* Sidebar Dark - Completamente Fixo */}
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: currentWidth,
          background: 'linear-gradient(135deg, #23263a 0%, #181a20 100%)',
          backdropFilter: 'blur(18px)',
          borderRight: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          zIndex: 1200,
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', px: 2, py: 2 }}>
          {!collapsed && (
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1, color: '#f5f6fa' }}>
              Kowalski
            </Typography>
          )}
          <Tooltip title={collapsed ? "Expandir menu" : "Recolher menu"}>
            <IconButton 
              onClick={() => setCollapsed(!collapsed)} 
              size="small" 
              sx={{ color: '#f5f6fa' }}
            >
              {collapsed ? <ViewListIcon /> : <ViewModuleIcon />}
            </IconButton>
          </Tooltip>
        </Box>
        <List sx={{ mt: 2 }}>
          {navItems.map((item) => {
            const selected = location.pathname === item.to;
            return (
              <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 1 }}>
                <Tooltip title={collapsed ? item.text : ""} placement="right">
                  <ListItemButton
                    component={Link}
                    to={item.to}
                    selected={selected}
                    sx={{
                      minHeight: 56,
                      justifyContent: collapsed ? 'center' : 'initial',
                      px: collapsed ? 2 : 2.5,
                      borderRadius: 3,
                      boxShadow: selected ? '0 4px 16px rgba(139, 92, 246, 0.25)' : 'none',
                      background: selected ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                      color: selected ? '#f5f6fa' : 'rgba(245, 246, 250, 0.85)',
                      fontWeight: selected ? 700 : 500,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: 'rgba(139, 92, 246, 0.1)',
                        color: '#f5f6fa',
                        boxShadow: '0 2px 8px rgba(139, 92, 246, 0.18)',
                      },
                    }}
                  >
                    <ListItemIcon sx={{
                      minWidth: 0,
                      mr: collapsed ? 0 : 2,
                      justifyContent: 'center',
                      color: selected ? '#f5f6fa' : 'rgba(245, 246, 250, 0.7)',
                      fontSize: 30,
                      transition: 'color 0.3s',
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    {!collapsed && (
                      <ListItemText primary={item.text} sx={{ fontWeight: selected ? 700 : 500, color: '#f5f6fa' }} />
                    )}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>
      </Box>
      {/* Header Dark */}
      <AppBar position="fixed" sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1, 
        background: 'rgba(35, 38, 58, 0.95)', 
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        left: currentWidth,
        width: `calc(100% - ${currentWidth}px)`,
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }} elevation={0}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 64 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#f5f6fa', letterSpacing: 1 }}>
            Kowalski House
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notificações">
              <IconButton sx={{ color: '#f5f6fa' }} onClick={handleOpenMenu}>
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
              PaperProps={{
                sx: {
                  background: '#23263a',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }
              }}
            >
              <Typography sx={{ px: 2, py: 1, fontWeight: 700, color: '#f5f6fa' }}>Despesas próximas</Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
              {despesasProximas.length === 0 && (
                <MenuItem disabled sx={{ color: 'rgba(245, 246, 250, 0.5)' }}>Nenhuma despesa próxima não paga</MenuItem>
              )}
              {despesasProximas.map((d, idx) => (
                <MenuItem key={idx} sx={{ whiteSpace: 'normal', alignItems: 'flex-start', color: '#f5f6fa' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#f5f6fa' }}>{d.descricao}</Typography>
                    <Typography variant="body2" sx={{ color: 'rgba(245, 246, 250, 0.7)' }}>Valor: R$ {Number(d.valor).toFixed(2)}</Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(245, 246, 250, 0.5)' }}>Vencimento: {d.data ? new Date(d.data).toLocaleDateString('pt-BR') : '-'}</Typography>
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
      <Box component="main" sx={{ 
        flexGrow: 1, 
        p: { xs: 2, sm: 3, md: 4 }, 
        minHeight: '100vh', 
        marginLeft: `${currentWidth}px`,
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {children}
      </Box>
    </Box>
  );
};
