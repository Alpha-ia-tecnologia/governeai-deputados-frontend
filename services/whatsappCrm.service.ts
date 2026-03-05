import api from './api';

// ─── Types ───

export interface WhatsappLabel {
    id: string;
    name: string;
    color: string;
    vereadorId: string;
    contacts: WhatsappCrmContact[];
}

export interface WhatsappCrmContact {
    id: string;
    phone: string;
    name: string | null;
    profileName: string | null;
    email: string | null;
    cpf: string | null;
    notes: string | null;
    companyName: string | null;
    linkedVoterId: string | null;
    labels: WhatsappLabel[];
    createdAt: string;
    updatedAt: string;
}

export interface CrmStats {
    total: number;
    withEmail: number;
    withCpf: number;
    withCompany: number;
    linkedToVoter: number;
}

// ─── Label API ───
const LABEL_ENDPOINT = '/whatsapp/labels';

export const whatsappLabelService = {
    async getAll(): Promise<WhatsappLabel[]> {
        const response = await api.get(LABEL_ENDPOINT);
        return response.data;
    },

    async getById(id: string): Promise<WhatsappLabel> {
        const response = await api.get(`${LABEL_ENDPOINT}/${id}`);
        return response.data;
    },

    async create(payload: { name: string; color?: string }): Promise<WhatsappLabel> {
        const response = await api.post(LABEL_ENDPOINT, payload);
        return response.data;
    },

    async update(id: string, payload: { name?: string; color?: string }): Promise<WhatsappLabel> {
        const response = await api.patch(`${LABEL_ENDPOINT}/${id}`, payload);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`${LABEL_ENDPOINT}/${id}`);
    },

    async addToContact(labelId: string, contactId: string): Promise<WhatsappCrmContact> {
        const response = await api.post(`${LABEL_ENDPOINT}/${labelId}/contacts/${contactId}`);
        return response.data;
    },

    async removeFromContact(labelId: string, contactId: string): Promise<WhatsappCrmContact> {
        const response = await api.delete(`${LABEL_ENDPOINT}/${labelId}/contacts/${contactId}`);
        return response.data;
    },
};

// ─── CRM/Contacts API ───
const CONTACT_ENDPOINT = '/whatsapp/contacts';

export const whatsappCrmService = {
    async getAll(search?: string): Promise<WhatsappCrmContact[]> {
        const response = await api.get(CONTACT_ENDPOINT, { params: search ? { search } : {} });
        return response.data;
    },

    async getById(id: string): Promise<WhatsappCrmContact> {
        const response = await api.get(`${CONTACT_ENDPOINT}/${id}`);
        return response.data;
    },

    async getStats(): Promise<CrmStats> {
        const response = await api.get(`${CONTACT_ENDPOINT}/stats`);
        return response.data;
    },

    async updateCrm(id: string, payload: {
        name?: string;
        email?: string;
        cpf?: string;
        notes?: string;
        companyName?: string;
        linkedVoterId?: string;
    }): Promise<WhatsappCrmContact> {
        const response = await api.patch(`${CONTACT_ENDPOINT}/${id}`, payload);
        return response.data;
    },
};
