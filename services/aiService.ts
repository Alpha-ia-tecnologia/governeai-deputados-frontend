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

// ==================== ANÁLISE ELEITORAL IA ====================

export interface ElectionAnalysisResult {
    analysis: string;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
}

export interface ElectionComparisonResult {
    comparison: string;
    evolution: string;
    recommendations: string[];
}

export interface ScenarioSimulationResult {
    projectedVotes: number;
    confidenceLevel: string;
    analysis: string;
    cityProjections: { city: string; currentVotes: number; projectedVotes: number; change: string }[];
    strategies: string[];
}

export async function analyzeElection(data: {
    candidateName: string;
    party: string;
    totalVotes: number;
    year: number;
    competitors: { candidateName: string; party: string; totalVotes: number }[];
}): Promise<ElectionAnalysisResult> {
    try {
        const response = await api.post('/election-results/ai/analyze', data);
        return response.data;
    } catch (error: any) {
        console.error('Erro na análise IA:', error);
        throw new Error(error.response?.data?.message || 'Erro ao consultar IA');
    }
}

export async function compareElections(data: {
    candidateName: string;
    election2018: { party: string; votes: number; result: string; municipalities: number };
    election2022: { party: string; votes: number; result: string; municipalities: number };
}): Promise<ElectionComparisonResult> {
    try {
        const response = await api.post('/election-results/ai/compare', data);
        return response.data;
    } catch (error: any) {
        console.error('Erro na comparação IA:', error);
        throw new Error(error.response?.data?.message || 'Erro ao consultar IA');
    }
}

export async function simulateScenario(data: {
    candidateName: string;
    party: string;
    currentVotes: number;
    scenario: string;
    scenarioDetails: string;
    topCities: { name: string; votes: number }[];
}): Promise<ScenarioSimulationResult> {
    try {
        const response = await api.post('/election-results/ai/simulate', data);
        return response.data;
    } catch (error: any) {
        console.error('Erro na simulação IA:', error);
        throw new Error(error.response?.data?.message || 'Erro ao consultar IA');
    }
}

export async function analyzeProjection(data: ProjectionAnalysisData): Promise<string> {
    try {
        const response = await api.post('/election-results/ai/analyze', {
            candidateName: data.candidateName,
            party: data.candidateParty,
            totalVotes: data.currentVotes,
            year: 2022,
            competitors: [],
        });
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
        const response = await api.post('/election-results/ai/chat', {
            message,
            context: {
                candidateName: candidateContext.name,
                party: candidateContext.party,
                state: 'MA',
                electionHistory: [
                    { year: 2018, votes: 43974, result: 'ELEITO' },
                    { year: 2022, votes: 34365, result: '2º SUPLENTE' },
                ],
            },
        });
        return response.data.response || 'Sem resposta.';
    } catch (error: any) {
        console.error('Erro no chat IA:', error);
        throw new Error(error.response?.data?.error || 'Erro ao consultar IA');
    }
}
