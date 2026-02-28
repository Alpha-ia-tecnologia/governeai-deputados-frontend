import React, { useRef, useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
    Platform,
    ScrollView,
} from 'react-native';
import {
    Home,
    Users,
    FileText,
    Calendar,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    BarChart3,
    ClipboardList,
    Handshake,
    MapPin,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Radius, Typography } from '@/constants/colors';

interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ size: number; color: string }>;
    route?: string;
    badge?: number;
}

interface SidebarProps {
    activeRoute?: string;
    onNavigate?: (route: string) => void;
    onCollapse?: (collapsed: boolean) => void;
}

const navItems: NavItem[] = [
    { id: 'home', label: 'Início', icon: Home, route: '/' },
    { id: 'staff', label: 'Equipe', icon: Users, route: '/manage-staff' },
    { id: 'tasks', label: 'Tarefas', icon: ClipboardList, route: '/manage-tasks' },
    { id: 'bills', label: 'Projetos de Lei', icon: FileText, route: '/manage-bills' },
    { id: 'contacts', label: 'Contatos Políticos', icon: Handshake, route: '/manage-political-contacts' },
    { id: 'voters', label: 'Eleitores', icon: Users, route: '/voters' },
    { id: 'agenda', label: 'Agenda', icon: Calendar, route: '/agenda' },
    { id: 'cities', label: 'Cidades', icon: MapPin, route: '/manage-cities' },
    { id: 'analytics', label: 'Análise Eleitoral', icon: BarChart3, route: '/election-analysis' },
];

const systemNavItems: NavItem[] = [
    { id: 'settings', label: 'Configurações', icon: Settings, route: '/settings' },
];

/**
 * SidebarNavItem
 */
const SidebarNavItem: React.FC<{
    item: NavItem;
    active: boolean;
    collapsed: boolean;
    onPress: () => void;
}> = ({ item, active, collapsed, onPress }) => {
    const { colors } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;

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

    const Icon = item.icon;

    return (
        <TouchableOpacity
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={1}
        >
            <Animated.View
                style={[
                    styles.navItem,
                    {
                        backgroundColor: active ? colors.sidebarAccent : 'transparent',
                        transform: [{ scale: scaleAnim }],
                    },
                    collapsed && styles.navItemCollapsed,
                ]}
            >
                <Icon
                    size={18}
                    color={active ? colors.sidebarPrimary : colors.sidebarForeground}
                />
                {!collapsed && (
                    <Text
                        style={[
                            styles.navItemLabel,
                            {
                                color: active ? colors.sidebarPrimary : colors.sidebarForeground,
                                fontWeight: active ? '600' : '400',
                            },
                        ]}
                        numberOfLines={1}
                    >
                        {item.label}
                    </Text>
                )}
                {item.badge && item.badge > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.error }]}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                )}
            </Animated.View>
        </TouchableOpacity>
    );
};

/**
 * Avatar for sidebar footer
 */
const UserAvatar: React.FC<{ name: string; collapsed: boolean }> = ({ name, collapsed }) => {
    const { colors } = useTheme();

    const initials = name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <View style={[styles.userAvatar, { backgroundColor: colors.sidebarPrimary }]}>
            <Text style={styles.userAvatarText}>{initials}</Text>
        </View>
    );
};

/**
 * Sidebar - Collapsible navigation for desktop with grouped sections
 */
export const Sidebar: React.FC<SidebarProps> = ({
    activeRoute = '/',
    onNavigate,
    onCollapse,
}) => {
    const { colors, isDark } = useTheme();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const widthAnim = useRef(new Animated.Value(240)).current;

    const { width: screenWidth } = Dimensions.get('window');
    const isDesktop = screenWidth >= 768;

    // Don't render on mobile
    if (!isDesktop) return null;

    useEffect(() => {
        Animated.spring(widthAnim, {
            toValue: collapsed ? 72 : 240,
            tension: 200,
            friction: 20,
            useNativeDriver: false,
        }).start();
        onCollapse?.(collapsed);
    }, [collapsed]);

    const handleNavigate = (route: string) => {
        onNavigate?.(route);
    };

    const toggleCollapse = () => {
        setCollapsed(!collapsed);
    };

    const isActiveRoute = (route?: string) => {
        if (!route) return false;
        if (route === '/' && activeRoute === '/') return true;
        if (route === '/') return false;
        return activeRoute === route || activeRoute.startsWith(route);
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    width: widthAnim,
                    backgroundColor: colors.sidebar,
                    borderRightColor: colors.sidebarBorder,
                },
            ]}
        >
            {/* Header */}
            <View style={[styles.header, collapsed && styles.headerCollapsed]}>
                {!collapsed && (
                    <View style={styles.logo}>
                        <View style={[styles.logoIcon, { backgroundColor: colors.sidebarPrimary }]}>
                            <Text style={styles.logoIconText}>G</Text>
                        </View>
                        <Text style={[styles.logoText, { color: colors.sidebarForeground }]}>
                            Governe AI
                        </Text>
                    </View>
                )}
                <TouchableOpacity
                    onPress={toggleCollapse}
                    style={[styles.collapseButton, { backgroundColor: colors.sidebarAccent }]}
                >
                    {collapsed ? (
                        <ChevronRight size={18} color={colors.sidebarForeground} />
                    ) : (
                        <ChevronLeft size={18} color={colors.sidebarForeground} />
                    )}
                </TouchableOpacity>
            </View>

            {/* Scrollable Navigation */}
            <ScrollView
                style={styles.navScrollView}
                contentContainerStyle={styles.navScrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.navSection}>
                    {navItems.map((item) => (
                        <SidebarNavItem
                            key={item.id}
                            item={item}
                            active={isActiveRoute(item.route)}
                            collapsed={collapsed}
                            onPress={() => item.route && handleNavigate(item.route)}
                        />
                    ))}
                </View>
            </ScrollView>

            {/* Secondary Navigation */}
            <View style={[styles.navSection, styles.navSectionSecondary]}>
                {!collapsed && (
                    <Text style={[styles.navSectionLabel, { color: colors.textMuted }]}>
                        Sistema
                    </Text>
                )}
                {systemNavItems.map((item) => (
                    <SidebarNavItem
                        key={item.id}
                        item={item}
                        active={isActiveRoute(item.route)}
                        collapsed={collapsed}
                        onPress={() => item.route && handleNavigate(item.route)}
                    />
                ))}
            </View>

            {/* Footer - User */}
            <View
                style={[
                    styles.footer,
                    { borderTopColor: colors.sidebarBorder },
                    collapsed && styles.footerCollapsed,
                ]}
            >
                <UserAvatar name={user?.name || 'User'} collapsed={collapsed} />
                {!collapsed && (
                    <View style={styles.userInfo}>
                        <Text
                            style={[styles.userName, { color: colors.sidebarForeground }]}
                            numberOfLines={1}
                        >
                            {user?.name || 'Usuário'}
                        </Text>
                        <Text
                            style={[styles.userRole, { color: colors.textMuted }]}
                            numberOfLines={1}
                        >
                            {user?.city || 'Administrador'}
                        </Text>
                    </View>
                )}
                <TouchableOpacity
                    onPress={logout}
                    style={[styles.logoutButton, { backgroundColor: colors.sidebarAccent }]}
                >
                    <LogOut size={18} color={colors.error} />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        borderRightWidth: 1,
        ...Platform.select({
            web: {
                position: 'fixed' as any,
                left: 0,
                top: 0,
                bottom: 0,
                zIndex: 100,
            },
        }),
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingBottom: 16,
    },
    headerCollapsed: {
        justifyContent: 'center',
    },
    logo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoIcon: {
        width: 32,
        height: 32,
        borderRadius: Radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoIconText: {
        color: '#FFFFFF',
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
    },
    logoText: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.semibold,
    },
    collapseButton: {
        width: 32,
        height: 32,
        borderRadius: Radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    navScrollView: {
        flex: 1,
    },
    navScrollContent: {
        paddingBottom: 8,
    },
    navSection: {
        paddingHorizontal: 12,
        marginBottom: 8,
    },
    navSectionSecondary: {
        paddingHorizontal: 12,
        marginBottom: 0,
    },
    navSectionLabel: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.medium,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 6,
        marginTop: 8,
        paddingHorizontal: 12,
    },
    sectionDivider: {
        height: 1,
        marginVertical: 4,
        marginHorizontal: 8,
    },
    navItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: Radius.md,
        marginBottom: 2,
    },
    navItemCollapsed: {
        justifyContent: 'center',
        paddingHorizontal: 0,
    },
    navItemLabel: {
        fontSize: Typography.sizes.sm,
        flex: 1,
    },
    badge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.semibold,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        borderTopWidth: 1,
    },
    footerCollapsed: {
        flexDirection: 'column',
        gap: 8,
    },
    userAvatar: {
        width: 36,
        height: 36,
        borderRadius: Radius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userAvatarText: {
        color: '#FFFFFF',
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    userRole: {
        fontSize: Typography.sizes.xs,
    },
    logoutButton: {
        width: 36,
        height: 36,
        borderRadius: Radius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default Sidebar;
