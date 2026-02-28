/**
 * Governe AI - Componentes Avançados
 * Tabs, Tooltip, Toast e outros componentes interativos
 * 
 * @version 1.0.0
 */

import React, { useRef, useEffect, useState, createContext, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    ScrollView,
    Pressable,
    Modal,
    Dimensions,
    Platform,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
} from 'react-native';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    X,
    LucideIcon,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import Colors, { Spacing, Radius, Typography, Shadows, withOpacity } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =============================================================================
// TABS
// =============================================================================

interface Tab {
    key: string;
    label: string;
    icon?: React.ReactNode;
    badge?: number | string;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (key: string) => void;
    variant?: 'default' | 'pills' | 'underline';
    fullWidth?: boolean;
    style?: ViewStyle;
}

export const Tabs: React.FC<TabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
    variant = 'default',
    fullWidth = false,
    style,
}) => {
    const { colors, isDark } = useTheme();
    const indicatorAnim = useRef(new Animated.Value(0)).current;
    const [tabWidths, setTabWidths] = useState<number[]>([]);
    const [tabPositions, setTabPositions] = useState<number[]>([]);

    const activeIndex = tabs.findIndex(t => t.key === activeTab);

    useEffect(() => {
        if (variant === 'underline' && tabPositions.length > 0) {
            Animated.spring(indicatorAnim, {
                toValue: tabPositions[activeIndex] || 0,
                tension: 300,
                friction: 30,
                useNativeDriver: true,
            }).start();
        }
    }, [activeIndex, tabPositions, variant]);

    const handleTabLayout = (index: number, x: number, width: number) => {
        setTabWidths(prev => {
            const newWidths = [...prev];
            newWidths[index] = width;
            return newWidths;
        });
        setTabPositions(prev => {
            const newPositions = [...prev];
            newPositions[index] = x;
            return newPositions;
        });
    };

    const getTabStyle = (isActive: boolean): ViewStyle => {
        switch (variant) {
            case 'pills':
                return {
                    backgroundColor: isActive ? colors.primary : 'transparent',
                    paddingHorizontal: Spacing.lg,
                    paddingVertical: Spacing.sm,
                    borderRadius: Radius.full,
                };
            case 'underline':
                return {
                    paddingHorizontal: Spacing.lg,
                    paddingVertical: Spacing.md,
                    borderBottomWidth: 0,
                };
            default:
                return {
                    backgroundColor: isActive
                        ? (isDark ? colors.backgroundSecondary : colors.primary + '15')
                        : 'transparent',
                    paddingHorizontal: Spacing.lg,
                    paddingVertical: Spacing.sm,
                    borderRadius: Radius.md,
                };
        }
    };

    const getTextStyle = (isActive: boolean): TextStyle => {
        const baseStyle: TextStyle = {
            fontSize: Typography.sizes.sm,
            fontWeight: isActive ? Typography.weights.semibold : Typography.weights.medium,
        };

        switch (variant) {
            case 'pills':
                return { ...baseStyle, color: isActive ? '#FFFFFF' : colors.textSecondary };
            default:
                return { ...baseStyle, color: isActive ? colors.primary : colors.textSecondary };
        }
    };

    return (
        <View style={style}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                    styles.tabsContainer,
                    fullWidth && { flex: 1 },
                    variant === 'underline' && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border
                    },
                ]}
            >
                {tabs.map((tab, index) => {
                    const isActive = tab.key === activeTab;
                    return (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tab,
                                getTabStyle(isActive),
                                fullWidth && { flex: 1 },
                            ]}
                            onPress={() => onTabChange(tab.key)}
                            onLayout={(e) => {
                                const { x, width } = e.nativeEvent.layout;
                                handleTabLayout(index, x, width);
                            }}
                        >
                            {tab.icon && <View style={styles.tabIcon}>{tab.icon}</View>}
                            <Text style={getTextStyle(isActive)}>{tab.label}</Text>
                            {tab.badge !== undefined && (
                                <View style={[styles.tabBadge, { backgroundColor: colors.error }]}>
                                    <Text style={styles.tabBadgeText}>{tab.badge}</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}

                {/* Underline indicator */}
                {variant === 'underline' && tabWidths[activeIndex] && (
                    <Animated.View
                        style={[
                            styles.tabIndicator,
                            {
                                backgroundColor: colors.primary,
                                width: tabWidths[activeIndex],
                                transform: [{ translateX: indicatorAnim }],
                            },
                        ]}
                    />
                )}
            </ScrollView>
        </View>
    );
};

// =============================================================================
// TOOLTIP
// =============================================================================

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    position = 'top',
    delay = 200,
}) => {
    const { colors, isDark } = useTheme();
    const [visible, setVisible] = useState(false);
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const show = () => {
        timeoutRef.current = setTimeout(() => {
            setVisible(true);
            Animated.parallel([
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 300,
                    friction: 20,
                    useNativeDriver: true,
                }),
            ]).start();
        }, delay);
    };

    const hide = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        Animated.parallel([
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
            }),
        ]).start(() => setVisible(false));
    };

    const getPositionStyle = (): ViewStyle => {
        switch (position) {
            case 'bottom':
                return { top: '100%', marginTop: 8 };
            case 'left':
                return { right: '100%', marginRight: 8 };
            case 'right':
                return { left: '100%', marginLeft: 8 };
            default:
                return { bottom: '100%', marginBottom: 8 };
        }
    };

    return (
        <View style={styles.tooltipContainer}>
            <Pressable onPressIn={show} onPressOut={hide}>
                {children}
            </Pressable>
            {visible && (
                <Animated.View
                    style={[
                        styles.tooltip,
                        {
                            backgroundColor: isDark ? colors.backgroundSecondary : '#1F2937',
                            opacity: opacityAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                        getPositionStyle(),
                    ]}
                >
                    <Text style={styles.tooltipText}>{content}</Text>
                </Animated.View>
            )}
        </View>
    );
};

// =============================================================================
// TOAST SYSTEM
// =============================================================================

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    description?: string;
    duration?: number;
}

interface ToastContextValue {
    toasts: Toast[];
    showToast: (toast: Omit<Toast, 'id'>) => void;
    hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = (toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toast, id };
        setToasts(prev => [...prev, newToast]);

        // Auto dismiss
        const duration = toast.duration ?? 4000;
        if (duration > 0) {
            setTimeout(() => hideToast(id), duration);
        }
    };

    const hideToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    );
};

const ToastContainer: React.FC = () => {
    const context = useContext(ToastContext);
    if (!context) return null;

    const { toasts, hideToast } = context;

    return (
        <View style={styles.toastContainer} pointerEvents="box-none">
            {toasts.map((toast, index) => (
                <ToastItem
                    key={toast.id}
                    toast={toast}
                    index={index}
                    onDismiss={() => hideToast(toast.id)}
                />
            ))}
        </View>
    );
};

interface ToastItemProps {
    toast: Toast;
    index: number;
    onDismiss: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, index, onDismiss }) => {
    const { colors, isDark } = useTheme();
    const slideAnim = useRef(new Animated.Value(100)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 100,
                friction: 10,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleDismiss = () => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 100,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(onDismiss);
    };

    const getIcon = (): React.ReactNode => {
        const size = 22;
        switch (toast.type) {
            case 'success':
                return <CheckCircle color={colors.success} size={size} />;
            case 'error':
                return <XCircle color={colors.error} size={size} />;
            case 'warning':
                return <AlertTriangle color={colors.warning} size={size} />;
            case 'info':
                return <Info color={colors.info} size={size} />;
        }
    };

    const getBorderColor = (): string => {
        switch (toast.type) {
            case 'success': return colors.success;
            case 'error': return colors.error;
            case 'warning': return colors.warning;
            case 'info': return colors.info;
        }
    };

    return (
        <Animated.View
            style={[
                styles.toast,
                {
                    backgroundColor: colors.card,
                    borderLeftColor: getBorderColor(),
                    transform: [{ translateY: slideAnim }],
                    opacity: opacityAnim,
                    marginBottom: index > 0 ? Spacing.sm : 0,
                    ...Platform.select({
                        ios: Shadows.xl,
                        android: { elevation: 8 },
                        web: {
                            boxShadow: isDark
                                ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                                : '0 8px 24px rgba(0, 0, 0, 0.15)'
                        } as any,
                    }),
                },
            ]}
        >
            <View style={styles.toastIcon}>
                {getIcon()}
            </View>
            <View style={styles.toastContent}>
                <Text style={[styles.toastTitle, { color: colors.text }]}>{toast.title}</Text>
                {toast.description && (
                    <Text style={[styles.toastDescription, { color: colors.textSecondary }]}>
                        {toast.description}
                    </Text>
                )}
            </View>
            <TouchableOpacity onPress={handleDismiss} style={styles.toastClose}>
                <X color={colors.textSecondary} size={18} />
            </TouchableOpacity>
        </Animated.View>
    );
};

// =============================================================================
// CHIP / TAG
// =============================================================================

interface ChipProps {
    label: string;
    selected?: boolean;
    onPress?: () => void;
    onRemove?: () => void;
    icon?: React.ReactNode;
    color?: string;
    variant?: 'filled' | 'outlined';
    size?: 'sm' | 'md';
    disabled?: boolean;
    style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
    label,
    selected = false,
    onPress,
    onRemove,
    icon,
    color,
    variant = 'filled',
    size = 'md',
    disabled = false,
    style,
}) => {
    const { colors, isDark } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const accentColor = color || colors.primary;

    const handlePressIn = () => {
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

    const isSmall = size === 'sm';

    const getStyles = (): { container: ViewStyle; text: TextStyle } => {
        if (variant === 'outlined') {
            return {
                container: {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: selected ? accentColor : colors.border,
                },
                text: {
                    color: selected ? accentColor : colors.text,
                },
            };
        }

        return {
            container: {
                backgroundColor: selected
                    ? accentColor
                    : withOpacity(accentColor, isDark ? 0.2 : 0.1),
                borderWidth: 0,
            },
            text: {
                color: selected ? '#FFFFFF' : accentColor,
            },
        };
    };

    const chipStyles = getStyles();

    const content = (
        <Animated.View
            style={[
                styles.chip,
                chipStyles.container,
                {
                    paddingVertical: isSmall ? Spacing.xs : Spacing.sm,
                    paddingHorizontal: isSmall ? Spacing.sm : Spacing.md,
                    opacity: disabled ? 0.5 : 1,
                    transform: [{ scale: scaleAnim }],
                },
                style,
            ]}
        >
            {icon && <View style={styles.chipIcon}>{icon}</View>}
            <Text
                style={[
                    styles.chipText,
                    chipStyles.text,
                    { fontSize: isSmall ? Typography.sizes.xs : Typography.sizes.sm },
                ]}
            >
                {label}
            </Text>
            {onRemove && (
                <TouchableOpacity onPress={onRemove} style={styles.chipRemove}>
                    <X color={chipStyles.text.color as string} size={14} />
                </TouchableOpacity>
            )}
        </Animated.View>
    );

    if (onPress) {
        return (
            <Pressable
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={disabled}
            >
                {content}
            </Pressable>
        );
    }

    return content;
};

// =============================================================================
// CHIP GROUP (for multi-select filters)
// =============================================================================

interface ChipGroupProps {
    options: { key: string; label: string; icon?: React.ReactNode }[];
    selected: string[];
    onChange: (selected: string[]) => void;
    multiple?: boolean;
    style?: ViewStyle;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({
    options,
    selected,
    onChange,
    multiple = true,
    style,
}) => {
    const handlePress = (key: string) => {
        if (multiple) {
            if (selected.includes(key)) {
                onChange(selected.filter(k => k !== key));
            } else {
                onChange([...selected, key]);
            }
        } else {
            onChange(selected.includes(key) ? [] : [key]);
        }
    };

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.chipGroup, style]}
        >
            {options.map(option => (
                <Chip
                    key={option.key}
                    label={option.label}
                    icon={option.icon}
                    selected={selected.includes(option.key)}
                    onPress={() => handlePress(option.key)}
                    style={styles.chipGroupItem}
                />
            ))}
        </ScrollView>
    );
};

// =============================================================================
// SEGMENTED CONTROL
// =============================================================================

interface SegmentedControlProps {
    segments: { key: string; label: string }[];
    selectedKey: string;
    onChange: (key: string) => void;
    style?: ViewStyle;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
    segments,
    selectedKey,
    onChange,
    style,
}) => {
    const { colors, isDark } = useTheme();
    const indicatorAnim = useRef(new Animated.Value(0)).current;
    const selectedIndex = segments.findIndex(s => s.key === selectedKey);
    const segmentWidth = 100 / segments.length;

    useEffect(() => {
        Animated.spring(indicatorAnim, {
            toValue: selectedIndex * segmentWidth,
            tension: 300,
            friction: 30,
            useNativeDriver: false,
        }).start();
    }, [selectedIndex, segmentWidth]);

    return (
        <View
            style={[
                styles.segmentedControl,
                { backgroundColor: isDark ? colors.backgroundSecondary : colors.border },
                style,
            ]}
        >
            <Animated.View
                style={[
                    styles.segmentIndicator,
                    {
                        width: `${segmentWidth}%`,
                        backgroundColor: colors.card,
                        left: indicatorAnim.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%'],
                        }),
                        ...Platform.select({
                            ios: Shadows.sm,
                            android: { elevation: 1 },
                        }),
                    },
                ]}
            />
            {segments.map((segment) => (
                <TouchableOpacity
                    key={segment.key}
                    style={[styles.segment, { width: `${segmentWidth}%` }]}
                    onPress={() => onChange(segment.key)}
                >
                    <Text
                        style={[
                            styles.segmentText,
                            {
                                color: segment.key === selectedKey
                                    ? colors.text
                                    : colors.textSecondary,
                                fontWeight: segment.key === selectedKey
                                    ? Typography.weights.semibold
                                    : Typography.weights.normal,
                            },
                        ]}
                    >
                        {segment.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

// =============================================================================
// ALERT DIALOG
// =============================================================================

type AlertDialogVariant = 'danger' | 'warning' | 'info' | 'success';

interface AlertDialogProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: AlertDialogVariant;
    loading?: boolean;
    icon?: React.ReactNode;
    showCancel?: boolean;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
    visible,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger',
    loading = false,
    icon,
    showCancel = true,
}) => {
    const { colors, isDark } = useTheme();
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 200,
                    friction: 20,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0.9,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    const getVariantColors = () => {
        switch (variant) {
            case 'danger':
                return {
                    primary: colors.error,
                    bg: withOpacity(colors.error, 0.12),
                    iconBg: withOpacity(colors.error, 0.15),
                };
            case 'warning':
                return {
                    primary: colors.warning,
                    bg: withOpacity(colors.warning, 0.12),
                    iconBg: withOpacity(colors.warning, 0.15),
                };
            case 'success':
                return {
                    primary: colors.success,
                    bg: withOpacity(colors.success, 0.12),
                    iconBg: withOpacity(colors.success, 0.15),
                };
            default:
                return {
                    primary: colors.info,
                    bg: withOpacity(colors.info, 0.12),
                    iconBg: withOpacity(colors.info, 0.15),
                };
        }
    };

    const getDefaultIcon = () => {
        const size = 28;
        const variantColors = getVariantColors();
        switch (variant) {
            case 'danger':
                return <AlertTriangle color={variantColors.primary} size={size} />;
            case 'warning':
                return <AlertTriangle color={variantColors.primary} size={size} />;
            case 'success':
                return <CheckCircle color={variantColors.primary} size={size} />;
            default:
                return <Info color={variantColors.primary} size={size} />;
        }
    };

    const variantColors = getVariantColors();

    if (!visible) return null;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="none"
            onRequestClose={onClose}
        >
            <Animated.View
                style={[
                    styles.alertDialogOverlay,
                    { opacity: opacityAnim },
                ]}
            >
                <Pressable style={styles.alertDialogBackdrop} onPress={onClose} />
                <Animated.View
                    style={[
                        styles.alertDialogContainer,
                        {
                            backgroundColor: colors.card,
                            transform: [{ scale: scaleAnim }],
                            ...Platform.select({
                                ios: Shadows.xl,
                                android: { elevation: 24 },
                                web: {
                                    boxShadow: isDark
                                        ? '0 25px 50px rgba(0, 0, 0, 0.5)'
                                        : '0 25px 50px rgba(0, 0, 0, 0.25)',
                                } as any,
                            }),
                        },
                    ]}
                >
                    {/* Icon */}
                    <View
                        style={[
                            styles.alertDialogIconContainer,
                            { backgroundColor: variantColors.iconBg },
                        ]}
                    >
                        {icon || getDefaultIcon()}
                    </View>

                    {/* Content */}
                    <Text style={[styles.alertDialogTitle, { color: colors.text }]}>
                        {title}
                    </Text>
                    {description && (
                        <Text style={[styles.alertDialogDescription, { color: colors.textSecondary }]}>
                            {description}
                        </Text>
                    )}

                    {/* Actions */}
                    <View style={styles.alertDialogActions}>
                        {showCancel && (
                            <TouchableOpacity
                                style={[
                                    styles.alertDialogButton,
                                    styles.alertDialogCancelButton,
                                    {
                                        backgroundColor: isDark
                                            ? colors.backgroundSecondary
                                            : colors.border,
                                    },
                                ]}
                                onPress={onClose}
                                disabled={loading}
                            >
                                <Text style={[styles.alertDialogButtonText, { color: colors.text }]}>
                                    {cancelText}
                                </Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[
                                styles.alertDialogButton,
                                styles.alertDialogConfirmButton,
                                { backgroundColor: variantColors.primary },
                                loading && { opacity: 0.7 },
                            ]}
                            onPress={onConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={[styles.alertDialogButtonText, { color: '#FFFFFF' }]}>
                                    {confirmText}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

// Hook para usar AlertDialog de forma imperativa
interface AlertDialogState {
    visible: boolean;
    title: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    variant?: AlertDialogVariant;
    onConfirm?: () => void | Promise<void>;
    showCancel?: boolean;
}

export const useAlertDialog = () => {
    const [state, setState] = useState<AlertDialogState>({
        visible: false,
        title: '',
    });
    const [loading, setLoading] = useState(false);

    const showAlert = (options: Omit<AlertDialogState, 'visible'>) => {
        setState({
            ...options,
            visible: true,
        });
    };

    const hideAlert = () => {
        setState(prev => ({ ...prev, visible: false }));
        setLoading(false);
    };

    const handleConfirm = async () => {
        if (state.onConfirm) {
            setLoading(true);
            try {
                await state.onConfirm();
            } finally {
                setLoading(false);
                hideAlert();
            }
        } else {
            hideAlert();
        }
    };

    const AlertDialogComponent = (
        <AlertDialog
            visible={state.visible}
            onClose={hideAlert}
            onConfirm={handleConfirm}
            title={state.title}
            description={state.description}
            confirmText={state.confirmText}
            cancelText={state.cancelText}
            variant={state.variant}
            loading={loading}
            showCancel={state.showCancel !== false}
        />
    );

    return {
        showAlert,
        hideAlert,
        AlertDialogComponent,
    };
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        gap: Spacing.xs,
        position: 'relative',
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    tabIcon: {
        marginRight: 2,
    },
    tabBadge: {
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
        marginLeft: Spacing.xs,
    },
    tabBadgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: Typography.weights.bold,
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        height: 3,
        borderRadius: 2,
    },

    // Tooltip
    tooltipContainer: {
        position: 'relative',
    },
    tooltip: {
        position: 'absolute',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.sm,
        zIndex: 1000,
        alignSelf: 'center',
    },
    tooltipText: {
        color: '#FFFFFF',
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },

    // Toast
    toastContainer: {
        position: 'absolute',
        bottom: 100,
        left: Spacing.lg,
        right: Spacing.lg,
        zIndex: 9999,
    },
    toast: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: Spacing.lg,
        borderRadius: Radius.lg,
        borderLeftWidth: 4,
    },
    toastIcon: {
        marginRight: Spacing.md,
        marginTop: 2,
    },
    toastContent: {
        flex: 1,
    },
    toastTitle: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
        marginBottom: 2,
    },
    toastDescription: {
        fontSize: Typography.sizes.sm,
    },
    toastClose: {
        padding: Spacing.xs,
        marginLeft: Spacing.sm,
    },

    // Chip
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: Radius.full,
        gap: Spacing.xs,
    },
    chipIcon: {
        marginRight: 2,
    },
    chipText: {
        fontWeight: Typography.weights.medium,
    },
    chipRemove: {
        marginLeft: Spacing.xs,
    },

    // Chip Group
    chipGroup: {
        flexDirection: 'row',
        gap: Spacing.sm,
        paddingVertical: Spacing.xs,
    },
    chipGroupItem: {
        marginRight: 0,
    },

    // Segmented Control
    segmentedControl: {
        flexDirection: 'row',
        borderRadius: Radius.md,
        padding: 3,
        position: 'relative',
    },
    segmentIndicator: {
        position: 'absolute',
        top: 3,
        bottom: 3,
        borderRadius: Radius.sm,
    },
    segment: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        zIndex: 1,
    },
    segmentText: {
        fontSize: Typography.sizes.sm,
    },

    // Alert Dialog
    alertDialogOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    alertDialogBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    alertDialogContainer: {
        width: '90%',
        maxWidth: 400,
        borderRadius: Radius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
    },
    alertDialogIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    alertDialogTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    alertDialogDescription: {
        fontSize: Typography.sizes.md,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        lineHeight: 22,
    },
    alertDialogActions: {
        flexDirection: 'row',
        gap: Spacing.md,
        width: '100%',
    },
    alertDialogButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: Radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    alertDialogCancelButton: {},
    alertDialogConfirmButton: {},
    alertDialogButtonText: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
    },
});
