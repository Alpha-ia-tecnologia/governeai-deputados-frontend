import api from './api';
import { AuditLogEntry, AuditAction } from '../types';

const ENDPOINT = '/audit-log';

export const auditLogService = {
    async getAll(limit?: number): Promise<AuditLogEntry[]> {
        const response = await api.get(ENDPOINT, { params: limit ? { limit } : {} });
        return response.data;
    },

    async getByEntity(entity: string): Promise<AuditLogEntry[]> {
        const response = await api.get(`${ENDPOINT}/by-entity/${entity}`);
        return response.data;
    },

    async getByAction(action: AuditAction): Promise<AuditLogEntry[]> {
        const response = await api.get(`${ENDPOINT}/by-action/${action}`);
        return response.data;
    },

    async clear(): Promise<void> {
        await api.delete(ENDPOINT);
    },
};
