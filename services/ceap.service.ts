import api from './api';
import { CeapExpense, CeapSummary, ExpenseCategory } from '../types';

const ENDPOINT = '/ceap';

export const ceapService = {
    async getAll(): Promise<CeapExpense[]> {
        const response = await api.get(ENDPOINT);
        return response.data;
    },

    async getById(id: string): Promise<CeapExpense> {
        const response = await api.get(`${ENDPOINT}/${id}`);
        return response.data;
    },

    async getByCategory(category: ExpenseCategory): Promise<CeapExpense[]> {
        const response = await api.get(`${ENDPOINT}/by-category/${category}`);
        return response.data;
    },

    async getByMonth(year: number, month: number): Promise<CeapExpense[]> {
        const response = await api.get(`${ENDPOINT}/by-month`, { params: { year, month } });
        return response.data;
    },

    async getSummary(): Promise<CeapSummary> {
        const response = await api.get(`${ENDPOINT}/summary`);
        return response.data;
    },

    async create(expense: Omit<CeapExpense, 'id' | 'createdAt' | 'updatedAt'>): Promise<CeapExpense> {
        const response = await api.post(ENDPOINT, expense);
        return response.data;
    },

    async update(id: string, expense: Partial<CeapExpense>): Promise<CeapExpense> {
        const response = await api.patch(`${ENDPOINT}/${id}`, expense);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`${ENDPOINT}/${id}`);
    },
};
