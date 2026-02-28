import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from "react-native";
import {
    TrendingUp,
    TrendingDown,
    Users,
    UserCheck,
    Heart,
    BarChart3,
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    Clock,
    Target,
    Calendar,
    MapPin,
    Lightbulb,
    Activity,
    Zap,
    Award,
} from "lucide-react-native";
import { useTheme } from "@/contexts/ThemeContext";
import { Voter, Leader, HelpRecord, Visit } from "@/types";
import { CategoryColors, ChartColors, Typography, Spacing, Radius, Shadows, withOpacity } from "@/constants/colors";

interface InsightsPanelProps {
    voters: Voter[];
    leaders: Leader[];
    helpRecords: HelpRecord[];
    visits: Visit[];
}

// Labels amigáveis para categorias
const categoryLabels: Record<string, string> = {
    saude: "Saúde",
    educacao: "Educação",
    assistencia_social: "Assistência Social",
    infraestrutura: "Infraestrutura",
    emprego: "Emprego",
    documentacao: "Documentação",
    seguranca: "Segurança",
    transporte: "Transporte",
    habitacao: "Habitação",
    outros: "Outros",
};

// Dias da semana em PT-BR
const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function InsightsPanel({ voters, leaders, helpRecords, visits }: InsightsPanelProps) {
    const { colors } = useTheme();
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        voters: true,
        leaders: true,
        help: true,
        trends: true,
    });

    const toggleSection = (key: string) => {
        setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    // ========== ANÁLISE DE ELEITORES ==========
    const voterInsights = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Distribuição por bairro
        const neighborhoodMap: Record<string, number> = {};
        voters.forEach((v) => {
            const hood = v.neighborhood || "Não informado";
            neighborhoodMap[hood] = (neighborhoodMap[hood] || 0) + 1;
        });
        const neighborhoodDistribution = Object.entries(neighborhoodMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([name, count]) => ({
                name,
                count,
                percentage: voters.length > 0 ? (count / voters.length) * 100 : 0,
            }));

        // Faixa etária
        const ageGroups = { "18-25": 0, "26-35": 0, "36-45": 0, "46-59": 0, "60+": 0, "N/A": 0 };
        voters.forEach((v) => {
            if (!v.birthDate) {
                ageGroups["N/A"]++;
                return;
            }
            const birth = new Date(v.birthDate);
            const age = now.getFullYear() - birth.getFullYear();
            if (age >= 18 && age <= 25) ageGroups["18-25"]++;
            else if (age <= 35) ageGroups["26-35"]++;
            else if (age <= 45) ageGroups["36-45"]++;
            else if (age <= 59) ageGroups["46-59"]++;
            else ageGroups["60+"]++;
        });
        const totalWithAge = voters.length - ageGroups["N/A"];
        const ageDistribution = Object.entries(ageGroups)
            .filter(([key]) => key !== "N/A")
            .map(([range, count]) => ({
                range,
                count,
                percentage: totalWithAge > 0 ? (count / totalWithAge) * 100 : 0,
            }));

        // Crescimento mensal
        const thisMonthVoters = voters.filter((v) => {
            const d = new Date(v.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;

        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const lastMonthVoters = voters.filter((v) => {
            const d = new Date(v.createdAt);
            return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear;
        }).length;

        const growthRate = lastMonthVoters > 0
            ? ((thisMonthVoters - lastMonthVoters) / lastMonthVoters) * 100
            : thisMonthVoters > 0 ? 100 : 0;

        return {
            neighborhoodDistribution,
            ageDistribution,
            thisMonthVoters,
            lastMonthVoters,
            growthRate,
            totalWithAge,
        };
    }, [voters]);

    // ========== PERFORMANCE DAS LIDERANÇAS ==========
    const leaderInsights = useMemo(() => {
        const activeLeaders = leaders.filter((l) => l.active);
        const inactiveLeaders = leaders.filter((l) => !l.active);

        // Ranking por meta
        const ranking = [...activeLeaders]
            .map((l) => ({
                id: l.id,
                name: l.name,
                region: l.region || "—",
                voters: l.votersCount,
                goal: l.votersGoal || 100,
                progress: l.votersGoal > 0 ? (l.votersCount / l.votersGoal) * 100 : 0,
            }))
            .sort((a, b) => b.progress - a.progress)
            .slice(0, 5);

        // Média de captação
        const totalVotersFromLeaders = activeLeaders.reduce((sum, l) => sum + l.votersCount, 0);
        const avgVotersPerLeader = activeLeaders.length > 0
            ? totalVotersFromLeaders / activeLeaders.length
            : 0;

        const totalGoal = activeLeaders.reduce((sum, l) => sum + (l.votersGoal || 100), 0);
        const overallGoalProgress = totalGoal > 0
            ? (totalVotersFromLeaders / totalGoal) * 100
            : 0;

        // Lideranças sem eleitores (possível problema)
        const zeroVoters = activeLeaders.filter((l) => l.votersCount === 0).length;

        return {
            ranking,
            activeCount: activeLeaders.length,
            inactiveCount: inactiveLeaders.length,
            avgVotersPerLeader,
            overallGoalProgress,
            zeroVoters,
        };
    }, [leaders]);

    // ========== ANÁLISE DE ATENDIMENTOS ==========
    const helpInsights = useMemo(() => {
        // Distribuição por categoria
        const categoryMap: Record<string, number> = {};
        helpRecords.forEach((h) => {
            categoryMap[h.category] = (categoryMap[h.category] || 0) + 1;
        });
        const categoryDistribution = Object.entries(categoryMap)
            .sort((a, b) => b[1] - a[1])
            .map(([category, count]) => ({
                category,
                label: categoryLabels[category] || category,
                count,
                percentage: helpRecords.length > 0 ? (count / helpRecords.length) * 100 : 0,
                color: CategoryColors[category] || CategoryColors.outros,
            }));

        // Taxa de resolução
        const completed = helpRecords.filter((h) => h.status === "completed").length;
        const pending = helpRecords.filter((h) => h.status === "pending").length;
        const inProgress = helpRecords.filter((h) => h.status === "in_progress").length;
        const cancelled = helpRecords.filter((h) => h.status === "cancelled").length;
        const resolutionRate = helpRecords.length > 0
            ? (completed / helpRecords.length) * 100
            : 0;

        // Tempo médio de resolução (dias) para os concluídos
        const completedRecords = helpRecords.filter(
            (h) => h.status === "completed" && h.completedAt
        );
        let avgResolutionTime = 0;
        if (completedRecords.length > 0) {
            const totalDays = completedRecords.reduce((sum, h) => {
                const created = new Date(h.createdAt);
                const finished = new Date(h.completedAt!);
                const diffDays = (finished.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
                return sum + Math.max(diffDays, 0);
            }, 0);
            avgResolutionTime = totalDays / completedRecords.length;
        }

        return {
            categoryDistribution,
            completed,
            pending,
            inProgress,
            cancelled,
            resolutionRate,
            avgResolutionTime,
            total: helpRecords.length,
        };
    }, [helpRecords]);

    // ========== TENDÊNCIAS ==========
    const trendInsights = useMemo(() => {
        const now = new Date();

        // Comparativo semanal
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(now.getDate() - now.getDay());
        thisWeekStart.setHours(0, 0, 0, 0);

        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        const lastWeekEnd = new Date(thisWeekStart);

        const thisWeekVoters = voters.filter((v) => new Date(v.createdAt) >= thisWeekStart).length;
        const lastWeekVoters = voters.filter((v) => {
            const d = new Date(v.createdAt);
            return d >= lastWeekStart && d < lastWeekEnd;
        }).length;

        const weeklyChange = lastWeekVoters > 0
            ? ((thisWeekVoters - lastWeekVoters) / lastWeekVoters) * 100
            : thisWeekVoters > 0 ? 100 : 0;

        // Dia da semana com mais cadastros (últimos 30 dias)
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const dayOfWeekCount = [0, 0, 0, 0, 0, 0, 0];
        voters.forEach((v) => {
            const d = new Date(v.createdAt);
            if (d >= thirtyDaysAgo) {
                dayOfWeekCount[d.getDay()]++;
            }
        });
        const peakDayIndex = dayOfWeekCount.indexOf(Math.max(...dayOfWeekCount));
        const peakDay = weekDays[peakDayIndex];
        const peakDayCount = dayOfWeekCount[peakDayIndex];

        // Distribuição por dia da semana (para gráfico de barras)
        const dayDistribution = weekDays.map((day, i) => ({
            day,
            count: dayOfWeekCount[i],
            percentage: Math.max(...dayOfWeekCount) > 0
                ? (dayOfWeekCount[i] / Math.max(...dayOfWeekCount)) * 100
                : 0,
        }));

        // Projeção mensal
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const daysPassed = now.getDate();
        const thisMonthSoFar = voters.filter((v) => {
            const d = new Date(v.createdAt);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).length;
        const dailyRate = daysPassed > 0 ? thisMonthSoFar / daysPassed : 0;
        const monthProjection = Math.round(dailyRate * daysInMonth);

        // Visitas nos últimos 7 dias
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentVisits = visits.filter((v) => new Date(v.date) >= sevenDaysAgo).length;

        return {
            thisWeekVoters,
            lastWeekVoters,
            weeklyChange,
            peakDay,
            peakDayCount,
            dayDistribution,
            monthProjection,
            dailyRate,
            thisMonthSoFar,
            recentVisits,
            daysRemaining: daysInMonth - daysPassed,
        };
    }, [voters, visits]);

    // ========== RENDER HELPERS ==========

    const renderSectionHeader = (
        title: string,
        icon: React.ReactNode,
        sectionKey: string,
        accentColor: string
    ) => (
        <TouchableOpacity
            style={[styles.sectionHeader, { backgroundColor: withOpacity(accentColor, 0.08) }]}
            onPress={() => toggleSection(sectionKey)}
            activeOpacity={0.7}
        >
            <View style={styles.sectionHeaderLeft}>
                <View style={[styles.sectionIcon, { backgroundColor: withOpacity(accentColor, 0.15) }]}>
                    {icon}
                </View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
            </View>
            {expandedSections[sectionKey] ? (
                <ChevronUp color={colors.textSecondary} size={20} />
            ) : (
                <ChevronDown color={colors.textSecondary} size={20} />
            )}
        </TouchableOpacity>
    );

    const renderProgressBar = (
        percentage: number,
        color: string,
        height: number = 8
    ) => (
        <View style={[styles.progressBarBg, { height, backgroundColor: withOpacity(color, 0.15) }]}>
            <View
                style={[
                    styles.progressBarFill,
                    {
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: color,
                        height,
                    },
                ]}
            />
        </View>
    );

    const renderMetricCard = (
        label: string,
        value: string | number,
        icon: React.ReactNode,
        accentColor: string,
        subtitle?: string
    ) => (
        <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.metricIconWrap, { backgroundColor: withOpacity(accentColor, 0.12) }]}>
                {icon}
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
            {subtitle && (
                <Text style={[styles.metricSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
            )}
        </View>
    );

    const renderChangeIndicator = (value: number, suffix: string = "%") => {
        const isPositive = value >= 0;
        return (
            <View style={[styles.changeBadge, { backgroundColor: withOpacity(isPositive ? colors.success : colors.error, 0.12) }]}>
                {isPositive ? (
                    <TrendingUp color={colors.success} size={14} />
                ) : (
                    <TrendingDown color={colors.error} size={14} />
                )}
                <Text
                    style={[
                        styles.changeText,
                        { color: isPositive ? colors.success : colors.error },
                    ]}
                >
                    {isPositive ? "+" : ""}
                    {value.toFixed(1)}{suffix}
                </Text>
            </View>
        );
    };

    // ========== RENDER SECTIONS ==========

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.panelHeader}>
                <View style={styles.panelHeaderLeft}>
                    <Lightbulb color={colors.warning} size={22} />
                    <Text style={[styles.panelTitle, { color: colors.text }]}>
                        Insights & Análises
                    </Text>
                </View>
                <Text style={[styles.panelSubtitle, { color: colors.textSecondary }]}>
                    Dados atualizados em tempo real
                </Text>
            </View>

            {/* ========== ELEITORES ========== */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {renderSectionHeader(
                    "Análise de Eleitores",
                    <Users color={colors.primary} size={18} />,
                    "voters",
                    colors.primary
                )}

                {expandedSections.voters && (
                    <View style={styles.sectionContent}>
                        {/* Crescimento mensal */}
                        <View style={styles.growthRow}>
                            <View style={styles.growthItem}>
                                <Text style={[styles.growthLabel, { color: colors.textSecondary }]}>
                                    Este mês
                                </Text>
                                <Text style={[styles.growthValue, { color: colors.text }]}>
                                    {voterInsights.thisMonthVoters}
                                </Text>
                            </View>
                            <View style={styles.growthItem}>
                                <Text style={[styles.growthLabel, { color: colors.textSecondary }]}>
                                    Mês anterior
                                </Text>
                                <Text style={[styles.growthValue, { color: colors.text }]}>
                                    {voterInsights.lastMonthVoters}
                                </Text>
                            </View>
                            <View style={styles.growthItem}>
                                <Text style={[styles.growthLabel, { color: colors.textSecondary }]}>
                                    Crescimento
                                </Text>
                                {renderChangeIndicator(voterInsights.growthRate)}
                            </View>
                        </View>

                        {/* Distribuição por bairro */}
                        <Text style={[styles.subTitle, { color: colors.text }]}>
                            📍 Top Bairros
                        </Text>
                        {voterInsights.neighborhoodDistribution.map((hood, i) => (
                            <View key={hood.name} style={styles.barItem}>
                                <View style={styles.barHeader}>
                                    <Text
                                        style={[styles.barLabel, { color: colors.text }]}
                                        numberOfLines={1}
                                    >
                                        {hood.name}
                                    </Text>
                                    <Text style={[styles.barValue, { color: colors.textSecondary }]}>
                                        {hood.count} ({hood.percentage.toFixed(1)}%)
                                    </Text>
                                </View>
                                {renderProgressBar(hood.percentage, ChartColors.vibrant[i % ChartColors.vibrant.length])}
                            </View>
                        ))}

                        {/* Faixa etária */}
                        {voterInsights.totalWithAge > 0 && (
                            <>
                                <Text style={[styles.subTitle, { color: colors.text, marginTop: 16 }]}>
                                    👥 Faixa Etária
                                </Text>
                                {voterInsights.ageDistribution.map((age, i) => (
                                    <View key={age.range} style={styles.barItem}>
                                        <View style={styles.barHeader}>
                                            <Text style={[styles.barLabel, { color: colors.text }]}>
                                                {age.range} anos
                                            </Text>
                                            <Text style={[styles.barValue, { color: colors.textSecondary }]}>
                                                {age.count} ({age.percentage.toFixed(1)}%)
                                            </Text>
                                        </View>
                                        {renderProgressBar(age.percentage, ChartColors.primary[i % ChartColors.primary.length])}
                                    </View>
                                ))}
                            </>
                        )}
                    </View>
                )}
            </View>

            {/* ========== LIDERANÇAS ========== */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {renderSectionHeader(
                    "Performance das Lideranças",
                    <Award color={colors.secondary} size={18} />,
                    "leaders",
                    colors.secondary
                )}

                {expandedSections.leaders && (
                    <View style={styles.sectionContent}>
                        {/* Mini Cards */}
                        <View style={styles.metricsRow}>
                            {renderMetricCard(
                                "Ativas",
                                leaderInsights.activeCount,
                                <UserCheck color={colors.secondary} size={18} />,
                                colors.secondary
                            )}
                            {renderMetricCard(
                                "Média/Líder",
                                leaderInsights.avgVotersPerLeader.toFixed(1),
                                <Users color={colors.primary} size={18} />,
                                colors.primary
                            )}
                            {renderMetricCard(
                                "Meta Geral",
                                `${leaderInsights.overallGoalProgress.toFixed(0)}%`,
                                <Target color={colors.accent} size={18} />,
                                colors.accent
                            )}
                        </View>

                        {/* Alerta de lideranças sem eleitores */}
                        {leaderInsights.zeroVoters > 0 && (
                            <View style={[styles.alertCard, { backgroundColor: withOpacity(colors.warning, 0.1), borderColor: withOpacity(colors.warning, 0.3) }]}>
                                <AlertTriangle color={colors.warning} size={16} />
                                <Text style={[styles.alertText, { color: colors.warning }]}>
                                    {leaderInsights.zeroVoters} liderança{leaderInsights.zeroVoters > 1 ? "s" : ""} ativa{leaderInsights.zeroVoters > 1 ? "s" : ""} sem eleitores cadastrados
                                </Text>
                            </View>
                        )}

                        {leaderInsights.inactiveCount > 0 && (
                            <View style={[styles.alertCard, { backgroundColor: withOpacity(colors.error, 0.08), borderColor: withOpacity(colors.error, 0.2) }]}>
                                <AlertTriangle color={colors.error} size={16} />
                                <Text style={[styles.alertText, { color: colors.error }]}>
                                    {leaderInsights.inactiveCount} liderança{leaderInsights.inactiveCount > 1 ? "s" : ""} inativa{leaderInsights.inactiveCount > 1 ? "s" : ""}
                                </Text>
                            </View>
                        )}

                        {/* Top 5 Ranking */}
                        <Text style={[styles.subTitle, { color: colors.text }]}>
                            🏆 Top 5 Lideranças
                        </Text>
                        {leaderInsights.ranking.map((leader, i) => (
                            <View key={leader.id} style={styles.rankItem}>
                                <View style={styles.rankLeft}>
                                    <View
                                        style={[
                                            styles.rankBadge,
                                            {
                                                backgroundColor:
                                                    i === 0
                                                        ? "#FFD700"
                                                        : i === 1
                                                            ? "#C0C0C0"
                                                            : i === 2
                                                                ? "#CD7F32"
                                                                : withOpacity(colors.primary, 0.15),
                                            },
                                        ]}
                                    >
                                        <Text style={[styles.rankNumber, { color: i < 3 ? "#FFF" : colors.primary }]}>
                                            {i + 1}
                                        </Text>
                                    </View>
                                    <View style={styles.rankInfo}>
                                        <Text style={[styles.rankName, { color: colors.text }]} numberOfLines={1}>
                                            {leader.name}
                                        </Text>
                                        <Text style={[styles.rankRegion, { color: colors.textMuted }]}>
                                            {leader.region}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.rankRight}>
                                    <Text style={[styles.rankVoters, { color: colors.text }]}>
                                        {leader.voters}/{leader.goal}
                                    </Text>
                                    <View style={{ width: 60 }}>
                                        {renderProgressBar(
                                            leader.progress,
                                            leader.progress >= 100
                                                ? colors.success
                                                : leader.progress >= 50
                                                    ? colors.primary
                                                    : colors.warning,
                                            6
                                        )}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* ========== ATENDIMENTOS ========== */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {renderSectionHeader(
                    "Análise de Atendimentos",
                    <Heart color={colors.error} size={18} />,
                    "help",
                    colors.error
                )}

                {expandedSections.help && (
                    <View style={styles.sectionContent}>
                        {/* Status Resumo */}
                        <View style={styles.statusRow}>
                            <View style={[styles.statusItem, { backgroundColor: withOpacity(colors.success, 0.1) }]}>
                                <Text style={[styles.statusValue, { color: colors.success }]}>
                                    {helpInsights.completed}
                                </Text>
                                <Text style={[styles.statusLabel, { color: colors.success }]}>Concluídos</Text>
                            </View>
                            <View style={[styles.statusItem, { backgroundColor: withOpacity(colors.warning, 0.1) }]}>
                                <Text style={[styles.statusValue, { color: colors.warning }]}>
                                    {helpInsights.pending}
                                </Text>
                                <Text style={[styles.statusLabel, { color: colors.warning }]}>Pendentes</Text>
                            </View>
                            <View style={[styles.statusItem, { backgroundColor: withOpacity(colors.info, 0.1) }]}>
                                <Text style={[styles.statusValue, { color: colors.info }]}>
                                    {helpInsights.inProgress}
                                </Text>
                                <Text style={[styles.statusLabel, { color: colors.info }]}>Em Andamento</Text>
                            </View>
                        </View>

                        {/* Taxa de resolução */}
                        <View style={styles.resolutionRow}>
                            <View style={styles.resolutionLeft}>
                                <Text style={[styles.resolutionTitle, { color: colors.text }]}>
                                    Taxa de Resolução
                                </Text>
                                <Text style={[styles.resolutionSubtitle, { color: colors.textMuted }]}>
                                    {helpInsights.completed} de {helpInsights.total} atendimentos
                                </Text>
                            </View>
                            <View style={styles.resolutionRight}>
                                <Text
                                    style={[
                                        styles.resolutionPercent,
                                        {
                                            color:
                                                helpInsights.resolutionRate >= 70
                                                    ? colors.success
                                                    : helpInsights.resolutionRate >= 40
                                                        ? colors.warning
                                                        : colors.error,
                                        },
                                    ]}
                                >
                                    {helpInsights.resolutionRate.toFixed(1)}%
                                </Text>
                            </View>
                        </View>
                        {renderProgressBar(
                            helpInsights.resolutionRate,
                            helpInsights.resolutionRate >= 70
                                ? colors.success
                                : helpInsights.resolutionRate >= 40
                                    ? colors.warning
                                    : colors.error,
                            10
                        )}

                        {/* Tempo médio */}
                        {helpInsights.avgResolutionTime > 0 && (
                            <View style={[styles.avgTimeCard, { backgroundColor: withOpacity(colors.info, 0.08) }]}>
                                <Clock color={colors.info} size={16} />
                                <Text style={[styles.avgTimeText, { color: colors.info }]}>
                                    Tempo médio de resolução: {helpInsights.avgResolutionTime.toFixed(1)} dias
                                </Text>
                            </View>
                        )}

                        {/* Distribuição por categoria */}
                        {helpInsights.categoryDistribution.length > 0 && (
                            <>
                                <Text style={[styles.subTitle, { color: colors.text, marginTop: 16 }]}>
                                    📋 Por Categoria
                                </Text>
                                {helpInsights.categoryDistribution.map((cat) => (
                                    <View key={cat.category} style={styles.barItem}>
                                        <View style={styles.barHeader}>
                                            <View style={styles.categoryLabelRow}>
                                                <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
                                                <Text style={[styles.barLabel, { color: colors.text }]}>
                                                    {cat.label}
                                                </Text>
                                            </View>
                                            <Text style={[styles.barValue, { color: colors.textSecondary }]}>
                                                {cat.count} ({cat.percentage.toFixed(1)}%)
                                            </Text>
                                        </View>
                                        {renderProgressBar(cat.percentage, cat.color)}
                                    </View>
                                ))}
                            </>
                        )}
                    </View>
                )}
            </View>

            {/* ========== TENDÊNCIAS ========== */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {renderSectionHeader(
                    "Tendências & Projeções",
                    <Activity color={colors.accent} size={18} />,
                    "trends",
                    colors.accent
                )}

                {expandedSections.trends && (
                    <View style={styles.sectionContent}>
                        {/* Comparativo semanal */}
                        <View style={styles.growthRow}>
                            <View style={styles.growthItem}>
                                <Text style={[styles.growthLabel, { color: colors.textSecondary }]}>
                                    Esta semana
                                </Text>
                                <Text style={[styles.growthValue, { color: colors.text }]}>
                                    {trendInsights.thisWeekVoters}
                                </Text>
                            </View>
                            <View style={styles.growthItem}>
                                <Text style={[styles.growthLabel, { color: colors.textSecondary }]}>
                                    Semana anterior
                                </Text>
                                <Text style={[styles.growthValue, { color: colors.text }]}>
                                    {trendInsights.lastWeekVoters}
                                </Text>
                            </View>
                            <View style={styles.growthItem}>
                                <Text style={[styles.growthLabel, { color: colors.textSecondary }]}>
                                    Variação
                                </Text>
                                {renderChangeIndicator(trendInsights.weeklyChange)}
                            </View>
                        </View>

                        {/* Dia de pico */}
                        <Text style={[styles.subTitle, { color: colors.text }]}>
                            📅 Cadastros por Dia da Semana
                        </Text>
                        <View style={styles.dayChart}>
                            {trendInsights.dayDistribution.map((day) => (
                                <View key={day.day} style={styles.dayColumn}>
                                    <Text style={[styles.dayCount, { color: colors.textSecondary }]}>
                                        {day.count}
                                    </Text>
                                    <View style={styles.dayBarWrapper}>
                                        <View
                                            style={[
                                                styles.dayBar,
                                                {
                                                    height: `${Math.max(day.percentage, 5)}%`,
                                                    backgroundColor:
                                                        day.day === trendInsights.peakDay
                                                            ? colors.primary
                                                            : withOpacity(colors.primary, 0.3),
                                                    borderRadius: 4,
                                                },
                                            ]}
                                        />
                                    </View>
                                    <Text
                                        style={[
                                            styles.dayLabel,
                                            {
                                                color:
                                                    day.day === trendInsights.peakDay
                                                        ? colors.primary
                                                        : colors.textMuted,
                                                fontWeight: day.day === trendInsights.peakDay ? "700" : "400",
                                            },
                                        ]}
                                    >
                                        {day.day}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        {/* Projeção */}
                        <View style={[styles.projectionCard, { backgroundColor: withOpacity(colors.accent, 0.08), borderColor: withOpacity(colors.accent, 0.2) }]}>
                            <View style={styles.projectionHeader}>
                                <Zap color={colors.accent} size={18} />
                                <Text style={[styles.projectionTitle, { color: colors.accent }]}>
                                    Projeção Mensal
                                </Text>
                            </View>
                            <View style={styles.projectionBody}>
                                <View style={styles.projectionItem}>
                                    <Text style={[styles.projectionValue, { color: colors.text }]}>
                                        {trendInsights.thisMonthSoFar}
                                    </Text>
                                    <Text style={[styles.projectionLabel, { color: colors.textSecondary }]}>
                                        Cadastros até agora
                                    </Text>
                                </View>
                                <View style={[styles.projectionDivider, { backgroundColor: colors.border }]} />
                                <View style={styles.projectionItem}>
                                    <Text style={[styles.projectionValue, { color: colors.accent }]}>
                                        ~{trendInsights.monthProjection}
                                    </Text>
                                    <Text style={[styles.projectionLabel, { color: colors.textSecondary }]}>
                                        Projeção final
                                    </Text>
                                </View>
                                <View style={[styles.projectionDivider, { backgroundColor: colors.border }]} />
                                <View style={styles.projectionItem}>
                                    <Text style={[styles.projectionValue, { color: colors.text }]}>
                                        {trendInsights.dailyRate.toFixed(1)}
                                    </Text>
                                    <Text style={[styles.projectionLabel, { color: colors.textSecondary }]}>
                                        Média/dia
                                    </Text>
                                </View>
                            </View>
                            <Text style={[styles.projectionFooter, { color: colors.textMuted }]}>
                                Faltam {trendInsights.daysRemaining} dias para o fim do mês
                            </Text>
                        </View>

                        {/* Visitas recentes */}
                        <View style={[styles.avgTimeCard, { backgroundColor: withOpacity(colors.secondary, 0.08) }]}>
                            <MapPin color={colors.secondary} size={16} />
                            <Text style={[styles.avgTimeText, { color: colors.secondary }]}>
                                {trendInsights.recentVisits} visita{trendInsights.recentVisits !== 1 ? "s" : ""} nos últimos 7 dias
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
        marginBottom: 24,
    },
    panelHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    panelHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    panelTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
    },
    panelSubtitle: {
        fontSize: Typography.sizes.sm,
    },

    // Section
    section: {
        borderRadius: Radius.lg,
        borderWidth: 1,
        overflow: "hidden",
        ...Shadows.md,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: Spacing.lg,
    },
    sectionHeaderLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    sectionIcon: {
        width: 32,
        height: 32,
        borderRadius: Radius.sm,
        justifyContent: "center",
        alignItems: "center",
    },
    sectionTitle: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
    },
    sectionContent: {
        padding: Spacing.lg,
        paddingTop: 0,
    },
    subTitle: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        marginBottom: 12,
    },

    // Growth Row
    growthRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 20,
        gap: 8,
    },
    growthItem: {
        flex: 1,
        alignItems: "center",
        gap: 4,
    },
    growthLabel: {
        fontSize: Typography.sizes.xs,
        textAlign: "center",
    },
    growthValue: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
    },

    // Bar Items
    barItem: {
        marginBottom: 10,
    },
    barHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    barLabel: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
        flex: 1,
    },
    barValue: {
        fontSize: Typography.sizes.sm,
    },
    progressBarBg: {
        borderRadius: 999,
        overflow: "hidden",
    },
    progressBarFill: {
        borderRadius: 999,
    },

    // Metrics
    metricsRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 12,
    },
    metricCard: {
        flex: 1,
        borderRadius: Radius.md,
        padding: Spacing.md,
        alignItems: "center",
        borderWidth: 1,
        gap: 4,
    },
    metricIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 4,
    },
    metricValue: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
    },
    metricLabel: {
        fontSize: Typography.sizes.xs,
        textAlign: "center",
    },
    metricSubtitle: {
        fontSize: Typography.sizes.xs,
        textAlign: "center",
    },

    // Change Badge
    changeBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: Radius.full,
    },
    changeText: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
    },

    // Alert
    alertCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: Spacing.md,
        borderRadius: Radius.md,
        borderWidth: 1,
        marginBottom: 12,
    },
    alertText: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
        flex: 1,
    },

    // Ranking
    rankItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 8,
    },
    rankLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    rankBadge: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center",
    },
    rankNumber: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.bold,
    },
    rankInfo: {
        flex: 1,
    },
    rankName: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    rankRegion: {
        fontSize: Typography.sizes.xs,
    },
    rankRight: {
        alignItems: "flex-end",
        gap: 4,
    },
    rankVoters: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
    },

    // Status Row
    statusRow: {
        flexDirection: "row",
        gap: 8,
        marginBottom: 16,
    },
    statusItem: {
        flex: 1,
        borderRadius: Radius.md,
        padding: Spacing.md,
        alignItems: "center",
        gap: 2,
    },
    statusValue: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
    },
    statusLabel: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.medium,
    },

    // Resolution
    resolutionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    resolutionLeft: {},
    resolutionRight: {},
    resolutionTitle: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
    },
    resolutionSubtitle: {
        fontSize: Typography.sizes.xs,
        marginTop: 2,
    },
    resolutionPercent: {
        fontSize: Typography.sizes.xxl,
        fontWeight: Typography.weights.bold,
    },

    // Avg Time
    avgTimeCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: Spacing.md,
        borderRadius: Radius.md,
        marginTop: 12,
    },
    avgTimeText: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },

    // Category
    categoryLabelRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        flex: 1,
    },
    categoryDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },

    // Day Chart
    dayChart: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        height: 120,
        gap: 4,
        marginBottom: 16,
    },
    dayColumn: {
        flex: 1,
        alignItems: "center",
        height: "100%",
    },
    dayCount: {
        fontSize: 10,
        marginBottom: 4,
    },
    dayBarWrapper: {
        flex: 1,
        width: "100%",
        justifyContent: "flex-end",
        alignItems: "center",
    },
    dayBar: {
        width: "70%",
        minHeight: 4,
    },
    dayLabel: {
        fontSize: 11,
        marginTop: 4,
    },

    // Projection
    projectionCard: {
        borderRadius: Radius.md,
        borderWidth: 1,
        padding: Spacing.lg,
        marginTop: 4,
    },
    projectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    projectionTitle: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
    },
    projectionBody: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        marginBottom: 12,
    },
    projectionItem: {
        alignItems: "center",
        gap: 2,
    },
    projectionValue: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.bold,
    },
    projectionLabel: {
        fontSize: Typography.sizes.xs,
        textAlign: "center",
    },
    projectionDivider: {
        width: 1,
        height: 40,
    },
    projectionFooter: {
        fontSize: Typography.sizes.xs,
        textAlign: "center",
    },
});
