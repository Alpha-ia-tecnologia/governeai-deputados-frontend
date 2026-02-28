/**
 * Governe AI - Modern Chart Components
 * Componentes de visualização de dados modernos
 * 
 * @version 1.0.0
 */

import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    ScrollView,
    Platform,
    ViewStyle,
    Dimensions,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Colors, {
    Spacing,
    Radius,
    Typography,
    Shadows,
    ChartColors,
    withOpacity
} from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =============================================================================
// DONUT CHART
// =============================================================================

interface DonutChartData {
    label: string;
    value: number;
    color?: string;
}

interface DonutChartProps {
    data: DonutChartData[];
    size?: number;
    strokeWidth?: number;
    innerLabel?: {
        value: string | number;
        label: string;
    };
    showLegend?: boolean;
    legendPosition?: 'bottom' | 'right';
    onSegmentPress?: (item: DonutChartData, index: number) => void;
    style?: ViewStyle;
}

export const DonutChart: React.FC<DonutChartProps> = ({
    data,
    size = 180,
    strokeWidth = 32,
    innerLabel,
    showLegend = true,
    legendPosition = 'bottom',
    onSegmentPress,
    style,
}) => {
    const { colors, isDark } = useTheme();
    const animationProgress = useRef(new Animated.Value(0)).current;
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const total = data.reduce((sum, item) => sum + item.value, 0);
    const chartColors = ChartColors.vibrant;

    useEffect(() => {
        Animated.timing(animationProgress, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
        }).start();
    }, []);

    const getColor = (index: number): string => {
        return data[index].color || chartColors[index % chartColors.length];
    };

    const handleSegmentPress = (item: DonutChartData, index: number) => {
        setSelectedIndex(selectedIndex === index ? null : index);
        onSegmentPress?.(item, index);
    };

    // Calculate segments
    let currentAngle = -90; // Start from top
    const segments = data.map((item, index) => {
        const percentage = (item.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const segment = {
            ...item,
            percentage,
            startAngle: currentAngle,
            endAngle: currentAngle + angle,
            color: getColor(index),
        };
        currentAngle += angle;
        return segment;
    });

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    return (
        <View style={[
            styles.donutContainer,
            legendPosition === 'right' && styles.donutContainerRow,
            style
        ]}>
            {/* Chart */}
            <View style={[styles.donutChart, { width: size, height: size }]}>
                {/* Background circle */}
                <View
                    style={[
                        styles.donutBackground,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            borderWidth: strokeWidth,
                            borderColor: isDark ? colors.backgroundSecondary : colors.border,
                        },
                    ]}
                />

                {/* Segments */}
                <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
                    {segments.map((segment, index) => {
                        const strokeDashoffset = animationProgress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [circumference, circumference * (1 - segment.percentage / 100)],
                        });
                        const rotation = segment.startAngle;
                        const isSelected = selectedIndex === index;

                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.7}
                                onPress={() => handleSegmentPress(segment, index)}
                                style={[
                                    StyleSheet.absoluteFill,
                                    { alignItems: 'center', justifyContent: 'center' },
                                ]}
                            >
                                <Animated.View
                                    style={{
                                        transform: [
                                            { rotate: `${rotation}deg` },
                                            { scale: isSelected ? 1.05 : 1 },
                                        ],
                                    }}
                                >
                                    <Animated.View
                                        style={{
                                            width: size,
                                            height: size,
                                            borderRadius: size / 2,
                                            borderWidth: strokeWidth,
                                            borderColor: 'transparent',
                                            borderTopColor: segment.color,
                                            opacity: isSelected ? 1 : 0.85,
                                        }}
                                    />
                                </Animated.View>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Inner label */}
                {innerLabel && (
                    <View style={styles.donutInnerLabel}>
                        <Text style={[styles.donutInnerValue, { color: colors.text }]}>
                            {typeof innerLabel.value === 'number'
                                ? innerLabel.value.toLocaleString('pt-BR')
                                : innerLabel.value}
                        </Text>
                        <Text style={[styles.donutInnerTitle, { color: colors.textSecondary }]}>
                            {innerLabel.label}
                        </Text>
                    </View>
                )}
            </View>

            {/* Legend */}
            {showLegend && (
                <View style={[
                    styles.donutLegend,
                    legendPosition === 'right' && styles.donutLegendRight,
                ]}>
                    {segments.map((segment, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.legendItem,
                                selectedIndex === index && styles.legendItemSelected,
                            ]}
                            onPress={() => handleSegmentPress(segment, index)}
                        >
                            <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
                            <View style={styles.legendContent}>
                                <Text
                                    style={[styles.legendLabel, { color: colors.text }]}
                                    numberOfLines={1}
                                >
                                    {segment.label}
                                </Text>
                                <Text style={[styles.legendValue, { color: colors.textSecondary }]}>
                                    {segment.value.toLocaleString('pt-BR')} ({segment.percentage.toFixed(1)}%)
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

// =============================================================================
// HORIZONTAL BAR CHART
// =============================================================================

interface BarChartData {
    label: string;
    value: number;
    color?: string;
    subLabel?: string;
}

interface HorizontalBarChartProps {
    data: BarChartData[];
    maxBars?: number;
    showRanking?: boolean;
    animated?: boolean;
    onBarPress?: (item: BarChartData, index: number) => void;
    style?: ViewStyle;
}

export const HorizontalBarChart: React.FC<HorizontalBarChartProps> = ({
    data,
    maxBars = 10,
    showRanking = true,
    animated = true,
    onBarPress,
    style,
}) => {
    const { colors, isDark } = useTheme();
    const displayData = data.slice(0, maxBars);
    const maxValue = Math.max(...displayData.map(d => d.value));
    const chartColors = ChartColors.vibrant;

    return (
        <View style={style}>
            {displayData.map((item, index) => (
                <AnimatedBar
                    key={index}
                    item={item}
                    index={index}
                    maxValue={maxValue}
                    color={item.color || chartColors[index % chartColors.length]}
                    showRanking={showRanking}
                    animated={animated}
                    delay={index * 80}
                    onPress={() => onBarPress?.(item, index)}
                />
            ))}
        </View>
    );
};

interface AnimatedBarProps {
    item: BarChartData;
    index: number;
    maxValue: number;
    color: string;
    showRanking: boolean;
    animated: boolean;
    delay: number;
    onPress?: () => void;
}

const AnimatedBar: React.FC<AnimatedBarProps> = ({
    item,
    index,
    maxValue,
    color,
    showRanking,
    animated,
    delay,
    onPress,
}) => {
    const { colors, isDark } = useTheme();
    const widthAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const percentage = (item.value / maxValue) * 100;

    useEffect(() => {
        if (animated) {
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    delay,
                    useNativeDriver: true,
                }),
                Animated.timing(widthAnim, {
                    toValue: percentage,
                    duration: 600,
                    delay: delay + 100,
                    useNativeDriver: false,
                }),
            ]).start();
        } else {
            opacityAnim.setValue(1);
            widthAnim.setValue(percentage);
        }
    }, [percentage, animated, delay]);

    // Ranking badge colors
    const getRankingColor = (rank: number): string => {
        if (rank === 0) return '#FFD700'; // Gold
        if (rank === 1) return '#C0C0C0'; // Silver
        if (rank === 2) return '#CD7F32'; // Bronze
        return colors.textSecondary;
    };

    return (
        <TouchableOpacity
            activeOpacity={onPress ? 0.7 : 1}
            onPress={onPress}
        >
            <Animated.View
                style={[
                    styles.barItem,
                    { opacity: opacityAnim },
                ]}
            >
                {/* Ranking badge */}
                {showRanking && (
                    <View style={[styles.rankBadge, { backgroundColor: getRankingColor(index) }]}>
                        <Text style={styles.rankText}>{index + 1}º</Text>
                    </View>
                )}

                {/* Label */}
                <View style={styles.barLabelContainer}>
                    <Text
                        style={[styles.barLabel, { color: colors.text }]}
                        numberOfLines={1}
                    >
                        {item.label}
                    </Text>
                    {item.subLabel && (
                        <Text style={[styles.barSubLabel, { color: colors.textSecondary }]}>
                            {item.subLabel}
                        </Text>
                    )}
                </View>

                {/* Bar */}
                <View style={styles.barWrapper}>
                    <View style={[styles.barBackground, { backgroundColor: colors.backgroundSecondary }]}>
                        <Animated.View
                            style={[
                                styles.barFill,
                                {
                                    backgroundColor: color,
                                    width: widthAnim.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0%', '100%'],
                                    }),
                                },
                            ]}
                        >
                            {/* Shimmer effect */}
                            <View style={styles.barShimmer} />
                        </Animated.View>
                    </View>
                    <Text style={[styles.barValue, { color: colors.text }]}>
                        {item.value.toLocaleString('pt-BR')}
                    </Text>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
};

// =============================================================================
// VERTICAL BAR CHART
// =============================================================================

interface VerticalBarChartProps {
    data: BarChartData[];
    height?: number;
    barWidth?: number;
    animated?: boolean;
    showValues?: boolean;
    onBarPress?: (item: BarChartData, index: number) => void;
    style?: ViewStyle;
}

export const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
    data,
    height = 200,
    barWidth = 32,
    animated = true,
    showValues = true,
    onBarPress,
    style,
}) => {
    const { colors, isDark } = useTheme();
    const maxValue = Math.max(...data.map(d => d.value));
    const chartColors = ChartColors.primary;

    return (
        <View style={style}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.verticalChartContainer}
            >
                {data.map((item, index) => {
                    const barHeight = (item.value / maxValue) * height * 0.85;
                    const color = item.color || chartColors[index % chartColors.length];

                    return (
                        <VerticalBar
                            key={index}
                            item={item}
                            index={index}
                            barHeight={barHeight}
                            chartHeight={height}
                            barWidth={barWidth}
                            color={color}
                            animated={animated}
                            showValue={showValues}
                            delay={index * 60}
                            onPress={() => onBarPress?.(item, index)}
                        />
                    );
                })}
            </ScrollView>
        </View>
    );
};

interface VerticalBarProps {
    item: BarChartData;
    index: number;
    barHeight: number;
    chartHeight: number;
    barWidth: number;
    color: string;
    animated: boolean;
    showValue: boolean;
    delay: number;
    onPress?: () => void;
}

const VerticalBar: React.FC<VerticalBarProps> = ({
    item,
    barHeight,
    chartHeight,
    barWidth,
    color,
    animated,
    showValue,
    delay,
    onPress,
}) => {
    const { colors } = useTheme();
    const heightAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (animated) {
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 300,
                    delay,
                    useNativeDriver: true,
                }),
                Animated.spring(heightAnim, {
                    toValue: barHeight,
                    tension: 50,
                    friction: 8,
                    delay: delay + 100,
                    useNativeDriver: false,
                }),
            ]).start();
        } else {
            opacityAnim.setValue(1);
            heightAnim.setValue(barHeight);
        }
    }, [barHeight, animated, delay]);

    return (
        <TouchableOpacity
            activeOpacity={onPress ? 0.7 : 1}
            onPress={onPress}
            style={styles.verticalBarContainer}
        >
            <Animated.View style={{ opacity: opacityAnim }}>
                {/* Value label */}
                {showValue && (
                    <Text style={[styles.verticalBarValue, { color: colors.text }]}>
                        {item.value.toLocaleString('pt-BR')}
                    </Text>
                )}

                {/* Bar */}
                <View style={[styles.verticalBarWrapper, { height: chartHeight }]}>
                    <Animated.View
                        style={[
                            styles.verticalBarFill,
                            {
                                backgroundColor: color,
                                width: barWidth,
                                height: heightAnim,
                                borderRadius: barWidth / 4,
                            },
                        ]}
                    />
                </View>

                {/* Label */}
                <Text
                    style={[styles.verticalBarLabel, { color: colors.textSecondary }]}
                    numberOfLines={2}
                >
                    {item.label}
                </Text>
            </Animated.View>
        </TouchableOpacity>
    );
};

// =============================================================================
// KPI CARD WITH MINI CHART
// =============================================================================

interface KPICardProps {
    title: string;
    value: string | number;
    change?: {
        value: number;
        label?: string;
    };
    sparklineData?: number[];
    icon?: React.ReactNode;
    color?: string;
    onPress?: () => void;
    style?: ViewStyle;
}

export const KPICard: React.FC<KPICardProps> = ({
    title,
    value,
    change,
    sparklineData,
    icon,
    color,
    onPress,
    style,
}) => {
    const { colors, isDark } = useTheme();
    const accentColor = color || colors.primary;
    const isPositive = change ? change.value >= 0 : true;

    return (
        <TouchableOpacity
            activeOpacity={onPress ? 0.7 : 1}
            onPress={onPress}
            style={[
                styles.kpiCard,
                {
                    backgroundColor: colors.card,
                    borderLeftColor: accentColor,
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
                style,
            ]}
        >
            {/* Header */}
            <View style={styles.kpiHeader}>
                {icon && (
                    <View style={[styles.kpiIcon, { backgroundColor: withOpacity(accentColor, 0.12) }]}>
                        {icon}
                    </View>
                )}
                <Text style={[styles.kpiTitle, { color: colors.textSecondary }]}>{title}</Text>
            </View>

            {/* Value */}
            <Text style={[styles.kpiValue, { color: colors.text }]}>
                {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
            </Text>

            {/* Change indicator */}
            {change && (
                <View style={styles.kpiChange}>
                    <Text
                        style={[
                            styles.kpiChangeValue,
                            { color: isPositive ? colors.success : colors.error },
                        ]}
                    >
                        {isPositive ? '↑' : '↓'} {Math.abs(change.value)}%
                    </Text>
                    {change.label && (
                        <Text style={[styles.kpiChangeLabel, { color: colors.textSecondary }]}>
                            {change.label}
                        </Text>
                    )}
                </View>
            )}

            {/* Sparkline */}
            {sparklineData && sparklineData.length > 0 && (
                <View style={styles.kpiSparkline}>
                    <MiniSparkline data={sparklineData} color={accentColor} />
                </View>
            )}
        </TouchableOpacity>
    );
};

// Mini sparkline for KPI cards
const MiniSparkline: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    return (
        <View style={styles.miniSparkline}>
            {data.map((value, index) => {
                const barHeight = ((value - min) / range) * 24 + 4;
                const isLast = index === data.length - 1;

                return (
                    <View
                        key={index}
                        style={[
                            styles.miniSparklineBar,
                            {
                                height: barHeight,
                                backgroundColor: withOpacity(color, isLast ? 1 : 0.4),
                            },
                        ]}
                    />
                );
            })}
        </View>
    );
};

// =============================================================================
// COMPARISON CARD
// =============================================================================

interface ComparisonItem {
    label: string;
    value: number;
    subLabel?: string;
}

interface ComparisonCardProps {
    title: string;
    itemA: ComparisonItem;
    itemB: ComparisonItem;
    colorA?: string;
    colorB?: string;
    style?: ViewStyle;
}

export const ComparisonCard: React.FC<ComparisonCardProps> = ({
    title,
    itemA,
    itemB,
    colorA,
    colorB,
    style,
}) => {
    const { colors, isDark } = useTheme();
    const primaryColorA = colorA || ChartColors.primary[0];
    const primaryColorB = colorB || ChartColors.secondary[0];

    const total = itemA.value + itemB.value;
    const percentageA = (itemA.value / total) * 100;
    const percentageB = (itemB.value / total) * 100;

    const widthAnimA = useRef(new Animated.Value(0)).current;
    const widthAnimB = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(widthAnimA, {
                toValue: percentageA,
                duration: 800,
                useNativeDriver: false,
            }),
            Animated.timing(widthAnimB, {
                toValue: percentageB,
                duration: 800,
                useNativeDriver: false,
            }),
        ]).start();
    }, [percentageA, percentageB]);

    return (
        <View
            style={[
                styles.comparisonCard,
                {
                    backgroundColor: colors.card,
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
                style,
            ]}
        >
            <Text style={[styles.comparisonTitle, { color: colors.text }]}>{title}</Text>

            {/* Comparison bar */}
            <View style={styles.comparisonBar}>
                <Animated.View
                    style={[
                        styles.comparisonBarA,
                        {
                            backgroundColor: primaryColorA,
                            width: widthAnimA.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%'],
                            }),
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.comparisonBarB,
                        {
                            backgroundColor: primaryColorB,
                            width: widthAnimB.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%'],
                            }),
                        },
                    ]}
                />
            </View>

            {/* Items */}
            <View style={styles.comparisonItems}>
                <View style={styles.comparisonItem}>
                    <View style={[styles.comparisonDot, { backgroundColor: primaryColorA }]} />
                    <View>
                        <Text style={[styles.comparisonLabel, { color: colors.text }]}>{itemA.label}</Text>
                        <Text style={[styles.comparisonValue, { color: primaryColorA }]}>
                            {itemA.value.toLocaleString('pt-BR')} ({percentageA.toFixed(1)}%)
                        </Text>
                        {itemA.subLabel && (
                            <Text style={[styles.comparisonSubLabel, { color: colors.textSecondary }]}>
                                {itemA.subLabel}
                            </Text>
                        )}
                    </View>
                </View>

                <View style={styles.comparisonDivider} />

                <View style={[styles.comparisonItem, { alignItems: 'flex-end' }]}>
                    <View>
                        <Text style={[styles.comparisonLabel, { color: colors.text, textAlign: 'right' }]}>
                            {itemB.label}
                        </Text>
                        <Text style={[styles.comparisonValue, { color: primaryColorB, textAlign: 'right' }]}>
                            {itemB.value.toLocaleString('pt-BR')} ({percentageB.toFixed(1)}%)
                        </Text>
                        {itemB.subLabel && (
                            <Text style={[styles.comparisonSubLabel, { color: colors.textSecondary, textAlign: 'right' }]}>
                                {itemB.subLabel}
                            </Text>
                        )}
                    </View>
                    <View style={[styles.comparisonDot, { backgroundColor: primaryColorB }]} />
                </View>
            </View>
        </View>
    );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
    // Donut Chart
    donutContainer: {
        alignItems: 'center',
    },
    donutContainerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    donutChart: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    donutBackground: {
        position: 'absolute',
    },
    donutInnerLabel: {
        alignItems: 'center',
    },
    donutInnerValue: {
        fontSize: Typography.sizes.xxl,
        fontWeight: Typography.weights.bold,
    },
    donutInnerTitle: {
        fontSize: Typography.sizes.sm,
    },
    donutLegend: {
        marginTop: Spacing.xl,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: Spacing.md,
    },
    donutLegendRight: {
        marginTop: 0,
        marginLeft: Spacing.xl,
        flexDirection: 'column',
        flex: 1,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.sm,
        borderRadius: Radius.sm,
        gap: Spacing.sm,
    },
    legendItemSelected: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendContent: {
        flex: 1,
    },
    legendLabel: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    legendValue: {
        fontSize: Typography.sizes.xs,
    },

    // Horizontal Bar Chart
    barItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    rankBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        color: '#FFFFFF',
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.bold,
    },
    barLabelContainer: {
        width: 100,
    },
    barLabel: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    barSubLabel: {
        fontSize: Typography.sizes.xs,
    },
    barWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    barBackground: {
        flex: 1,
        height: 24,
        borderRadius: Radius.sm,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: Radius.sm,
        overflow: 'hidden',
        position: 'relative',
    },
    barShimmer: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: 3,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    barValue: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
        minWidth: 60,
        textAlign: 'right',
    },

    // Vertical Bar Chart
    verticalChartContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: Spacing.md,
        gap: Spacing.md,
    },
    verticalBarContainer: {
        alignItems: 'center',
    },
    verticalBarValue: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.semibold,
        marginBottom: Spacing.xs,
    },
    verticalBarWrapper: {
        justifyContent: 'flex-end',
    },
    verticalBarFill: {
        alignSelf: 'center',
    },
    verticalBarLabel: {
        fontSize: Typography.sizes.xs,
        textAlign: 'center',
        marginTop: Spacing.sm,
        width: 50,
    },

    // KPI Card
    kpiCard: {
        padding: Spacing.lg,
        borderRadius: Radius.lg,
        borderLeftWidth: 4,
    },
    kpiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    kpiIcon: {
        width: 32,
        height: 32,
        borderRadius: Radius.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    kpiTitle: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    kpiValue: {
        fontSize: Typography.sizes.xxl,
        fontWeight: Typography.weights.bold,
        marginBottom: Spacing.xs,
    },
    kpiChange: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    kpiChangeValue: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
    },
    kpiChangeLabel: {
        fontSize: Typography.sizes.xs,
    },
    kpiSparkline: {
        marginTop: Spacing.md,
    },
    miniSparkline: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        height: 28,
        gap: 2,
    },
    miniSparklineBar: {
        flex: 1,
        borderRadius: 1,
        minWidth: 4,
    },

    // Comparison Card
    comparisonCard: {
        padding: Spacing.lg,
        borderRadius: Radius.lg,
    },
    comparisonTitle: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },
    comparisonBar: {
        flexDirection: 'row',
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: Spacing.lg,
    },
    comparisonBarA: {
        height: '100%',
        borderTopLeftRadius: 6,
        borderBottomLeftRadius: 6,
    },
    comparisonBarB: {
        height: '100%',
        borderTopRightRadius: 6,
        borderBottomRightRadius: 6,
    },
    comparisonItems: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    comparisonItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        flex: 1,
    },
    comparisonDivider: {
        width: Spacing.lg,
    },
    comparisonDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginTop: 4,
    },
    comparisonLabel: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
        marginBottom: 2,
    },
    comparisonValue: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.bold,
    },
    comparisonSubLabel: {
        fontSize: Typography.sizes.xs,
        marginTop: 2,
    },
});
