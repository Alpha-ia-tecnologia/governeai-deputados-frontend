/**
 * Governe AI - Sistema de Cores Expandido
 * Baseado no tema "Bold Tech" do shadcn-ui com adaptações governamentais
 * 
 * @version 2.0.0
 */

// Cores principais do tema
const tintColorLight = "#0066CC";
const tintColorDark = "#4D9FFF";

// Cores primárias do tema Bold Tech adaptado
const primaryPurple = "#8B5CF6";
const primaryBlue = "#0066CC";

const Colors = {
  light: {
    // Base
    text: "#1A1A1A",
    textSecondary: "#666666",
    textMuted: "#9CA3AF",
    background: "#FFFFFF",
    backgroundSecondary: "#F5F7FA",
    backgroundTertiary: "#EEF2F7",

    // Tint
    tint: tintColorLight,
    tabIconDefault: "#9CA3AF",
    tabIconSelected: tintColorLight,

    // Borders & Dividers
    border: "#E5E7EB",
    borderSecondary: "#D1D5DB",
    divider: "#F3F4F6",

    // Semantic Colors
    success: "#10B981",
    successLight: "#D1FAE5",
    warning: "#F59E0B",
    warningLight: "#FEF3C7",
    error: "#EF4444",
    errorLight: "#FEE2E2",
    info: "#3B82F6",
    infoLight: "#DBEAFE",

    // Brand Colors
    primary: "#0066CC",
    primaryLight: "#E0F2FE",
    primaryDark: "#004C99",
    secondary: "#059669",
    secondaryLight: "#D1FAE5",
    accent: "#8B5CF6",
    accentLight: "#EDE9FE",

    // Card & Surfaces
    card: "#FFFFFF",
    cardHover: "#F9FAFB",
    cardActive: "#F3F4F6",
    surface: "#FFFFFF",
    surfaceElevated: "#FFFFFF",

    // Shadows
    shadow: "#000000",
    shadowLight: "rgba(0, 0, 0, 0.05)",
    shadowMedium: "rgba(0, 0, 0, 0.1)",
    shadowHeavy: "rgba(0, 0, 0, 0.15)",

    // Interactive states
    hover: "rgba(0, 102, 204, 0.08)",
    pressed: "rgba(0, 102, 204, 0.12)",
    focused: "rgba(0, 102, 204, 0.16)",
    disabled: "#E5E7EB",
    disabledText: "#9CA3AF",

    // Overlay
    overlay: "rgba(0, 0, 0, 0.5)",
    overlayLight: "rgba(0, 0, 0, 0.3)",

    // Sidebar - shadcn-ui inspired tokens
    sidebar: "#004C99",
    sidebarForeground: "#E0F2FE",
    sidebarAccent: "rgba(255, 255, 255, 0.12)",
    sidebarPrimary: "#FFFFFF",
    sidebarBorder: "rgba(255, 255, 255, 0.15)",
  },

  dark: {
    // Base
    text: "#FFFFFF",
    textSecondary: "#9CA3AF",
    textMuted: "#6B7280",
    background: "#0F172A",
    backgroundSecondary: "#1E293B",
    backgroundTertiary: "#334155",

    // Tint
    tint: tintColorDark,
    tabIconDefault: "#64748B",
    tabIconSelected: tintColorDark,

    // Borders & Dividers
    border: "#334155",
    borderSecondary: "#475569",
    divider: "#1E293B",

    // Semantic Colors
    success: "#34D399",
    successLight: "#064E3B",
    warning: "#FBBF24",
    warningLight: "#78350F",
    error: "#F87171",
    errorLight: "#7F1D1D",
    info: "#60A5FA",
    infoLight: "#1E3A8A",

    // Brand Colors
    primary: "#4D9FFF",
    primaryLight: "#1E3A5F",
    primaryDark: "#0066CC",
    secondary: "#10B981",
    secondaryLight: "#064E3B",
    accent: "#A78BFA",
    accentLight: "#4C1D95",

    // Card & Surfaces
    card: "#1E293B",
    cardHover: "#334155",
    cardActive: "#475569",
    surface: "#1E293B",
    surfaceElevated: "#334155",

    // Shadows
    shadow: "#000000",
    shadowLight: "rgba(0, 0, 0, 0.2)",
    shadowMedium: "rgba(0, 0, 0, 0.3)",
    shadowHeavy: "rgba(0, 0, 0, 0.4)",

    // Interactive states
    hover: "rgba(77, 159, 255, 0.12)",
    pressed: "rgba(77, 159, 255, 0.16)",
    focused: "rgba(77, 159, 255, 0.24)",
    disabled: "#334155",
    disabledText: "#64748B",

    // Overlay
    overlay: "rgba(0, 0, 0, 0.7)",
    overlayLight: "rgba(0, 0, 0, 0.5)",

    // Sidebar - shadcn-ui inspired tokens
    sidebar: "#003366",
    sidebarForeground: "#B3D9FF",
    sidebarAccent: "rgba(255, 255, 255, 0.10)",
    sidebarPrimary: "#FFFFFF",
    sidebarBorder: "rgba(255, 255, 255, 0.10)",
  },
};

export default Colors;

/**
 * Cores para categorias de atendimento
 */
export const CategoryColors: Record<string, string> = {
  saude: "#EF4444",
  educacao: "#3B82F6",
  assistencia_social: "#8B5CF6",
  infraestrutura: "#F59E0B",
  emprego: "#10B981",
  documentacao: "#6366F1",
  seguranca: "#DC2626",
  transporte: "#0EA5E9",
  habitacao: "#D97706",
  outros: "#6B7280",
};

/**
 * Cores para status de processos
 */
export const StatusColors: Record<string, string> = {
  pending: "#F59E0B",
  in_progress: "#3B82F6",
  completed: "#10B981",
  cancelled: "#EF4444",
  enviado: "#6B7280",
  em_analise: "#3B82F6",
  respondido: "#8B5CF6",
  atendido: "#10B981",
  negado: "#EF4444",
  aprovado: "#10B981",
  rejeitado: "#EF4444",
  em_tramitacao: "#3B82F6",
  arquivado: "#6B7280",
};

/**
 * Paleta de cores para gráficos - Inspirada no tema Bold Tech
 * Use para visualizações de dados consistentes
 */
export const ChartColors = {
  // Paleta primária (azul-violeta)
  primary: [
    "#0066CC", // Azul principal
    "#3B82F6", // Azul claro
    "#6366F1", // Indigo
    "#8B5CF6", // Violeta
    "#A78BFA", // Violeta claro
  ],

  // Paleta secundária (verde-teal)
  secondary: [
    "#10B981", // Verde
    "#059669", // Verde escuro
    "#14B8A6", // Teal
    "#06B6D4", // Cyan
    "#0EA5E9", // Sky
  ],

  // Paleta de alertas
  semantic: [
    "#10B981", // Success
    "#3B82F6", // Info
    "#F59E0B", // Warning
    "#EF4444", // Error
    "#8B5CF6", // Accent
  ],

  // Paleta vibrante para comparativos
  vibrant: [
    "#8B5CF6", // Violeta
    "#EC4899", // Rosa
    "#F59E0B", // Âmbar
    "#10B981", // Esmeralda
    "#06B6D4", // Cyan
    "#EF4444", // Vermelho
    "#84CC16", // Lime
    "#6366F1", // Indigo
  ],

  // Gradientes para barras e áreas
  gradients: {
    primary: ["#0066CC", "#8B5CF6"],
    success: ["#10B981", "#34D399"],
    warning: ["#F59E0B", "#FBBF24"],
    danger: ["#EF4444", "#F87171"],
    purple: ["#8B5CF6", "#C4B5FD"],
  },

  // Cores para rankings (1º, 2º, 3º...)
  ranking: ["#FFD700", "#C0C0C0", "#CD7F32", "#8B5CF6", "#3B82F6"],
};

/**
 * Cores para partidos políticos
 */
export const PartyColors: Record<string, string> = {
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
  'PSDB': '#0EA5E9',
  'NOVO': '#F97316',
  'SOLIDARIEDADE': '#F59E0B',
  'AVANTE': '#84CC16',
  'PROS': '#EF4444',
  'PATRIOTA': '#16A34A',
  'PTB': '#1E40AF',
  'default': '#94A3B8',
};

/**
 * Spacing tokens - Para consistência no espaçamento
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

/**
 * Border radius tokens
 */
export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

/**
 * Typography tokens
 */
export const Typography = {
  // Font sizes
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    display: 32,
    hero: 40,
  },
  // Font weights
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

/**
 * Shadow presets para diferentes elevações
 */
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

/**
 * Retorna a cor do partido, com fallback para cor padrão
 */
export const getPartyColor = (party: string): string => {
  return PartyColors[party] || PartyColors.default;
};

/**
 * Retorna cor com opacidade
 */
export const withOpacity = (color: string, opacity: number): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
