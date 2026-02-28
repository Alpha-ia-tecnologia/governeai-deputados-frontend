import api from './api';
import { LawProject } from '../types';

export const projectsService = {
  /**
   * Listar todos os projetos
   */
  async getAll(): Promise<LawProject[]> {
    const response = await api.get<LawProject[]>('/projects');
    return response.data;
  },

  /**
   * Buscar projeto por ID
   */
  async getById(id: string): Promise<LawProject> {
    const response = await api.get<LawProject>(`/projects/${id}`);
    return response.data;
  },

  /**
   * Criar novo projeto
   */
  async create(data: Omit<LawProject, 'id' | 'createdAt' | 'updatedAt' | 'views'>): Promise<LawProject> {
    const response = await api.post<LawProject>('/projects', data);
    return response.data;
  },

  /**
   * Atualizar projeto
   */
  async update(id: string, data: Partial<LawProject>): Promise<LawProject> {
    const response = await api.patch<LawProject>(`/projects/${id}`, data);
    return response.data;
  },

  /**
   * Deletar projeto
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  /**
   * Incrementar visualizações do projeto
   */
  async incrementViews(id: string): Promise<LawProject> {
    const response = await api.post<LawProject>(`/projects/${id}/view`);
    return response.data;
  },
};
