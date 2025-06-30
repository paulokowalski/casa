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
          width: open ? drawerWidth : 72,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          background: 'rgba(140, 16, 206, 0.18)',
          backdropFilter: 'blur(16px)',
          borderRight: '1px solid rgba(140, 16, 206, 0.12)',
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '& .MuiDrawer-paper': {
            width: open ? drawerWidth : 72,
            background: 'rgba(140, 16, 206, 0.18)',
            backdropFilter: 'blur(16px)',
            borderRight: '1px solid rgba(140, 16, 206, 0.12)',
            boxShadow: '0 8px 32px rgba(44,62,80,0.10)',
            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            overflowX: 'hidden',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: open ? 'space-between' : 'center', px: 2, py: 2 }}>
          {open && (
            <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 1, color: theme.palette.primary.main }}>
              Kowalski
            </Typography>
          )}
          <IconButton onClick={() => setOpen(!open)} size="small" sx={{ ml: open ? 0 : 0 }}>
            {open ? <ChevronLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
        <List sx={{ mt: 2 }}>
          {navItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 1 }}>
              <ListItemButton
                component={Link}
                to={item.to}
                selected={location.pathname === item.to}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? 'initial' : 'center',
                  px: 2.5,
                  borderRadius: 3,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: location.pathname === item.to ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'none',
                  color: location.pathname === item.to ? '#fff' : theme.palette.text.primary,
                  boxShadow: location.pathname === item.to ? '0 4px 16px rgba(102, 126, 234, 0.18)' : 'none',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.08)',
                    color: theme.palette.primary.main,
                  },
                }}
              >
                <ListItemIcon sx={{
                  minWidth: 0,
                  mr: open ? 2 : 'auto',
                  justifyContent: 'center',
                  color: location.pathname === item.to ? '#fff' : theme.palette.primary.main,
                  fontSize: 24,
                  transition: 'color 0.3s',
                }}>
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0, fontWeight: 700 }} />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      {/* Conteúdo Principal */}
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, minHeight: '100vh', transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        {children}
      </Box>
    </Box>
  );
};
