import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Alert, Platform, ActivityIndicator } from "react-native";
import { ArrowLeft, Plus, Receipt, Edit2, Trash2, X, Search } from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { CeapExpense, ExpenseCategory } from "@/types";
import { Typography, Spacing, Radius } from "@/constants/colors";
import { CEAP_MONTHLY_QUOTA } from "@/constants/mockData";

const CATS: { v: ExpenseCategory; l: string }[] = [
    { v: "combustivel", l: "Combustível" }, { v: "passagens_aereas", l: "Passagem Aérea" },
    { v: "telefonia", l: "Telefonia" }, { v: "servicos_postais", l: "Postais" },
    { v: "manutencao_escritorio", l: "Escritório" }, { v: "consultoria", l: "Consultoria" },
    { v: "divulgacao", l: "Divulgação" }, { v: "alimentacao", l: "Alimentação" },
    { v: "hospedagem", l: "Hospedagem" }, { v: "locacao_veiculos", l: "Locação Veículos" },
    { v: "seguranca", l: "Segurança" }, { v: "outros", l: "Outros" },
];

export default function ManageCeapScreen() {
    const { colors } = useTheme();
    const { ceapExpenses: realCeap, addCeapExpense, updateCeapExpense, deleteCeapExpense } = useData();
    const ceapExpenses = realCeap;
    const { showToast } = useToast();
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<CeapExpense | null>(null);
    const [search, setSearch] = useState(""); const [saving, setSaving] = useState(false);
    const [description, setDescription] = useState(""); const [category, setCategory] = useState<ExpenseCategory>("combustivel");
    const [supplier, setSupplier] = useState(""); const [documentNumber, setDocumentNumber] = useState("");
    const [value, setValue] = useState(""); const [date, setDate] = useState("");

    const resetForm = () => { setDescription(""); setCategory("combustivel"); setSupplier(""); setDocumentNumber(""); setValue(""); setDate(""); setEditing(null); };
    const openAdd = () => { resetForm(); setShowModal(true); };
    const openEdit = (e: CeapExpense) => { setEditing(e); setDescription(e.description); setCategory(e.category); setSupplier(e.supplier); setDocumentNumber(e.documentNumber || ""); setValue(String(e.value)); setDate(e.date); setShowModal(true); };

    const handleSave = async () => {
        if (!description.trim()) { showToast({ title: "Descrição obrigatória", type: "error" }); return; }
        if (!value || isNaN(parseFloat(value))) { showToast({ title: "Valor obrigatório", type: "error" }); return; }
        setSaving(true);
        try {
            const data: any = { description: description.trim(), category, supplier: supplier.trim(), documentNumber: documentNumber.trim() || undefined, value: parseFloat(value), date: date || new Date().toISOString().split("T")[0] };
            if (editing) { await updateCeapExpense(editing.id, data); showToast({ title: "Atualizado!", type: "success" }); }
            else { await addCeapExpense(data); showToast({ title: "Registrado!", type: "success" }); }
            setShowModal(false); resetForm();
        } catch (e: any) { showToast({ title: e.message || "Erro", type: "error" }); } finally { setSaving(false); }
    };

    const handleDelete = (e: CeapExpense) => Alert.alert("Excluir", `"${e.description}"?`, [{ text: "Não", style: "cancel" }, { text: "Sim", style: "destructive", onPress: async () => { try { await deleteCeapExpense(e.id); showToast({ title: "Excluído!", type: "success" }); } catch (err: any) { showToast({ title: err.message, type: "error" }); } } }]);

    const totalGasto = useMemo(() => ceapExpenses.reduce((s, e) => s + e.value, 0), [ceapExpenses]);
    const QUOTA = CEAP_MONTHLY_QUOTA;
    const usedPercent = Math.min((totalGasto / QUOTA) * 100, 100);

    const filtered = ceapExpenses.filter(e => e.description.toLowerCase().includes(search.toLowerCase()) || e.supplier.toLowerCase().includes(search.toLowerCase()));
    const catLabel = (c: ExpenseCategory) => CATS.find(ct => ct.v === c)?.l || c;

    const byCategory = useMemo(() => {
        const map: Record<string, number> = {};
        ceapExpenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.value; });
        return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [ceapExpenses]);

    return (
        <View style={[st.container, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={[st.header, { backgroundColor: colors.card }]}><TouchableOpacity onPress={() => router.back()} style={st.backBtn}><ArrowLeft color={colors.text} size={24} /></TouchableOpacity><View style={st.hTitle}><Text style={[st.hTitleTxt, { color: colors.text }]}>CEAP - Despesas</Text><Text style={[st.hSub, { color: colors.textSecondary }]}>{ceapExpenses.length} lançamentos</Text></View><TouchableOpacity onPress={openAdd} style={[st.addBtn, { backgroundColor: colors.primary }]}><Plus color="#fff" size={20} /></TouchableOpacity></View>

            {/* Quota Bar */}
            <View style={[st.quotaCard, { backgroundColor: colors.card }]}>
                <View style={st.quotaRow}><Text style={[st.quotaLabel, { color: colors.textSecondary }]}>Cota Mensal</Text><Text style={[st.quotaValue, { color: colors.text }]}>R$ {QUOTA.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Text></View>
                <View style={[st.progressBg, { backgroundColor: colors.backgroundSecondary }]}><View style={[st.progressFill, { width: `${usedPercent}%`, backgroundColor: usedPercent > 80 ? "#ef4444" : usedPercent > 60 ? "#f59e0b" : "#22c55e" }]} /></View>
                <View style={st.quotaRow}><Text style={{ color: usedPercent > 80 ? "#ef4444" : colors.textSecondary, fontSize: 13, fontWeight: "600" }}>Usado: R$ {totalGasto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} ({usedPercent.toFixed(1)}%)</Text><Text style={{ color: colors.textSecondary, fontSize: 13 }}>Saldo: R$ {(QUOTA - totalGasto).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Text></View>
            </View>

            {/* Top Categories */}
            {byCategory.length > 0 && <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 60 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                {byCategory.map(([cat, val]) => (<View key={cat} style={[st.catChip, { backgroundColor: colors.card }]}><Text style={{ color: colors.text, fontSize: 11, fontWeight: "600" }}>{catLabel(cat as ExpenseCategory)}</Text><Text style={{ color: colors.primary, fontSize: 12, fontWeight: "700" }}>R$ {val.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}</Text></View>))}
            </ScrollView>}

            <View style={st.searchWrap}><View style={[st.searchBox, { backgroundColor: colors.card }]}><Search color={colors.textSecondary} size={18} /><TextInput style={[st.searchInput, { color: colors.text }]} placeholder="Buscar despesa..." placeholderTextColor={colors.textSecondary} value={search} onChangeText={setSearch} /></View></View>

            <ScrollView style={st.list} contentContainerStyle={st.listPad}>
                {filtered.length === 0 ? (<View style={st.empty}><Receipt color={colors.textSecondary} size={48} /><Text style={[st.emptyTxt, { color: colors.textSecondary }]}>Nenhuma despesa</Text></View>) : filtered.map(e => (
                    <View key={e.id} style={[st.card, { backgroundColor: colors.card }]}>
                        <View style={st.cardTop}><View style={{ flex: 1 }}><Text style={[st.expTitle, { color: colors.text }]}>{e.description}</Text><Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{e.supplier} • {e.date}</Text></View><Text style={[st.expValue, { color: colors.primary }]}>R$ {e.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</Text></View>
                        <View style={st.meta}><View style={[st.catBadge, { backgroundColor: colors.primary + "15" }]}><Text style={{ color: colors.primary, fontSize: 11, fontWeight: "600" }}>{catLabel(e.category)}</Text></View>{e.documentNumber ? <Text style={{ color: colors.textSecondary, fontSize: 11 }}>Doc: {e.documentNumber}</Text> : null}</View>
                        <View style={st.actions}><TouchableOpacity onPress={() => openEdit(e)} style={[st.actBtn, { backgroundColor: colors.primary + "15" }]}><Edit2 color={colors.primary} size={16} /></TouchableOpacity><TouchableOpacity onPress={() => handleDelete(e)} style={[st.actBtn, { backgroundColor: colors.error + "15" }]}><Trash2 color={colors.error} size={16} /></TouchableOpacity></View>
                    </View>
                ))}
            </ScrollView>

            <Modal visible={showModal} animationType="slide" transparent>
                <View style={st.overlay}><View style={[st.modal, { backgroundColor: colors.card }]}>
                    <View style={st.mHeader}><Text style={[st.mTitle, { color: colors.text }]}>{editing ? "Editar" : "Nova"} Despesa</Text><TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}><X color={colors.textSecondary} size={24} /></TouchableOpacity></View>
                    <ScrollView style={st.mBody}>
                        <Text style={[st.label, { color: colors.text }]}>Descrição *</Text><TextInput style={[st.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="Descrição" placeholderTextColor={colors.textSecondary} value={description} onChangeText={setDescription} />
                        <Text style={[st.label, { color: colors.text }]}>Categoria</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{CATS.map(c => (<TouchableOpacity key={c.v} onPress={() => setCategory(c.v)} style={[st.chip, { backgroundColor: category === c.v ? colors.primary : colors.backgroundSecondary }]}><Text style={{ color: category === c.v ? "#fff" : colors.text, fontSize: 12 }}>{c.l}</Text></TouchableOpacity>))}</ScrollView>
                        <View style={st.row}><View style={{ flex: 1 }}><Text style={[st.label, { color: colors.text }]}>Valor (R$) *</Text><TextInput style={[st.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="0,00" placeholderTextColor={colors.textSecondary} value={value} onChangeText={setValue} keyboardType="numeric" /></View><View style={{ flex: 1, marginLeft: 12 }}><Text style={[st.label, { color: colors.text }]}>Data</Text><TextInput style={[st.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="AAAA-MM-DD" placeholderTextColor={colors.textSecondary} value={date} onChangeText={setDate} /></View></View>
                        <Text style={[st.label, { color: colors.text }]}>Fornecedor</Text><TextInput style={[st.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="Nome do fornecedor" placeholderTextColor={colors.textSecondary} value={supplier} onChangeText={setSupplier} />
                        <Text style={[st.label, { color: colors.text }]}>Nº Documento</Text><TextInput style={[st.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="NF, recibo..." placeholderTextColor={colors.textSecondary} value={documentNumber} onChangeText={setDocumentNumber} />
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
    quotaCard: { margin: 16, borderRadius: 12, padding: 16, ...Platform.select({ web: { boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }, android: { elevation: 2 } }) },
    quotaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    quotaLabel: { fontSize: 13 }, quotaValue: { fontSize: 15, fontWeight: "700" },
    progressBg: { height: 8, borderRadius: 4, marginVertical: 10 },
    progressFill: { height: 8, borderRadius: 4 },
    catChip: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignItems: "center", minWidth: 80 },
    searchWrap: { padding: 16, paddingBottom: 8, paddingTop: 12 }, searchBox: { flexDirection: "row", alignItems: "center", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 15 }, list: { flex: 1 }, listPad: { padding: 16, paddingTop: 8 },
    empty: { alignItems: "center", paddingTop: 60, gap: 12 }, emptyTxt: { fontSize: 16, fontWeight: "600" },
    card: { borderRadius: 12, padding: 16, marginBottom: 12, ...Platform.select({ web: { boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }, android: { elevation: 2 } }) },
    cardTop: { flexDirection: "row", alignItems: "flex-start" }, expTitle: { fontSize: 15, fontWeight: "600" },
    expValue: { fontSize: 16, fontWeight: "700", marginLeft: 8 },
    meta: { flexDirection: "row", gap: 10, marginTop: 8, alignItems: "center" },
    catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    actions: { flexDirection: "row", gap: 8, marginTop: 12, justifyContent: "flex-end" },
    actBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
    overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
    modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "90%" },
    mHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.1)" },
    mTitle: { fontSize: 18, fontWeight: "700" }, mBody: { padding: 20 },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 12 },
    input: { borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "transparent", marginRight: 6, marginBottom: 4 },
    row: { flexDirection: "row", marginTop: 4 },
    mFooter: { flexDirection: "row", padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.1)" },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, alignItems: "center" }, cancelTxt: { fontSize: 15, fontWeight: "600" },
    saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 10, alignItems: "center", justifyContent: "center" }, saveTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
