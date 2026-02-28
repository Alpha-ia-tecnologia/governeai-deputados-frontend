import api from './api';
import { Amendment } from '../types';

export const amendmentsService = {
  /**
   * Listar todas as emendas
   */
  async getAll(): Promise<Amendment[]> {
    const response = await api.get<Amendment[]>('/amendments');
    return response.data;
  },

  /**
   * Buscar emenda por ID
   */
  async getById(id: string): Promise<Amendment> {
    const response = await api.get<Amendment>(`/amendments/${id}`);
    return response.data;
  },

  /**
   * Criar nova emenda
   */
  async create(data: Omit<Amendment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Amendment> {
    const response = await api.post<Amendment>('/amendments', data);
    return response.data;
  },

  /**
   * Atualizar emenda
   */
  async update(id: string, data: Partial<Amendment>): Promise<Amendment> {
    const response = await api.patch<Amendment>(`/amendments/${id}`, data);
    return response.data;
  },

  /**
   * Deletar emenda
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/amendments/${id}`);
  },
};
