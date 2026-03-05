import api from './api';

// ─── Types ───
export interface WhatsappChannelData {
    id: string;
    instanceName: string;
    instanceId: string | null;
    status: 'CREATED' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTED';
    phone: string | null;
    profileName: string | null;
    profilePictureUrl: string | null;
    createdAt: string;
}

export interface CreateChannelResult {
    channel: WhatsappChannelData;
    qrcode?: {
        base64?: string;
        code?: string;
        pairingCode?: string;
    };
}

export interface ChannelStatusResult {
    channel: WhatsappChannelData;
    state: string;
}

// ─── API ───
const ENDPOINT = '/whatsapp/channels';

export const whatsappChannelService = {
    async getAll(): Promise<WhatsappChannelData[]> {
        const response = await api.get(ENDPOINT);
        return response.data;
    },

    async create(instanceName: string): Promise<CreateChannelResult> {
        const response = await api.post(ENDPOINT, { instanceName });
        return response.data;
    },

    async getQrCode(channelId: string): Promise<any> {
        const response = await api.get(`${ENDPOINT}/${channelId}/qrcode`);
        return response.data;
    },

    async getStatus(channelId: string): Promise<ChannelStatusResult> {
        const response = await api.get(`${ENDPOINT}/${channelId}/status`);
        return response.data;
    },

    async delete(channelId: string): Promise<void> {
        await api.delete(`${ENDPOINT}/${channelId}`);
    },

    async testConnection(): Promise<{ success: boolean; message: string }> {
        const response = await api.post(`${ENDPOINT}/test-connection`);
        return response.data;
    },
};
