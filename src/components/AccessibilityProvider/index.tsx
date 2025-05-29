import React, { createContext, useContext, useState, useCallback } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';

interface AccessibilityContextData {
    fontSize: number;
    increaseFontSize: () => void;
    decreaseFontSize: () => void;
    resetFontSize: () => void;
    highContrast: boolean;
    toggleHighContrast: () => void;
    isReducedMotion: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextData>({} as AccessibilityContextData);

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
};

interface AccessibilityProviderProps {
    children: React.ReactNode;
}

const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 24;
const FONT_SIZE_STEP = 2;

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
    const [fontSize, setFontSize] = useState(16);
    const [highContrast, setHighContrast] = useState(false);
    const theme = useTheme();
    const preferReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

    const increaseFontSize = useCallback(() => {
        setFontSize(prev => Math.min(prev + FONT_SIZE_STEP, MAX_FONT_SIZE));
    }, []);

    const decreaseFontSize = useCallback(() => {
        setFontSize(prev => Math.max(prev - FONT_SIZE_STEP, MIN_FONT_SIZE));
    }, []);

    const resetFontSize = useCallback(() => {
        setFontSize(16);
    }, []);

    const toggleHighContrast = useCallback(() => {
        setHighContrast(prev => !prev);
    }, []);

    React.useEffect(() => {
        document.documentElement.style.setProperty('--base-font-size', `${fontSize}px`);
    }, [fontSize]);

    React.useEffect(() => {
        if (highContrast) {
            document.documentElement.classList.add('high-contrast');
        } else {
            document.documentElement.classList.remove('high-contrast');
        }
    }, [highContrast]);

    const value = {
        fontSize,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        highContrast,
        toggleHighContrast,
        isReducedMotion: preferReducedMotion
    };

    return (
        <AccessibilityContext.Provider value={value}>
            {children}
        </AccessibilityContext.Provider>
    );
} 