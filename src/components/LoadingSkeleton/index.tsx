import React from 'react';
import { Box, Skeleton, Paper } from '@mui/material';

interface LoadingSkeletonProps {
  variant?: 'card' | 'table' | 'summary';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  variant = 'card', 
  count = 1 
}) => {
  const renderCardSkeleton = () => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Skeleton 
          variant="circular" 
          width={56} 
          height={56}
          sx={{
            background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.1) 25%, rgba(118, 75, 162, 0.1) 50%, rgba(102, 126, 234, 0.1) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Skeleton 
            variant="text" 
            width="60%" 
            height={32}
            sx={{
              background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.1) 25%, rgba(118, 75, 162, 0.1) 50%, rgba(102, 126, 234, 0.1) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
          <Skeleton 
            variant="text" 
            width="40%" 
            height={20}
            sx={{
              background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.1) 25%, rgba(118, 75, 162, 0.1) 50%, rgba(102, 126, 234, 0.1) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        </Box>
      </Box>
      
      <Box sx={{ display: 'grid', gap: 2 }}>
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height={60}
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.1) 25%, rgba(118, 75, 162, 0.1) 50%, rgba(102, 126, 234, 0.1) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height={60}
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.1) 25%, rgba(118, 75, 162, 0.1) 50%, rgba(102, 126, 234, 0.1) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
        <Skeleton 
          variant="rectangular" 
          width="100%" 
          height={60}
          sx={{
            borderRadius: 2,
            background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.1) 25%, rgba(118, 75, 162, 0.1) 50%, rgba(102, 126, 234, 0.1) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      </Box>
    </Paper>
  );

  const renderTableSkeleton = () => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <Skeleton 
          variant="circular" 
          width={56} 
          height={56}
          sx={{
            background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.1) 25%, rgba(118, 75, 162, 0.1) 50%, rgba(102, 126, 234, 0.1) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
        <Box sx={{ flex: 1 }}>
          <Skeleton 
            variant="text" 
            width="50%" 
            height={32}
            sx={{
              background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.1) 25%, rgba(118, 75, 162, 0.1) 50%, rgba(102, 126, 234, 0.1) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Skeleton 
              variant="rectangular" 
              width="20%" 
              height={40}
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.1) 25%, rgba(118, 75, 162, 0.1) 50%, rgba(102, 126, 234, 0.1) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width="40%" 
              height={40}
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.1) 25%, rgba(118, 75, 162, 0.1) 50%, rgba(102, 126, 234, 0.1) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width="20%" 
              height={40}
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.1) 25%, rgba(118, 75, 162, 0.1) 50%, rgba(102, 126, 234, 0.1) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width="20%" 
              height={40}
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(90deg, rgba(102, 126, 234, 0.1) 25%, rgba(118, 75, 162, 0.1) 50%, rgba(102, 126, 234, 0.1) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );

  const renderSummarySkeleton = () => (
    <Box sx={{ 
      display: 'grid', 
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        md: 'repeat(3, 1fr)',
        lg: 'repeat(5, 1fr)'
      },
      gap: 3,
    }}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Paper
          key={index}
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Skeleton 
              variant="circular" 
              width={48} 
              height={48}
              sx={{
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
            <Skeleton 
              variant="rectangular" 
              width={60} 
              height={24}
              sx={{
                borderRadius: 4,
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          </Box>
          
          <Skeleton 
            variant="text" 
            width="80%" 
            height={40}
            sx={{
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
          <Skeleton 
            variant="text" 
            width="60%" 
            height={24}
            sx={{
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
          <Skeleton 
            variant="text" 
            width="40%" 
            height={16}
            sx={{
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        </Paper>
      ))}
    </Box>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'table':
        return renderTableSkeleton();
      case 'summary':
        return renderSummarySkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index} sx={{ mb: count > 1 ? 3 : 0 }}>
          {renderSkeleton()}
        </Box>
      ))}
      
      <style>
        {`
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `}
      </style>
    </Box>
  );
}; 