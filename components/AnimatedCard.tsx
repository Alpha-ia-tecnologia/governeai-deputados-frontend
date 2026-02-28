/**
 * Governe AI - Animated Card Component
 * Card com animações avançadas e micro-interações
 * 
 * @version 2.0.0
 */

import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    Platform,
    ViewStyle,
    TextStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import Colors, { Spacing, Radius, Typography, Shadows, withOpacity } from '@/constants/colors';

// =============================================================================
// ANIMATED STAT CARD
// =============================================================================

interface AnimatedStatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    color: string;
    icon: React.ReactNode;
    delay?: number;
    trend?: {
        value: number;
        isPositive?: boolean;
    };
    sparkline?: number[];
    onPress?: () => void;
}

export const AnimatedStatCard: React.FC<AnimatedStatCardProps> = ({
    title,
    value,
    subtitle,
    color,
    icon,
    delay = 0,
    trend,
    sparkline,
    onPress,
}) => {
    const { colors, isDark } = useTheme();
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const valueAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                delay,
                useNativeDriver: true,
            }),
        ]).start();

        // Animate value counter if it's a number
        if (typeof value === 'number') {
            Animated.timing(valueAnim, {
                toValue: value,
                duration: 1000,
                delay: delay + 200,
                useNativeDriver: false,
            }).start();
        }
    }, [delay, value]);

    const handlePressIn = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Animated.spring(scaleAnim, {
            toValue: 0.95,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    const displayValue = typeof value === 'number'
        ? valueAnim.interpolate({
            inputRange: [0, value],
            outputRange: ['0', value.toLocaleString('pt-BR')],
        })
        : value;

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={{ width: '48%' }}
        >
            <Animated.View
                style={[
                    styles.statCard,
                    {
                        backgroundColor: colors.card,
                        borderLeftColor: color,
                        opacity: opacityAnim,
                        transform: [{ scale: scaleAnim }],
                        ...Platform.select({
                            ios: Shadows.lg,
                            android: { elevation: 4 },
                            web: {
                                boxShadow: isDark
                                    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                                    : '0 4px 12px rgba(0, 0, 0, 0.1)',
                            } as any,
                        }),
                    },
                ]}
            >
                {/* Icon */}
                <View style={[styles.statIcon, { backgroundColor: withOpacity(color, 0.12) }]}>
                    {icon}
                </View>

                {/* Value */}
                {typeof value === 'number' ? (
                    <Animated.Text style={[styles.statValue, { color: colors.text }]}>
                        {displayValue}
                    </Animated.Text>
                ) : (
                    <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
                )}

                {/* Title */}
                <Text style={[styles.statTitle, { color: colors.text }]}>{title}</Text>

                {/* Subtitle */}
                {subtitle && (
                    <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>
                        {subtitle}
                    </Text>
                )}

                {/* Trend indicator */}
                {trend && (
                    <View style={styles.trendContainer}>
                        <Text
                            style={[
                                styles.trendValue,
                                { color: trend.isPositive !== false ? colors.success : colors.error },
                            ]}
                        >
                            {trend.isPositive !== false ? '+' : ''}{trend.value}%
                        </Text>
                    </View>
                )}

                {/* Sparkline mini-chart */}
                {sparkline && sparkline.length > 0 && (
                    <View style={styles.sparklineContainer}>
                        <Sparkline data={sparkline} color={color} />
                    </View>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

// =============================================================================
// SPARKLINE MINI CHART
// =============================================================================

interface SparklineProps {
    data: number[];
    color: string;
    height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color, height = 30 }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return (
        <View style={[styles.sparkline, { height }]}>
            {data.map((value, index) => {
                const barHeight = ((value - min) / range) * height * 0.8 + height * 0.2;
                return (
                    <View
                        key={index}
                        style={[
                            styles.sparklineBar,
                            {
                                height: barHeight,
                                backgroundColor: withOpacity(color, index === data.length - 1 ? 1 : 0.4),
                            },
                        ]}
                    />
                );
            })}
        </View>
    );
};

// =============================================================================
// ANIMATED QUICK ACTION CARD
// =============================================================================

interface AnimatedQuickActionCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    onPress?: () => void;
    delay?: number;
    badge?: string | number;
}

export const AnimatedQuickActionCard: React.FC<AnimatedQuickActionCardProps> = ({
    title,
    description,
    icon,
    color,
    onPress,
    delay = 0,
    badge,
}) => {
    const { colors, isDark } = useTheme();
    const translateX = useRef(new Animated.Value(-20)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(translateX, {
                toValue: 0,
                duration: 300,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, [delay]);

    const handlePressIn = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View
                style={[
                    styles.actionCard,
                    {
                        backgroundColor: colors.card,
                        opacity: opacityAnim,
                        transform: [{ translateX }, { scale: scaleAnim }],
                        ...Platform.select({
                            ios: Shadows.md,
                            android: { elevation: 2 },
                            web: {
                                boxShadow: isDark
                                    ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                                    : '0 2px 8px rgba(0, 0, 0, 0.08)',
                            } as any,
                        }),
                    },
                ]}
            >
                {/* Icon */}
                <View style={[styles.actionIcon, { backgroundColor: withOpacity(color, 0.12) }]}>
                    {icon}
                </View>

                {/* Content */}
                <View style={styles.actionContent}>
                    <View style={styles.actionTitleRow}>
                        <Text style={[styles.actionTitle, { color: colors.text }]}>{title}</Text>
                        {badge !== undefined && (
                            <View style={[styles.actionBadge, { backgroundColor: color }]}>
                                <Text style={styles.actionBadgeText}>{badge}</Text>
                            </View>
                        )}
                    </View>
                    <Text style={[styles.actionDescription, { color: colors.textSecondary }]}>
                        {description}
                    </Text>
                </View>

                {/* Chevron */}
                <View style={[styles.actionChevron, { backgroundColor: withOpacity(color, 0.1) }]}>
                    <Text style={[styles.actionChevronIcon, { color }]}>›</Text>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};

// =============================================================================
// ANIMATED LEADER CARD
// =============================================================================

interface AnimatedLeaderCardProps {
    leader: {
        id: string;
        name: string;
        region: string;
        votersCount: number;
        votersGoal: number;
        avatar?: string;
    };
    delay?: number;
    onPress?: () => void;
}

export const AnimatedLeaderCard: React.FC<AnimatedLeaderCardProps> = ({
    leader,
    delay = 0,
    onPress,
}) => {
    const { colors, isDark } = useTheme();
    const percentage = Math.round((leader.votersCount / leader.votersGoal) * 100);
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const progressWidth = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            delay,
            useNativeDriver: true,
        }).start();

        Animated.timing(progressWidth, {
            toValue: Math.min(percentage, 100),
            duration: 800,
            delay: delay + 200,
            useNativeDriver: false,
        }).start();
    }, [percentage, delay]);

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.98,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    const progressColor =
        percentage >= 80 ? colors.success :
            percentage >= 50 ? colors.warning :
                colors.error;

    // Generate color from name
    const getAvatarColor = (name: string): string => {
        const hue = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
        return `hsl(${hue}, 65%, ${isDark ? 55 : 45}%)`;
    };

    const initials = leader.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View
                style={[
                    styles.leaderCard,
                    {
                        backgroundColor: colors.card,
                        opacity: opacityAnim,
                        transform: [{ scale: scaleAnim }],
                        ...Platform.select({
                            ios: Shadows.md,
                            android: { elevation: 2 },
                            web: {
                                boxShadow: isDark
                                    ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                                    : '0 2px 8px rgba(0, 0, 0, 0.08)',
                            } as any,
                        }),
                    },
                ]}
            >
                {/* Avatar */}
                <View
                    style={[
                        styles.leaderAvatar,
                        { backgroundColor: getAvatarColor(leader.name) },
                    ]}
                >
                    <Text style={styles.leaderAvatarText}>{initials}</Text>
                </View>

                {/* Info */}
                <View style={styles.leaderInfo}>
                    <Text style={[styles.leaderName, { color: colors.text }]}>{leader.name}</Text>
                    <Text style={[styles.leaderRegion, { color: colors.textSecondary }]}>
                        {leader.region}
                    </Text>
                </View>

                {/* Stats */}
                <View style={styles.leaderStats}>
                    <View style={styles.leaderCountRow}>
                        <Text style={[styles.leaderCount, { color: colors.text }]}>
                            {leader.votersCount.toLocaleString('pt-BR')}
                        </Text>
                        <Text style={[styles.leaderGoal, { color: colors.textSecondary }]}>
                            /{leader.votersGoal.toLocaleString('pt-BR')}
                        </Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: colors.backgroundSecondary }]}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                {
                                    backgroundColor: progressColor,
                                    width: progressWidth.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0%', '100%'],
                                    }),
                                },
                            ]}
                        />
                    </View>
                    <Text style={[styles.leaderPercentage, { color: progressColor }]}>
                        {percentage}%
                    </Text>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};

// =============================================================================
// FLOATING ACTION BUTTON
// =============================================================================

interface FABProps {
    icon: React.ReactNode;
    onPress: () => void;
    color?: string;
    size?: 'sm' | 'md' | 'lg';
    position?: 'left' | 'right';
    extended?: {
        label: string;
        icon: React.ReactNode;
    };
    style?: ViewStyle;
}

export const FAB: React.FC<FABProps> = ({
    icon,
    onPress,
    color,
    size = 'md',
    position = 'right',
    extended,
    style,
}) => {
    const { colors, isDark } = useTheme();
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const backgroundColor = color || colors.primary;

    useEffect(() => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 100,
            friction: 8,
            delay: 300,
            useNativeDriver: true,
        }).start();
    }, []);

    const handlePressIn = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        Animated.spring(scaleAnim, {
            toValue: 0.9,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
        }).start();
    };

    const getSizeValue = (): number => {
        switch (size) {
            case 'sm': return 48;
            case 'lg': return 64;
            default: return 56;
        }
    };

    const sizeValue = getSizeValue();

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
                styles.fabContainer,
                { [position]: Spacing.xl },
                style,
            ]}
        >
            <Animated.View
                style={[
                    styles.fab,
                    {
                        backgroundColor,
                        width: extended ? undefined : sizeValue,
                        height: sizeValue,
                        borderRadius: sizeValue / 2,
                        paddingHorizontal: extended ? Spacing.xl : 0,
                        transform: [{ scale: scaleAnim }],
                        ...Platform.select({
                            ios: Shadows.xl,
                            android: { elevation: 8 },
                            web: {
                                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                            } as any,
                        }),
                    },
                ]}
            >
                {extended ? (
                    <>
                        {extended.icon}
                        <Text style={styles.fabLabel}>{extended.label}</Text>
                    </>
                ) : (
                    icon
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
    // Stat Card
    statCard: {
        borderRadius: Radius.lg,
        padding: Spacing.xl,
        borderLeftWidth: 4,
        width: '100%',
    },
    statIcon: {
        width: 44,
        height: 44,
        borderRadius: Radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    statValue: {
        fontSize: Typography.sizes.display,
        fontWeight: Typography.weights.bold,
        marginBottom: Spacing.xs,
    },
    statTitle: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
        marginBottom: 2,
    },
    statSubtitle: {
        fontSize: Typography.sizes.xs,
    },
    trendContainer: {
        marginTop: Spacing.sm,
    },
    trendValue: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
    },
    sparklineContainer: {
        marginTop: Spacing.md,
    },
    sparkline: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
    },
    sparklineBar: {
        flex: 1,
        borderRadius: 1,
        minWidth: 3,
    },

    // Action Card
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        gap: Spacing.md,
    },
    actionIcon: {
        width: 44,
        height: 44,
        borderRadius: Radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionContent: {
        flex: 1,
    },
    actionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    actionTitle: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
        marginBottom: 2,
    },
    actionBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: Radius.full,
    },
    actionBadgeText: {
        color: '#FFFFFF',
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.bold,
    },
    actionDescription: {
        fontSize: Typography.sizes.sm,
    },
    actionChevron: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionChevronIcon: {
        fontSize: 20,
        fontWeight: Typography.weights.bold,
    },

    // Leader Card
    leaderCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        gap: Spacing.md,
    },
    leaderAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    leaderAvatarText: {
        color: '#FFFFFF',
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.bold,
    },
    leaderInfo: {
        flex: 1,
    },
    leaderName: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
        marginBottom: 2,
    },
    leaderRegion: {
        fontSize: Typography.sizes.sm,
    },
    leaderStats: {
        alignItems: 'flex-end',
        minWidth: 80,
    },
    leaderCountRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    leaderCount: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.bold,
    },
    leaderGoal: {
        fontSize: Typography.sizes.xs,
    },
    progressBar: {
        width: 80,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
        marginTop: Spacing.xs,
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    leaderPercentage: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.semibold,
        marginTop: 2,
    },

    // FAB
    fabContainer: {
        position: 'absolute',
        bottom: Spacing.xxl,
        zIndex: 1000,
    },
    fab: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    fabLabel: {
        color: '#FFFFFF',
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
    },
});
