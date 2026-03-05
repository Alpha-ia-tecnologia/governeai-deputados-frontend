import api from './api';

// ─── Types ───
export interface WhatsappSettingsData {
    id: string;
    accessToken: string | null;
    phoneNumberId: string | null;
    businessAccountId: string | null;
    verifyToken: string | null;
    apiVersion: string;
    botEnabled: boolean;
    welcomeMessage: string | null;
    offlineMessage: string | null;
    businessHoursStart: string;
    businessHoursEnd: string;
    businessDays: string;
    autoAssignEnabled: boolean;
    maxConcurrentChats: number;
    notifyNewConversation: boolean;
    notifyTransfer: boolean;
    soundEnabled: boolean;
    webhookUrl: string | null;
    evolutionApiUrl: string | null;
    evolutionApiKey: string | null;
}

export interface TestConnectionResult {
    success: boolean;
    message: string;
}

// ─── API ───
const ENDPOINT = '/whatsapp/settings';

export const whatsappSettingsService = {
    async getSettings(): Promise<WhatsappSettingsData> {
        const response = await api.get(ENDPOINT);
        return response.data;
    },

    async updateSettings(payload: Partial<WhatsappSettingsData>): Promise<WhatsappSettingsData> {
        const response = await api.patch(ENDPOINT, payload);
        return response.data;
    },

    async testConnection(): Promise<TestConnectionResult> {
        const response = await api.post(`${ENDPOINT}/test-connection`);
        return response.data;
    },
};
