import api from './api';
import { HelpRecord } from '../types';

export const helpRecordsService = {
  /**
   * Listar todos os atendimentos
   */
  async getAll(): Promise<HelpRecord[]> {
    const response = await api.get<HelpRecord[]>('/help-records');
    return response.data;
  },

  /**
   * Buscar atendimento por ID
   */
  async getById(id: string): Promise<HelpRecord> {
    const response = await api.get<HelpRecord>(`/help-records/${id}`);
    return response.data;
  },

  /**
   * Criar novo atendimento
   */
  async create(data: Omit<HelpRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<HelpRecord> {
    const response = await api.post<HelpRecord>('/help-records', data);
    return response.data;
  },

  /**
   * Atualizar atendimento
   */
  async update(id: string, data: Partial<HelpRecord>): Promise<HelpRecord> {
    const response = await api.patch<HelpRecord>(`/help-records/${id}`, data);
    return response.data;
  },

  /**
   * Deletar atendimento
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/help-records/${id}`);
  },
};
