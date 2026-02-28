import React, { useRef, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Animated,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { Shadows, Radius, Typography } from '@/constants/colors';

interface TrendData {
    value: number;
    isPositive: boolean;
}

interface EnhancedStatCardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    trend?: TrendData;
    sparklineData?: number[];
    icon: React.ReactNode;
    color?: string;
    delay?: number;
    onPress?: () => void;
}

/**
 * Sparkline component - Mini bar chart showing trend
 */
const Sparkline: React.FC<{ data: number[]; color: string; height?: number }> = ({
    data,
    color,
    height = 24,
}) => {
    const maxValue = Math.max(...data);
    const { colors } = useTheme();

    return (
        <View style={[styles.sparklineContainer, { height }]}>
            {data.map((value, index) => {
                const barHeight = maxValue > 0 ? (value / maxValue) * height : 0;
                const isLast = index === data.length - 1;
                return (
                    <View
                        key={index}
                        style={[
                            styles.sparklineBar,
                            {
                                height: barHeight,
                                backgroundColor: isLast ? color : `${color}60`,
                                borderRadius: 2,
                            },
                        ]}
                    />
                );
            })}
        </View>
    );
};

/**
 * TrendBadge component - Shows percentage change with icon
 */
const TrendBadge: React.FC<{ trend: TrendData; colors: any }> = ({ trend, colors }) => {
    const getTrendColor = () => {
        if (trend.value === 0) return colors.textMuted;
        return trend.isPositive ? colors.success : colors.error;
    };

    const getTrendIcon = () => {
        if (trend.value === 0) {
            return <Minus size={12} color={getTrendColor()} />;
        }
        return trend.isPositive ? (
            <TrendingUp size={12} color={getTrendColor()} />
        ) : (
            <TrendingDown size={12} color={getTrendColor()} />
        );
    };

    const backgroundColor = trend.isPositive
        ? colors.successLight
        : trend.value === 0
            ? colors.backgroundTertiary
            : colors.errorLight;

    return (
        <View style={[styles.trendBadge, { backgroundColor }]}>
            {getTrendIcon()}
            <Text style={[styles.trendText, { color: getTrendColor() }]}>
                {trend.value > 0 ? '+' : ''}
                {trend.value.toFixed(1)}%
            </Text>
        </View>
    );
};

/**
 * EnhancedStatCard - Modern stat card with gradient, sparkline and trend badge
 */
export const EnhancedStatCard: React.FC<EnhancedStatCardProps> = ({
    title,
    value,
    subtitle,
    trend,
    sparklineData,
    icon,
    color,
    delay = 0,
    onPress,
}) => {
    const { colors, isDark } = useTheme();
    const cardColor = color || colors.primary;

    // Animations
    const scaleAnim = useRef(new Animated.Value(0.95)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const valueAnim = useRef(new Animated.Value(0)).current;

    // Animated value display
    const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
    const displayValue = useMemo(() => {
        if (typeof value === 'string') return value;
        return numericValue.toLocaleString('pt-BR');
    }, [value, numericValue]);

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 400,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 80,
                friction: 8,
                delay,
                useNativeDriver: true,
            }),
        ]).start();

        // Value counter animation
        if (typeof value === 'number') {
            Animated.timing(valueAnim, {
                toValue: value,
                duration: 1200,
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
            toValue: 0.97,
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

    const gradientColors = isDark
        ? [colors.cardGradientStart, colors.cardGradientEnd]
        : [colors.cardGradientStart, colors.cardGradientEnd];

    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.cardWrapper}
        >
            <Animated.View
                style={[
                    styles.card,
                    {
                        backgroundColor: colors.card,
                        opacity: opacityAnim,
                        transform: [{ scale: scaleAnim }],
                        ...Shadows.lg,
                    },
                ]}
            >
                {/* Gradient overlay */}
                <LinearGradient
                    colors={gradientColors as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientOverlay}
                />

                {/* Left accent stripe */}
                <View style={[styles.accentStripe, { backgroundColor: cardColor }]} />

                {/* Content */}
                <View style={styles.content}>
                    {/* Header row: Icon + Trend */}
                    <View style={styles.headerRow}>
                        <View style={[styles.iconContainer, { backgroundColor: `${cardColor}15` }]}>
                            {icon}
                        </View>
                        {trend && <TrendBadge trend={trend} colors={colors} />}
                    </View>

                    {/* Value */}
                    <Text style={[styles.value, { color: colors.text }]}>
                        {displayValue}
                    </Text>

                    {/* Title */}
                    <Text style={[styles.title, { color: colors.textSecondary }]} numberOfLines={1}>
                        {title}
                    </Text>

                    {/* Footer: Subtitle or Sparkline */}
                    <View style={styles.footer}>
                        {sparklineData && sparklineData.length > 0 ? (
                            <Sparkline data={sparklineData} color={cardColor} />
                        ) : subtitle ? (
                            <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
                                {subtitle}
                            </Text>
                        ) : null}
                    </View>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2; // 48 = padding (16*2) + gap (16)

const styles = StyleSheet.create({
    cardWrapper: {
        width: '48%',
        marginBottom: 8,
    },
    card: {
        borderRadius: Radius.lg,
        overflow: 'hidden',
        position: 'relative',
    },
    gradientOverlay: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    accentStripe: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        borderTopLeftRadius: Radius.lg,
        borderBottomLeftRadius: Radius.lg,
    },
    content: {
        padding: 16,
        paddingLeft: 20,
        zIndex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: Radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: Radius.full,
    },
    trendText: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.semibold,
    },
    value: {
        fontSize: Typography.sizes.xxxl,
        fontWeight: Typography.weights.bold,
        marginBottom: 4,
    },
    title: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: Typography.sizes.xs,
    },
    footer: {
        minHeight: 24,
    },
    sparklineContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
    },
    sparklineBar: {
        flex: 1,
        minWidth: 4,
    },
});

export default EnhancedStatCard;
