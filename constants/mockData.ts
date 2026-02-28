/**
 * Mock data for SGP-DEP modules — demonstration / development only.
 * Provides realistic data so hub and management screens render populated UIs.
 */
import {
    StaffMember,
    GabineteTask,
    LegislativeBill,
    VotingRecord,
    PoliticalContact,
    CeapExpense,
} from "@/types";

// ── Helpers ─────────────────────────────────────────────────────────
const id = (prefix: string, n: number) => `${prefix}-mock-${String(n).padStart(3, "0")}`;
const daysAgo = (d: number) => {
    const date = new Date();
    date.setDate(date.getDate() - d);
    return date.toISOString();
};
const dateStr = (d: number) => daysAgo(d).split("T")[0];

// ── Staff ───────────────────────────────────────────────────────────
export const MOCK_STAFF: StaffMember[] = [
    { id: id("staff", 1), name: "Ana Clara Mendes", cpf: "111.222.333-44", phone: "(61) 99912-3456", email: "ana.mendes@gabinete.gov.br", role: "Coordenação Legislativa", position: "Chefe de Gabinete", salary: 12500, startDate: "2023-02-01", department: "Gabinete", active: true, createdAt: daysAgo(400), updatedAt: daysAgo(5) },
    { id: id("staff", 2), name: "Carlos Eduardo Silva", phone: "(61) 99834-5678", email: "carlos.silva@gabinete.gov.br", role: "Assessoria Parlamentar", position: "Assessor Parlamentar Sênior", salary: 9800, startDate: "2023-03-15", department: "Legislativo", active: true, createdAt: daysAgo(380), updatedAt: daysAgo(10) },
    { id: id("staff", 3), name: "Mariana Costa", phone: "(61) 98765-4321", email: "mariana.costa@gabinete.gov.br", role: "Comunicação", position: "Assessora de Imprensa", salary: 8500, startDate: "2023-06-01", department: "Comunicação", active: true, createdAt: daysAgo(300), updatedAt: daysAgo(2) },
    { id: id("staff", 4), name: "Rafael Oliveira", phone: "(61) 99612-7890", role: "Agenda e Protocolo", position: "Secretário Executivo", salary: 7200, startDate: "2023-08-10", department: "Gabinete", active: true, createdAt: daysAgo(250), updatedAt: daysAgo(15) },
    { id: id("staff", 5), name: "Beatriz Lima", phone: "(61) 99534-1234", email: "beatriz.lima@gabinete.gov.br", role: "Jurídico", position: "Consultora Jurídica", salary: 11000, startDate: "2024-01-10", department: "Jurídico", active: true, createdAt: daysAgo(180), updatedAt: daysAgo(3) },
    { id: id("staff", 6), name: "Thiago Ramos", phone: "(61) 99756-9876", role: "Motorista", position: "Motorista Oficial", salary: 4500, startDate: "2024-03-01", department: "Operacional", active: true, createdAt: daysAgo(120), updatedAt: daysAgo(20) },
    { id: id("staff", 7), name: "Juliana Ferreira", phone: "(61) 99345-6543", role: "Atendimento ao Cidadão", position: "Assessora de Base", salary: 6800, startDate: "2024-05-15", department: "Base Eleitoral", active: false, createdAt: daysAgo(90), updatedAt: daysAgo(30) },
];

// ── Tasks ────────────────────────────────────────────────────────────
export const MOCK_TASKS: GabineteTask[] = [
    { id: id("task", 1), title: "Preparar relatório de prestação de contas", description: "Compilar todos os gastos do trimestre para envio à Câmara.", assigneeId: id("staff", 1), assigneeName: "Ana Clara Mendes", status: "em_andamento", priority: "alta", dueDate: dateStr(-2), createdAt: daysAgo(10), updatedAt: daysAgo(1) },
    { id: id("task", 2), title: "Revisar PL 1234/2025 - Educação", description: "Análise jurídica e de mérito do projeto de lei sobre educação integral.", assigneeId: id("staff", 5), assigneeName: "Beatriz Lima", status: "pendente", priority: "urgente", dueDate: dateStr(-1), createdAt: daysAgo(5), updatedAt: daysAgo(1) },
    { id: id("task", 3), title: "Agendar reunião com Secretário de Saúde", description: "Reunião para discutir melhorias no atendimento básico do município.", assigneeId: id("staff", 4), assigneeName: "Rafael Oliveira", status: "concluida", priority: "media", dueDate: dateStr(3), completedAt: daysAgo(1), createdAt: daysAgo(7), updatedAt: daysAgo(1) },
    { id: id("task", 4), title: "Responder ofícios da Comissão de Infraestrutura", description: "Ofícios 45, 46, 47 pendentes de resposta.", assigneeId: id("staff", 2), assigneeName: "Carlos Eduardo Silva", status: "atrasada", priority: "alta", dueDate: dateStr(5), createdAt: daysAgo(15), updatedAt: daysAgo(3) },
    { id: id("task", 5), title: "Publicar nota sobre votação do PL de Saneamento", description: "Preparar release para imprensa sobre votação favorável.", assigneeId: id("staff", 3), assigneeName: "Mariana Costa", status: "concluida", priority: "media", dueDate: dateStr(2), completedAt: daysAgo(2), createdAt: daysAgo(6), updatedAt: daysAgo(2) },
    { id: id("task", 6), title: "Organizar visita à escola municipal do Paranoá", description: "Logística de transporte e agenda para visita escolar.", assigneeId: id("staff", 6), assigneeName: "Thiago Ramos", status: "pendente", priority: "baixa", dueDate: dateStr(-5), createdAt: daysAgo(3), updatedAt: daysAgo(1) },
    { id: id("task", 7), title: "Atualizar cadastro de lideranças comunitárias", description: "Verificar dados de contato e inserir novas lideranças.", assigneeId: id("staff", 4), assigneeName: "Rafael Oliveira", status: "em_andamento", priority: "media", dueDate: dateStr(-3), createdAt: daysAgo(8), updatedAt: daysAgo(1) },
    { id: id("task", 8), title: "Elaborar emenda ao PL do Transporte Público", description: "Emenda propondo gratuidade para estudantes de baixa renda.", assigneeId: id("staff", 2), assigneeName: "Carlos Eduardo Silva", status: "concluida", priority: "alta", dueDate: dateStr(1), completedAt: daysAgo(0), createdAt: daysAgo(12), updatedAt: daysAgo(0) },
];

// ── Bills ────────────────────────────────────────────────────────────
export const MOCK_BILLS: LegislativeBill[] = [
    { id: id("bill", 1), number: "PL 1234/2025", title: "Educação Integral nas Escolas Públicas", summary: "Institui programa de educação integral em todas as escolas públicas do DF.", type: "PL", status: "em_tramitacao", authorship: "proprio", area: "Educação", presentedDate: "2025-03-15", committee: "Comissão de Educação", createdAt: daysAgo(60), updatedAt: daysAgo(5) },
    { id: id("bill", 2), number: "PL 567/2025", title: "Saneamento Básico Rural", summary: "Amplia acesso a saneamento básico em comunidades rurais.", type: "PL", status: "aprovado", authorship: "proprio", area: "Infraestrutura", presentedDate: "2025-01-20", lastUpdate: dateStr(3), committee: "Comissão de Infraestrutura", createdAt: daysAgo(90), updatedAt: daysAgo(3) },
    { id: id("bill", 3), number: "PEC 12/2025", title: "Piso Salarial dos Professores", summary: "Proposta de emenda constitucional para reajuste do piso salarial dos profissionais da educação.", type: "PEC", status: "em_tramitacao", authorship: "coautoria", area: "Educação", presentedDate: "2025-04-01", committee: "CCJ", createdAt: daysAgo(40), updatedAt: daysAgo(2) },
    { id: id("bill", 4), number: "PL 890/2025", title: "Transparência em Contratos Públicos", summary: "Obriga publicação detalhada de contratos acima de R$50 mil.", type: "PL", status: "em_tramitacao", authorship: "proprio", area: "Administração Pública", presentedDate: "2025-02-10", committee: "Comissão de Fiscalização", createdAt: daysAgo(80), updatedAt: daysAgo(7) },
    { id: id("bill", 5), number: "REQ 321/2025", title: "Audiência Pública sobre Transporte", summary: "Requerimento para audiência pública sobre o sistema de transporte.", type: "REQ", status: "aprovado", authorship: "proprio", area: "Transporte", presentedDate: "2025-05-10", createdAt: daysAgo(20), updatedAt: daysAgo(10) },
    { id: id("bill", 6), number: "PL 456/2024", title: "Incentivo à Energia Solar Residencial", summary: "Programa de incentivo fiscal para instalação de painéis solares.", type: "PL", status: "rejeitado", authorship: "acompanhamento", area: "Meio Ambiente", presentedDate: "2024-11-05", createdAt: daysAgo(150), updatedAt: daysAgo(45) },
    { id: id("bill", 7), number: "INC 78/2025", title: "Indicação para Recapeamento da BR-040", summary: "Indicação ao Executivo para recapeamento do trecho urbano.", type: "INC", status: "em_tramitacao", authorship: "proprio", area: "Infraestrutura", presentedDate: "2025-06-01", createdAt: daysAgo(10), updatedAt: daysAgo(1) },
];

// ── Voting Records ──────────────────────────────────────────────────
export const MOCK_VOTES: VotingRecord[] = [
    { id: id("vote", 1), billId: id("bill", 2), billNumber: "PL 567/2025", session: "032ª Sessão Ordinária", date: dateStr(3), subject: "Votação do PL 567/2025 - Saneamento Básico Rural", vote: "favoravel", result: "aprovado", createdAt: daysAgo(3), updatedAt: daysAgo(3) },
    { id: id("vote", 2), session: "031ª Sessão Ordinária", date: dateStr(5), subject: "Votação do PL 1111/2025 - Reforma Administrativa", vote: "contrario", result: "aprovado", notes: "Divergência quanto à redução de cargos comissionados.", createdAt: daysAgo(5), updatedAt: daysAgo(5) },
    { id: id("vote", 3), billNumber: "PEC 08/2025", session: "030ª Sessão Extraordinária", date: dateStr(7), subject: "PEC 08/2025 - Teto de Gastos Estadual", vote: "favoravel", result: "aprovado", createdAt: daysAgo(7), updatedAt: daysAgo(7) },
    { id: id("vote", 4), session: "029ª Sessão Ordinária", date: dateStr(10), subject: "Moção de Repúdio ao corte de verbas para cultura", vote: "favoravel", result: "aprovado", createdAt: daysAgo(10), updatedAt: daysAgo(10) },
    { id: id("vote", 5), session: "028ª Sessão Ordinária", date: dateStr(12), subject: "PL 222/2025 - Privatização da Companhia de Água", vote: "contrario", result: "rejeitado", notes: "Mobilização popular contra a medida.", createdAt: daysAgo(12), updatedAt: daysAgo(12) },
    { id: id("vote", 6), billId: id("bill", 5), billNumber: "REQ 321/2025", session: "027ª Sessão Ordinária", date: dateStr(15), subject: "REQ 321/2025 - Audiência Pública Transporte", vote: "favoravel", result: "aprovado", createdAt: daysAgo(15), updatedAt: daysAgo(15) },
    { id: id("vote", 7), session: "026ª Sessão Ordinária", date: dateStr(18), subject: "PL 900/2025 - Programa Primeiro Emprego", vote: "favoravel", result: "adiado", createdAt: daysAgo(18), updatedAt: daysAgo(18) },
    { id: id("vote", 8), session: "025ª Sessão Ordinária", date: dateStr(20), subject: "PL 456/2024 - Energia Solar Residencial", vote: "favoravel", result: "rejeitado", notes: "Rejeitado por falta de quórum qualificado.", createdAt: daysAgo(20), updatedAt: daysAgo(20) },
];

// ── Political Contacts ──────────────────────────────────────────────
export const MOCK_POLITICAL_CONTACTS: PoliticalContact[] = [
    { id: id("pc", 1), name: "Dep. João Marcos Ribeiro", phone: "(61) 99876-5432", email: "joao.ribeiro@camara.leg.br", politicalRole: "deputado_estadual", party: "PSD", city: "Brasília", state: "DF", relationship: "aliado", notes: "Parceiro em projetos de educação", active: true, lastContactDate: dateStr(2), createdAt: daysAgo(200), updatedAt: daysAgo(2) },
    { id: id("pc", 2), name: "Sen. Maria Helena Souza", phone: "(61) 99765-4321", email: "maria.souza@senado.leg.br", politicalRole: "senador", party: "MDB", city: "Brasília", state: "DF", relationship: "aliado", notes: "Apoio na PEC do Piso Salarial", active: true, lastContactDate: dateStr(5), createdAt: daysAgo(180), updatedAt: daysAgo(5) },
    { id: id("pc", 3), name: "Prefeito Carlos Augusto", phone: "(61) 99234-5678", politicalRole: "prefeito", party: "PP", city: "Planaltina", state: "GO", relationship: "aliado", notes: "Articulação para emenda de saneamento", active: true, lastContactDate: dateStr(8), createdAt: daysAgo(150), updatedAt: daysAgo(8) },
    { id: id("pc", 4), name: "Ver. Fernanda Alves", phone: "(61) 99543-2109", politicalRole: "vereador", party: "PT", city: "Valparaíso", state: "GO", relationship: "neutro", active: true, lastContactDate: dateStr(15), createdAt: daysAgo(120), updatedAt: daysAgo(15) },
    { id: id("pc", 5), name: "Sec. Roberto Campos", phone: "(61) 99321-0987", email: "roberto.campos@saude.df.gov.br", politicalRole: "secretario", city: "Brasília", state: "DF", relationship: "aliado", notes: "Secretário de Saúde do DF — reunião sobre UBS", active: true, lastContactDate: dateStr(1), createdAt: daysAgo(100), updatedAt: daysAgo(1) },
    { id: id("pc", 6), name: "Líder Com. Maria do Socorro", phone: "(61) 99876-1234", politicalRole: "lideranca_comunitaria", city: "Ceilândia", state: "DF", relationship: "aliado", region: "Sol Nascente", notes: "Líder do movimento de moradia", active: true, lastContactDate: dateStr(3), createdAt: daysAgo(80), updatedAt: daysAgo(3) },
    { id: id("pc", 7), name: "Dep. Paulo Henrique Mota", phone: "(61) 99654-3210", politicalRole: "deputado_estadual", party: "PSOL", city: "Brasília", state: "DF", relationship: "oposicao", notes: "Oposição mas aberto ao diálogo", active: true, lastContactDate: dateStr(30), createdAt: daysAgo(60), updatedAt: daysAgo(30) },
];

// ── CEAP Expenses ───────────────────────────────────────────────────
export const MOCK_CEAP: CeapExpense[] = [
    { id: id("ceap", 1), description: "Passagem aérea BSB → SP — Audiência na ALESP", category: "passagens_aereas", value: 1250.00, date: dateStr(2), supplier: "GOL Linhas Aéreas", supplierCnpj: "07.575.651/0001-59", documentNumber: "NF-2025-001", createdAt: daysAgo(2), updatedAt: daysAgo(2) },
    { id: id("ceap", 2), description: "Conta de telefone do gabinete — Maio/2025", category: "telefonia", value: 890.50, date: dateStr(5), supplier: "Vivo Empresas", supplierCnpj: "02.558.157/0001-62", documentNumber: "FAT-052025", createdAt: daysAgo(5), updatedAt: daysAgo(5) },
    { id: id("ceap", 3), description: "Envio de correspondências oficiais", category: "servicos_postais", value: 345.80, date: dateStr(8), supplier: "Correios", supplierCnpj: "34.028.316/0001-03", createdAt: daysAgo(8), updatedAt: daysAgo(8) },
    { id: id("ceap", 4), description: "Manutenção ar-condicionado e limpeza", category: "manutencao_escritorio", value: 2100.00, date: dateStr(10), supplier: "CleanTech Serviços", supplierCnpj: "12.345.678/0001-90", documentNumber: "NF-2025-155", createdAt: daysAgo(10), updatedAt: daysAgo(10) },
    { id: id("ceap", 5), description: "Assessoria em tecnologia para gabinete digital", category: "consultoria", value: 4500.00, date: dateStr(12), supplier: "TechGov Consultoria", supplierCnpj: "98.765.432/0001-10", documentNumber: "NF-2025-078", createdAt: daysAgo(12), updatedAt: daysAgo(12) },
    { id: id("ceap", 6), description: "Impressão de materiais de divulgação — PL Educação", category: "divulgacao", value: 1800.00, date: dateStr(15), supplier: "Gráfica Nacional", supplierCnpj: "11.222.333/0001-44", createdAt: daysAgo(15), updatedAt: daysAgo(15) },
    { id: id("ceap", 7), description: "Combustível veículo oficial — Junho", category: "combustivel", value: 980.00, date: dateStr(18), supplier: "Posto BR Asa Norte", supplierCnpj: "33.444.555/0001-66", documentNumber: "NFC-2025-402", createdAt: daysAgo(18), updatedAt: daysAgo(18) },
    { id: id("ceap", 8), description: "Hospedagem em Goiânia — Reunião com prefeitos", category: "hospedagem", value: 650.00, date: dateStr(20), supplier: "Hotel Castro's Park", supplierCnpj: "44.555.666/0001-77", createdAt: daysAgo(20), updatedAt: daysAgo(20) },
    { id: id("ceap", 9), description: "Almoço de trabalho com bancada", category: "alimentacao", value: 420.00, date: dateStr(22), supplier: "Restaurante Piantella", supplierCnpj: "55.666.777/0001-88", createdAt: daysAgo(22), updatedAt: daysAgo(22) },
    { id: id("ceap", 10), description: "Locação de veículo para agenda no Entorno", category: "locacao_veiculos", value: 1350.00, date: dateStr(25), supplier: "Localiza Rent a Car", supplierCnpj: "16.670.085/0001-55", documentNumber: "NF-2025-890", createdAt: daysAgo(25), updatedAt: daysAgo(25) },
];

// ── CEAP Monthly Quota (for progress bars etc) ──────────────────────
export const CEAP_MONTHLY_QUOTA = 45612.53;
