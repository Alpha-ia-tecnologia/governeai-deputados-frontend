import React, { useState, useMemo } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
    Modal, Alert, Platform, ActivityIndicator,
} from "react-native";
import {
    ArrowLeft, Plus, UserCheck, Edit2, Trash2, X, Phone, Mail, Search,
    Briefcase, Building2, Users,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { StaffMember } from "@/types";
import { Typography, Spacing, Radius } from "@/constants/colors";


export default function ManageStaffScreen() {
    const { colors } = useTheme();
    const { staff: realStaff, addStaff, updateStaff, deleteStaff } = useData();
    const staff = realStaff;
    const { showToast } = useToast();

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<StaffMember | null>(null);
    const [search, setSearch] = useState("");
    const [saving, setSaving] = useState(false);
    const [filterDept, setFilterDept] = useState<string>("todos");

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [position, setPosition] = useState("");
    const [department, setDepartment] = useState("");

    const resetForm = () => {
        setName(""); setPhone(""); setEmail(""); setRole("");
        setPosition(""); setDepartment(""); setEditing(null);
    };

    const openAdd = () => { resetForm(); setShowModal(true); };

    const openEdit = (m: StaffMember) => {
        setEditing(m); setName(m.name); setPhone(m.phone);
        setEmail(m.email || ""); setRole(m.role); setPosition(m.position);
        setDepartment(m.department || "");
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!name.trim()) { showToast({ title: "Nome é obrigatório", type: "error" }); return; }
        if (!position.trim()) { showToast({ title: "Cargo é obrigatório", type: "error" }); return; }
        setSaving(true);
        try {
            const data: any = {
                name: name.trim(), phone: phone.trim(), email: email.trim() || undefined,
                role: role.trim(), position: position.trim(),
                department: department.trim() || undefined,
                active: true, startDate: editing?.startDate || new Date().toISOString(),
            };
            if (editing) { await updateStaff(editing.id, data); showToast({ title: "Assessor atualizado!", type: "success" }); }
            else { await addStaff(data); showToast({ title: "Assessor cadastrado!", type: "success" }); }
            setShowModal(false); resetForm();
        } catch (e: any) { showToast({ title: e.message || "Erro ao salvar", type: "error" }); }
        finally { setSaving(false); }
    };

    const handleDelete = (m: StaffMember) => {
        Alert.alert("Excluir Assessor", `Excluir "${m.name}"?`, [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Excluir", style: "destructive", onPress: async () => {
                    try { await deleteStaff(m.id); showToast({ title: "Excluído!", type: "success" }); }
                    catch (e: any) { showToast({ title: e.message, type: "error" }); }
                }
            },
        ]);
    };

    const departments = useMemo(() => {
        const deps = new Set(staff.map((s) => s.department || "Outros").filter(Boolean));
        return ["todos", ...Array.from(deps)];
    }, [staff]);

    const activeStaff = staff.filter((s) => s.active);

    const filtered = useMemo(() => {
        return staff.filter((s) => {
            const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.position.toLowerCase().includes(search.toLowerCase());
            const matchDept = filterDept === "todos" || (s.department || "Outros") === filterDept;
            return matchSearch && matchDept;
        });
    }, [staff, search, filterDept]);

    return (
        <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Equipe do Gabinete</Text>
                    <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
                        {activeStaff.length} ativos de {staff.length}
                    </Text>
                </View>
                <TouchableOpacity onPress={openAdd} style={[styles.addBtn, { backgroundColor: colors.primary }]}>
                    <Plus color="#fff" size={20} />
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                    <Users color={colors.primary} size={20} />
                    <Text style={[styles.statValue, { color: colors.primary }]}>{activeStaff.length}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Ativos</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                    <Building2 color="#f59e0b" size={20} />
                    <Text style={[styles.statValue, { color: "#f59e0b" }]}>{departments.length - 1}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Setores</Text>
                </View>
            </View>

            {/* Department filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
                {departments.map((d) => (
                    <TouchableOpacity
                        key={d}
                        onPress={() => setFilterDept(d)}
                        style={[styles.filterChip, {
                            backgroundColor: filterDept === d ? colors.primary : colors.card,
                            borderColor: filterDept === d ? colors.primary : colors.border,
                        }]}
                    >
                        <Text style={[styles.filterChipText, { color: filterDept === d ? "#fff" : colors.text }]}>
                            {d === "todos" ? "Todos" : d}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Search */}
            <View style={styles.searchWrap}>
                <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
                    <Search color={colors.textSecondary} size={18} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Buscar por nome ou cargo..." placeholderTextColor={colors.textSecondary}
                        value={search} onChangeText={setSearch}
                    />
                </View>
            </View>

            {/* List */}
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                {filtered.length === 0 ? (
                    <View style={styles.emptyState}>
                        <UserCheck color={colors.textSecondary} size={48} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {search ? "Nenhum resultado" : "Nenhum assessor cadastrado"}
                        </Text>
                    </View>
                ) : (
                    filtered.map((m) => (
                        <View key={m.id} style={[styles.card, { backgroundColor: colors.card }]}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.avatar, { backgroundColor: colors.primary + "15" }]}>
                                    <Text style={[styles.avatarText, { color: colors.primary }]}>
                                        {m.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.nameText, { color: colors.text }]}>{m.name}</Text>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 3 }}>
                                        <Briefcase color={colors.textSecondary} size={12} />
                                        <Text style={[styles.positionText, { color: colors.textSecondary }]}>{m.position}</Text>
                                    </View>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: m.active ? "#22c55e20" : "#ef444420" }]}>
                                    <View style={[styles.statusDot, { backgroundColor: m.active ? "#22c55e" : "#ef4444" }]} />
                                    <Text style={[styles.statusText, { color: m.active ? "#22c55e" : "#ef4444" }]}>
                                        {m.active ? "Ativo" : "Inativo"}
                                    </Text>
                                </View>
                            </View>

                            {/* Details */}
                            <View style={styles.detailsRow}>
                                {m.department && (
                                    <View style={[styles.detailChip, { backgroundColor: colors.backgroundSecondary }]}>
                                        <Building2 color={colors.textSecondary} size={12} />
                                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{m.department}</Text>
                                    </View>
                                )}
                                {m.phone && (
                                    <View style={styles.contactItem}>
                                        <Phone color={colors.textSecondary} size={12} />
                                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{m.phone}</Text>
                                    </View>
                                )}
                                {m.email && (
                                    <View style={styles.contactItem}>
                                        <Mail color={colors.textSecondary} size={12} />
                                        <Text style={{ color: colors.textSecondary, fontSize: 12 }} numberOfLines={1}>{m.email}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Actions */}
                            <View style={styles.cardFooter}>
                                <View />
                                <View style={styles.actions}>
                                    <TouchableOpacity onPress={() => openEdit(m)} style={[styles.actBtn, { backgroundColor: colors.primary + "15" }]}>
                                        <Edit2 color={colors.primary} size={16} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(m)} style={[styles.actBtn, { backgroundColor: "#ef444415" }]}>
                                        <Trash2 color="#ef4444" size={16} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Modal */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.overlay}>
                    <View style={[styles.modal, { backgroundColor: colors.card }]}>
                        <View style={styles.mHeader}>
                            <Text style={[styles.mTitle, { color: colors.text }]}>
                                {editing ? "Editar Assessor" : "Novo Assessor"}
                            </Text>
                            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                                <X color={colors.textSecondary} size={24} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.mBody}>
                            <Text style={[styles.label, { color: colors.text }]}>Nome *</Text>
                            <TextInput style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                                placeholder="Nome completo" placeholderTextColor={colors.textSecondary} value={name} onChangeText={setName} />

                            <Text style={[styles.label, { color: colors.text }]}>Cargo *</Text>
                            <TextInput style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                                placeholder="Ex: Assessor Parlamentar" placeholderTextColor={colors.textSecondary} value={position} onChangeText={setPosition} />

                            <Text style={[styles.label, { color: colors.text }]}>Função</Text>
                            <TextInput style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                                placeholder="Ex: Coordenação legislativa" placeholderTextColor={colors.textSecondary} value={role} onChangeText={setRole} />

                            <Text style={[styles.label, { color: colors.text }]}>Departamento</Text>
                            <TextInput style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                                placeholder="Ex: Gabinete" placeholderTextColor={colors.textSecondary} value={department} onChangeText={setDepartment} />

                            <Text style={[styles.label, { color: colors.text }]}>Telefone</Text>
                            <TextInput style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                                placeholder="(00) 00000-0000" placeholderTextColor={colors.textSecondary}
                                value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

                            <Text style={[styles.label, { color: colors.text }]}>E-mail</Text>
                            <TextInput style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                                placeholder="email@example.com" placeholderTextColor={colors.textSecondary}
                                value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                        </ScrollView>

                        <View style={styles.mFooter}>
                            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}
                                style={[styles.cancelBtn, { borderColor: colors.border }]}>
                                <Text style={[styles.cancelTxt, { color: colors.textSecondary }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} disabled={saving}
                                style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}>
                                {saving ? <ActivityIndicator color="#fff" size="small" /> :
                                    <Text style={styles.saveTxt}>{editing ? "Atualizar" : "Cadastrar"}</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row", alignItems: "center", padding: Spacing.lg,
        paddingTop: Platform.OS === "ios" ? 56 : Spacing.lg,
        ...Platform.select({ web: { boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }, android: { elevation: 3 } }),
    },
    backBtn: { marginRight: 12 },
    headerTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
    headerSub: { fontSize: Typography.sizes.sm, marginTop: 2 },
    addBtn: { width: 42, height: 42, borderRadius: Radius.full, justifyContent: "center", alignItems: "center" },
    statsRow: { flexDirection: "row", padding: Spacing.lg, paddingBottom: 0, gap: Spacing.sm },
    statCard: {
        flex: 1, borderRadius: Radius.md, padding: Spacing.md, alignItems: "center", gap: 4,
        ...Platform.select({ web: { boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }, android: { elevation: 2 } }),
    },
    statValue: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
    statLabel: { fontSize: Typography.sizes.xs },
    filterScroll: { maxHeight: 48, marginTop: Spacing.md },
    filterContent: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
    filterChip: {
        paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full,
        borderWidth: 1,
    },
    filterChipText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
    searchWrap: { padding: Spacing.lg, paddingBottom: Spacing.sm },
    searchBox: {
        flexDirection: "row", alignItems: "center", borderRadius: Radius.md,
        paddingHorizontal: 14, paddingVertical: 12,
        ...Platform.select({ web: { boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }, android: { elevation: 1 } }),
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: Typography.sizes.base },
    list: { flex: 1 },
    listContent: { padding: Spacing.lg, paddingTop: Spacing.sm },
    emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyText: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
    card: {
        borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md,
        ...Platform.select({ web: { boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }, android: { elevation: 2 } }),
    },
    cardHeader: { flexDirection: "row", alignItems: "center" },
    avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: "center", alignItems: "center", marginRight: 12 },
    avatarText: { fontSize: 18, fontWeight: "700" },
    nameText: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
    positionText: { fontSize: Typography.sizes.sm },
    statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusText: { fontSize: 11, fontWeight: "600" },
    detailsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
    detailChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.sm },
    contactItem: { flexDirection: "row", alignItems: "center", gap: 5 },
    cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
    actions: { flexDirection: "row", gap: 8 },
    actBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
    overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
    modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "85%" },
    mHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.06)" },
    mTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
    mBody: { padding: 20 },
    label: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, marginBottom: 6, marginTop: 14 },
    input: { borderRadius: Radius.md, padding: 13, fontSize: Typography.sizes.base, borderWidth: 1 },
    row: { flexDirection: "row", marginTop: 4 },
    mFooter: { flexDirection: "row", padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: Radius.md, borderWidth: 1, alignItems: "center" },
    cancelTxt: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold },
    saveBtn: { flex: 2, paddingVertical: 14, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
    saveTxt: { color: "#fff", fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold },
});
