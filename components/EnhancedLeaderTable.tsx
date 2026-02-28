import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Modal,
    ScrollView,
    Platform,
} from 'react-native';
import {
    ChevronRight,
    ArrowUpDown,
    X,
    TrendingUp,
    TrendingDown,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/contexts/ThemeContext';
import { Radius, Typography, Shadows } from '@/constants/colors';

interface Leader {
    id: string;
    name: string;
    region: string;
    votersCount: number;
    votersGoal: number;
    phone?: string;
    email?: string;
}

interface EnhancedLeaderTableProps {
    leaders: Leader[];
    title?: string;
    onLeaderPress?: (leader: Leader) => void;
    maxVisible?: number;
}

type SortField = 'name' | 'progress' | 'voters';
type SortOrder = 'asc' | 'desc';

/**
 * Avatar component with initials
 */
const Avatar: React.FC<{ name: string; size?: number }> = ({ name, size = 40 }) => {
    const { colors, isDark } = useTheme();

    // Generate color from name hash
    const getColorFromName = (name: string) => {
        const colors = [
            '#1E40AF', '#059669', '#D97706', '#DC2626', '#7C3AED',
            '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    const initials = name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const bgColor = getColorFromName(name);

    return (
        <View style={[styles.avatar, { width: size, height: size, backgroundColor: bgColor }]}>
            <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>{initials}</Text>
        </View>
    );
};

/**
 * Progress bar with animation
 */
const AnimatedProgressBar: React.FC<{
    percentage: number;
    color: string;
    delay?: number;
}> = ({ percentage, color, delay = 0 }) => {
    const { colors } = useTheme();
    const widthAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(widthAnim, {
            toValue: Math.min(percentage, 100),
            duration: 800,
            delay,
            useNativeDriver: false,
        }).start();
    }, [percentage, delay]);

    return (
        <View style={[styles.progressBar, { backgroundColor: colors.backgroundTertiary }]}>
            <Animated.View
                style={[
                    styles.progressFill,
                    {
                        backgroundColor: color,
                        width: widthAnim.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'],
                        }),
                    },
                ]}
            />
        </View>
    );
};

/**
 * Leader row item
 */
const LeaderRow: React.FC<{
    leader: Leader;
    index: number;
    onPress: () => void;
}> = ({ leader, index, onPress }) => {
    const { colors } = useTheme();
    const percentage = Math.round((leader.votersCount / leader.votersGoal) * 100);
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            delay: index * 50,
            useNativeDriver: true,
        }).start();
    }, [index]);

    const progressColor =
        percentage >= 80
            ? colors.success
            : percentage >= 50
                ? colors.warning
                : colors.error;

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
                    styles.row,
                    {
                        backgroundColor: colors.card,
                        borderBottomColor: colors.divider,
                        opacity: opacityAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Avatar name={leader.name} />
                <View style={styles.rowContent}>
                    <View style={styles.rowHeader}>
                        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                            {leader.name}
                        </Text>
                        <View style={[styles.badge, { backgroundColor: `${progressColor}20` }]}>
                            <Text style={[styles.badgeText, { color: progressColor }]}>{percentage}%</Text>
                        </View>
                    </View>
                    <Text style={[styles.region, { color: colors.textSecondary }]} numberOfLines={1}>
                        {leader.region}
                    </Text>
                    <View style={styles.progressRow}>
                        <AnimatedProgressBar percentage={percentage} color={progressColor} delay={index * 50} />
                        <Text style={[styles.votersCount, { color: colors.textMuted }]}>
                            {leader.votersCount}/{leader.votersGoal}
                        </Text>
                    </View>
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
            </Animated.View>
        </TouchableOpacity>
    );
};

/**
 * Sort button
 */
const SortButton: React.FC<{
    label: string;
    active: boolean;
    order: SortOrder;
    onPress: () => void;
}> = ({ label, active, order, onPress }) => {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.sortButton,
                {
                    backgroundColor: active ? colors.primaryLight : colors.backgroundSecondary,
                    borderColor: active ? colors.primary : colors.border,
                },
            ]}
            onPress={onPress}
        >
            <Text
                style={[
                    styles.sortButtonText,
                    { color: active ? colors.primary : colors.textSecondary },
                ]}
            >
                {label}
            </Text>
            {active && (
                order === 'asc' ? (
                    <TrendingUp size={12} color={colors.primary} />
                ) : (
                    <TrendingDown size={12} color={colors.primary} />
                )
            )}
        </TouchableOpacity>
    );
};

/**
 * Leader detail drawer/modal
 */
const LeaderDetailSheet: React.FC<{
    leader: Leader | null;
    visible: boolean;
    onClose: () => void;
}> = ({ leader, visible, onClose }) => {
    const { colors } = useTheme();
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 100,
                friction: 10,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 300,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    if (!leader) return null;

    const percentage = Math.round((leader.votersCount / leader.votersGoal) * 100);
    const progressColor =
        percentage >= 80
            ? colors.success
            : percentage >= 50
                ? colors.warning
                : colors.error;

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity
                style={[styles.sheetOverlay, { backgroundColor: colors.overlay }]}
                activeOpacity={1}
                onPress={onClose}
            >
                <Animated.View
                    style={[
                        styles.sheetContent,
                        {
                            backgroundColor: colors.card,
                            transform: [{ translateY: slideAnim }],
                        },
                    ]}
                >
                    <View style={styles.sheetHeader}>
                        <Text style={[styles.sheetTitle, { color: colors.text }]}>Detalhes da Liderança</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sheetBody}>
                        <View style={styles.sheetProfile}>
                            <Avatar name={leader.name} size={64} />
                            <View style={styles.sheetProfileInfo}>
                                <Text style={[styles.sheetName, { color: colors.text }]}>{leader.name}</Text>
                                <Text style={[styles.sheetRegion, { color: colors.textSecondary }]}>
                                    {leader.region}
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.sheetStats, { backgroundColor: colors.backgroundSecondary }]}>
                            <View style={styles.sheetStat}>
                                <Text style={[styles.sheetStatValue, { color: colors.primary }]}>
                                    {leader.votersCount}
                                </Text>
                                <Text style={[styles.sheetStatLabel, { color: colors.textMuted }]}>
                                    Eleitores
                                </Text>
                            </View>
                            <View style={[styles.sheetDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.sheetStat}>
                                <Text style={[styles.sheetStatValue, { color: colors.textSecondary }]}>
                                    {leader.votersGoal}
                                </Text>
                                <Text style={[styles.sheetStatLabel, { color: colors.textMuted }]}>Meta</Text>
                            </View>
                            <View style={[styles.sheetDivider, { backgroundColor: colors.border }]} />
                            <View style={styles.sheetStat}>
                                <Text style={[styles.sheetStatValue, { color: progressColor }]}>{percentage}%</Text>
                                <Text style={[styles.sheetStatLabel, { color: colors.textMuted }]}>Progresso</Text>
                            </View>
                        </View>

                        <View style={styles.sheetProgress}>
                            <Text style={[styles.sheetProgressLabel, { color: colors.textSecondary }]}>
                                Progresso da Meta
                            </Text>
                            <AnimatedProgressBar percentage={percentage} color={progressColor} />
                        </View>
                    </View>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
};

/**
 * EnhancedLeaderTable - Sortable leader list with drawer
 */
export const EnhancedLeaderTable: React.FC<EnhancedLeaderTableProps> = ({
    leaders,
    title = 'Desempenho das Lideranças',
    onLeaderPress,
    maxVisible = 5,
}) => {
    const { colors } = useTheme();
    const [sortField, setSortField] = useState<SortField>('progress');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);
    const [showAll, setShowAll] = useState(false);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const sortedLeaders = [...leaders].sort((a, b) => {
        let comparison = 0;
        switch (sortField) {
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            case 'progress':
                comparison =
                    a.votersCount / a.votersGoal - b.votersCount / b.votersGoal;
                break;
            case 'voters':
                comparison = a.votersCount - b.votersCount;
                break;
        }
        return sortOrder === 'asc' ? comparison : -comparison;
    });

    const displayedLeaders = showAll ? sortedLeaders : sortedLeaders.slice(0, maxVisible);

    const handleLeaderPress = (leader: Leader) => {
        setSelectedLeader(leader);
        onLeaderPress?.(leader);
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
                <View style={styles.sortButtons}>
                    <SortButton
                        label="Nome"
                        active={sortField === 'name'}
                        order={sortOrder}
                        onPress={() => handleSort('name')}
                    />
                    <SortButton
                        label="Progresso"
                        active={sortField === 'progress'}
                        order={sortOrder}
                        onPress={() => handleSort('progress')}
                    />
                </View>
            </View>

            {/* List */}
            <View style={[styles.list, { backgroundColor: colors.card }, Shadows.md]}>
                {displayedLeaders.map((leader, index) => (
                    <LeaderRow
                        key={leader.id}
                        leader={leader}
                        index={index}
                        onPress={() => handleLeaderPress(leader)}
                    />
                ))}
            </View>

            {/* Show more button */}
            {leaders.length > maxVisible && (
                <TouchableOpacity
                    style={[styles.showMoreButton, { borderColor: colors.border }]}
                    onPress={() => setShowAll(!showAll)}
                >
                    <Text style={[styles.showMoreText, { color: colors.primary }]}>
                        {showAll ? 'Ver menos' : `Ver todos (${leaders.length})`}
                    </Text>
                </TouchableOpacity>
            )}

            {/* Detail Sheet */}
            <LeaderDetailSheet
                leader={selectedLeader}
                visible={!!selectedLeader}
                onClose={() => setSelectedLeader(null)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        flexWrap: 'wrap',
        gap: 8,
    },
    title: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
    sortButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: Radius.full,
        borderWidth: 1,
    },
    sortButtonText: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.medium,
    },
    list: {
        borderRadius: Radius.lg,
        overflow: 'hidden',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        gap: 12,
    },
    avatar: {
        borderRadius: Radius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: Typography.weights.semibold,
    },
    rowContent: {
        flex: 1,
        gap: 4,
    },
    rowHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.medium,
        flex: 1,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: Radius.full,
    },
    badgeText: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.semibold,
    },
    region: {
        fontSize: Typography.sizes.sm,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressBar: {
        flex: 1,
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    votersCount: {
        fontSize: Typography.sizes.xs,
        minWidth: 60,
        textAlign: 'right',
    },
    showMoreButton: {
        marginTop: 12,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: Radius.md,
    },
    showMoreText: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    sheetOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheetContent: {
        borderTopLeftRadius: Radius.xl,
        borderTopRightRadius: Radius.xl,
        paddingBottom: 32,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    sheetTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
    sheetBody: {
        padding: 16,
    },
    sheetProfile: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
    },
    sheetProfileInfo: {
        flex: 1,
    },
    sheetName: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
        marginBottom: 4,
    },
    sheetRegion: {
        fontSize: Typography.sizes.base,
    },
    sheetStats: {
        flexDirection: 'row',
        borderRadius: Radius.lg,
        padding: 16,
        marginBottom: 24,
    },
    sheetStat: {
        flex: 1,
        alignItems: 'center',
    },
    sheetStatValue: {
        fontSize: Typography.sizes.xxl,
        fontWeight: Typography.weights.bold,
        marginBottom: 4,
    },
    sheetStatLabel: {
        fontSize: Typography.sizes.xs,
    },
    sheetDivider: {
        width: 1,
        height: '100%',
    },
    sheetProgress: {
        gap: 8,
    },
    sheetProgressLabel: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
});

export default EnhancedLeaderTable;
