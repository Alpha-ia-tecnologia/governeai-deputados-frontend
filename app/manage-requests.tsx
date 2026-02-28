import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Alert,
    Platform,
    ActivityIndicator,
} from "react-native";
import {
    ArrowLeft,
    Plus,
    FileText,
    Edit2,
    Trash2,
    X,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Send,
    Filter,
    ChevronDown,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { ExecutiveRequest, RequestStatus, RequestType } from "@/types";

const STATUS_CONFIG: Record<RequestStatus, { label: string; color: string; icon: any }> = {
    enviado: { label: "Enviado", color: "#3B82F6", icon: Send },
    em_analise: { label: "Em Análise", color: "#F59E0B", icon: Clock },
    respondido: { label: "Respondido", color: "#8B5CF6", icon: AlertCircle },
    atendido: { label: "Atendido", color: "#10B981", icon: CheckCircle2 },
    negado: { label: "Negado", color: "#EF4444", icon: XCircle },
};

const TYPE_CONFIG: Record<RequestType, { label: string }> = {
    oficio: { label: "Ofício" },
    indicacao: { label: "Indicação" },
    requerimento: { label: "Requerimento" },
};

export default function ManageRequestsScreen() {
    const { colors } = useTheme();
    const { executiveRequests, addExecutiveRequest, updateExecutiveRequest, deleteExecutiveRequest } = useData();
    const { showToast } = useToast();

    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [editingRequest, setEditingRequest] = useState<ExecutiveRequest | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<ExecutiveRequest | null>(null);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<RequestStatus | "all">("all");
    const [filterType, setFilterType] = useState<RequestType | "all">("all");
    const [saving, setSaving] = useState(false);

    // Form state
    const [protocolNumber, setProtocolNumber] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [type, setType] = useState<RequestType>("oficio");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<RequestStatus>("enviado");
    const [response, setResponse] = useState("");
    const [deadline, setDeadline] = useState("");

    const resetForm = () => {
        setProtocolNumber("");
        setDate(new Date().toISOString().split("T")[0]);
        setType("oficio");
        setSubject("");
        setDescription("");
        setStatus("enviado");
        setResponse("");
        setDeadline("");
        setEditingRequest(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (request: ExecutiveRequest) => {
        setEditingRequest(request);
        setProtocolNumber(request.protocolNumber);
        setDate(request.date);
        setType(request.type);
        setSubject(request.subject);
        setDescription(request.description);
        setStatus(request.status);
        setResponse(request.response || "");
        setDeadline(request.deadline || "");
        setShowModal(true);
    };

    const openDetail = (request: ExecutiveRequest) => {
        setSelectedRequest(request);
        setShowDetailModal(true);
    };

    const handleSave = async () => {
        if (!protocolNumber.trim() || !subject.trim()) {
            showToast({ title: "Número do protocolo e assunto são obrigatórios", type: "error" });
            return;
        }

        setSaving(true);
        try {
            const data: any = {
                protocolNumber: protocolNumber.trim(),
                date,
                type,
                subject: subject.trim(),
                description: description.trim(),
                status,
                response: response.trim() || undefined,
                deadline: deadline || undefined,
            };

            if (editingRequest) {
                await updateExecutiveRequest(editingRequest.id, data);
                showToast({ title: "Requerimento atualizado com sucesso!", type: "success" });
            } else {
                await addExecutiveRequest(data);
                showToast({ title: "Requerimento cadastrado com sucesso!", type: "success" });
            }

            setShowModal(false);
            resetForm();
        } catch (error: any) {
            showToast({ title: error.message || "Erro ao salvar requerimento", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (request: ExecutiveRequest) => {
        Alert.alert(
            "Excluir Requerimento",
            `Tem certeza que deseja excluir "${request.protocolNumber}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteExecutiveRequest(request.id);
                            showToast({ title: "Requerimento excluído!", type: "success" });
                        } catch (error: any) {
                            showToast({ title: error.message || "Erro ao excluir", type: "error" });
                        }
                    },
                },
            ]
        );
    };

    const filteredRequests = useMemo(() => {
        return executiveRequests.filter((r) => {
            const matchesSearch =
                !search ||
                r.protocolNumber.toLowerCase().includes(search.toLowerCase()) ||
                r.subject.toLowerCase().includes(search.toLowerCase()) ||
                r.description.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = filterStatus === "all" || r.status === filterStatus;
            const matchesType = filterType === "all" || r.type === filterType;

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [executiveRequests, search, filterStatus, filterType]);

    // Stats
    const stats = useMemo(() => {
        const total = executiveRequests.length;
        const pending = executiveRequests.filter((r) => r.status === "enviado" || r.status === "em_analise").length;
        const answered = executiveRequests.filter((r) => r.status === "respondido" || r.status === "atendido").length;
        const denied = executiveRequests.filter((r) => r.status === "negado").length;
        return { total, pending, answered, denied };
    }, [executiveRequests]);

    const StatusBadge = ({ reqStatus }: { reqStatus: RequestStatus }) => {
        const config = STATUS_CONFIG[reqStatus];
        const Icon = config.icon;
        return (
            <View style={[styles.statusBadge, { backgroundColor: config.color + "15" }]}>
                <Icon color={config.color} size={12} />
                <Text style={[styles.statusBadgeText, { color: config.color }]}>{config.label}</Text>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Ofícios e Requerimentos</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        {executiveRequests.length} registros
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={openAddModal}
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                >
                    <Plus color="#fff" size={20} />
                </TouchableOpacity>
            </View>

            {/* Stats Row */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.total}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.statNumber, { color: "#F59E0B" }]}>{stats.pending}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pendentes</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.statNumber, { color: "#10B981" }]}>{stats.answered}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Atendidos</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: colors.card }]}>
                    <Text style={[styles.statNumber, { color: "#EF4444" }]}>{stats.denied}</Text>
                    <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Negados</Text>
                </View>
            </ScrollView>

            {/* Search + Filters */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
                    <Search color={colors.textSecondary} size={18} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Buscar por protocolo ou assunto..."
                        placeholderTextColor={colors.textSecondary}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            {/* Type Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filtersRow}>
                <TouchableOpacity
                    onPress={() => setFilterType("all")}
                    style={[styles.filterChip, { backgroundColor: filterType === "all" ? colors.primary : colors.card }]}
                >
                    <Text style={[styles.filterChipText, { color: filterType === "all" ? "#fff" : colors.text }]}>Todos</Text>
                </TouchableOpacity>
                {(Object.entries(TYPE_CONFIG) as [RequestType, { label: string }][]).map(([key, config]) => (
                    <TouchableOpacity
                        key={key}
                        onPress={() => setFilterType(key)}
                        style={[styles.filterChip, { backgroundColor: filterType === key ? colors.primary : colors.card }]}
                    >
                        <Text style={[styles.filterChipText, { color: filterType === key ? "#fff" : colors.text }]}>
                            {config.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Status Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filtersRow}>
                <TouchableOpacity
                    onPress={() => setFilterStatus("all")}
                    style={[styles.filterChip, { backgroundColor: filterStatus === "all" ? colors.primary : colors.card, borderWidth: 1, borderColor: filterStatus === "all" ? colors.primary : colors.border }]}
                >
                    <Text style={[styles.filterChipText, { color: filterStatus === "all" ? "#fff" : colors.text }]}>Todos Status</Text>
                </TouchableOpacity>
                {(Object.entries(STATUS_CONFIG) as [RequestStatus, { label: string; color: string; icon: any }][]).map(([key, config]) => (
                    <TouchableOpacity
                        key={key}
                        onPress={() => setFilterStatus(key)}
                        style={[styles.filterChip, { backgroundColor: filterStatus === key ? config.color + "20" : colors.card, borderWidth: 1, borderColor: filterStatus === key ? config.color : colors.border }]}
                    >
                        <Text style={[styles.filterChipText, { color: filterStatus === key ? config.color : colors.text }]}>
                            {config.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* List */}
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                {filteredRequests.length === 0 ? (
                    <View style={styles.emptyState}>
                        <FileText color={colors.textSecondary} size={48} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhum requerimento encontrado</Text>
                    </View>
                ) : (
                    filteredRequests.map((request) => (
                        <TouchableOpacity
                            key={request.id}
                            style={[styles.requestCard, { backgroundColor: colors.card }]}
                            onPress={() => openDetail(request)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.requestHeader}>
                                <View style={styles.requestInfo}>
                                    <View style={styles.protocolRow}>
                                        <Text style={[styles.protocolNumber, { color: colors.primary }]}>
                                            #{request.protocolNumber}
                                        </Text>
                                        <View style={[styles.typeBadge, { backgroundColor: colors.backgroundSecondary }]}>
                                            <Text style={[styles.typeBadgeText, { color: colors.text }]}>
                                                {TYPE_CONFIG[request.type]?.label || request.type}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.requestSubject, { color: colors.text }]} numberOfLines={2}>
                                        {request.subject}
                                    </Text>
                                    <View style={styles.requestMeta}>
                                        <Text style={[styles.requestDate, { color: colors.textSecondary }]}>
                                            {new Date(request.date).toLocaleDateString("pt-BR")}
                                        </Text>
                                        <StatusBadge reqStatus={request.status} />
                                    </View>
                                </View>
                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        onPress={() => openEditModal(request)}
                                        style={[styles.actionBtn, { backgroundColor: colors.primary + "15" }]}
                                    >
                                        <Edit2 color={colors.primary} size={16} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(request)}
                                        style={[styles.actionBtn, { backgroundColor: colors.error + "15" }]}
                                    >
                                        <Trash2 color={colors.error} size={16} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {request.deadline && (
                                <View style={[styles.deadlineRow, { borderTopColor: colors.border }]}>
                                    <Clock color={colors.textSecondary} size={12} />
                                    <Text style={[styles.deadlineText, { color: colors.textSecondary }]}>
                                        Prazo: {new Date(request.deadline).toLocaleDateString("pt-BR")}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* Detail Modal */}
            <Modal visible={showDetailModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Detalhes</Text>
                            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                                <X color={colors.textSecondary} size={24} />
                            </TouchableOpacity>
                        </View>
                        {selectedRequest && (
                            <ScrollView style={styles.modalBody}>
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Protocolo</Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>#{selectedRequest.protocolNumber}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Tipo</Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>{TYPE_CONFIG[selectedRequest.type]?.label}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Data</Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>{new Date(selectedRequest.date).toLocaleDateString("pt-BR")}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Status</Text>
                                    <StatusBadge reqStatus={selectedRequest.status} />
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Assunto</Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>{selectedRequest.subject}</Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Descrição</Text>
                                    <Text style={[styles.detailValue, { color: colors.text }]}>{selectedRequest.description || "—"}</Text>
                                </View>
                                {selectedRequest.deadline && (
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Prazo</Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>{new Date(selectedRequest.deadline).toLocaleDateString("pt-BR")}</Text>
                                    </View>
                                )}
                                {selectedRequest.response && (
                                    <View style={styles.detailRow}>
                                        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Resposta</Text>
                                        <Text style={[styles.detailValue, { color: colors.text }]}>{selectedRequest.response}</Text>
                                    </View>
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Add/Edit Modal */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {editingRequest ? "Editar Requerimento" : "Novo Requerimento"}
                            </Text>
                            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                                <X color={colors.textSecondary} size={24} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <Text style={[styles.label, { color: colors.text }]}>Nº Protocolo *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                                placeholder="Ex: OF-2026/001"
                                placeholderTextColor={colors.textSecondary}
                                value={protocolNumber}
                                onChangeText={setProtocolNumber}
                            />

                            <Text style={[styles.label, { color: colors.text }]}>Tipo</Text>
                            <View style={styles.typeSelector}>
                                {(Object.entries(TYPE_CONFIG) as [RequestType, { label: string }][]).map(([key, config]) => (
                                    <TouchableOpacity
                                        key={key}
                                        onPress={() => setType(key)}
                                        style={[
                                            styles.typeChip,
                                            {
                                                backgroundColor: type === key ? colors.primary : colors.backgroundSecondary,
                                                borderColor: type === key ? colors.primary : colors.border,
                                            },
                                        ]}
                                    >
                                        <Text style={[styles.typeChipText, { color: type === key ? "#fff" : colors.text }]}>
                                            {config.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.label, { color: colors.text }]}>Assunto *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                                placeholder="Assunto do requerimento"
                                placeholderTextColor={colors.textSecondary}
                                value={subject}
                                onChangeText={setSubject}
                            />

                            <Text style={[styles.label, { color: colors.text }]}>Descrição</Text>
                            <TextInput
                                style={[styles.textArea, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                                placeholder="Descreva o requerimento em detalhes..."
                                placeholderTextColor={colors.textSecondary}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />

                            <Text style={[styles.label, { color: colors.text }]}>Data</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={colors.textSecondary}
                                value={date}
                                onChangeText={setDate}
                            />

                            <Text style={[styles.label, { color: colors.text }]}>Prazo (opcional)</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor={colors.textSecondary}
                                value={deadline}
                                onChangeText={setDeadline}
                            />

                            <Text style={[styles.label, { color: colors.text }]}>Status</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusSelector}>
                                {(Object.entries(STATUS_CONFIG) as [RequestStatus, { label: string; color: string; icon: any }][]).map(([key, config]) => (
                                    <TouchableOpacity
                                        key={key}
                                        onPress={() => setStatus(key)}
                                        style={[
                                            styles.statusChip,
                                            {
                                                backgroundColor: status === key ? config.color + "20" : colors.backgroundSecondary,
                                                borderColor: status === key ? config.color : colors.border,
                                            },
                                        ]}
                                    >
                                        <Text style={[styles.statusChipText, { color: status === key ? config.color : colors.text }]}>
                                            {config.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>

                            {(status === "respondido" || status === "atendido" || status === "negado") && (
                                <>
                                    <Text style={[styles.label, { color: colors.text }]}>Resposta</Text>
                                    <TextInput
                                        style={[styles.textArea, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                                        placeholder="Resposta do executivo..."
                                        placeholderTextColor={colors.textSecondary}
                                        value={response}
                                        onChangeText={setResponse}
                                        multiline
                                        numberOfLines={3}
                                        textAlignVertical="top"
                                    />
                                </>
                            )}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                onPress={() => { setShowModal(false); resetForm(); }}
                                style={[styles.cancelBtn, { borderColor: colors.border }]}
                            >
                                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSave}
                                disabled={saving}
                                style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}
                            >
                                {saving ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.saveBtnText}>
                                        {editingRequest ? "Atualizar" : "Cadastrar"}
                                    </Text>
                                )}
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
        flexDirection: "row", alignItems: "center", padding: 16,
        paddingTop: Platform.OS === "ios" ? 56 : 16,
        ...Platform.select({
            web: { boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
            android: { elevation: 3 },
        }),
    },
    backButton: { marginRight: 12 },
    headerTitleContainer: { flex: 1 },
    headerTitle: { fontSize: 20, fontWeight: "700" },
    headerSubtitle: { fontSize: 13, marginTop: 2 },
    addButton: {
        width: 40, height: 40, borderRadius: 20,
        justifyContent: "center", alignItems: "center",
    },
    statsScroll: { flexGrow: 0 },
    statsRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
    statCard: {
        paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
        alignItems: "center", minWidth: 80,
        ...Platform.select({
            web: { boxShadow: "0 1px 2px rgba(0,0,0,0.06)" },
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2 },
            android: { elevation: 1 },
        }),
    },
    statNumber: { fontSize: 22, fontWeight: "800" },
    statLabel: { fontSize: 11, fontWeight: "500", marginTop: 2 },
    searchContainer: { paddingHorizontal: 16, paddingBottom: 8 },
    searchBox: {
        flexDirection: "row", alignItems: "center",
        borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 15 },
    filtersScroll: { flexGrow: 0 },
    filtersRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 6 },
    filterChip: {
        paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8,
    },
    filterChipText: { fontSize: 12, fontWeight: "600" },
    list: { flex: 1 },
    listContent: { padding: 16, paddingTop: 4 },
    emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyText: { fontSize: 16, fontWeight: "600" },
    requestCard: {
        borderRadius: 12, padding: 16, marginBottom: 10,
        ...Platform.select({
            web: { boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
            android: { elevation: 2 },
        }),
    },
    requestHeader: { flexDirection: "row" },
    requestInfo: { flex: 1 },
    protocolRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    protocolNumber: { fontSize: 15, fontWeight: "700" },
    typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    typeBadgeText: { fontSize: 11, fontWeight: "600" },
    requestSubject: { fontSize: 14, fontWeight: "500", marginTop: 6 },
    requestMeta: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
    requestDate: { fontSize: 12 },
    statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    statusBadgeText: { fontSize: 11, fontWeight: "600" },
    actions: { gap: 8, marginLeft: 8 },
    actionBtn: {
        width: 34, height: 34, borderRadius: 17,
        justifyContent: "center", alignItems: "center",
    },
    deadlineRow: {
        flexDirection: "row", alignItems: "center", gap: 6,
        marginTop: 10, paddingTop: 10, borderTopWidth: 1,
    },
    deadlineText: { fontSize: 12 },
    modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
    modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "90%" },
    modalHeader: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.1)",
    },
    modalTitle: { fontSize: 18, fontWeight: "700" },
    modalBody: { padding: 20 },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 12 },
    input: { borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1 },
    textArea: { borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1, minHeight: 80 },
    typeSelector: { flexDirection: "row", gap: 8 },
    typeChip: { flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, alignItems: "center" },
    typeChipText: { fontSize: 13, fontWeight: "600" },
    statusSelector: { marginBottom: 4 },
    statusChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, marginRight: 6 },
    statusChipText: { fontSize: 12, fontWeight: "600" },
    detailRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.05)" },
    detailLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
    detailValue: { fontSize: 15 },
    modalFooter: {
        flexDirection: "row", padding: 20, gap: 12,
        borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.1)",
    },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, alignItems: "center" },
    cancelBtnText: { fontSize: 15, fontWeight: "600" },
    saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
