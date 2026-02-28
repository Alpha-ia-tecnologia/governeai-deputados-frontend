import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { Platform, Alert, AppState, AppStateStatus } from "react-native";
import * as Haptics from "expo-haptics";
import { notificationService } from "@/services";

interface Preferences {
  notifications: boolean;
  autoSync: boolean;
}

const PREFERENCES_KEY = "@app_preferences";
const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

const defaultPreferences: Preferences = {
  notifications: true,
  autoSync: true,
};

// Função helper para alertas cross-platform
const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

// Função de sincronização - será injetada pelo DataContext
let syncCallback: (() => Promise<void>) | null = null;

export const setSyncCallback = (callback: () => Promise<void>) => {
  syncCallback = callback;
};

export const [PreferencesContext, usePreferences] = createContextHook(() => {
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    loadPreferences();
  }, []);

  // Inicializar notificações quando o contexto carrega
  useEffect(() => {
    if (!isLoading && preferences.notifications) {
      notificationService.initialize();
    }
  }, [isLoading, preferences.notifications]);

  // Configurar sincronização automática
  useEffect(() => {
    if (!isLoading && preferences.autoSync) {
      startAutoSync();
    } else {
      stopAutoSync();
    }

    return () => {
      stopAutoSync();
    };
  }, [isLoading, preferences.autoSync]);

  // Monitorar estado do app para sincronizar quando volta ao foco
  useEffect(() => {
    const subscription = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [preferences.autoSync]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    // Quando o app volta ao foreground e autoSync está ativado
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === "active" &&
      preferences.autoSync
    ) {
      console.log("App voltou ao foco - verificando sincronização...");

      // Sincronizar se já passou mais de 1 minuto desde a última sync
      const now = new Date();
      if (!lastSyncTime || (now.getTime() - lastSyncTime.getTime()) > 60 * 1000) {
        await triggerSync(false); // Sync silenciosa
      }
    }

    appState.current = nextAppState;
  };

  const startAutoSync = () => {
    console.log("Iniciando sincronização automática a cada 5 minutos");

    // Limpar intervalo existente
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
    }

    // Fazer sync inicial
    triggerSync(false);

    // Configurar intervalo
    syncIntervalRef.current = setInterval(() => {
      triggerSync(false);
    }, SYNC_INTERVAL_MS);
  };

  const stopAutoSync = () => {
    if (syncIntervalRef.current) {
      console.log("Parando sincronização automática");
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  };

  const triggerSync = async (showMessage: boolean = true) => {
    if (isSyncing || !syncCallback) {
      return;
    }

    try {
      setIsSyncing(true);
      console.log("Sincronizando dados com o servidor...");

      await syncCallback();

      setLastSyncTime(new Date());
      console.log("Sincronização concluída com sucesso");

      if (showMessage) {
        showAlert("Sincronizado", "Dados atualizados com sucesso!");
      }
    } catch (error) {
      console.error("Erro na sincronização:", error);
      if (showMessage) {
        showAlert("Erro", "Não foi possível sincronizar os dados");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Mesclar com defaults para garantir que novos campos existam
        setPreferences({ ...defaultPreferences, ...parsed });
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async (newPreferences: Preferences) => {
    try {
      await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.error("Error saving preferences:", error);
      showAlert("Erro", "Não foi possível salvar as preferências");
    }
  };

  const updatePreference = useCallback(
    async <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
      const newPreferences = { ...preferences, [key]: value };
      await savePreferences(newPreferences);

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      if (key === "notifications") {
        if (value) {
          // Ativar notificações
          const initialized = await notificationService.initialize();
          if (initialized) {
            showAlert("Notificações Ativadas", "Você receberá lembretes de seus compromissos.");
          } else {
            showAlert("Permissão Necessária", "Por favor, permita notificações nas configurações do dispositivo.");
          }
        } else {
          // Desativar notificações - cancelar todas agendadas
          await notificationService.cancelAllNotifications();
          showAlert("Notificações Desativadas", "Você não receberá mais lembretes.");
        }
      }

      if (key === "autoSync") {
        if (value) {
          showAlert("Sincronização Ativada", "Seus dados serão sincronizados automaticamente a cada 5 minutos.");
        } else {
          showAlert("Sincronização Desativada", "A sincronização automática foi desativada.");
        }
      }
    },
    [preferences]
  );

  const resetPreferences = useCallback(async () => {
    await savePreferences(defaultPreferences);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    showAlert("Sucesso", "Preferências restauradas");
  }, []);

  // Função para forçar sincronização manual
  const forceSync = useCallback(async () => {
    await triggerSync(true);
  }, []);

  return useMemo(
    () => ({
      preferences,
      isLoading,
      isSyncing,
      lastSyncTime,
      updatePreference,
      resetPreferences,
      forceSync,
    }),
    [preferences, isLoading, isSyncing, lastSyncTime, updatePreference, resetPreferences, forceSync]
  );
});
