/**
 * Governe AI - Skeleton Loading Components
 * Componentes de loading com shimmer horizontal moderno
 * 
 * @version 2.0.0
 */

import React, { useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    ViewStyle,
    DimensionValue,
    Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, Radius, Shadows } from '@/constants/colors';

interface SkeletonProps {
    width?: DimensionValue;
    height?: number;
    borderRadius?: number;
    variant?: 'rectangular' | 'circular' | 'rounded' | 'text';
    style?: ViewStyle;
    animated?: boolean;
}

/**
 * Componente Skeleton base com shimmer horizontal
 */
export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = 20,
    borderRadius,
    variant = 'rounded',
    style,
    animated = true,
}) => {
    const { colors, isDark } = useTheme();
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    // Determina o borderRadius baseado na variante
    const getBorderRadius = (): number => {
        if (borderRadius !== undefined) return borderRadius;
        switch (variant) {
            case 'circular':
                return typeof height === 'number' ? height / 2 : 9999;
            case 'rectangular':
                return 0;
            case 'text':
                return Radius.xs;
            case 'rounded':
            default:
                return Radius.sm;
        }
    };

    useEffect(() => {
        if (!animated) return;

        const animation = Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        );
        animation.start();
        return () => animation.stop();
    }, [animated]);

    const baseColor = isDark ? '#374151' : '#E5E7EB';
    const highlightColor = isDark ? '#4B5563' : '#F3F4F6';
    const computedRadius = getBorderRadius();

    // Largura do componente para o shimmer
    const shimmerWidth = typeof width === 'number' ? width : 300;

    const translateX = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-shimmerWidth, shimmerWidth * 2],
    });

    return (
        <View
            style={[
                styles.skeleton,
                {
                    width,
                    height,
                    borderRadius: computedRadius,
                    backgroundColor: baseColor,
                    overflow: 'hidden',
                },
                style,
            ]}
        >
            {animated && (
                <Animated.View
                    style={[
                        styles.shimmer,
                        {
                            transform: [{ translateX }],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={['transparent', highlightColor, 'transparent']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.shimmerGradient}
                    />
                </Animated.View>
            )}
        </View>
    );
};

/**
 * Skeleton para Cards de Ação/Lista
 */
export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
    const { colors, isDark } = useTheme();

    return (
        <View
            style={[
                styles.card,
                {
                    backgroundColor: colors.card,
                    ...Platform.select({
                        ios: Shadows.md,
                        android: { elevation: 2 },
                        web: {
                            boxShadow: isDark
                                ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                                : '0 2px 8px rgba(0, 0, 0, 0.08)'
                        } as any,
                    }),
                },
                style
            ]}
        >
            <Skeleton width={40} height={40} variant="circular" />
            <View style={styles.cardContent}>
                <Skeleton width="70%" height={16} style={styles.mb8} />
                <Skeleton width="45%" height={12} />
            </View>
            <Skeleton width={20} height={20} variant="circular" />
        </View>
    );
};

/**
 * Skeleton para Cards de Estatísticas
 */
export const SkeletonStatCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
    const { colors, isDark } = useTheme();

    return (
        <View
            style={[
                styles.statCard,
                {
                    backgroundColor: colors.card,
                    borderLeftWidth: 4,
                    borderLeftColor: isDark ? '#374151' : '#E5E7EB',
                    ...Platform.select({
                        ios: Shadows.lg,
                        android: { elevation: 4 },
                        web: {
                            boxShadow: isDark
                                ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                                : '0 4px 12px rgba(0, 0, 0, 0.1)'
                        } as any,
                    }),
                },
                style
            ]}
        >
            <Skeleton width={44} height={44} borderRadius={Radius.md} style={styles.mb12} />
            <Skeleton width={80} height={36} style={styles.mb8} />
            <Skeleton width="85%" height={14} style={styles.mb4} />
            <Skeleton width="55%" height={12} />
        </View>
    );
};

/**
 * Skeleton para Lista de Items
 */
export const SkeletonList: React.FC<{
    count?: number;
    variant?: 'card' | 'simple';
    style?: ViewStyle
}> = ({
    count = 3,
    variant = 'card',
    style
}) => {
        return (
            <View style={style}>
                {Array.from({ length: count }).map((_, index) => (
                    variant === 'card'
                        ? <SkeletonCard key={index} style={styles.mb12} />
                        : <SkeletonListItem key={index} style={styles.mb12} />
                ))}
            </View>
        );
    };

/**
 * Skeleton para Item de Lista Simples
 */
export const SkeletonListItem: React.FC<{ style?: ViewStyle }> = ({ style }) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.listItem, { backgroundColor: colors.card }, style]}>
            <Skeleton width={48} height={48} variant="circular" />
            <View style={styles.listItemContent}>
                <Skeleton width="65%" height={18} style={styles.mb8} />
                <Skeleton width="40%" height={14} />
            </View>
        </View>
    );
};

/**
 * Skeleton para Perfil de Usuário
 */
export const SkeletonProfile: React.FC<{ style?: ViewStyle }> = ({ style }) => {
    const { colors, isDark } = useTheme();

    return (
        <View
            style={[
                styles.profile,
                {
                    backgroundColor: colors.card,
                    ...Platform.select({
                        ios: Shadows.md,
                        android: { elevation: 2 },
                        web: {
                            boxShadow: isDark
                                ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                                : '0 2px 8px rgba(0, 0, 0, 0.08)'
                        } as any,
                    }),
                },
                style
            ]}
        >
            <Skeleton width={80} height={80} variant="circular" style={styles.mb16} />
            <Skeleton width={150} height={24} style={styles.mb8} />
            <Skeleton width={100} height={14} style={styles.mb16} />
            <View style={styles.profileStats}>
                <View style={styles.profileStat}>
                    <Skeleton width={50} height={28} style={styles.mb4} />
                    <Skeleton width={70} height={12} />
                </View>
                <View style={styles.profileStat}>
                    <Skeleton width={50} height={28} style={styles.mb4} />
                    <Skeleton width={70} height={12} />
                </View>
                <View style={styles.profileStat}>
                    <Skeleton width={50} height={28} style={styles.mb4} />
                    <Skeleton width={70} height={12} />
                </View>
            </View>
        </View>
    );
};

/**
 * Skeleton para Gráfico
 */
export const SkeletonChart: React.FC<{
    height?: number;
    style?: ViewStyle
}> = ({ height = 200, style }) => {
    const { colors, isDark } = useTheme();

    return (
        <View
            style={[
                styles.chart,
                {
                    backgroundColor: colors.card,
                    height,
                    ...Platform.select({
                        ios: Shadows.md,
                        android: { elevation: 2 },
                        web: {
                            boxShadow: isDark
                                ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                                : '0 2px 8px rgba(0, 0, 0, 0.08)'
                        } as any,
                    }),
                },
                style
            ]}
        >
            <View style={styles.chartHeader}>
                <Skeleton width={20} height={20} variant="circular" />
                <Skeleton width={120} height={18} style={{ marginLeft: Spacing.sm }} />
            </View>
            <View style={styles.chartBars}>
                {[0.6, 0.8, 0.5, 0.9, 0.7, 0.4, 0.85].map((heightPercent, index) => (
                    <View key={index} style={styles.chartBarContainer}>
                        <Skeleton
                            width={24}
                            height={height * 0.5 * heightPercent}
                            borderRadius={Radius.xs}
                        />
                    </View>
                ))}
            </View>
        </View>
    );
};

/**
 * Skeleton para Tabela/Grid de Dados
 */
export const SkeletonTable: React.FC<{
    rows?: number;
    columns?: number;
    style?: ViewStyle
}> = ({ rows = 5, columns = 4, style }) => {
    const { colors, isDark } = useTheme();

    return (
        <View
            style={[
                styles.table,
                {
                    backgroundColor: colors.card,
                    ...Platform.select({
                        ios: Shadows.sm,
                        android: { elevation: 1 },
                        web: {
                            boxShadow: isDark
                                ? '0 1px 4px rgba(0, 0, 0, 0.2)'
                                : '0 1px 4px rgba(0, 0, 0, 0.05)'
                        } as any,
                    }),
                },
                style
            ]}
        >
            {/* Header */}
            <View style={[styles.tableRow, styles.tableHeader, { borderBottomColor: colors.border }]}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                    <View key={colIndex} style={styles.tableCell}>
                        <Skeleton width="80%" height={14} />
                    </View>
                ))}
            </View>
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <View
                    key={rowIndex}
                    style={[
                        styles.tableRow,
                        rowIndex < rows - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                    ]}
                >
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <View key={colIndex} style={styles.tableCell}>
                            <Skeleton
                                width={colIndex === 0 ? "90%" : "70%"}
                                height={12}
                            />
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
};

/**
 * Skeleton para Dashboard Completo
 */
export const SkeletonDashboard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
    return (
        <View style={style}>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <SkeletonStatCard style={{ width: '48%' }} />
                <SkeletonStatCard style={{ width: '48%' }} />
                <SkeletonStatCard style={{ width: '48%' }} />
                <SkeletonStatCard style={{ width: '48%' }} />
            </View>

            {/* Chart */}
            <SkeletonChart style={styles.mb16} />

            {/* List */}
            <View style={[styles.section, styles.mb16]}>
                <Skeleton width={150} height={20} style={styles.mb12} />
                <SkeletonList count={3} />
            </View>
        </View>
    );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
    skeleton: {
        position: 'relative',
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '50%',
    },
    shimmerGradient: {
        flex: 1,
        width: '100%',
    },

    // Card
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: Radius.lg,
        gap: Spacing.md,
    },
    cardContent: {
        flex: 1,
    },

    // Stat Card
    statCard: {
        padding: Spacing.xl,
        borderRadius: Radius.lg,
        width: '48%',
    },

    // List Item
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderRadius: Radius.md,
        gap: Spacing.md,
    },
    listItemContent: {
        flex: 1,
    },

    // Profile
    profile: {
        alignItems: 'center',
        padding: Spacing.xxl,
        borderRadius: Radius.lg,
    },
    profileStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: Spacing.lg,
    },
    profileStat: {
        alignItems: 'center',
    },

    // Chart
    chart: {
        padding: Spacing.lg,
        borderRadius: Radius.lg,
    },
    chartHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    chartBars: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        flex: 1,
        paddingTop: Spacing.lg,
    },
    chartBarContainer: {
        alignItems: 'center',
        flex: 1,
    },

    // Table
    table: {
        borderRadius: Radius.md,
        overflow: 'hidden',
    },
    tableHeader: {
        borderBottomWidth: 2,
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
    },
    tableCell: {
        flex: 1,
        paddingHorizontal: Spacing.sm,
    },

    // Dashboard
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.md,
        marginBottom: Spacing.xl,
    },
    section: {},

    // Spacing helpers
    mb4: {
        marginBottom: Spacing.xs,
    },
    mb8: {
        marginBottom: Spacing.sm,
    },
    mb12: {
        marginBottom: Spacing.md,
    },
    mb16: {
        marginBottom: Spacing.lg,
    },
});

export default Skeleton;
