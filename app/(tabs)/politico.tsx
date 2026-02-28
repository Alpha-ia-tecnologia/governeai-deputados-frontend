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
    Handshake,
    Users,
    UserCheck,
    ChevronRight,
    Heart,
    MapPin,
    ShieldCheck,
    ShieldAlert,
    Minus,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useData } from "@/contexts/DataContext";
import { Typography, Spacing, Radius } from "@/constants/colors";


export default function PoliticoScreen() {
    const { colors } = useTheme();
    const { politicalContacts: realContacts, voters, leaders } = useData();
    const contacts = realContacts;

    const stats = useMemo(() => {
        const totalContacts = contacts.length;
        const aliados = contacts.filter((c) => c.relationship === "aliado").length;
        const neutros = contacts.filter((c) => c.relationship === "neutro").length;
        const oposicao = contacts.filter((c) => c.relationship === "oposicao").length;
        const totalVoters = voters.length;
        const totalLeaders = leaders.length;
        return { totalContacts, aliados, neutros, oposicao, totalVoters, totalLeaders };
    }, [contacts, voters, leaders]);

    const topContacts = useMemo(
        () => [...contacts].sort((a, b) => new Date(b.lastContactDate || b.updatedAt).getTime() - new Date(a.lastContactDate || a.updatedAt).getTime()).slice(0, 4),
        [contacts]
    );


    const navigateTo = (route: string) => router.push(route as any);

    const REL_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
        aliado: { label: "Aliado", color: "#22c55e", icon: ShieldCheck },
        neutro: { label: "Neutro", color: "#f59e0b", icon: Minus },
        oposicao: { label: "Oposição", color: "#ef4444", icon: ShieldAlert },
    };

    const ROLE_LABELS: Record<string, string> = {
        prefeito: "Prefeito(a)", vereador: "Vereador(a)", lideranca_comunitaria: "Líder Comunitário",
        secretario: "Secretário(a)", deputado_estadual: "Dep. Estadual", senador: "Senador(a)", outro: "Outro",
    };


    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
            contentContainerStyle={styles.content}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.title, { color: colors.text }]}>Político</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Relacionamentos políticos
                    </Text>
                </View>
            </View>

            {/* Quick chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsContent}>
                <View style={[styles.chip, { backgroundColor: "#22c55e18" }]}>
                    <Handshake color="#22c55e" size={14} />
                    <Text style={[styles.chipText, { color: "#22c55e" }]}>{stats.aliados} aliados</Text>
                </View>
                <View style={[styles.chip, { backgroundColor: colors.primary + "15" }]}>
                    <Users color={colors.primary} size={14} />
                    <Text style={[styles.chipText, { color: colors.primary }]}>{stats.totalContacts} contatos</Text>
                </View>
            </ScrollView>

            {/* ── Contatos Políticos Card ──────────────────────── */}
            <TouchableOpacity
                style={[styles.moduleCard, { backgroundColor: colors.card }]}
                onPress={() => navigateTo("/manage-political-contacts")}
                activeOpacity={0.7}
            >
                <View style={styles.moduleHeader}>
                    <View style={[styles.moduleIcon, { backgroundColor: "#22c55e12" }]}>
                        <Handshake color="#22c55e" size={22} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.moduleTitle, { color: colors.text }]}>Contatos Políticos</Text>
                        <Text style={[styles.moduleSubtitle, { color: colors.textSecondary }]}>
                            Articulação e relacionamentos
                        </Text>
                    </View>
                    <ChevronRight color={colors.textSecondary} size={18} />
                </View>

                {/* Relationship breakdown */}
                <View style={styles.relGrid}>
                    {(["aliado", "neutro", "oposicao"] as const).map((rel) => {
                        const cfg = REL_CONFIG[rel];
                        const val = stats[rel === "aliado" ? "aliados" : rel === "neutro" ? "neutros" : "oposicao"];
                        return (
                            <View key={rel} style={[styles.relChip, { backgroundColor: cfg.color + "10" }]}>
                                <cfg.icon color={cfg.color} size={16} />
                                <Text style={[styles.relValue, { color: cfg.color }]}>{val}</Text>
                                <Text style={[styles.relLabel, { color: cfg.color }]}>{cfg.label}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Relationship bar */}
                <View style={styles.relBarRow}>
                    {stats.aliados > 0 && <View style={[styles.relBar, { flex: stats.aliados, backgroundColor: "#22c55e" }]} />}
                    {stats.neutros > 0 && <View style={[styles.relBar, { flex: stats.neutros, backgroundColor: "#f59e0b" }]} />}
                    {stats.oposicao > 0 && <View style={[styles.relBar, { flex: stats.oposicao, backgroundColor: "#ef4444" }]} />}
                </View>

                {/* Recent contacts */}
                {topContacts.length > 0 && (
                    <View style={styles.listPreview}>
                        {topContacts.map((c) => {
                            const rc = REL_CONFIG[c.relationship] || REL_CONFIG.neutro;
                            return (
                                <View key={c.id} style={[styles.listItem, { backgroundColor: colors.backgroundSecondary }]}>
                                    <View style={[styles.contactAvatar, { backgroundColor: rc.color + "18" }]}>
                                        <Text style={[styles.contactAvatarText, { color: rc.color }]}>{c.name.charAt(0)}</Text>
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                        <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={1}>{c.name}</Text>
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 }}>
                                            <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                                                {ROLE_LABELS[c.politicalRole] || c.politicalRole}
                                            </Text>
                                            {c.party && <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "600" }}>{c.party}</Text>}
                                            <View style={[styles.relDot, { backgroundColor: rc.color }]} />
                                        </View>
                                    </View>
                                    {c.city && (
                                        <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                                            <MapPin color={colors.textSecondary} size={10} />
                                            <Text style={{ color: colors.textSecondary, fontSize: 10 }}>{c.city}</Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                )}
            </TouchableOpacity>

            {/* ── Base Eleitoral Compact Card ────────────────────── */}
            {(stats.totalVoters > 0 || stats.totalLeaders > 0) && (
                <View style={[styles.moduleCard, { backgroundColor: colors.card }]}>
                    <View style={styles.moduleHeader}>
                        <View style={[styles.moduleIcon, { backgroundColor: colors.primary + "12" }]}>
                            <Heart color={colors.primary} size={22} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.moduleTitle, { color: colors.text }]}>Base Eleitoral</Text>
                            <Text style={[styles.moduleSubtitle, { color: colors.textSecondary }]}>
                                Eleitores e lideranças
                            </Text>
                        </View>
                    </View>
                    <View style={styles.baseStatsRow}>
                        <View style={styles.baseStat}>
                            <Users color={colors.primary} size={18} />
                            <Text style={[styles.baseStatValue, { color: colors.text }]}>{stats.totalVoters}</Text>
                            <Text style={[styles.baseStatLabel, { color: colors.textSecondary }]}>Eleitores</Text>
                        </View>
                        <View style={[styles.baseStatDivider, { backgroundColor: colors.border }]} />
                        <View style={styles.baseStat}>
                            <UserCheck color={colors.accent} size={18} />
                            <Text style={[styles.baseStatValue, { color: colors.text }]}>{stats.totalLeaders}</Text>
                            <Text style={[styles.baseStatLabel, { color: colors.textSecondary }]}>Lideranças</Text>
                        </View>
                    </View>
                </View>
            )}

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
    // Relationship grid
    relGrid: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.lg },
    relChip: { flex: 1, alignItems: "center", padding: Spacing.sm, borderRadius: Radius.md, gap: 3 },
    relValue: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
    relLabel: { fontSize: 10 },
    relBarRow: { flexDirection: "row", height: 8, borderRadius: 4, overflow: "hidden", gap: 2, marginTop: Spacing.sm },
    relBar: { borderRadius: 4 },
    relDot: { width: 6, height: 6, borderRadius: 3 },
    // List preview
    listPreview: { marginTop: Spacing.md, gap: Spacing.sm },
    listItem: {
        flexDirection: "row", alignItems: "center",
        padding: Spacing.sm, borderRadius: Radius.md,
    },
    listTitle: { fontSize: 13, fontWeight: "600" },
    contactAvatar: {
        width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center",
    },
    contactAvatarText: { fontSize: 14, fontWeight: "700" },
    // Base stats
    baseStatsRow: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-around",
        marginTop: Spacing.lg, paddingTop: Spacing.md, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.04)",
    },
    baseStat: { alignItems: "center", flex: 1, gap: 4 },
    baseStatValue: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
    baseStatLabel: { fontSize: Typography.sizes.xs },
    baseStatDivider: { width: 1, height: 28 },
    // CEAP - removed
});
