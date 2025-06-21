import React from 'react';
import { Card, CardContent, Skeleton, Box, Typography } from '@mui/material';

interface LoadingCardProps {
  title?: string;
  variant?: 'default' | 'compact' | 'detailed';
  height?: number;
  width?: number | string;
}

export const LoadingCard: React.FC<LoadingCardProps> = ({
  title,
  variant = 'default',
  height = 260,
  width = '100%',
}) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'compact':
        return (
          <>
            <Skeleton variant="circular" width={36} height={36} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </>
        );
      
      case 'detailed':
        return (
          <>
            <Skeleton variant="circular" width={48} height={48} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={28} />
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="rounded" width="100%" height={32} sx={{ mt: 1 }} />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Skeleton variant="rounded" width={60} height={24} />
              <Skeleton variant="rounded" width={60} height={24} />
              <Skeleton variant="rounded" width={60} height={24} />
            </Box>
          </>
        );
      
      default:
        return (
          <>
            <Skeleton variant="circular" width={48} height={48} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={28} />
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="rounded" width="100%" height={32} sx={{ mt: 1 }} />
          </>
        );
    }
  };

  return (
    <Card
      sx={{
        minWidth: 300,
        maxWidth: 360,
        width,
        height,
        borderRadius: 2,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
      }}
    >
      {/* Efeito de shimmer */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent)',
          animation: 'shimmer 1.5s infinite',
          '@keyframes shimmer': {
            '0%': { left: '-100%' },
            '100%': { left: '100%' },
          },
        }}
      />
      
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        {title && (
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              color: '#4a5568',
              textAlign: 'center',
              fontWeight: 500,
            }}
          >
            {title}
          </Typography>
        )}
        {renderSkeleton()}
      </CardContent>
    </Card>
  );
}; 