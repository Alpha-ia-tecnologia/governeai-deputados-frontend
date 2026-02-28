import React, { useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Platform,
} from "react-native";
import {
    Gavel,
    ChevronRight,
    Clock,
    CircleCheck,
    CircleX,
    Bookmark,
    AlertCircle,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useData } from "@/contexts/DataContext";
import { Typography, Spacing, Radius } from "@/constants/colors";


export default function LegislativoScreen() {
    const { colors } = useTheme();
    const { bills: realBills } = useData();
    const bills = realBills;

    const stats = useMemo(() => {
        const totalBills = bills.length;
        const tramitando = bills.filter((b) => b.status === "em_tramitacao").length;
        const aprovados = bills.filter((b) => b.status === "aprovado").length;
        const rejeitados = bills.filter((b) => b.status === "rejeitado").length;
        const proprios = bills.filter((b) => b.authorship === "proprio").length;
        return { totalBills, tramitando, aprovados, rejeitados, proprios };
    }, [bills]);

    const recentBills = useMemo(
        () => [...bills].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4),
        [bills]
    );


    const navigateTo = (route: string) => router.push(route as any);

    const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
        em_tramitacao: { label: "Em Tramitação", color: "#3b82f6", icon: Clock },
        aprovado: { label: "Aprovado", color: "#22c55e", icon: CircleCheck },
        rejeitado: { label: "Rejeitado", color: "#ef4444", icon: CircleX },
        arquivado: { label: "Arquivado", color: "#6b7280", icon: Bookmark },
        retirado: { label: "Retirado", color: "#f97316", icon: AlertCircle },
    };

    const TYPE_COLORS: Record<string, string> = {
        PL: "#3b82f6", PEC: "#8b5cf6", PLP: "#6366f1", PDL: "#0ea5e9",
        MPV: "#f59e0b", REQ: "#10b981", INC: "#64748b",
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
            contentContainerStyle={styles.content}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>Legislativo</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Projetos de lei
                    </Text>
                </View>
            </View>

            {/* Quick chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsContent}>
                <View style={[styles.chip, { backgroundColor: "#3b82f618" }]}>
                    <Gavel color="#3b82f6" size={14} />
                    <Text style={[styles.chipText, { color: "#3b82f6" }]}>{stats.tramitando} em tramitação</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: "#22c55e18" }]}>
                    <CircleCheck color="#22c55e" size={14} />
                    <Text style={[styles.chipText, { color: "#22c55e" }]}>{stats.aprovados} aprovados</Text>
                </View>
            </ScrollView>

            {/* ── Projetos de Lei Card ──────────────────────────── */}
            <TouchableOpacity
                style={[styles.moduleCard, { backgroundColor: colors.card }]}
                onPress={() => navigateTo("/manage-bills")}
                activeOpacity={0.7}
            >
                <View style={styles.moduleHeader}>
                    <View style={[styles.moduleIcon, { backgroundColor: "#3b82f612" }]}>
                        <Gavel color="#3b82f6" size={22} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.moduleTitle, { color: colors.text }]}>Projetos de Lei</Text>
                        <Text style={[styles.moduleSubtitle, { color: colors.textSecondary }]}>
                            {stats.totalBills} projetos • {stats.proprios} de autoria própria
                        </Text>
                    </View>
                    <ChevronRight color={colors.textSecondary} size={18} />
                </View>

                {/* Summary row */}
                <View style={styles.summaryGrid}>
                    {[
                        { label: "Tramitando", value: stats.tramitando, color: "#3b82f6", icon: Clock },
                        { label: "Aprovados", value: stats.aprovados, color: "#22c55e", icon: CircleCheck },
                        { label: "Rejeitados", value: stats.rejeitados, color: "#ef4444", icon: CircleX },
                        { label: "Próprios", value: stats.proprios, color: colors.primary, icon: Gavel },
                    ].map((item, i) => (
                        <View key={i} style={[styles.summaryItem, { backgroundColor: item.color + "08" }]}>
                            <item.icon color={item.color} size={18} />
                            <Text style={[styles.summaryValue, { color: item.color }]}>{item.value}</Text>
                            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Recent bills list */}
                {recentBills.length > 0 && (
                    <View style={styles.listPreview}>
                        {recentBills.map((b) => {
                            const sc = STATUS_MAP[b.status] || STATUS_MAP.em_tramitacao;
                            return (
                                <View key={b.id} style={[styles.listItem, { backgroundColor: colors.backgroundSecondary }]}>
                                    <View style={[styles.typeBadge, { backgroundColor: (TYPE_COLORS[b.type] || "#6b7280") + "18" }]}>
                                        <Text style={[styles.typeText, { color: TYPE_COLORS[b.type] || "#6b7280" }]}>{b.type}</Text>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                        <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={1}>{b.number} — {b.title}</Text>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 }}>
                                            <sc.icon color={sc.color} size={12} />
                                            <Text style={{ color: sc.color, fontSize: 11, fontWeight: "600" }}>{sc.label}</Text>
                                            {b.area && <Text style={{ color: colors.textSecondary, fontSize: 11 }}>• {b.area}</Text>}
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: Spacing.lg, paddingBottom: 32 },
    header: { marginBottom: Spacing.md },
    title: { fontSize: Typography.sizes.xxxl, fontWeight: Typography.weights.bold },
    subtitle: { fontSize: Typography.sizes.base, marginTop: 2 },
    chipsScroll: { marginBottom: Spacing.lg },
    chipsContent: { gap: Spacing.sm },
    chip: {
        flexDirection: "row", alignItems: "center", gap: 6,
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full,
    },
    chipText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
    moduleCard: {
        borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.lg,
        ...Platform.select({
            web: { boxShadow: "0 2px 12px rgba(0,0,0,0.06)" },
            android: { elevation: 3 },
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 },
        }),
    },
    moduleHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
    moduleIcon: {
        width: 44, height: 44, borderRadius: Radius.md,
        justifyContent: "center", alignItems: "center",
    },
    moduleTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
    moduleSubtitle: { fontSize: Typography.sizes.sm, marginTop: 2 },
    // Summary grid
    summaryGrid: {
        flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginTop: Spacing.lg,
    },
    summaryItem: {
        flex: 1, minWidth: "22%" as any, alignItems: "center",
        padding: Spacing.sm, borderRadius: Radius.md, gap: 3,
    },
    summaryValue: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
    summaryLabel: { fontSize: 10 },
    // List preview
    listPreview: { marginTop: Spacing.md, gap: Spacing.sm },
    listItem: {
        flexDirection: "row", alignItems: "center",
        padding: Spacing.sm, borderRadius: Radius.md,
    },
    listTitle: { fontSize: 13, fontWeight: "600" },
    typeBadge: {
        paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm, minWidth: 36, alignItems: "center",
    },
    typeText: { fontSize: 11, fontWeight: "700" },
});
