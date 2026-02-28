import React, { useState, useMemo } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
    Modal, Alert, Platform, ActivityIndicator,
} from "react-native";
import {
    ArrowLeft, Plus, ClipboardList, Edit2, Trash2, X, Search,
    CircleCheck, Clock, AlertTriangle, Circle, CheckCircle2,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { GabineteTask, TaskStatus, TaskPriority } from "@/types";
import { Typography, Spacing, Radius } from "@/constants/colors";


const STATUS_CFG: Record<TaskStatus, { label: string; color: string; icon: any }> = {
    pendente: { label: "Pendente", color: "#f59e0b", icon: Circle },
    em_andamento: { label: "Em Andamento", color: "#3b82f6", icon: Clock },
    concluida: { label: "Concluída", color: "#22c55e", icon: CircleCheck },
    atrasada: { label: "Atrasada", color: "#ef4444", icon: AlertTriangle },
};
const PRIO_CFG: Record<TaskPriority, { label: string; color: string }> = {
    baixa: { label: "Baixa", color: "#6b7280" }, media: { label: "Média", color: "#f59e0b" },
    alta: { label: "Alta", color: "#f97316" }, urgente: { label: "Urgente", color: "#ef4444" },
};

export default function ManageTasksScreen() {
    const { colors } = useTheme();
    const { gabineteTasks: realTasks, staff: realStaff, addGabineteTask, updateGabineteTask, deleteGabineteTask } = useData();
    const gabineteTasks = realTasks;
    const staff = realStaff;
    const { showToast } = useToast();

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<GabineteTask | null>(null);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<TaskStatus | "todos">("todos");
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState(""); const [description, setDescription] = useState("");
    const [assigneeId, setAssigneeId] = useState(""); const [priority, setPriority] = useState<TaskPriority>("media");
    const [status, setStatus] = useState<TaskStatus>("pendente"); const [dueDate, setDueDate] = useState("");

    const resetForm = () => { setTitle(""); setDescription(""); setAssigneeId(""); setPriority("media"); setStatus("pendente"); setDueDate(""); setEditing(null); };
    const openAdd = () => { resetForm(); setShowModal(true); };
    const openEdit = (t: GabineteTask) => { setEditing(t); setTitle(t.title); setDescription(t.description); setAssigneeId(t.assigneeId); setPriority(t.priority); setStatus(t.status); setDueDate(t.dueDate || ""); setShowModal(true); };

    const handleSave = async () => {
        if (!title.trim()) { showToast({ title: "Título obrigatório", type: "error" }); return; }
        setSaving(true);
        try {
            const assignee = staff.find(s => s.id === assigneeId);
            const data: any = { title: title.trim(), description: description.trim(), assigneeId: assigneeId || "", assigneeName: assignee?.name || "Não atribuído", priority, status, dueDate: dueDate || new Date().toISOString().split("T")[0] };
            if (editing) { await updateGabineteTask(editing.id, data); showToast({ title: "Atualizada!", type: "success" }); }
            else { await addGabineteTask(data); showToast({ title: "Criada!", type: "success" }); }
            setShowModal(false); resetForm();
        } catch (e: any) { showToast({ title: e.message || "Erro", type: "error" }); } finally { setSaving(false); }
    };

    const handleDelete = (t: GabineteTask) => Alert.alert("Excluir", `"${t.title}"?`, [{ text: "Não", style: "cancel" }, { text: "Sim", style: "destructive", onPress: async () => { try { await deleteGabineteTask(t.id); showToast({ title: "Excluída!", type: "success" }); } catch (e: any) { showToast({ title: e.message, type: "error" }); } } }]);
    const quickStatus = async (t: GabineteTask, s: TaskStatus) => { try { await updateGabineteTask(t.id, { status: s }); } catch { } };

    const stats = useMemo(() => ({
        pendente: gabineteTasks.filter(t => t.status === "pendente").length,
        em_andamento: gabineteTasks.filter(t => t.status === "em_andamento").length,
        concluida: gabineteTasks.filter(t => t.status === "concluida").length,
        atrasada: gabineteTasks.filter(t => t.status === "atrasada").length,
    }), [gabineteTasks]);

    const completionPct = gabineteTasks.length > 0 ? Math.round((stats.concluida / gabineteTasks.length) * 100) : 0;

    const filtered = gabineteTasks.filter(t => {
        const ms = !search || t.title.toLowerCase().includes(search.toLowerCase());
        const mf = filterStatus === "todos" || t.status === filterStatus;
        return ms && mf;
    });

    return (
        <View style={[s.container, { backgroundColor: colors.backgroundSecondary }]}>
            {/* Header */}
            <View style={[s.header, { backgroundColor: colors.card }]}>
                <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={[s.hTitle, { color: colors.text }]}>Tarefas do Gabinete</Text>
                    <Text style={[s.hSub, { color: colors.textSecondary }]}>{gabineteTasks.length} tarefas • {completionPct}% concluído</Text>
                </View>
                <TouchableOpacity onPress={openAdd} style={[s.addBtn, { backgroundColor: colors.primary }]}>
                    <Plus color="#fff" size={20} />
                </TouchableOpacity>
            </View>

            {/* Status filter chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.statsRow} contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: Spacing.sm }}>
                <TouchableOpacity
                    onPress={() => setFilterStatus("todos")}
                    style={[s.statChip, {
                        backgroundColor: filterStatus === "todos" ? colors.primary + "20" : colors.card,
                        borderColor: filterStatus === "todos" ? colors.primary : colors.border,
                    }]}
                >
                    <Text style={[s.statNum, { color: filterStatus === "todos" ? colors.primary : colors.text }]}>{gabineteTasks.length}</Text>
                    <Text style={[s.statLbl, { color: filterStatus === "todos" ? colors.primary : colors.textSecondary }]}>Todos</Text>
                </TouchableOpacity>
                {(Object.keys(STATUS_CFG) as TaskStatus[]).map(st => (
                    <TouchableOpacity
                        key={st}
                        onPress={() => setFilterStatus(filterStatus === st ? "todos" : st)}
                        style={[s.statChip, {
                            backgroundColor: filterStatus === st ? STATUS_CFG[st].color + "20" : colors.card,
                            borderColor: filterStatus === st ? STATUS_CFG[st].color : colors.border,
                        }]}
                    >
                        <Text style={[s.statNum, { color: STATUS_CFG[st].color }]}>{stats[st]}</Text>
                        <Text style={[s.statLbl, { color: STATUS_CFG[st].color }]}>{STATUS_CFG[st].label}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Progress bar */}
            {gabineteTasks.length > 0 && (
                <View style={s.progressWrap}>
                    <View style={[s.progressTrack, { backgroundColor: colors.border }]}>
                        <View style={[s.progressBar, { width: `${completionPct}%`, backgroundColor: colors.primary }]} />
                    </View>
                </View>
            )}

            {/* Search */}
            <View style={s.searchWrap}>
                <View style={[s.searchBox, { backgroundColor: colors.card }]}>
                    <Search color={colors.textSecondary} size={18} />
                    <TextInput style={[s.searchInput, { color: colors.text }]} placeholder="Buscar tarefas..." placeholderTextColor={colors.textSecondary} value={search} onChangeText={setSearch} />
                </View>
            </View>

            {/* List */}
            <ScrollView style={s.list} contentContainerStyle={s.listPad}>
                {filtered.length === 0 ? (
                    <View style={s.empty}>
                        <ClipboardList color={colors.textSecondary} size={48} />
                        <Text style={[s.emptyTxt, { color: colors.textSecondary }]}>Nenhuma tarefa</Text>
                    </View>
                ) : filtered.map(t => {
                    const sc = STATUS_CFG[t.status]; const pc = PRIO_CFG[t.priority]; const Icon = sc.icon;
                    return (
                        <View key={t.id} style={[s.card, { backgroundColor: colors.card }]}>
                            {/* Priority indicator */}
                            <View style={[s.prioStripe, { backgroundColor: pc.color }]} />
                            <View style={s.cardInner}>
                                <View style={s.cardTop}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[s.taskTitle, { color: colors.text }]}>{t.title}</Text>
                                        {t.description ? <Text style={[s.taskDesc, { color: colors.textSecondary }]} numberOfLines={2}>{t.description}</Text> : null}
                                    </View>
                                    <View style={[s.prioBadge, { backgroundColor: pc.color + "18" }]}>
                                        <Text style={{ color: pc.color, fontSize: 11, fontWeight: "700" }}>{pc.label}</Text>
                                    </View>
                                </View>

                                <View style={s.meta}>
                                    <View style={[s.statusChip, { backgroundColor: sc.color + "12" }]}>
                                        <Icon color={sc.color} size={13} />
                                        <Text style={{ color: sc.color, fontSize: 12, fontWeight: "600" }}>{sc.label}</Text>
                                    </View>
                                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>👤 {t.assigneeName || "—"}</Text>
                                    {t.dueDate && (
                                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                                            📅 {new Date(t.dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                                        </Text>
                                    )}
                                </View>

                                <View style={s.actions}>
                                    {t.status !== "concluida" && (
                                        <TouchableOpacity onPress={() => quickStatus(t, "concluida")} style={[s.qBtn, { backgroundColor: "#22c55e15" }]}>
                                            <CheckCircle2 color="#22c55e" size={14} />
                                            <Text style={{ color: "#22c55e", fontSize: 12, fontWeight: "600" }}>Concluir</Text>
                                        </TouchableOpacity>
                                    )}
                                    {t.status === "pendente" && (
                                        <TouchableOpacity onPress={() => quickStatus(t, "em_andamento")} style={[s.qBtn, { backgroundColor: "#3b82f615" }]}>
                                            <Clock color="#3b82f6" size={14} />
                                            <Text style={{ color: "#3b82f6", fontSize: 12, fontWeight: "600" }}>Iniciar</Text>
                                        </TouchableOpacity>
                                    )}
                                    <View style={{ flex: 1 }} />
                                    <TouchableOpacity onPress={() => openEdit(t)} style={[s.actBtn, { backgroundColor: colors.primary + "15" }]}>
                                        <Edit2 color={colors.primary} size={16} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(t)} style={[s.actBtn, { backgroundColor: "#ef444415" }]}>
                                        <Trash2 color="#ef4444" size={16} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </ScrollView>

            {/* Modal */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={s.overlay}>
                    <View style={[s.modal, { backgroundColor: colors.card }]}>
                        <View style={s.mHeader}>
                            <Text style={[s.mTitle, { color: colors.text }]}>{editing ? "Editar" : "Nova"} Tarefa</Text>
                            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                                <X color={colors.textSecondary} size={24} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={s.mBody}>
                            <Text style={[s.label, { color: colors.text }]}>Título *</Text>
                            <TextInput style={[s.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="Título" placeholderTextColor={colors.textSecondary} value={title} onChangeText={setTitle} />

                            <Text style={[s.label, { color: colors.text }]}>Descrição</Text>
                            <TextInput style={[s.input, s.ta, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="Descrição..." placeholderTextColor={colors.textSecondary} value={description} onChangeText={setDescription} multiline numberOfLines={3} />

                            <Text style={[s.label, { color: colors.text }]}>Responsável</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <TouchableOpacity onPress={() => setAssigneeId("")} style={[s.chip, { backgroundColor: !assigneeId ? colors.primary : colors.backgroundSecondary }]}>
                                    <Text style={{ color: !assigneeId ? "#fff" : colors.text, fontSize: 13 }}>Nenhum</Text>
                                </TouchableOpacity>
                                {staff.filter(st => st.active).map(st => (
                                    <TouchableOpacity key={st.id} onPress={() => setAssigneeId(st.id)} style={[s.chip, { backgroundColor: assigneeId === st.id ? colors.primary : colors.backgroundSecondary }]}>
                                        <Text style={{ color: assigneeId === st.id ? "#fff" : colors.text, fontSize: 13 }}>{st.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            <Text style={[s.label, { color: colors.text }]}>Prioridade</Text>
                            <View style={s.chipRow}>
                                {(Object.keys(PRIO_CFG) as TaskPriority[]).map(p => (
                                    <TouchableOpacity key={p} onPress={() => setPriority(p)} style={[s.chip, { backgroundColor: priority === p ? PRIO_CFG[p].color + "20" : colors.backgroundSecondary, borderColor: priority === p ? PRIO_CFG[p].color : colors.border }]}>
                                        <Text style={{ color: priority === p ? PRIO_CFG[p].color : colors.text, fontSize: 13, fontWeight: "600" }}>{PRIO_CFG[p].label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[s.label, { color: colors.text }]}>Prazo</Text>
                            <TextInput style={[s.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="AAAA-MM-DD" placeholderTextColor={colors.textSecondary} value={dueDate} onChangeText={setDueDate} />
                        </ScrollView>
                        <View style={s.mFooter}>
                            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }} style={[s.cancelBtn, { borderColor: colors.border }]}>
                                <Text style={[s.cancelTxt, { color: colors.textSecondary }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSave} disabled={saving} style={[s.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}>
                                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={s.saveTxt}>{editing ? "Atualizar" : "Criar"}</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row", alignItems: "center", padding: Spacing.lg,
        paddingTop: Platform.OS === "ios" ? 56 : Spacing.lg,
        ...Platform.select({ web: { boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }, android: { elevation: 3 } }),
    },
    backBtn: { marginRight: 12 },
    hTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
    hSub: { fontSize: Typography.sizes.sm, marginTop: 2 },
    addBtn: { width: 42, height: 42, borderRadius: Radius.full, justifyContent: "center", alignItems: "center" },
    statsRow: { maxHeight: 80, marginTop: Spacing.md },
    statChip: {
        borderRadius: Radius.md, padding: Spacing.md, alignItems: "center", minWidth: 80,
        borderWidth: 1,
        ...Platform.select({ web: { boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }, android: { elevation: 1 } }),
    },
    statNum: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold },
    statLbl: { fontSize: 11, marginTop: 2 },
    progressWrap: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
    progressTrack: { height: 5, borderRadius: 3, overflow: "hidden" },
    progressBar: { height: "100%", borderRadius: 3 },
    searchWrap: { padding: Spacing.lg, paddingBottom: Spacing.sm },
    searchBox: {
        flexDirection: "row", alignItems: "center", borderRadius: Radius.md,
        paddingHorizontal: 14, paddingVertical: 12,
        ...Platform.select({ web: { boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }, android: { elevation: 1 } }),
    },
    searchInput: { flex: 1, marginLeft: 10, fontSize: Typography.sizes.base },
    list: { flex: 1 },
    listPad: { padding: Spacing.lg, paddingTop: Spacing.sm },
    empty: { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyTxt: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
    card: {
        borderRadius: Radius.lg, marginBottom: Spacing.md, flexDirection: "row", overflow: "hidden",
        ...Platform.select({ web: { boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }, android: { elevation: 2 } }),
    },
    prioStripe: { width: 5 },
    cardInner: { flex: 1, padding: Spacing.lg },
    cardTop: { flexDirection: "row", alignItems: "flex-start" },
    taskTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold },
    taskDesc: { fontSize: Typography.sizes.sm, marginTop: 4, lineHeight: 18 },
    prioBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, marginLeft: 8 },
    statusChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full },
    meta: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10, alignItems: "center" },
    actions: { flexDirection: "row", gap: 8, marginTop: Spacing.md, alignItems: "center" },
    qBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full },
    actBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
    overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
    modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "90%" },
    mHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.06)" },
    mTitle: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
    mBody: { padding: 20 },
    label: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, marginBottom: 6, marginTop: 14 },
    input: { borderRadius: Radius.md, padding: 13, fontSize: Typography.sizes.base, borderWidth: 1 },
    ta: { minHeight: 80, textAlignVertical: "top" },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1, borderColor: "transparent", marginRight: 6, marginBottom: 4 },
    mFooter: { flexDirection: "row", padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)" },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: Radius.md, borderWidth: 1, alignItems: "center" },
    cancelTxt: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold },
    saveBtn: { flex: 2, paddingVertical: 14, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
    saveTxt: { color: "#fff", fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold },
});
