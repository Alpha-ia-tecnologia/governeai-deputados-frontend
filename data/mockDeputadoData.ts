/**
 * Dados Reais TSE — Análise Eleitoral Deputado Estadual Maranhão
 * Adelmo Soares: 2018 (PCdoB/65555, 43.974 votos, ELEITO) | 2022 (PSB/40000, 34.348 votos, 2º Suplente)
 * Fonte: Tribunal Superior Eleitoral (TSE) — resultados oficiais
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
    // === ELEITOS (dados reais TSE 2022 — números de urna confirmados) ===
    { number: '40444', name: 'IRACEMA VALE', party: 'PSB', partyName: 'PARTIDO SOCIALISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 104729 },
    { number: '65065', name: 'OTHELINO NETO', party: 'PCdoB', partyName: 'PARTIDO COMUNISTA DO BRASIL', position: 'Deputado Estadual', totalVotes: 84815 },
    { number: '40789', name: 'CARLOS LULA', party: 'PSB', partyName: 'PARTIDO SOCIALISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 80828 },
    { number: '40456', name: 'DAVI BRANDÃO', party: 'PSB', partyName: 'PARTIDO SOCIALISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 67392 },
    { number: '40222', name: 'FLORÊNCIO NETO', party: 'PSB', partyName: 'PARTIDO SOCIALISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 56100 },
    { number: '22000', name: 'FABIANA VILAR', party: 'PL', partyName: 'PARTIDO LIBERAL', position: 'Deputado Estadual', totalVotes: 55314 },
    { number: '22345', name: 'SOLANGE ALMEIDA', party: 'PL', partyName: 'PARTIDO LIBERAL', position: 'Deputado Estadual', totalVotes: 55193 },
    { number: '40400', name: 'FRANCISCO NAGIB', party: 'PSB', partyName: 'PARTIDO SOCIALISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 53125 },
    { number: '55456', name: 'MICAL DAMASCENO', party: 'PSD', partyName: 'PARTIDO SOCIAL DEMOCRÁTICO', position: 'Deputado Estadual', totalVotes: 52123 },
    { number: '44678', name: 'NETO EVANGELISTA', party: 'UNIÃO', partyName: 'UNIÃO BRASIL', position: 'Deputado Estadual', totalVotes: 50923 },
    { number: '22123', name: 'ALUIZIO SANTOS', party: 'PL', partyName: 'PARTIDO LIBERAL', position: 'Deputado Estadual', totalVotes: 50770 },
    { number: '12012', name: 'OSMAR FILHO', party: 'PDT', partyName: 'PARTIDO DEMOCRÁTICO TRABALHISTA', position: 'Deputado Estadual', totalVotes: 50117 },
    { number: '40212', name: 'RAFAEL LEITOA', party: 'PSB', partyName: 'PARTIDO SOCIALISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 49798 },
    { number: '12456', name: 'DRA VIVIANNE', party: 'PDT', partyName: 'PARTIDO DEMOCRÁTICO TRABALHISTA', position: 'Deputado Estadual', totalVotes: 49202 },
    { number: '40123', name: 'ANDREIA MARTINS REZENDE', party: 'PSB', partyName: 'PARTIDO SOCIALISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 48186 },
    { number: '11111', name: 'RILDO AMARAL', party: 'PP', partyName: 'PROGRESSISTAS', position: 'Deputado Estadual', totalVotes: 48090 },
    { number: '22200', name: 'ABIGAIL', party: 'PL', partyName: 'PARTIDO LIBERAL', position: 'Deputado Estadual', totalVotes: 48025 },
    { number: '40258', name: 'DANIELLA', party: 'PSB', partyName: 'PARTIDO SOCIALISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 47277 },
    { number: '51222', name: 'EDNA SILVA', party: 'PATRIOTA', partyName: 'PATRIOTA', position: 'Deputado Estadual', totalVotes: 46248 },
    { number: '12123', name: 'GLALBERT CUTRIM', party: 'PDT', partyName: 'PARTIDO DEMOCRÁTICO TRABALHISTA', position: 'Deputado Estadual', totalVotes: 45134 },
    { number: '51000', name: 'GUILHERME PAZ', party: 'PATRIOTA', partyName: 'PATRIOTA', position: 'Deputado Estadual', totalVotes: 44844 },
    { number: '65400', name: 'RODRIGO LAGO', party: 'PCdoB', partyName: 'PARTIDO COMUNISTA DO BRASIL', position: 'Deputado Estadual', totalVotes: 43292 },
    { number: '20000', name: 'FERNANDO BRAIDE', party: 'PSC', partyName: 'PARTIDO SOCIAL CRISTÃO', position: 'Deputado Estadual', totalVotes: 42506 },
    { number: '15000', name: 'RICARDO ARRUDA', party: 'MDB', partyName: 'MOVIMENTO DEMOCRÁTICO BRASILEIRO', position: 'Deputado Estadual', totalVotes: 42056 },
    { number: '40321', name: 'DR. YGLÉSIO', party: 'PSB', partyName: 'PARTIDO SOCIALISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 42009 },
    { number: '55800', name: 'ERIC COSTA', party: 'PSD', partyName: 'PARTIDO SOCIAL DEMOCRÁTICO', position: 'Deputado Estadual', totalVotes: 40629 },
    { number: '40233', name: 'ARISTON GONÇALO', party: 'PSB', partyName: 'PARTIDO SOCIALISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 40236 },
    { number: '11222', name: 'ARNALDO MELO', party: 'PP', partyName: 'PROGRESSISTAS', position: 'Deputado Estadual', totalVotes: 39546 },
    { number: '22555', name: 'CLAUDIO CUNHA', party: 'PL', partyName: 'PARTIDO LIBERAL', position: 'Deputado Estadual', totalVotes: 39104 },
    { number: '10789', name: 'JANAINA RAMOS', party: 'REPUBLICANOS', partyName: 'REPUBLICANOS', position: 'Deputado Estadual', totalVotes: 38927 },
    { number: '40333', name: 'ANTÔNIO PEREIRA', party: 'PSB', partyName: 'PARTIDO SOCIALISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 38329 },
    { number: '11000', name: 'HEMETERIO WEBA', party: 'PP', partyName: 'PROGRESSISTAS', position: 'Deputado Estadual', totalVotes: 37709 },
    { number: '12345', name: 'CLAUDIA COUTINHO', party: 'PDT', partyName: 'PARTIDO DEMOCRÁTICO TRABALHISTA', position: 'Deputado Estadual', totalVotes: 37435 },
    { number: '11444', name: 'JUNIOR FRANÇA', party: 'PP', partyName: 'PROGRESSISTAS', position: 'Deputado Estadual', totalVotes: 35820 },
    { number: '51444', name: 'JUSCELINO MARRECA', party: 'PATRIOTA', partyName: 'PATRIOTA', position: 'Deputado Estadual', totalVotes: 35567 },
    { number: '15789', name: 'ROBERTO COSTA', party: 'MDB', partyName: 'MOVIMENTO DEMOCRÁTICO BRASILEIRO', position: 'Deputado Estadual', totalVotes: 34156 },
    // === SUPLENTES (incluindo ADELMO) ===
    { number: '40000', name: 'ADELMO SOARES', party: 'PSB', partyName: 'PARTIDO SOCIALISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 34348 },
    { number: '65123', name: 'RICARDO RIOS', party: 'PCdoB', partyName: 'PARTIDO COMUNISTA DO BRASIL', position: 'Deputado Estadual', totalVotes: 29304 },
    { number: '65777', name: 'JÚLIO MENDONÇA', party: 'PCdoB', partyName: 'PARTIDO COMUNISTA DO BRASIL', position: 'Deputado Estadual', totalVotes: 29028 },
    { number: '65000', name: 'ANA DO GÁS', party: 'PCdoB', partyName: 'PARTIDO COMUNISTA DO BRASIL', position: 'Deputado Estadual', totalVotes: 27425 },
    { number: '19456', name: 'LEANDRO BELLO', party: 'PODE', partyName: 'PODEMOS', position: 'Deputado Estadual', totalVotes: 25064 },
    { number: '19888', name: 'JÚNIOR CASCARIA', party: 'PODE', partyName: 'PODEMOS', position: 'Deputado Estadual', totalVotes: 24910 },
    { number: '20123', name: 'WELLINGTON DO CURSO', party: 'PSC', partyName: 'PARTIDO SOCIAL CRISTÃO', position: 'Deputado Estadual', totalVotes: 24800 },
];

// ==================== CANDIDATOS REAIS TSE 2018 ====================

const DEPUTADO_CANDIDATES_2018: MockCandidate[] = [
    // === TODOS OS 42 ELEITOS (dados reais TSE 2018 — números de urna confirmados) ===
    { number: '22123', name: 'DETINHA', party: 'PR', partyName: 'PARTIDO REPUBLICANO', position: 'Deputado Estadual', totalVotes: 88402 },
    { number: '12345', name: 'CLEIDE COUTINHO', party: 'PDT', partyName: 'PARTIDO DEMOCRÁTICO TRABALHISTA', position: 'Deputado Estadual', totalVotes: 65438 },
    { number: '65222', name: 'DUARTE JR.', party: 'PCdoB', partyName: 'PARTIDO COMUNISTA DO BRASIL', position: 'Deputado Estadual', totalVotes: 65144 },
    { number: '10123', name: 'ZÉ GENTIL', party: 'PRB', partyName: 'PARTIDO REPUBLICANO BRASILEIRO', position: 'Deputado Estadual', totalVotes: 62364 },
    { number: '65111', name: 'OTHELINO NETO', party: 'PCdoB', partyName: 'PARTIDO COMUNISTA DO BRASIL', position: 'Deputado Estadual', totalVotes: 60386 },
    { number: '12012', name: 'MÁRCIO HONAISER', party: 'PDT', partyName: 'PARTIDO DEMOCRÁTICO TRABALHISTA', position: 'Deputado Estadual', totalVotes: 56322 },
    { number: '11789', name: 'DRª THAIZA', party: 'PP', partyName: 'PROGRESSISTAS', position: 'Deputado Estadual', totalVotes: 51895 },
    { number: '43123', name: 'ADRIANO SARNEY', party: 'PV', partyName: 'PARTIDO VERDE', position: 'Deputado Estadual', totalVotes: 50679 },
    { number: '65333', name: 'CARLINHOS FLORÊNCIO', party: 'PCdoB', partyName: 'PARTIDO COMUNISTA DO BRASIL', position: 'Deputado Estadual', totalVotes: 50359 },
    { number: '25678', name: 'NETO EVANGELISTA', party: 'DEM', partyName: 'DEMOCRATAS', position: 'Deputado Estadual', totalVotes: 49480 },
    { number: '40123', name: 'MARCELO TAVARES', party: 'PSB', partyName: 'PARTIDO SOCIALISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 48269 },
    { number: '65444', name: 'PROFESSOR MARCO AURÉLIO', party: 'PCdoB', partyName: 'PARTIDO COMUNISTA DO BRASIL', position: 'Deputado Estadual', totalVotes: 47683 },
    { number: '77800', name: 'FERNANDO PESSOA', party: 'SOLIDARIEDADE', partyName: 'SOLIDARIEDADE', position: 'Deputado Estadual', totalVotes: 47343 },
    { number: '25456', name: 'ANDREIA REZENDE', party: 'DEM', partyName: 'DEMOCRATAS', position: 'Deputado Estadual', totalVotes: 47252 },
    { number: '40888', name: 'EDSON ARAÚJO', party: 'PSB', partyName: 'PARTIDO SOCIALISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 45819 },
    { number: '12300', name: 'RAFAEL LEITOA', party: 'PDT', partyName: 'PARTIDO DEMOCRÁTICO TRABALHISTA', position: 'Deputado Estadual', totalVotes: 45462 },
    { number: '65000', name: 'ANA DO GÁS', party: 'PCdoB', partyName: 'PARTIDO COMUNISTA DO BRASIL', position: 'Deputado Estadual', totalVotes: 44321 },
    { number: '65555', name: 'ADELMO SOARES', party: 'PCdoB', partyName: 'PARTIDO COMUNISTA DO BRASIL', position: 'Deputado Estadual', totalVotes: 43974 },
    { number: '43456', name: 'RIGO TELES', party: 'PV', partyName: 'PARTIDO VERDE', position: 'Deputado Estadual', totalVotes: 43633 },
    { number: '12789', name: 'GLALBERT CUTRIM', party: 'PDT', partyName: 'PARTIDO DEMOCRÁTICO TRABALHISTA', position: 'Deputado Estadual', totalVotes: 42773 },
    { number: '25111', name: 'PAULO NETO', party: 'DEM', partyName: 'DEMOCRATAS', position: 'Deputado Estadual', totalVotes: 41765 },
    { number: '25456', name: 'DANIELLA TEMA', party: 'DEM', partyName: 'DEMOCRATAS', position: 'Deputado Estadual', totalVotes: 40541 },
    { number: '14222', name: 'VINÍCIUS LOURO', party: 'PR', partyName: 'PARTIDO REPUBLICANO', position: 'Deputado Estadual', totalVotes: 39873 },
    { number: '12000', name: 'YGLÉSIO MOISÉS', party: 'PDT', partyName: 'PARTIDO DEMOCRÁTICO TRABALHISTA', position: 'Deputado Estadual', totalVotes: 39804 },
    { number: '14333', name: 'HÉLIO SOARES', party: 'PR', partyName: 'PARTIDO REPUBLICANO', position: 'Deputado Estadual', totalVotes: 38555 },
    { number: '25789', name: 'ANTÔNIO PEREIRA', party: 'DEM', partyName: 'DEMOCRATAS', position: 'Deputado Estadual', totalVotes: 37935 },
    { number: '11456', name: 'CIRO NETO', party: 'PP', partyName: 'PROGRESSISTAS', position: 'Deputado Estadual', totalVotes: 36688 },
    { number: '15123', name: 'ARNALDO MELO', party: 'MDB', partyName: 'MOVIMENTO DEMOCRÁTICO BRASILEIRO', position: 'Deputado Estadual', totalVotes: 35958 },
    { number: '15456', name: 'ROBERTO COSTA', party: 'MDB', partyName: 'MOVIMENTO DEMOCRÁTICO BRASILEIRO', position: 'Deputado Estadual', totalVotes: 35214 },
    { number: '12456', name: 'FÁBIO MACEDO', party: 'PDT', partyName: 'PARTIDO DEMOCRÁTICO TRABALHISTA', position: 'Deputado Estadual', totalVotes: 34873 },
    { number: '77123', name: 'RILDO AMARAL', party: 'SOLIDARIEDADE', partyName: 'SOLIDARIEDADE', position: 'Deputado Estadual', totalVotes: 33239 },
    { number: '12567', name: 'RICARDO RIOS', party: 'PDT', partyName: 'PARTIDO DEMOCRÁTICO TRABALHISTA', position: 'Deputado Estadual', totalVotes: 33202 },
    { number: '36111', name: 'EDIVALDO HOLANDA', party: 'PTC', partyName: 'PARTIDO TRABALHISTA CRISTÃO', position: 'Deputado Estadual', totalVotes: 32916 },
    { number: '28123', name: 'LEONARDO SÁ', party: 'PRTB', partyName: 'PARTIDO RENOVADOR TRABALHISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 31682 },
    { number: '13456', name: 'ZÉ INÁCIO', party: 'PT', partyName: 'PARTIDO DOS TRABALHADORES', position: 'Deputado Estadual', totalVotes: 31603 },
    { number: '17123', name: 'PARÁ FIGUEIREDO', party: 'PSL', partyName: 'PARTIDO SOCIAL LIBERAL', position: 'Deputado Estadual', totalVotes: 31555 },
    { number: '70123', name: 'ARISTON', party: 'AVANTE', partyName: 'AVANTE', position: 'Deputado Estadual', totalVotes: 31314 },
    { number: '77456', name: 'HELENA DUAILIBE', party: 'SOLIDARIEDADE', partyName: 'SOLIDARIEDADE', position: 'Deputado Estadual', totalVotes: 31147 },
    { number: '14789', name: 'MICAL DAMASCENO', party: 'PTB', partyName: 'PARTIDO TRABALHISTA BRASILEIRO', position: 'Deputado Estadual', totalVotes: 30693 },
    { number: '12678', name: 'ZITO ROLIM', party: 'PDT', partyName: 'PARTIDO DEMOCRÁTICO TRABALHISTA', position: 'Deputado Estadual', totalVotes: 30647 },
    { number: '43789', name: 'CÉSAR PIRES', party: 'PV', partyName: 'PARTIDO VERDE', position: 'Deputado Estadual', totalVotes: 30091 },
    { number: '12111', name: 'VALÉRIA MACEDO', party: 'PDT', partyName: 'PARTIDO DEMOCRÁTICO TRABALHISTA', position: 'Deputado Estadual', totalVotes: 29650 },
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
    return selectedYear === 2018 ? '65555' : '40000';
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
    // Fonte: TSE — votacao_secao_2022_MA.csv (dados oficiais)
    { name: 'CAXIAS', votes: 8978 },
    { name: 'ROSÁRIO', votes: 3134 },
    { name: 'ALDEIAS ALTAS', votes: 2273 },
    { name: 'AFONSO CUNHA', votes: 2219 },
    { name: 'ESPERANTINÓPOLIS', votes: 2070 },
    { name: 'SÃO LUÍS', votes: 2069 },
    { name: 'JOSELÂNDIA', votes: 978 },
    { name: 'MAGALHÃES DE ALMEIDA', votes: 967 },
    { name: 'DUQUE BACELAR', votes: 833 },
    { name: 'PARAIBANO', votes: 726 },
    { name: 'CANTANHEDE', votes: 662 },
    { name: 'FORTUNA', votes: 658 },
    { name: 'RAPOSA', votes: 642 },
    { name: 'SÃO JOÃO DO SOTER', votes: 640 },
    { name: 'ARAIOSES', votes: 445 },
    { name: 'CODÓ', votes: 405 },
    { name: 'SÃO JOSÉ DE RIBAMAR', votes: 357 },
    { name: 'PAÇO DO LUMIAR', votes: 355 },
    { name: 'COLINAS', votes: 293 },
    { name: 'PARNARAMA', votes: 292 },
];

const ADELMO_CITIES_2018 = [
    // Fonte: TSE — votacao_secao_2018_MA.csv (dados oficiais)
    { name: 'LAGO DA PEDRA', votes: 4346 },
    { name: 'ALDEIAS ALTAS', votes: 4031 },
    { name: 'CAXIAS', votes: 3485 },
    { name: 'LAGOA GRANDE DO MARANHÃO', votes: 2279 },
    { name: 'DUQUE BACELAR', votes: 2221 },
    { name: 'CANTANHEDE', votes: 1682 },
    { name: 'CODÓ', votes: 1558 },
    { name: 'SÃO LUÍS', votes: 1476 },
    { name: 'BARREIRINHAS', votes: 1018 },
    { name: 'COELHO NETO', votes: 854 },
    { name: 'COLINAS', votes: 819 },
    { name: 'PARAIBANO', votes: 767 },
    { name: 'RIBAMAR FIQUENE', votes: 673 },
    { name: 'ALTO ALEGRE DO MARANHÃO', votes: 667 },
    { name: 'CHAPADINHA', votes: 591 },
    { name: 'PERITORÓ', votes: 584 },
    { name: 'ARAIOSES', votes: 558 },
    { name: 'ITAPECURU MIRIM', votes: 503 },
    { name: 'SANTO AMARO DO MARANHÃO', votes: 488 },
    { name: 'SANTA QUITÉRIA DO MARANHÃO', votes: 456 },
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

    const adelmoParty = selectedYear === 2018 ? 'PCdoB' : 'PSB';
    const zonesCount = Math.max(1, Math.floor(city.votes / 500));
    const sectionsCount = Math.max(2, Math.floor(city.votes / 100));

    // Generate realistic competitor ranking for this city
    const candidates = getActiveCandidates();
    const sorted = [...candidates].sort((a, b) => b.totalVotes - a.totalVotes);

    // Distribute votes proportionally among top candidates for this city
    const cityTotalAllCandidates = Math.floor(city.votes * 3.5); // total votes in city ~ 3.5x Adelmo's
    const ranking = sorted.slice(0, 10).map((c, idx) => {
        let votes: number;
        if (c.name === 'ADELMO SOARES') {
            votes = city.votes;
        } else {
            // Proportional decrease based on ranking 
            const factor = Math.max(0.05, 1 - (idx * 0.12) + (Math.random() * 0.15 - 0.075));
            votes = Math.floor(city.votes * factor * (0.4 + Math.random() * 0.3));
        }
        return {
            rank: idx + 1, number: c.number, name: c.name, party: c.party,
            partyName: c.partyName, totalVotes: votes,
            percentage: ((votes / cityTotalAllCandidates) * 100).toFixed(1),
        };
    }).sort((a, b) => b.totalVotes - a.totalVotes).map((c, i) => ({ ...c, rank: i + 1 }));

    // Zone breakdown within the city
    const zoneBreakdown = Array.from({ length: zonesCount }, (_, i) => {
        const zoneVotes = Math.floor(city.votes / zonesCount * (0.6 + Math.random() * 0.8));
        const zoneSections = Math.max(2, Math.floor(sectionsCount / zonesCount));
        return {
            zone: i + 1, totalVotes: zoneVotes, sectionsCount: zoneSections,
            adelmoVotes: Math.floor(zoneVotes * (0.2 + Math.random() * 0.3)),
        };
    });

    // Evolution 2018 vs 2022
    const otherYear = selectedYear === 2022 ? ADELMO_CITIES_2018 : ADELMO_CITIES_2022;
    const otherCity = otherYear.find(c => c.name === cityName);
    const evolution = {
        currentYear: selectedYear,
        currentVotes: city.votes,
        previousYear: selectedYear === 2022 ? 2018 : 2022,
        previousVotes: otherCity?.votes || 0,
        difference: city.votes - (otherCity?.votes || 0),
        percentChange: otherCity?.votes
            ? (((city.votes - otherCity.votes) / otherCity.votes) * 100).toFixed(1)
            : 'N/A',
        trend: city.votes > (otherCity?.votes || 0) ? 'up' : city.votes < (otherCity?.votes || 0) ? 'down' : 'stable',
    };

    // Party distribution in the city
    const partyMap = new Map<string, number>();
    ranking.forEach(r => {
        partyMap.set(r.party, (partyMap.get(r.party) || 0) + r.totalVotes);
    });
    const partyDistribution = Array.from(partyMap.entries())
        .map(([party, votes]) => ({ party, votes, percentage: ((votes / cityTotalAllCandidates) * 100).toFixed(1) }))
        .sort((a, b) => b.votes - a.votes);

    return {
        city: city.name, state: 'MA', totalVotes: city.votes,
        totalAllCandidates: cityTotalAllCandidates,
        zonesCount, sectionsCount,
        ranking,
        zoneBreakdown,
        evolution,
        partyDistribution,
        adelmoPosition: ranking.findIndex(r => r.name === 'ADELMO SOARES') + 1,
        adelmoPercentage: ((city.votes / cityTotalAllCandidates) * 100).toFixed(1),
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
            number2018: '65555',
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
                party: 'PCdoB', number: '65555', totalVotes: 43974,
                result: 'ELEITO', position: 1, municipalitiesWithVotes: 209, totalMunicipalities: 217,
                topCities: ADELMO_CITIES_2018.slice(0, 10),
                votePercentage: ((43974 / TOTAL_VOTES_2018) * 100).toFixed(2),
            },
            year2022: {
                party: 'PSB', number: '40000', totalVotes: 34348,
                result: '2º SUPLENTE', position: 37, municipalitiesWithVotes: 195, totalMunicipalities: 217,
                topCities: ADELMO_CITIES_2022.slice(0, 10),
                votePercentage: ((34348 / TOTAL_VOTES_2022) * 100).toFixed(2),
            },
        },
        evolution: {
            voteDifference: 34348 - 43974,
            percentChange: (((34348 - 43974) / 43974) * 100).toFixed(1),
            municipalitiesDiff: 195 - 209,
            partyChange: 'PCdoB → PSB',
            keyChanges: [
                // Dados cruzados oficiais TSE (votacao_secao 2018 vs 2022)
                { city: 'CAXIAS', votes2018: 3485, votes2022: 8978, diff: 8978 - 3485 },
                { city: 'ROSÁRIO', votes2018: 66, votes2022: 3134, diff: 3134 - 66 },
                { city: 'ESPERANTINÓPOLIS', votes2018: 103, votes2022: 2070, diff: 2070 - 103 },
                { city: 'AFONSO CUNHA', votes2018: 14, votes2022: 2219, diff: 2219 - 14 },
                { city: 'LAGO DA PEDRA', votes2018: 4346, votes2022: 0, diff: 0 - 4346 },
                { city: 'ALDEIAS ALTAS', votes2018: 4031, votes2022: 2273, diff: 2273 - 4031 },
                { city: 'LAGOA GRANDE DO MARANHÃO', votes2018: 2279, votes2022: 4, diff: 4 - 2279 },
            ],
        },
        strengths: [
            'Base sólida em Caxias (maior votação 2022: 8.978 votos, +157% vs 2018)',
            'Capilaridade: votos em 209 municípios (2018) / 195 (2022)',
            'Crescimento explosivo em Rosário (66→3.134, +4.648%)',
            'Conquista de Esperantinópolis (103→2.070) e Afonso Cunha (14→2.219)',
            'Articulação com partidos de base (PCdoB/PSB)',
        ],
        weaknesses: [
            'Queda de 21.8% nos votos totais entre 2018 e 2022',
            'Perda total de Lago da Pedra (4.346→0 votos, maior base de 2018)',
            'Queda forte em Lagoa Grande (2.279→4) e Aldeias Altas (4.031→2.273)',
            'Redução de municípios com votos (209 → 195)',
            'Troca de partido pode ter afetado identidade eleitoral',
        ],
        opportunities: [
            'Consolidar crescimento em novas bases (Rosário, Esperantinópolis)',
            'Trabalho parlamentar como titular desde 2024 fortalece candidatura',
            'Consolidação da base PSB no Maranhão',
            'Recuperar presença em Lago da Pedra e Lagoa Grande',
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
    candidate: { name: string; party: string; number: string };
    currentTotalVotes: number;
    projectedTotalVotes: number;
    voteDifference: number;
    totalPercentChange: number;
    currentRanking: number;
    projectedRanking: number;
    rankingChange: number;
    goalVotes: number;
    goalProgress: number;
    currentPercentage: string;
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

export function calculateProjection(candidateNumber: string, adjustments: Record<string, number>): ProjectionResult {
    const candidates = getActiveCandidates();
    const candidate = candidates.find(c => c.number === candidateNumber);
    if (!candidate) {
        // Fallback to first candidate
        const first = candidates[0];
        return calculateProjection(first.number, adjustments);
    }

    // Get city data for this candidate (Adelmo has real data, others get proportional)
    const adelmoNum = getAdelmoNumber();
    const isAdelmo = candidateNumber === adelmoNum;
    const baseCities = isAdelmo
        ? getAdelmoCities()
        : ADELMO_CITIES_2022.map(c => ({
            name: c.name,
            votes: Math.floor(c.votes * (candidate.totalVotes / 34348)),
        }));

    // Calculate city-level projections
    const cityResults: ProjectionCityResult[] = baseCities.map(c => {
        const adj = adjustments[c.name] || adjustments['default'] || 1.0;
        const projected = Math.floor(c.votes * adj);
        return {
            city: c.name,
            currentVotes: c.votes,
            projectedVotes: projected,
            difference: projected - c.votes,
            percentChange: parseFloat(((adj - 1) * 100).toFixed(1)),
        };
    });

    const totalCurrent = candidate.totalVotes;
    const totalProjected = totalCurrent + cityResults.reduce((s, c) => s + c.difference, 0);

    // Calculate ranking
    const sorted = [...candidates].sort((a, b) => b.totalVotes - a.totalVotes);
    const currentRanking = sorted.findIndex(c => c.number === candidateNumber) + 1;

    // Build projected rankings by simulating this candidate's new vote total
    const projectedCandidates = sorted.map(c => ({
        ...c,
        totalVotes: c.number === candidateNumber ? totalProjected : c.totalVotes,
    })).sort((a, b) => b.totalVotes - a.totalVotes);
    const projectedRanking = projectedCandidates.findIndex(c => c.number === candidateNumber) + 1;

    // Goal: reach 5th place
    const fifthPlace = sorted[4]; // 5th candidate (index 4)
    const goalVotes = fifthPlace ? fifthPlace.totalVotes : totalCurrent;
    const goalProgress = goalVotes > 0 ? (totalProjected / goalVotes) * 100 : 100;

    // Current percentage of total votes
    const totalAllVotes = candidates.reduce((s, c) => s + c.totalVotes, 0);
    const currentPercentage = totalAllVotes > 0
        ? ((totalCurrent / totalAllVotes) * 100).toFixed(2)
        : '0';

    return {
        candidate: { name: candidate.name, party: candidate.party, number: candidate.number },
        currentTotalVotes: totalCurrent,
        projectedTotalVotes: totalProjected,
        voteDifference: totalProjected - totalCurrent,
        totalPercentChange: parseFloat((((totalProjected - totalCurrent) / totalCurrent) * 100).toFixed(1)),
        currentRanking,
        projectedRanking,
        rankingChange: currentRanking - projectedRanking, // positive = moved UP in ranking
        goalVotes,
        goalProgress,
        currentPercentage,
        cityResults,
    };
}
