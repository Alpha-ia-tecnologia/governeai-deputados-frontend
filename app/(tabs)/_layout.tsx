import { Tabs } from "expo-router";
import {
  LayoutDashboard,
  Building2,
  Gavel,
  Handshake,
  Menu,
} from "lucide-react-native";
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
} from "react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";


// ─── Custom Tab Bar Component ─────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        tabBarStyles.container,
        {
          backgroundColor: isDark ? colors.card : "#FFFFFF",
          paddingBottom: Math.max(insets.bottom, 8),
          shadowColor: isDark ? "#000" : "#1a2744",
        },
      ]}
    >
      {/* Top accent line */}
      <View style={[tabBarStyles.topAccent, { backgroundColor: colors.primary + "15" }]} />

      <View style={tabBarStyles.tabsRow}>
        {state.routes
          .filter((route) => {
            const { options } = descriptors[route.key];
            return options.tabBarItemStyle === undefined ||
              !(options.tabBarItemStyle as any)?.display ||
              (options.tabBarItemStyle as any)?.display !== "none";
          })
          .map((route) => {
            const index = state.routes.indexOf(route);
            const { options } = descriptors[route.key];
            const label = options.title || route.name;
            const isFocused = state.index === index;

            // Skip hidden tabs
            if ((options.tabBarItemStyle as any)?.display === "none") return null;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <TabButton
                key={route.key}
                label={label as string}
                isFocused={isFocused}
                onPress={onPress}
                routeName={route.name}
                colors={colors}
              />
            );
          })}
      </View>
    </View>
  );
}

// ─── Animated Tab Button ──────────────────────────────────────────
function TabButton({
  label,
  isFocused,
  onPress,
  routeName,
  colors,
}: {
  label: string;
  isFocused: boolean;
  onPress: () => void;
  routeName: string;
  colors: any;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bgAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const indicatorAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(bgAnim, {
        toValue: isFocused ? 1 : 0,
        tension: 60,
        friction: 8,
        useNativeDriver: false,
      }),
      Animated.spring(indicatorAnim, {
        toValue: isFocused ? 1 : 0,
        tension: 80,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.85,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  const iconColor = isFocused ? colors.primary : colors.textSecondary;
  const iconSize = 22;

  const getIcon = () => {
    switch (routeName) {
      case "home":
        return <LayoutDashboard color={iconColor} size={iconSize} />;
      case "gabinete":
        return <Building2 color={iconColor} size={iconSize} />;
      case "legislativo":
        return <Gavel color={iconColor} size={iconSize} />;
      case "politico":
        return <Handshake color={iconColor} size={iconSize} />;
      case "settings":
        return <Menu color={iconColor} size={iconSize} />;
      default:
        return <LayoutDashboard color={iconColor} size={iconSize} />;
    }
  };

  const pillBg = bgAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", colors.primary + "15"],
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={tabBarStyles.tabButton}
    >
      {/* Top indicator */}
      <Animated.View
        style={[
          tabBarStyles.indicator,
          {
            backgroundColor: colors.primary,
            transform: [{ scaleX: indicatorAnim }],
            opacity: indicatorAnim,
          },
        ]}
      />

      {/* Pill background + icon */}
      <Animated.View
        style={[
          tabBarStyles.pill,
          {
            backgroundColor: pillBg,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {getIcon()}
      </Animated.View>

      {/* Label */}
      <Text
        style={[
          tabBarStyles.label,
          {
            color: isFocused ? colors.primary : colors.textSecondary,
            fontWeight: isFocused ? "700" : "500",
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Tab Bar Styles ───────────────────────────────────────────────
const tabBarStyles = StyleSheet.create({
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
    paddingTop: 4,
  },
  topAccent: {
    height: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 6,
    paddingBottom: 2,
  },
  indicator: {
    width: 20,
    height: 3,
    borderRadius: 2,
    marginBottom: 4,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.2,
  },
});

// ─── Main Layout ──────────────────────────────────────────────────
export default function TabLayout() {
  const { colors } = useTheme();
  const { width: screenWidth } = Dimensions.get("window");
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && screenWidth >= 768;

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <View style={styles.content}>
        <Tabs
          tabBar={(props) => (isDesktop ? null : <CustomTabBar {...props} />)}
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.tabIconDefault,
            headerShown: true,
            headerStyle: {
              backgroundColor: colors.primary,
            },
            headerTintColor: "#fff",
            headerTitleStyle: {
              fontWeight: "600" as const,
            },
            tabBarStyle: isDesktop ? { display: "none" } : undefined,
          }}
        >
          {/* ── Primary Tabs (visible in tab bar) ── */}
          <Tabs.Screen
            name="home"
            options={{
              title: "Início",
              headerTitle: "Painel de Controle",
              headerShown: !isDesktop,
            }}
          />
          <Tabs.Screen
            name="gabinete"
            options={{
              title: "Gabinete",
              headerTitle: "Gabinete",
              headerShown: !isDesktop,
            }}
          />
          <Tabs.Screen
            name="legislativo"
            options={{
              title: "Legislativo",
              headerTitle: "Atividade Legislativa",
              headerShown: !isDesktop,
            }}
          />
          <Tabs.Screen
            name="politico"
            options={{
              title: "Político",
              headerTitle: "Articulação Política",
              headerShown: !isDesktop,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: "Mais",
              headerTitle: "Menu",
              headerShown: !isDesktop,
            }}
          />

          {/* ── Hidden Tabs (accessible via sidebar/navigation only) ── */}
          <Tabs.Screen
            name="voters"
            options={{
              title: "Eleitores",
              headerTitle: "Eleitores",
              headerShown: !isDesktop,
              tabBarItemStyle: { display: "none" },
            }}
          />
          <Tabs.Screen
            name="projects"
            options={{
              title: "Projetos",
              headerTitle: "Projetos e Emendas",
              headerShown: !isDesktop,
              tabBarItemStyle: { display: "none" },
            }}
          />
          <Tabs.Screen
            name="agenda"
            options={{
              title: "Agenda",
              headerTitle: "Agenda",
              headerShown: !isDesktop,
              tabBarItemStyle: { display: "none" },
            }}
          />
        </Tabs>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
