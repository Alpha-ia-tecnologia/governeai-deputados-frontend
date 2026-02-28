import api from './api';
import { LegislativeBill, BillStatus, BillAuthorship } from '../types';

const ENDPOINT = '/bills';

export const billsService = {
    async getAll(): Promise<LegislativeBill[]> {
        const response = await api.get(ENDPOINT);
        return response.data;
    },

    async getById(id: string): Promise<LegislativeBill> {
        const response = await api.get(`${ENDPOINT}/${id}`);
        return response.data;
    },

    async getByAuthorship(authorship: BillAuthorship): Promise<LegislativeBill[]> {
        const response = await api.get(`${ENDPOINT}/by-authorship/${authorship}`);
        return response.data;
    },

    async getByStatus(status: BillStatus): Promise<LegislativeBill[]> {
        const response = await api.get(`${ENDPOINT}/by-status/${status}`);
        return response.data;
    },

    async getStats(): Promise<{ total: number; em_tramitacao: number; aprovado: number; rejeitado: number; proprio: number }> {
        const response = await api.get(`${ENDPOINT}/stats`);
        return response.data;
    },

    async create(bill: Omit<LegislativeBill, 'id' | 'createdAt' | 'updatedAt'>): Promise<LegislativeBill> {
        const response = await api.post(ENDPOINT, bill);
        return response.data;
    },

    async update(id: string, bill: Partial<LegislativeBill>): Promise<LegislativeBill> {
        const response = await api.patch(`${ENDPOINT}/${id}`, bill);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`${ENDPOINT}/${id}`);
    },
};
