import api from './api';
import { GabineteTask, TaskStatus } from '../types';

const ENDPOINT = '/tasks';

export const tasksService = {
    async getAll(): Promise<GabineteTask[]> {
        const response = await api.get(ENDPOINT);
        return response.data;
    },

    async getById(id: string): Promise<GabineteTask> {
        const response = await api.get(`${ENDPOINT}/${id}`);
        return response.data;
    },

    async getByAssignee(assigneeId: string): Promise<GabineteTask[]> {
        const response = await api.get(`${ENDPOINT}/by-assignee/${assigneeId}`);
        return response.data;
    },

    async getByStatus(status: TaskStatus): Promise<GabineteTask[]> {
        const response = await api.get(`${ENDPOINT}/by-status/${status}`);
        return response.data;
    },

    async getStats(): Promise<{ pendente: number; em_andamento: number; concluida: number; atrasada: number }> {
        const response = await api.get(`${ENDPOINT}/stats`);
        return response.data;
    },

    async create(task: Omit<GabineteTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<GabineteTask> {
        const response = await api.post(ENDPOINT, task);
        return response.data;
    },

    async update(id: string, task: Partial<GabineteTask>): Promise<GabineteTask> {
        const response = await api.patch(`${ENDPOINT}/${id}`, task);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`${ENDPOINT}/${id}`);
    },
};
