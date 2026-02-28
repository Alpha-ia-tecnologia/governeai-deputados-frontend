import api from './api';
import { Appointment } from '../types';

export const appointmentsService = {
  /**
   * Listar todos os compromissos
   */
  async getAll(): Promise<Appointment[]> {
    const response = await api.get<Appointment[]>('/appointments');
    return response.data;
  },

  /**
   * Buscar compromisso por ID
   */
  async getById(id: string): Promise<Appointment> {
    const response = await api.get<Appointment>(`/appointments/${id}`);
    return response.data;
  },

  /**
   * Criar novo compromisso
   */
  async create(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const response = await api.post<Appointment>('/appointments', data);
    return response.data;
  },

  /**
   * Atualizar compromisso
   */
  async update(id: string, data: Partial<Appointment>): Promise<Appointment> {
    const response = await api.patch<Appointment>(`/appointments/${id}`, data);
    return response.data;
  },

  /**
   * Deletar compromisso
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/appointments/${id}`);
  },
};
