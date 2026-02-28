import api from './api';
import { Voter, HeatmapData, NeighborhoodStatsResponse } from '../types';

export const votersService = {
  /**
   * Listar todos os eleitores
   */
  async getAll(): Promise<Voter[]> {
    try {
      const response = await api.get<Voter[]>('/voters');

      if (Array.isArray(response.data)) {
        return response.data;
      }

      // Fallback para estruturas envelopadas
      if (response.data && Array.isArray((response.data as any).data)) {
        return (response.data as any).data;
      }

      return [];
    } catch (error) {
      console.error('[VotersService] Erro ao buscar eleitores:', error);
      throw error;
    }
  },

  /**
   * Buscar eleitor por ID
   */
  async getById(id: string): Promise<Voter> {
    const response = await api.get<Voter>(`/voters/${id}`);
    return response.data;
  },

  /**
   * Criar novo eleitor
   */
  async create(data: Omit<Voter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Voter> {
    const response = await api.post<Voter>('/voters', data);
    return response.data;
  },

  /**
   * Atualizar eleitor
   */
  async update(id: string, data: Partial<Voter>): Promise<Voter> {
    const response = await api.patch<Voter>(`/voters/${id}`, data);
    return response.data;
  },

  /**
   * Deletar eleitor
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/voters/${id}`);
  },

  // ============================================
  // ENDPOINTS PARA MAPA DE CALOR
  // ============================================

  /**
   * Buscar dados para o mapa de calor
   */
  async getHeatmapData(): Promise<HeatmapData> {
    const response = await api.get<HeatmapData>('/voters/heatmap/data');
    return response.data;
  },

  /**
   * Buscar estatísticas por bairro
   */
  async getStatsByNeighborhood(): Promise<NeighborhoodStatsResponse> {
    const response = await api.get<NeighborhoodStatsResponse>('/voters/heatmap/stats-by-neighborhood');
    if (!response.data || !response.data.neighborhoods) {
      return { neighborhoods: [], total: 0 };
    }
    return response.data;
  },

  /**
   * Geocodificar eleitores pendentes (que não têm coordenadas)
   */
  async geocodePendingVoters(limit: number = 50): Promise<{ processed: number; success: number; failed: number }> {
    const response = await api.post<{ processed: number; success: number; failed: number }>(
      `/voters/heatmap/geocode-pending?limit=${limit}`
    );
    return response.data;
  },
};
