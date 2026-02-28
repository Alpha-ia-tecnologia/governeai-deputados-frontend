import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  User,
  Settings as SettingsIcon,
  HelpCircle,
  Shield,
  LogOut,
  ChevronRight,
  UserCog,
  Sun,
  Moon,
  Smartphone,
  Check,
  BarChart3,
  Building2,
  FileText,
  Users,
  ClipboardList,
  Vote,
  UserPlus,
  Receipt,
  Gavel,
  Calendar,
  MapPin,
  Handshake,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme, ThemeMode } from "@/contexts/ThemeContext";
import { router } from "expo-router";
import { Typography, Spacing, Radius } from "@/constants/colors";

interface MenuCategory {
  title: string;
  items: {
    icon: React.ComponentType<{ color: string; size: number }>;
    title: string;
    description: string;
    onPress: () => void;
  }[];
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { colors, theme, setTheme, isDark } = useTheme();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const canManageUsers = user?.role === "admin" || user?.role === "vereador" || user?.role === "assessor";

  const menuCategories: MenuCategory[] = [
    {
      title: "Gabinete",
      items: [
        {
          icon: Users,
          title: "Equipe do Gabinete",
          description: "Assessores e cargos",
          onPress: () => router.push("/manage-staff"),
        },
        {
          icon: ClipboardList,
          title: "Tarefas",
          description: "Atividades e demandas",
          onPress: () => router.push("/manage-tasks"),
        },
      ],
    },
    {
      title: "Legislativo",
      items: [
        {
          icon: Gavel,
          title: "Projetos de Lei",
          description: "Proposições legislativas",
          onPress: () => router.push("/manage-bills"),
        },
        {
          icon: Vote,
          title: "Votações",
          description: "Registro de votos",
          onPress: () => router.push("/manage-votes"),
        },
        {
          icon: FileText,
          title: "Ofícios e Requerimentos",
          description: "Documentos oficiais",
          onPress: () => router.push("/manage-requests"),
        },
      ],
    },
    {
      title: "Político",
      items: [
        {
          icon: Handshake,
          title: "Contatos Políticos",
          description: "CRM político",
          onPress: () => router.push("/manage-political-contacts"),
        },
        {
          icon: Receipt,
          title: "CEAP - Despesas",
          description: "Cota parlamentar",
          onPress: () => router.push("/manage-ceap"),
        },
      ],
    },
    {
      title: "Mandato",
      items: [
        {
          icon: Calendar,
          title: "Agenda",
          description: "Compromissos e eventos",
          onPress: () => router.push("/(tabs)/agenda" as any),
        },
        {
          icon: MapPin,
          title: "Gestão de Cidades",
          description: "Municípios de atuação",
          onPress: () => router.push("/manage-cities"),
        },
        {
          icon: BarChart3,
          title: "Análise Eleitoral",
          description: "Dados e estatísticas",
          onPress: () => router.push("/election-analysis"),
        },
      ],
    },
    {
      title: "Sistema",
      items: [
        ...(canManageUsers
          ? [
            {
              icon: UserCog,
              title: "Gerenciar Usuários",
              description: user?.role === "admin"
                ? "Adicionar, editar e remover"
                : "Gerenciar assessores",
              onPress: () => router.push("/gerenciamento-usuarios"),
            },
          ]
          : []),
        {
          icon: User,
          title: "Meu Perfil",
          description: "Informações pessoais",
          onPress: () => router.push("/profile"),
        },
        {
          icon: SettingsIcon,
          title: "Configurações",
          description: "Preferências do sistema",
          onPress: () => router.push("/system-preferences"),
        },
        {
          icon: HelpCircle,
          title: "Ajuda e Suporte",
          description: "Central de ajuda",
          onPress: () => router.push("/help-support"),
        },
        {
          icon: Shield,
          title: "Privacidade e Segurança",
          description: "Gerenciar dados",
          onPress: () => { },
        },
      ],
    },
  ];

  const themeOptions: { mode: ThemeMode; icon: typeof Sun; label: string }[] = [
    { mode: 'light', icon: Sun, label: 'Claro' },
    { mode: 'dark', icon: Moon, label: 'Escuro' },
    { mode: 'system', icon: Smartphone, label: 'Sistema' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      contentContainerStyle={styles.content}
    >
      {/* Profile Card */}
      <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
        <View style={[styles.avatar, { backgroundColor: colors.backgroundSecondary }]}>
          <User color={colors.primary} size={32} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>{user?.name}</Text>
          <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
          <Text style={[styles.profileRole, { color: colors.primary }]}>
            {user?.role === "vereador"
              ? "Deputado"
              : user?.role === "admin"
                ? "Administrador"
                : user?.role === "lideranca"
                  ? "Liderança"
                  : "Assessor"}
          </Text>
        </View>
      </View>

      {/* Theme Selector */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Aparência</Text>
        <View style={[styles.themeContainer, { backgroundColor: colors.card }]}>
          {themeOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = theme === option.mode;
            return (
              <TouchableOpacity
                key={option.mode}
                style={[
                  styles.themeOption,
                  isSelected && {
                    backgroundColor: colors.primary + '20',
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setTheme(option.mode)}
              >
                <IconComponent
                  color={isSelected ? colors.primary : colors.textSecondary}
                  size={24}
                />
                <Text
                  style={[
                    styles.themeLabel,
                    { color: isSelected ? colors.primary : colors.text }
                  ]}
                >
                  {option.label}
                </Text>
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: colors.primary }]}>
                    <Check color="#fff" size={12} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Categorized Menu */}
      {menuCategories.map((category) => (
        <View key={category.title} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{category.title}</Text>
          {category.items.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={index}
                style={[styles.menuItem, { backgroundColor: colors.card }]}
                onPress={item.onPress}
              >
                <View style={[styles.menuIcon, { backgroundColor: colors.backgroundSecondary }]}>
                  <IconComponent color={colors.primary} size={18} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[styles.menuDescription, { color: colors.textSecondary }]}>{item.description}</Text>
                </View>
                <ChevronRight color={colors.textSecondary} size={18} />
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      {/* Logout */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: colors.card, borderColor: colors.error }]}
        onPress={handleLogout}
      >
        <LogOut color={colors.error} size={20} />
        <Text style={[styles.logoutText, { color: colors.error }]}>Sair da Conta</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Governe AI - SGP-DEP</Text>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>Versão 2.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg },
  profileCard: {
    flexDirection: "row" as const,
    borderRadius: Radius.lg,
    padding: 20,
    marginBottom: Spacing.xxl,
    alignItems: "center" as const,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 2 },
      web: { boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
    }),
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: Spacing.lg,
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold, marginBottom: 2 },
  profileEmail: { fontSize: Typography.sizes.sm, marginBottom: 2 },
  profileRole: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.semibold },
  section: { marginBottom: Spacing.xxl },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    paddingLeft: 4,
  },
  themeContainer: {
    flexDirection: 'row' as const,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 14,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative' as const,
  },
  themeLabel: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.semibold, marginTop: 6 },
  checkBadge: {
    position: 'absolute' as const,
    top: 4, right: 4,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center' as const, justifyContent: 'center' as const,
  },
  menuItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderRadius: Radius.md,
    padding: 14,
    marginBottom: 6,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 2 },
      android: { elevation: 1 },
      web: { boxShadow: "0 1px 2px rgba(0,0,0,0.04)" },
    }),
  },
  menuIcon: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: "center" as const, alignItems: "center" as const, marginRight: Spacing.md,
  },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.medium, marginBottom: 1 },
  menuDescription: { fontSize: Typography.sizes.sm },
  logoutButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xxl,
    borderWidth: 1,
  },
  logoutText: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold, marginLeft: Spacing.sm },
  footer: { alignItems: "center" as const, paddingVertical: Spacing.lg, gap: 4 },
  footerText: { fontSize: Typography.sizes.xs },
});
