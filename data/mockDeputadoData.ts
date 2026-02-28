/**
 * Mock Data para Análise Eleitoral - Deputado Estadual
 * Dados baseados na eleição de 2022 - Adelmo Soares (PSB) e concorrentes
 */

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

// ==================== CANDIDATOS ====================
const DEPUTADO_CANDIDATES: MockCandidate[] = [
    { number: '40123', name: 'WELLINGTON DO CURSO', party: 'PSB', partyName: 'PARTIDO SOCIALISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 48932 },
    { number: '13456', name: 'YGLÉSIO MOYSES', party: 'PT', partyName: 'PARTIDO DOS TRABALHADORES', position: 'Deputado Estadual', totalVotes: 42815 },
    { number: '15789', name: 'FERNANDO PESSOA', party: 'MDB', partyName: 'MOVIMENTO DEMOCRÁTICO BRASILEIRO', position: 'Deputado Estadual', totalVotes: 39456 },
    { number: '22111', name: 'MARCOS CALDAS', party: 'PL', partyName: 'PARTIDO LIBERAL', position: 'Deputado Estadual', totalVotes: 36890 },
    { number: '55222', name: 'OTHELINO NETO', party: 'PSD', partyName: 'PARTIDO SOCIAL DEMOCRÁTICO', position: 'Deputado Estadual', totalVotes: 35214 },
    { number: '40000', name: 'ADELMO SOARES', party: 'PSB', partyName: 'PARTIDO SOCIALISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 34127 },
    { number: '11333', name: 'CÁSSIO PALHANO', party: 'PP', partyName: 'PROGRESSISTAS', position: 'Deputado Estadual', totalVotes: 33876 },
    { number: '10444', name: 'DUARTE JUNIOR', party: 'REPUBLICANOS', partyName: 'REPUBLICANOS', position: 'Deputado Estadual', totalVotes: 31245 },
    { number: '44555', name: 'ROBERTO COSTA', party: 'UNIÃO', partyName: 'UNIÃO BRASIL', position: 'Deputado Estadual', totalVotes: 29876 },
    { number: '20666', name: 'LEVI PONTES', party: 'PODE', partyName: 'PODEMOS', position: 'Deputado Estadual', totalVotes: 27543 },
    { number: '65777', name: 'ANA REGINA SOUSA', party: 'PCdoB', partyName: 'PARTIDO COMUNISTA DO BRASIL', position: 'Deputado Estadual', totalVotes: 25890 },
    { number: '12888', name: 'JOSUÉ RAMOS', party: 'PDT', partyName: 'PARTIDO DEMOCRÁTICO TRABALHISTA', position: 'Deputado Estadual', totalVotes: 23456 },
    { number: '43999', name: 'MARCOS VINÍCIUS SILVA', party: 'PV', partyName: 'PARTIDO VERDE', position: 'Deputado Estadual', totalVotes: 19876 },
    { number: '50111', name: 'ILMA GUIMARÃES', party: 'PSOL', partyName: 'PARTIDO SOCIALISMO E LIBERDADE', position: 'Deputado Estadual', totalVotes: 16543 },
    { number: '70222', name: 'MARCOS AURÉLIO RAMOS', party: 'AVANTE', partyName: 'AVANTE', position: 'Deputado Estadual', totalVotes: 14321 },
    { number: '33333', name: 'PEDRO LUCAS FERNANDES', party: 'PMN', partyName: 'PARTIDO DA MOBILIZAÇÃO NACIONAL', position: 'Deputado Estadual', totalVotes: 11234 },
    { number: '77444', name: 'RITA BARROS', party: 'SOLID', partyName: 'SOLIDARIEDADE', position: 'Deputado Estadual', totalVotes: 8765 },
    { number: '36555', name: 'JORGE CARVALHO', party: 'AGIR', partyName: 'AGIR', position: 'Deputado Estadual', totalVotes: 6543 },
    { number: '30666', name: 'ANTÔNIO BRITO NETO', party: 'NOVO', partyName: 'PARTIDO NOVO', position: 'Deputado Estadual', totalVotes: 4321 },
];

const TOTAL_VOTES = DEPUTADO_CANDIDATES.reduce((sum, c) => sum + c.totalVotes, 0);

// ==================== FUNÇÕES MOCK ====================

export function getMockDeputadoSummary() {
    return {
        totalVotes: TOTAL_VOTES,
        byPosition: [{ position: 'Deputado Estadual', total: TOTAL_VOTES.toString() }],
        zonesCount: 4,
        sectionsCount: 180,
    };
}

export function getMockDeputadoPartyData(): MockPartyData[] {
    // Agrupar por partido
    const partyMap = new Map<string, { party: string; partyName: string; totalVotes: number; count: number }>();
    DEPUTADO_CANDIDATES.forEach(c => {
        const existing = partyMap.get(c.party);
        if (existing) {
            existing.totalVotes += c.totalVotes;
            existing.count++;
        } else {
            partyMap.set(c.party, { party: c.party, partyName: c.partyName, totalVotes: c.totalVotes, count: 1 });
        }
    });

    return Array.from(partyMap.values())
        .map(p => ({
            party: p.party,
            partyName: p.partyName,
            totalVotes: p.totalVotes,
            candidatesCount: p.count,
            percentage: ((p.totalVotes / TOTAL_VOTES) * 100).toFixed(2),
        }))
        .sort((a, b) => b.totalVotes - a.totalVotes);
}

export function getMockDeputadoTopCandidates(limit: number = 10): MockCandidate[] {
    return DEPUTADO_CANDIDATES.slice(0, limit).map((c, i) => ({ ...c, rank: i + 1 }));
}

export function getMockDeputadoPositions(): string[] {
    return ['Deputado Estadual'];
}

export function getMockDeputadoZones(): number[] {
    return [83, 84, 85, 86];
}

export function getMockDeputadoRanking(limit: number = 100): MockCandidate[] {
    return DEPUTADO_CANDIDATES.slice(0, limit).map((c, i) => ({ ...c, rank: i + 1 }));
}

export function getMockDeputadoCandidates(): MockCandidate[] {
    return [...DEPUTADO_CANDIDATES];
}

export function getMockDeputadoInsights() {
    const topCandidate = DEPUTADO_CANDIDATES[0];
    const runnerUp = DEPUTADO_CANDIDATES[1];
    const voteDiff = topCandidate.totalVotes - runnerUp.totalVotes;

    return {
        topCandidate: { ...topCandidate, rank: 1 },
        runnerUp: { ...runnerUp, rank: 2 },
        voteDifference: voteDiff,
        percentageDifference: ((voteDiff / runnerUp.totalVotes) * 100).toFixed(1),
        topSection: { zone: 83, section: 15, votes: 892 },
        lowSection: { zone: 86, section: 42, votes: 23 },
        leadersByZone: [
            { zone: 83, leader: { name: topCandidate.name, number: topCandidate.number, party: topCandidate.party, votes: '14520' } },
            { zone: 84, leader: { name: topCandidate.name, number: topCandidate.number, party: topCandidate.party, votes: '12340' } },
            { zone: 85, leader: { name: runnerUp.name, number: runnerUp.number, party: runnerUp.party, votes: '11200' } },
            { zone: 86, leader: { name: DEPUTADO_CANDIDATES[2].name, number: DEPUTADO_CANDIDATES[2].number, party: DEPUTADO_CANDIDATES[2].party, votes: '10500' } },
        ],
        concentrationRate: '26.8',
        totalCandidates: DEPUTADO_CANDIDATES.length,
        totalSections: 180,
    };
}

export function getMockDeputadoByZone(): MockZoneData[] {
    const zones = [83, 84, 85, 86];
    const weights = [0.30, 0.28, 0.22, 0.20];
    return zones.map((zone, i) => ({
        zone,
        totalVotes: Math.floor(TOTAL_VOTES * weights[i]),
        sectionsCount: 45,
    }));
}

export function getMockDeputadoBySection(zone?: number): MockSectionData[] {
    const zones = zone ? [zone] : [83, 84, 85, 86];
    const result: MockSectionData[] = [];

    for (const z of zones) {
        const numSections = 45;
        const zoneTotal = Math.floor(TOTAL_VOTES * (z === 83 ? 0.30 : z === 84 ? 0.28 : z === 85 ? 0.22 : 0.20));
        let remaining = zoneTotal;

        for (let s = 1; s <= numSections; s++) {
            const votes = s === numSections ? remaining : Math.floor(remaining / (numSections - s + 1) * (0.6 + Math.random() * 0.8));
            const actual = Math.min(votes, remaining);
            if (actual > 0) {
                result.push({ zone: z, section: s, totalVotes: actual });
                remaining -= actual;
            }
        }
    }

    return result;
}

export function getMockCandidateByZone(candidateNumber: string) {
    const candidate = DEPUTADO_CANDIDATES.find(c => c.number === candidateNumber);
    if (!candidate) return [];

    const zones = [83, 84, 85, 86];
    // Adelmo Soares: forte nas zonas 83 e 84
    const weights = candidateNumber === '40000'
        ? [0.35, 0.30, 0.20, 0.15]
        : [0.25 + Math.random() * 0.05, 0.25 + Math.random() * 0.05, 0.25 - Math.random() * 0.05, 0];

    // Normalizar pesos
    const sumW = weights.slice(0, 3).reduce((a, b) => a + b, 0);
    weights[3] = 1 - sumW;

    return zones.map((zone, i) => ({
        zone,
        votes: Math.floor(candidate.totalVotes * weights[i]).toString(),
    }));
}

export function getMockCandidateBySection(candidateNumber: string, zone?: number) {
    const candidate = DEPUTADO_CANDIDATES.find(c => c.number === candidateNumber);
    if (!candidate) return [];

    const zoneData = getMockCandidateByZone(candidateNumber);
    const result: { zone: number; section: number; votes: number }[] = [];

    const targetZones = zone ? zoneData.filter(z => z.zone === zone) : zoneData;

    for (const zd of targetZones) {
        const zoneVotes = parseInt(zd.votes);
        const numSections = 30 + Math.floor(Math.random() * 15);
        let remaining = zoneVotes;

        for (let s = 1; s <= numSections && remaining > 0; s++) {
            const votes = s === numSections ? remaining : Math.max(1, Math.floor(remaining / (numSections - s + 1) * (0.4 + Math.random() * 1.2)));
            const actual = Math.min(votes, remaining);
            if (actual > 0) {
                result.push({ zone: zd.zone, section: s, votes: actual });
                remaining -= actual;
            }
        }
    }

    return result;
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

export function getMockDeputadoCityData(): MockCityData[] {
    const cities: MockCityData[] = [
        { city: 'São Luís', state: 'MA', totalVotes: 98540, zonesCount: 12, sectionsCount: 420, percentage: '20.1', topCandidate: { name: 'WELLINGTON DO CURSO', party: 'PSB', votes: 12340 } },
        { city: 'Imperatriz', state: 'MA', totalVotes: 62315, zonesCount: 6, sectionsCount: 210, percentage: '12.7', topCandidate: { name: 'YGLÉSIO MOYSES', party: 'PT', votes: 8920 } },
        { city: 'São José de Ribamar', state: 'MA', totalVotes: 45230, zonesCount: 4, sectionsCount: 150, percentage: '9.2', topCandidate: { name: 'FERNANDO PESSOA', party: 'MDB', votes: 6540 } },
        { city: 'Timon', state: 'MA', totalVotes: 38760, zonesCount: 3, sectionsCount: 130, percentage: '7.9', topCandidate: { name: 'MARCOS CALDAS', party: 'PL', votes: 5890 } },
        { city: 'Caxias', state: 'MA', totalVotes: 34500, zonesCount: 3, sectionsCount: 115, percentage: '7.0', topCandidate: { name: 'ADELMO SOARES', party: 'PSB', votes: 8430 } },
        { city: 'Codó', state: 'MA', totalVotes: 28940, zonesCount: 2, sectionsCount: 95, percentage: '5.9', topCandidate: { name: 'ADELMO SOARES', party: 'PSB', votes: 7250 } },
        { city: 'Paço do Lumiar', state: 'MA', totalVotes: 26780, zonesCount: 2, sectionsCount: 88, percentage: '5.5', topCandidate: { name: 'OTHELINO NETO', party: 'PSD', votes: 4320 } },
        { city: 'Açailândia', state: 'MA', totalVotes: 24560, zonesCount: 2, sectionsCount: 82, percentage: '5.0', topCandidate: { name: 'DUARTE JUNIOR', party: 'REPUBLICANOS', votes: 3980 } },
        { city: 'Bacabal', state: 'MA', totalVotes: 21340, zonesCount: 2, sectionsCount: 72, percentage: '4.4', topCandidate: { name: 'ADELMO SOARES', party: 'PSB', votes: 5670 } },
        { city: 'Balsas', state: 'MA', totalVotes: 18920, zonesCount: 2, sectionsCount: 64, percentage: '3.9', topCandidate: { name: 'ROBERTO COSTA', party: 'UNIÃO', votes: 3210 } },
        { city: 'Santa Inês', state: 'MA', totalVotes: 16540, zonesCount: 1, sectionsCount: 55, percentage: '3.4', topCandidate: { name: 'ADELMO SOARES', party: 'PSB', votes: 4890 } },
        { city: 'Chapadinha', state: 'MA', totalVotes: 14320, zonesCount: 1, sectionsCount: 48, percentage: '2.9', topCandidate: { name: 'CÁSSIO PALHANO', party: 'PP', votes: 2780 } },
        { city: 'Pinheiro', state: 'MA', totalVotes: 12890, zonesCount: 1, sectionsCount: 43, percentage: '2.6', topCandidate: { name: 'ADELMO SOARES', party: 'PSB', votes: 3540 } },
        { city: 'Lago da Pedra', state: 'MA', totalVotes: 10450, zonesCount: 1, sectionsCount: 35, percentage: '2.1', topCandidate: { name: 'LEVI PONTES', party: 'PODE', votes: 2340 } },
        { city: 'Zé Doca', state: 'MA', totalVotes: 8320, zonesCount: 1, sectionsCount: 28, percentage: '1.7', topCandidate: { name: 'ANA REGINA SOUSA', party: 'PCdoB', votes: 1890 } },
    ];
    return cities;
}

export function getMockDeputadoCityDetails(cityName: string) {
    const cities = getMockDeputadoCityData();
    const city = cities.find(c => c.city === cityName);
    if (!city) return null;

    // Top candidatos na cidade
    const ranking = DEPUTADO_CANDIDATES.slice(0, 8).map((c, i) => {
        const baseVotes = Math.floor(city.totalVotes * (0.18 - i * 0.018) * (0.8 + Math.random() * 0.4));
        return {
            name: c.name,
            number: c.number,
            party: c.party,
            totalVotes: Math.max(baseVotes, 50 + Math.floor(Math.random() * 200)),
        };
    }).sort((a, b) => b.totalVotes - a.totalVotes);

    return {
        city: city.city,
        state: city.state,
        totalVotes: city.totalVotes,
        zonesCount: city.zonesCount,
        sectionsCount: city.sectionsCount,
        ranking,
    };
}

export function getMockDeputadoVotesByCity(candidateNumber: string) {
    const candidate = DEPUTADO_CANDIDATES.find(c => c.number === candidateNumber);
    if (!candidate) return [];

    const cities = getMockDeputadoCityData();
    const isAdelmo = candidateNumber === '40000';

    // Pesos por cidade — Adelmo tem fortalezas em Caxias, Codó, Bacabal, Santa Inês, Pinheiro
    const adelmoWeights: Record<string, number> = {
        'São Luís': 0.08, 'Imperatriz': 0.05, 'São José de Ribamar': 0.04,
        'Timon': 0.03, 'Caxias': 0.18, 'Codó': 0.16,
        'Paço do Lumiar': 0.03, 'Açailândia': 0.02, 'Bacabal': 0.14,
        'Balsas': 0.02, 'Santa Inês': 0.10, 'Chapadinha': 0.03,
        'Pinheiro': 0.07, 'Lago da Pedra': 0.03, 'Zé Doca': 0.02,
    };

    // Gerar distribuição para outros candidatos baseada no tamanho da cidade
    const result = cities.map(city => {
        let votes: number;
        if (isAdelmo) {
            const weight = adelmoWeights[city.city] || 0.03;
            votes = Math.floor(candidate.totalVotes * weight);
        } else {
            // Distribuição proporcional ao tamanho da cidade com variação
            const cityShare = city.totalVotes / cities.reduce((s, c) => s + c.totalVotes, 0);
            const variation = 0.6 + Math.random() * 0.8;
            votes = Math.floor(candidate.totalVotes * cityShare * variation);
        }

        return {
            city: city.city,
            state: city.state,
            votes: Math.max(votes, 10),
            percentage: '0',
            isStronghold: false,
        };
    });

    // Calcular porcentagens e marcar fortalezas
    const totalCandVotes = result.reduce((s, r) => s + r.votes, 0);
    const avgVotes = totalCandVotes / result.length;

    result.forEach(r => {
        r.percentage = ((r.votes / totalCandVotes) * 100).toFixed(1);
        r.isStronghold = r.votes > avgVotes * 1.3;
    });

    // Ordenar por votos (descrescente)
    result.sort((a, b) => b.votes - a.votes);

    return result;
}

export function getMockDeputadoComparison(candidate1Number: string, candidate2Number: string) {
    const c1 = DEPUTADO_CANDIDATES.find(c => c.number === candidate1Number);
    const c2 = DEPUTADO_CANDIDATES.find(c => c.number === candidate2Number);
    if (!c1 || !c2) return null;

    const c1CityVotes = getMockDeputadoVotesByCity(candidate1Number);
    const c2CityVotes = getMockDeputadoVotesByCity(candidate2Number);

    let c1CitiesWon = 0;
    let c2CitiesWon = 0;

    const comparison = c1CityVotes.map(cv1 => {
        const cv2 = c2CityVotes.find(cv => cv.city === cv1.city);
        const c2Votes = cv2?.votes || 0;
        const winner = cv1.votes > c2Votes ? 1 : cv1.votes < c2Votes ? 2 : 0;
        if (winner === 1) c1CitiesWon++;
        if (winner === 2) c2CitiesWon++;

        return {
            city: cv1.city,
            candidate1Votes: cv1.votes,
            candidate2Votes: c2Votes,
            winner,
        };
    });

    // Ordenar pelo total de votos na cidade (maior primeiro)
    comparison.sort((a, b) => (b.candidate1Votes + b.candidate2Votes) - (a.candidate1Votes + a.candidate2Votes));

    return {
        candidate1: {
            name: c1.name,
            party: c1.party,
            number: c1.number,
            totalVotes: c1.totalVotes,
            citiesWon: c1CitiesWon,
        },
        candidate2: {
            name: c2.name,
            party: c2.party,
            number: c2.number,
            totalVotes: c2.totalVotes,
            citiesWon: c2CitiesWon,
        },
        overallWinner: c1.totalVotes > c2.totalVotes ? 1 : 2,
        comparison,
    };
}

// ==================== ANÁLISE COMPLETA ADELMO SOARES ====================

export function getAdelmoSoaresCompleteInsights() {
    const adelmo = DEPUTADO_CANDIDATES.find(c => c.number === '40000')!;
    const allCandidates = [...DEPUTADO_CANDIDATES].sort((a, b) => b.totalVotes - a.totalVotes);
    const adelmoRank = allCandidates.findIndex(c => c.number === '40000') + 1;
    const percentage = ((adelmo.totalVotes / TOTAL_VOTES) * 100).toFixed(2);

    // Candidatos à frente de Adelmo
    const candidatesAhead = allCandidates.filter(c => c.totalVotes > adelmo.totalVotes);
    // Candidato logo acima dele
    const candidateAbove = candidatesAhead.length > 0 ? candidatesAhead[candidatesAhead.length - 1] : null;
    const votesNeededForNextRank = candidateAbove ? candidateAbove.totalVotes - adelmo.totalVotes + 1 : 0;

    // Candidato logo abaixo dele
    const candidateBelow = allCandidates[adelmoRank] || null;
    const advantage = candidateBelow ? adelmo.totalVotes - candidateBelow.totalVotes : 0;

    // Distribuição por zona (Adelmo forte nas zonas 83 e 84)
    const zoneDistribution = [
        { zone: 83, votes: 11944, percentage: 35.0, isStronghold: true, position: 3 },
        { zone: 84, votes: 10238, percentage: 30.0, isStronghold: true, position: 4 },
        { zone: 85, votes: 6825, percentage: 20.0, isStronghold: false, position: 7 },
        { zone: 86, votes: 5120, percentage: 15.0, isStronghold: false, position: 8 },
    ];

    // Top 5 seções de Adelmo
    const topSections = [
        { zone: 83, section: 15, votes: 892, localName: 'Piçarreira' },
        { zone: 83, section: 8, votes: 756, localName: 'Centro' },
        { zone: 84, section: 22, votes: 698, localName: 'Fátima' },
        { zone: 83, section: 31, votes: 645, localName: 'São Benedito' },
        { zone: 84, section: 11, votes: 612, localName: 'Reis Veloso' },
    ];

    // Piores seções
    const weakSections = [
        { zone: 86, section: 42, votes: 23, localName: 'Tabuleiro' },
        { zone: 86, section: 38, votes: 31, localName: 'Ilha Grande' },
        { zone: 85, section: 55, votes: 45, localName: 'Pirajá' },
    ];

    // Análise SWOT
    const swot = {
        strengths: [
            'Forte base na Zona 83 — 35% dos votos concentrados',
            'Presença consolidada na Zona 84 com 30% dos votos',
            'Partido PSB com 2 candidatos, gerando capilaridade partidária',
            'Boa penetração em seções urbanas centrais (Piçarreira, Centro, Fátima)',
            'Total de 34.127 votos — base eleitoral expressiva',
        ],
        weaknesses: [
            'Desempenho baixo nas Zonas 85 e 86 — juntas somam apenas 35%',
            `${adelmoRank}º colocado geral — ${candidatesAhead.length} candidatos à frente`,
            `Diferença de ${votesNeededForNextRank.toLocaleString('pt-BR')} votos para subir no ranking`,
            'Fragilidade em seções periféricas (Tabuleiro, Ilha Grande)',
            'Concentração excessiva pode significar teto de crescimento nas redondezas já exploradas',
        ],
        opportunities: [
            `Zona 85: potencial de crescimento — atualmente apenas 20% dos votos de Adelmo`,
            `Zona 86: território pouco explorado com potencial de +3.000 votos`,
            'Alianças com candidatos menores de partidos aliados (PV, PDT, PMN)',
            'Seções de baixo desempenho podem ser trabalhadas com ações diretas',
            'Crescimento no interior do município com presença parlamentar ativa',
        ],
        threats: [
            `${candidateAbove?.name || 'Candidato acima'} (${candidateAbove?.party || '-'}) está apenas ${votesNeededForNextRank.toLocaleString('pt-BR')} votos à frente`,
            `${candidateBelow?.name || 'Candidato abaixo'} (${candidateBelow?.party || '-'}) está apenas ${advantage.toLocaleString('pt-BR')} votos atrás — margem apertada`,
            'Competição forte do PSB interno — Wellington do Curso lidera com 48.932 votos',
            'Pulverização de votos em zonas periféricas entre muitos candidatos',
            'Risco de perda de base se não manter presença ativa nas Zonas 83/84',
        ],
    };

    // Recomendações estratégicas
    const recommendations = [
        {
            priority: 'ALTA',
            title: 'Fortalecer presença nas Zonas 85 e 86',
            description: 'Realizar eventos, visitas e ações parlamentares direcionadas. Potencial de ganho estimado: +3.000 a +5.000 votos.',
            icon: 'map',
            color: '#EF4444',
        },
        {
            priority: 'ALTA',
            title: 'Reduzir gap para o 5º lugar',
            description: `Precisa de mais ${votesNeededForNextRank.toLocaleString('pt-BR')} votos para ultrapassar ${candidateAbove?.name || 'o candidato acima'}. Focar em seções de baixo desempenho.`,
            icon: 'trending-up',
            color: '#EF4444',
        },
        {
            priority: 'MÉDIA',
            title: 'Proteger base nas Zonas 83 e 84',
            description: 'Manter relacionamento ativo com lideranças locais. Estas zonas representam 65% do eleitorado de Adelmo.',
            icon: 'shield',
            color: '#F59E0B',
        },
        {
            priority: 'MÉDIA',
            title: 'Trabalhar seções de baixo desempenho',
            description: 'As 10 piores seções somam menos de 500 votos. Ações pontuais podem dobrar o resultado nestas áreas.',
            icon: 'target',
            color: '#F59E0B',
        },
        {
            priority: 'BAIXA',
            title: 'Articulação partidária PSB',
            description: 'Buscar apoio da estrutura de Wellington do Curso (PSB) para compartilhar bases em áreas com baixa penetração.',
            icon: 'users',
            color: '#3B82F6',
        },
    ];

    // Análise comparativa com concorrentes diretos
    const competitorComparison = [
        {
            name: candidateAbove?.name || '',
            party: candidateAbove?.party || '',
            votes: candidateAbove?.totalVotes || 0,
            difference: -(votesNeededForNextRank - 1),
            status: 'À FRENTE' as const,
        },
        {
            name: adelmo.name,
            party: adelmo.party,
            votes: adelmo.totalVotes,
            difference: 0,
            status: 'VOCÊ' as const,
        },
        {
            name: candidateBelow?.name || '',
            party: candidateBelow?.party || '',
            votes: candidateBelow?.totalVotes || 0,
            difference: advantage,
            status: 'ATRÁS' as const,
        },
    ];

    // Métricas de performance
    const performanceMetrics = {
        totalVotes: adelmo.totalVotes,
        rank: adelmoRank,
        totalCandidates: DEPUTADO_CANDIDATES.length,
        percentage: parseFloat(percentage),
        strongestZone: { zone: 83, votes: 11944, percentage: 35.0 },
        weakestZone: { zone: 86, votes: 5120, percentage: 15.0 },
        bestSection: { zone: 83, section: 15, votes: 892 },
        worstSection: { zone: 86, section: 42, votes: 23 },
        votesNeededForNextRank,
        advantageOverBelow: advantage,
        partyRankWithinPSB: 2, // Wellington é 1º
        PSBTotalVotes: 83059, // 48932 + 34127
        PSBPercentage: ((83059 / TOTAL_VOTES) * 100).toFixed(1),
        avgVotesPerZone: Math.floor(adelmo.totalVotes / 4),
        avgVotesPerSection: Math.floor(adelmo.totalVotes / 180),
        voteConcentrationIndex: 65, // 65% dos votos nas 2 maiores zonas
    };

    return {
        candidate: adelmo,
        rank: adelmoRank,
        performanceMetrics,
        zoneDistribution,
        topSections,
        weakSections,
        swot,
        recommendations,
        competitorComparison,
    };
}

// ==================== PROJEÇÕES POLÍTICAS ====================

export interface ProjectionScenario {
    id: string;
    name: string;
    description: string;
    icon: string;
    adjustments: Record<string, number>; // city -> multiplier (1.0 = no change, 1.2 = +20%)
}

export interface ProjectionCityResult {
    city: string;
    currentVotes: number;
    projectedVotes: number;
    difference: number;
    percentChange: number;
}

export interface ProjectionResult {
    candidate: MockCandidate;
    currentTotalVotes: number;
    projectedTotalVotes: number;
    voteDifference: number;
    currentRanking: number;
    projectedRanking: number;
    rankingChange: number; // positive = subiu, negative = caiu
    currentPercentage: string;
    projectedPercentage: string;
    goalVotes: number; // votos necessários para top 5
    goalProgress: number; // 0-100
    cityResults: ProjectionCityResult[];
}

const PROJECTION_CITIES = [
    'São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias',
    'Codó', 'Paço do Lumiar', 'Açailândia', 'Bacabal', 'Balsas',
    'Santa Inês', 'Chapadinha', 'Pinheiro', 'Lago da Pedra', 'Zé Doca',
];

export function getProjectionScenarios(): ProjectionScenario[] {
    const defaultAdj = Object.fromEntries(PROJECTION_CITIES.map(c => [c, 1.0]));

    return [
        {
            id: 'otimista',
            name: 'Otimista',
            description: '+20% em todas as cidades',
            icon: '🚀',
            adjustments: Object.fromEntries(PROJECTION_CITIES.map(c => [c, 1.20])),
        },
        {
            id: 'conservador',
            name: 'Conservador',
            description: 'Mantém votos atuais',
            icon: '📊',
            adjustments: { ...defaultAdj },
        },
        {
            id: 'pessimista',
            name: 'Pessimista',
            description: '-15% em todas as cidades',
            icon: '⚠️',
            adjustments: Object.fromEntries(PROJECTION_CITIES.map(c => [c, 0.85])),
        },
        {
            id: 'foco_regional',
            name: 'Foco Regional',
            description: '+40% fortalezas, -10% demais',
            icon: '🎯',
            adjustments: Object.fromEntries(PROJECTION_CITIES.map(c => {
                const strongholds = ['Caxias', 'Codó', 'Bacabal', 'Santa Inês', 'Pinheiro'];
                return [c, strongholds.includes(c) ? 1.40 : 0.90];
            })),
        },
        {
            id: 'expansao_capital',
            name: 'Expansão Capital',
            description: '+50% São Luís, mantém demais',
            icon: '🏙️',
            adjustments: Object.fromEntries(PROJECTION_CITIES.map(c => [c, c === 'São Luís' ? 1.50 : 1.0])),
        },
    ];
}

export function getProjectionBaseData(candidateNumber: string) {
    const candidate = DEPUTADO_CANDIDATES.find(c => c.number === candidateNumber);
    if (!candidate) return null;

    const cityVotes = getMockDeputadoVotesByCity(candidateNumber);
    return {
        candidate,
        cityVotes,
        totalVotes: candidate.totalVotes,
        ranking: [...DEPUTADO_CANDIDATES].sort((a, b) => b.totalVotes - a.totalVotes).findIndex(c => c.number === candidateNumber) + 1,
    };
}

export function calculateProjection(
    candidateNumber: string,
    adjustments: Record<string, number>,
): ProjectionResult | null {
    const candidate = DEPUTADO_CANDIDATES.find(c => c.number === candidateNumber);
    if (!candidate) return null;

    const cityVotes = getMockDeputadoVotesByCity(candidateNumber);

    // Calcular votos projetados por cidade
    const cityResults: ProjectionCityResult[] = cityVotes.map(cv => {
        const multiplier = adjustments[cv.city] ?? 1.0;
        const projectedVotes = Math.round(cv.votes * multiplier);
        return {
            city: cv.city,
            currentVotes: cv.votes,
            projectedVotes,
            difference: projectedVotes - cv.votes,
            percentChange: ((multiplier - 1) * 100),
        };
    });

    const currentTotalVotes = cityVotes.reduce((s, cv) => s + cv.votes, 0);
    const projectedTotalVotes = cityResults.reduce((s, cr) => s + cr.projectedVotes, 0);

    // Ranking atual
    const sortedCandidates = [...DEPUTADO_CANDIDATES].sort((a, b) => b.totalVotes - a.totalVotes);
    const currentRanking = sortedCandidates.findIndex(c => c.number === candidateNumber) + 1;

    // Ranking projetado (simular substituindo o total do candidato)
    const projectedList = sortedCandidates.map(c => ({
        number: c.number,
        votes: c.number === candidateNumber ? projectedTotalVotes : c.totalVotes,
    }));
    projectedList.sort((a, b) => b.votes - a.votes);
    const projectedRanking = projectedList.findIndex(c => c.number === candidateNumber) + 1;

    // Meta: votos do 5º colocado
    const fifthPlace = sortedCandidates[4];
    const goalVotes = fifthPlace ? fifthPlace.totalVotes : 0;
    const goalProgress = Math.min(100, (projectedTotalVotes / goalVotes) * 100);

    const projectedTotalAll = TOTAL_VOTES - currentTotalVotes + projectedTotalVotes;

    return {
        candidate,
        currentTotalVotes,
        projectedTotalVotes,
        voteDifference: projectedTotalVotes - currentTotalVotes,
        currentRanking,
        projectedRanking,
        rankingChange: currentRanking - projectedRanking, // positive = subiu
        currentPercentage: ((currentTotalVotes / TOTAL_VOTES) * 100).toFixed(2),
        projectedPercentage: ((projectedTotalVotes / projectedTotalAll) * 100).toFixed(2),
        goalVotes,
        goalProgress,
        cityResults,
    };
}

// Verifica se uma posição é mock (Deputado Estadual)
export function isDeputadoPosition(position?: string | null): boolean {
    return position === 'Deputado Estadual';
}
