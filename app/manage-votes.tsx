import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform, ActivityIndicator } from "react-native";
import { ArrowLeft, Plus, Vote, Edit2, Trash2, X, Search, ThumbsUp, ThumbsDown, BarChart3 } from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { VotingRecord, VoteChoice, VoteResult } from "@/types";
import { Typography, Spacing, Radius } from "@/constants/colors";


const CHOICES: { v: VoteChoice; l: string; c: string }[] = [
    { v: "favoravel", l: "Favorável", c: "#22c55e" }, { v: "contrario", l: "Contrário", c: "#ef4444" },
    { v: "abstencao", l: "Abstenção", c: "#f59e0b" }, { v: "ausente", l: "Ausente", c: "#6b7280" },
    { v: "obstrucao", l: "Obstrução", c: "#8b5cf6" },
];
const RESULTS: { v: VoteResult; l: string }[] = [
    { v: "aprovado", l: "Aprovado" }, { v: "rejeitado", l: "Rejeitado" }, { v: "adiado", l: "Adiado" },
];

export default function ManageVotesScreen() {
    const { colors } = useTheme();
    const { votingRecords: realVotes, bills: realBills, addVotingRecord, updateVotingRecord, deleteVotingRecord } = useData();
    const votingRecords = realVotes;
    const bills = realBills;
    const { showToast } = useToast();
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<VotingRecord | null>(null);
    const [search, setSearch] = useState(""); const [saving, setSaving] = useState(false);
    const [billId, setBillId] = useState(""); const [subject, setSubject] = useState("");
    const [date, setDate] = useState(""); const [session, setSession] = useState("");
    const [vote, setVote] = useState<VoteChoice>("favoravel");
    const [result, setResult] = useState<VoteResult>("adiado");
    const [notes, setNotes] = useState("");

    const resetForm = () => { setBillId(""); setSubject(""); setDate(""); setSession(""); setVote("favoravel"); setResult("adiado"); setNotes(""); setEditing(null); };
    const openAdd = () => { resetForm(); setShowModal(true); };
    const openEdit = (r: VotingRecord) => { setEditing(r); setBillId(r.billId || ""); setSubject(r.subject); setDate(r.date); setSession(r.session || ""); setVote(r.vote); setResult(r.result); setNotes(r.notes || ""); setShowModal(true); };

    const handleSave = async () => {
        if (!subject.trim()) { showToast({ title: "Matéria obrigatória", type: "error" }); return; }
        setSaving(true);
        try {
            const data: any = { billId: billId || undefined, billNumber: undefined, subject: subject.trim(), session: session.trim(), date: date || new Date().toISOString().split("T")[0], vote, result, notes: notes.trim() || undefined };
            if (editing) { await updateVotingRecord(editing.id, data); showToast({ title: "Atualizado!", type: "success" }); }
            else { await addVotingRecord(data); showToast({ title: "Registrado!", type: "success" }); }
            setShowModal(false); resetForm();
        } catch (e: any) { showToast({ title: e.message || "Erro", type: "error" }); } finally { setSaving(false); }
    };

    const handleDelete = (r: VotingRecord) => Alert.alert("Excluir", `Excluir voto?`, [{ text: "Não", style: "cancel" }, { text: "Sim", style: "destructive", onPress: async () => { try { await deleteVotingRecord(r.id); showToast({ title: "Excluído!", type: "success" }); } catch (e: any) { showToast({ title: e.message, type: "error" }); } } }]);

    const stats = useMemo(() => ({ total: votingRecords.length, favoravel: votingRecords.filter(r => r.vote === "favoravel").length, contrario: votingRecords.filter(r => r.vote === "contrario").length, presenca: votingRecords.length > 0 ? Math.round((votingRecords.filter(r => r.vote !== "ausente").length / votingRecords.length) * 100) : 0 }), [votingRecords]);
    const filtered = votingRecords.filter(r => r.subject.toLowerCase().includes(search.toLowerCase()));
    const choiceCfg = (v: VoteChoice) => CHOICES.find(c => c.v === v) || CHOICES[0];

    return (
        <View style={[st.container, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={[st.header, { backgroundColor: colors.card }]}><TouchableOpacity onPress={() => router.back()} style={st.backBtn}><ArrowLeft color={colors.text} size={24} /></TouchableOpacity><View style={st.hTitle}><Text style={[st.hTitleTxt, { color: colors.text }]}>Votações</Text><Text style={[st.hSub, { color: colors.textSecondary }]}>{stats.total} registros</Text></View><TouchableOpacity onPress={openAdd} style={[st.addBtn, { backgroundColor: colors.primary }]}><Plus color="#fff" size={20} /></TouchableOpacity></View>

            <View style={st.statsRow}>
                <View style={[st.statCard, { backgroundColor: colors.card }]}><ThumbsUp color="#22c55e" size={20} /><Text style={[st.statVal, { color: "#22c55e" }]}>{stats.favoravel}</Text><Text style={[st.statLbl, { color: colors.textSecondary }]}>Favorável</Text></View>
                <View style={[st.statCard, { backgroundColor: colors.card }]}><ThumbsDown color="#ef4444" size={20} /><Text style={[st.statVal, { color: "#ef4444" }]}>{stats.contrario}</Text><Text style={[st.statLbl, { color: colors.textSecondary }]}>Contrário</Text></View>
                <View style={[st.statCard, { backgroundColor: colors.card }]}><BarChart3 color={colors.primary} size={20} /><Text style={[st.statVal, { color: colors.primary }]}>{stats.presenca}%</Text><Text style={[st.statLbl, { color: colors.textSecondary }]}>Presença</Text></View>
            </View>

            <View style={st.searchWrap}><View style={[st.searchBox, { backgroundColor: colors.card }]}><Search color={colors.textSecondary} size={18} /><TextInput style={[st.searchInput, { color: colors.text }]} placeholder="Buscar..." placeholderTextColor={colors.textSecondary} value={search} onChangeText={setSearch} /></View></View>

            <ScrollView style={st.list} contentContainerStyle={st.listPad}>
                {filtered.length === 0 ? (<View style={st.empty}><Vote color={colors.textSecondary} size={48} /><Text style={[st.emptyTxt, { color: colors.textSecondary }]}>Nenhum registro</Text></View>) : filtered.map(r => {
                    const cc = choiceCfg(r.vote); return (
                        <View key={r.id} style={[st.card, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: cc.c }]}>
                            <View style={st.cardTop}><View style={{ flex: 1 }}><Text style={[st.billTitle, { color: colors.text }]}>{r.subject}</Text><Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>📅 {r.date}{r.session ? ` • Sessão ${r.session}` : ""}</Text></View><View style={[st.voteBadge, { backgroundColor: cc.c + "20" }]}><Text style={{ color: cc.c, fontSize: 13, fontWeight: "700" }}>{cc.l}</Text></View></View>
                            {r.notes ? <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 8, fontStyle: "italic" }}>"{r.notes}"</Text> : null}
                            <View style={st.actions}><View style={[st.resultBadge, { backgroundColor: r.result === "aprovado" ? "#22c55e20" : r.result === "rejeitado" ? "#ef444420" : "#6b728020" }]}><Text style={{ color: r.result === "aprovado" ? "#22c55e" : r.result === "rejeitado" ? "#ef4444" : "#6b7280", fontSize: 11, fontWeight: "600" }}>{RESULTS.find(res => res.v === r.result)?.l}</Text></View><View style={{ flex: 1 }} /><TouchableOpacity onPress={() => openEdit(r)} style={[st.actBtn, { backgroundColor: colors.primary + "15" }]}><Edit2 color={colors.primary} size={16} /></TouchableOpacity><TouchableOpacity onPress={() => handleDelete(r)} style={[st.actBtn, { backgroundColor: colors.error + "15" }]}><Trash2 color={colors.error} size={16} /></TouchableOpacity></View>
                        </View>);
                })}
            </ScrollView>

            <Modal visible={showModal} animationType="slide" transparent>
                <View style={st.overlay}><View style={[st.modal, { backgroundColor: colors.card }]}>
                    <View style={st.mHeader}><Text style={[st.mTitle, { color: colors.text }]}>{editing ? "Editar" : "Novo"} Voto</Text><TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}><X color={colors.textSecondary} size={24} /></TouchableOpacity></View>
                    <ScrollView style={st.mBody}>
                        <Text style={[st.label, { color: colors.text }]}>Matéria *</Text>
                        {bills.length > 0 ? <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>{bills.map(b => (<TouchableOpacity key={b.id} onPress={() => { setBillId(b.id); setSubject(`${b.number} - ${b.title}`); }} style={[st.chip, { backgroundColor: billId === b.id ? colors.primary : colors.backgroundSecondary }]}><Text style={{ color: billId === b.id ? "#fff" : colors.text, fontSize: 12 }}>{b.number || b.title.substring(0, 20)}</Text></TouchableOpacity>))}</ScrollView> : null}
                        <TextInput style={[st.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="Assunto da matéria" placeholderTextColor={colors.textSecondary} value={subject} onChangeText={setSubject} />
                        <Text style={[st.label, { color: colors.text }]}>Data</Text><TextInput style={[st.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="AAAA-MM-DD" placeholderTextColor={colors.textSecondary} value={date} onChangeText={setDate} />
                        <Text style={[st.label, { color: colors.text }]}>Sessão</Text><TextInput style={[st.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="Ex: 123/2025" placeholderTextColor={colors.textSecondary} value={session} onChangeText={setSession} />
                        <Text style={[st.label, { color: colors.text }]}>Voto</Text><View style={st.chipRow}>{CHOICES.map(c => (<TouchableOpacity key={c.v} onPress={() => setVote(c.v)} style={[st.chip, { backgroundColor: vote === c.v ? c.c + "20" : colors.backgroundSecondary, borderColor: vote === c.v ? c.c : colors.border }]}><Text style={{ color: vote === c.v ? c.c : colors.text, fontSize: 13, fontWeight: "600" }}>{c.l}</Text></TouchableOpacity>))}</View>
                        <Text style={[st.label, { color: colors.text }]}>Resultado</Text><View style={st.chipRow}>{RESULTS.map(r => (<TouchableOpacity key={r.v} onPress={() => setResult(r.v)} style={[st.chip, { backgroundColor: result === r.v ? colors.primary : colors.backgroundSecondary }]}><Text style={{ color: result === r.v ? "#fff" : colors.text, fontSize: 13 }}>{r.l}</Text></TouchableOpacity>))}</View>
                        <Text style={[st.label, { color: colors.text }]}>Observações</Text><TextInput style={[st.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="Opcional" placeholderTextColor={colors.textSecondary} value={notes} onChangeText={setNotes} />
                    </ScrollView>
                    <View style={st.mFooter}><TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }} style={[st.cancelBtn, { borderColor: colors.border }]}><Text style={[st.cancelTxt, { color: colors.textSecondary }]}>Cancelar</Text></TouchableOpacity><TouchableOpacity onPress={handleSave} disabled={saving} style={[st.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}>{saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={st.saveTxt}>{editing ? "Atualizar" : "Registrar"}</Text>}</TouchableOpacity></View>
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
    cardTop: { flexDirection: "row", alignItems: "flex-start" }, billTitle: { fontSize: 15, fontWeight: "600" },
    voteBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginLeft: 8 },
    resultBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    actions: { flexDirection: "row", gap: 8, marginTop: 12, alignItems: "center" },
    actBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
    overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
    modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "90%" },
    mHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.1)" },
    mTitle: { fontSize: 18, fontWeight: "700" }, mBody: { padding: 20 },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 12 },
    input: { borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1 },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "transparent", marginRight: 6, marginBottom: 4 },
    mFooter: { flexDirection: "row", padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.1)" },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, alignItems: "center" }, cancelTxt: { fontSize: 15, fontWeight: "600" },
    saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 10, alignItems: "center", justifyContent: "center" }, saveTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
