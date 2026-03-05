import api from './api';

// ─── Types ───

export interface WhatsappTemplateVariable {
    component: string;
    index: number;
    example?: string;
}

export interface WhatsappTemplate {
    id: string;
    metaTemplateId: string | null;
    name: string;
    language: string;
    category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    components: any[];
    vereadorId: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTemplatePayload {
    name: string;
    language?: string;
    category: 'UTILITY' | 'MARKETING' | 'AUTHENTICATION';
    components: any[];
}

export interface SendTemplatePayload {
    phone: string;
    templateName: string;
    languageCode?: string;
    components?: any[];
}

// ─── API Service ───

const ENDPOINT = '/whatsapp/templates';

export const whatsappTemplateService = {
    async getAll(): Promise<WhatsappTemplate[]> {
        const response = await api.get(ENDPOINT);
        return response.data;
    },

    async getApproved(): Promise<WhatsappTemplate[]> {
        const response = await api.get(`${ENDPOINT}/approved`);
        return response.data;
    },

    async getById(id: string): Promise<WhatsappTemplate> {
        const response = await api.get(`${ENDPOINT}/${id}`);
        return response.data;
    },

    async getVariables(id: string): Promise<WhatsappTemplateVariable[]> {
        const response = await api.get(`${ENDPOINT}/${id}/variables`);
        return response.data;
    },

    async create(payload: CreateTemplatePayload): Promise<WhatsappTemplate> {
        const response = await api.post(ENDPOINT, payload);
        return response.data;
    },

    async update(id: string, payload: Partial<CreateTemplatePayload>): Promise<WhatsappTemplate> {
        const response = await api.patch(`${ENDPOINT}/${id}`, payload);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`${ENDPOINT}/${id}`);
    },

    async sync(): Promise<{ synced: number }> {
        const response = await api.post(`${ENDPOINT}/sync`);
        return response.data;
    },

    async send(payload: SendTemplatePayload): Promise<{ messageId: string }> {
        const response = await api.post(`${ENDPOINT}/send`, payload);
        return response.data;
    },
};
