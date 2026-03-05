import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import {
    ArrowLeft,
    BarChart3,
    MessageCircle,
    Users,
    Clock,
    CheckCircle2,
    TrendingUp,
    Download,
    Calendar,
    ArrowUpRight,
    Hourglass,
    UserCheck,
    Mail,
    Image,
    FileText,
    Mic,
    MapPin,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, Radius, Typography, Shadows } from '@/constants/colors';
import { whatsappReportService, DashboardMetrics } from '@/services/whatsappReport.service';

const PERIOD_OPTIONS = [
    { label: '7 dias', days: 7 },
    { label: '30 dias', days: 30 },
    { label: '90 dias', days: 90 },
];

const MSG_TYPE_ICONS: Record<string, any> = {
    text: MessageCircle,
    image: Image,
    document: FileText,
    audio: Mic,
    video: FileText,
    location: MapPin,
    contact: UserCheck,
};

export default function WhatsappReportsScreen() {
    const { colors } = useTheme();
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState(30);
    const [exporting, setExporting] = useState(false);

    const loadMetrics = useCallback(async () => {
        try {
            setLoading(true);
            const end = new Date().toISOString();
            const start = new Date(Date.now() - selectedPeriod * 24 * 60 * 60 * 1000).toISOString();
            const data = await whatsappReportService.getDashboard(start, end);
            setMetrics(data);
        } catch (e) {
            console.error('Erro ao carregar métricas:', e);
        } finally {
            setLoading(false);
        }
    }, [selectedPeriod]);

    useEffect(() => { loadMetrics(); }, [selectedPeriod]);

    const handleExport = async () => {
        setExporting(true);
        try {
            const end = new Date().toISOString();
            const start = new Date(Date.now() - selectedPeriod * 24 * 60 * 60 * 1000).toISOString();
            const report = await whatsappReportService.exportReport(start, end);
            // Em web, baixar JSON
            if (Platform.OS === 'web') {
                const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `whatsapp-report-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (e: any) { console.error(e.message); }
        finally { setExporting(false); }
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.centered}><ActivityIndicator size="large" color="#25D366" /></View>
            </View>
        );
    }

    const ov = metrics?.overview;
    const perf = metrics?.performance;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={20} color={colors.text} />
                </TouchableOpacity>
                <BarChart3 size={22} color="#25D366" />
                <Text style={[styles.headerTitle, { color: colors.text }]}>Relatórios</Text>
                <TouchableOpacity
                    onPress={handleExport}
                    style={[styles.exportBtn, { borderColor: colors.border }]}
                    disabled={exporting}
                >
                    {exporting ? <ActivityIndicator size="small" color="#25D366" /> : (
                        <>
                            <Download size={14} color="#25D366" />
                            <Text style={{ color: '#25D366', fontSize: Typography.sizes.sm, fontWeight: '600' }}>Exportar</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Period selector */}
                <View style={styles.periodRow}>
                    <Calendar size={14} color={colors.textMuted} />
                    {PERIOD_OPTIONS.map(opt => (
                        <TouchableOpacity
                            key={opt.days}
                            style={[styles.periodBtn, {
                                backgroundColor: selectedPeriod === opt.days ? '#25D366' : colors.backgroundSecondary,
                            }]}
                            onPress={() => setSelectedPeriod(opt.days)}
                        >
                            <Text style={{
                                color: selectedPeriod === opt.days ? '#FFF' : colors.text,
                                fontSize: Typography.sizes.sm,
                                fontWeight: '600',
                            }}>{opt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Overview cards */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Visão Geral</Text>
                <View style={styles.cardGrid}>
                    {[
                        { label: 'Total Conversas', value: ov?.totalConversations || 0, icon: MessageCircle, color: '#3B82F6' },
                        { label: 'Ativas', value: ov?.activeConversations || 0, icon: TrendingUp, color: '#10B981' },
                        { label: 'Resolvidas', value: ov?.resolvedConversations || 0, icon: CheckCircle2, color: '#8B5CF6' },
                        { label: 'Pendentes', value: ov?.pendingConversations || 0, icon: Hourglass, color: '#F59E0B' },
                        { label: 'Mensagens', value: ov?.totalMessages || 0, icon: Mail, color: '#EC4899' },
                        { label: 'Recebidas', value: ov?.inboundMessages || 0, icon: ArrowUpRight, color: '#06B6D4' },
                        { label: 'Enviadas', value: ov?.outboundMessages || 0, icon: ArrowUpRight, color: '#6366F1' },
                        { label: 'Contatos', value: ov?.totalContacts || 0, icon: Users, color: '#F97316' },
                        { label: 'Novos', value: ov?.newContactsInPeriod || 0, icon: UserCheck, color: '#14B8A6' },
                    ].map(item => {
                        const Icon = item.icon;
                        return (
                            <View key={item.label} style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                <View style={[styles.metricIconBg, { backgroundColor: item.color + '15' }]}>
                                    <Icon size={18} color={item.color} />
                                </View>
                                <Text style={[styles.metricValue, { color: colors.text }]}>{item.value}</Text>
                                <Text style={[styles.metricLabel, { color: colors.textMuted }]}>{item.label}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Performance */}
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Performance</Text>
                <View style={styles.perfRow}>
                    <View style={[styles.perfCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Clock size={20} color="#3B82F6" />
                        <Text style={[styles.perfValue, { color: colors.text }]}>{perf?.avgResponseTimeMinutes || 0} min</Text>
                        <Text style={[styles.perfLabel, { color: colors.textMuted }]}>Tempo Médio Resposta</Text>
                    </View>
                    <View style={[styles.perfCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Hourglass size={20} color="#8B5CF6" />
                        <Text style={[styles.perfValue, { color: colors.text }]}>{perf?.avgResolutionTimeMinutes || 0} min</Text>
                        <Text style={[styles.perfLabel, { color: colors.textMuted }]}>Tempo Médio Resolução</Text>
                    </View>
                    <View style={[styles.perfCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <CheckCircle2 size={20} color="#10B981" />
                        <Text style={[styles.perfValue, { color: colors.text }]}>{perf?.resolutionRate || 0}%</Text>
                        <Text style={[styles.perfLabel, { color: colors.textMuted }]}>Taxa de Resolução</Text>
                    </View>
                </View>

                {/* Timeline */}
                {metrics?.timeline && metrics.timeline.length > 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Timeline ({metrics.timeline.length} dias)
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={[styles.timelineContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                {metrics.timeline.map((day, i) => {
                                    const maxMsg = Math.max(...metrics.timeline.map(d => d.inbound + d.outbound), 1);
                                    const total = day.inbound + day.outbound;
                                    const barHeight = Math.max(4, (total / maxMsg) * 100);
                                    const inPct = total > 0 ? (day.inbound / total) * 100 : 50;
                                    return (
                                        <View key={day.date} style={styles.timelineDay}>
                                            <View style={[styles.timelineBar, { height: barHeight }]}>
                                                <View style={[styles.barInbound, {
                                                    height: `${inPct}%` as any,
                                                    backgroundColor: '#3B82F6',
                                                }]} />
                                                <View style={[styles.barOutbound, {
                                                    height: `${100 - inPct}%` as any,
                                                    backgroundColor: '#10B981',
                                                }]} />
                                            </View>
                                            <Text style={[styles.timelineLabel, { color: colors.textMuted }]}>
                                                {day.date.slice(5)}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </ScrollView>
                        <View style={styles.legendRow}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
                                <Text style={{ color: colors.textMuted, fontSize: 11 }}>Recebidas</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                                <Text style={{ color: colors.textMuted, fontSize: 11 }}>Enviadas</Text>
                            </View>
                        </View>
                    </>
                )}

                {/* Top attendants */}
                {metrics?.topAttendants && metrics.topAttendants.length > 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Atendentes</Text>
                        <View style={[styles.tableCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
                                <Text style={[styles.thCell, { color: colors.textMuted, flex: 1 }]}>#</Text>
                                <Text style={[styles.thCell, { color: colors.textMuted, flex: 4 }]}>Nome</Text>
                                <Text style={[styles.thCell, { color: colors.textMuted, flex: 2, textAlign: 'right' }]}>Resolvidas</Text>
                            </View>
                            {metrics.topAttendants.map((att, i) => (
                                <View key={att.userId} style={[styles.tableRow, { borderBottomColor: colors.border }]}>
                                    <Text style={[styles.tdCell, { color: colors.textMuted, flex: 1 }]}>{i + 1}</Text>
                                    <Text style={[styles.tdCell, { color: colors.text, flex: 4, fontWeight: '600' }]}>{att.name}</Text>
                                    <Text style={[styles.tdCell, { color: '#10B981', flex: 2, textAlign: 'right', fontWeight: '700' }]}>{att.resolved}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Message types */}
                {metrics?.messageTypes && metrics.messageTypes.length > 0 && (
                    <>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Tipos de Mensagem</Text>
                        <View style={[styles.typesGrid]}>
                            {metrics.messageTypes.map(mt => {
                                const Icon = MSG_TYPE_ICONS[mt.type] || MessageCircle;
                                const totalMsgs = metrics.messageTypes.reduce((s, t) => s + t.count, 0);
                                const pct = totalMsgs > 0 ? Math.round((mt.count / totalMsgs) * 100) : 0;
                                return (
                                    <View key={mt.type} style={[styles.typeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                                        <Icon size={16} color="#6366F1" />
                                        <Text style={[styles.typeName, { color: colors.text }]}>{mt.type}</Text>
                                        <Text style={[styles.typeCount, { color: colors.textSecondary }]}>{mt.count}</Text>
                                        <View style={[styles.typePctBar, { backgroundColor: colors.backgroundSecondary }]}>
                                            <View style={[styles.typePctFill, { width: `${pct}%` as any, backgroundColor: '#6366F1' }]} />
                                        </View>
                                        <Text style={{ color: colors.textMuted, fontSize: 10 }}>{pct}%</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </>
                )}

                <View style={{ height: Spacing.xxl }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, gap: Spacing.sm, ...Shadows.sm },
    backBtn: { padding: Spacing.xs },
    headerTitle: { flex: 1, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
    exportBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: Spacing.lg },

    periodRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
    periodBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full },

    sectionTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold, marginBottom: Spacing.md, marginTop: Spacing.lg },

    // Metric cards
    cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    metricCard: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, minWidth: 100, flex: 1, flexBasis: '30%', alignItems: 'center', gap: 4, ...Shadows.sm },
    metricIconBg: { width: 36, height: 36, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center' },
    metricValue: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
    metricLabel: { fontSize: 10, textAlign: 'center' },

    // Performance
    perfRow: { flexDirection: 'row', gap: Spacing.sm },
    perfCard: { flex: 1, borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center', gap: 6, ...Shadows.sm },
    perfValue: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
    perfLabel: { fontSize: Typography.sizes.xs, textAlign: 'center' },

    // Timeline
    timelineContainer: { flexDirection: 'row', alignItems: 'flex-end', padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, gap: 2, minHeight: 140 },
    timelineDay: { alignItems: 'center', width: 28 },
    timelineBar: { width: 16, borderRadius: 4, overflow: 'hidden', flexDirection: 'column' },
    barInbound: { width: '100%' },
    barOutbound: { width: '100%' },
    timelineLabel: { fontSize: 8, marginTop: 4, transform: [{ rotate: '-45deg' }] },
    legendRow: { flexDirection: 'row', gap: Spacing.lg, marginTop: Spacing.sm, justifyContent: 'center' },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },

    // Top attendants table
    tableCard: { borderWidth: 1, borderRadius: Radius.lg, overflow: 'hidden', ...Shadows.sm },
    tableHeader: { flexDirection: 'row', padding: Spacing.md, borderBottomWidth: 1 },
    thCell: { fontSize: 11, fontWeight: Typography.weights.semibold, textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', padding: Spacing.md, borderBottomWidth: 1 },
    tdCell: { fontSize: Typography.sizes.sm },

    // Message types
    typesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    typeCard: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, flexBasis: '47%', flex: 1, alignItems: 'center', gap: 4, ...Shadows.sm },
    typeName: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, textTransform: 'capitalize' },
    typeCount: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
    typePctBar: { width: '100%', height: 4, borderRadius: 2, overflow: 'hidden' },
    typePctFill: { height: '100%', borderRadius: 2 },
});
