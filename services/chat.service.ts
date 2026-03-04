import api from './api';

export interface ChatConversation {
    id: string;
    name: string | null;
    isGroup: boolean;
    createdById: string;
    participants: ChatParticipant[];
    lastMessage?: {
        content: string;
        senderName: string;
        createdAt: string;
        hasAttachment: boolean;
    };
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface ChatParticipant {
    id: string;
    userId: string;
    role: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

export interface ChatMessage {
    id: string;
    content: string;
    senderId: string;
    conversationId: string;
    attachmentUrl: string | null;
    attachmentName: string | null;
    readAt: string | null;
    sender: {
        id: string;
        name: string;
    };
    createdAt: string;
}

const ENDPOINT = '/chat';

export const chatService = {
    // Conversations
    async getConversations(): Promise<ChatConversation[]> {
        const response = await api.get(`${ENDPOINT}/conversations`);
        return response.data;
    },

    async getConversationDetails(id: string): Promise<ChatConversation> {
        const response = await api.get(`${ENDPOINT}/conversations/${id}`);
        return response.data;
    },

    // Messages
    async getMessages(conversationId: string, limit = 50, offset = 0): Promise<ChatMessage[]> {
        const response = await api.get(`${ENDPOINT}/conversations/${conversationId}/messages`, {
            params: { limit, offset },
        });
        return response.data;
    },

    async sendMessage(conversationId: string, content: string, attachmentUrl?: string, attachmentName?: string): Promise<ChatMessage> {
        const response = await api.post(`${ENDPOINT}/conversations/${conversationId}/messages`, {
            content,
            attachmentUrl,
            attachmentName,
        });
        return response.data;
    },

    // Direct conversations
    async createDirectConversation(targetUserId: string): Promise<ChatConversation> {
        const response = await api.post(`${ENDPOINT}/conversations/direct`, { targetUserId });
        return response.data;
    },

    // Groups
    async createGroup(name: string, memberIds: string[]): Promise<ChatConversation> {
        const response = await api.post(`${ENDPOINT}/conversations/group`, { name, memberIds });
        return response.data;
    },

    async updateGroup(id: string, name: string): Promise<ChatConversation> {
        const response = await api.patch(`${ENDPOINT}/conversations/${id}`, { name });
        return response.data;
    },

    async addMember(conversationId: string, userId: string): Promise<void> {
        await api.post(`${ENDPOINT}/conversations/${conversationId}/members`, { userId });
    },

    async removeMember(conversationId: string, userId: string): Promise<void> {
        await api.delete(`${ENDPOINT}/conversations/${conversationId}/members/${userId}`);
    },

    async deleteGroup(conversationId: string): Promise<void> {
        await api.delete(`${ENDPOINT}/conversations/${conversationId}`);
    },

    // Upload
    async uploadFile(file: any): Promise<{ url: string; name: string; size: number; mimetype: string }> {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`${ENDPOINT}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};
