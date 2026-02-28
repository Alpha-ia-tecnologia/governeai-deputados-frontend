/**
 * Governe AI - Tema Principal
 * Inspirado no Bold Tech do shadcn-ui
 * 
 * @version 1.0.0
 */

import { Platform } from 'react-native';
import Colors, { Spacing, Radius, Typography, Shadows } from './colors';

/**
 * Configuração do tema para uso em todo o app
 */
export const Theme = {
    colors: Colors,
    spacing: Spacing,
    radius: Radius,
    typography: Typography,
    shadows: Shadows,

    // Duração das animações
    animation: {
        fast: 150,
        normal: 300,
        slow: 500,
        verySlow: 800,
    },

    // Easing functions
    easing: {
        easeInOut: 'ease-in-out',
        easeOut: 'ease-out',
        easeIn: 'ease-in',
        spring: { tension: 100, friction: 10 },
        bounce: { tension: 180, friction: 12 },
    },

    // Z-index layers
    zIndex: {
        base: 0,
        dropdown: 1000,
        sticky: 1020,
        fixed: 1030,
        modalBackdrop: 1040,
        modal: 1050,
        popover: 1060,
        tooltip: 1070,
        toast: 1080,
    },

    // Breakpoints para responsividade
    breakpoints: {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
    },
} as const;

/**
 * Estilos de cartão padrão
 */
export const cardStyles = (isDark: boolean) => ({
    container: {
        backgroundColor: isDark ? Colors.dark.card : Colors.light.card,
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        ...Platform.select({
            ios: Shadows.lg,
            android: { elevation: 4 },
            web: {
                boxShadow: isDark
                    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                    : '0 4px 12px rgba(0, 0, 0, 0.08)',
            },
        }),
    },
    header: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
        color: isDark ? Colors.dark.text : Colors.light.text,
    },
    description: {
        fontSize: Typography.sizes.sm,
        color: isDark ? Colors.dark.textSecondary : Colors.light.textSecondary,
    },
});

/**
 * Estilos de botão padrão
 */
export const buttonStyles = (isDark: boolean) => ({
    primary: {
        backgroundColor: isDark ? Colors.dark.primary : Colors.light.primary,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: Radius.md,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    secondary: {
        backgroundColor: isDark ? Colors.dark.secondary : Colors.light.secondary,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: Radius.md,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: isDark ? Colors.dark.border : Colors.light.border,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: Radius.md,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    ghost: {
        backgroundColor: 'transparent',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: Radius.md,
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    text: {
        primary: {
            color: '#FFFFFF',
            fontSize: Typography.sizes.md,
            fontWeight: Typography.weights.semibold,
        },
        secondary: {
            color: '#FFFFFF',
            fontSize: Typography.sizes.md,
            fontWeight: Typography.weights.semibold,
        },
        outline: {
            color: isDark ? Colors.dark.text : Colors.light.text,
            fontSize: Typography.sizes.md,
            fontWeight: Typography.weights.semibold,
        },
        ghost: {
            color: isDark ? Colors.dark.primary : Colors.light.primary,
            fontSize: Typography.sizes.md,
            fontWeight: Typography.weights.semibold,
        },
    },
});

/**
 * Estilos de input padrão
 */
export const inputStyles = (isDark: boolean, focused: boolean = false) => ({
    container: {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        backgroundColor: isDark ? Colors.dark.backgroundSecondary : Colors.light.backgroundSecondary,
        borderWidth: 2,
        borderColor: focused
            ? (isDark ? Colors.dark.primary : Colors.light.primary)
            : (isDark ? Colors.dark.border : Colors.light.border),
        borderRadius: Radius.md,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
        gap: Spacing.md,
    },
    input: {
        flex: 1,
        fontSize: Typography.sizes.md,
        color: isDark ? Colors.dark.text : Colors.light.text,
    },
    label: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
        color: isDark ? Colors.dark.text : Colors.light.text,
        marginBottom: Spacing.sm,
    },
});

export default Theme;
