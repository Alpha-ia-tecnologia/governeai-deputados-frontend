import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useToast } from "@/contexts/ToastContext";
import { useAlertDialog } from "@/components/Advanced";
import {
  Bell,
  Smartphone,
  Trash2,
  ChevronRight,
  RotateCcw,
} from "lucide-react-native";
import { Stack } from "expo-router";
import Colors from "@/constants/colors";
import { usePreferences } from "@/contexts/PreferencesContext";
import { useData } from "@/contexts/DataContext";
import AsyncStorage from "@react-native-async-storage/async-storage";



export default function SystemPreferencesScreen() {
  const { preferences, isLoading, updatePreference, resetPreferences } = usePreferences();
  const { refreshData } = useData();
  const { showToast } = useToast();
  const { showAlert: showConfirmDialog, AlertDialogComponent } = useAlertDialog();

  // Função helper para mostrar mensagem de sucesso/erro usando toast
  const showAlert = (title: string, message: string, isError: boolean = false) => {
    showToast({ title, message, type: isError ? 'error' : 'success' });
  };

  const handleClearCache = async () => {
    showConfirmDialog({
      title: "Limpar Cache",
      description: "Tem certeza que deseja limpar o cache do aplicativo? Isso irá recarregar todos os dados do servidor.",
      variant: "warning",
      confirmText: "Limpar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          // Obter todas as chaves do AsyncStorage
          const allKeys = await AsyncStorage.getAllKeys();

          // Filtrar apenas as chaves que queremos limpar (excluir token e preferências)
          const keysToRemove = allKeys.filter(key =>
            !key.includes('@auth_token') &&
            !key.includes('@user') &&
            !key.includes('@app_preferences')
          );

          // Remover as chaves selecionadas
          if (keysToRemove.length > 0) {
            await AsyncStorage.multiRemove(keysToRemove);
          }

          console.log("Cache limpo - chaves removidas:", keysToRemove);

          // Recarregar dados do servidor
          await refreshData();

          showAlert("Sucesso", "Cache limpo com sucesso! Dados recarregados do servidor.", false);
        } catch (error) {
          console.error("Error clearing cache:", error);
          showAlert("Erro", "Não foi possível limpar o cache", true);
        }
      },
    });
  };

  const handleResetPreferences = () => {
    showConfirmDialog({
      title: "Restaurar Preferências",
      description: "Tem certeza que deseja restaurar as preferências para os valores padrão?",
      variant: "warning",
      confirmText: "Restaurar",
      cancelText: "Cancelar",
      onConfirm: resetPreferences,
    });
  };

  const toggleSettings = [
    {
      icon: Bell,
      title: "Notificações",
      description: "Receber alertas e lembretes",
      value: preferences.notifications,
      onValueChange: (value: boolean) => updatePreference("notifications", value),
    },
    {
      icon: Smartphone,
      title: "Sincronização Automática",
      description: "Sincronizar dados automaticamente",
      value: preferences.autoSync,
      onValueChange: (value: boolean) => updatePreference("autoSync", value),
    },
  ];

  const actionItems = [
    {
      icon: Trash2,
      title: "Limpar Cache",
      description: "Liberar espaço",
      onPress: handleClearCache,
      danger: true,
    },
    {
      icon: RotateCcw,
      title: "Restaurar Preferências",
      description: "Voltar para configurações padrão",
      onPress: handleResetPreferences,
      danger: false,
    },
  ];

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Stack.Screen
          options={{
            title: "Preferências do Sistema",
            headerStyle: {
              backgroundColor: Colors.light.card,
            },
            headerTintColor: Colors.light.text,
          }}
        />
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: "Preferências do Sistema",
          headerStyle: {
            backgroundColor: Colors.light.card,
          },
          headerTintColor: Colors.light.text,
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Geral</Text>
          {toggleSettings.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <View key={index} style={styles.settingItem}>
                <View style={styles.settingIcon}>
                  <IconComponent color={Colors.light.primary} size={20} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingTitle}>{item.title}</Text>
                  <Text style={styles.settingDescription}>
                    {item.description}
                  </Text>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.onValueChange}
                  trackColor={{
                    false: Colors.light.textSecondary,
                    true: Colors.light.primary,
                  }}
                  thumbColor={Colors.light.card}
                />
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sistema</Text>
          {actionItems.map((item, index) => {
            const IconComponent = item.icon;
            const isDanger = item.danger;
            return (
              <TouchableOpacity
                key={index}
                style={styles.actionItem}
                onPress={item.onPress}
              >
                <View
                  style={[
                    styles.actionIcon,
                    isDanger && styles.actionIconDanger,
                  ]}
                >
                  <IconComponent
                    color={isDanger ? Colors.light.error : Colors.light.primary}
                    size={20}
                  />
                </View>
                <View style={styles.actionContent}>
                  <Text
                    style={[
                      styles.actionTitle,
                      isDanger && styles.actionTitleDanger,
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.actionDescription}>
                    {item.description}
                  </Text>
                </View>
                <ChevronRight color={Colors.light.textSecondary} size={20} />
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Sobre as Preferências</Text>
          <Text style={styles.infoText}>
            Personalize sua experiência ajustando as configurações de acordo com
            suas necessidades. As alterações são salvas automaticamente.
          </Text>
        </View>
      </ScrollView>

      {/* Alert Dialog Moderno */}
      {AlertDialogComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 12,
    paddingLeft: 4,
  },
  settingItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      },
    }),
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  actionItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      },
    }),
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },
  actionIconDanger: {
    backgroundColor: "#ffebee",
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  actionTitleDanger: {
    color: Colors.light.error,
  },
  actionDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  infoSection: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  loadingContainer: {
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
});
