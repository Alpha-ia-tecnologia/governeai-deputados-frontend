import api from './api';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface CandidateContext {
    name: string;
    party: string;
    number: string;
    totalVotes: number;
    ranking: number;
    topCities: { city: string; votes: number }[];
}

export interface ProjectionAnalysisData {
    candidateName: string;
    candidateParty: string;
    candidateNumber: string;
    currentVotes: number;
    projectedVotes: number;
    currentRanking: number;
    projectedRanking: number;
    rankingChange: number;
    goalVotes: number;
    goalProgress: number;
    scenarioName: string;
    cityResults: { city: string; currentVotes: number; projectedVotes: number; difference: number; percentChange: number }[];
}

export async function analyzeProjection(data: ProjectionAnalysisData): Promise<string> {
    try {
        const response = await api.post('/ai/analyze', data);
        return response.data.analysis || 'Sem análise disponível.';
    } catch (error: any) {
        console.error('Erro ao analisar projeção:', error);
        throw new Error(error.response?.data?.error || 'Erro ao consultar IA');
    }
}

export async function sendChatMessage(
    message: string,
    candidateContext: CandidateContext,
    conversationHistory: ChatMessage[] = [],
): Promise<string> {
    try {
        const response = await api.post('/ai/chat', {
            message,
            candidateContext,
            conversationHistory,
        });
        return response.data.response || 'Sem resposta.';
    } catch (error: any) {
        console.error('Erro no chat IA:', error);
        throw new Error(error.response?.data?.error || 'Erro ao consultar IA');
    }
}
