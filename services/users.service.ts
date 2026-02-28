import api from './api';
import { User } from '@/types';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  cpf: string;
  phone: string;
  role: string;
  region?: string;
  city?: string;
  state?: string;
  vereadorId?: string;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  cpf?: string;
  phone?: string;
  role?: string;
  region?: string;
  city?: string;
  state?: string;
  vereadorId?: string | null;
  active?: boolean;
}

class UsersService {
  async getAll(): Promise<User[]> {
    try {
      console.log('UsersService: Buscando usuários...');
      const response = await api.get('/users', {
        timeout: 5000 // Reduzir timeout para 5 segundos
      });
      console.log(`UsersService: ${response.data.length} usuários encontrados`);
      return response.data || [];
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      // Retornar array vazio em caso de erro para não quebrar a UI
      return [];
    }
  }

  async getById(id: string): Promise<User> {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      throw error;
    }
  }

  async create(userData: CreateUserData): Promise<User> {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async update(id: string, userData: UpdateUserData): Promise<User> {
    try {
      const response = await api.patch(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      throw error;
    }
  }

  async toggleActive(id: string, active: boolean): Promise<User> {
    try {
      const response = await api.patch(`/users/${id}`, { active });
      return response.data;
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      throw error;
    }
  }

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await api.get(`/users/check/email/${encodeURIComponent(email)}`);
      return response.data.exists;
    } catch (error) {
      console.error('Erro ao verificar email:', error);
      return false;
    }
  }

  async checkCpfExists(cpf: string): Promise<boolean> {
    try {
      const response = await api.get(`/users/check/cpf/${encodeURIComponent(cpf)}`);
      return response.data.exists;
    } catch (error) {
      console.error('Erro ao verificar CPF:', error);
      return false;
    }
  }
}

export const usersService = new UsersService();
