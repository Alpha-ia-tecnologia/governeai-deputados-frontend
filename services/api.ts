import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Detecção automática de ambiente para API URL
const getBaseUrl = () => {
  // 1. Variável de ambiente do EasyPanel/Nixpacks (prioridade máxima)
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  // 2. Detecção automática: se não é localhost, assume produção
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
      // Em produção, usar URL fixa do backend EasyPanel
      return "https://governe-ai-deputado-governeai-dep-backend.gkgtsp.easypanel.host";
    }
  }

  // 3. Fallback: desenvolvimento local
  return "http://localhost:3750";
};

const API_BASE_URL = getBaseUrl();

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true', // Evita página de confirmação do ngrok na web
  },
});

// Função para decodificar JWT (sem verificar assinatura)
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

// Interceptor para adicionar token JWT em todas as requisições
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      const isHeatmapRequest = config.url?.includes('heatmap');

      // Log detalhado apenas para requisições do heatmap
      if (isHeatmapRequest) {
        console.log('\n========== API REQUEST (Heatmap) ==========');
        console.log('[API] URL:', config.url);
        console.log('[API] Plataforma:', Platform.OS);
        console.log('[API] Token presente:', token ? 'SIM' : 'NÃO');

        if (token) {
          const decoded = decodeJWT(token);
          if (decoded) {
            console.log('[API] Token info:');
            console.log('  - userId:', decoded.sub);
            console.log('  - email:', decoded.email);
            console.log('  - role:', decoded.role);
            console.log('  - vereadorId:', decoded.vereadorId ?? 'NULL');
            console.log('  - expira em:', new Date(decoded.exp * 1000).toLocaleString());
          }
        }
        console.log('============================================\n');
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('[API] Erro ao obter token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Criar um callback global para notificar sobre logout
let onUnauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requestUrl = error.config?.url || '';
    const isAuthRoute = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

    // Apenas limpar auth em erros 401 se NÃO for rota de autenticação
    if (error.response?.status === 401 && !isAuthRoute) {
      // Token inválido ou expirado
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@user');

      // Notificar a aplicação para fazer logout
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }

    // Formatar mensagem de erro
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'Erro ao comunicar com o servidor';

    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
export { API_BASE_URL };
