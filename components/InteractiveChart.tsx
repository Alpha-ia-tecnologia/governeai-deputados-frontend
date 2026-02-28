import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { Radius, Typography, Shadows } from '@/constants/colors';

type TimeRange = '7d' | '30d' | '90d';

interface DataPoint {
    label: string;
    value: number;
    secondaryValue?: number;
}

interface InteractiveChartProps {
    title: string;
    subtitle?: string;
    data: {
        '7d': DataPoint[];
        '30d': DataPoint[];
        '90d': DataPoint[];
    };
    primaryColor?: string;
    secondaryColor?: string;
    primaryLabel?: string;
    secondaryLabel?: string;
}

/**
 * SegmentedControl - Toggle between time ranges
 */
const SegmentedControl: React.FC<{
    options: { label: string; value: TimeRange }[];
    selected: TimeRange;
    onSelect: (value: TimeRange) => void;
}> = ({ options, selected, onSelect }) => {
    const { colors } = useTheme();
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const selectedIndex = options.findIndex((o) => o.value === selected);
        Animated.spring(slideAnim, {
            toValue: selectedIndex,
            tension: 200,
            friction: 20,
            useNativeDriver: true,
        }).start();
    }, [selected]);

    const segmentWidth = 100 / options.length;

    return (
        <View style={[styles.segmentedControl, { backgroundColor: colors.backgroundSecondary }]}>
            <Animated.View
                style={[
                    styles.segmentIndicator,
                    {
                        backgroundColor: colors.primary,
                        width: `${segmentWidth}%`,
                        transform: [
                            {
                                translateX: slideAnim.interpolate({
                                    inputRange: [0, options.length - 1],
                                    outputRange: [0, (options.length - 1) * (100 / options.length) * 1.2],
                                }),
                            },
                        ],
                    },
                ]}
            />
            {options.map((option) => (
                <TouchableOpacity
                    key={option.value}
                    style={styles.segmentButton}
                    onPress={() => onSelect(option.value)}
                >
                    <Text
                        style={[
                            styles.segmentText,
                            {
                                color: selected === option.value ? colors.card : colors.textSecondary,
                                fontWeight: selected === option.value ? '600' : '400',
                            },
                        ]}
                    >
                        {option.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

/**
 * AreaChart - Simplified area chart for React Native
 */
const AreaChart: React.FC<{
    data: DataPoint[];
    primaryColor: string;
    secondaryColor?: string;
    height: number;
}> = ({ data, primaryColor, secondaryColor, height }) => {
    const { colors } = useTheme();
    const maxValue = Math.max(...data.map((d) => Math.max(d.value, d.secondaryValue || 0)));
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fadeAnim.setValue(0);
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
        }).start();
    }, [data]);

    return (
        <Animated.View style={[styles.chartContainer, { height, opacity: fadeAnim }]}>
            {/* Y-axis labels */}
            <View style={styles.yAxis}>
                <Text style={[styles.axisLabel, { color: colors.textMuted }]}>
                    {maxValue.toLocaleString('pt-BR')}
                </Text>
                <Text style={[styles.axisLabel, { color: colors.textMuted }]}>
                    {Math.round(maxValue / 2).toLocaleString('pt-BR')}
                </Text>
                <Text style={[styles.axisLabel, { color: colors.textMuted }]}>0</Text>
            </View>

            {/* Bars */}
            <View style={styles.barsContainer}>
                {data.map((point, index) => {
                    const primaryHeight = maxValue > 0 ? (point.value / maxValue) * (height - 20) : 0;
                    const secondaryHeight =
                        secondaryColor && point.secondaryValue && maxValue > 0
                            ? (point.secondaryValue / maxValue) * (height - 20)
                            : 0;

                    return (
                        <View key={index} style={styles.barGroup}>
                            <View style={styles.barWrapper}>
                                {secondaryColor && (
                                    <View
                                        style={[
                                            styles.bar,
                                            {
                                                height: secondaryHeight,
                                                backgroundColor: secondaryColor,
                                                opacity: 0.6,
                                            },
                                        ]}
                                    />
                                )}
                                <LinearGradient
                                    colors={[primaryColor, `${primaryColor}80`]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 0, y: 1 }}
                                    style={[styles.bar, { height: primaryHeight }]}
                                />
                            </View>
                            <Text
                                style={[styles.xAxisLabel, { color: colors.textMuted }]}
                                numberOfLines={1}
                            >
                                {point.label}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </Animated.View>
    );
};

/**
 * Legend component
 */
const Legend: React.FC<{
    items: { color: string; label: string }[];
}> = ({ items }) => {
    const { colors } = useTheme();

    return (
        <View style={styles.legend}>
            {items.map((item, index) => (
                <View key={index} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>{item.label}</Text>
                </View>
            ))}
        </View>
    );
};

/**
 * InteractiveChart - Chart with time range toggle
 */
export const InteractiveChart: React.FC<InteractiveChartProps> = ({
    title,
    subtitle,
    data,
    primaryColor,
    secondaryColor,
    primaryLabel = 'Principal',
    secondaryLabel = 'Secundário',
}) => {
    const { colors } = useTheme();
    const [timeRange, setTimeRange] = useState<TimeRange>('30d');
    const chartPrimaryColor = primaryColor || colors.primary;

    const timeRangeOptions = [
        { label: '7 dias', value: '7d' as TimeRange },
        { label: '30 dias', value: '30d' as TimeRange },
        { label: '90 dias', value: '90d' as TimeRange },
    ];

    const currentData = data[timeRange] || [];

    // Calculate totals
    const totalPrimary = currentData.reduce((sum, d) => sum + d.value, 0);
    const totalSecondary = currentData.reduce((sum, d) => sum + (d.secondaryValue || 0), 0);

    return (
        <View style={[styles.card, { backgroundColor: colors.card }, Shadows.lg]}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                    {subtitle && (
                        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
                    )}
                </View>
                <SegmentedControl
                    options={timeRangeOptions}
                    selected={timeRange}
                    onSelect={setTimeRange}
                />
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.stat}>
                    <Text style={[styles.statValue, { color: chartPrimaryColor }]}>
                        {totalPrimary.toLocaleString('pt-BR')}
                    </Text>
                    <Text style={[styles.statLabel, { color: colors.textMuted }]}>{primaryLabel}</Text>
                </View>
                {secondaryColor && (
                    <View style={styles.stat}>
                        <Text style={[styles.statValue, { color: secondaryColor }]}>
                            {totalSecondary.toLocaleString('pt-BR')}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.textMuted }]}>{secondaryLabel}</Text>
                    </View>
                )}
            </View>

            {/* Chart */}
            <AreaChart
                data={currentData}
                primaryColor={chartPrimaryColor}
                secondaryColor={secondaryColor}
                height={180}
            />

            {/* Legend */}
            <Legend
                items={[
                    { color: chartPrimaryColor, label: primaryLabel },
                    ...(secondaryColor ? [{ color: secondaryColor, label: secondaryLabel }] : []),
                ]}
            />
        </View>
    );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    card: {
        borderRadius: Radius.lg,
        padding: 16,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 12,
    },
    title: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
        marginBottom: 2,
    },
    subtitle: {
        fontSize: Typography.sizes.sm,
    },
    segmentedControl: {
        flexDirection: 'row',
        borderRadius: Radius.md,
        padding: 4,
        position: 'relative',
        overflow: 'hidden',
    },
    segmentIndicator: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        left: 4,
        borderRadius: Radius.sm,
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 6,
        paddingHorizontal: 12,
        alignItems: 'center',
        zIndex: 1,
    },
    segmentText: {
        fontSize: Typography.sizes.xs,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 24,
        marginBottom: 16,
    },
    stat: {},
    statValue: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
    },
    statLabel: {
        fontSize: Typography.sizes.xs,
    },
    chartContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    yAxis: {
        width: 50,
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingRight: 8,
    },
    axisLabel: {
        fontSize: Typography.sizes.xs,
    },
    barsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 4,
    },
    barGroup: {
        flex: 1,
        alignItems: 'center',
    },
    barWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 2,
        width: '100%',
    },
    bar: {
        flex: 1,
        borderRadius: 3,
        minWidth: 4,
    },
    xAxisLabel: {
        fontSize: 8,
        marginTop: 4,
    },
    legend: {
        flexDirection: 'row',
        gap: 16,
        justifyContent: 'center',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: Typography.sizes.xs,
    },
});

export default InteractiveChart;
