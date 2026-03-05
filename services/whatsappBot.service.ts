import api from './api';

// ─── Types ───

export interface BotStep {
    id: string;
    type: 'greeting' | 'menu' | 'text_response' | 'collect_info' | 'transfer_to_human' | 'send_template' | 'end';
    message: string;
    options?: Array<{ label: string; value: string; nextStepId: string }>;
    nextStepId?: string;
    collectField?: string;
    templateName?: string;
}

export interface BotFlow {
    id: string;
    name: string;
    description: string | null;
    status: 'active' | 'inactive';
    steps: BotStep[];
    entryStepId: string;
    triggerKeywords: string[];
    isDefault: boolean;
    vereadorId: string;
    createdAt: string;
    updatedAt: string;
}

export interface BotFlowTemplate {
    name: string;
    description: string;
    steps: BotStep[];
    entryStepId: string;
}

// ─── API ───
const ENDPOINT = '/whatsapp/bot';

export const whatsappBotService = {
    async getFlows(): Promise<BotFlow[]> {
        const response = await api.get(`${ENDPOINT}/flows`);
        return response.data;
    },

    async getFlowById(id: string): Promise<BotFlow> {
        const response = await api.get(`${ENDPOINT}/flows/${id}`);
        return response.data;
    },

    async getTemplates(): Promise<BotFlowTemplate[]> {
        const response = await api.get(`${ENDPOINT}/templates`);
        return response.data;
    },

    async createFlow(payload: {
        name: string;
        description?: string;
        steps: BotStep[];
        entryStepId: string;
        triggerKeywords?: string[];
        isDefault?: boolean;
    }): Promise<BotFlow> {
        const response = await api.post(`${ENDPOINT}/flows`, payload);
        return response.data;
    },

    async updateFlow(id: string, payload: Partial<BotFlow>): Promise<BotFlow> {
        const response = await api.patch(`${ENDPOINT}/flows/${id}`, payload);
        return response.data;
    },

    async deleteFlow(id: string): Promise<void> {
        await api.delete(`${ENDPOINT}/flows/${id}`);
    },

    async toggleFlow(id: string): Promise<BotFlow> {
        const response = await api.post(`${ENDPOINT}/flows/${id}/toggle`);
        return response.data;
    },
};
