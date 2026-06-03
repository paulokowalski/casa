import React from 'react';
import { Card, CardContent, Skeleton, Box, Typography } from '@mui/material';
import { colors, getCardSurfaceSx } from '../../styles/colors';

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
            <Skeleton variant="circular" width={36} height={36} sx={{ mb: 1, bgcolor: colors.cardAccents.blue.iconBg }} />
            <Skeleton variant="text" width="60%" height={24} sx={{ bgcolor: colors.bg.elevated }} />
            <Skeleton variant="text" width="40%" height={20} sx={{ bgcolor: colors.bg.elevated }} />
          </>
        );

      case 'detailed':
        return (
          <>
            <Skeleton variant="circular" width={48} height={48} sx={{ mb: 1, bgcolor: colors.cardAccents.blue.iconBg }} />
            <Skeleton variant="text" width="80%" height={28} sx={{ bgcolor: colors.bg.elevated }} />
            <Skeleton variant="text" width="60%" height={20} sx={{ bgcolor: colors.bg.elevated }} />
            <Skeleton variant="rounded" width="100%" height={32} sx={{ mt: 1, bgcolor: colors.bg.elevated }} />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Skeleton variant="rounded" width={60} height={24} sx={{ bgcolor: colors.bg.elevated }} />
              <Skeleton variant="rounded" width={60} height={24} sx={{ bgcolor: colors.bg.elevated }} />
              <Skeleton variant="rounded" width={60} height={24} sx={{ bgcolor: colors.bg.elevated }} />
            </Box>
          </>
        );

      default:
        return (
          <>
            <Skeleton variant="circular" width={48} height={48} sx={{ mb: 1, bgcolor: colors.cardAccents.blue.iconBg }} />
            <Skeleton variant="text" width="80%" height={28} sx={{ bgcolor: colors.bg.elevated }} />
            <Skeleton variant="text" width="60%" height={20} sx={{ bgcolor: colors.bg.elevated }} />
            <Skeleton variant="rounded" width="100%" height={32} sx={{ mt: 1, bgcolor: colors.bg.elevated }} />
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
        ...getCardSurfaceSx(colors.primary.main),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
        {title && (
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: colors.text.secondary,
              textAlign: 'center',
              fontWeight: 500,
              fontSize: '1rem',
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
