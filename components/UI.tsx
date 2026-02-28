/**
 * Governe AI - Componentes UI Modernos
 * Biblioteca de componentes inspirada no shadcn-ui
 * 
 * @version 2.0.0
 */

import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  TextInputProps,
  ViewStyle,
  TextStyle,
  Animated,
  Platform,
  Pressable,
} from "react-native";
import { Search, X, ChevronRight, LucideIcon } from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import Colors, { Spacing, Radius, Typography, Shadows, withOpacity } from "@/constants/colors";

// Re-exportar o componente DateTimeInput
export { DateTimeInput } from './DateTimeInput';

// =============================================================================
// SEARCH BAR
// =============================================================================

interface SearchBarProps extends TextInputProps {
  containerStyle?: ViewStyle;
  showClearButton?: boolean;
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  containerStyle,
  showClearButton = true,
  onClear,
  value,
  ...props
}) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(focusAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused]);

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <Animated.View
      style={[
        styles.searchContainer,
        {
          backgroundColor: colors.backgroundSecondary,
          borderColor,
          borderWidth: 2,
        },
        containerStyle,
      ]}
    >
      <Search color={isFocused ? colors.primary : colors.textSecondary} size={20} />
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
      {showClearButton && value && String(value).length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <X color={colors.textSecondary} size={18} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// =============================================================================
// BUTTON
// =============================================================================

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps {
  title?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  style?: ViewStyle;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  iconPosition = "left",
  style,
  fullWidth = false,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
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

  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case "primary":
        return {
          container: { backgroundColor: colors.primary },
          text: { color: "#FFFFFF" },
        };
      case "secondary":
        return {
          container: { backgroundColor: colors.secondary },
          text: { color: "#FFFFFF" },
        };
      case "outline":
        return {
          container: {
            backgroundColor: "transparent",
            borderWidth: 2,
            borderColor: colors.border
          },
          text: { color: colors.text },
        };
      case "ghost":
        return {
          container: { backgroundColor: "transparent" },
          text: { color: colors.primary },
        };
      case "destructive":
        return {
          container: { backgroundColor: colors.error },
          text: { color: "#FFFFFF" },
        };
      case "success":
        return {
          container: { backgroundColor: colors.success },
          text: { color: "#FFFFFF" },
        };
      default:
        return {
          container: { backgroundColor: colors.primary },
          text: { color: "#FFFFFF" },
        };
    }
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case "sm":
        return {
          container: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md },
          text: { fontSize: Typography.sizes.sm },
        };
      case "md":
        return {
          container: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
          text: { fontSize: Typography.sizes.md },
        };
      case "lg":
        return {
          container: { paddingVertical: Spacing.lg, paddingHorizontal: Spacing.xxl },
          text: { fontSize: Typography.sizes.lg },
        };
      case "icon":
        return {
          container: { padding: Spacing.md, aspectRatio: 1 },
          text: { fontSize: Typography.sizes.md },
        };
      default:
        return {
          container: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl },
          text: { fontSize: Typography.sizes.md },
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      <Animated.View
        style={[
          styles.button,
          variantStyles.container,
          sizeStyles.container,
          disabled && styles.buttonDisabled,
          fullWidth && { width: '100%' },
          { transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === "outline" || variant === "ghost" ? colors.primary : "#fff"}
            size="small"
          />
        ) : (
          <View style={styles.buttonContent}>
            {icon && iconPosition === "left" && <View style={styles.buttonIconLeft}>{icon}</View>}
            {title && (
              <Text style={[styles.buttonText, variantStyles.text, sizeStyles.text]}>
                {title}
              </Text>
            )}
            {icon && iconPosition === "right" && <View style={styles.buttonIconRight}>{icon}</View>}
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

// =============================================================================
// BADGE
// =============================================================================

type BadgeVariant = "default" | "secondary" | "outline" | "success" | "warning" | "error" | "info";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  color?: string;
  size?: "sm" | "md";
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = "default",
  color,
  size = "md",
  icon,
  style
}) => {
  const { colors, isDark } = useTheme();

  const getVariantStyles = (): { bg: string; text: string; border?: string } => {
    if (color) {
      return { bg: withOpacity(color, 0.15), text: color };
    }

    switch (variant) {
      case "secondary":
        return { bg: colors.backgroundSecondary, text: colors.textSecondary };
      case "outline":
        return { bg: "transparent", text: colors.text, border: colors.border };
      case "success":
        return { bg: withOpacity(colors.success, 0.15), text: colors.success };
      case "warning":
        return { bg: withOpacity(colors.warning, 0.15), text: colors.warning };
      case "error":
        return { bg: withOpacity(colors.error, 0.15), text: colors.error };
      case "info":
        return { bg: withOpacity(colors.info, 0.15), text: colors.info };
      default:
        return { bg: colors.primary, text: "#FFFFFF" };
    }
  };

  const variantStyles = getVariantStyles();
  const isSmall = size === "sm";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyles.bg,
          borderWidth: variantStyles.border ? 1 : 0,
          borderColor: variantStyles.border,
          paddingHorizontal: isSmall ? Spacing.sm : Spacing.md,
          paddingVertical: isSmall ? 2 : 4,
        },
        style
      ]}
    >
      {icon && <View style={styles.badgeIcon}>{icon}</View>}
      <Text
        style={[
          styles.badgeText,
          {
            color: variantStyles.text,
            fontSize: isSmall ? Typography.sizes.xs : Typography.sizes.sm,
          }
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

// =============================================================================
// CARD
// =============================================================================

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "outlined" | "elevated";
  onPress?: () => void;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = "default",
  onPress,
  disabled = false,
}) => {
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyles = (): ViewStyle => {
    const base: ViewStyle = {
      backgroundColor: colors.card,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
    };

    switch (variant) {
      case "outlined":
        return { ...base, borderWidth: 1, borderColor: colors.border };
      case "elevated":
        return {
          ...base,
          ...Platform.select({
            ios: Shadows.xl,
            android: { elevation: 8 },
            web: {
              boxShadow: isDark
                ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                : '0 8px 24px rgba(0, 0, 0, 0.12)'
            } as any,
          }),
        };
      default:
        return {
          ...base,
          ...Platform.select({
            ios: Shadows.md,
            android: { elevation: 2 },
            web: {
              boxShadow: isDark
                ? '0 2px 8px rgba(0, 0, 0, 0.3)'
                : '0 2px 8px rgba(0, 0, 0, 0.08)'
            } as any,
          }),
        };
    }
  };

  const content = (
    <Animated.View
      style={[
        getVariantStyles(),
        disabled && { opacity: 0.6 },
        { transform: [{ scale: scaleAnim }] },
        style
      ]}
    >
      {children}
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

export const CardHeader: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style
}) => (
  <View style={[styles.cardHeader, style]}>{children}</View>
);

export const CardTitle: React.FC<{ children: React.ReactNode; style?: TextStyle }> = ({
  children,
  style
}) => {
  const { colors } = useTheme();
  return (
    <Text style={[styles.cardTitle, { color: colors.text }, style]}>{children}</Text>
  );
};

export const CardDescription: React.FC<{ children: React.ReactNode; style?: TextStyle }> = ({
  children,
  style
}) => {
  const { colors } = useTheme();
  return (
    <Text style={[styles.cardDescription, { color: colors.textSecondary }, style]}>
      {children}
    </Text>
  );
};

export const CardContent: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style
}) => (
  <View style={[styles.cardContent, style]}>{children}</View>
);

export const CardFooter: React.FC<{ children: React.ReactNode; style?: ViewStyle }> = ({
  children,
  style
}) => (
  <View style={[styles.cardFooter, style]}>{children}</View>
);

// =============================================================================
// AVATAR
// =============================================================================

interface AvatarProps {
  source?: { uri: string } | null;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = "md",
  style
}) => {
  const { colors, isDark } = useTheme();

  const getSizeValue = (): number => {
    switch (size) {
      case "sm": return 32;
      case "md": return 40;
      case "lg": return 56;
      case "xl": return 72;
      default: return 40;
    }
  };

  const sizeValue = getSizeValue();
  const fontSize = sizeValue * 0.4;
  const initials = name
    ? name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
    : "?";

  // Gerar cor baseada no nome
  const getColorFromName = (name: string): string => {
    const hue = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360;
    return `hsl(${hue}, 70%, ${isDark ? 60 : 45}%)`;
  };

  return (
    <View
      style={[
        styles.avatar,
        {
          width: sizeValue,
          height: sizeValue,
          borderRadius: sizeValue / 2,
          backgroundColor: name ? getColorFromName(name) : colors.backgroundSecondary,
        },
        style,
      ]}
    >
      <Text style={[styles.avatarText, { fontSize, color: "#FFFFFF" }]}>
        {initials}
      </Text>
    </View>
  );
};

// =============================================================================
// DIVIDER
// =============================================================================

interface DividerProps {
  orientation?: "horizontal" | "vertical";
  style?: ViewStyle;
  label?: string;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = "horizontal",
  style,
  label
}) => {
  const { colors } = useTheme();

  if (label) {
    return (
      <View style={[styles.dividerWithLabel, style]}>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        <Text style={[styles.dividerLabel, { color: colors.textSecondary }]}>{label}</Text>
        <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        orientation === "horizontal" ? styles.dividerHorizontal : styles.dividerVertical,
        { backgroundColor: colors.border },
        style,
      ]}
    />
  );
};

// =============================================================================
// PROGRESS
// =============================================================================

interface ProgressProps {
  value: number;
  max?: number;
  color?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  style?: ViewStyle;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  color,
  showLabel = false,
  size = "md",
  animated = true,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  useEffect(() => {
    if (animated) {
      Animated.timing(progressAnim, {
        toValue: percentage,
        duration: 800,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.setValue(percentage);
    }
  }, [percentage, animated]);

  useEffect(() => {
    if (animated && percentage > 0 && percentage < 100) {
      const shimmer = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      shimmer.start();
      return () => shimmer.stop();
    }
  }, [percentage, animated]);

  const getHeight = (): number => {
    switch (size) {
      case "sm": return 6;
      case "md": return 8;
      case "lg": return 12;
      default: return 8;
    }
  };

  const progressColor = color || (
    percentage >= 80 ? colors.success :
      percentage >= 50 ? colors.warning :
        colors.error
  );

  const height = getHeight();

  return (
    <View style={style}>
      <View
        style={[
          styles.progressContainer,
          {
            height,
            backgroundColor: isDark ? colors.backgroundSecondary : colors.border,
            borderRadius: height / 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: progressColor,
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              borderRadius: height / 2,
            },
          ]}
        >
          {animated && percentage > 0 && percentage < 100 && (
            <Animated.View
              style={[
                styles.progressShimmer,
                {
                  opacity: shimmerAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, 0.3, 0],
                  }),
                  transform: [{
                    translateX: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-100, 300],
                    }),
                  }],
                },
              ]}
            />
          )}
        </Animated.View>
      </View>
      {showLabel && (
        <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
          {Math.round(percentage)}%
        </Text>
      )}
    </View>
  );
};

// =============================================================================
// EMPTY STATE
// =============================================================================

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.emptyState,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
      ]}
    >
      <View style={[styles.emptyIcon, { backgroundColor: withOpacity(colors.primary, 0.1) }]}>
        {icon}
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      {description && (
        <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
          {description}
        </Text>
      )}
      {action && (
        <Button
          title={action.label}
          onPress={action.onPress}
          variant="primary"
          size="md"
          style={styles.emptyAction}
        />
      )}
    </Animated.View>
  );
};

// =============================================================================
// LIST ITEM
// =============================================================================

interface ListItemProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  description,
  icon,
  rightElement,
  showChevron = false,
  onPress,
  disabled = false,
  style,
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 300,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const content = (
    <Animated.View
      style={[
        styles.listItem,
        {
          backgroundColor: colors.card,
          transform: [{ scale: scaleAnim }],
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {icon && <View style={styles.listItemIcon}>{icon}</View>}
      <View style={styles.listItemContent}>
        <Text style={[styles.listItemTitle, { color: colors.text }]}>{title}</Text>
        {description && (
          <Text style={[styles.listItemDescription, { color: colors.textSecondary }]}>
            {description}
          </Text>
        )}
      </View>
      {rightElement}
      {showChevron && !rightElement && (
        <ChevronRight color={colors.textSecondary} size={20} />
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
// STAT CARD
// =============================================================================

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: {
    value: number;
    label?: string;
  };
  onPress?: () => void;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  onPress,
  style,
}) => {
  const { colors, isDark } = useTheme();
  const accentColor = color || colors.primary;

  return (
    <Card onPress={onPress} style={[styles.statCard, { borderLeftColor: accentColor }, style]}>
      {icon && (
        <View style={[styles.statIcon, { backgroundColor: withOpacity(accentColor, 0.12) }]}>
          {icon}
        </View>
      )}
      <Text style={[styles.statValue, { color: colors.text }]}>
        {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
      </Text>
      <Text style={[styles.statTitle, { color: colors.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      )}
      {trend && (
        <View style={styles.statTrend}>
          <Text
            style={[
              styles.statTrendValue,
              { color: trend.value >= 0 ? colors.success : colors.error },
            ]}
          >
            {trend.value >= 0 ? "+" : ""}{trend.value}%
          </Text>
          {trend.label && (
            <Text style={[styles.statTrendLabel, { color: colors.textSecondary }]}>
              {trend.label}
            </Text>
          )}
        </View>
      )}
    </Card>
  );
};

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  // Search Bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.sizes.md,
    padding: 0,
    borderWidth: 0,
    outlineStyle: 'none' as any,
  },
  clearButton: {
    padding: Spacing.xs,
  },

  // Button
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonIconLeft: {
    marginRight: Spacing.sm,
  },
  buttonIconRight: {
    marginLeft: Spacing.sm,
  },
  buttonText: {
    fontWeight: Typography.weights.semibold,
  },

  // Badge
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.full,
    gap: Spacing.xs,
  },
  badgeIcon: {
    marginRight: 2,
  },
  badgeText: {
    fontWeight: Typography.weights.semibold,
  },

  // Card
  cardHeader: {
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    fontSize: Typography.sizes.sm,
  },
  cardContent: {
    marginVertical: Spacing.sm,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },

  // Avatar
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontWeight: Typography.weights.semibold,
  },

  // Divider
  dividerHorizontal: {
    height: 1,
    width: "100%",
  },
  dividerVertical: {
    width: 1,
    height: "100%",
  },
  dividerWithLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },

  // Progress
  progressContainer: {
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    overflow: "hidden",
  },
  progressShimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  progressLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginTop: Spacing.xs,
    textAlign: "right",
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xxxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  emptyDescription: {
    fontSize: Typography.sizes.base,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  emptyAction: {
    marginTop: Spacing.sm,
  },

  // List Item
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: Radius.md,
    gap: Spacing.md,
  },
  listItemIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
  },
  listItemDescription: {
    fontSize: Typography.sizes.sm,
    marginTop: 2,
  },

  // Stat Card
  statCard: {
    borderLeftWidth: 4,
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  statValue: {
    fontSize: Typography.sizes.display,
    fontWeight: Typography.weights.bold,
    marginBottom: Spacing.xs,
  },
  statTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: Typography.sizes.xs,
  },
  statTrend: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  statTrendValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  statTrendLabel: {
    fontSize: Typography.sizes.xs,
  },
});
