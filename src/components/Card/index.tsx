import React from 'react';
import { Paper, Box } from '@mui/material';
import { colors, getCardSurfaceSx, resolveCardAccent } from '../../styles/colors';

interface CardProps {
  children: React.ReactNode;
  gradient?: string;
  onClick?: () => void;
  className?: string;
  sx?: any;
}

export const Card: React.FC<CardProps> = ({
  children,
  gradient = colors.primary.light,
  onClick,
  className = '',
  sx = {},
}) => {
  const accent = resolveCardAccent(gradient);

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: { xs: 2, md: 3 },
        borderRadius: 2,
        ...getCardSurfaceSx(accent.color),
        transition: 'box-shadow 0.2s, transform 0.2s, border-color 0.2s',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        minHeight: 120,
        '&:hover': onClick ? {
          boxShadow: '0 2px 4px rgba(15, 23, 42, 0.06), 0 8px 20px rgba(15, 23, 42, 0.08)',
          transform: 'translateY(-1px)',
        } : {},
        ...sx,
      }}
      className={`system-card ${className}`}
    >
      <Box sx={{
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
      }}>
        {children}
      </Box>
    </Paper>
  );
};
