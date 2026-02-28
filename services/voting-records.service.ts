import api from './api';
import { VotingRecord } from '../types';

const ENDPOINT = '/voting-records';

export const votingRecordsService = {
    async getAll(): Promise<VotingRecord[]> {
        const response = await api.get(ENDPOINT);
        return response.data;
    },

    async getById(id: string): Promise<VotingRecord> {
        const response = await api.get(`${ENDPOINT}/${id}`);
        return response.data;
    },

    async getPresenceRate(): Promise<{ total: number; present: number; absent: number; rate: number }> {
        const response = await api.get(`${ENDPOINT}/presence-rate`);
        return response.data;
    },

    async create(record: Omit<VotingRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<VotingRecord> {
        const response = await api.post(ENDPOINT, record);
        return response.data;
    },

    async update(id: string, record: Partial<VotingRecord>): Promise<VotingRecord> {
        const response = await api.patch(`${ENDPOINT}/${id}`, record);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`${ENDPOINT}/${id}`);
    },
};
