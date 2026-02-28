import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

interface LoginResponse {
  access_token: string;
  user: User;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
  role: string;
  region?: string;
}

export const authService = {
  /**
   * Fazer login
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    // Salvar token e usuário no AsyncStorage
    await AsyncStorage.setItem('@auth_token', response.data.access_token);
    await AsyncStorage.setItem('@user', JSON.stringify(response.data.user));
    console.log(response.data);
    return response.data;
  },

  /**
   * Registrar novo usuário
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/register', data);

    // Salvar token e usuário no AsyncStorage
    await AsyncStorage.setItem('@auth_token', response.data.access_token);
    await AsyncStorage.setItem('@user', JSON.stringify(response.data.user));

    return response.data;
  },

  /**
   * Fazer logout
   */
  async logout(): Promise<void> {
    await AsyncStorage.removeItem('@auth_token');
    await AsyncStorage.removeItem('@user');
  },

  /**
   * Obter usuário salvo
   */
  async getStoredUser(): Promise<User | null> {
    const userJson = await AsyncStorage.getItem('@user');
    return userJson ? JSON.parse(userJson) : null;
  },

  /**
   * Obter token salvo
   */
  async getStoredToken(): Promise<string | null> {
    return await AsyncStorage.getItem('@auth_token');
  },
};
