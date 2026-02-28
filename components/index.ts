/**
 * Governe AI - Component Library Index
 * Exportação centralizada de todos os componentes UI
 * 
 * @version 2.0.0
 */

// =============================================================================
// UI COMPONENTS
// =============================================================================
export {
    SearchBar,
    Button,
    Badge,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    Avatar,
    Divider,
    Progress,
    EmptyState,
    ListItem,
    StatCard,
    DateTimeInput,
} from './UI';

// =============================================================================
// SKELETON LOADING COMPONENTS
// =============================================================================
export {
    Skeleton,
    SkeletonCard,
    SkeletonStatCard,
    SkeletonList,
    SkeletonListItem,
    SkeletonProfile,
    SkeletonChart,
    SkeletonTable,
    SkeletonDashboard,
} from './Skeleton';

// =============================================================================
// ADVANCED COMPONENTS
// =============================================================================
export {
    Tabs,
    Tooltip,
    ToastProvider,
    useToast,
    Chip,
    ChipGroup,
    SegmentedControl,
} from './Advanced';

// =============================================================================
// ANIMATED CARD COMPONENTS
// =============================================================================
export {
    AnimatedStatCard,
    AnimatedQuickActionCard,
    AnimatedLeaderCard,
    FAB,
} from './AnimatedCard';

// =============================================================================
// CHART COMPONENTS
// =============================================================================
export {
    DonutChart,
    HorizontalBarChart,
    VerticalBarChart,
    KPICard,
    ComparisonCard,
} from './Charts';

// =============================================================================
// EXISTING COMPONENTS
// =============================================================================
export { default as HeatMap } from './HeatMap';
export { default as ChatBot } from './ChatBot';
export { default as ProtectedRoute } from './ProtectedRoute';

// =============================================================================
// CONSTANTS & THEME
// =============================================================================
export { default as Colors } from '@/constants/colors';
export {
    CategoryColors,
    StatusColors,
    ChartColors,
    PartyColors,
    Spacing,
    Radius,
    Typography,
    Shadows,
    getPartyColor,
    withOpacity,
} from '@/constants/colors';
export { default as Theme } from '@/constants/theme';
