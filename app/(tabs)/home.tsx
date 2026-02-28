import React, { useMemo, useCallback } from "react";
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
  UserCheck,
  Gavel,
  Building2,
  TrendingUp,
  MapPin,
  Calendar,
  ClipboardList,
  Handshake,
  ChevronRight,
  CircleCheck,
  Clock,
  FileText,
} from "lucide-react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useTheme } from "@/contexts/ThemeContext";
import HeatMap from "@/components/HeatMap";
import { SkeletonStatCard, SkeletonCard } from "@/components/Skeleton";
import { EnhancedStatCard } from "@/components/EnhancedStatCard";
import { InteractiveChart } from "@/components/InteractiveChart";
import { BirthdayWidget } from "@/components/BirthdayWidget";
import { InsightsPanel } from "@/components/InsightsPanel";
import { Breadcrumb } from "@/components/ui/index";
import { Typography, Spacing, Radius } from "@/constants/colors";

export default function HomeScreen() {
  const { user } = useAuth();
  const {
    voters,
    leaders,
    helpRecords,
    visits,
    projects,
    appointments,
    staff,
    gabineteTasks,
    bills,
    politicalContacts,
    isLoading,
  } = useData();
  const { colors } = useTheme();

  // ── Deputado Dashboard Stats ─────────────────────────────────────
  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Gabinete
    const totalStaff = staff.length;
    const totalTasks = gabineteTasks.length;
    const tasksPending = gabineteTasks.filter(
      (t) => t.status === "pendente" || t.status === "em_andamento"
    ).length;
    const tasksCompleted = gabineteTasks.filter(
      (t) => t.status === "concluida"
    ).length;

    // Legislativo
    const totalBills = bills.length;
    const billsTramitando = bills.filter(
      (b) => b.status === "em_tramitacao"
    ).length;
    const billsAprovados = bills.filter(
      (b) => b.status === "aprovado"
    ).length;

    // Político
    const totalContacts = politicalContacts.length;
    const totalVoters = voters.length;
    const activeLeaders = leaders.filter((l) => l.active).length;

    // Agenda
    const todayEvents = appointments.filter(
      (a) => a.date === today && a.status === "scheduled"
    ).length;
    const upcomingEvents = appointments.filter((a) => {
      return a.date >= today && a.status === "scheduled";
    }).length;

    // Help records / Atendimentos
    const pendingHelps = helpRecords.filter(
      (h) => h.status === "pending"
    ).length;

    return {
      totalStaff,
      totalTasks,
      tasksPending,
      tasksCompleted,
      totalBills,
      billsTramitando,
      billsAprovados,
      totalContacts,
      totalVoters,
      activeLeaders,
      todayEvents,
      upcomingEvents,
      pendingHelps,
      totalHelps: helpRecords.length,
    };
  }, [
    staff,
    gabineteTasks,
    bills,
    politicalContacts,
    voters,
    leaders,
    appointments,
    helpRecords,
  ]);

  // ── Tasks completion percentage ──────────────────────────────────
  const taskCompletionPct = useMemo(() => {
    if (stats.totalTasks === 0) return 0;
    return Math.round((stats.tasksCompleted / stats.totalTasks) * 100);
  }, [stats.totalTasks, stats.tasksCompleted]);

  // ── Sparkline helpers ────────────────────────────────────────────
  const generateSparkline = useCallback(
    (records: any[], dateField: string = "createdAt") => {
      const now = new Date();
      const days = 7;
      const sparkline: number[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));
        const count = records.filter((r) => {
          const recordDate = new Date(r[dateField]);
          return recordDate >= dayStart && recordDate <= dayEnd;
        }).length;
        sparkline.push(count);
      }
      return sparkline;
    },
    []
  );

  // ── Chart data ───────────────────────────────────────────────────
  const chartData = useMemo(() => {
    const generatePeriodData = (days: number) => {
      const data = [];
      const now = new Date();
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dayStart = new Date(date.setHours(0, 0, 0, 0));
        const dayEnd = new Date(date.setHours(23, 59, 59, 999));

        const voterCount = voters.filter((v) => {
          const createdDate = new Date(v.createdAt);
          return createdDate >= dayStart && createdDate <= dayEnd;
        }).length;

        const visitCount = visits.filter((v) => {
          const visitDate = new Date(v.date);
          return visitDate >= dayStart && visitDate <= dayEnd;
        }).length;

        data.push({
          label: date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          }),
          value: voterCount,
          secondaryValue: visitCount,
        });
      }

      if (days > 14) {
        const aggregated = [];
        for (let i = 0; i < data.length; i += 7) {
          const weekData = data.slice(i, i + 7);
          const totalVoters = weekData.reduce((sum, d) => sum + d.value, 0);
          const totalVisits = weekData.reduce(
            (sum, d) => sum + d.secondaryValue,
            0
          );
          aggregated.push({
            label: weekData[0]?.label || "",
            value: totalVoters,
            secondaryValue: totalVisits,
          });
        }
        return aggregated.slice(-Math.min(aggregated.length, 12));
      }
      return data;
    };

    return {
      "7d": generatePeriodData(7),
      "30d": generatePeriodData(30),
      "90d": generatePeriodData(90),
    };
  }, [voters, visits]);

  const handleNavigate = (route: string) => {
    router.push(route as any);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const renderSkeletons = () => (
    <>
      <View style={styles.statsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonStatCard key={i} style={{ width: "48%" }} />
        ))}
      </View>
      <View style={styles.section}>
        <SkeletonCard style={{ marginBottom: 12 }} />
        <SkeletonCard style={{ marginBottom: 12 }} />
        <SkeletonCard />
      </View>
    </>
  );

  // ── Role label ───────────────────────────────────────────────────
  const roleLabel =
    user?.role === "vereador"
      ? "Deputado(a)"
      : user?.role === "admin"
        ? "Administrador"
        : user?.role === "lideranca"
          ? "Liderança"
          : "Assessor(a)";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      contentContainerStyle={styles.content}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Breadcrumb
            items={[
              { label: "Início", href: "/" },
              { label: "Dashboard" },
            ]}
            onNavigate={handleNavigate}
          />
          <Text style={[styles.greeting, { color: colors.text }]}>
            Olá, {user?.name}!
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {roleLabel}
            {user?.city ? ` — ${user.city}` : ""}
          </Text>
        </View>
      </View>

      {/* Quick Action Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsContent}
      >
        {stats.todayEvents > 0 && (
          <TouchableOpacity
            style={[styles.quickChip, { backgroundColor: colors.info + "18" }]}
            onPress={() => handleNavigate("/agenda")}
          >
            <Calendar color={colors.info} size={14} />
            <Text style={[styles.quickChipText, { color: colors.info }]}>
              {stats.todayEvents} compromisso{stats.todayEvents > 1 ? "s" : ""} hoje
            </Text>
          </TouchableOpacity>
        )}
        {stats.tasksPending > 0 && (
          <TouchableOpacity
            style={[styles.quickChip, { backgroundColor: colors.warning + "18" }]}
            onPress={() => handleNavigate("/manage-tasks")}
          >
            <ClipboardList color={colors.warning} size={14} />
            <Text style={[styles.quickChipText, { color: colors.warning }]}>
              {stats.tasksPending} tarefa{stats.tasksPending > 1 ? "s" : ""} pendente{stats.tasksPending > 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>
        )}
        {stats.billsTramitando > 0 && (
          <TouchableOpacity
            style={[styles.quickChip, { backgroundColor: colors.accent + "18" }]}
            onPress={() => handleNavigate("/manage-bills")}
          >
            <Gavel color={colors.accent} size={14} />
            <Text style={[styles.quickChipText, { color: colors.accent }]}>
              {stats.billsTramitando} projeto{stats.billsTramitando > 1 ? "s" : ""} em tramitação
            </Text>
          </TouchableOpacity>
        )}
        {stats.pendingHelps > 0 && (
          <TouchableOpacity
            style={[styles.quickChip, { backgroundColor: colors.error + "18" }]}
            onPress={() => handleNavigate("/manage-tasks")}
          >
            <Clock color={colors.error} size={14} />
            <Text style={[styles.quickChipText, { color: colors.error }]}>
              {stats.pendingHelps} atendimento{stats.pendingHelps > 1 ? "s" : ""} pendente{stats.pendingHelps > 1 ? "s" : ""}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Heat Map */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MapPin color={colors.primary} size={20} />
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Mapa de Calor — Eleitores
          </Text>
        </View>
        <HeatMap height={280} />
      </View>

      {isLoading ? (
        renderSkeletons()
      ) : (
        <>
          {/* ── Primary KPI Row ─────────────────────────────────── */}
          <View style={styles.statsGrid}>
            <EnhancedStatCard
              title="Equipe do Gabinete"
              value={stats.totalStaff}
              subtitle={`${stats.totalTasks} tarefas`}
              icon={<Building2 color={colors.primary} size={22} />}
              color={colors.primary}
              delay={0}
            />
            <EnhancedStatCard
              title="Projetos de Lei"
              value={stats.totalBills}
              subtitle={`${stats.billsTramitando} tramitando`}
              sparklineData={generateSparkline(bills)}
              icon={<Gavel color={colors.accent} size={22} />}
              color={colors.accent}
              delay={100}
            />
            <EnhancedStatCard
              title="Articulação Política"
              value={stats.totalContacts}
              subtitle={`${stats.activeLeaders} lideranças ativas`}
              icon={<Handshake color={colors.secondary} size={22} />}
              color={colors.secondary}
              delay={200}
            />
            <EnhancedStatCard
              title="Base Eleitoral"
              value={stats.totalVoters}
              sparklineData={generateSparkline(voters)}
              icon={<Users color={colors.info} size={22} />}
              color={colors.info}
              delay={300}
            />
          </View>

          {/* ── Module Quick Access Cards ───────────────────────── */}
          <View style={styles.moduleGrid}>
            {/* Gabinete Overview Card */}
            <TouchableOpacity
              style={[styles.moduleQuickCard, { backgroundColor: colors.card }]}
              onPress={() => handleNavigate("/manage-tasks")}
              activeOpacity={0.7}
            >
              <View style={styles.moduleQuickHeader}>
                <View style={[styles.moduleQuickIcon, { backgroundColor: colors.primary + "12" }]}>
                  <Building2 color={colors.primary} size={20} />
                </View>
                <Text style={[styles.moduleQuickTitle, { color: colors.text }]}>
                  Gabinete
                </Text>
                <ChevronRight color={colors.textSecondary} size={16} />
              </View>
              {stats.totalTasks > 0 && (
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                      Tarefas concluídas
                    </Text>
                    <Text style={[styles.progressValue, { color: colors.primary }]}>
                      {taskCompletionPct}%
                    </Text>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          backgroundColor: colors.primary,
                          width: `${taskCompletionPct}%`,
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.progressMeta}>
                    <Text style={[styles.progressMetaText, { color: colors.textSecondary }]}>
                      {stats.tasksCompleted}/{stats.totalTasks}
                    </Text>
                    {stats.tasksPending > 0 && (
                      <Text style={[styles.progressMetaText, { color: colors.warning }]}>
                        {stats.tasksPending} pendente{stats.tasksPending > 1 ? "s" : ""}
                      </Text>
                    )}
                  </View>
                </View>
              )}
            </TouchableOpacity>

            {/* Legislativo Overview Card */}
            <TouchableOpacity
              style={[styles.moduleQuickCard, { backgroundColor: colors.card }]}
              onPress={() => handleNavigate("/manage-bills")}
              activeOpacity={0.7}
            >
              <View style={styles.moduleQuickHeader}>
                <View style={[styles.moduleQuickIcon, { backgroundColor: colors.accent + "12" }]}>
                  <Gavel color={colors.accent} size={20} />
                </View>
                <Text style={[styles.moduleQuickTitle, { color: colors.text }]}>
                  Legislativo
                </Text>
                <ChevronRight color={colors.textSecondary} size={16} />
              </View>
              <View style={styles.miniStatsRow}>
                <View style={styles.miniStat}>
                  <Clock color={colors.info} size={14} />
                  <Text style={[styles.miniStatValue, { color: colors.info }]}>
                    {stats.billsTramitando}
                  </Text>
                  <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>
                    tramitando
                  </Text>
                </View>
                <View style={[styles.miniStatDivider, { backgroundColor: colors.border }]} />
                <View style={styles.miniStat}>
                  <CircleCheck color={colors.success} size={14} />
                  <Text style={[styles.miniStatValue, { color: colors.success }]}>
                    {stats.billsAprovados}
                  </Text>
                  <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>
                    aprovados
                  </Text>
                </View>
              </View>
            </TouchableOpacity>

            {/* Político Overview Card */}
            <TouchableOpacity
              style={[styles.moduleQuickCard, { backgroundColor: colors.card }]}
              onPress={() => handleNavigate("/manage-political-contacts")}
              activeOpacity={0.7}
            >
              <View style={styles.moduleQuickHeader}>
                <View style={[styles.moduleQuickIcon, { backgroundColor: colors.secondary + "12" }]}>
                  <Handshake color={colors.secondary} size={20} />
                </View>
                <Text style={[styles.moduleQuickTitle, { color: colors.text }]}>
                  Político
                </Text>
                <ChevronRight color={colors.textSecondary} size={16} />
              </View>
              <View style={styles.miniStatsRow}>
                <View style={styles.miniStat}>
                  <Handshake color={colors.secondary} size={14} />
                  <Text style={[styles.miniStatValue, { color: colors.secondary }]}>
                    {stats.totalContacts}
                  </Text>
                  <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>
                    contatos
                  </Text>
                </View>
                <View style={[styles.miniStatDivider, { backgroundColor: colors.border }]} />
                <View style={styles.miniStat}>
                  <Users color={colors.info} size={14} />
                  <Text style={[styles.miniStatValue, { color: colors.info }]}>
                    {stats.totalVoters}
                  </Text>
                  <Text style={[styles.miniStatLabel, { color: colors.textSecondary }]}>
                    eleitores
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Birthday Widget */}
          <BirthdayWidget voters={voters} leaders={leaders} />

          {/* Interactive Chart */}
          <View style={styles.section}>
            <InteractiveChart
              title="Evolução de Cadastros"
              subtitle="Eleitores e visitas ao longo do tempo"
              data={chartData}
              primaryColor={colors.primary}
              secondaryColor={colors.accent}
              primaryLabel="Eleitores"
              secondaryLabel="Visitas"
            />
          </View>

          {/* Insights & Analytics */}
          <InsightsPanel
            voters={voters}
            leaders={leaders}
            helpRecords={helpRecords}
            visits={visits}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 32 },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    marginTop: 8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: Typography.sizes.base,
  },
  chipsScroll: {
    marginBottom: Spacing.lg,
  },
  chipsContent: {
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  quickChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  quickChipText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
  },
  statsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
    marginBottom: Spacing.xxl,
  },
  section: {
    marginBottom: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
  },
  // ── Module Quick Cards ────────────────────────────────────
  moduleGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  moduleQuickCard: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Platform.select({
      web: { boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
      android: { elevation: 2 },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
    }),
  },
  moduleQuickHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  moduleQuickIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  moduleQuickTitle: {
    flex: 1,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
  },
  // ── Progress Section ──────────────────────────────────────
  progressSection: {},
  progressHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: Typography.sizes.sm,
  },
  progressValue: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden" as const,
  },
  progressBar: {
    height: "100%" as const,
    borderRadius: 3,
  },
  progressMeta: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginTop: 6,
  },
  progressMetaText: {
    fontSize: Typography.sizes.xs,
  },
  // ── Mini Stats Row ────────────────────────────────────────
  miniStatsRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-around" as const,
  },
  miniStat: {
    alignItems: "center" as const,
    gap: 3,
    flex: 1,
  },
  miniStatValue: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.bold,
  },
  miniStatLabel: {
    fontSize: Typography.sizes.xs,
  },
  miniStatDivider: {
    width: 1,
    height: 32,
  },
});
