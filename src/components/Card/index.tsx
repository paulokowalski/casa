import React from 'react';
import { Paper, Box, useTheme } from '@mui/material';
import { useThemeMode } from '../../contexts/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  gradient?: string;
  onClick?: () => void;
  className?: string;
  sx?: any;
}

export const Card: React.FC<CardProps> = ({
  children,
  gradient = 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
  onClick,
  className = '',
  sx = {},
}) => {
  const theme = useTheme();
  const { mode } = useThemeMode();

  const darkGradient = 'linear-gradient(135deg, #23263a 0%, #181a20 100%)';
  const appliedGradient = mode === 'dark' ? darkGradient : gradient;

  return (
    <Paper
      elevation={1}
      onClick={onClick}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        background: theme.palette.background.paper,
        boxShadow: '0 2px 8px rgba(44,62,80,0.04)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 120,
        '&:hover': {
          boxShadow: '0 2px 8px rgba(44,62,80,0.06)',
          transform: 'none',
        },
        ...sx,
      }}
      className={`system-card ${className}`}
    >
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        background: appliedGradient,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
      }} />
      <Box sx={{ 
        width: '100%', 
        flex: 1, 
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'stretch',
        py: 2,
      }}>
        {children}
      </Box>
    </Paper>
  );
};

const style = document.createElement('style');
style.innerHTML = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 40px, 0);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
`;
document.head.appendChild(style); 