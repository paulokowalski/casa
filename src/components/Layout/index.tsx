import React, { useState } from 'react';
import {
  Box,
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
  Drawer,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import SolarPowerIcon from '@mui/icons-material/SolarPower';
import { Link, useLocation } from 'react-router-dom';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, to: '/' },
    { text: 'Gestão de Cartão', icon: <AccountBalanceWalletIcon />, to: '/gestao-cartao' },
    { text: 'Energia Solar', icon: <SolarPowerIcon />, to: '/energia' },
    { text: 'Pessoas', icon: <PeopleIcon />, to: '/pessoa' },
  ];

  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleDrawerToggle = () => setDrawerOpen((open) => !open);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: theme.palette.background.default }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: 'rgba(35, 38, 58, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
        width: '100%',
        left: 0,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }} elevation={0}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: 64 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#f5f6fa', letterSpacing: 1 }}>
              Kowalski House
            </Typography>
          </Box>
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {navItems.map((item) => {
                const selected = location.pathname === item.to;
                return (
                  <ListItemButton
                    key={item.text}
                    component={Link}
                    to={item.to}
                    selected={selected}
                    sx={{
                      borderRadius: 2,
                      color: selected ? '#f5f6fa' : 'rgba(245, 246, 250, 0.85)',
                      fontWeight: selected ? 700 : 500,
                      background: selected ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                      '&:hover': {
                        background: 'rgba(139, 92, 246, 0.1)',
                        color: '#f5f6fa',
                      },
                      px: 2,
                      py: 1,
                      minWidth: 120,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <ListItemIcon sx={{ color: selected ? '#f5f6fa' : 'rgba(245, 246, 250, 0.7)', minWidth: 0, mr: 1 }}>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} sx={{ color: 'inherit', fontWeight: selected ? 700 : 500 }} />
                  </ListItemButton>
                );
              })}
            </Box>
          )}
          <Box />
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 240,
            background: 'linear-gradient(135deg, #23263a 0%, #181a20 100%)',
            color: '#f5f6fa',
          },
        }}
      >
        <Toolbar />
        <List>
          {navItems.map((item) => {
            const selected = location.pathname === item.to;
            return (
              <ListItemButton
                key={item.text}
                component={Link}
                to={item.to}
                selected={selected}
                onClick={handleDrawerToggle}
                sx={{
                  borderRadius: 2,
                  color: selected ? '#f5f6fa' : 'rgba(245, 246, 250, 0.85)',
                  fontWeight: selected ? 700 : 500,
                  background: selected ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                  '&:hover': {
                    background: 'rgba(139, 92, 246, 0.1)',
                    color: '#f5f6fa',
                  },
                  px: 2,
                  py: 1,
                  minWidth: 120,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <ListItemIcon sx={{ color: selected ? '#f5f6fa' : 'rgba(245, 246, 250, 0.7)', minWidth: 0, mr: 1 }}>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} sx={{ color: 'inherit', fontWeight: selected ? 700 : 500 }} />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>
      <Toolbar sx={{ minHeight: 64 }} />
      <Box component="main" sx={{
        flexGrow: 1,
        p: { xs: 2, sm: 3, md: 4 },
        minHeight: '100vh',
        width: '100%',
        marginLeft: 0,
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        {children}
      </Box>
    </Box>
  );
};
