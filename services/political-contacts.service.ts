import api from './api';
import { PoliticalContact, PoliticalRole } from '../types';

const ENDPOINT = '/political-contacts';

export const politicalContactsService = {
    async getAll(): Promise<PoliticalContact[]> {
        const response = await api.get(ENDPOINT);
        return response.data;
    },

    async getById(id: string): Promise<PoliticalContact> {
        const response = await api.get(`${ENDPOINT}/${id}`);
        return response.data;
    },

    async getByRole(role: PoliticalRole): Promise<PoliticalContact[]> {
        const response = await api.get(`${ENDPOINT}/by-role/${role}`);
        return response.data;
    },

    async getByCity(city: string): Promise<PoliticalContact[]> {
        const response = await api.get(`${ENDPOINT}/by-city/${city}`);
        return response.data;
    },

    async create(contact: Omit<PoliticalContact, 'id' | 'createdAt' | 'updatedAt'>): Promise<PoliticalContact> {
        const response = await api.post(ENDPOINT, contact);
        return response.data;
    },

    async update(id: string, contact: Partial<PoliticalContact>): Promise<PoliticalContact> {
        const response = await api.patch(`${ENDPOINT}/${id}`, contact);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`${ENDPOINT}/${id}`);
    },
};
