import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments, usePathname } from "expo-router";
import { router as expoRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Dimensions, Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { PreferencesContext } from "@/contexts/PreferencesContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { Sidebar } from "@/components/navigation/Sidebar";


// Importar CSS global apenas para web
// Note: CSS imports removed - use NativeWind/Tailwind for styling instead
// if (Platform.OS === 'web') {
//   require('./global.css');
// }

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const { colors } = useTheme();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { width: screenWidth } = Dimensions.get("window");
  const isWeb = Platform.OS === "web";
  const isDesktop = isWeb && screenWidth >= 768;

  const inLoginScreen = segments[0] === "login";
  const showSidebar = isDesktop && isAuthenticated && !inLoginScreen;

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated && !inLoginScreen) {
      router.replace("/login");
    } else if (isAuthenticated && inLoginScreen) {
      router.replace("/(tabs)/home");
    }
  }, [isAuthenticated, isLoading, segments]);

  // ── Sidebar active route detection ──
  const getActiveRoute = (): string => {
    if (pathname.includes("/home")) return "/";
    if (pathname.includes("/manage-staff")) return "/manage-staff";
    if (pathname.includes("/manage-tasks")) return "/manage-tasks";
    if (pathname.includes("/gabinete")) return "/gabinete";
    if (pathname.includes("/manage-bills")) return "/manage-bills";
    if (pathname.includes("/manage-votes")) return "/manage-votes";
    if (pathname.includes("/manage-requests")) return "/manage-requests";
    if (pathname.includes("/legislativo")) return "/legislativo";
    if (pathname.includes("/manage-political-contacts")) return "/manage-political-contacts";
    if (pathname.includes("/manage-ceap")) return "/manage-ceap";
    if (pathname.includes("/voters")) return "/voters";
    if (pathname.includes("/politico")) return "/politico";
    if (pathname.includes("/agenda")) return "/agenda";
    if (pathname.includes("/manage-cities")) return "/manage-cities";
    if (pathname.includes("/election-analysis")) return "/election-analysis";
    if (pathname.includes("/settings")) return "/settings";
    return "/";
  };

  // ── Sidebar navigation handler ──
  const handleSidebarNavigate = (route: string) => {
    const routeMap: Record<string, string> = {
      "/": "/(tabs)/home",
      "/gabinete": "/(tabs)/gabinete",
      "/legislativo": "/(tabs)/legislativo",
      "/politico": "/(tabs)/politico",
      "/voters": "/(tabs)/voters",
      "/projects": "/(tabs)/projects",
      "/agenda": "/(tabs)/agenda",
      "/settings": "/(tabs)/settings",
      "/election-analysis": "/election-analysis",
      "/manage-staff": "/manage-staff",
      "/manage-tasks": "/manage-tasks",
      "/manage-bills": "/manage-bills",
      "/manage-votes": "/manage-votes",
      "/manage-requests": "/manage-requests",
      "/manage-political-contacts": "/manage-political-contacts",
      "/manage-ceap": "/manage-ceap",
      "/manage-cities": "/manage-cities",
    };
    const targetRoute = routeMap[route] || route;
    expoRouter.push(targetRoute as any);
  };

  const mainContentStyle = showSidebar
    ? { marginLeft: sidebarCollapsed ? 72 : 240 }
    : {};

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, flexDirection: "row" }}>
      {showSidebar && (
        <Sidebar
          activeRoute={getActiveRoute()}
          onNavigate={handleSidebarNavigate}
          onCollapse={setSidebarCollapsed}
        />
      )}
      <View style={{ flex: 1, ...mainContentStyle }}>
        <Stack screenOptions={{ headerBackTitle: "Voltar" }}>
          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="gerenciamento-usuarios"
            options={{
              title: "Gerenciamento de Usuários",
              headerBackTitle: "Voltar",
            }}
          />
          {/* Management screens - hide native header (they have their own) */}
          <Stack.Screen name="manage-staff" options={{ headerShown: false }} />
          <Stack.Screen name="manage-tasks" options={{ headerShown: false }} />
          <Stack.Screen name="manage-bills" options={{ headerShown: false }} />
          <Stack.Screen name="manage-votes" options={{ headerShown: false }} />
          <Stack.Screen name="manage-political-contacts" options={{ headerShown: false }} />
          <Stack.Screen name="manage-ceap" options={{ headerShown: false }} />
          <Stack.Screen name="manage-requests" options={{ headerShown: false }} />
          <Stack.Screen name="manage-cities" options={{ headerShown: false }} />
          <Stack.Screen name="manage-leaders" options={{ headerShown: false }} />
          {/* Detail/edit screens - hide native header (they have their own) */}
          <Stack.Screen name="voter-details" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="system-preferences" options={{ headerShown: false }} />
          <Stack.Screen name="admin-panel" options={{ headerShown: false }} />
          <Stack.Screen name="add-voter" options={{ headerShown: false }} />
          <Stack.Screen name="edit-voter" options={{ headerShown: false }} />
          <Stack.Screen name="add-visit" options={{ headerShown: false }} />
          <Stack.Screen name="edit-visit" options={{ headerShown: false }} />
          <Stack.Screen name="add-help" options={{ headerShown: false }} />
          <Stack.Screen name="edit-help" options={{ headerShown: false }} />
          <Stack.Screen name="add-project" options={{ headerShown: false }} />
          <Stack.Screen name="edit-project" options={{ headerShown: false }} />
          <Stack.Screen name="add-amendment" options={{ headerShown: false }} />
          <Stack.Screen name="edit-amendment" options={{ headerShown: false }} />
          <Stack.Screen name="adicionar-usuario" options={{ headerShown: false }} />
          <Stack.Screen name="editar-usuario" options={{ headerShown: false }} />
        </Stack>
      </View>
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <AuthProvider>
            <DataProvider>
              <PreferencesContext>
                <ToastProvider>
                  <RootLayoutNav />
                </ToastProvider>
              </PreferencesContext>
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}


