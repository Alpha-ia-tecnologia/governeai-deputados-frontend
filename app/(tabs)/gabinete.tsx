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
    Users,
    ClipboardList,
    ChevronRight,
    UserCheck,
    Clock,
    CircleCheck,
    TrendingUp,
    Building2,
    AlertTriangle,
    Circle,
    Briefcase,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useData } from "@/contexts/DataContext";
import { Typography, Spacing, Radius } from "@/constants/colors";


export default function GabineteScreen() {
    const { colors } = useTheme();
    const { staff: realStaff, gabineteTasks: realTasks } = useData();
    const staff = realStaff;
    const tasks = realTasks;

    const stats = useMemo(() => {
        const activeStaff = staff.filter((s) => s.active).length;
        const totalTasks = tasks.length;
        const pendente = tasks.filter((t) => t.status === "pendente").length;
        const em_andamento = tasks.filter((t) => t.status === "em_andamento").length;
        const concluida = tasks.filter((t) => t.status === "concluida").length;
        const atrasada = tasks.filter((t) => t.status === "atrasada").length;
        const completionPct = totalTasks > 0 ? Math.round((concluida / totalTasks) * 100) : 0;
        const totalSalary = staff.filter((s) => s.active).reduce((sum, s) => sum + (s.salary || 0), 0);
        return { activeStaff, totalStaff: staff.length, totalTasks, pendente, em_andamento, concluida, atrasada, completionPct, totalSalary };
    }, [staff, tasks]);

    const recentTasks = useMemo(
        () => [...tasks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4),
        [tasks]
    );

    const topStaff = useMemo(
        () => staff.filter((s) => s.active).slice(0, 3),
        [staff]
    );

    const navigateTo = (route: string) => router.push(route as any);

    const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
        pendente: { label: "Pendente", color: "#f59e0b", icon: Circle },
        em_andamento: { label: "Em andamento", color: "#3b82f6", icon: Clock },
        concluida: { label: "Concluída", color: "#22c55e", icon: CircleCheck },
        atrasada: { label: "Atrasada", color: "#ef4444", icon: AlertTriangle },
    };

    const PRIO_COLORS: Record<string, string> = {
        baixa: "#6b7280", media: "#f59e0b", alta: "#f97316", urgente: "#ef4444",
    };

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
            contentContainerStyle={styles.content}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>Gabinete</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Gestão da equipe e atividades
                    </Text>
                </View>
            </View>

            {/* Stat Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsContent}>
                <View style={[styles.chip, { backgroundColor: colors.primary + "15" }]}>
                    <Users color={colors.primary} size={14} />
                    <Text style={[styles.chipText, { color: colors.primary }]}>{stats.activeStaff} ativos</Text>
                </View>
                {stats.pendente > 0 && (
                    <View style={[styles.chip, { backgroundColor: "#f59e0b18" }]}>
                        <Clock color="#f59e0b" size={14} />
                        <Text style={[styles.chipText, { color: "#f59e0b" }]}>{stats.pendente} pendentes</Text>
                    </View>
                )}
                {stats.atrasada > 0 && (
                    <View style={[styles.chip, { backgroundColor: "#ef444418" }]}>
                        <AlertTriangle color="#ef4444" size={14} />
                        <Text style={[styles.chipText, { color: "#ef4444" }]}>{stats.atrasada} atrasada{stats.atrasada > 1 ? "s" : ""}</Text>
                    </View>
                )}
                <View style={[styles.chip, { backgroundColor: "#22c55e18" }]}>
                    <CircleCheck color="#22c55e" size={14} />
                    <Text style={[styles.chipText, { color: "#22c55e" }]}>{stats.completionPct}% concluído</Text>
                </View>
            </ScrollView>

            {/* ── Equipe do Gabinete Card ────────────────────────── */}
            <TouchableOpacity
                style={[styles.moduleCard, { backgroundColor: colors.card }]}
                onPress={() => navigateTo("/manage-staff")}
                activeOpacity={0.7}
            >
                <View style={styles.moduleHeader}>
                    <View style={[styles.moduleIcon, { backgroundColor: colors.primary + "12" }]}>
                        <Users color={colors.primary} size={22} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.moduleTitle, { color: colors.text }]}>Equipe do Gabinete</Text>
                        <Text style={[styles.moduleSubtitle, { color: colors.textSecondary }]}>
                            Assessores, cargos e informações
                        </Text>
                    </View>
                    <ChevronRight color={colors.textSecondary} size={18} />
                </View>

                {/* Mini stats */}
                <View style={styles.miniStatsRow}>
                    <View style={styles.miniStat}>
                        <Text style={[styles.miniStatValue, { color: colors.primary }]}>{stats.activeStaff}</Text>
                        <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>Ativos</Text>
                    </View>
                    <View style={[styles.miniStatDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.miniStat}>
                        <Text style={[styles.miniStatValue, { color: colors.text }]}>{stats.totalStaff}</Text>
                        <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>Total</Text>
                    </View>
                    <View style={[styles.miniStatDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.miniStat}>
                        <Text style={[styles.miniStatValue, { color: colors.accent }]}>
                            {stats.totalSalary > 0 ? `R$${(stats.totalSalary / 1000).toFixed(0)}k` : "—"}
                        </Text>
                        <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>Folha</Text>
                    </View>
                </View>

                {/* Staff Avatars Preview */}
                {topStaff.length > 0 && (
                    <View style={styles.staffPreview}>
                        {topStaff.map((s, i) => (
                            <View key={s.id} style={[styles.staffPreviewItem, { backgroundColor: colors.backgroundSecondary }]}>
                                <View style={[styles.staffAvatar, { backgroundColor: colors.primary + "18" }]}>
                                    <Text style={[styles.staffAvatarText, { color: colors.primary }]}>
                                        {s.name.charAt(0)}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.staffName, { color: colors.text }]} numberOfLines={1}>{s.name}</Text>
                                    <Text style={[styles.staffRole, { color: colors.textSecondary }]} numberOfLines={1}>{s.position}</Text>
                                </View>
                                {s.active && (
                                    <View style={[styles.activeDot, { backgroundColor: "#22c55e" }]} />
                                )}
                            </View>
                        ))}
                    </View>
                )}
            </TouchableOpacity>

            {/* ── Tarefas do Gabinete Card ───────────────────────── */}
            <TouchableOpacity
                style={[styles.moduleCard, { backgroundColor: colors.card }]}
                onPress={() => navigateTo("/manage-tasks")}
                activeOpacity={0.7}
            >
                <View style={styles.moduleHeader}>
                    <View style={[styles.moduleIcon, { backgroundColor: colors.accent + "12" }]}>
                        <ClipboardList color={colors.accent} size={22} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.moduleTitle, { color: colors.text }]}>Tarefas do Gabinete</Text>
                        <Text style={[styles.moduleSubtitle, { color: colors.textSecondary }]}>
                            Atividades, prazos e prioridades
                        </Text>
                    </View>
                    <ChevronRight color={colors.textSecondary} size={18} />
                </View>

                {/* Status chips */}
                <View style={styles.taskStatusGrid}>
                    {(["pendente", "em_andamento", "concluida", "atrasada"] as const).map((st) => {
                        const cfg = STATUS_CONFIG[st];
                        const val = stats[st];
                        return (
                            <View key={st} style={[styles.taskStatusChip, { backgroundColor: cfg.color + "10" }]}>
                                <cfg.icon color={cfg.color} size={16} />
                                <Text style={[styles.taskStatusValue, { color: cfg.color }]}>{val}</Text>
                                <Text style={[styles.taskStatusLabel, { color: cfg.color }]}>{cfg.label}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Progress bar */}
                {stats.totalTasks > 0 && (
                    <View style={styles.progressSection}>
                        <View style={styles.progressHeader}>
                            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Progresso geral</Text>
                            <Text style={[styles.progressValue, { color: colors.primary }]}>{stats.completionPct}%</Text>
                        </View>
                        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                            <View style={[styles.progressBar, { width: `${stats.completionPct}%`, backgroundColor: colors.primary }]} />
                        </View>
                    </View>
                )}

                {/* Recent tasks preview */}
                {recentTasks.length > 0 && (
                    <View style={styles.tasksPreview}>
                        {recentTasks.map((t) => {
                            const sc = STATUS_CONFIG[t.status];
                            return (
                                <View key={t.id} style={[styles.taskPreviewItem, { backgroundColor: colors.backgroundSecondary }]}>
                                    <View style={[styles.taskPrioIndicator, { backgroundColor: PRIO_COLORS[t.priority] }]} />
                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                        <Text style={[styles.taskPreviewTitle, { color: colors.text }]} numberOfLines={1}>{t.title}</Text>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 }}>
                                            <sc.icon color={sc.color} size={12} />
                                            <Text style={{ color: sc.color, fontSize: 11, fontWeight: "600" }}>{sc.label}</Text>
                                            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>• {t.assigneeName}</Text>
                                        </View>
                                    </View>
                                    {t.dueDate && (
                                        <Text style={[styles.taskDueDate, { color: colors.textSecondary }]}>
                                            {new Date(t.dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                                        </Text>
                                    )}
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
        flexDirection: "row" as const, alignItems: "center" as const, gap: 6,
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
    moduleHeader: { flexDirection: "row" as const, alignItems: "center" as const, gap: Spacing.md },
    moduleIcon: {
        width: 44, height: 44, borderRadius: Radius.md,
        justifyContent: "center" as const, alignItems: "center" as const,
    },
    moduleTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
    moduleSubtitle: { fontSize: Typography.sizes.sm, marginTop: 2 },
    // Mini stats
    miniStatsRow: {
        flexDirection: "row" as const, alignItems: "center" as const,
        justifyContent: "space-around" as const, marginTop: Spacing.lg,
        paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.04)",
    },
    miniStat: { alignItems: "center" as const, flex: 1 },
    miniStatValue: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
    miniStatLabel: { fontSize: Typography.sizes.xs, marginTop: 2 },
    miniStatDivider: { width: 1, height: 28 },
    // Staff preview
    staffPreview: { marginTop: Spacing.md, gap: Spacing.sm },
    staffPreviewItem: {
        flexDirection: "row" as const, alignItems: "center" as const,
        padding: Spacing.sm, borderRadius: Radius.md, gap: Spacing.sm,
    },
    staffAvatar: {
        width: 34, height: 34, borderRadius: 17,
        justifyContent: "center" as const, alignItems: "center" as const,
    },
    staffAvatarText: { fontSize: 14, fontWeight: "700" as const },
    staffName: { fontSize: 13, fontWeight: "600" as const },
    staffRole: { fontSize: 11 },
    activeDot: { width: 8, height: 8, borderRadius: 4 },
    // Task status grid
    taskStatusGrid: {
        flexDirection: "row" as const, flexWrap: "wrap" as const,
        gap: Spacing.sm, marginTop: Spacing.lg,
    },
    taskStatusChip: {
        flex: 1, minWidth: "22%" as any, alignItems: "center" as const,
        padding: Spacing.sm, borderRadius: Radius.md, gap: 3,
    },
    taskStatusValue: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
    taskStatusLabel: { fontSize: 10 },
    // Progress
    progressSection: { marginTop: Spacing.md },
    progressHeader: { flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 6 },
    progressLabel: { fontSize: Typography.sizes.sm },
    progressValue: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold },
    progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" as const },
    progressBar: { height: "100%" as const, borderRadius: 3 },
    // Tasks preview
    tasksPreview: { marginTop: Spacing.md, gap: Spacing.sm },
    taskPreviewItem: {
        flexDirection: "row" as const, alignItems: "center" as const,
        padding: Spacing.sm, borderRadius: Radius.md,
    },
    taskPrioIndicator: { width: 4, height: 32, borderRadius: 2 },
    taskPreviewTitle: { fontSize: 13, fontWeight: "600" as const },
    taskDueDate: { fontSize: 11, marginLeft: 8 },
});
