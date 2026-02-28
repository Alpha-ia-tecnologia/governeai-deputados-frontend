import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
    Dimensions,
    Modal,
    TextInput,
    KeyboardAvoidingView,
} from "react-native";
import { Stack } from "expo-router";
import {
    BarChart3,
    PieChart,
    TrendingUp,
    Users,
    MapPin,
    Filter,
    ChevronDown,
    Award,
    Target,
    Layers,
    Lightbulb,
    GitCompare,
    LayoutGrid,
    Trophy,
    Zap,
    ArrowUpRight,
    ArrowDownRight,
    UserCheck,
    X,
    Shield,
    AlertTriangle,
    CheckCircle,
    Star,
    Building2,
    MessageCircle,
    Send,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import api from "@/services/api";
import {
    isDeputadoPosition,
    getMockDeputadoSummary,
    getMockDeputadoPartyData,
    getMockDeputadoInsights,
    getMockDeputadoTopCandidates,
    getMockDeputadoZones,
    getMockDeputadoRanking,
    getMockDeputadoCandidates,
    getMockDeputadoBySection,
    getMockCandidateByZone,
    getMockCandidateBySection,
    getAdelmoSoaresCompleteInsights,
    getMockDeputadoCityData,
    getMockDeputadoCityDetails,
    getMockDeputadoVotesByCity,
    getMockDeputadoComparison,
    getProjectionScenarios,
    getProjectionBaseData,
    calculateProjection,
    ProjectionScenario,
    ProjectionResult,
} from "@/data/mockDeputadoData";
import { analyzeProjection as aiAnalyzeProjection, sendChatMessage, ChatMessage as AIChatMessage, CandidateContext } from "@/services/aiService";

const { width: screenWidth } = Dimensions.get("window");

// Cores para partidos
const PARTY_COLORS: Record<string, string> = {
    'PP': '#1E3A8A',
    'MDB': '#16A34A',
    'REPUBLICANOS': '#0EA5E9',
    'PL': '#3B82F6',
    'PODE': '#F59E0B',
    'UNIÃO': '#6366F1',
    'PT': '#DC2626',
    'PCdoB': '#B91C1C',
    'PV': '#22C55E',
    'PSOL': '#FBBF24',
    'REDE': '#10B981',
    'PSD': '#8B5CF6',
    'DC': '#6B7280',
    'PSB': '#FF6B00',
    'PDT': '#E11D48',
    'PMN': '#7C3AED',
    'SOLID': '#F97316',
    'AGIR': '#0D9488',
    'NOVO': '#F43F5E',
    'default': '#94A3B8',
};

type TabKey = 'resumo' | 'secoes' | 'bairros' | 'insights' | 'comparativo' | 'projecoes';

interface Summary {
    totalVotes: number;
    byPosition: { position: string; total: string }[];
    zonesCount: number;
    sectionsCount: number;
}

interface PartyData {
    party: string;
    partyName: string;
    totalVotes: number;
    candidatesCount: number;
    percentage: string;
}

interface Insights {
    topCandidate: any;
    runnerUp: any;
    voteDifference: number;
    percentageDifference: string;
    topSection: { zone: number; section: number; votes: number } | null;
    lowSection: { zone: number; section: number; votes: number } | null;
    leadersByZone: { zone: number; leader: any }[];
    concentrationRate: string;
    totalCandidates: number;
    totalSections: number;
}

interface SectionDetail {
    zone: number;
    section: number;
    topCandidateName: string;
    topCandidateNumber: string;
    topCandidateParty: string;
    topCandidateVotes: number;
    totalVotes: number;
}

interface Candidate {
    rank: number;
    number: string;
    name: string;
    party: string;
    position: string;
    totalVotes: number;
}

export default function ElectionAnalysisScreen() {
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabKey>('resumo');
    const [summary, setSummary] = useState<Summary | null>(null);
    const [partyData, setPartyData] = useState<PartyData[]>([]);
    const [insights, setInsights] = useState<Insights | null>(null);
    const [sectionDetails, setSectionDetails] = useState<SectionDetail[]>([]);
    const [topCandidates, setTopCandidates] = useState<Candidate[]>([]);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [positions, setPositions] = useState<string[]>([]);
    const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
    const [showPositionFilter, setShowPositionFilter] = useState(false);
    const [selectedZone, setSelectedZone] = useState<number | null>(null);
    const [zones, setZones] = useState<number[]>([]);

    // Comparativo
    const [candidate1, setCandidate1] = useState<Candidate | null>(null);
    const [candidate2, setCandidate2] = useState<Candidate | null>(null);
    const [comparison, setComparison] = useState<any>(null);
    const [showCandidateSelect, setShowCandidateSelect] = useState<1 | 2 | null>(null);

    // Bairros
    const [neighborhoodData, setNeighborhoodData] = useState<any[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<string[]>([]);
    const [selectedNeighborhood, setSelectedNeighborhood] = useState<string | null>(null);
    const [neighborhoodDetails, setNeighborhoodDetails] = useState<any>(null);

    // Análise por Vereador (Candidato) - Insights Tab
    const [selectedVereador, setSelectedVereador] = useState<Candidate | null>(null);
    const [showVereadorSelect, setShowVereadorSelect] = useState(false);
    const [vereadorInsights, setVereadorInsights] = useState<any>(null);
    const [loadingVereadorInsights, setLoadingVereadorInsights] = useState(false);

    // Análise por Candidato - Seções Tab
    const [selectedSectionCandidate, setSelectedSectionCandidate] = useState<Candidate | null>(null);
    const [showSectionCandidateSelect, setShowSectionCandidateSelect] = useState(false);
    const [sectionCandidateData, setSectionCandidateData] = useState<any[]>([]);
    const [loadingSectionCandidate, setLoadingSectionCandidate] = useState(false);

    // Análise Completa Adelmo Soares
    const [adelmoInsights, setAdelmoInsights] = useState<any>(null);

    // Dados por cidade (Deputado Estadual)
    const [cityData, setCityData] = useState<any[]>([]);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [cityDetails, setCityDetails] = useState<any>(null);

    // Seletor de deputado na aba Cidades
    const [selectedCityDeputado, setSelectedCityDeputado] = useState<any>(null);
    const [deputadoCityVotes, setDeputadoCityVotes] = useState<any[]>([]);
    const [showDeputadoCityModal, setShowDeputadoCityModal] = useState(false);

    // Projeções Políticas
    const [projectionCandidate, setProjectionCandidate] = useState<string | null>(null);
    const [projectionAdjustments, setProjectionAdjustments] = useState<Record<string, number>>({});
    const [activeScenario, setActiveScenario] = useState<string | null>(null);
    const [projectionResult, setProjectionResult] = useState<ProjectionResult | null>(null);
    const [showProjectionCandidateModal, setShowProjectionCandidateModal] = useState(false);

    // IA Analysis & Chat
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [chatCandidate, setChatCandidate] = useState<CandidateContext | null>(null);

    useEffect(() => {
        fetchData();
    }, [selectedPosition]);

    useEffect(() => {
        // Auto-carregar insights de Adelmo e dados por cidade quando Deputado Estadual é selecionado
        if (isDeputadoPosition(selectedPosition)) {
            setAdelmoInsights(getAdelmoSoaresCompleteInsights());
            setCityData(getMockDeputadoCityData());
        } else {
            setAdelmoInsights(null);
            setCityData([]);
            setSelectedCity(null);
            setCityDetails(null);
        }
    }, [selectedPosition]);

    useEffect(() => {
        if (activeTab === 'secoes') {
            fetchSectionDetails();
        }
    }, [activeTab, selectedZone, selectedPosition]);

    useEffect(() => {
        if (candidate1 && candidate2) {
            fetchComparison();
        }
    }, [candidate1, candidate2]);

    useEffect(() => {
        if (activeTab === 'bairros') {
            fetchNeighborhoodData();
        }
    }, [activeTab, selectedPosition]);

    useEffect(() => {
        if (selectedNeighborhood) {
            fetchNeighborhoodDetails();
        }
    }, [selectedNeighborhood, selectedPosition]);

    useEffect(() => {
        if (selectedVereador && activeTab === 'insights') {
            fetchVereadorInsights();
        }
    }, [selectedVereador, selectedPosition]);

    useEffect(() => {
        if (selectedSectionCandidate && activeTab === 'secoes') {
            fetchSectionCandidateData();
        }
    }, [selectedSectionCandidate, selectedZone]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Se a posição selecionada é Deputado Estadual, usar dados mock locais
            if (isDeputadoPosition(selectedPosition)) {
                setSummary(getMockDeputadoSummary());
                setPartyData(getMockDeputadoPartyData());
                setInsights(getMockDeputadoInsights());
                setTopCandidates(getMockDeputadoTopCandidates(10));
                setZones(getMockDeputadoZones());
                setCandidates(getMockDeputadoRanking(100));
                // Buscar posições do backend + adicionar Deputado Estadual
                try {
                    const positionsRes = await api.get('/election-results/positions');
                    const apiPositions = positionsRes.data || [];
                    if (!apiPositions.includes('Deputado Estadual')) {
                        setPositions([...apiPositions, 'Deputado Estadual']);
                    } else {
                        setPositions(apiPositions);
                    }
                } catch {
                    setPositions(['Deputado Estadual']);
                }
                return;
            }

            const positionParam = selectedPosition ? `?position=${selectedPosition}` : '';

            const [summaryRes, partyRes, insightsRes, topRes, positionsRes, zonesRes, candidatesRes] = await Promise.all([
                api.get('/election-results/summary'),
                api.get(`/election-results/by-party${positionParam}`),
                api.get(`/election-results/insights${positionParam}`),
                api.get(`/election-results/top-candidates?limit=10${selectedPosition ? `&position=${selectedPosition}` : ''}`),
                api.get('/election-results/positions'),
                api.get('/election-results/zones'),
                api.get(`/election-results/ranking?limit=100${selectedPosition ? `&position=${selectedPosition}` : ''}`),
            ]);

            setSummary(summaryRes.data);
            setPartyData(partyRes.data);
            setInsights(insightsRes.data);
            setTopCandidates(topRes.data);
            // Adicionar Deputado Estadual à lista de posições do backend
            const apiPositions = positionsRes.data || [];
            if (!apiPositions.includes('Deputado Estadual')) {
                setPositions([...apiPositions, 'Deputado Estadual']);
            } else {
                setPositions(apiPositions);
            }
            setZones(zonesRes.data);
            setCandidates(candidatesRes.data);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSectionDetails = async () => {
        try {
            // Se Deputado Estadual, usar dados mock
            if (isDeputadoPosition(selectedPosition)) {
                const mockSections = getMockDeputadoBySection(selectedZone || undefined);
                const allCandidates = getMockDeputadoCandidates();
                // Simular section details (top candidato por seção)
                const details = mockSections.map(s => {
                    const topCand = allCandidates[Math.floor(Math.random() * 3)]; // Top 3 alternando
                    return {
                        zone: s.zone,
                        section: s.section,
                        topCandidateName: topCand.name,
                        topCandidateNumber: topCand.number,
                        topCandidateParty: topCand.party,
                        topCandidateVotes: Math.floor(s.totalVotes * 0.3),
                        totalVotes: s.totalVotes,
                    };
                });
                setSectionDetails(details);
                return;
            }

            let url = '/election-results/section-details';
            const params = [];
            if (selectedZone) params.push(`zone=${selectedZone}`);
            if (selectedPosition) params.push(`position=${selectedPosition}`);
            if (params.length > 0) url += '?' + params.join('&');

            const res = await api.get(url);
            setSectionDetails(res.data);
        } catch (error) {
            console.error("Erro ao carregar seções:", error);
        }
    };

    const fetchComparison = async () => {
        if (!candidate1 || !candidate2) return;
        try {
            const res = await api.get(`/election-results/comparison?candidate1=${candidate1.number}&candidate2=${candidate2.number}`);
            setComparison(res.data);
        } catch (error) {
            console.error("Erro ao carregar comparação:", error);
        }
    };

    // ==================== BAIRROS FUNCTIONS ====================
    const fetchNeighborhoodData = async () => {
        try {
            const positionParam = selectedPosition ? `?position=${selectedPosition}` : '';
            const [dataRes, neighborhoodsRes] = await Promise.all([
                api.get(`/election-results/by-neighborhood${positionParam}`),
                api.get('/election-results/neighborhoods'),
            ]);
            setNeighborhoodData(dataRes.data);
            setNeighborhoods(neighborhoodsRes.data);
        } catch (error) {
            console.error("Erro ao carregar dados por bairro:", error);
        }
    };

    const fetchNeighborhoodDetails = async () => {
        if (!selectedNeighborhood) return;
        try {
            const positionParam = selectedPosition ? `&position=${selectedPosition}` : '';
            const res = await api.get(`/election-results/neighborhood-details?neighborhood=${encodeURIComponent(selectedNeighborhood)}${positionParam}`);
            setNeighborhoodDetails(res.data);
        } catch (error) {
            console.error("Erro ao carregar detalhes do bairro:", error);
        }
    };

    const fetchVereadorInsights = async () => {
        if (!selectedVereador) return;
        try {
            setLoadingVereadorInsights(true);

            let byZone: any[];
            let bySections: any[];

            // Se Deputado Estadual, usar dados mock
            if (isDeputadoPosition(selectedPosition)) {
                byZone = getMockCandidateByZone(selectedVereador.number).map((z: any) => ({
                    ...z,
                    votes: parseInt(z.votes) || 0,
                }));
                bySections = getMockCandidateBySection(selectedVereador.number).map((s: any) => ({
                    ...s,
                    votes: parseInt(s.votes) || 0,
                }));
            } else {
                // Usar endpoints existentes
                const [zoneRes, sectionRes] = await Promise.all([
                    api.get(`/election-results/candidate-by-zone?candidateNumber=${selectedVereador.number}`),
                    api.get(`/election-results/candidate-by-section?candidateNumber=${selectedVereador.number}`),
                ]);

                byZone = (zoneRes.data || []).map((z: any) => ({
                    ...z,
                    votes: parseInt(z.votes) || 0,
                }));
                bySections = (sectionRes.data || []).map((s: any) => ({
                    ...s,
                    votes: parseInt(s.votes) || 0,
                }));
            }

            // Calcular estatísticas
            const totalVotes = byZone.reduce((sum: number, z: any) => sum + z.votes, 0);
            const zonesCount = byZone.length;
            const maxZoneVotes = byZone.length > 0 ? Math.max(...byZone.map((z: any) => z.votes)) : 1;

            // Encontrar rank do candidato na lista geral
            const candidateInList = candidates.find(c => c.number === selectedVereador.number);
            const rank = candidateInList ? candidates.indexOf(candidateInList) + 1 : '-';

            // Calcular porcentagem
            const totalElectionVotes = candidates.reduce((sum, c) => sum + (typeof c.totalVotes === 'string' ? parseInt(c.totalVotes) : c.totalVotes), 0);
            const percentage = totalElectionVotes > 0 ? ((totalVotes / totalElectionVotes) * 100).toFixed(2) : '0';

            // Ordenar seções por votos (top sections)
            const topSections = [...bySections]
                .sort((a: any, b: any) => b.votes - a.votes)
                .slice(0, 10);

            setVereadorInsights({
                totalVotes,
                rank,
                percentage,
                zonesCount,
                maxZoneVotes,
                byZone: byZone.sort((a: any, b: any) => b.votes - a.votes),
                topSections,
            });
        } catch (error) {
            console.error("Erro ao carregar insights do vereador:", error);
            const candidateData = candidates.find(c => c.number === selectedVereador.number);
            if (candidateData) {
                const candidateVotes = typeof candidateData.totalVotes === 'string' ? parseInt(candidateData.totalVotes) : candidateData.totalVotes;
                const rank = candidates.indexOf(candidateData) + 1;
                const totalElectionVotes = candidates.reduce((sum, c) => sum + (typeof c.totalVotes === 'string' ? parseInt(c.totalVotes) : c.totalVotes), 0);
                const percentage = totalElectionVotes > 0 ? ((candidateVotes / totalElectionVotes) * 100).toFixed(2) : '0';
                setVereadorInsights({
                    totalVotes: candidateVotes,
                    rank,
                    percentage,
                    zonesCount: 0,
                    maxZoneVotes: 1,
                    byZone: [],
                    topSections: [],
                });
            }
        } finally {
            setLoadingVereadorInsights(false);
        }
    };

    // Buscar dados de um candidato por seção (para aba Seções)
    const fetchSectionCandidateData = async () => {
        if (!selectedSectionCandidate) return;
        try {
            setLoadingSectionCandidate(true);

            let data: any[];

            // Se Deputado Estadual, usar dados mock
            if (isDeputadoPosition(selectedPosition)) {
                data = getMockCandidateBySection(selectedSectionCandidate.number, selectedZone || undefined).map((s: any) => ({
                    ...s,
                    votes: parseInt(s.votes) || 0,
                }));
            } else {
                const zoneParam = selectedZone ? `&zone=${selectedZone}` : '';
                const res = await api.get(`/election-results/candidate-by-section?candidateNumber=${selectedSectionCandidate.number}${zoneParam}`);
                data = (res.data || []).map((s: any) => ({
                    ...s,
                    votes: parseInt(s.votes) || 0,
                }));
            }

            setSectionCandidateData(data.sort((a: any, b: any) => b.votes - a.votes));
        } catch (error) {
            console.error("Erro ao carregar dados do candidato por seção:", error);
            setSectionCandidateData([]);
        } finally {
            setLoadingSectionCandidate(false);
        }
    };

    const formatNumber = (num: number) => new Intl.NumberFormat("pt-BR").format(num);
    const getPartyColor = (party: string) => PARTY_COLORS[party] || PARTY_COLORS.default;

    // ==================== TAB NAVIGATION ====================
    const renderTabs = () => (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
            {[
                { key: 'resumo' as TabKey, label: 'Resumo', icon: BarChart3 },
                { key: 'bairros' as TabKey, label: isDeputadoPosition(selectedPosition) ? 'Cidades' : 'Bairros', icon: isDeputadoPosition(selectedPosition) ? Building2 : MapPin },
                { key: 'secoes' as TabKey, label: 'Seções', icon: LayoutGrid },
                { key: 'insights' as TabKey, label: 'Insights', icon: Lightbulb },
                { key: 'comparativo' as TabKey, label: 'Comparar', icon: GitCompare },
                ...(isDeputadoPosition(selectedPosition) ? [{ key: 'projecoes' as TabKey, label: 'Projeções', icon: TrendingUp }] : []),
            ].map(tab => (
                <TouchableOpacity
                    key={tab.key}
                    style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                    onPress={() => setActiveTab(tab.key)}
                >
                    <tab.icon size={18} color={activeTab === tab.key ? '#fff' : Colors.light.textSecondary} />
                    <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    // ==================== KPI CARDS ====================
    const renderKPICard = (title: string, value: string | number, icon: React.ReactNode, color: string, subtitle?: string) => (
        <View style={[styles.kpiCard, { borderLeftColor: color }]}>
            <View style={styles.kpiHeader}>
                <View style={[styles.kpiIcon, { backgroundColor: `${color}15` }]}>{icon}</View>
            </View>
            <Text style={styles.kpiValue}>{typeof value === "number" ? formatNumber(value) : value}</Text>
            <Text style={styles.kpiTitle}>{title}</Text>
            {subtitle && <Text style={styles.kpiSubtitle}>{subtitle}</Text>}
        </View>
    );

    // ==================== PIE CHART (Party Distribution) ====================
    const renderPieChart = () => {
        if (partyData.length === 0) return null;
        const total = partyData.reduce((sum, p) => sum + p.totalVotes, 0);

        return (
            <View style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                    <PieChart color={Colors.light.primary} size={20} />
                    <Text style={styles.chartTitle}>Distribuição por Partido</Text>
                </View>
                <View style={styles.pieContainer}>
                    {partyData.slice(0, 8).map((party, index) => {
                        const percentage = (party.totalVotes / total) * 100;
                        return (
                            <View key={party.party} style={styles.pieRow}>
                                <View style={[styles.pieColor, { backgroundColor: getPartyColor(party.party) }]} />
                                <Text style={styles.pieParty} numberOfLines={1}>{party.party}</Text>
                                <View style={styles.pieBarWrapper}>
                                    <View style={[styles.pieBar, { width: `${percentage}%`, backgroundColor: getPartyColor(party.party) }]} />
                                </View>
                                <Text style={styles.piePercent}>{percentage.toFixed(1)}%</Text>
                                <Text style={styles.pieVotes}>{formatNumber(party.totalVotes)}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    // ==================== TOP 10 BAR CHART ====================
    const renderTopCandidatesChart = () => {
        if (topCandidates.length === 0) return null;
        const maxVotes = topCandidates[0]?.totalVotes || 1;
        const chartWidth = screenWidth - 100;

        return (
            <View style={styles.chartContainer}>
                <View style={styles.chartHeader}>
                    <Trophy color="#FFD700" size={20} />
                    <Text style={styles.chartTitle}>Top 10 Candidatos</Text>
                </View>
                <ScrollView style={styles.barsContainer} showsVerticalScrollIndicator={false}>
                    {topCandidates.map((candidate, index) => {
                        const barWidth = (candidate.totalVotes / maxVotes) * (chartWidth - 60);
                        const colors = ['#FFD700', '#C0C0C0', '#CD7F32'];
                        const barColor = colors[index] || Colors.light.primary;

                        return (
                            <View key={`${candidate.number}-${index}`} style={styles.topBarRow}>
                                <View style={[styles.topRankBadge, { backgroundColor: barColor }]}>
                                    <Text style={styles.topRankText}>{index + 1}</Text>
                                </View>
                                <View style={styles.topBarContent}>
                                    <Text style={styles.topBarName} numberOfLines={1}>{candidate.name}</Text>
                                    <View style={styles.topBarWrapper}>
                                        <View style={[styles.topBar, { width: barWidth, backgroundColor: barColor }]} />
                                        <Text style={styles.topBarValue}>{formatNumber(candidate.totalVotes)}</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
        );
    };

    // ==================== INSIGHTS PANEL ====================
    const renderInsightsPanel = () => {
        if (!insights) return null;

        return (
            <View style={styles.insightsContainer}>
                {/* ========== PAINEL ADELMO SOARES ========== */}
                {adelmoInsights && isDeputadoPosition(selectedPosition) && (
                    <View style={{ marginBottom: 24 }}>
                        {/* Hero Card */}
                        <View style={[styles.insightCard, { backgroundColor: '#FF6B00', borderLeftColor: '#FF6B00', padding: 20 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginRight: 14 }}>
                                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#FF6B00' }}>40000</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 20, fontWeight: '800', color: '#FFF' }}>ADELMO SOARES</Text>
                                    <Text style={{ fontSize: 14, color: '#FFE0C0', marginTop: 2 }}>PSB • Deputado Estadual</Text>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                                <View style={{ backgroundColor: '#FFFFFF30', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, minWidth: '30%' }}>
                                    <Text style={{ fontSize: 20, fontWeight: '800', color: '#FFF' }}>{formatNumber(adelmoInsights.performanceMetrics.totalVotes)}</Text>
                                    <Text style={{ fontSize: 11, color: '#FFE0C0' }}>Total de Votos</Text>
                                </View>
                                <View style={{ backgroundColor: '#FFFFFF30', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }}>
                                    <Text style={{ fontSize: 20, fontWeight: '800', color: '#FFF' }}>{adelmoInsights.rank}º</Text>
                                    <Text style={{ fontSize: 11, color: '#FFE0C0' }}>Posição Geral</Text>
                                </View>
                                <View style={{ backgroundColor: '#FFFFFF30', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 }}>
                                    <Text style={{ fontSize: 20, fontWeight: '800', color: '#FFF' }}>{adelmoInsights.performanceMetrics.percentage}%</Text>
                                    <Text style={{ fontSize: 11, color: '#FFE0C0' }}>do Total</Text>
                                </View>
                            </View>
                        </View>

                        {/* Métricas Detalhadas */}
                        <View style={{ marginTop: 16 }}>
                            <Text style={[styles.vereadorSectionTitle, { fontSize: 16, marginBottom: 10 }]}>📊 Métricas de Performance</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {[
                                    { label: 'Votos/Zona (média)', value: formatNumber(adelmoInsights.performanceMetrics.avgVotesPerZone), color: '#3B82F6' },
                                    { label: 'Votos/Seção (média)', value: formatNumber(adelmoInsights.performanceMetrics.avgVotesPerSection), color: '#10B981' },
                                    { label: 'Índice Concentração', value: `${adelmoInsights.performanceMetrics.voteConcentrationIndex}%`, color: '#8B5CF6' },
                                    { label: 'Ranking no PSB', value: `${adelmoInsights.performanceMetrics.partyRankWithinPSB}º de 2`, color: '#FF6B00' },
                                    { label: 'PSB Total', value: formatNumber(adelmoInsights.performanceMetrics.PSBTotalVotes), color: '#FF6B00' },
                                    { label: 'Gap p/ subir', value: `+${formatNumber(adelmoInsights.performanceMetrics.votesNeededForNextRank)}`, color: '#EF4444' },
                                ].map((m, i) => (
                                    <View key={i} style={{ backgroundColor: '#FFF', borderRadius: 10, padding: 12, borderLeftWidth: 3, borderLeftColor: m.color, minWidth: '48%', flex: 1, ...Platform.select({ web: { boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }, default: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 } }) }}>
                                        <Text style={{ fontSize: 18, fontWeight: '700', color: m.color }}>{m.value}</Text>
                                        <Text style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{m.label}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Distribuição Geográfica */}
                        <View style={{ marginTop: 20 }}>
                            <Text style={[styles.vereadorSectionTitle, { fontSize: 16, marginBottom: 10 }]}>🗺️ Distribuição Geográfica por Zona</Text>
                            {adelmoInsights.zoneDistribution.map((zone: any) => (
                                <View key={zone.zone} style={{ backgroundColor: '#FFF', borderRadius: 10, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', ...Platform.select({ web: { boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }, default: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 } }) }}>
                                    <View style={{ width: 50, alignItems: 'center' }}>
                                        <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151' }}>Z{zone.zone}</Text>
                                        {zone.isStronghold && <Text style={{ fontSize: 9, color: '#10B981', fontWeight: '600' }}>FORTE</Text>}
                                    </View>
                                    <View style={{ flex: 1, marginHorizontal: 10 }}>
                                        <View style={{ height: 20, backgroundColor: '#F3F4F6', borderRadius: 10, overflow: 'hidden' }}>
                                            <View style={{ height: '100%', width: `${zone.percentage}%`, backgroundColor: zone.isStronghold ? '#FF6B00' : '#9CA3AF', borderRadius: 10 }} />
                                        </View>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', minWidth: 75 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937' }}>{formatNumber(zone.votes)}</Text>
                                        <Text style={{ fontSize: 11, color: '#6B7280' }}>{zone.percentage}%</Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Top e Piores Seções */}
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
                            <View style={{ flex: 1, backgroundColor: '#F0FDF4', borderRadius: 12, padding: 14 }}>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: '#166534', marginBottom: 8 }}>✅ Top Seções</Text>
                                {adelmoInsights.topSections.map((s: any, i: number) => (
                                    <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: i < adelmoInsights.topSections.length - 1 ? 1 : 0, borderBottomColor: '#D1FAE5' }}>
                                        <Text style={{ fontSize: 11, color: '#166534' }}>Z{s.zone}/S{s.section}</Text>
                                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#166534' }}>{s.votes}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={{ flex: 1, backgroundColor: '#FEF2F2', borderRadius: 12, padding: 14 }}>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: '#991B1B', marginBottom: 8 }}>⚠️ Seções Fracas</Text>
                                {adelmoInsights.weakSections.map((s: any, i: number) => (
                                    <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottomWidth: i < adelmoInsights.weakSections.length - 1 ? 1 : 0, borderBottomColor: '#FECACA' }}>
                                        <Text style={{ fontSize: 11, color: '#991B1B' }}>Z{s.zone}/S{s.section}</Text>
                                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#991B1B' }}>{s.votes}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Análise SWOT */}
                        <View style={{ marginTop: 20 }}>
                            <Text style={[styles.vereadorSectionTitle, { fontSize: 16, marginBottom: 10 }]}>📋 Análise SWOT</Text>
                            {[
                                { title: '💪 Forças', items: adelmoInsights.swot.strengths, bg: '#F0FDF4', border: '#10B981', text: '#166534' },
                                { title: '⚠️ Fraquezas', items: adelmoInsights.swot.weaknesses, bg: '#FEF2F2', border: '#EF4444', text: '#991B1B' },
                                { title: '🚀 Oportunidades', items: adelmoInsights.swot.opportunities, bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF' },
                                { title: '🔴 Ameaças', items: adelmoInsights.swot.threats, bg: '#FFF7ED', border: '#F59E0B', text: '#92400E' },
                            ].map((section, si) => (
                                <View key={si} style={{ backgroundColor: section.bg, borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4, borderLeftColor: section.border }}>
                                    <Text style={{ fontSize: 14, fontWeight: '700', color: section.text, marginBottom: 8 }}>{section.title}</Text>
                                    {section.items.map((item: string, ii: number) => (
                                        <View key={ii} style={{ flexDirection: 'row', marginBottom: 4, alignItems: 'flex-start' }}>
                                            <Text style={{ fontSize: 12, color: section.text, marginRight: 6 }}>•</Text>
                                            <Text style={{ fontSize: 12, color: section.text, flex: 1, lineHeight: 18 }}>{item}</Text>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>

                        {/* Comparação com Concorrentes Diretos */}
                        <View style={{ marginTop: 20 }}>
                            <Text style={[styles.vereadorSectionTitle, { fontSize: 16, marginBottom: 10 }]}>⚔️ Concorrentes Diretos</Text>
                            {adelmoInsights.competitorComparison.map((comp: any, i: number) => (
                                <View key={i} style={{
                                    backgroundColor: comp.status === 'VOCÊ' ? '#FF6B0015' : '#FFF',
                                    borderRadius: 12,
                                    padding: 14,
                                    marginBottom: 8,
                                    borderLeftWidth: 4,
                                    borderLeftColor: comp.status === 'VOCÊ' ? '#FF6B00' : comp.status === 'À FRENTE' ? '#EF4444' : '#10B981',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    ...Platform.select({ web: { boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }, default: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 } }),
                                }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 14, fontWeight: comp.status === 'VOCÊ' ? '800' : '600', color: '#1F2937' }}>{comp.name}</Text>
                                        <Text style={{ fontSize: 12, color: '#6B7280' }}>{comp.party}</Text>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937' }}>{formatNumber(comp.votes)}</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                            <Text style={{
                                                fontSize: 11,
                                                fontWeight: '600',
                                                color: comp.status === 'VOCÊ' ? '#FF6B00' : comp.status === 'À FRENTE' ? '#EF4444' : '#10B981',
                                                backgroundColor: comp.status === 'VOCÊ' ? '#FF6B0020' : comp.status === 'À FRENTE' ? '#FEE2E2' : '#D1FAE5',
                                                paddingHorizontal: 8,
                                                paddingVertical: 2,
                                                borderRadius: 8,
                                            }}>{comp.status}{comp.difference !== 0 ? ` (${comp.difference > 0 ? '+' : ''}${formatNumber(comp.difference)})` : ''}</Text>
                                        </View>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Recomendações Estratégicas */}
                        <View style={{ marginTop: 20 }}>
                            <Text style={[styles.vereadorSectionTitle, { fontSize: 16, marginBottom: 10 }]}>🎯 Recomendações Estratégicas</Text>
                            {adelmoInsights.recommendations.map((rec: any, i: number) => (
                                <View key={i} style={{
                                    backgroundColor: '#FFF',
                                    borderRadius: 12,
                                    padding: 16,
                                    marginBottom: 10,
                                    borderLeftWidth: 4,
                                    borderLeftColor: rec.color,
                                    ...Platform.select({ web: { boxShadow: '0 2px 4px rgba(0,0,0,0.06)' }, default: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 } }),
                                }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                        <Text style={{
                                            fontSize: 10,
                                            fontWeight: '700',
                                            color: '#FFF',
                                            backgroundColor: rec.color,
                                            paddingHorizontal: 8,
                                            paddingVertical: 2,
                                            borderRadius: 6,
                                            marginRight: 8,
                                        }}>{rec.priority}</Text>
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937', flex: 1 }}>{rec.title}</Text>
                                    </View>
                                    <Text style={{ fontSize: 13, color: '#4B5563', lineHeight: 20 }}>{rec.description}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Separador */}
                        <View style={[styles.insightsDivider, { marginTop: 24 }]} />
                    </View>
                )}
                <View style={styles.vereadorSelectorContainer}>
                    <Text style={styles.selectorTitle}>Análise por Candidato</Text>
                    <TouchableOpacity
                        style={[styles.vereadorSelectBox, selectedVereador && styles.vereadorSelectActive]}
                        onPress={() => setShowVereadorSelect(true)}
                    >
                        {selectedVereador ? (
                            <View style={styles.selectedVereadorContent}>
                                <View style={[styles.vereadorNumber, { backgroundColor: getPartyColor(selectedVereador.party) }]}>
                                    <Text style={styles.vereadorNumberText}>{selectedVereador.number}</Text>
                                </View>
                                <View style={styles.vereadorInfo}>
                                    <Text style={styles.vereadorName} numberOfLines={1}>{selectedVereador.name}</Text>
                                    <Text style={styles.vereadorParty}>{selectedVereador.party}</Text>
                                </View>
                                <TouchableOpacity onPress={() => { setSelectedVereador(null); setVereadorInsights(null); }} style={styles.clearButton}>
                                    <X color="#EF4444" size={18} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.vereadorPlaceholderContent}>
                                <UserCheck color={Colors.light.primary} size={20} />
                                <Text style={styles.vereadorPlaceholder}>Selecionar Candidato para Análise</Text>
                                <ChevronDown color={Colors.light.textSecondary} size={18} />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Análise do Candidato Selecionado */}
                {selectedVereador && (
                    <View style={styles.vereadorAnalysis}>
                        {loadingVereadorInsights ? (
                            <View style={styles.loadingVereador}>
                                <ActivityIndicator size="small" color={Colors.light.primary} />
                                <Text style={styles.loadingVereadorText}>Carregando análise...</Text>
                            </View>
                        ) : vereadorInsights ? (
                            <>
                                <View style={styles.vereadorStatsGrid}>
                                    <View style={[styles.vereadorStatCard, { borderLeftColor: '#10B981' }]}>
                                        <Text style={styles.vereadorStatValue}>{formatNumber(vereadorInsights.totalVotes || 0)}</Text>
                                        <Text style={styles.vereadorStatLabel}>Total de Votos</Text>
                                    </View>
                                    <View style={[styles.vereadorStatCard, { borderLeftColor: '#3B82F6' }]}>
                                        <Text style={styles.vereadorStatValue}>{vereadorInsights.rank || '-'}º</Text>
                                        <Text style={styles.vereadorStatLabel}>Posição Geral</Text>
                                    </View>
                                    <View style={[styles.vereadorStatCard, { borderLeftColor: '#F59E0B' }]}>
                                        <Text style={styles.vereadorStatValue}>{vereadorInsights.percentage || '0'}%</Text>
                                        <Text style={styles.vereadorStatLabel}>% dos Votos</Text>
                                    </View>
                                    <View style={[styles.vereadorStatCard, { borderLeftColor: '#8B5CF6' }]}>
                                        <Text style={styles.vereadorStatValue}>{vereadorInsights.zonesCount || 0}</Text>
                                        <Text style={styles.vereadorStatLabel}>Zonas c/ Votos</Text>
                                    </View>
                                </View>

                                {/* Votos por Zona */}
                                {vereadorInsights.byZone && vereadorInsights.byZone.length > 0 && (
                                    <View style={styles.vereadorZonesSection}>
                                        <Text style={styles.vereadorSectionTitle}>Distribuição por Zona</Text>
                                        {vereadorInsights.byZone.map((zone: any) => (
                                            <View key={zone.zone} style={styles.vereadorZoneRow}>
                                                <Text style={styles.vereadorZoneLabel}>Zona {zone.zone}</Text>
                                                <View style={styles.vereadorZoneBarContainer}>
                                                    <View
                                                        style={[
                                                            styles.vereadorZoneBar,
                                                            {
                                                                width: `${(zone.votes / (vereadorInsights.maxZoneVotes || zone.votes)) * 100}%`,
                                                                backgroundColor: getPartyColor(selectedVereador.party)
                                                            }
                                                        ]}
                                                    />
                                                </View>
                                                <Text style={styles.vereadorZoneVotes}>{formatNumber(zone.votes)}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Melhores e Piores Seções */}
                                {vereadorInsights.topSections && vereadorInsights.topSections.length > 0 && (
                                    <View style={styles.vereadorSectionsSection}>
                                        <Text style={styles.vereadorSectionTitle}>Melhores Seções</Text>
                                        {vereadorInsights.topSections.slice(0, 5).map((section: any, idx: number) => (
                                            <View key={`${section.zone}-${section.section}`} style={styles.vereadorSectionRow}>
                                                <View style={[styles.vereadorRankBadge, idx === 0 && { backgroundColor: '#FFD700' }]}>
                                                    <Text style={styles.vereadorRankText}>{idx + 1}</Text>
                                                </View>
                                                <Text style={styles.vereadorSectionLabel}>Zona {section.zone} - Seção {section.section}</Text>
                                                <Text style={styles.vereadorSectionVotes}>{formatNumber(section.votes)} votos</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </>
                        ) : (
                            <View style={styles.noVereadorData}>
                                <Text style={styles.noVereadorDataText}>Selecione um candidato para ver a análise detalhada</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Separador Visual */}
                <View style={styles.insightsDivider} />
                <Text style={styles.insightsGeneralTitle}>Visão Geral da Eleição</Text>

                {/* Líder da Eleição */}
                {insights.topCandidate && (
                    <View style={styles.insightCard}>
                        <View style={styles.insightIconContainer}>
                            <Trophy color="#FFD700" size={24} />
                        </View>
                        <View style={styles.insightContent}>
                            <Text style={styles.insightLabel}>Líder Geral</Text>
                            <Text style={styles.insightValue}>{insights.topCandidate.name}</Text>
                            <Text style={styles.insightSubtext}>
                                {formatNumber(insights.topCandidate.totalVotes)} votos • {insights.topCandidate.party}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Diferença para 2º */}
                {insights.runnerUp && (
                    <View style={styles.insightCard}>
                        <View style={[styles.insightIconContainer, { backgroundColor: '#10B98120' }]}>
                            <ArrowUpRight color="#10B981" size={24} />
                        </View>
                        <View style={styles.insightContent}>
                            <Text style={styles.insightLabel}>Vantagem sobre 2º</Text>
                            <Text style={[styles.insightValue, { color: '#10B981' }]}>
                                +{formatNumber(insights.voteDifference)} votos
                            </Text>
                            <Text style={styles.insightSubtext}>
                                {insights.percentageDifference}% à frente de {insights.runnerUp.name}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Taxa de Concentração */}
                <View style={styles.insightCard}>
                    <View style={[styles.insightIconContainer, { backgroundColor: '#6366F120' }]}>
                        <Zap color="#6366F1" size={24} />
                    </View>
                    <View style={styles.insightContent}>
                        <Text style={styles.insightLabel}>Concentração Top 3</Text>
                        <Text style={[styles.insightValue, { color: '#6366F1' }]}>{insights.concentrationRate}%</Text>
                        <Text style={styles.insightSubtext}>Dos votos entre os 3 primeiros</Text>
                    </View>
                </View>

                {/* Seção com mais votos */}
                {insights.topSection && (
                    <View style={styles.insightCard}>
                        <View style={[styles.insightIconContainer, { backgroundColor: '#F5980020' }]}>
                            <MapPin color="#F59800" size={24} />
                        </View>
                        <View style={styles.insightContent}>
                            <Text style={styles.insightLabel}>Seção com Mais Votos</Text>
                            <Text style={[styles.insightValue, { color: '#F59800' }]}>
                                Zona {insights.topSection.zone} - Seção {insights.topSection.section}
                            </Text>
                            <Text style={styles.insightSubtext}>{formatNumber(insights.topSection.votes)} votos</Text>
                        </View>
                    </View>
                )}

                {/* Líderes por Zona */}
                <View style={styles.insightCard}>
                    <View style={[styles.insightIconContainer, { backgroundColor: '#0EA5E920' }]}>
                        <Award color="#0EA5E9" size={24} />
                    </View>
                    <View style={styles.insightContent}>
                        <Text style={styles.insightLabel}>Líderes por Zona</Text>
                        {insights.leadersByZone.map(zl => (
                            <View key={zl.zone} style={styles.zoneLeaderRow}>
                                <Text style={styles.zoneLeaderZone}>Zona {zl.zone}:</Text>
                                <Text style={styles.zoneLeaderName} numberOfLines={1}>
                                    {zl.leader?.name || 'N/A'} ({zl.leader?.party || '-'})
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Modal de Seleção de Vereador */}
                <Modal visible={showVereadorSelect} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Selecionar Candidato</Text>
                                <TouchableOpacity onPress={() => setShowVereadorSelect(false)}>
                                    <Text style={styles.modalClose}>✕</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.modalSubtitle}>Escolha um candidato para análise detalhada</Text>
                            <ScrollView style={styles.modalList}>
                                {candidates.filter(c => !selectedPosition || c.position === selectedPosition).map((c, index) => (
                                    <TouchableOpacity
                                        key={`vereador-${c.number}-${index}`}
                                        style={[styles.modalItem, selectedVereador?.number === c.number && styles.modalItemSelected]}
                                        onPress={() => {
                                            setSelectedVereador(c);
                                            setShowVereadorSelect(false);
                                        }}
                                    >
                                        <View style={[styles.vereadorNumber, { backgroundColor: getPartyColor(c.party) }]}>
                                            <Text style={styles.vereadorNumberText}>{c.number}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.modalItemName}>{c.name}</Text>
                                            <Text style={styles.modalItemParty}>{c.party}</Text>
                                        </View>
                                        <Text style={styles.modalItemVotes}>{formatNumber(c.totalVotes)}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    };

    // ==================== NEIGHBORHOOD / CITY ANALYSIS ====================
    const renderNeighborhoodAnalysis = () => {
        // ===== MODO CIDADE (Deputado Estadual) =====
        if (isDeputadoPosition(selectedPosition)) {
            const maxCityVotes = cityData.length > 0 ? Math.max(...cityData.map(c => c.totalVotes)) : 1;

            const CITY_COLORS = [
                '#FF6B00', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6',
                '#EC4899', '#06B6D4', '#F59E0B', '#84CC16', '#F97316',
                '#6366F1', '#14B8A6', '#DC2626', '#7C3AED', '#0EA5E9',
            ];

            const allDeputados = getMockDeputadoCandidates();

            return (
                <View style={styles.sectionContainer}>
                    {/* ===== SELETOR DE DEPUTADO ===== */}
                    <View style={styles.chartCard}>
                        <View style={styles.chartHeader}>
                            <UserCheck color={Colors.light.primary} size={20} />
                            <Text style={styles.chartTitle}>Análise por Deputado</Text>
                        </View>
                        <Text style={styles.chartSubtitle}>
                            Selecione um deputado para ver sua distribuição de votos por cidade
                        </Text>

                        {/* Botão seletor de deputado */}
                        <TouchableOpacity
                            style={{
                                marginTop: 12,
                                padding: 14,
                                backgroundColor: selectedCityDeputado ? '#1E3A5F10' : '#F3F4F6',
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: selectedCityDeputado ? Colors.light.primary : '#E5E7EB',
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}
                            onPress={() => setShowDeputadoCityModal(true)}
                        >
                            {selectedCityDeputado ? (
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937' }}>
                                        {selectedCityDeputado.name}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                                        {selectedCityDeputado.party} • Nº {selectedCityDeputado.number} • {formatNumber(selectedCityDeputado.totalVotes)} votos
                                    </Text>
                                </View>
                            ) : (
                                <Text style={{ fontSize: 14, color: '#9CA3AF' }}>Selecionar deputado...</Text>
                            )}
                            <ChevronDown color={Colors.light.primary} size={20} />
                        </TouchableOpacity>

                        {/* Distribuição do deputado selecionado por cidade */}
                        {selectedCityDeputado && deputadoCityVotes.length > 0 && (
                            <View style={{ marginTop: 20 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                    <Building2 color="#8B5CF6" size={18} />
                                    <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937', marginLeft: 8 }}>
                                        Votos de {selectedCityDeputado.name.split(' ')[0]} por Cidade
                                    </Text>
                                </View>

                                {(() => {
                                    const maxDepVotes = Math.max(...deputadoCityVotes.map(d => d.votes));
                                    return deputadoCityVotes.map((cityVote, index) => {
                                        const barWidth = (cityVote.votes / maxDepVotes) * 100;
                                        const partyColor = getPartyColor(selectedCityDeputado.party);

                                        return (
                                            <View
                                                key={cityVote.city}
                                                style={{
                                                    paddingVertical: 10,
                                                    borderBottomWidth: index < deputadoCityVotes.length - 1 ? 1 : 0,
                                                    borderBottomColor: '#F3F4F6',
                                                }}
                                            >
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', flex: 1 }} numberOfLines={1}>
                                                        {index + 1}. {cityVote.city}
                                                    </Text>
                                                    {cityVote.isStronghold && (
                                                        <View style={{
                                                            backgroundColor: '#10B98115',
                                                            paddingHorizontal: 8,
                                                            paddingVertical: 2,
                                                            borderRadius: 10,
                                                            marginRight: 8,
                                                        }}>
                                                            <Text style={{ fontSize: 10, fontWeight: '700', color: '#10B981' }}>
                                                                🏆 FORTE
                                                            </Text>
                                                        </View>
                                                    )}
                                                    <Text style={{ fontSize: 13, fontWeight: '700', color: partyColor }}>
                                                        {formatNumber(cityVote.votes)}
                                                    </Text>
                                                </View>
                                                <View style={{
                                                    height: 8,
                                                    backgroundColor: '#F3F4F6',
                                                    borderRadius: 4,
                                                    overflow: 'hidden',
                                                }}>
                                                    <View style={{
                                                        height: '100%',
                                                        width: `${barWidth}%`,
                                                        backgroundColor: partyColor,
                                                        borderRadius: 4,
                                                    }} />
                                                </View>
                                                <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>
                                                    {cityVote.percentage}% dos votos do candidato
                                                </Text>
                                            </View>
                                        );
                                    });
                                })()}

                                {/* Resumo */}
                                <View style={{
                                    marginTop: 16,
                                    padding: 12,
                                    backgroundColor: '#1E3A5F08',
                                    borderRadius: 10,
                                    borderWidth: 1,
                                    borderColor: '#1E3A5F15',
                                }}>
                                    <Text style={{ fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 4 }}>
                                        📊 Resumo
                                    </Text>
                                    <Text style={{ fontSize: 12, color: '#6B7280' }}>
                                        Presente em {deputadoCityVotes.length} cidades •{' '}
                                        {deputadoCityVotes.filter(d => d.isStronghold).length} fortalezas •{' '}
                                        Melhor: {deputadoCityVotes[0]?.city} ({formatNumber(deputadoCityVotes[0]?.votes || 0)} votos)
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* ===== MODAL SELETOR DE DEPUTADO ===== */}
                    <Modal
                        visible={showDeputadoCityModal}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShowDeputadoCityModal(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Selecionar Deputado</Text>
                                    <TouchableOpacity onPress={() => setShowDeputadoCityModal(false)}>
                                        <X color="#6B7280" size={24} />
                                    </TouchableOpacity>
                                </View>
                                <ScrollView style={{ maxHeight: 400 }}>
                                    {allDeputados.map(dep => (
                                        <TouchableOpacity
                                            key={dep.number}
                                            style={[
                                                styles.modalItem,
                                                selectedCityDeputado?.number === dep.number && {
                                                    backgroundColor: Colors.light.primary + '15',
                                                    borderColor: Colors.light.primary,
                                                },
                                            ]}
                                            onPress={() => {
                                                setSelectedCityDeputado(dep);
                                                setDeputadoCityVotes(getMockDeputadoVotesByCity(dep.number));
                                                setShowDeputadoCityModal(false);
                                            }}
                                        >
                                            <View style={[
                                                styles.modalItemNumber,
                                                { backgroundColor: getPartyColor(dep.party) + '20' }
                                            ]}>
                                                <Text style={[
                                                    styles.modalItemNumberText,
                                                    { color: getPartyColor(dep.party) }
                                                ]}>
                                                    {dep.number}
                                                </Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.modalItemName}>{dep.name}</Text>
                                                <Text style={styles.modalItemParty}>{dep.party}</Text>
                                            </View>
                                            <Text style={styles.modalItemVotes}>{formatNumber(dep.totalVotes)}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>

                    {/* ===== DISTRIBUIÇÃO GERAL POR CIDADE ===== */}
                    <View style={styles.chartCard}>
                        <View style={styles.chartHeader}>
                            <Building2 color={Colors.light.primary} size={20} />
                            <Text style={styles.chartTitle}>Distribuição Geral por Cidade</Text>
                        </View>
                        <Text style={styles.chartSubtitle}>
                            {cityData.length} cidades • Toque em uma cidade para ver detalhes
                        </Text>

                        <View style={{ marginTop: 16 }}>
                            {cityData.map((city, index) => {
                                const barWidth = (city.totalVotes / maxCityVotes) * 100;
                                const color = CITY_COLORS[index % CITY_COLORS.length];
                                const isSelected = selectedCity === city.city;

                                return (
                                    <TouchableOpacity
                                        key={city.city}
                                        style={[
                                            styles.neighborhoodItem,
                                            isSelected && styles.neighborhoodItemSelected
                                        ]}
                                        onPress={() => {
                                            if (isSelected) {
                                                setSelectedCity(null);
                                                setCityDetails(null);
                                            } else {
                                                setSelectedCity(city.city);
                                                setCityDetails(getMockDeputadoCityDetails(city.city));
                                            }
                                        }}
                                    >
                                        <View style={styles.neighborhoodHeader}>
                                            <View style={[styles.neighborhoodRank, { backgroundColor: color + '20', borderColor: color }]}>
                                                <Text style={[styles.neighborhoodRankText, { color }]}>{index + 1}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.neighborhoodName} numberOfLines={1}>
                                                    {city.city}
                                                </Text>
                                                <Text style={{ fontSize: 11, color: '#9CA3AF' }}>
                                                    {city.zonesCount} zonas • {city.sectionsCount} seções
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.neighborhoodBarContainer}>
                                            <View style={[
                                                styles.neighborhoodBar,
                                                { width: `${barWidth}%`, backgroundColor: color }
                                            ]} />
                                        </View>
                                        <View style={styles.neighborhoodStats}>
                                            <Text style={styles.neighborhoodVotes}>
                                                {formatNumber(city.totalVotes)} votos
                                            </Text>
                                            <Text style={styles.neighborhoodPercent}>
                                                {city.percentage}%
                                            </Text>
                                        </View>
                                        {/* Líder da cidade */}
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, paddingLeft: 36 }}>
                                            <Trophy color="#F59E0B" size={12} />
                                            <Text style={{ fontSize: 11, color: '#6B7280', marginLeft: 4 }} numberOfLines={1}>
                                                Líder: {city.topCandidate.name} ({city.topCandidate.party}) — {formatNumber(city.topCandidate.votes)}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Detalhes da cidade selecionada */}
                    {selectedCity && cityDetails && (
                        <View style={[styles.chartCard, { marginTop: 16 }]}>
                            <View style={styles.chartHeader}>
                                <Building2 color={Colors.light.primary} size={20} />
                                <Text style={styles.chartTitle}>{selectedCity}</Text>
                            </View>

                            <View style={styles.neighborhoodDetailsStats}>
                                <View style={styles.detailStatBox}>
                                    <Text style={styles.detailStatValue}>
                                        {formatNumber(cityDetails.totalVotes)}
                                    </Text>
                                    <Text style={styles.detailStatLabel}>Votos Totais</Text>
                                </View>
                                <View style={styles.detailStatBox}>
                                    <Text style={styles.detailStatValue}>
                                        {cityDetails.zonesCount}
                                    </Text>
                                    <Text style={styles.detailStatLabel}>Zonas</Text>
                                </View>
                                <View style={styles.detailStatBox}>
                                    <Text style={styles.detailStatValue}>
                                        {cityDetails.sectionsCount}
                                    </Text>
                                    <Text style={styles.detailStatLabel}>Seções</Text>
                                </View>
                            </View>

                            {/* Top candidatos na cidade */}
                            {cityDetails.ranking && cityDetails.ranking.length > 0 && (
                                <View style={{ marginTop: 16 }}>
                                    <Text style={styles.subsectionTitle}>Top Candidatos em {selectedCity}</Text>
                                    {cityDetails.ranking.map((cand: any, idx: number) => (
                                        <View key={cand.number} style={styles.candidateRow}>
                                            <View style={[
                                                styles.candidateMedal,
                                                idx === 0 && { backgroundColor: '#FFD700' },
                                                idx === 1 && { backgroundColor: '#C0C0C0' },
                                                idx === 2 && { backgroundColor: '#CD7F32' },
                                            ]}>
                                                <Text style={styles.candidateMedalText}>{idx + 1}</Text>
                                            </View>
                                            <View style={styles.candidateInfo}>
                                                <Text style={styles.candidateName} numberOfLines={1}>
                                                    {cand.name}
                                                </Text>
                                                <Text style={styles.candidateParty}>
                                                    {cand.party} • {cand.number}
                                                </Text>
                                            </View>
                                            <Text style={styles.candidateVotes}>
                                                {formatNumber(cand.totalVotes)}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}
                        </View>
                    )}
                </View>
            );
        }

        // ===== MODO BAIRRO (Prefeito/Vereador) =====
        const maxVotes = neighborhoodData.length > 0 ? Math.max(...neighborhoodData.map(n => n.totalVotes)) : 1;

        const NEIGHBORHOOD_COLORS = [
            '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
            '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
        ];

        return (
            <View style={styles.sectionContainer}>
                {/* Título */}
                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <MapPin color={Colors.light.primary} size={20} />
                        <Text style={styles.chartTitle}>Distribuição por Bairro</Text>
                    </View>
                    <Text style={styles.chartSubtitle}>
                        {neighborhoods.length} bairros • Toque em um bairro para ver detalhes
                    </Text>

                    {/* Lista de bairros com barras */}
                    <View style={{ marginTop: 16 }}>
                        {neighborhoodData.slice(0, 15).map((item, index) => {
                            const barWidth = (item.totalVotes / maxVotes) * 100;
                            const color = NEIGHBORHOOD_COLORS[index % NEIGHBORHOOD_COLORS.length];
                            const isSelected = selectedNeighborhood === item.neighborhood;

                            return (
                                <TouchableOpacity
                                    key={item.neighborhood}
                                    style={[
                                        styles.neighborhoodItem,
                                        isSelected && styles.neighborhoodItemSelected
                                    ]}
                                    onPress={() => setSelectedNeighborhood(
                                        isSelected ? null : item.neighborhood
                                    )}
                                >
                                    <View style={styles.neighborhoodHeader}>
                                        <View style={styles.neighborhoodRank}>
                                            <Text style={styles.neighborhoodRankText}>{index + 1}</Text>
                                        </View>
                                        <Text style={styles.neighborhoodName} numberOfLines={1}>
                                            {item.neighborhood}
                                        </Text>
                                        <Text style={styles.neighborhoodSections}>
                                            {item.sectionsCount} seções
                                        </Text>
                                    </View>
                                    <View style={styles.neighborhoodBarContainer}>
                                        <View style={[
                                            styles.neighborhoodBar,
                                            { width: `${barWidth}%`, backgroundColor: color }
                                        ]} />
                                    </View>
                                    <View style={styles.neighborhoodStats}>
                                        <Text style={styles.neighborhoodVotes}>
                                            {formatNumber(item.totalVotes)} votos
                                        </Text>
                                        <Text style={styles.neighborhoodPercent}>
                                            {item.percentage}%
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Detalhes do bairro selecionado */}
                {selectedNeighborhood && neighborhoodDetails && (
                    <View style={[styles.chartCard, { marginTop: 16 }]}>
                        <View style={styles.chartHeader}>
                            <Users color={Colors.light.primary} size={20} />
                            <Text style={styles.chartTitle}>{selectedNeighborhood}</Text>
                        </View>

                        {/* Stats do bairro */}
                        <View style={styles.neighborhoodDetailsStats}>
                            <View style={styles.detailStatBox}>
                                <Text style={styles.detailStatValue}>
                                    {formatNumber(neighborhoodDetails.totalVotes)}
                                </Text>
                                <Text style={styles.detailStatLabel}>Votos Totais</Text>
                            </View>
                            <View style={styles.detailStatBox}>
                                <Text style={styles.detailStatValue}>
                                    {neighborhoodDetails.sectionsCount}
                                </Text>
                                <Text style={styles.detailStatLabel}>Seções</Text>
                            </View>
                        </View>

                        {/* Top candidatos do bairro */}
                        {neighborhoodDetails.ranking && neighborhoodDetails.ranking.length > 0 && (
                            <View style={{ marginTop: 16 }}>
                                <Text style={styles.subsectionTitle}>Top Candidatos no Bairro</Text>
                                {neighborhoodDetails.ranking.map((cand: any, idx: number) => (
                                    <View key={cand.number} style={styles.candidateRow}>
                                        <View style={[
                                            styles.candidateMedal,
                                            idx === 0 && { backgroundColor: '#FFD700' },
                                            idx === 1 && { backgroundColor: '#C0C0C0' },
                                            idx === 2 && { backgroundColor: '#CD7F32' },
                                        ]}>
                                            <Text style={styles.candidateMedalText}>{idx + 1}</Text>
                                        </View>
                                        <View style={styles.candidateInfo}>
                                            <Text style={styles.candidateName} numberOfLines={1}>
                                                {cand.name}
                                            </Text>
                                            <Text style={styles.candidateParty}>
                                                {cand.party} • {cand.number}
                                            </Text>
                                        </View>
                                        <Text style={styles.candidateVotes}>
                                            {formatNumber(cand.totalVotes)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Locais de votação */}
                        {neighborhoodDetails.votingLocations && neighborhoodDetails.votingLocations.length > 0 && (
                            <View style={{ marginTop: 16 }}>
                                <Text style={styles.subsectionTitle}>Locais de Votação</Text>
                                {neighborhoodDetails.votingLocations.map((loc: string, idx: number) => (
                                    <View key={idx} style={styles.locationRow}>
                                        <MapPin color={Colors.light.textSecondary} size={14} />
                                        <Text style={styles.locationText}>{loc}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    // ==================== SECTION ANALYSIS ====================
    const renderSectionAnalysis = () => {
        // Calcular estatísticas do candidato selecionado - garantir conversão numérica
        const candidateStats = selectedSectionCandidate && sectionCandidateData.length > 0 ? (() => {
            const votes = sectionCandidateData.map(s => Number(s.votes) || 0);
            const total = votes.reduce((sum, v) => sum + v, 0);
            return {
                totalVotes: total,
                sectionsCount: sectionCandidateData.length,
                maxVotes: Math.max(...votes),
                avgVotes: total > 0 ? Math.round(total / sectionCandidateData.length) : 0,
            };
        })() : null;

        return (
            <View style={styles.sectionContainer}>
                {/* Seletor de Candidato */}
                <View style={styles.vereadorSelectorContainer}>
                    <Text style={styles.selectorTitle}>Análise por Candidato</Text>
                    <TouchableOpacity
                        style={[styles.vereadorSelectBox, selectedSectionCandidate && styles.vereadorSelectActive]}
                        onPress={() => setShowSectionCandidateSelect(true)}
                    >
                        {selectedSectionCandidate ? (
                            <View style={styles.selectedVereadorContent}>
                                <View style={[styles.vereadorNumber, { backgroundColor: getPartyColor(selectedSectionCandidate.party) }]}>
                                    <Text style={styles.vereadorNumberText}>{selectedSectionCandidate.number}</Text>
                                </View>
                                <View style={styles.vereadorInfo}>
                                    <Text style={styles.vereadorName} numberOfLines={1}>{selectedSectionCandidate.name}</Text>
                                    <Text style={styles.vereadorParty}>{selectedSectionCandidate.party}</Text>
                                </View>
                                <TouchableOpacity onPress={() => { setSelectedSectionCandidate(null); setSectionCandidateData([]); }} style={styles.clearButton}>
                                    <X color="#EF4444" size={18} />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.vereadorPlaceholderContent}>
                                <UserCheck color={Colors.light.primary} size={20} />
                                <Text style={styles.vereadorPlaceholder}>Selecionar Candidato para Análise</Text>
                                <ChevronDown color={Colors.light.textSecondary} size={18} />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Zone Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.zoneFilter}>
                    <TouchableOpacity
                        style={[styles.zoneChip, !selectedZone && styles.zoneChipActive]}
                        onPress={() => setSelectedZone(null)}
                    >
                        <Text style={[styles.zoneChipText, !selectedZone && styles.zoneChipTextActive]}>Todas</Text>
                    </TouchableOpacity>
                    {zones.map(zone => (
                        <TouchableOpacity
                            key={zone}
                            style={[styles.zoneChip, selectedZone === zone && styles.zoneChipActive]}
                            onPress={() => setSelectedZone(zone)}
                        >
                            <Text style={[styles.zoneChipText, selectedZone === zone && styles.zoneChipTextActive]}>
                                Zona {zone}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Estatísticas do candidato selecionado */}
                {selectedSectionCandidate && (
                    <View style={styles.vereadorAnalysis}>
                        {loadingSectionCandidate ? (
                            <View style={styles.loadingVereador}>
                                <ActivityIndicator size="small" color={Colors.light.primary} />
                                <Text style={styles.loadingVereadorText}>Carregando dados...</Text>
                            </View>
                        ) : candidateStats ? (
                            <>
                                <View style={styles.vereadorStatsGrid}>
                                    <View style={[styles.vereadorStatCard, { borderLeftColor: Colors.light.primary }]}>
                                        <Text style={styles.vereadorStatValue}>{formatNumber(candidateStats.totalVotes)}</Text>
                                        <Text style={styles.vereadorStatLabel}>Total de Votos</Text>
                                    </View>
                                    <View style={[styles.vereadorStatCard, { borderLeftColor: '#6366F1' }]}>
                                        <Text style={styles.vereadorStatValue}>{candidateStats.sectionsCount}</Text>
                                        <Text style={styles.vereadorStatLabel}>Seções c/ Votos</Text>
                                    </View>
                                    <View style={[styles.vereadorStatCard, { borderLeftColor: '#10B981' }]}>
                                        <Text style={styles.vereadorStatValue}>{formatNumber(candidateStats.maxVotes)}</Text>
                                        <Text style={styles.vereadorStatLabel}>Máximo em Seção</Text>
                                    </View>
                                    <View style={[styles.vereadorStatCard, { borderLeftColor: '#F59E0B' }]}>
                                        <Text style={styles.vereadorStatValue}>{formatNumber(candidateStats.avgVotes)}</Text>
                                        <Text style={styles.vereadorStatLabel}>Média por Seção</Text>
                                    </View>
                                </View>

                                {/* Lista de seções do candidato */}
                                <Text style={styles.vereadorSectionTitle}>Votos por Seção</Text>
                                <View style={styles.sectionTable}>
                                    <View style={styles.sectionHeader}>
                                        <Text style={[styles.sectionHeaderCell, { width: 50 }]}>Zona</Text>
                                        <Text style={[styles.sectionHeaderCell, { width: 50 }]}>Seção</Text>
                                        <Text style={[styles.sectionHeaderCell, { flex: 1 }]}>Desempenho</Text>
                                        <Text style={[styles.sectionHeaderCell, { width: 60, textAlign: 'right' }]}>Votos</Text>
                                        <Text style={[styles.sectionHeaderCell, { width: 70, textAlign: 'right' }]}>%</Text>
                                    </View>
                                    <ScrollView style={styles.sectionScroll}>
                                        {sectionCandidateData.map((section, index) => {
                                            const sectionVotes = Number(section.votes) || 0;
                                            const percentage = candidateStats.totalVotes > 0
                                                ? ((sectionVotes / candidateStats.totalVotes) * 100).toFixed(1)
                                                : '0';
                                            const barWidth = candidateStats.maxVotes > 0
                                                ? (sectionVotes / candidateStats.maxVotes) * 100
                                                : 0;
                                            return (
                                                <View key={`${section.zone}-${section.section}`} style={[styles.sectionRow, index % 2 === 0 && styles.sectionRowAlt]}>
                                                    <Text style={[styles.sectionCell, { width: 50 }]}>{section.zone}</Text>
                                                    <Text style={[styles.sectionCell, { width: 50 }]}>{section.section}</Text>
                                                    <View style={{ flex: 1, height: 12, backgroundColor: Colors.light.backgroundSecondary, borderRadius: 4, marginRight: 8 }}>
                                                        <View style={{
                                                            width: `${barWidth}%`,
                                                            height: 12,
                                                            backgroundColor: getPartyColor(selectedSectionCandidate.party),
                                                            borderRadius: 4
                                                        }} />
                                                    </View>
                                                    <Text style={[styles.sectionCell, { width: 60, fontWeight: '600', textAlign: 'right' }]}>
                                                        {formatNumber(sectionVotes)}
                                                    </Text>
                                                    <Text style={[styles.sectionCell, { width: 70, color: Colors.light.primary, textAlign: 'right' }]}>
                                                        {percentage}%
                                                    </Text>
                                                </View>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            </>
                        ) : (
                            <View style={styles.noVereadorData}>
                                <Text style={styles.noVereadorDataText}>Nenhum dado disponível para este candidato</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Tabela padrão de seções (quando não há candidato selecionado) */}
                {!selectedSectionCandidate && (
                    <View style={styles.sectionTable}>
                        <View style={styles.sectionHeader}>
                            <Text style={[styles.sectionHeaderCell, { width: 60 }]}>Zona</Text>
                            <Text style={[styles.sectionHeaderCell, { width: 60 }]}>Seção</Text>
                            <Text style={[styles.sectionHeaderCell, { flex: 1 }]}>Líder</Text>
                            <Text style={[styles.sectionHeaderCell, { width: 70 }]}>Votos</Text>
                        </View>
                        <ScrollView style={styles.sectionScroll}>
                            {sectionDetails.map((section, index) => (
                                <View key={`${section.zone}-${section.section}`} style={[styles.sectionRow, index % 2 === 0 && styles.sectionRowAlt]}>
                                    <Text style={[styles.sectionCell, { width: 60 }]}>{section.zone}</Text>
                                    <Text style={[styles.sectionCell, { width: 60 }]}>{section.section}</Text>
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.sectionCellName} numberOfLines={1}>{section.topCandidateName}</Text>
                                        <Text style={styles.sectionCellParty}>{section.topCandidateParty}</Text>
                                    </View>
                                    <Text style={[styles.sectionCell, { width: 70, fontWeight: '600' }]}>
                                        {formatNumber(section.topCandidateVotes)}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Modal de seleção de candidato para seções */}
                <Modal visible={showSectionCandidateSelect} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Selecionar Candidato</Text>
                                <TouchableOpacity onPress={() => setShowSectionCandidateSelect(false)}>
                                    <Text style={styles.modalClose}>✕</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.modalSubtitle}>Escolha um candidato para análise por seção</Text>
                            <ScrollView style={styles.modalList}>
                                {candidates.map(candidate => (
                                    <TouchableOpacity
                                        key={candidate.number}
                                        style={[
                                            styles.modalItem,
                                            selectedSectionCandidate?.number === candidate.number && styles.modalItemSelected
                                        ]}
                                        onPress={() => {
                                            setSelectedSectionCandidate(candidate);
                                            setShowSectionCandidateSelect(false);
                                        }}
                                    >
                                        <View style={[styles.modalItemNumber, { backgroundColor: getPartyColor(candidate.party) }]}>
                                            <Text style={styles.modalItemNumberText}>{candidate.number}</Text>
                                        </View>
                                        <View style={styles.modalItemInfo}>
                                            <Text style={styles.modalItemName} numberOfLines={1}>{candidate.name}</Text>
                                            <Text style={styles.modalItemParty}>{candidate.party}</Text>
                                        </View>
                                        <Text style={styles.modalItemVotes}>
                                            {formatNumber(typeof candidate.totalVotes === 'string' ? parseInt(candidate.totalVotes) : candidate.totalVotes)} votos
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    };

    // ==================== COMPARISON ====================
    const renderComparison = () => {
        // ===== MODO DEPUTADO ESTADUAL =====
        if (isDeputadoPosition(selectedPosition)) {
            const allDeputados = getMockDeputadoCandidates();

            // Gerar comparação quando ambos candidatos estão selecionados
            const deputadoComparison = (candidate1 && candidate2)
                ? getMockDeputadoComparison(candidate1.number, candidate2.number)
                : null;

            return (
                <View style={styles.comparisonContainer}>
                    {/* Seleção de Candidatos */}
                    <View style={styles.comparisonSelect}>
                        <TouchableOpacity
                            style={[styles.candidateSelectBox, candidate1 && styles.candidateSelectActive]}
                            onPress={() => setShowCandidateSelect(1)}
                        >
                            {candidate1 ? (
                                <>
                                    <Text style={styles.candidateSelectNumber}>{candidate1.number}</Text>
                                    <Text style={styles.candidateSelectName} numberOfLines={1}>{candidate1.name}</Text>
                                    <Text style={styles.candidateSelectParty}>{candidate1.party}</Text>
                                </>
                            ) : (
                                <Text style={styles.candidateSelectPlaceholder}>Selecionar Deputado 1</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.vsContainer}>
                            <Text style={styles.vsText}>VS</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.candidateSelectBox, candidate2 && styles.candidateSelectActive]}
                            onPress={() => setShowCandidateSelect(2)}
                        >
                            {candidate2 ? (
                                <>
                                    <Text style={styles.candidateSelectNumber}>{candidate2.number}</Text>
                                    <Text style={styles.candidateSelectName} numberOfLines={1}>{candidate2.name}</Text>
                                    <Text style={styles.candidateSelectParty}>{candidate2.party}</Text>
                                </>
                            ) : (
                                <Text style={styles.candidateSelectPlaceholder}>Selecionar Deputado 2</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Resultados da comparação */}
                    {deputadoComparison && (
                        <View style={styles.comparisonResults}>
                            {/* Resumo geral */}
                            <View style={styles.comparisonSummary}>
                                <View style={[
                                    styles.comparisonSummaryCard,
                                    deputadoComparison.overallWinner === 1 && styles.comparisonWinner
                                ]}>
                                    <Text style={styles.comparisonSummaryVotes}>
                                        {formatNumber(deputadoComparison.candidate1.totalVotes)}
                                    </Text>
                                    <Text style={styles.comparisonSummaryLabel}>Votos Totais</Text>
                                    <Text style={styles.comparisonSummaryZones}>
                                        {deputadoComparison.candidate1.citiesWon} cidades vencidas
                                    </Text>
                                </View>
                                <View style={[
                                    styles.comparisonSummaryCard,
                                    deputadoComparison.overallWinner === 2 && styles.comparisonWinner
                                ]}>
                                    <Text style={styles.comparisonSummaryVotes}>
                                        {formatNumber(deputadoComparison.candidate2.totalVotes)}
                                    </Text>
                                    <Text style={styles.comparisonSummaryLabel}>Votos Totais</Text>
                                    <Text style={styles.comparisonSummaryZones}>
                                        {deputadoComparison.candidate2.citiesWon} cidades vencidas
                                    </Text>
                                </View>
                            </View>

                            {/* Diferença geral */}
                            <View style={{
                                padding: 12,
                                backgroundColor: '#1E3A5F08',
                                borderRadius: 10,
                                marginBottom: 16,
                                borderWidth: 1,
                                borderColor: '#1E3A5F15',
                            }}>
                                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', textAlign: 'center' }}>
                                    Diferen\u00e7a: {formatNumber(Math.abs(deputadoComparison.candidate1.totalVotes - deputadoComparison.candidate2.totalVotes))} votos
                                </Text>
                            </View>

                            {/* Comparativo por Cidade */}
                            <Text style={styles.comparisonTitle}>Comparativo por Cidade</Text>
                            {deputadoComparison.comparison.map((cityComp: any) => {
                                const total = cityComp.candidate1Votes + cityComp.candidate2Votes || 1;
                                const p1 = (cityComp.candidate1Votes / total) * 100;
                                const p2 = (cityComp.candidate2Votes / total) * 100;
                                const c1Color = getPartyColor(deputadoComparison.candidate1.party);
                                const c2Color = getPartyColor(deputadoComparison.candidate2.party);

                                return (
                                    <View key={cityComp.city} style={styles.comparisonBar}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <Text style={styles.comparisonZoneLabel}>{cityComp.city}</Text>
                                            {cityComp.winner !== 0 && (
                                                <Text style={{ fontSize: 10, fontWeight: '700', color: cityComp.winner === 1 ? c1Color : c2Color }}>
                                                    {'🏆'}
                                                </Text>
                                            )}
                                        </View>
                                        <View style={styles.comparisonBarContainer}>
                                            <View style={[styles.comparisonBarLeft, { width: `${p1}%`, backgroundColor: c1Color }]}>
                                                <Text style={styles.comparisonBarText}>{formatNumber(cityComp.candidate1Votes)}</Text>
                                            </View>
                                            <View style={[styles.comparisonBarRight, { width: `${p2}%`, backgroundColor: c2Color }]}>
                                                <Text style={styles.comparisonBarText}>{formatNumber(cityComp.candidate2Votes)}</Text>
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Modal seleção de candidato (deputados) */}
                    <Modal visible={showCandidateSelect !== null} transparent animationType="slide">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Selecionar Deputado {showCandidateSelect}</Text>
                                    <TouchableOpacity onPress={() => setShowCandidateSelect(null)}>
                                        <Text style={styles.modalClose}>\u2715</Text>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView style={styles.modalList}>
                                    {allDeputados.map((c, index) => (
                                        <TouchableOpacity
                                            key={`${c.number}-${index}`}
                                            style={styles.modalItem}
                                            onPress={() => {
                                                const asCandidate = { ...c, rank: index + 1, position: 'Deputado Estadual' };
                                                if (showCandidateSelect === 1) setCandidate1(asCandidate);
                                                else setCandidate2(asCandidate);
                                                setShowCandidateSelect(null);
                                            }}
                                        >
                                            <View style={[styles.modalItemNumber, { backgroundColor: getPartyColor(c.party) + '20' }]}>
                                                <Text style={[styles.modalItemNumberText, { color: getPartyColor(c.party) }]}>{c.number}</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.modalItemName}>{c.name}</Text>
                                                <Text style={styles.modalItemParty}>{c.party}</Text>
                                            </View>
                                            <Text style={styles.modalItemVotes}>{formatNumber(c.totalVotes)}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>
                </View>
            );
        }

        // ===== MODO PREFEITO / VEREADOR (original) =====
        return (
            <View style={styles.comparisonContainer}>
                {/* Candidate Selection */}
                <View style={styles.comparisonSelect}>
                    <TouchableOpacity
                        style={[styles.candidateSelectBox, candidate1 && styles.candidateSelectActive]}
                        onPress={() => setShowCandidateSelect(1)}
                    >
                        {candidate1 ? (
                            <>
                                <Text style={styles.candidateSelectNumber}>{candidate1.number}</Text>
                                <Text style={styles.candidateSelectName} numberOfLines={1}>{candidate1.name}</Text>
                                <Text style={styles.candidateSelectParty}>{candidate1.party}</Text>
                            </>
                        ) : (
                            <Text style={styles.candidateSelectPlaceholder}>Selecionar Candidato 1</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.vsContainer}>
                        <Text style={styles.vsText}>VS</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.candidateSelectBox, candidate2 && styles.candidateSelectActive]}
                        onPress={() => setShowCandidateSelect(2)}
                    >
                        {candidate2 ? (
                            <>
                                <Text style={styles.candidateSelectNumber}>{candidate2.number}</Text>
                                <Text style={styles.candidateSelectName} numberOfLines={1}>{candidate2.name}</Text>
                                <Text style={styles.candidateSelectParty}>{candidate2.party}</Text>
                            </>
                        ) : (
                            <Text style={styles.candidateSelectPlaceholder}>Selecionar Candidato 2</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Comparison Results */}
                {comparison && (
                    <View style={styles.comparisonResults}>
                        {/* Summary */}
                        <View style={styles.comparisonSummary}>
                            <View style={[styles.comparisonSummaryCard, comparison.overallWinner === 1 && styles.comparisonWinner]}>
                                <Text style={styles.comparisonSummaryVotes}>{formatNumber(comparison.candidate1.totalVotes)}</Text>
                                <Text style={styles.comparisonSummaryLabel}>Votos</Text>
                                <Text style={styles.comparisonSummaryZones}>{comparison.candidate1.zonesWon} zonas vencidas</Text>
                            </View>
                            <View style={[styles.comparisonSummaryCard, comparison.overallWinner === 2 && styles.comparisonWinner]}>
                                <Text style={styles.comparisonSummaryVotes}>{formatNumber(comparison.candidate2.totalVotes)}</Text>
                                <Text style={styles.comparisonSummaryLabel}>Votos</Text>
                                <Text style={styles.comparisonSummaryZones}>{comparison.candidate2.zonesWon} zonas vencidas</Text>
                            </View>
                        </View>

                        {/* Zone by Zone */}
                        <Text style={styles.comparisonTitle}>Comparativo por Zona</Text>
                        {comparison.comparison.map((zone: any) => {
                            const total = zone.candidate1Votes + zone.candidate2Votes || 1;
                            const p1 = (zone.candidate1Votes / total) * 100;
                            const p2 = (zone.candidate2Votes / total) * 100;

                            return (
                                <View key={zone.zone} style={styles.comparisonBar}>
                                    <Text style={styles.comparisonZoneLabel}>Zona {zone.zone}</Text>
                                    <View style={styles.comparisonBarContainer}>
                                        <View style={[styles.comparisonBarLeft, { width: `${p1}%` }]}>
                                            <Text style={styles.comparisonBarText}>{formatNumber(zone.candidate1Votes)}</Text>
                                        </View>
                                        <View style={[styles.comparisonBarRight, { width: `${p2}%` }]}>
                                            <Text style={styles.comparisonBarText}>{formatNumber(zone.candidate2Votes)}</Text>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Candidate Select Modal */}
                <Modal visible={showCandidateSelect !== null} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Selecionar Candidato {showCandidateSelect}</Text>
                                <TouchableOpacity onPress={() => setShowCandidateSelect(null)}>
                                    <Text style={styles.modalClose}>\u2715</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.modalList}>
                                {candidates.map((c, index) => (
                                    <TouchableOpacity
                                        key={`${c.number}-${index}`}
                                        style={styles.modalItem}
                                        onPress={() => {
                                            if (showCandidateSelect === 1) setCandidate1(c);
                                            else setCandidate2(c);
                                            setShowCandidateSelect(null);
                                        }}
                                    >
                                        <Text style={styles.modalItemNumber}>{c.number}</Text>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.modalItemName}>{c.name}</Text>
                                            <Text style={styles.modalItemParty}>{c.party}</Text>
                                        </View>
                                        <Text style={styles.modalItemVotes}>{formatNumber(c.totalVotes)}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    };

    // ==================== PROJEÇÕES POLÍTICAS ====================
    const updateProjection = (candidateNum: string, adj: Record<string, number>) => {
        const result = calculateProjection(candidateNum, adj);
        setProjectionResult(result);
    };

    const handleScenarioSelect = (scenario: ProjectionScenario) => {
        setActiveScenario(scenario.id);
        setProjectionAdjustments(scenario.adjustments);
        if (projectionCandidate) {
            updateProjection(projectionCandidate, scenario.adjustments);
        }
    };

    const handleSliderChange = (city: string, value: number) => {
        const newAdj = { ...projectionAdjustments, [city]: value };
        setProjectionAdjustments(newAdj);
        setActiveScenario(null); // Custom mode
        if (projectionCandidate) {
            updateProjection(projectionCandidate, newAdj);
        }
    };

    const requestAiAnalysis = async () => {
        if (!projectionResult) return;
        setAiAnalysisLoading(true);
        setAiAnalysis(null);
        try {
            const scenarios = getProjectionScenarios();
            const scenarioObj = scenarios.find(s => s.id === activeScenario);
            const analysis = await aiAnalyzeProjection({
                candidateName: projectionResult.candidate.name,
                candidateParty: projectionResult.candidate.party,
                candidateNumber: projectionResult.candidate.number,
                currentVotes: projectionResult.currentTotalVotes,
                projectedVotes: projectionResult.projectedTotalVotes,
                currentRanking: projectionResult.currentRanking,
                projectedRanking: projectionResult.projectedRanking,
                rankingChange: projectionResult.rankingChange,
                goalVotes: projectionResult.goalVotes,
                goalProgress: projectionResult.goalProgress,
                scenarioName: scenarioObj?.name || 'Personalizado',
                cityResults: projectionResult.cityResults,
            });
            setAiAnalysis(analysis);
        } catch (err: any) {
            setAiAnalysis('Erro ao gerar an\u00e1lise. Verifique sua conex\u00e3o.');
        } finally {
            setAiAnalysisLoading(false);
        }
    };

    const handleChatSend = async () => {
        if (!chatInput.trim() || chatLoading) return;
        const userMsg = chatInput.trim();
        setChatInput('');
        const newMessages: AIChatMessage[] = [...chatMessages, { role: 'user', content: userMsg }];
        setChatMessages(newMessages);
        setChatLoading(true);

        try {
            const allDeputados = getMockDeputadoCandidates();
            let context: CandidateContext;

            if (projectionResult) {
                const cityVotes = getMockDeputadoVotesByCity(projectionResult.candidate.number);
                context = {
                    name: projectionResult.candidate.name,
                    party: projectionResult.candidate.party,
                    number: projectionResult.candidate.number,
                    totalVotes: projectionResult.currentTotalVotes,
                    ranking: projectionResult.currentRanking,
                    topCities: cityVotes.slice(0, 5).map(cv => ({ city: cv.city, votes: cv.votes })),
                };
            } else {
                const first = allDeputados[0];
                const cityVotes = getMockDeputadoVotesByCity(first.number);
                context = {
                    name: first.name,
                    party: first.party,
                    number: first.number,
                    totalVotes: first.totalVotes,
                    ranking: 1,
                    topCities: cityVotes.slice(0, 5).map(cv => ({ city: cv.city, votes: cv.votes })),
                };
            }

            const response = await sendChatMessage(userMsg, context, newMessages.slice(-10));
            setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (err: any) {
            setChatMessages(prev => [...prev, { role: 'assistant', content: 'Erro ao processar mensagem. Tente novamente.' }]);
        } finally {
            setChatLoading(false);
        }
    };

    const renderProjections = () => {
        const allDeputados = getMockDeputadoCandidates();
        const scenarios = getProjectionScenarios();
        const selectedDep = allDeputados.find(d => d.number === projectionCandidate);

        return (
            <View style={{ paddingHorizontal: 16, gap: 16 }}>
                {/* Título */}
                <View style={styles.chartCard}>
                    <View style={styles.chartHeader}>
                        <TrendingUp color={Colors.light.primary} size={20} />
                        <Text style={styles.chartTitle}>Simulador de Cenários Eleitorais</Text>
                    </View>
                    <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 4, lineHeight: 18 }}>
                        Ajuste os votos por cidade e visualize o impacto na classificação do candidato.
                    </Text>
                </View>

                {/* Seletor de Candidato */}
                <View style={styles.chartCard}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 10 }}>Candidato Base</Text>
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            padding: 14,
                            borderRadius: 12,
                            backgroundColor: selectedDep ? '#1E3A5F08' : '#F3F4F6',
                            borderWidth: 1,
                            borderColor: selectedDep ? Colors.light.primary + '30' : '#E5E7EB',
                        }}
                        onPress={() => setShowProjectionCandidateModal(true)}
                    >
                        {selectedDep ? (
                            <>
                                <View style={{
                                    width: 40, height: 40, borderRadius: 20,
                                    backgroundColor: getPartyColor(selectedDep.party) + '20',
                                    alignItems: 'center', justifyContent: 'center', marginRight: 12,
                                }}>
                                    <Text style={{ fontSize: 12, fontWeight: '800', color: getPartyColor(selectedDep.party) }}>
                                        {selectedDep.number}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>{selectedDep.name}</Text>
                                    <Text style={{ fontSize: 12, color: '#6B7280' }}>{selectedDep.party} • {formatNumber(selectedDep.totalVotes)} votos</Text>
                                </View>
                                <ChevronDown color="#9CA3AF" size={18} />
                            </>
                        ) : (
                            <>
                                <Users color="#9CA3AF" size={18} />
                                <Text style={{ fontSize: 14, color: '#9CA3AF', marginLeft: 8, flex: 1 }}>Selecionar candidato para projeção</Text>
                                <ChevronDown color="#9CA3AF" size={18} />
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                {projectionCandidate && (
                    <>
                        {/* Cenários Pré-definidos */}
                        <View style={styles.chartCard}>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 12 }}>Cenários</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
                                {scenarios.map(sc => (
                                    <TouchableOpacity
                                        key={sc.id}
                                        style={{
                                            paddingHorizontal: 14,
                                            paddingVertical: 10,
                                            borderRadius: 10,
                                            marginHorizontal: 4,
                                            backgroundColor: activeScenario === sc.id ? Colors.light.primary : '#F3F4F6',
                                            borderWidth: 1,
                                            borderColor: activeScenario === sc.id ? Colors.light.primary : '#E5E7EB',
                                            minWidth: 100,
                                            alignItems: 'center',
                                        }}
                                        onPress={() => handleScenarioSelect(sc)}
                                    >
                                        <Text style={{ fontSize: 16, marginBottom: 2 }}>{sc.icon}</Text>
                                        <Text style={{
                                            fontSize: 12, fontWeight: '700',
                                            color: activeScenario === sc.id ? '#fff' : '#374151',
                                        }}>{sc.name}</Text>
                                        <Text style={{
                                            fontSize: 10,
                                            color: activeScenario === sc.id ? '#ffffffCC' : '#9CA3AF',
                                            marginTop: 2,
                                        }}>{sc.description}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Painel de Resultados */}
                        {projectionResult && (
                            <View style={styles.chartCard}>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 12 }}>Resultado da Projeção</Text>

                                {/* Votos Atuais vs Projetados */}
                                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                                    <View style={{
                                        flex: 1, padding: 14, borderRadius: 12,
                                        backgroundColor: '#F3F4F6', alignItems: 'center',
                                    }}>
                                        <Text style={{ fontSize: 11, color: '#6B7280', marginBottom: 2 }}>Votos Atuais</Text>
                                        <Text style={{ fontSize: 18, fontWeight: '800', color: '#374151' }}>
                                            {formatNumber(projectionResult.currentTotalVotes)}
                                        </Text>
                                        <Text style={{ fontSize: 11, color: '#9CA3AF' }}>{projectionResult.currentPercentage}%</Text>
                                    </View>
                                    <View style={{
                                        flex: 1, padding: 14, borderRadius: 12,
                                        backgroundColor: projectionResult.voteDifference >= 0 ? '#ECFDF5' : '#FEF2F2',
                                        alignItems: 'center',
                                    }}>
                                        <Text style={{ fontSize: 11, color: '#6B7280', marginBottom: 2 }}>Votos Projetados</Text>
                                        <Text style={{
                                            fontSize: 18, fontWeight: '800',
                                            color: projectionResult.voteDifference >= 0 ? '#059669' : '#DC2626',
                                        }}>
                                            {formatNumber(projectionResult.projectedTotalVotes)}
                                        </Text>
                                        <Text style={{ fontSize: 11, color: projectionResult.voteDifference >= 0 ? '#059669' : '#DC2626' }}>
                                            {projectionResult.voteDifference >= 0 ? '+' : ''}{formatNumber(projectionResult.voteDifference)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Ranking */}
                                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                                    <View style={{
                                        flex: 1, padding: 12, borderRadius: 12,
                                        backgroundColor: '#EFF6FF', alignItems: 'center',
                                    }}>
                                        <Text style={{ fontSize: 11, color: '#6B7280' }}>Ranking Atual</Text>
                                        <Text style={{ fontSize: 22, fontWeight: '800', color: '#1E40AF' }}>
                                            {projectionResult.currentRanking}º
                                        </Text>
                                    </View>
                                    <View style={{
                                        flex: 1, padding: 12, borderRadius: 12,
                                        backgroundColor: projectionResult.rankingChange > 0 ? '#ECFDF5' : projectionResult.rankingChange < 0 ? '#FEF2F2' : '#F3F4F6',
                                        alignItems: 'center',
                                    }}>
                                        <Text style={{ fontSize: 11, color: '#6B7280' }}>Ranking Projetado</Text>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            <Text style={{
                                                fontSize: 22, fontWeight: '800',
                                                color: projectionResult.rankingChange > 0 ? '#059669' : projectionResult.rankingChange < 0 ? '#DC2626' : '#374151',
                                            }}>
                                                {projectionResult.projectedRanking}º
                                            </Text>
                                            {projectionResult.rankingChange !== 0 && (
                                                projectionResult.rankingChange > 0
                                                    ? <ArrowUpRight color="#059669" size={16} />
                                                    : <ArrowDownRight color="#DC2626" size={16} />
                                            )}
                                        </View>
                                        {projectionResult.rankingChange !== 0 && (
                                            <Text style={{
                                                fontSize: 10, fontWeight: '600',
                                                color: projectionResult.rankingChange > 0 ? '#059669' : '#DC2626',
                                            }}>
                                                {projectionResult.rankingChange > 0 ? '↑' : '↓'} {Math.abs(projectionResult.rankingChange)} {Math.abs(projectionResult.rankingChange) === 1 ? 'posição' : 'posições'}
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                {/* Meta Top 5 */}
                                <View style={{
                                    padding: 14, borderRadius: 12,
                                    backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A',
                                }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#92400E' }}>Meta: Top 5</Text>
                                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#92400E' }}>
                                            {projectionResult.goalProgress.toFixed(0)}%
                                        </Text>
                                    </View>
                                    <View style={{
                                        height: 10, borderRadius: 5, backgroundColor: '#FEF3C7',
                                        overflow: 'hidden',
                                    }}>
                                        <View style={{
                                            height: '100%',
                                            width: `${Math.min(100, projectionResult.goalProgress)}%`,
                                            backgroundColor: projectionResult.goalProgress >= 100 ? '#059669' : '#F59E0B',
                                            borderRadius: 5,
                                        }} />
                                    </View>
                                    <Text style={{ fontSize: 11, color: '#92400E', marginTop: 4 }}>
                                        Necessários: {formatNumber(projectionResult.goalVotes)} votos (5º colocado)
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* AI Strategic Analysis */}
                        {projectionResult && (
                            <View style={[styles.chartCard, { borderLeftWidth: 4, borderLeftColor: '#8B5CF6' }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                                    <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
                                        <Text style={{ fontSize: 16 }}>🤖</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937' }}>Análise Estratégica IA</Text>
                                        <Text style={{ fontSize: 11, color: '#9CA3AF' }}>DeepSeek AI • Consultoria Eleitoral</Text>
                                    </View>
                                </View>

                                {!aiAnalysis && !aiAnalysisLoading && (
                                    <TouchableOpacity
                                        onPress={requestAiAnalysis}
                                        style={{
                                            paddingVertical: 12, borderRadius: 10,
                                            backgroundColor: '#8B5CF6', alignItems: 'center',
                                        }}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
                                            🔍 Gerar Análise com IA
                                        </Text>
                                    </TouchableOpacity>
                                )}

                                {aiAnalysisLoading && (
                                    <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                                        <ActivityIndicator size="small" color="#8B5CF6" />
                                        <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>
                                            Analisando cenário eleitoral...
                                        </Text>
                                    </View>
                                )}

                                {aiAnalysis && !aiAnalysisLoading && (
                                    <View>
                                        <Text style={{ fontSize: 13, color: '#374151', lineHeight: 20 }}>
                                            {aiAnalysis}
                                        </Text>
                                        <TouchableOpacity
                                            onPress={requestAiAnalysis}
                                            style={{ marginTop: 12, alignItems: 'center' }}
                                        >
                                            <Text style={{ fontSize: 12, color: '#8B5CF6', fontWeight: '600' }}>
                                                🔄 Gerar Nova Análise
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Ajuste por Cidade */}
                        <View style={styles.chartCard}>
                            <Text style={{ fontSize: 14, fontWeight: '700', color: '#1F2937', marginBottom: 4 }}>Ajuste por Cidade</Text>
                            <Text style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 14 }}>Deslize para ajustar a projeção de votos</Text>

                            {projectionResult?.cityResults.map(cr => {
                                const adj = projectionAdjustments[cr.city] ?? 1.0;
                                const pctLabel = ((adj - 1) * 100).toFixed(0);
                                const isGain = cr.difference > 0;
                                const isLoss = cr.difference < 0;

                                return (
                                    <View key={cr.city} style={{ marginBottom: 16 }}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151' }}>{cr.city}</Text>
                                            <Text style={{
                                                fontSize: 12, fontWeight: '700',
                                                color: isGain ? '#059669' : isLoss ? '#DC2626' : '#6B7280',
                                            }}>
                                                {Number(pctLabel) >= 0 ? '+' : ''}{pctLabel}%
                                            </Text>
                                        </View>

                                        {/* Slider Track */}
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                            <TouchableOpacity
                                                onPress={() => handleSliderChange(cr.city, Math.max(0.5, adj - 0.05))}
                                                style={{
                                                    width: 28, height: 28, borderRadius: 14,
                                                    backgroundColor: '#FEE2E2', alignItems: 'center', justifyContent: 'center',
                                                }}
                                            >
                                                <Text style={{ fontSize: 16, fontWeight: '700', color: '#DC2626' }}>−</Text>
                                            </TouchableOpacity>

                                            <View style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
                                                <View style={{
                                                    height: '100%',
                                                    width: `${Math.min(100, ((adj - 0.5) / 1.0) * 100)}%`,
                                                    backgroundColor: adj >= 1 ? '#3B82F6' : '#F59E0B',
                                                    borderRadius: 4,
                                                }} />
                                            </View>

                                            <TouchableOpacity
                                                onPress={() => handleSliderChange(cr.city, Math.min(1.5, adj + 0.05))}
                                                style={{
                                                    width: 28, height: 28, borderRadius: 14,
                                                    backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center',
                                                }}
                                            >
                                                <Text style={{ fontSize: 16, fontWeight: '700', color: '#059669' }}>+</Text>
                                            </TouchableOpacity>
                                        </View>

                                        {/* Votos atuais vs projetados */}
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                            <Text style={{ fontSize: 11, color: '#9CA3AF' }}>
                                                Atual: {formatNumber(cr.currentVotes)}
                                            </Text>
                                            <Text style={{
                                                fontSize: 11, fontWeight: '600',
                                                color: isGain ? '#059669' : isLoss ? '#DC2626' : '#6B7280',
                                            }}>
                                                Projetado: {formatNumber(cr.projectedVotes)}
                                                {cr.difference !== 0 && ` (${isGain ? '+' : ''}${formatNumber(cr.difference)})`}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </>
                )}

                {/* Modal Seletor de Candidato para Projeção */}
                <Modal visible={showProjectionCandidateModal} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Selecionar Candidato</Text>
                                <TouchableOpacity onPress={() => setShowProjectionCandidateModal(false)}>
                                    <Text style={styles.modalClose}>{'✕'}</Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView style={styles.modalList}>
                                {allDeputados.map((c, index) => (
                                    <TouchableOpacity
                                        key={`proj-${c.number}-${index}`}
                                        style={styles.modalItem}
                                        onPress={() => {
                                            setProjectionCandidate(c.number);
                                            setShowProjectionCandidateModal(false);
                                            // Iniciar com cenário conservador
                                            const conservative = scenarios.find(s => s.id === 'conservador');
                                            if (conservative) {
                                                setActiveScenario('conservador');
                                                setProjectionAdjustments(conservative.adjustments);
                                                updateProjection(c.number, conservative.adjustments);
                                            }
                                        }}
                                    >
                                        <View style={[styles.modalItemNumber, { backgroundColor: getPartyColor(c.party) + '20' }]}>
                                            <Text style={[styles.modalItemNumberText, { color: getPartyColor(c.party) }]}>{c.number}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.modalItemName}>{c.name}</Text>
                                            <Text style={styles.modalItemParty}>{c.party}</Text>
                                        </View>
                                        <Text style={styles.modalItemVotes}>{formatNumber(c.totalVotes)}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    };

    // ==================== MAIN RENDER ====================
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Stack.Screen options={{ title: "Análise Eleitoral" }} />
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text style={styles.loadingText}>Carregando dados...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: "Análise Eleitoral",
                    headerStyle: { backgroundColor: Colors.light.primary },
                    headerTintColor: "#fff",
                }}
            />

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Eleições</Text>
                    <Text style={styles.headerSubtitle}>Dashboard de Análise Avançada</Text>
                </View>

                {/* Position Filter */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={styles.filterButton}
                        onPress={() => setShowPositionFilter(!showPositionFilter)}
                    >
                        <Filter color={Colors.light.primary} size={18} />
                        <Text style={styles.filterButtonText}>{selectedPosition || "Todos os Cargos"}</Text>
                        <ChevronDown color={Colors.light.textSecondary} size={18} />
                    </TouchableOpacity>
                </View>

                {showPositionFilter && (
                    <View style={styles.filterDropdown}>
                        <TouchableOpacity
                            style={[styles.filterOption, !selectedPosition && styles.filterOptionActive]}
                            onPress={() => { setSelectedPosition(null); setShowPositionFilter(false); }}
                        >
                            <Text style={[styles.filterOptionText, !selectedPosition && styles.filterOptionTextActive]}>
                                Todos os Cargos
                            </Text>
                        </TouchableOpacity>
                        {positions.map(pos => (
                            <TouchableOpacity
                                key={pos}
                                style={[styles.filterOption, selectedPosition === pos && styles.filterOptionActive]}
                                onPress={() => { setSelectedPosition(pos); setShowPositionFilter(false); }}
                            >
                                <Text style={[styles.filterOptionText, selectedPosition === pos && styles.filterOptionTextActive]}>
                                    {pos}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* Tabs */}
                {renderTabs()}

                {/* Tab Content */}
                {activeTab === 'resumo' && (
                    <>
                        {/* KPI Cards */}
                        <View style={styles.kpiRow}>
                            {renderKPICard("Total de Votos", summary?.totalVotes || 0, <TrendingUp color="#1E88E5" size={20} />, "#1E88E5")}
                            {renderKPICard("Zonas", summary?.zonesCount || 0, <MapPin color="#43A047" size={20} />, "#43A047")}
                        </View>
                        <View style={styles.kpiRow}>
                            {renderKPICard("Seções", summary?.sectionsCount || 0, <Layers color="#FB8C00" size={20} />, "#FB8C00")}
                            {renderKPICard("Candidatos", candidates.length, <Users color="#8E24AA" size={20} />, "#8E24AA")}
                        </View>

                        {/* Charts */}
                        {renderPieChart()}
                        {renderTopCandidatesChart()}
                    </>
                )}

                {activeTab === 'secoes' && renderSectionAnalysis()}
                {activeTab === 'bairros' && renderNeighborhoodAnalysis()}
                {activeTab === 'insights' && renderInsightsPanel()}
                {activeTab === 'comparativo' && renderComparison()}
                {activeTab === 'projecoes' && isDeputadoPosition(selectedPosition) && renderProjections()}

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Floating Chat FAB */}
            {isDeputadoPosition(selectedPosition) && (
                <TouchableOpacity
                    onPress={() => setShowChat(true)}
                    style={{
                        position: 'absolute', bottom: 20, right: 20,
                        width: 56, height: 56, borderRadius: 28,
                        backgroundColor: '#8B5CF6',
                        justifyContent: 'center', alignItems: 'center',
                        shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
                    }}
                >
                    <MessageCircle color="#fff" size={26} />
                </TouchableOpacity>
            )}

            {/* Chat Modal */}
            <Modal visible={showChat} transparent animationType="slide">
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <TouchableOpacity
                        style={{ flex: 0.15 }}
                        onPress={() => setShowChat(false)}
                        activeOpacity={1}
                    />
                    <KeyboardAvoidingView
                        style={{
                            flex: 0.85, backgroundColor: '#fff',
                            borderTopLeftRadius: 24, borderTopRightRadius: 24,
                            overflow: 'hidden',
                        }}
                        behavior="padding"
                    >
                        {/* Chat Header */}
                        <View style={{
                            flexDirection: 'row', alignItems: 'center', padding: 16,
                            borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
                            backgroundColor: '#FAFAFA',
                        }}>
                            <View style={{
                                width: 40, height: 40, borderRadius: 20,
                                backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center',
                                marginRight: 12,
                            }}>
                                <Text style={{ fontSize: 20 }}>🤖</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ fontSize: 15, fontWeight: '700', color: '#1F2937' }}>Assistente Governe AI</Text>
                                <Text style={{ fontSize: 11, color: '#9CA3AF' }}>Consultor Eleitoral • DeepSeek IA</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowChat(false)}>
                                <Text style={{ fontSize: 28, color: '#9CA3AF', lineHeight: 28 }}>×</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Chat Messages */}
                        <ScrollView
                            style={{ flex: 1, padding: 16 }}
                            contentContainerStyle={{ paddingBottom: 10 }}
                        >
                            {chatMessages.length === 0 && (
                                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                                    <Text style={{ fontSize: 40, marginBottom: 12 }}>💬</Text>
                                    <Text style={{ fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 4 }}>
                                        Pergunte sobre seu candidato
                                    </Text>
                                    <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 30 }}>
                                        Faça perguntas sobre dados eleitorais, estratégias de campanha, ou análises de desempenho do candidato.
                                    </Text>
                                    <View style={{ marginTop: 20, gap: 8 }}>
                                        {[
                                            'Quais cidades devo focar?',
                                            'Análise dos pontos fracos',
                                            'Estratégia para subir no ranking',
                                        ].map(suggestion => (
                                            <TouchableOpacity
                                                key={suggestion}
                                                onPress={() => {
                                                    setChatInput(suggestion);
                                                }}
                                                style={{
                                                    paddingHorizontal: 14, paddingVertical: 8,
                                                    borderRadius: 20, borderWidth: 1,
                                                    borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
                                                }}
                                            >
                                                <Text style={{ fontSize: 13, color: '#6B7280' }}>{suggestion}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {chatMessages.map((msg, idx) => (
                                <View
                                    key={idx}
                                    style={{
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%', marginBottom: 10,
                                        padding: 12, borderRadius: 16,
                                        backgroundColor: msg.role === 'user' ? '#8B5CF6' : '#F3F4F6',
                                        borderTopRightRadius: msg.role === 'user' ? 4 : 16,
                                        borderTopLeftRadius: msg.role === 'user' ? 16 : 4,
                                    }}
                                >
                                    <Text style={{
                                        fontSize: 13, lineHeight: 19,
                                        color: msg.role === 'user' ? '#fff' : '#374151',
                                    }}>
                                        {msg.content}
                                    </Text>
                                </View>
                            ))}

                            {chatLoading && (
                                <View style={{
                                    alignSelf: 'flex-start', padding: 12, borderRadius: 16,
                                    backgroundColor: '#F3F4F6', borderTopLeftRadius: 4,
                                }}>
                                    <View style={{ flexDirection: 'row', gap: 4 }}>
                                        <ActivityIndicator size="small" color="#8B5CF6" />
                                        <Text style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 6 }}>
                                            Analisando...
                                        </Text>
                                    </View>
                                </View>
                            )}
                        </ScrollView>

                        {/* Chat Input */}
                        <View style={{
                            flexDirection: 'row', alignItems: 'center', padding: 12,
                            borderTopWidth: 1, borderTopColor: '#F3F4F6',
                            backgroundColor: '#FAFAFA',
                        }}>
                            <TextInput
                                value={chatInput}
                                onChangeText={setChatInput}
                                placeholder="Digite sua pergunta..."
                                placeholderTextColor="#9CA3AF"
                                style={{
                                    flex: 1, paddingHorizontal: 14, paddingVertical: 10,
                                    borderRadius: 22, backgroundColor: '#fff',
                                    borderWidth: 1, borderColor: '#E5E7EB',
                                    fontSize: 14, color: '#1F2937',
                                    marginRight: 8,
                                }}
                                onSubmitEditing={handleChatSend}
                                editable={!chatLoading}
                            />
                            <TouchableOpacity
                                onPress={handleChatSend}
                                disabled={chatLoading || !chatInput.trim()}
                                style={{
                                    width: 42, height: 42, borderRadius: 21,
                                    backgroundColor: chatInput.trim() ? '#8B5CF6' : '#E5E7EB',
                                    justifyContent: 'center', alignItems: 'center',
                                }}
                            >
                                <Send color={chatInput.trim() ? '#fff' : '#9CA3AF'} size={18} />
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </Modal>

        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.light.backgroundSecondary },
    loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.light.backgroundSecondary },
    loadingText: { marginTop: 16, fontSize: 16, color: Colors.light.textSecondary },
    scrollView: { flex: 1 },
    header: { padding: 20, backgroundColor: Colors.light.primary },
    headerTitle: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 4 },
    headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)" },

    // Tabs
    tabsContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.light.card },
    tab: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8, backgroundColor: Colors.light.backgroundSecondary },
    tabActive: { backgroundColor: Colors.light.primary },
    tabText: { marginLeft: 6, fontSize: 14, fontWeight: "500", color: Colors.light.textSecondary },
    tabTextActive: { color: "#fff" },

    // Filter
    filterContainer: { padding: 16, paddingBottom: 8 },
    filterButton: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.light.card, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, gap: 8, ...Platform.select({ ios: { shadowColor: Colors.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 2 }, web: { boxShadow: "0 2px 4px rgba(0,0,0,0.1)" } }) },
    filterButtonText: { flex: 1, fontSize: 14, fontWeight: "500", color: Colors.light.text },
    filterDropdown: { marginHorizontal: 16, marginBottom: 8, backgroundColor: Colors.light.card, borderRadius: 12, overflow: "hidden", ...Platform.select({ ios: { shadowColor: Colors.light.shadow, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8 }, android: { elevation: 4 }, web: { boxShadow: "0 4px 12px rgba(0,0,0,0.15)" } }) },
    filterOption: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.light.border },
    filterOptionActive: { backgroundColor: `${Colors.light.primary}10` },
    filterOptionText: { fontSize: 14, color: Colors.light.text },
    filterOptionTextActive: { color: Colors.light.primary, fontWeight: "600" },

    // KPI
    kpiRow: { flexDirection: "row", paddingHorizontal: 16, gap: 12, marginBottom: 12 },
    kpiCard: { flex: 1, backgroundColor: Colors.light.card, borderRadius: 16, padding: 16, borderLeftWidth: 4, ...Platform.select({ ios: { shadowColor: Colors.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 2 }, web: { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" } }) },
    kpiHeader: { marginBottom: 8 },
    kpiIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
    kpiValue: { fontSize: 24, fontWeight: "700", color: Colors.light.text, marginBottom: 2 },
    kpiTitle: { fontSize: 12, color: Colors.light.textSecondary, fontWeight: "500" },
    kpiSubtitle: { fontSize: 11, color: Colors.light.textSecondary, marginTop: 2 },

    // Chart Container
    chartContainer: { margin: 16, backgroundColor: Colors.light.card, borderRadius: 16, padding: 16, ...Platform.select({ ios: { shadowColor: Colors.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 2 }, web: { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" } }) },
    chartHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
    chartTitle: { fontSize: 16, fontWeight: "600", color: Colors.light.text },
    barsContainer: { maxHeight: 400 },

    // Pie Chart
    pieContainer: {},
    pieRow: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
    pieColor: { width: 12, height: 12, borderRadius: 3 },
    pieParty: { width: 80, fontSize: 12, fontWeight: "500", color: Colors.light.text },
    pieBarWrapper: { flex: 1, height: 20, backgroundColor: Colors.light.backgroundSecondary, borderRadius: 4, overflow: "hidden" },
    pieBar: { height: "100%", borderRadius: 4 },
    piePercent: { width: 50, fontSize: 12, fontWeight: "600", color: Colors.light.text, textAlign: "right" },
    pieVotes: { width: 70, fontSize: 11, color: Colors.light.textSecondary, textAlign: "right" },

    // Top Candidates
    topBarRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    topRankBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center", marginRight: 10 },
    topRankText: { fontSize: 12, fontWeight: "700", color: "#fff" },
    topBarContent: { flex: 1 },
    topBarName: { fontSize: 13, fontWeight: "500", color: Colors.light.text, marginBottom: 4 },
    topBarWrapper: { flexDirection: "row", alignItems: "center", gap: 8 },
    topBar: { height: 20, borderRadius: 4, minWidth: 4 },
    topBarValue: { fontSize: 12, fontWeight: "600", color: Colors.light.text },

    // Insights
    insightsContainer: { padding: 16 },
    insightCard: { flexDirection: "row", backgroundColor: Colors.light.card, borderRadius: 16, padding: 16, marginBottom: 12, ...Platform.select({ ios: { shadowColor: Colors.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 2 }, web: { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" } }) },
    insightIconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#FFD70020', justifyContent: "center", alignItems: "center", marginRight: 12 },
    insightContent: { flex: 1 },
    insightLabel: { fontSize: 12, color: Colors.light.textSecondary, fontWeight: "500", marginBottom: 4 },
    insightValue: { fontSize: 18, fontWeight: "700", color: Colors.light.text },
    insightSubtext: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 2 },
    zoneLeaderRow: { flexDirection: "row", marginTop: 4 },
    zoneLeaderZone: { fontSize: 12, fontWeight: "600", color: Colors.light.textSecondary, width: 60 },
    zoneLeaderName: { fontSize: 12, color: Colors.light.text, flex: 1 },

    // Section Analysis
    sectionContainer: { padding: 16 },
    zoneFilter: { marginBottom: 12 },
    zoneChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.light.card, marginRight: 8 },
    zoneChipActive: { backgroundColor: Colors.light.primary },
    zoneChipText: { fontSize: 13, fontWeight: "500", color: Colors.light.textSecondary },
    zoneChipTextActive: { color: "#fff" },
    sectionTable: { backgroundColor: Colors.light.card, borderRadius: 16, overflow: "hidden", ...Platform.select({ ios: { shadowColor: Colors.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 2 }, web: { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" } }) },
    sectionHeader: { flexDirection: "row", padding: 12, backgroundColor: Colors.light.backgroundSecondary, borderBottomWidth: 1, borderBottomColor: Colors.light.border },
    sectionHeaderCell: { fontSize: 11, fontWeight: "600", color: Colors.light.textSecondary, textTransform: "uppercase" },
    sectionScroll: { maxHeight: 400 },
    sectionRow: { flexDirection: "row", padding: 12, alignItems: "center", borderBottomWidth: 1, borderBottomColor: Colors.light.border },
    sectionRowAlt: { backgroundColor: Colors.light.backgroundSecondary + '40' },
    sectionCell: { fontSize: 13, color: Colors.light.text },
    sectionCellName: { fontSize: 13, fontWeight: "500", color: Colors.light.text },
    sectionCellParty: { fontSize: 11, color: Colors.light.textSecondary },

    // Comparison
    comparisonContainer: { padding: 16 },
    comparisonSelect: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    candidateSelectBox: { flex: 1, backgroundColor: Colors.light.card, borderRadius: 12, padding: 16, alignItems: "center", borderWidth: 2, borderColor: Colors.light.border, borderStyle: "dashed" },
    candidateSelectActive: { borderColor: Colors.light.primary, borderStyle: "solid" },
    candidateSelectPlaceholder: { fontSize: 14, color: Colors.light.textSecondary },
    candidateSelectNumber: { fontSize: 24, fontWeight: "700", color: Colors.light.primary },
    candidateSelectName: { fontSize: 13, fontWeight: "500", color: Colors.light.text, marginTop: 4, textAlign: "center" },
    candidateSelectParty: { fontSize: 11, color: Colors.light.textSecondary, marginTop: 2 },
    vsContainer: { width: 40, alignItems: "center" },
    vsText: { fontSize: 16, fontWeight: "700", color: Colors.light.textSecondary },
    comparisonResults: { backgroundColor: Colors.light.card, borderRadius: 16, padding: 16, ...Platform.select({ ios: { shadowColor: Colors.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 2 }, web: { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" } }) },
    comparisonSummary: { flexDirection: "row", gap: 12, marginBottom: 16 },
    comparisonSummaryCard: { flex: 1, backgroundColor: Colors.light.backgroundSecondary, borderRadius: 12, padding: 12, alignItems: "center" },
    comparisonWinner: { borderWidth: 2, borderColor: '#10B981' },
    comparisonSummaryVotes: { fontSize: 22, fontWeight: "700", color: Colors.light.text },
    comparisonSummaryLabel: { fontSize: 11, color: Colors.light.textSecondary },
    comparisonSummaryZones: { fontSize: 12, fontWeight: "500", color: Colors.light.primary, marginTop: 4 },
    comparisonTitle: { fontSize: 14, fontWeight: "600", color: Colors.light.text, marginBottom: 12 },
    comparisonBar: { marginBottom: 12 },
    comparisonZoneLabel: { fontSize: 12, fontWeight: "500", color: Colors.light.textSecondary, marginBottom: 4 },
    comparisonBarContainer: { flexDirection: "row", height: 28, borderRadius: 6, overflow: "hidden" },
    comparisonBarLeft: { backgroundColor: '#3B82F6', justifyContent: "center", alignItems: "flex-start", paddingLeft: 8 },
    comparisonBarRight: { backgroundColor: '#EF4444', justifyContent: "center", alignItems: "flex-end", paddingRight: 8 },
    comparisonBarText: { fontSize: 11, fontWeight: "600", color: "#fff" },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: "flex-end" },
    modalContent: { backgroundColor: Colors.light.card, borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%' },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: Colors.light.border },
    modalTitle: { fontSize: 18, fontWeight: "600", color: Colors.light.text },
    modalSubtitle: { fontSize: 12, color: Colors.light.textSecondary, paddingHorizontal: 16, marginTop: 8 },
    modalClose: { fontSize: 24, color: Colors.light.textSecondary },
    modalList: { padding: 16 },
    modalItem: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.light.border },
    modalItemNumber: { width: 40, height: 40, borderRadius: 8, justifyContent: "center", alignItems: "center", marginRight: 12 },
    modalItemNumberText: { fontSize: 14, fontWeight: "700", color: "#fff" },
    modalItemInfo: { flex: 1 },
    modalItemName: { fontSize: 14, fontWeight: "500", color: Colors.light.text },
    modalItemParty: { fontSize: 12, color: Colors.light.textSecondary },
    modalItemVotes: { fontSize: 14, fontWeight: "600", color: Colors.light.text },
    modalItemSelected: { backgroundColor: Colors.light.primary + '10', borderRadius: 8 },

    // Neighborhood Analysis Styles
    chartCard: { backgroundColor: Colors.light.card, borderRadius: 16, padding: 16, marginBottom: 16, ...Platform.select({ ios: { shadowColor: Colors.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 2 }, web: { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" } }) },
    chartSubtitle: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 4 },
    neighborhoodItem: { backgroundColor: Colors.light.backgroundSecondary, borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 2, borderColor: 'transparent' },
    neighborhoodItemSelected: { borderColor: Colors.light.primary, backgroundColor: Colors.light.primary + '10' },
    neighborhoodHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    neighborhoodRank: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.light.primary + '30', justifyContent: "center", alignItems: "center", marginRight: 8 },
    neighborhoodRankText: { fontSize: 11, fontWeight: "700", color: Colors.light.primary },
    neighborhoodName: { flex: 1, fontSize: 14, fontWeight: "600", color: Colors.light.text },
    neighborhoodSections: { fontSize: 11, color: Colors.light.textSecondary },
    neighborhoodBarContainer: { height: 8, backgroundColor: Colors.light.backgroundSecondary, borderRadius: 4, marginBottom: 8 },
    neighborhoodBar: { height: 8, borderRadius: 4 },
    neighborhoodStats: { flexDirection: "row", justifyContent: "space-between" },
    neighborhoodVotes: { fontSize: 13, fontWeight: "600", color: Colors.light.text },
    neighborhoodPercent: { fontSize: 13, fontWeight: "600", color: Colors.light.primary },
    neighborhoodDetailsStats: { flexDirection: "row", gap: 12, marginTop: 12 },
    detailStatBox: { flex: 1, backgroundColor: Colors.light.backgroundSecondary, borderRadius: 12, padding: 16, alignItems: "center" },
    detailStatValue: { fontSize: 24, fontWeight: "700", color: Colors.light.primary },
    detailStatLabel: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 4 },
    subsectionTitle: { fontSize: 14, fontWeight: "600", color: Colors.light.text, marginBottom: 12 },
    candidateRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.light.border },
    candidateMedal: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.light.backgroundSecondary, justifyContent: "center", alignItems: "center", marginRight: 12 },
    candidateMedalText: { fontSize: 12, fontWeight: "700", color: Colors.light.text },
    candidateInfo: { flex: 1 },
    candidateName: { fontSize: 13, fontWeight: "500", color: Colors.light.text },
    candidateParty: { fontSize: 11, color: Colors.light.textSecondary, marginTop: 2 },
    candidateVotes: { fontSize: 14, fontWeight: "700", color: Colors.light.primary },
    locationRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 8 },
    locationText: { fontSize: 12, color: Colors.light.text, flex: 1 },

    // Vereador Selection Styles
    vereadorSelectorContainer: { marginBottom: 16 },
    selectorTitle: { fontSize: 16, fontWeight: "600", color: Colors.light.text, marginBottom: 12 },
    vereadorSelectBox: { backgroundColor: Colors.light.card, borderRadius: 12, padding: 16, borderWidth: 2, borderColor: Colors.light.border, borderStyle: "dashed" },
    vereadorSelectActive: { borderColor: Colors.light.primary, borderStyle: "solid" },
    selectedVereadorContent: { flexDirection: "row", alignItems: "center" },
    vereadorPlaceholderContent: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
    vereadorPlaceholder: { fontSize: 14, color: Colors.light.textSecondary },
    vereadorNumber: { width: 40, height: 40, borderRadius: 8, justifyContent: "center", alignItems: "center", marginRight: 12 },
    vereadorNumberText: { fontSize: 14, fontWeight: "700", color: "#fff" },
    vereadorInfo: { flex: 1 },
    vereadorName: { fontSize: 16, fontWeight: "600", color: Colors.light.text },
    vereadorParty: { fontSize: 12, color: Colors.light.textSecondary, marginTop: 2 },
    clearButton: { padding: 8 },
    vereadorAnalysis: { backgroundColor: Colors.light.card, borderRadius: 16, padding: 16, marginBottom: 16, ...Platform.select({ ios: { shadowColor: Colors.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 2 }, web: { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" } }) },
    loadingVereador: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: 20, gap: 8 },
    loadingVereadorText: { fontSize: 14, color: Colors.light.textSecondary },
    vereadorStatsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
    vereadorStatCard: { flex: 1, minWidth: "45%", backgroundColor: Colors.light.backgroundSecondary, borderRadius: 12, padding: 12, borderLeftWidth: 4 },
    vereadorStatValue: { fontSize: 20, fontWeight: "700", color: Colors.light.text },
    vereadorStatLabel: { fontSize: 11, color: Colors.light.textSecondary, marginTop: 4 },
    vereadorZonesSection: { marginTop: 8 },
    vereadorSectionTitle: { fontSize: 14, fontWeight: "600", color: Colors.light.text, marginBottom: 12 },
    vereadorZoneRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    vereadorZoneLabel: { width: 70, fontSize: 12, fontWeight: "500", color: Colors.light.textSecondary },
    vereadorZoneBarContainer: { flex: 1, height: 16, backgroundColor: Colors.light.backgroundSecondary, borderRadius: 4, marginHorizontal: 8 },
    vereadorZoneBar: { height: 16, borderRadius: 4 },
    vereadorZoneVotes: { width: 60, fontSize: 12, fontWeight: "600", color: Colors.light.text, textAlign: "right" },
    vereadorSectionsSection: { marginTop: 16 },
    vereadorSectionRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.light.border },
    vereadorRankBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.light.primary, justifyContent: "center", alignItems: "center", marginRight: 10 },
    vereadorRankText: { fontSize: 11, fontWeight: "700", color: "#fff" },
    vereadorSectionLabel: { flex: 1, fontSize: 13, color: Colors.light.text },
    vereadorSectionVotes: { fontSize: 13, fontWeight: "600", color: Colors.light.primary },
    noVereadorData: { padding: 20, alignItems: "center" },
    noVereadorDataText: { fontSize: 14, color: Colors.light.textSecondary, textAlign: "center" },
    insightsDivider: { height: 1, backgroundColor: Colors.light.border, marginVertical: 20 },
    insightsGeneralTitle: { fontSize: 16, fontWeight: "600", color: Colors.light.text, marginBottom: 12 },
});
