// Labels para exibição de status e categorias

export const StatusLabels: Record<string, string> = {
  // Status gerais
  pending: "Pendente",
  in_progress: "Em Andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
  scheduled: "Agendado",

  // Status de projetos de lei
  em_elaboracao: "Em Elaboração",
  protocolado: "Protocolado",
  em_tramitacao: "Em Tramitação",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
  arquivado: "Arquivado",

  // Status de emendas
  aprovada: "Aprovada",
  em_execucao: "Em Execução",
  executada: "Executada",
  cancelada: "Cancelada",

  // Status de solicitações
  enviado: "Enviado",
  em_analise: "Em Análise",
  respondido: "Respondido",
  atendido: "Atendido",
  negado: "Negado",
};

export const CategoryLabels: Record<string, string> = {
  saude: "Saúde",
  educacao: "Educação",
  assistencia_social: "Assistência Social",
  infraestrutura: "Infraestrutura",
  emprego: "Emprego",
  documentacao: "Documentação",
  outros: "Outros",
};

export const RoleLabels: Record<string, string> = {
  admin: "Administrador",
  vereador: "Vereador",
  lideranca: "Liderança",
  assessor: "Assessor",
};

export const AppointmentTypeLabels: Record<string, string> = {
  compromisso: "Compromisso",
  acao: "Ação",
  reuniao: "Reunião",
  visita: "Visita",
  ligacao: "Ligação",
  outro: "Outro",
};
