export type UserRole = "admin" | "vereador" | "lideranca" | "assessor";

export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  role: UserRole;
  region?: string;
  city?: string; // Cidade de atuação (para mapa de calor)
  state?: string; // Estado de atuação
  vereadorId?: string; // ID do vereador ao qual o usuário está vinculado (multitenancy)
  vereadorName?: string; // Nome do vereador (para exibição)
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Voter {
  id: string;
  name: string;
  cpf?: string;
  voterRegistration?: string;
  birthDate?: string;
  phone: string;
  // Campos de endereço
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  cep?: string;
  city?: string;
  state?: string;
  // Coordenadas para mapa de calor
  latitude?: number | null;
  longitude?: number | null;
  votesCount?: number;
  leaderId?: string;
  leaderName?: string;
  notes?: string;
  // Campos do Gabinete Social
  zona?: string;
  localidade?: string;
  tipoSuporte?: string;
  articulador?: string;
  idade?: number;
  createdAt: string;
  updatedAt: string;
  vereadorId?: string;
}

// Tipos para Mapa de Calor
export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number;
}

export interface HeatmapData {
  points: HeatmapPoint[];
  center: { latitude: number; longitude: number } | null;
  totalVoters: number;
  votersWithLocation: number;
}

export interface NeighborhoodStats {
  name: string;
  count: number;
  percentage: number;
  latitude: number | null;
  longitude: number | null;
}

export interface NeighborhoodStatsResponse {
  neighborhoods: NeighborhoodStats[];
  total: number;
}

export interface City {
  id: string;
  name: string;
  ibgeCode?: string;
  state: string;
  latitude?: number;
  longitude?: number;
  population?: number;
  votersGoal: number;
  leadersGoal: number;
  active: boolean;
  vereadorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Leader {
  id: string;
  name: string;
  cpf?: string;
  phone: string;
  email?: string;
  region?: string;
  birthDate?: string;
  votersCount: number;
  votersGoal: number;
  active: boolean;
  userId?: string; // Referência ao usuário do sistema (quando a liderança também é um usuário)
  createdAt: string;
  vereadorId?: string;
}

export type HelpStatus = "pending" | "in_progress" | "completed" | "cancelled";
export type HelpCategory =
  | "saude"
  | "educacao"
  | "assistencia_social"
  | "infraestrutura"
  | "emprego"
  | "documentacao"
  | "outros";

export interface HelpRecord {
  id: string;
  voterId: string;
  voterName: string;
  leaderId: string;
  leaderName: string;
  category: HelpCategory;
  description: string;
  status: HelpStatus;
  responsibleId: string;
  responsibleName: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  documents?: string[];
  notes?: string;
  vereadorId?: string; // Multitenancy: ID do vereador dono deste registro
}

export interface Visit {
  id: string;
  voterId: string;
  voterName: string;
  leaderId: string;
  leaderName: string;
  date: string;
  objective: string;
  result?: string;
  nextSteps?: string;
  photos?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  vereadorId?: string; // Multitenancy: ID do vereador dono deste registro
}

export type ProjectStatus =
  | "em_elaboracao"
  | "protocolado"
  | "em_tramitacao"
  | "aprovado"
  | "rejeitado"
  | "arquivado";

export interface LawProject {
  id: string;
  number: string;
  title: string;
  summary: string;
  fullText?: string;
  protocolDate: string;
  status: ProjectStatus;
  timeline: ProjectTimelineItem[];
  votes?: {
    favor: number;
    contra: number;
    abstencoes: number;
  };
  pdfUrl?: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTimelineItem {
  id: string;
  date: string;
  description: string;
  type: "protocolo" | "tramitacao" | "votacao" | "aprovacao" | "rejeicao";
}

export type AmendmentStatus =
  | "aprovada"
  | "em_execucao"
  | "executada"
  | "cancelada";

export interface Amendment {
  id: string;
  code: string;
  value: number;
  destination: string;
  objective: string;
  status: AmendmentStatus;
  executionPercentage: number;
  documents?: string[];
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export type RequestStatus =
  | "enviado"
  | "em_analise"
  | "respondido"
  | "atendido"
  | "negado";
export type RequestType = "oficio" | "indicacao" | "requerimento";

export interface ExecutiveRequest {
  id: string;
  protocolNumber: string;
  date: string;
  type: RequestType;
  subject: string;
  description: string;
  status: RequestStatus;
  response?: string;
  responseDate?: string;
  deadline?: string;
  documents?: string[];
  createdAt: string;
  updatedAt: string;
}

export type EventCategory = "reuniao" | "visita" | "sessao" | "evento_publico";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  category: EventCategory;
  location?: string;
  participants?: string[];
  reminders: number[];
  googleEventId?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "in_progress";
export type AppointmentType = "compromisso" | "acao" | "reuniao" | "visita" | "ligacao" | "outro";

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  type: AppointmentType;
  status: AppointmentStatus;
  date: string;
  time: string;
  duration?: number;
  location?: string;
  voterId?: string;
  voterName?: string;
  leaderId?: string;
  leaderName?: string;
  responsibleId: string;
  responsibleName: string;
  notes?: string;
  reminders: ReminderConfig[];
  completed?: boolean;
  completedAt?: string;
  completedNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderConfig {
  id: string;
  minutes: number;
  notified?: boolean;
  notifiedAt?: string;
}

export interface DashboardStats {
  totalVoters: number;
  votersThisMonth: number;
  totalLeaders: number;
  activeLeaders: number;
  totalHelps: number;
  helpsThisMonth: number;
  pendingHelps: number;
  visitsThisMonth: number;
  activeProjects: number;
  approvedProjects: number;
  pendingRequests: number;
  todayEvents: number;
}

// =============================================
// SGP-DEP: Módulo de Gestão de Gabinete (RF-GB)
// =============================================

export interface StaffMember {
  id: string;
  name: string;
  cpf?: string;
  phone: string;
  email?: string;
  role: string;
  position: string;
  salary?: number;
  startDate: string;
  department?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = "pendente" | "em_andamento" | "concluida" | "atrasada";
export type TaskPriority = "baixa" | "media" | "alta" | "urgente";

export interface GabineteTask {
  id: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================
// SGP-DEP: Módulo de Atividade Legislativa (RF-AL)
// =============================================

export type BillType = "PL" | "PEC" | "PLP" | "PDL" | "MPV" | "REQ" | "INC";
export type BillStatus = "em_tramitacao" | "aprovado" | "rejeitado" | "arquivado" | "retirado";
export type BillAuthorship = "proprio" | "coautoria" | "acompanhamento";

export interface LegislativeBill {
  id: string;
  number: string;
  title: string;
  summary: string;
  type: BillType;
  status: BillStatus;
  authorship: BillAuthorship;
  area: string;
  presentedDate: string;
  lastUpdate?: string;
  committee?: string;
  notes?: string;
  documents?: string[];
  createdAt: string;
  updatedAt: string;
}

export type VoteChoice = "favoravel" | "contrario" | "abstencao" | "ausente" | "obstrucao";
export type VoteResult = "aprovado" | "rejeitado" | "adiado";

export interface VotingRecord {
  id: string;
  billId?: string;
  billNumber?: string;
  session: string;
  date: string;
  subject: string;
  vote: VoteChoice;
  result: VoteResult;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================
// SGP-DEP: CRM Político Expandido (RF-CR-005)
// =============================================

export type PoliticalRole = "prefeito" | "vereador" | "lideranca_comunitaria" | "secretario" | "deputado_estadual" | "senador" | "outro";

export interface PoliticalContact {
  id: string;
  name: string;
  cpf?: string;
  phone: string;
  email?: string;
  politicalRole: PoliticalRole;
  party?: string;
  city: string;
  state: string;
  region?: string;
  relationship: "aliado" | "neutro" | "oposicao";
  notes?: string;
  lastContactDate?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// =============================================
// SGP-DEP: Módulo Financeiro / CEAP (RF-FN)
// =============================================

export type ExpenseCategory =
  | "passagens_aereas"
  | "telefonia"
  | "servicos_postais"
  | "manutencao_escritorio"
  | "consultoria"
  | "divulgacao"
  | "combustivel"
  | "hospedagem"
  | "alimentacao"
  | "locacao_veiculos"
  | "seguranca"
  | "outros";

export interface CeapExpense {
  id: string;
  description: string;
  category: ExpenseCategory;
  value: number;
  date: string;
  supplier: string;
  supplierCnpj?: string;
  documentNumber?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CeapSummary {
  totalSpent: number;
  monthlyQuota: number;
  remainingBalance: number;
  byCategory: Record<ExpenseCategory, number>;
  byMonth: Record<string, number>;
}

// =============================================
// SGP-DEP: Transparência e Compliance (RF-TC)
// =============================================

export type AuditAction = "create" | "update" | "delete" | "login" | "export";

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  description: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  details?: Record<string, any>;
}
