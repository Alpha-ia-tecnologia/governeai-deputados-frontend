import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState, useCallback, useMemo } from "react";
import { router } from "expo-router";
import { User } from "@/types";
import { authService } from "@/services";
import { setUnauthorizedCallback } from "@/services/api";

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();

    // Registrar callback para limpar auth quando receber 401/500
    setUnauthorizedCallback(() => {
      setUser(null);
      setError(null);
      router.replace("/login");
    });
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const storedUser = await authService.getStoredUser();
      const storedToken = await authService.getStoredToken();

      if (storedUser && storedToken) {
        setUser(storedUser);
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Error loading user:", error);
      setError("Erro ao carregar usuário");
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.login(email, password);
      setUser(response.user);
      setToken(response.access_token);

      return true;
    } catch (error: any) {
      console.error("Error logging in:", error);
      setError(error.message || "Erro ao fazer login");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    cpf: string;
    phone: string;
    role: string;
    region?: string;
  }) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authService.register(userData);
      setUser(response.user);
      setToken(response.access_token);

      return true;
    } catch (error: any) {
      console.error("Error registering:", error);
      setError(error.message || "Erro ao registrar");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setToken(null);
      setError(null);
    } catch (error) {
      console.error("Error logging out:", error);
      setError("Erro ao fazer logout");
    }
  }, []);

  const updateUser = useCallback(async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updates };
      await AsyncStorage.setItem("@user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Erro ao atualizar usuário");
    }
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return useMemo(() => ({
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
    isAuthenticated: !!user,
  }), [user, token, isLoading, error, login, register, logout, updateUser, clearError]);
});
