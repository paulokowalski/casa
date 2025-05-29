import React from 'react';
import {
    Box,
    IconButton,
    Tooltip,
    Typography,
    SpeedDial,
    SpeedDialAction,
    SpeedDialIcon,
} from '@mui/material';
import {
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    RestartAlt as ResetIcon,
    Contrast as ContrastIcon,
    AccessibilityNew as AccessibilityIcon
} from '@mui/icons-material';
import { useAccessibility } from '../AccessibilityProvider';

export function AccessibilityControls() {
    const {
        fontSize,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        highContrast,
        toggleHighContrast
    } = useAccessibility();

    const actions = [
        {
            icon: <ZoomInIcon />,
            name: 'Aumentar Fonte',
            onClick: increaseFontSize,
            'aria-label': 'Aumentar tamanho da fonte'
        },
        {
            icon: <ZoomOutIcon />,
            name: 'Diminuir Fonte',
            onClick: decreaseFontSize,
            'aria-label': 'Diminuir tamanho da fonte'
        },
        {
            icon: <ResetIcon />,
            name: 'Resetar Fonte',
            onClick: resetFontSize,
            'aria-label': 'Resetar tamanho da fonte'
        },
        {
            icon: <ContrastIcon />,
            name: 'Alto Contraste',
            onClick: toggleHighContrast,
            'aria-label': 'Alternar alto contraste',
            'aria-pressed': highContrast
        }
    ];

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                zIndex: 1000
            }}
        >
            <SpeedDial
                ariaLabel="Controles de Acessibilidade"
                icon={<SpeedDialIcon icon={<AccessibilityIcon />} />}
                direction="up"
                FabProps={{
                    'aria-label': 'Opções de Acessibilidade',
                    size: 'medium'
                }}
            >
                {actions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={action.onClick}
                        FabProps={{
                            'aria-label': action['aria-label'],
                            'aria-pressed': action['aria-pressed']
                        }}
                    />
                ))}
            </SpeedDial>
            <Typography
                variant="caption"
                sx={{
                    position: 'absolute',
                    bottom: -20,
                    right: 0,
                    color: 'text.secondary'
                }}
            >
                Tamanho da fonte: {fontSize}px
            </Typography>
        </Box>
    );
} 