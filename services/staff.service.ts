import api from './api';
import { StaffMember } from '../types';

const ENDPOINT = '/staff';

export const staffService = {
    async getAll(): Promise<StaffMember[]> {
        const response = await api.get(ENDPOINT);
        return response.data;
    },

    async getById(id: string): Promise<StaffMember> {
        const response = await api.get(`${ENDPOINT}/${id}`);
        return response.data;
    },

    async getActiveCount(): Promise<number> {
        const response = await api.get(`${ENDPOINT}/active-count`);
        return response.data;
    },

    async create(staff: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<StaffMember> {
        const response = await api.post(ENDPOINT, staff);
        return response.data;
    },

    async update(id: string, staff: Partial<StaffMember>): Promise<StaffMember> {
        const response = await api.patch(`${ENDPOINT}/${id}`, staff);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`${ENDPOINT}/${id}`);
    },
};
