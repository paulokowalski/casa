import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Paper,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import { layout, palette } from '../../styles/tokens';
import { useAuth } from '../../contexts/AuthContext';
import { findNavItem, navegacao, type NavItem, type NavSection } from './navigation';
import { UsuarioMenu } from './UsuarioMenu';

const isActive = (pathname: string, to: string) => (to === '/' ? pathname === '/' : pathname.startsWith(to));

function Logo({ compact }: Readonly<{ compact?: boolean }>) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0 }}>
      <Box
        aria-hidden="true"
        sx={{
          width: 32,
          height: 32,
          borderRadius: 2,
          bgcolor: palette.brand[600],
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <HomeRoundedIcon sx={{ fontSize: 19 }} />
      </Box>
      {!compact && (
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem', color: '#fff', lineHeight: 1.2 }}>
            Kowalski House
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: palette.sidebar.textMuted }}>Gestão residencial</Typography>
        </Box>
      )}
    </Box>
  );
}

function Sidebar({ pathname, sections }: Readonly<{ pathname: string; sections: NavSection[] }>) {
  return (
    <Box
      component="nav"
      aria-label="Menu principal"
      sx={{
        position: 'fixed',
        inset: '0 auto 0 0',
        width: layout.sidebarWidth,
        bgcolor: palette.sidebar.bg,
        px: 1.5,
        py: 2.5,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        zIndex: (t) => t.zIndex.drawer,
      }}
    >
      <Box sx={{ px: 1.5, pb: 1.5 }}>
        <Logo />
      </Box>
      {sections.map((section) => (
        <Box key={section.label} component="section" aria-label={section.label}>
          <Typography
            component="h2"
            sx={{
              px: 1.5,
              pt: 2,
              pb: 0.75,
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: palette.sidebar.textMuted,
            }}
          >
            {section.label}
          </Typography>
          {section.items.map((item) => {
            const active = isActive(pathname, item.to);
            return (
              <Box
                key={item.to}
                component={NavLink}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  height: 40,
                  px: 1.5,
                  mb: 0.25,
                  borderRadius: 2,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: active ? '#fff' : palette.sidebar.text,
                  bgcolor: active ? palette.sidebar.active : 'transparent',
                  '& svg': { fontSize: 20, color: active ? palette.sidebar.accent : 'inherit' },
                  '&:hover': { bgcolor: active ? palette.sidebar.active : palette.sidebar.hover, color: '#fff' },
                  '&:focus-visible': { outline: `2px solid ${palette.sidebar.accent}`, outlineOffset: 2 },
                }}
              >
                {item.icon}
                {item.label}
              </Box>
            );
          })}
        </Box>
      ))}
      <Box sx={{ mt: 'auto', pt: 2 }}>
        <UsuarioMenu variante="sidebar" />
      </Box>
    </Box>
  );
}

function Rail({ pathname, items }: Readonly<{ pathname: string; items: NavItem[] }>) {
  return (
    <Box
      component="nav"
      aria-label="Menu principal"
      sx={{
        position: 'fixed',
        inset: '0 auto 0 0',
        width: layout.railWidth,
        bgcolor: palette.sidebar.bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.75,
        py: 2,
        zIndex: (t) => t.zIndex.drawer,
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Logo compact />
      </Box>
      {items.map((item) => {
        const active = isActive(pathname, item.to);
        return (
          <Tooltip key={item.to} title={item.label} placement="right">
            <Box
              component={NavLink}
              to={item.to}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: active ? palette.sidebar.accent : palette.sidebar.text,
                bgcolor: active ? palette.sidebar.active : 'transparent',
                '& svg': { fontSize: 22 },
                '&:hover': { bgcolor: palette.sidebar.hover, color: '#fff' },
                '&:focus-visible': { outline: `2px solid ${palette.sidebar.accent}`, outlineOffset: 2 },
              }}
            >
              {item.icon}
            </Box>
          </Tooltip>
        );
      })}
      <Box sx={{ mt: 'auto' }}>
        <UsuarioMenu variante="compacto" />
      </Box>
    </Box>
  );
}

function MobileChrome({ pathname, items }: Readonly<{ pathname: string; items: NavItem[] }>) {
  const current = findNavItem(items, pathname);
  const value = items.findIndex((i) => i === current);
  return (
    <>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
      >
        <Toolbar sx={{ minHeight: `${layout.mobileTopBarHeight}px !important`, gap: 1.25, px: 2 }}>
          <Box
            aria-hidden="true"
            sx={{
              width: 30,
              height: 30,
              borderRadius: 2,
              bgcolor: palette.brand[600],
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HomeRoundedIcon sx={{ fontSize: 18 }} />
          </Box>
          <Typography component="p" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Kowalski House
          </Typography>
          <Box sx={{ ml: 'auto' }}>
            <UsuarioMenu variante="compacto" />
          </Box>
        </Toolbar>
      </AppBar>
      <Paper
        component="nav"
        aria-label="Navegação"
        square
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          borderTop: 1,
          borderColor: 'divider',
          pb: 'env(safe-area-inset-bottom)',
          zIndex: (t) => t.zIndex.appBar,
        }}
      >
        <BottomNavigation showLabels value={value} sx={{ height: layout.bottomNavHeight }}>
          {items.map((item) => (
            <BottomNavigationAction
              key={item.to}
              component={NavLink}
              to={item.to}
              label={item.shortLabel}
              icon={item.icon}
              sx={{
                minWidth: 0,
                px: 0.5,
                '& .MuiBottomNavigationAction-label': { fontSize: '0.6875rem', fontWeight: 500, mt: 0.25 },
                '& .Mui-selected': { fontWeight: 600 },
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </>
  );
}

export function Layout({ children }: Readonly<{ children: ReactNode }>) {
  const theme = useTheme();
  const { pathname } = useLocation();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAdmin } = useAuth();
  const { sections, items } = navegacao(isAdmin);

  const offset = isDesktop ? layout.sidebarWidth : isMobile ? 0 : layout.railWidth;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {isDesktop ? (
        <Sidebar pathname={pathname} sections={sections} />
      ) : isMobile ? (
        <MobileChrome pathname={pathname} items={items} />
      ) : (
        <Rail pathname={pathname} items={items} />
      )}
      <Box
        component="main"
        sx={{
          ml: `${offset}px`,
          px: { xs: 2, sm: 3, lg: 4 },
          pt: isMobile ? `${layout.mobileTopBarHeight + 16}px` : { sm: 3, lg: 4 },
          pb: isMobile ? `calc(${layout.bottomNavHeight + 24}px + env(safe-area-inset-bottom))` : 5,
          minWidth: 0,
        }}
      >
        <Box sx={{ maxWidth: layout.contentMaxWidth, mx: 'auto' }}>{children}</Box>
      </Box>
    </Box>
  );
}
