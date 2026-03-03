import React, { useState, useMemo } from "react";
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
    Modal, Platform, ActivityIndicator,
} from "react-native";
import {
    ArrowLeft, Plus, ClipboardList, Edit2, Trash2, X, Search,
    CircleCheck, Clock, AlertTriangle, Circle, CheckCircle2,
    ChevronRight, ChevronLeft, LayoutGrid, List, Palette, User, Calendar,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useData } from "@/contexts/DataContext";
import { GabineteTask, TaskStatus, TaskPriority } from "@/types";
import { useAlertDialog } from "@/components/Advanced";
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

const STATUS_ORDER: TaskStatus[] = ["pendente", "em_andamento", "concluida", "atrasada"];

const CARD_COLORS = [
    "#3b82f6", "#22c55e", "#ef4444", "#f59e0b", "#8b5cf6",
    "#ec4899", "#06b6d4", "#f97316", "#6366f1", "#14b8a6",
];

export default function ManageTasksScreen() {
    const { colors } = useTheme();
    const { gabineteTasks: realTasks, staff: realStaff, addGabineteTask, updateGabineteTask, deleteGabineteTask } = useData();
    const gabineteTasks = realTasks;
    const staff = realStaff;
    const { showAlert: showDeleteAlert, AlertDialogComponent: DeleteAlertDialog } = useAlertDialog();
    const { showAlert: showFeedbackAlert, AlertDialogComponent: FeedbackAlertDialog } = useAlertDialog();

    const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<GabineteTask | null>(null);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<TaskStatus | "todos">("todos");
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [assigneeId, setAssigneeId] = useState("");
    const [priority, setPriority] = useState<TaskPriority>("media");
    const [status, setStatus] = useState<TaskStatus>("pendente");
    const [dueDate, setDueDate] = useState("");
    const [taskColor, setTaskColor] = useState("");

    const resetForm = () => { setTitle(""); setDescription(""); setAssigneeId(""); setPriority("media"); setStatus("pendente"); setDueDate(""); setTaskColor(""); setEditing(null); };
    const openAdd = (forStatus?: TaskStatus) => { resetForm(); if (forStatus) setStatus(forStatus); setShowModal(true); };
    const openEdit = (t: GabineteTask) => { setEditing(t); setTitle(t.title); setDescription(t.description); setAssigneeId(t.assigneeId); setPriority(t.priority); setStatus(t.status); setDueDate(t.dueDate || ""); setTaskColor(t.color || ""); setShowModal(true); };

    const handleSave = async () => {
        if (!title.trim()) { showFeedbackAlert({ title: "Campo obrigatório", description: "O título é obrigatório.", confirmText: "Entendi", variant: "warning", showCancel: false }); return; }
        setSaving(true);
        try {
            const assignee = staff.find(s => s.id === assigneeId);
            const data: any = { title: title.trim(), description: description.trim(), assigneeId: assigneeId || "", assigneeName: assignee?.name || "Não atribuído", priority, status, dueDate: dueDate || new Date().toISOString().split("T")[0], color: taskColor || undefined };
            if (editing) { await updateGabineteTask(editing.id, data); showFeedbackAlert({ title: "Tarefa atualizada!", description: "A tarefa foi atualizada com sucesso.", confirmText: "OK", variant: "success", showCancel: false }); }
            else { await addGabineteTask(data); showFeedbackAlert({ title: "Tarefa criada!", description: "A tarefa foi criada com sucesso.", confirmText: "OK", variant: "success", showCancel: false }); }
            setShowModal(false); resetForm();
        } catch (e: any) { showFeedbackAlert({ title: "Erro ao salvar", description: e.message || "Não foi possível salvar a tarefa.", confirmText: "Fechar", variant: "danger", showCancel: false }); } finally { setSaving(false); }
    };

    const handleDelete = (t: GabineteTask) => showDeleteAlert({
        title: "Excluir tarefa",
        description: `Tem certeza que deseja excluir "${t.title}"? Esta ação não pode ser desfeita.`,
        confirmText: "Excluir",
        cancelText: "Cancelar",
        variant: "danger",
        onConfirm: async () => {
            try {
                await deleteGabineteTask(t.id);
                showFeedbackAlert({ title: "Tarefa excluída", description: "A tarefa foi removida com sucesso.", confirmText: "OK", variant: "success", showCancel: false });
            } catch (e: any) {
                showFeedbackAlert({ title: "Erro ao excluir", description: e.message || "Não foi possível excluir a tarefa.", confirmText: "Fechar", variant: "danger", showCancel: false });
            }
        },
    });

    const quickStatus = async (t: GabineteTask, s: TaskStatus) => { try { await updateGabineteTask(t.id, { status: s }); } catch { } };

    const moveTask = async (t: GabineteTask, direction: "left" | "right") => {
        const currentIdx = STATUS_ORDER.indexOf(t.status);
        const newIdx = direction === "right" ? Math.min(currentIdx + 1, STATUS_ORDER.length - 1) : Math.max(currentIdx - 1, 0);
        if (newIdx !== currentIdx) {
            await quickStatus(t, STATUS_ORDER[newIdx]);
        }
    };

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

    const tasksByStatus = useMemo(() => {
        const map: Record<TaskStatus, GabineteTask[]> = { pendente: [], em_andamento: [], concluida: [], atrasada: [] };
        const searchFiltered = gabineteTasks.filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()));
        searchFiltered.forEach(t => map[t.status]?.push(t));
        // Sort by priority within each column
        const prioOrder: Record<TaskPriority, number> = { urgente: 0, alta: 1, media: 2, baixa: 3 };
        Object.values(map).forEach(arr => arr.sort((a, b) => prioOrder[a.priority] - prioOrder[b.priority]));
        return map;
    }, [gabineteTasks, search]);

    // ── Kanban Card ──
    const renderKanbanCard = (t: GabineteTask) => {
        const pc = PRIO_CFG[t.priority];
        const cardColor = t.color || pc.color;
        const currentIdx = STATUS_ORDER.indexOf(t.status);
        const canGoLeft = currentIdx > 0;
        const canGoRight = currentIdx < STATUS_ORDER.length - 1;

        return (
            <View key={t.id} style={[k.card, { backgroundColor: colors.card }]}>
                <View style={[k.cardStripe, { backgroundColor: cardColor }]} />
                <View style={k.cardBody}>
                    <TouchableOpacity onPress={() => openEdit(t)} activeOpacity={0.7}>
                        <Text style={[k.cardTitle, { color: colors.text }]} numberOfLines={2}>{t.title}</Text>
                        {t.description ? <Text style={[k.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>{t.description}</Text> : null}
                    </TouchableOpacity>

                    <View style={k.cardMeta}>
                        <View style={[k.prioBadge, { backgroundColor: pc.color + "18" }]}>
                            <Text style={{ color: pc.color, fontSize: 10, fontWeight: "700" }}>{pc.label}</Text>
                        </View>
                        {t.assigneeName && t.assigneeName !== "Não atribuído" && (
                            <View style={k.metaItem}>
                                <User color={colors.textSecondary} size={11} />
                                <Text style={[k.metaText, { color: colors.textSecondary }]} numberOfLines={1}>{t.assigneeName}</Text>
                            </View>
                        )}
                    </View>

                    {t.dueDate && (
                        <View style={k.metaItem}>
                            <Calendar color={colors.textSecondary} size={11} />
                            <Text style={[k.metaText, { color: colors.textSecondary }]}>
                                {new Date(t.dueDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                            </Text>
                        </View>
                    )}

                    <View style={k.cardActions}>
                        <TouchableOpacity
                            onPress={() => moveTask(t, "left")}
                            disabled={!canGoLeft}
                            style={[k.moveBtn, { opacity: canGoLeft ? 1 : 0.2 }]}
                        >
                            <ChevronLeft color={colors.primary} size={16} />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity onPress={() => openEdit(t)} style={k.editBtn}>
                            <Edit2 color={colors.primary} size={13} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDelete(t)} style={k.deleteBtn}>
                            <Trash2 color="#ef4444" size={13} />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }} />
                        <TouchableOpacity
                            onPress={() => moveTask(t, "right")}
                            disabled={!canGoRight}
                            style={[k.moveBtn, { opacity: canGoRight ? 1 : 0.2 }]}
                        >
                            <ChevronRight color={colors.primary} size={16} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    // ── Kanban Column ──
    const renderKanbanColumn = (statusKey: TaskStatus) => {
        const cfg = STATUS_CFG[statusKey];
        const tasks = tasksByStatus[statusKey];
        const Icon = cfg.icon;

        return (
            <View key={statusKey} style={[k.column, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={k.columnHeader}>
                    <View style={[k.columnDot, { backgroundColor: cfg.color }]} />
                    <Icon color={cfg.color} size={16} />
                    <Text style={[k.columnTitle, { color: colors.text }]}>{cfg.label}</Text>
                    <View style={[k.columnCount, { backgroundColor: cfg.color + "20" }]}>
                        <Text style={{ color: cfg.color, fontSize: 12, fontWeight: "700" }}>{tasks.length}</Text>
                    </View>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity onPress={() => openAdd(statusKey)} style={[k.columnAddBtn, { backgroundColor: cfg.color + "15" }]}>
                        <Plus color={cfg.color} size={16} />
                    </TouchableOpacity>
                </View>
                <ScrollView style={k.columnScroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
                    {tasks.length === 0 ? (
                        <View style={k.columnEmpty}>
                            <Text style={{ color: colors.textSecondary, fontSize: 12, textAlign: "center" }}>Sem tarefas</Text>
                        </View>
                    ) : tasks.map(renderKanbanCard)}
                </ScrollView>
            </View>
        );
    };

    // ── List Card (original) ──
    const renderListCard = (t: GabineteTask) => {
        const sc = STATUS_CFG[t.status]; const pc = PRIO_CFG[t.priority]; const Icon = sc.icon;
        const cardColor = t.color || pc.color;
        return (
            <View key={t.id} style={[s.card, { backgroundColor: colors.card }]}>
                <View style={[s.prioStripe, { backgroundColor: cardColor }]} />
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
    };

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
                <TouchableOpacity onPress={() => openAdd()} style={[s.addBtn, { backgroundColor: colors.primary }]}>
                    <Plus color="#fff" size={20} />
                </TouchableOpacity>
            </View>

            {/* View toggle */}
            <View style={[k.toggleRow, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                    onPress={() => setViewMode("kanban")}
                    style={[k.toggleBtn, viewMode === "kanban" && { backgroundColor: colors.primary }]}
                >
                    <LayoutGrid color={viewMode === "kanban" ? "#fff" : colors.textSecondary} size={16} />
                    <Text style={[k.toggleText, { color: viewMode === "kanban" ? "#fff" : colors.textSecondary }]}>Kanban</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setViewMode("list")}
                    style={[k.toggleBtn, viewMode === "list" && { backgroundColor: colors.primary }]}
                >
                    <List color={viewMode === "list" ? "#fff" : colors.textSecondary} size={16} />
                    <Text style={[k.toggleText, { color: viewMode === "list" ? "#fff" : colors.textSecondary }]}>Lista</Text>
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={s.searchWrap}>
                <View style={[s.searchBox, { backgroundColor: colors.card }]}>
                    <Search color={colors.textSecondary} size={18} />
                    <TextInput style={[s.searchInput, { color: colors.text }]} placeholder="Buscar tarefas..." placeholderTextColor={colors.textSecondary} value={search} onChangeText={setSearch} />
                </View>
            </View>

            {/* Progress bar */}
            {gabineteTasks.length > 0 && (
                <View style={s.progressWrap}>
                    <View style={[s.progressTrack, { backgroundColor: colors.border }]}>
                        <View style={[s.progressBar, { width: `${completionPct}%`, backgroundColor: colors.primary }]} />
                    </View>
                </View>
            )}

            {/* ══ Kanban View ══ */}
            {viewMode === "kanban" && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={k.boardScroll} contentContainerStyle={k.boardContent}>
                    {STATUS_ORDER.map(renderKanbanColumn)}
                </ScrollView>
            )}

            {/* ══ List View ══ */}
            {viewMode === "list" && (
                <>
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

                    <ScrollView style={s.list} contentContainerStyle={s.listPad}>
                        {filtered.length === 0 ? (
                            <View style={s.empty}>
                                <ClipboardList color={colors.textSecondary} size={48} />
                                <Text style={[s.emptyTxt, { color: colors.textSecondary }]}>Nenhuma tarefa</Text>
                            </View>
                        ) : filtered.map(renderListCard)}
                    </ScrollView>
                </>
            )}

            {/* ══ Add/Edit Modal ══ */}
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

                            <Text style={[s.label, { color: colors.text }]}>Cor do card</Text>
                            <View style={k.colorRow}>
                                <TouchableOpacity
                                    onPress={() => setTaskColor("")}
                                    style={[k.colorSwatch, { backgroundColor: colors.backgroundSecondary, borderColor: !taskColor ? colors.primary : colors.border, borderWidth: !taskColor ? 2 : 1 }]}
                                >
                                    <Text style={{ color: colors.textSecondary, fontSize: 10 }}>Auto</Text>
                                </TouchableOpacity>
                                {CARD_COLORS.map(c => (
                                    <TouchableOpacity
                                        key={c}
                                        onPress={() => setTaskColor(c)}
                                        style={[k.colorSwatch, { backgroundColor: c, borderColor: taskColor === c ? colors.text : "transparent", borderWidth: taskColor === c ? 3 : 0 }]}
                                    >
                                        {taskColor === c && <CheckCircle2 color="#fff" size={16} />}
                                    </TouchableOpacity>
                                ))}
                            </View>

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

                            <Text style={[s.label, { color: colors.text }]}>Status</Text>
                            <View style={s.chipRow}>
                                {(Object.keys(STATUS_CFG) as TaskStatus[]).map(st => (
                                    <TouchableOpacity key={st} onPress={() => setStatus(st)} style={[s.chip, { backgroundColor: status === st ? STATUS_CFG[st].color + "20" : colors.backgroundSecondary, borderColor: status === st ? STATUS_CFG[st].color : colors.border }]}>
                                        <Text style={{ color: status === st ? STATUS_CFG[st].color : colors.text, fontSize: 13, fontWeight: "600" }}>{STATUS_CFG[st].label}</Text>
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
            {DeleteAlertDialog}
            {FeedbackAlertDialog}
        </View>
    );
}

// ── Kanban Styles ──
const k = StyleSheet.create({
    toggleRow: {
        flexDirection: "row",
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.md,
        borderRadius: Radius.lg,
        padding: 4,
        gap: 4,
    },
    toggleBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
        borderRadius: Radius.md,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: "600",
    },
    boardScroll: {
        flex: 1,
    },
    boardContent: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.lg,
        gap: 12,
    },
    column: {
        width: 280,
        borderRadius: Radius.lg,
        marginTop: Spacing.md,
        overflow: "hidden",
    },
    columnHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 14,
        paddingBottom: 10,
    },
    columnDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    columnTitle: {
        fontSize: 14,
        fontWeight: "700",
    },
    columnCount: {
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: "center",
        justifyContent: "center",
    },
    columnAddBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    columnScroll: {
        flex: 1,
        paddingHorizontal: 10,
    },
    columnEmpty: {
        padding: 20,
        alignItems: "center",
    },
    card: {
        borderRadius: Radius.md,
        marginBottom: 8,
        flexDirection: "row",
        overflow: "hidden",
        ...Platform.select({ web: { boxShadow: "0 2px 6px rgba(0,0,0,0.08)" }, android: { elevation: 2 } }),
    },
    cardStripe: {
        width: 5,
    },
    cardBody: {
        flex: 1,
        padding: 12,
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: "600",
        lineHeight: 18,
    },
    cardDesc: {
        fontSize: 11,
        marginTop: 3,
        lineHeight: 16,
    },
    cardMeta: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
        marginTop: 8,
        alignItems: "center",
    },
    prioBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: Radius.full,
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
    },
    metaText: {
        fontSize: 11,
        maxWidth: 90,
    },
    cardActions: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: "rgba(0,0,0,0.05)",
        paddingTop: 8,
    },
    moveBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(59,130,246,0.08)",
    },
    editBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(59,130,246,0.08)",
        marginHorizontal: 4,
    },
    deleteBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(239,68,68,0.08)",
    },
    colorRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        marginTop: 4,
    },
    colorSwatch: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
    },
});

// ── List Styles (original) ──
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
