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

const drawerWidth = 280;

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(true);
  const theme = useTheme();
  const location = useLocation();

  const handleDrawerToggle = () => setOpen((prev) => !prev);

  const navItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardIcon />, 
      to: '/',
      description: 'Visão geral do sistema'
    },
    {
      text: 'Finanças',
      icon: <MonetizationOnIcon />,
      to: '/financa',
      description: 'Controle de receitas e despesas'
    },
    { 
      text: 'Gestão de Cartão', 
      icon: <AccountBalanceWalletIcon />, 
      to: '/gestao-cartao',
      description: 'Gestão de cartões e transações'
    },
    {
      text: 'Pessoas',
      icon: <PeopleIcon />,
      to: '/pessoa',
      description: 'Cadastro de pessoas'
    },
  ];

  const { getDespesasProximasTodasPessoas } = useFinanca();
  const [despesasProximas, setDespesasProximas] = useState<any[]>([]);
  useEffect(() => {
    getDespesasProximasTodasPessoas().then(setDespesasProximas);
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
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* AppBar Moderna */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="toggle drawer"
              onClick={handleDrawerToggle}
              edge="start"
              sx={{ 
                mr: 2,
                color: '#1a202c',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.1)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {open ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
            
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{ 
                color: '#1a202c',
                textDecoration: 'none', 
                cursor: 'pointer',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
                transition: 'transform 0.3s ease',
              }}
            >
              Kowalski House
            </Typography>
          </Box>

          {/* Área de ações do usuário */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notificações">
              <IconButton
                sx={{ 
                  color: '#1a202c',
                  '&:hover': {
                    background: 'rgba(102, 126, 234, 0.1)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                onClick={handleOpenMenu}
              >
                <Badge badgeContent={despesasProximas.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                PaperProps={{ sx: { minWidth: 320 } }}
              >
                <MenuItem disabled>
                  <ListItemText primary="Despesas próximas do vencimento" />
                </MenuItem>
                <Divider />
                {despesasProximas.length > 0 ? (
                  [...despesasProximas]
                    .sort((a, b) => {
                      const dataA = Array.isArray(a.data)
                        ? new Date(a.data[0], a.data[1] - 1, a.data[2])
                        : new Date(a.data);
                      const dataB = Array.isArray(b.data)
                        ? new Date(b.data[0], b.data[1] - 1, b.data[2])
                        : new Date(b.data);
                      return dataA.getTime() - dataB.getTime();
                    })
                    .map((t, idx) => (
                      <MenuItem key={t.id || idx}>
                        <ListItemText
                          primary={`${t.pessoaNome}: ${t.descricao}`}
                          secondary={`Valor: R$ ${t.valor.toFixed(2)} | Vencimento: ${Array.isArray(t.data) ? `${String(t.data[2]).padStart(2, '0')}/${String(t.data[1]).padStart(2, '0')}/${t.data[0]}` : new Date(t.data).toLocaleDateString('pt-BR')}`}
                        />
                      </MenuItem>
                    ))
                ) : (
                  <MenuItem disabled>
                    <ListItemText primary="Nenhuma despesa próxima do vencimento." />
                  </MenuItem>
                )}
              </Menu>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      {/* Drawer Moderno */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          display: open ? 'block' : 'none',
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRight: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#1a202c',
            zIndex: theme.zIndex.drawer,
            top: 0,
            height: '100vh',
          },
        }}
      >
        {/* Navegação */}
        <Box sx={{ p: 2, mt: 8 }}>
          <Typography 
            variant="overline" 
            sx={{ 
              color: '#4a5568', 
              fontWeight: 600, 
              letterSpacing: 1,
              mb: 2,
              display: 'block',
            }}
          >
            Navegação
          </Typography>
          <List sx={{ p: 0 }}>
            {navItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
                <ListItemButton
                  component={Link}
                  to={item.to}
                  selected={location.pathname === item.to}
                  onClick={() => setOpen(false)}
                  sx={{
                    borderRadius: 2,
                    mx: 1,
                    minHeight: 36,
                    py: 0.5,
                    px: 1.5,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                      transform: 'translateX(6px)',
                    },
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#ffffff',
                      boxShadow: '0 4px 16px rgba(102, 126, 234, 0.18)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: '#ffffff',
                      },
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      minWidth: 28,
                      color: location.pathname === item.to ? '#ffffff' : '#667eea',
                      fontSize: 18,
                      mr: 1,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <Box>
                    <ListItemText 
                      primary={item.text} 
                      primaryTypographyProps={{
                        fontWeight: location.pathname === item.to ? 600 : 500,
                        fontSize: '0.95rem',
                        lineHeight: 1.1,
                      }}
                    />
                    <ListItemText 
                      secondary={item.description}
                      secondaryTypographyProps={{
                        fontSize: '0.7rem',
                        color: location.pathname === item.to ? 'rgba(255,255,255,0.8)' : '#4a5568',
                        lineHeight: 1.1,
                      }}
                    />
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
      {/* Conteúdo Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          mt: 8,
          width: '100%',
          minHeight: '100vh',
          transition: 'margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          ml: open ? `${drawerWidth}px` : 0,
          background: 'transparent',
          position: 'relative',
          zIndex: 1,
        }}
        className="fade-in"
      >
        {children}
      </Box>
    </Box>
  );
};
