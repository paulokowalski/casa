import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  List,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  useTheme,
  ListItemButton,
  Drawer,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PeopleIcon from '@mui/icons-material/People';
import SolarPowerIcon from '@mui/icons-material/SolarPower';
import HomeIcon from '@mui/icons-material/Home';
import { Link, useLocation } from 'react-router-dom';
import { colors } from '../../styles/colors';

const DRAWER_WIDTH = 260;

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, to: '/' },
  { text: 'Gestão de Cartão', icon: <AccountBalanceWalletIcon />, to: '/gestao-cartao' },
  { text: 'Energia Solar', icon: <SolarPowerIcon />, to: '/energia' },
  { text: 'Pessoas', icon: <PeopleIcon />, to: '/pessoa' },
];

const navButtonSx = (selected: boolean) => ({
  borderRadius: 1.5,
  mx: 1,
  mb: 0.5,
  color: selected ? colors.primary.main : colors.text.secondary,
  fontWeight: selected ? 600 : 500,
  background: selected ? colors.primary.subtle : 'transparent',
  borderLeft: selected ? `3px solid ${colors.primary.main}` : '3px solid transparent',
  '&:hover': {
    background: colors.primary.subtle,
    color: colors.text.primary,
  },
  py: 1.25,
  px: 2,
});

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleDrawerToggle = () => setDrawerOpen((open) => !open);

  const currentPage = navItems.find((item) => item.to === location.pathname);

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '100%' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 2.5,
          flexShrink: 0,
          borderBottom: `1px solid ${colors.border.default}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            borderRadius: 1.5,
            background: colors.primary.subtle,
            color: colors.primary.main,
          }}
        >
          <HomeIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: colors.text.primary, lineHeight: 1.2, letterSpacing: '-0.01em' }}
          >
            Kowalski House
          </Typography>
          <Typography variant="caption" sx={{ color: colors.text.muted }}>
            Gestão residencial
          </Typography>
        </Box>
      </Box>
      <List sx={{ px: 0.5, py: 2, flex: 1 }}>
        {navItems.map((item) => {
          const selected = location.pathname === item.to;
          return (
            <ListItemButton
              key={item.text}
              component={Link}
              to={item.to}
              selected={selected}
              onClick={() => isMobile && setDrawerOpen(false)}
              sx={navButtonSx(selected)}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 0, mr: 1.5, '& svg': { fontSize: 20 } }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{ color: 'inherit', '& .MuiTypography-root': { fontSize: '0.875rem', fontWeight: 'inherit' } }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  const mobileDrawerPaperSx = {
    boxSizing: 'border-box',
    width: DRAWER_WIDTH,
    height: '100vh',
    top: 0,
    background: colors.bg.paper,
    color: colors.text.primary,
    borderRight: `1px solid ${colors.border.default}`,
  };

  const sidebarSx = {
    display: { xs: 'none', md: 'flex' },
    flexDirection: 'column',
    width: DRAWER_WIDTH,
    flexShrink: 0,
    alignSelf: 'stretch',
    minHeight: '100vh',
    background: colors.bg.paper,
    color: colors.text.primary,
    borderRight: `1px solid ${colors.border.default}`,
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'stretch', minHeight: '100vh', background: theme.palette.background.default }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          background: colors.bg.paper,
          borderBottom: `1px solid ${colors.border.default}`,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar sx={{ minHeight: 60, px: { xs: 2, md: 3 } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1.5, color: colors.text.primary }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            sx={{
              fontWeight: isMobile ? 700 : 600,
              color: colors.text.primary,
              letterSpacing: '-0.01em',
              fontSize: isMobile ? '1.1rem' : '1rem',
            }}
          >
            {isMobile ? 'Kowalski House' : (currentPage?.text ?? 'Kowalski House')}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={sidebarSx}>
        {sidebarContent}
      </Box>

      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': mobileDrawerPaperSx,
        }}
      >
        {sidebarContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: { xs: 2, sm: 2, md: 3 },
          pt: { xs: 'calc(60px + 16px)', md: 'calc(60px + 24px)' },
          minHeight: '100vh',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
