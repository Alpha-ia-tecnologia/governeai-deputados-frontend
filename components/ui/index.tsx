import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Modal,
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Radius, Typography, Shadows } from '@/constants/colors';

/**
 * Tooltip - Press and hold to show
 */
interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top',
}) => {
    const { colors } = useTheme();
    const [visible, setVisible] = useState(false);
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const pressTimer = useRef<NodeJS.Timeout | null>(null);

    const showTooltip = () => {
        setVisible(true);
        Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
    };

    const hideTooltip = () => {
        Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => setVisible(false));
    };

    const handlePressIn = () => {
        pressTimer.current = setTimeout(showTooltip, 500);
    };

    const handlePressOut = () => {
        if (pressTimer.current) {
            clearTimeout(pressTimer.current);
        }
        hideTooltip();
    };

    const getPositionStyle = () => {
        switch (position) {
            case 'bottom':
                return { top: '100%', marginTop: 8 };
            case 'left':
                return { right: '100%', marginRight: 8, top: '50%' };
            case 'right':
                return { left: '100%', marginLeft: 8, top: '50%' };
            default:
                return { bottom: '100%', marginBottom: 8 };
        }
    };

    return (
        <View>
            <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                activeOpacity={1}
            >
                {children}
            </TouchableOpacity>
            {visible && (
                <Animated.View
                    style={[
                        styles.tooltip,
                        {
                            backgroundColor: colors.backgroundTertiary,
                            opacity: opacityAnim,
                        },
                        getPositionStyle(),
                    ]}
                >
                    <Text style={[styles.tooltipText, { color: colors.text }]}>{content}</Text>
                </Animated.View>
            )}
        </View>
    );
};

/**
 * Avatar - With initials and image fallback
 */
interface AvatarProps {
    name?: string;
    src?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: string;
}

const sizeMap = { sm: 24, md: 32, lg: 40, xl: 56 };

export const Avatar: React.FC<AvatarProps> = ({
    name = 'User',
    src,
    size = 'md',
    color,
}) => {
    const { colors } = useTheme();
    const avatarSize = sizeMap[size];

    const getColorFromName = (name: string) => {
        const palette = [
            '#1E40AF', '#059669', '#D97706', '#DC2626', '#7C3AED',
            '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return palette[Math.abs(hash) % palette.length];
    };

    const initials = name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const bgColor = color || getColorFromName(name);

    return (
        <View
            style={[
                styles.avatar,
                {
                    width: avatarSize,
                    height: avatarSize,
                    backgroundColor: bgColor,
                    borderRadius: avatarSize / 2,
                },
            ]}
        >
            <Text style={[styles.avatarText, { fontSize: avatarSize * 0.4 }]}>{initials}</Text>
        </View>
    );
};

/**
 * Breadcrumb - Hierarchical navigation
 */
interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    onNavigate?: (href: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, onNavigate }) => {
    const { colors } = useTheme();

    return (
        <View style={styles.breadcrumb}>
            {items.map((item, index) => {
                const isLast = index === items.length - 1;

                return (
                    <View key={index} style={styles.breadcrumbItem}>
                        {item.href && !isLast ? (
                            <TouchableOpacity onPress={() => onNavigate?.(item.href!)}>
                                <Text style={[styles.breadcrumbLink, { color: colors.primary }]}>
                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <Text
                                style={[
                                    styles.breadcrumbText,
                                    { color: isLast ? colors.text : colors.textSecondary },
                                ]}
                            >
                                {item.label}
                            </Text>
                        )}
                        {!isLast && (
                            <Text style={[styles.breadcrumbSeparator, { color: colors.textMuted }]}>
                                /
                            </Text>
                        )}
                    </View>
                );
            })}
        </View>
    );
};

/**
 * Sheet - Sliding drawer
 */
interface SheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    side?: 'left' | 'right' | 'bottom';
    title?: string;
}

export const Sheet: React.FC<SheetProps> = ({
    visible,
    onClose,
    children,
    side = 'right',
    title,
}) => {
    const { colors } = useTheme();
    const slideAnim = useRef(new Animated.Value(side === 'bottom' ? 500 : 300)).current;

    useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 100,
                friction: 12,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: side === 'bottom' ? 500 : 300,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible, side]);

    const getTransform = () => {
        switch (side) {
            case 'left':
                return [{ translateX: Animated.multiply(slideAnim, -1) }];
            case 'bottom':
                return [{ translateY: slideAnim }];
            default:
                return [{ translateX: slideAnim }];
        }
    };

    const getContainerStyle = () => {
        switch (side) {
            case 'left':
                return { left: 0, top: 0, bottom: 0, width: 300 };
            case 'bottom':
                return { left: 0, right: 0, bottom: 0 };
            default:
                return { right: 0, top: 0, bottom: 0, width: 300 };
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity
                style={[styles.sheetOverlay, { backgroundColor: colors.overlay }]}
                activeOpacity={1}
                onPress={onClose}
            >
                <Animated.View
                    style={[
                        styles.sheetContainer,
                        {
                            backgroundColor: colors.card,
                            transform: getTransform(),
                        },
                        getContainerStyle(),
                        side === 'bottom' && styles.sheetBottom,
                    ]}
                >
                    {title && (
                        <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.sheetTitle, { color: colors.text }]}>{title}</Text>
                        </View>
                    )}
                    <View style={styles.sheetContent}>{children}</View>
                </Animated.View>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    // Tooltip
    tooltip: {
        position: 'absolute',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: Radius.md,
        zIndex: 1000,
        ...Shadows.md,
    },
    tooltipText: {
        fontSize: Typography.sizes.sm,
    },

    // Avatar
    avatar: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: Typography.weights.semibold,
    },

    // Breadcrumb
    breadcrumb: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    breadcrumbItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    breadcrumbLink: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    breadcrumbText: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    breadcrumbSeparator: {
        marginHorizontal: 8,
        fontSize: Typography.sizes.sm,
    },

    // Sheet
    sheetOverlay: {
        flex: 1,
    },
    sheetContainer: {
        position: 'absolute',
        ...Shadows.xl,
    },
    sheetBottom: {
        borderTopLeftRadius: Radius.xl,
        borderTopRightRadius: Radius.xl,
    },
    sheetHeader: {
        padding: 16,
        borderBottomWidth: 1,
    },
    sheetTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
    sheetContent: {
        flex: 1,
    },
});

export { Tooltip as default };
