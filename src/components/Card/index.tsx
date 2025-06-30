import React from 'react';
import { Paper, Box, Typography, Icon, Chip } from '@mui/material';

interface CardProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  gradient?: string;
  children: React.ReactNode;
  badge?: string;
  badgeColor?: 'success' | 'error' | 'warning' | 'info';
  onClick?: () => void;
  className?: string;
  sx?: any;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  icon,
  gradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  children,
  badge,
  badgeColor = 'info',
  onClick,
  className = '',
  sx = {},
}) => {
  const badgeColors = {
    success: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
    error: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
    warning: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
    info: 'linear-gradient(135deg, #36d1dc 0%, #5bdbff 100%)',
  };

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        p: { xs: 1.5, md: 2.5 },
        borderRadius: 0.5,
        background: 'rgba(255, 255, 255, 0.18)',
        border: '1.5px solid rgba(130, 10, 209, 0.22)',
        boxShadow: '0 8px 32px rgba(130, 10, 209, 0.18)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          transform: onClick ? 'translateY(-2px)' : 'none',
          boxShadow: onClick ? '0 16px 48px rgba(130, 10, 209, 0.22)' : '0 8px 32px rgba(130, 10, 209, 0.18)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: gradient,
        },
        ...sx,
      }}
      className={`fade-in-up ${className}`}
    >
      {/* Header do Card */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 3,
        gap: 2
      }}>
        {icon && (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: 48,
            height: 48,
            borderRadius: 2,
            background: gradient,
            boxShadow: '0 4px 15px rgba(102, 126, 234, 0.25)',
          }}>
            <Icon sx={{ color: '#ffffff', fontSize: 24 }}>
              {icon}
            </Icon>
          </Box>
        )}
        
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                color: '#1a202c',
              }}
            >
              {title}
            </Typography>
            {badge && (
              <Chip 
                label={badge}
                size="small"
                sx={{
                  background: badgeColors[badgeColor],
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  height: 20,
                }}
              />
            )}
          </Box>
          {description && (
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#4a5568',
                fontSize: '0.875rem',
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Conteúdo do Card */}
      <Box>
        {children}
      </Box>
    </Paper>
  );
}; 