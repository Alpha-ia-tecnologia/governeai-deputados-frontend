import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform, ActivityIndicator } from "react-native";
import { ArrowLeft, Plus, FileText, Edit2, Trash2, X, Search, Clock, CircleCheck, Gavel } from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { LegislativeBill, BillType, BillStatus, BillAuthorship } from "@/types";
import { Typography, Spacing, Radius } from "@/constants/colors";


const TYPES: { v: BillType; l: string }[] = [
    { v: "PL", l: "PL" }, { v: "PEC", l: "PEC" }, { v: "PLP", l: "PLP" },
    { v: "PDL", l: "PDL" }, { v: "MPV", l: "MPV" }, { v: "REQ", l: "REQ" }, { v: "INC", l: "INC" },
];
const STATUSES: { v: BillStatus; l: string; c: string }[] = [
    { v: "em_tramitacao", l: "Tramitando", c: "#3b82f6" }, { v: "aprovado", l: "Aprovado", c: "#22c55e" },
    { v: "rejeitado", l: "Rejeitado", c: "#ef4444" }, { v: "arquivado", l: "Arquivado", c: "#6b7280" },
    { v: "retirado", l: "Retirado", c: "#f97316" },
];
const AUTHORS: { v: BillAuthorship; l: string }[] = [
    { v: "proprio", l: "Próprio" }, { v: "coautoria", l: "Coautoria" }, { v: "acompanhamento", l: "Acompanhamento" },
];

export default function ManageBillsScreen() {
    const { colors } = useTheme();
    const { bills: realBills, addBill, updateBill, deleteBill } = useData();
    const bills = realBills;
    const { showToast } = useToast();
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<LegislativeBill | null>(null);
    const [search, setSearch] = useState(""); const [saving, setSaving] = useState(false);
    const [number, setNumber] = useState(""); const [title, setTitle] = useState("");
    const [summary, setSummary] = useState(""); const [type, setType] = useState<BillType>("PL");
    const [authorship, setAuthorship] = useState<BillAuthorship>("proprio");
    const [billStatus, setBillStatus] = useState<BillStatus>("em_tramitacao");
    const [presentedDate, setPresentedDate] = useState(""); const [area, setArea] = useState("");

    const resetForm = () => { setNumber(""); setTitle(""); setSummary(""); setType("PL"); setAuthorship("proprio"); setBillStatus("em_tramitacao"); setPresentedDate(""); setArea(""); setEditing(null); };
    const openAdd = () => { resetForm(); setShowModal(true); };
    const openEdit = (b: LegislativeBill) => { setEditing(b); setNumber(b.number); setTitle(b.title); setSummary(b.summary); setType(b.type); setAuthorship(b.authorship); setBillStatus(b.status); setPresentedDate(b.presentedDate); setArea(b.area || ""); setShowModal(true); };

    const handleSave = async () => {
        if (!number.trim()) { showToast({ title: "Número obrigatório", type: "error" }); return; }
        setSaving(true);
        try {
            const data: any = { number: number.trim(), title: title.trim(), summary: summary.trim(), type, authorship, status: billStatus, presentedDate: presentedDate || new Date().toISOString().split("T")[0], area: area.trim() };
            if (editing) { await updateBill(editing.id, data); showToast({ title: "Atualizado!", type: "success" }); }
            else { await addBill(data); showToast({ title: "Cadastrado!", type: "success" }); }
            setShowModal(false); resetForm();
        } catch (e: any) { showToast({ title: e.message || "Erro", type: "error" }); } finally { setSaving(false); }
    };

    const handleDelete = (b: LegislativeBill) => Alert.alert("Excluir", `"${b.number}"?`, [{ text: "Não", style: "cancel" }, { text: "Sim", style: "destructive", onPress: async () => { try { await deleteBill(b.id); showToast({ title: "Excluído!", type: "success" }); } catch (e: any) { showToast({ title: e.message, type: "error" }); } } }]);

    const filtered = bills.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.number.toLowerCase().includes(search.toLowerCase()));
    const statusColor = (st: BillStatus) => STATUSES.find(s => s.v === st)?.c || "#6b7280";
    const statusLabel = (st: BillStatus) => STATUSES.find(s => s.v === st)?.l || st;

    return (
        <View style={[st.container, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={[st.header, { backgroundColor: colors.card }]}><TouchableOpacity onPress={() => router.back()} style={st.backBtn}><ArrowLeft color={colors.text} size={24} /></TouchableOpacity><View style={st.hTitle}><Text style={[st.hTitleTxt, { color: colors.text }]}>Projetos de Lei</Text><Text style={[st.hSub, { color: colors.textSecondary }]}>{bills.length} projetos</Text></View><TouchableOpacity onPress={openAdd} style={[st.addBtn, { backgroundColor: colors.primary }]}><Plus color="#fff" size={20} /></TouchableOpacity></View>

            <View style={st.statsRow}>
                <View style={[st.statCard, { backgroundColor: colors.card }]}><Clock color="#3b82f6" size={20} /><Text style={[st.statVal, { color: "#3b82f6" }]}>{bills.filter(b => b.status === "em_tramitacao").length}</Text><Text style={[st.statLbl, { color: colors.textSecondary }]}>Tramitando</Text></View>
                <View style={[st.statCard, { backgroundColor: colors.card }]}><CircleCheck color="#22c55e" size={20} /><Text style={[st.statVal, { color: "#22c55e" }]}>{bills.filter(b => b.status === "aprovado").length}</Text><Text style={[st.statLbl, { color: colors.textSecondary }]}>Aprovados</Text></View>
                <View style={[st.statCard, { backgroundColor: colors.card }]}><Gavel color={colors.primary} size={20} /><Text style={[st.statVal, { color: colors.primary }]}>{bills.filter(b => b.authorship === "proprio").length}</Text><Text style={[st.statLbl, { color: colors.textSecondary }]}>Próprios</Text></View>
            </View>

            <View style={st.searchWrap}><View style={[st.searchBox, { backgroundColor: colors.card }]}><Search color={colors.textSecondary} size={18} /><TextInput style={[st.searchInput, { color: colors.text }]} placeholder="Buscar projeto..." placeholderTextColor={colors.textSecondary} value={search} onChangeText={setSearch} /></View></View>

            <ScrollView style={st.list} contentContainerStyle={st.listPad}>
                {filtered.length === 0 ? (<View style={st.empty}><FileText color={colors.textSecondary} size={48} /><Text style={[st.emptyTxt, { color: colors.textSecondary }]}>Nenhum projeto</Text></View>) : filtered.map(b => (
                    <View key={b.id} style={[st.card, { backgroundColor: colors.card }]}>
                        <View style={st.cardTop}>
                            <View style={[st.typeBadge, { backgroundColor: colors.primary + "15" }]}><Text style={[st.typeText, { color: colors.primary }]}>{b.type}</Text></View>
                            <View style={{ flex: 1, marginLeft: 10 }}><Text style={[st.billTitle, { color: colors.text }]}>{b.number ? `${b.number} - ` : ""}{b.title}</Text><Text style={[st.billSummary, { color: colors.textSecondary }]} numberOfLines={2}>{b.summary}</Text></View>
                        </View>
                        <View style={st.meta}>
                            <View style={[st.statusBadge, { backgroundColor: statusColor(b.status) + "20" }]}><Text style={{ color: statusColor(b.status), fontSize: 11, fontWeight: "600" }}>{statusLabel(b.status)}</Text></View>
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{AUTHORS.find(a => a.v === b.authorship)?.l}</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>📅 {b.presentedDate}</Text>
                        </View>
                        <View style={st.actions}>
                            <TouchableOpacity onPress={() => openEdit(b)} style={[st.actBtn, { backgroundColor: colors.primary + "15" }]}><Edit2 color={colors.primary} size={16} /></TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(b)} style={[st.actBtn, { backgroundColor: colors.error + "15" }]}><Trash2 color={colors.error} size={16} /></TouchableOpacity>
                        </View>
                    </View>
                ))}
            </ScrollView>

            <Modal visible={showModal} animationType="slide" transparent>
                <View style={st.overlay}><View style={[st.modal, { backgroundColor: colors.card }]}>
                    <View style={st.mHeader}><Text style={[st.mTitle, { color: colors.text }]}>{editing ? "Editar" : "Novo"} Projeto</Text><TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}><X color={colors.textSecondary} size={24} /></TouchableOpacity></View>
                    <ScrollView style={st.mBody}>
                        <Text style={[st.label, { color: colors.text }]}>Número</Text><TextInput style={[st.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="PL 123/2025" placeholderTextColor={colors.textSecondary} value={number} onChangeText={setNumber} />
                        <Text style={[st.label, { color: colors.text }]}>Título *</Text><TextInput style={[st.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="Título do projeto" placeholderTextColor={colors.textSecondary} value={title} onChangeText={setTitle} />
                        <Text style={[st.label, { color: colors.text }]}>Ementa</Text><TextInput style={[st.input, st.ta, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="Resumo..." placeholderTextColor={colors.textSecondary} value={summary} onChangeText={setSummary} multiline numberOfLines={3} />
                        <Text style={[st.label, { color: colors.text }]}>Tipo</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{TYPES.map(t => (<TouchableOpacity key={t.v} onPress={() => setType(t.v)} style={[st.chip, { backgroundColor: type === t.v ? colors.primary : colors.backgroundSecondary }]}><Text style={{ color: type === t.v ? "#fff" : colors.text, fontSize: 13, fontWeight: "600" }}>{t.l}</Text></TouchableOpacity>))}</ScrollView>
                        <Text style={[st.label, { color: colors.text }]}>Autoria</Text><View style={st.chipRow}>{AUTHORS.map(a => (<TouchableOpacity key={a.v} onPress={() => setAuthorship(a.v)} style={[st.chip, { backgroundColor: authorship === a.v ? colors.primary : colors.backgroundSecondary }]}><Text style={{ color: authorship === a.v ? "#fff" : colors.text, fontSize: 13 }}>{a.l}</Text></TouchableOpacity>))}</View>
                        <Text style={[st.label, { color: colors.text }]}>Status</Text><View style={st.chipRow}>{STATUSES.map(s => (<TouchableOpacity key={s.v} onPress={() => setBillStatus(s.v)} style={[st.chip, { backgroundColor: billStatus === s.v ? s.c + "20" : colors.backgroundSecondary, borderColor: billStatus === s.v ? s.c : colors.border }]}><Text style={{ color: billStatus === s.v ? s.c : colors.text, fontSize: 13, fontWeight: "600" }}>{s.l}</Text></TouchableOpacity>))}</View>
                        <Text style={[st.label, { color: colors.text }]}>Área</Text><TextInput style={[st.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="Saúde, Educação..." placeholderTextColor={colors.textSecondary} value={area} onChangeText={setArea} />
                        <Text style={[st.label, { color: colors.text }]}>Data Apresentação</Text><TextInput style={[st.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="AAAA-MM-DD" placeholderTextColor={colors.textSecondary} value={presentedDate} onChangeText={setPresentedDate} />
                    </ScrollView>
                    <View style={st.mFooter}><TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }} style={[st.cancelBtn, { borderColor: colors.border }]}><Text style={[st.cancelTxt, { color: colors.textSecondary }]}>Cancelar</Text></TouchableOpacity><TouchableOpacity onPress={handleSave} disabled={saving} style={[st.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}>{saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={st.saveTxt}>{editing ? "Atualizar" : "Cadastrar"}</Text>}</TouchableOpacity></View>
                </View></View>
            </Modal>
        </View>
    );
}

const st = StyleSheet.create({
    container: { flex: 1 }, header: { flexDirection: "row", alignItems: "center", padding: 16, paddingTop: Platform.OS === "ios" ? 56 : 16, ...Platform.select({ web: { boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }, android: { elevation: 3 } }) },
    backBtn: { marginRight: 12 }, hTitle: { flex: 1 }, hTitleTxt: { fontSize: 20, fontWeight: "700" }, hSub: { fontSize: 13, marginTop: 2 },
    addBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
    statsRow: { flexDirection: "row", padding: 16, paddingBottom: 0, gap: 10 },
    statCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: "center", ...Platform.select({ web: { boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }, android: { elevation: 2 } }) },
    statVal: { fontSize: 20, fontWeight: "700" }, statLbl: { fontSize: 11, marginTop: 4 },
    searchWrap: { padding: 16, paddingBottom: 8 }, searchBox: { flexDirection: "row", alignItems: "center", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 15 }, list: { flex: 1 }, listPad: { padding: 16, paddingTop: 8 },
    empty: { alignItems: "center", paddingTop: 60, gap: 12 }, emptyTxt: { fontSize: 16, fontWeight: "600" },
    card: { borderRadius: 12, padding: 16, marginBottom: 12, ...Platform.select({ web: { boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }, android: { elevation: 2 } }) },
    cardTop: { flexDirection: "row", alignItems: "flex-start" }, typeBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    typeText: { fontSize: 13, fontWeight: "700" }, billTitle: { fontSize: 15, fontWeight: "600" }, billSummary: { fontSize: 13, marginTop: 4 },
    meta: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10, alignItems: "center" },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    actions: { flexDirection: "row", gap: 8, marginTop: 12, justifyContent: "flex-end" },
    actBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
    overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
    modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "90%" },
    mHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.1)" },
    mTitle: { fontSize: 18, fontWeight: "700" }, mBody: { padding: 20 },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 12 },
    input: { borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1 }, ta: { minHeight: 80, textAlignVertical: "top" },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "transparent", marginRight: 6, marginBottom: 4 },
    mFooter: { flexDirection: "row", padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.1)" },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, alignItems: "center" }, cancelTxt: { fontSize: 15, fontWeight: "600" },
    saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 10, alignItems: "center", justifyContent: "center" }, saveTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
