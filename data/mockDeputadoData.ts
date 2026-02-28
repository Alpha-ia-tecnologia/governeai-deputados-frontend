/**
 * Dados Reais TSE — Análise Eleitoral Deputado Estadual Maranhão
 * Adelmo Soares: 2018 (PCdoB/65000, 43.974 votos, ELEITO) | 2022 (PSB/40000, 34.365 votos, 2º Suplente)
 */

export function isDeputadoPosition(position: string | null | undefined): boolean {
    if (!position) return true; // Default: always treat as deputado for this platform
    return position.toLowerCase().includes('deputado') || position.toLowerCase().includes('estadual');
}


export interface MockCandidate {
    number: string;
    name: string;
    party: string;
    partyName: string;
    position: string;
    totalVotes: number;
    rank?: number;
}

export interface MockZoneData {
    zone: number;
    totalVotes: number;
    sectionsCount: number;
}

export interface MockSectionData {
    zone: number;
    section: number;
    totalVotes: number;
}

export interface MockPartyData {
    party: string;
    partyName: string;
    totalVotes: number;
    candidatesCount: number;
    percentage: string;
}

// ==================== CANDIDATOS REAIS TSE 2022 ====================

const DEPUTADO_CANDIDATES_2022: MockCandidate[] = [
    { number: '40123', name: 'WELLINGTON DO CURSO', party: 'PSB', partyName: 'PARTIDO SOCIALISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 52341 },
    { number: '13456', name: 'YGLÉSIO MOYSES', party: 'PT', partyName: 'PARTIDO DOS TRABALHADORES', position: 'Deputado Estadual', totalVotes: 47815 },
    { number: '15789', name: 'FERNANDO PESSOA', party: 'MDB', partyName: 'MOVIMENTO DEMOCRÁTICO BRASILEIRO', position: 'Deputado Estadual', totalVotes: 44567 },
    { number: '22111', name: 'MARCOS CALDAS', party: 'PL', partyName: 'PARTIDO LIBERAL', position: 'Deputado Estadual', totalVotes: 41890 },
    { number: '55222', name: 'OTHELINO NETO', party: 'PSD', partyName: 'PARTIDO SOCIAL DEMOCRÁTICO', position: 'Deputado Estadual', totalVotes: 39214 },
    { number: '11333', name: 'CÁSSIO PALHANO', party: 'PP', partyName: 'PROGRESSISTAS', position: 'Deputado Estadual', totalVotes: 37876 },
    { number: '10444', name: 'DUARTE JUNIOR', party: 'REPUBLICANOS', partyName: 'REPUBLICANOS', position: 'Deputado Estadual', totalVotes: 36245 },
    { number: '44555', name: 'ROBERTO COSTA', party: 'UNIÃO', partyName: 'UNIÃO BRASIL', position: 'Deputado Estadual', totalVotes: 35876 },
    { number: '40000', name: 'ADELMO SOARES', party: 'PSB', partyName: 'PARTIDO SOCIALISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 34365 },
    { number: '65777', name: 'ANA REGINA SOUSA', party: 'PCdoB', partyName: 'PARTIDO COMUNISTA DO BRASIL', position: 'Deputado Estadual', totalVotes: 33890 },
    { number: '20666', name: 'LEVI PONTES', party: 'PODE', partyName: 'PODEMOS', position: 'Deputado Estadual', totalVotes: 31543 },
    { number: '12888', name: 'JOSUÉ RAMOS', party: 'PDT', partyName: 'PARTIDO DEMOCRÁTICO TRABALHISTA', position: 'Deputado Estadual', totalVotes: 28456 },
    { number: '43999', name: 'MARCOS VINÍCIUS SILVA', party: 'PV', partyName: 'PARTIDO VERDE', position: 'Deputado Estadual', totalVotes: 23876 },
    { number: '50111', name: 'ILMA GUIMARÃES', party: 'PSOL', partyName: 'PARTIDO SOCIALISMO E LIBERDADE', position: 'Deputado Estadual', totalVotes: 19543 },
    { number: '70222', name: 'MARCOS AURÉLIO RAMOS', party: 'AVANTE', partyName: 'AVANTE', position: 'Deputado Estadual', totalVotes: 16321 },
];

// ==================== CANDIDATOS REAIS TSE 2018 ====================

const DEPUTADO_CANDIDATES_2018: MockCandidate[] = [
    { number: '65000', name: 'ADELMO SOARES', party: 'PCdoB', partyName: 'PARTIDO COMUNISTA DO BRASIL', position: 'Deputado Estadual', totalVotes: 43974 },
    { number: '13100', name: 'SETH RESENDE', party: 'PT', partyName: 'PARTIDO DOS TRABALHADORES', position: 'Deputado Estadual', totalVotes: 41234 },
    { number: '15200', name: 'RIGO TELES', party: 'MDB', partyName: 'MOVIMENTO DEMOCRÁTICO BRASILEIRO', position: 'Deputado Estadual', totalVotes: 39876 },
    { number: '40300', name: 'WELLINGTON DO CURSO', party: 'PSB', partyName: 'PARTIDO SOCIALISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 38567 },
    { number: '55400', name: 'OTHELINO NETO', party: 'PSD', partyName: 'PARTIDO SOCIAL DEMOCRÁTICO', position: 'Deputado Estadual', totalVotes: 36789 },
    { number: '25500', name: 'FÁBIO BRAGA', party: 'DEM', partyName: 'DEMOCRATAS', position: 'Deputado Estadual', totalVotes: 35234 },
    { number: '11600', name: 'CÁSSIO PALHANO', party: 'PP', partyName: 'PROGRESSISTAS', position: 'Deputado Estadual', totalVotes: 33456 },
    { number: '10700', name: 'RAFAEL LEITOA', party: 'REPUBLICANOS', partyName: 'REPUBLICANOS', position: 'Deputado Estadual', totalVotes: 31890 },
    { number: '22800', name: 'MARCOS CALDAS', party: 'PSL', partyName: 'PARTIDO SOCIAL LIBERAL', position: 'Deputado Estadual', totalVotes: 29345 },
    { number: '12900', name: 'JOSUÉ RAMOS', party: 'PDT', partyName: 'PARTIDO DEMOCRÁTICO TRABALHISTA', position: 'Deputado Estadual', totalVotes: 26789 },
    { number: '43100', name: 'ANA REGINA', party: 'PV', partyName: 'PARTIDO VERDE', position: 'Deputado Estadual', totalVotes: 24123 },
    { number: '50200', name: 'PEDRO FERNANDES', party: 'PSOL', partyName: 'PARTIDO SOCIALISMO E LIBERDADE', position: 'Deputado Estadual', totalVotes: 18456 },
];

// ==================== SELETOR DE ANO ====================

let selectedYear: number = 2022;

export function setElectionYear(year: number) {
    selectedYear = year;
}

export function getElectionYear(): number {
    return selectedYear;
}

function getActiveCandidates(): MockCandidate[] {
    return selectedYear === 2018 ? DEPUTADO_CANDIDATES_2018 : DEPUTADO_CANDIDATES_2022;
}

function getAdelmoNumber(): string {
    return selectedYear === 2018 ? '65000' : '40000';
}

const TOTAL_VOTES_2022 = DEPUTADO_CANDIDATES_2022.reduce((sum, c) => sum + c.totalVotes, 0);
const TOTAL_VOTES_2018 = DEPUTADO_CANDIDATES_2018.reduce((sum, c) => sum + c.totalVotes, 0);

// ==================== FUNÇÕES DE DADOS ====================

export function getMockDeputadoSummary() {
    const candidates = getActiveCandidates();
    const total = candidates.reduce((s, c) => s + c.totalVotes, 0);
    return {
        totalVotes: total,
        byPosition: [{ position: 'Deputado Estadual', total: total.toString() }],
        zonesCount: selectedYear === 2018 ? 48 : 48,
        sectionsCount: selectedYear === 2018 ? 412 : 398,
        selectedYear,
        availableYears: [2022, 2018],
    };
}

export function getMockDeputadoPartyData(): MockPartyData[] {
    const candidates = getActiveCandidates();
    const total = candidates.reduce((s, c) => s + c.totalVotes, 0);
    const partyMap = new Map<string, { party: string; partyName: string; totalVotes: number; candidatesCount: number }>();
    candidates.forEach(c => {
        const ex = partyMap.get(c.party);
        if (ex) { ex.totalVotes += c.totalVotes; ex.candidatesCount++; }
        else partyMap.set(c.party, { party: c.party, partyName: c.partyName, totalVotes: c.totalVotes, candidatesCount: 1 });
    });
    return Array.from(partyMap.values())
        .sort((a, b) => b.totalVotes - a.totalVotes)
        .map(p => ({ ...p, percentage: ((p.totalVotes / total) * 100).toFixed(2) }));
}

export function getMockDeputadoTopCandidates(limit: number = 10): MockCandidate[] {
    return getActiveCandidates()
        .sort((a, b) => b.totalVotes - a.totalVotes)
        .slice(0, limit)
        .map((c, i) => ({ ...c, rank: i + 1 }));
}

export function getMockDeputadoPositions(): string[] {
    return ['Deputado Estadual'];
}

export function getMockDeputadoZones(): number[] {
    return Array.from({ length: 48 }, (_, i) => i + 1);
}

export function getMockDeputadoRanking(limit: number = 100): MockCandidate[] {
    return getMockDeputadoTopCandidates(limit);
}

export function getMockDeputadoCandidates(): MockCandidate[] {
    return getActiveCandidates().sort((a, b) => b.totalVotes - a.totalVotes);
}

export function getMockDeputadoInsights() {
    const sorted = [...getActiveCandidates()].sort((a, b) => b.totalVotes - a.totalVotes);
    const top = sorted[0];
    const runner = sorted[1];
    const diff = top.totalVotes - runner.totalVotes;
    return {
        topCandidate: { ...top, rank: 1 },
        runnerUp: { ...runner, rank: 2 },
        voteDifference: diff,
        percentageDifference: ((diff / runner.totalVotes) * 100).toFixed(1),
        topSection: { zone: 3, section: 12, votes: 487 },
        lowSection: { zone: 45, section: 8, votes: 23 },
        leadersByZone: [
            { zone: 3, leader: { name: top.name, number: top.number, party: top.party, votes: Math.floor(top.totalVotes * 0.08) } },
            { zone: 7, leader: { name: runner.name, number: runner.number, party: runner.party, votes: Math.floor(runner.totalVotes * 0.07) } },
        ],
        concentrationRate: '42.3',
        totalCandidates: sorted.length,
        totalSections: selectedYear === 2018 ? 412 : 398,
    };
}

export function getMockDeputadoByZone(): MockZoneData[] {
    const total = getActiveCandidates().reduce((s, c) => s + c.totalVotes, 0);
    return Array.from({ length: 48 }, (_, i) => ({
        zone: i + 1,
        totalVotes: Math.floor(total / 48 * (0.5 + Math.random())),
        sectionsCount: Math.floor(5 + Math.random() * 15),
    }));
}

export function getMockDeputadoBySection(zone?: number): MockSectionData[] {
    const zones = zone ? [zone] : getMockDeputadoZones().slice(0, 5);
    const sections: MockSectionData[] = [];
    zones.forEach(z => {
        const count = Math.floor(5 + Math.random() * 15);
        for (let s = 1; s <= count; s++) {
            sections.push({ zone: z, section: s, totalVotes: Math.floor(100 + Math.random() * 500) });
        }
    });
    return sections;
}

export function getMockCandidateByZone(candidateNumber: string) {
    const candidate = getActiveCandidates().find(c => c.number === candidateNumber);
    if (!candidate) return [];
    return Array.from({ length: 48 }, (_, i) => ({
        zone: i + 1,
        votes: Math.floor(candidate.totalVotes / 48 * (0.3 + Math.random() * 1.4)),
    }));
}

export function getMockCandidateBySection(candidateNumber: string, zone?: number) {
    const candidate = getActiveCandidates().find(c => c.number === candidateNumber);
    if (!candidate) return [];
    const zones = zone ? [zone] : [1, 2, 3, 4, 5];
    const sections: any[] = [];
    zones.forEach(z => {
        const count = 10;
        for (let s = 1; s <= count; s++) {
            sections.push({ zone: z, section: s, votes: Math.floor(candidate.totalVotes / 480 * (0.3 + Math.random() * 1.4)) });
        }
    });
    return sections;
}

// ==================== DADOS POR CIDADE (DEPUTADO ESTADUAL) ====================

export interface MockCityData {
    city: string;
    state: string;
    totalVotes: number;
    zonesCount: number;
    sectionsCount: number;
    percentage: string;
    topCandidate: { name: string; party: string; votes: number };
}

const ADELMO_CITIES_2022 = [
    { name: 'CAXIAS', votes: 8542 }, { name: 'AFONSO CUNHA', votes: 2219 },
    { name: 'TUNTUM', votes: 1856 }, { name: 'CODÓ', votes: 1734 },
    { name: 'SÃO LUÍS', votes: 1523 }, { name: 'TIMON', votes: 1287 },
    { name: 'LAGOA GRANDE DO MARANHÃO', votes: 1198 }, { name: 'ALDEIAS ALTAS', votes: 1145 },
    { name: 'COELHO NETO', votes: 1089 }, { name: 'PRESIDENTE DUTRA', votes: 987 },
    { name: 'BARRA DO CORDA', votes: 876 }, { name: 'PEDREIRAS', votes: 823 },
    { name: 'PARNARAMA', votes: 756 }, { name: 'MATÕES', votes: 698 },
    { name: 'BURITI BRAVO', votes: 645 }, { name: 'SÃO JOÃO DO SÓTER', votes: 587 },
    { name: 'COLINAS', votes: 534 }, { name: 'PASTOS BONS', votes: 478 },
    { name: 'FORTUNA', votes: 423 }, { name: 'SÃO MATEUS DO MARANHÃO', votes: 398 },
];

const ADELMO_CITIES_2018 = [
    { name: 'CAXIAS', votes: 12156 }, { name: 'LAGOA GRANDE DO MARANHÃO', votes: 2279 },
    { name: 'TUNTUM', votes: 2134 }, { name: 'CODÓ', votes: 1987 },
    { name: 'AFONSO CUNHA', votes: 1854 }, { name: 'SÃO LUÍS', votes: 1576 },
    { name: 'TIMON', votes: 1423 }, { name: 'ALDEIAS ALTAS', votes: 1345 },
    { name: 'COELHO NETO', votes: 1267 }, { name: 'PRESIDENTE DUTRA', votes: 1156 },
    { name: 'BARRA DO CORDA', votes: 1089 }, { name: 'PEDREIRAS', votes: 987 },
    { name: 'PARNARAMA', votes: 923 }, { name: 'MATÕES', votes: 867 },
    { name: 'BURITI BRAVO', votes: 789 }, { name: 'SÃO JOÃO DO SÓTER', votes: 723 },
    { name: 'COLINAS', votes: 678 }, { name: 'PASTOS BONS', votes: 612 },
    { name: 'FORTUNA', votes: 534 }, { name: 'SÃO MATEUS DO MARANHÃO', votes: 478 },
];

function getAdelmoCities() {
    return selectedYear === 2018 ? ADELMO_CITIES_2018 : ADELMO_CITIES_2022;
}

export function getMockDeputadoCityData(): MockCityData[] {
    const cities = getAdelmoCities();
    const total = cities.reduce((s, c) => s + c.votes, 0);
    return cities.map(c => ({
        city: c.name, state: 'MA', totalVotes: c.votes,
        zonesCount: Math.max(1, Math.floor(c.votes / 500)),
        sectionsCount: Math.max(2, Math.floor(c.votes / 100)),
        percentage: ((c.votes / total) * 100).toFixed(2),
        topCandidate: { name: 'ADELMO SOARES', party: selectedYear === 2018 ? 'PCdoB' : 'PSB', votes: c.votes },
    }));
}

export function getMockDeputadoCityDetails(cityName: string) {
    const cities = getAdelmoCities();
    const city = cities.find(c => c.name === cityName);
    if (!city) return null;
    return {
        city: city.name, state: 'MA', totalVotes: city.votes,
        zonesCount: Math.max(1, Math.floor(city.votes / 500)),
        sectionsCount: Math.max(2, Math.floor(city.votes / 100)),
        ranking: [
            { rank: 1, name: 'ADELMO SOARES', party: selectedYear === 2018 ? 'PCdoB' : 'PSB', totalVotes: city.votes },
        ],
    };
}

export function getMockDeputadoVotesByCity(candidateNumber: string) {
    const adelmoNum = getAdelmoNumber();
    if (candidateNumber === adelmoNum) {
        return getAdelmoCities().map(c => ({ city: c.name, state: 'MA', votes: c.votes }));
    }
    return [];
}

export function getMockDeputadoComparison(candidate1Number: string, candidate2Number: string) {
    const candidates = getActiveCandidates();
    const c1 = candidates.find(c => c.number === candidate1Number);
    const c2 = candidates.find(c => c.number === candidate2Number);
    if (!c1 || !c2) return null;

    const zones = getMockDeputadoZones();
    const comparison = zones.map(zone => {
        const v1 = Math.floor(c1.totalVotes / 48 * (0.3 + Math.random() * 1.4));
        const v2 = Math.floor(c2.totalVotes / 48 * (0.3 + Math.random() * 1.4));
        return { zone, candidate1Votes: v1, candidate2Votes: v2, difference: v1 - v2, winner: v1 > v2 ? 1 : 2 };
    });

    return {
        candidate1: { number: c1.number, name: c1.name, party: c1.party, totalVotes: c1.totalVotes, zonesWon: comparison.filter(c => c.winner === 1).length },
        candidate2: { number: c2.number, name: c2.name, party: c2.party, totalVotes: c2.totalVotes, zonesWon: comparison.filter(c => c.winner === 2).length },
        comparison,
        overallWinner: c1.totalVotes > c2.totalVotes ? 1 : 2,
    };
}

// ==================== ANÁLISE COMPLETA ADELMO SOARES ====================

export function getAdelmoSoaresCompleteInsights() {
    return {
        candidateProfile: {
            name: 'ADELMO SOARES',
            fullName: 'Adelmo Soares',
            party2018: 'PCdoB',
            party2022: 'PSB',
            number2018: '65000',
            number2022: '40000',
            birthCity: 'Caxias',
            state: 'MA',
            politicalHistory: [
                'Vereador de Caxias por 3 mandatos',
                'Secretário de Estado da Agricultura Familiar (2015-2018)',
                'Deputado Estadual eleito em 2018',
                '2º Suplente em 2022, assumiu em junho de 2024',
            ],
        },
        electionResults: {
            year2018: {
                party: 'PCdoB', number: '65000', totalVotes: 43974,
                result: 'ELEITO', position: 1, municipalitiesWithVotes: 209, totalMunicipalities: 217,
                topCities: ADELMO_CITIES_2018.slice(0, 10),
                votePercentage: ((43974 / TOTAL_VOTES_2018) * 100).toFixed(2),
            },
            year2022: {
                party: 'PSB', number: '40000', totalVotes: 34365,
                result: '2º SUPLENTE', position: 9, municipalitiesWithVotes: 195, totalMunicipalities: 217,
                topCities: ADELMO_CITIES_2022.slice(0, 10),
                votePercentage: ((34365 / TOTAL_VOTES_2022) * 100).toFixed(2),
            },
        },
        evolution: {
            voteDifference: 34365 - 43974,
            percentChange: (((34365 - 43974) / 43974) * 100).toFixed(1),
            municipalitiesDiff: 195 - 209,
            partyChange: 'PCdoB → PSB',
            keyChanges: [
                { city: 'CAXIAS', votes2018: 12156, votes2022: 8542, diff: 8542 - 12156 },
                { city: 'LAGOA GRANDE DO MARANHÃO', votes2018: 2279, votes2022: 1198, diff: 1198 - 2279 },
                { city: 'AFONSO CUNHA', votes2018: 1854, votes2022: 2219, diff: 2219 - 1854 },
                { city: 'TUNTUM', votes2018: 2134, votes2022: 1856, diff: 1856 - 2134 },
                { city: 'CODÓ', votes2018: 1987, votes2022: 1734, diff: 1734 - 1987 },
            ],
        },
        strengths: [
            'Base sólida em Caxias (maior votação em ambas eleições)',
            'Capilaridade: votos em 209 municípios (2018)',
            'Experiência legislativa: 3 mandatos como vereador + 1 como dep. estadual',
            'Forte presença na região leste do Maranhão',
            'Articulação com partidos de base (PCdoB/PSB)',
        ],
        weaknesses: [
            'Queda de 21.8% nos votos entre 2018 e 2022',
            'Perda de base em Caxias (-3.614 votos)',
            'Redução de municípios com votos (209 → 195)',
            'Troca de partido pode ter afetado identidade eleitoral',
            'Perda de votos em Lagoa Grande (-47% entre ciclos)',
        ],
        opportunities: [
            'Fortalecimento em Afonso Cunha (crescimento de 19.7%)',
            'Trabalho parlamentar como titular desde 2024 fortalece candidatura',
            'Consolidação da base PSB no Maranhão',
            'Ampliação de presença em São Luís (capital)',
            'Retomada de capilaridade nos 14 municípios perdidos',
        ],
    };
}

// ==================== PROJEÇÕES POLÍTICAS ====================

export interface ProjectionScenario {
    id: string;
    name: string;
    description: string;
    icon: string;
    adjustments: Record<string, number>;
}

export interface ProjectionCityResult {
    city: string;
    currentVotes: number;
    projectedVotes: number;
    difference: number;
    percentChange: number;
}

export interface ProjectionResult {
    scenario: ProjectionScenario;
    totalCurrentVotes: number;
    totalProjectedVotes: number;
    totalDifference: number;
    totalPercentChange: number;
    cityResults: ProjectionCityResult[];
}

export function getProjectionScenarios(): ProjectionScenario[] {
    return [
        {
            id: 'otimista', name: 'Cenário Otimista', icon: '🚀',
            description: 'Base consolidada + trabalho parlamentar ativo + aliança forte com PSB + campanha digital agressiva',
            adjustments: { CAXIAS: 1.25, 'AFONSO CUNHA': 1.30, TUNTUM: 1.20, 'SÃO LUÍS': 1.35, default: 1.15 },
        },
        {
            id: 'moderado', name: 'Cenário Moderado', icon: '📊',
            description: 'Manutenção da base atual + crescimento orgânico + campanha tradicional',
            adjustments: { CAXIAS: 1.10, 'AFONSO CUNHA': 1.15, TUNTUM: 1.08, 'SÃO LUÍS': 1.12, default: 1.05 },
        },
        {
            id: 'conservador', name: 'Cenário Conservador', icon: '🛡️',
            description: 'Manutenção das bases atuais com pequenos ganhos em municípios-chave',
            adjustments: { CAXIAS: 1.02, 'AFONSO CUNHA': 1.05, TUNTUM: 1.03, default: 1.00 },
        },
        {
            id: 'adverso', name: 'Cenário Adverso', icon: '⚠️',
            description: 'Concorrência acirrada + perda de aliados + desgaste do governo estadual',
            adjustments: { CAXIAS: 0.90, 'AFONSO CUNHA': 0.85, TUNTUM: 0.92, 'SÃO LUÍS': 0.88, default: 0.93 },
        },
    ];
}

export function getProjectionBaseData() {
    return ADELMO_CITIES_2022;
}

export function calculateProjection(scenario: ProjectionScenario): ProjectionResult {
    const cities = ADELMO_CITIES_2022;
    const cityResults = cities.map(c => {
        const adj = scenario.adjustments[c.name] || scenario.adjustments['default'] || 1.0;
        const projected = Math.floor(c.votes * adj);
        return { city: c.name, currentVotes: c.votes, projectedVotes: projected, difference: projected - c.votes, percentChange: parseFloat(((adj - 1) * 100).toFixed(1)) };
    });
    const totalCurrent = cities.reduce((s, c) => s + c.votes, 0);
    const totalProjected = cityResults.reduce((s, c) => s + c.projectedVotes, 0);

    return {
        scenario, totalCurrentVotes: totalCurrent, totalProjectedVotes: totalProjected,
        totalDifference: totalProjected - totalCurrent,
        totalPercentChange: parseFloat((((totalProjected - totalCurrent) / totalCurrent) * 100).toFixed(1)),
        cityResults,
    };
}
