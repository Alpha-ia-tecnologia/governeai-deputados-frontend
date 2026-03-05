import api from './api';

// ─── Types ───

export interface WhatsappContactInfo {
    id: string;
    phone: string;
    name: string | null;
    profileName: string | null;
    email: string | null;
    cpf: string | null;
    notes: string | null;
    companyName: string | null;
}

export interface WhatsappConversation {
    id: string;
    contactId: string;
    contact: WhatsappContactInfo;
    vereadorId: string;
    assignedToId: string | null;
    assignedTo: { id: string; name: string } | null;
    status: 'pending' | 'active' | 'resolved';
    lastClientMessageAt: string | null;
    resolvedAt: string | null;
    isBotActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface WhatsappMessage {
    id: string;
    conversationId: string;
    wamid: string | null;
    direction: 'inbound' | 'outbound';
    type: 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'contact' | 'interactive' | 'template' | 'sticker' | 'reaction';
    content: string | null;
    mediaId: string | null;
    mediaMimeType: string | null;
    mediaLocalPath: string | null;
    mediaCaption: string | null;
    latitude: number | null;
    longitude: number | null;
    locationName: string | null;
    locationAddress: string | null;
    deliveryStatus: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
    senderUserId: string | null;
    senderUser: { id: string; name: string } | null;
    createdAt: string;
}

export interface WindowStatus {
    is24hWindowOpen: boolean;
    lastClientMessageAt: string | null;
}

// ─── API Service ───

const ENDPOINT = '/whatsapp';

export const whatsappChatService = {
    // Conversas
    async getConversations(): Promise<WhatsappConversation[]> {
        const response = await api.get(`${ENDPOINT}/conversations`);
        return response.data;
    },

    async getMessages(conversationId: string, limit = 50, offset = 0): Promise<WhatsappMessage[]> {
        const response = await api.get(`${ENDPOINT}/conversations/${conversationId}/messages`, {
            params: { limit, offset },
        });
        return response.data;
    },

    async sendMessage(conversationId: string, content: string): Promise<WhatsappMessage> {
        const response = await api.post(`${ENDPOINT}/conversations/${conversationId}/messages`, { content });
        return response.data;
    },

    // Janela 24h
    async getWindowStatus(conversationId: string): Promise<WindowStatus> {
        const response = await api.get(`${ENDPOINT}/conversations/${conversationId}/window-status`);
        return response.data;
    },

    // Fila
    async getPendingQueue(): Promise<WhatsappConversation[]> {
        const response = await api.get(`${ENDPOINT}/queue`);
        return response.data;
    },

    // Atribuição
    async claimConversation(conversationId: string): Promise<WhatsappConversation> {
        const response = await api.post(`${ENDPOINT}/conversations/${conversationId}/claim`);
        return response.data;
    },

    async assignConversation(conversationId: string, assignedToId: string): Promise<WhatsappConversation> {
        const response = await api.patch(`${ENDPOINT}/conversations/${conversationId}/assign`, { assignedToId });
        return response.data;
    },

    // Transferência
    async transferConversation(conversationId: string, targetUserId: string, internalNote?: string): Promise<WhatsappConversation> {
        const response = await api.post(`${ENDPOINT}/conversations/${conversationId}/transfer`, {
            targetUserId,
            internalNote,
        });
        return response.data;
    },

    // Resolver
    async resolveConversation(conversationId: string): Promise<WhatsappConversation> {
        const response = await api.patch(`${ENDPOINT}/conversations/${conversationId}/resolve`);
        return response.data;
    },

    // ─── Evolution API ───

    isEvolutionConversation(conversationId: string): boolean {
        return conversationId?.startsWith('evo_');
    },

    async getEvolutionMessages(conversationId: string): Promise<WhatsappMessage[]> {
        const response = await api.get(`${ENDPOINT}/evolution/chats/${encodeURIComponent(conversationId)}/messages`);
        return response.data;
    },

    async sendEvolutionMessage(conversationId: string, content: string): Promise<WhatsappMessage> {
        const response = await api.post(`${ENDPOINT}/evolution/send`, { conversationId, content });
        return response.data;
    },
};
