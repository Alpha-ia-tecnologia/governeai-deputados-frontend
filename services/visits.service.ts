import api from './api';
import { Visit } from '../types';

export const visitsService = {
  /**
   * Listar todas as visitas
   */
  async getAll(): Promise<Visit[]> {
    const response = await api.get<Visit[]>('/visits');
    return response.data;
  },

  /**
   * Buscar visita por ID
   */
  async getById(id: string): Promise<Visit> {
    const response = await api.get<Visit>(`/visits/${id}`);
    return response.data;
  },

  /**
   * Criar nova visita
   */
  async create(data: Omit<Visit, 'id' | 'createdAt'>): Promise<Visit> {
    const response = await api.post<Visit>('/visits', data);
    return response.data;
  },

  /**
   * Atualizar visita
   */
  async update(id: string, data: Partial<Visit>): Promise<Visit> {
    const response = await api.patch<Visit>(`/visits/${id}`, data);
    return response.data;
  },

  /**
   * Deletar visita
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/visits/${id}`);
  },
};
