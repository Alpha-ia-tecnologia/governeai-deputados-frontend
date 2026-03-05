import api from './api';

// ─── Types ───

export interface DashboardMetrics {
    overview: {
        totalConversations: number;
        activeConversations: number;
        resolvedConversations: number;
        pendingConversations: number;
        totalMessages: number;
        inboundMessages: number;
        outboundMessages: number;
        totalContacts: number;
        newContactsInPeriod: number;
    };
    performance: {
        avgResponseTimeMinutes: number;
        avgResolutionTimeMinutes: number;
        resolutionRate: number;
    };
    timeline: Array<{
        date: string;
        inbound: number;
        outbound: number;
        conversations: number;
    }>;
    topAttendants: Array<{
        userId: string;
        name: string;
        resolved: number;
        messages: number;
    }>;
    messageTypes: Array<{
        type: string;
        count: number;
    }>;
}

// ─── API ───
const ENDPOINT = '/whatsapp/reports';

export const whatsappReportService = {
    async getDashboard(startDate?: string, endDate?: string): Promise<DashboardMetrics> {
        const params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await api.get(`${ENDPOINT}/dashboard`, { params });
        return response.data;
    },

    async exportReport(startDate?: string, endDate?: string): Promise<any> {
        const params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await api.get(`${ENDPOINT}/export`, { params });
        return response.data;
    },

    async getConversationsReport(startDate?: string, endDate?: string): Promise<any[]> {
        const params: any = {};
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
        const response = await api.get(`${ENDPOINT}/conversations`, { params });
        return response.data;
    },
};
