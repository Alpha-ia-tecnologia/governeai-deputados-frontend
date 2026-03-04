import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Platform, ActivityIndicator } from "react-native";
import { ArrowLeft, Plus, UserPlus, Edit2, Trash2, X, Search, Phone, MapPin, ShieldCheck, Minus, ShieldAlert, ChevronDown } from "lucide-react-native";
import { fetchCitiesByState, IBGEMunicipio } from "@/services/ibge.service";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useData } from "@/contexts/DataContext";
import { PoliticalContact, PoliticalRole } from "@/types";
import { useAlertDialog } from "@/components/Advanced";
import { Typography, Spacing, Radius } from "@/constants/colors";


const ROLES: { v: PoliticalRole; l: string }[] = [
    { v: "deputado_estadual", l: "Dep. Estadual" },
    { v: "senador", l: "Senador" }, { v: "prefeito", l: "Prefeito" },
    { v: "vereador", l: "Deputado" }, { v: "secretario", l: "Secretário" },
    { v: "lideranca_comunitaria", l: "Líder Comunitário" }, { v: "outro", l: "Outro" },
];

export default function ManagePoliticalContactsScreen() {
    const { colors } = useTheme();
    const { politicalContacts: realContacts, addPoliticalContact, updatePoliticalContact, deletePoliticalContact } = useData();
    const politicalContacts = realContacts;
    const { showAlert: showDeleteAlert, AlertDialogComponent: DeleteAlertDialog } = useAlertDialog();
    const { showAlert: showFeedbackAlert, AlertDialogComponent: FeedbackAlertDialog } = useAlertDialog();
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<PoliticalContact | null>(null);
    const [search, setSearch] = useState(""); const [saving, setSaving] = useState(false);
    const [name, setName] = useState(""); const [phone, setPhone] = useState("");
    const [email, setEmail] = useState(""); const [politicalRole, setPoliticalRole] = useState<PoliticalRole>("vereador");
    const [party, setParty] = useState(""); const [city, setCity] = useState("");
    const [state, setState] = useState(""); const [notes, setNotes] = useState("");
    const [relationship, setRelationship] = useState<"aliado" | "neutro" | "oposicao">("neutro");
    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);
    const [ibgeCities, setIbgeCities] = useState<IBGEMunicipio[]>([]);
    const [loadingCities, setLoadingCities] = useState(false);
    const [citySearch, setCitySearch] = useState("");

    const ESTADOS_BR = [
        { uf: 'AC', nome: 'Acre' }, { uf: 'AL', nome: 'Alagoas' }, { uf: 'AP', nome: 'Amapá' },
        { uf: 'AM', nome: 'Amazonas' }, { uf: 'BA', nome: 'Bahia' }, { uf: 'CE', nome: 'Ceará' },
        { uf: 'DF', nome: 'Distrito Federal' }, { uf: 'ES', nome: 'Espírito Santo' }, { uf: 'GO', nome: 'Goiás' },
        { uf: 'MA', nome: 'Maranhão' }, { uf: 'MT', nome: 'Mato Grosso' }, { uf: 'MS', nome: 'Mato Grosso do Sul' },
        { uf: 'MG', nome: 'Minas Gerais' }, { uf: 'PA', nome: 'Pará' }, { uf: 'PB', nome: 'Paraíba' },
        { uf: 'PR', nome: 'Paraná' }, { uf: 'PE', nome: 'Pernambuco' }, { uf: 'PI', nome: 'Piauí' },
        { uf: 'RJ', nome: 'Rio de Janeiro' }, { uf: 'RN', nome: 'Rio Grande do Norte' }, { uf: 'RS', nome: 'Rio Grande do Sul' },
        { uf: 'RO', nome: 'Rondônia' }, { uf: 'RR', nome: 'Roraima' }, { uf: 'SC', nome: 'Santa Catarina' },
        { uf: 'SP', nome: 'São Paulo' }, { uf: 'SE', nome: 'Sergipe' }, { uf: 'TO', nome: 'Tocantins' },
    ];

    useEffect(() => {
        if (state) {
            setLoadingCities(true);
            fetchCitiesByState(state)
                .then((cities) => setIbgeCities(cities))
                .finally(() => setLoadingCities(false));
        } else {
            setIbgeCities([]);
        }
    }, [state]);

    const filteredCities = ibgeCities.filter((c) =>
        c.nome.toLowerCase().includes(citySearch.toLowerCase())
    );

    const resetForm = () => { setName(""); setPhone(""); setEmail(""); setPoliticalRole("vereador"); setParty(""); setCity(""); setState(""); setNotes(""); setRelationship("neutro"); setEditing(null); setShowStateDropdown(false); setShowCityDropdown(false); setCitySearch(""); };
    const openAdd = () => { resetForm(); setShowModal(true); };
    const openEdit = (c: PoliticalContact) => { setEditing(c); setName(c.name); setPhone(c.phone); setEmail(c.email || ""); setPoliticalRole(c.politicalRole); setParty(c.party || ""); setCity(c.city); setState(c.state); setNotes(c.notes || ""); setRelationship(c.relationship); setShowModal(true); };

    const handleSave = async () => {
        if (!name.trim()) { showFeedbackAlert({ title: "Campo obrigatório", description: "O nome é obrigatório.", confirmText: "Entendi", variant: "warning", showCancel: false }); return; }
        setSaving(true);
        try {
            const data: any = { name: name.trim(), phone: phone.trim(), email: email.trim() || undefined, politicalRole, party: party.trim(), city: city.trim(), state: state.trim(), notes: notes.trim() || undefined, relationship, active: true };
            if (editing) { await updatePoliticalContact(editing.id, data); showFeedbackAlert({ title: "Contato atualizado!", description: "O contato político foi atualizado com sucesso.", confirmText: "OK", variant: "success", showCancel: false }); }
            else { await addPoliticalContact(data); showFeedbackAlert({ title: "Contato cadastrado!", description: "O contato político foi cadastrado com sucesso.", confirmText: "OK", variant: "success", showCancel: false }); }
            setShowModal(false); resetForm();
        } catch (e: any) { showFeedbackAlert({ title: "Erro ao salvar", description: e.message || "Não foi possível salvar o contato.", confirmText: "Fechar", variant: "danger", showCancel: false }); } finally { setSaving(false); }
    };

    const handleDelete = (c: PoliticalContact) => showDeleteAlert({
        title: "Excluir contato",
        description: `Tem certeza que deseja excluir "${c.name}"? Esta ação não pode ser desfeita.`,
        confirmText: "Excluir",
        cancelText: "Cancelar",
        variant: "danger",
        onConfirm: async () => {
            try {
                await deletePoliticalContact(c.id);
                showFeedbackAlert({ title: "Contato excluído", description: "O contato político foi removido com sucesso.", confirmText: "OK", variant: "success", showCancel: false });
            } catch (e: any) {
                showFeedbackAlert({ title: "Erro ao excluir", description: e.message || "Não foi possível excluir o contato.", confirmText: "Fechar", variant: "danger", showCancel: false });
            }
        },
    });

    const filtered = politicalContacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.party || "").toLowerCase().includes(search.toLowerCase()));
    const relColor = (r: string) => r === "aliado" ? "#22c55e" : r === "oposicao" ? "#ef4444" : "#6b7280";
    const relLabel = (r: string) => r === "aliado" ? "Aliado" : r === "oposicao" ? "Oposição" : "Neutro";

    return (
        <View style={[st.container, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={[st.header, { backgroundColor: colors.card }]}><TouchableOpacity onPress={() => router.back()} style={st.backBtn}><ArrowLeft color={colors.text} size={24} /></TouchableOpacity><View style={st.hTitle}><Text style={[st.hTitleTxt, { color: colors.text }]}>Contatos Políticos</Text><Text style={[st.hSub, { color: colors.textSecondary }]}>{politicalContacts.length} contatos</Text></View><TouchableOpacity onPress={openAdd} style={[st.addBtn, { backgroundColor: colors.primary }]}><Plus color="#fff" size={20} /></TouchableOpacity></View>

            <View style={st.statsRow}>
                <View style={[st.statCard, { backgroundColor: colors.card }]}><ShieldCheck color="#22c55e" size={20} /><Text style={[st.statVal, { color: "#22c55e" }]}>{politicalContacts.filter(c => c.relationship === "aliado").length}</Text><Text style={[st.statLbl, { color: colors.textSecondary }]}>Aliados</Text></View>
                <View style={[st.statCard, { backgroundColor: colors.card }]}><Minus color="#6b7280" size={20} /><Text style={[st.statVal, { color: "#6b7280" }]}>{politicalContacts.filter(c => c.relationship === "neutro").length}</Text><Text style={[st.statLbl, { color: colors.textSecondary }]}>Neutros</Text></View>
                <View style={[st.statCard, { backgroundColor: colors.card }]}><ShieldAlert color="#ef4444" size={20} /><Text style={[st.statVal, { color: "#ef4444" }]}>{politicalContacts.filter(c => c.relationship === "oposicao").length}</Text><Text style={[st.statLbl, { color: colors.textSecondary }]}>Oposição</Text></View>
            </View>

            <View style={st.searchWrap}><View style={[st.searchBox, { backgroundColor: colors.card }]}><Search color={colors.textSecondary} size={18} /><TextInput style={[st.searchInput, { color: colors.text }]} placeholder="Buscar contato..." placeholderTextColor={colors.textSecondary} value={search} onChangeText={setSearch} /></View></View>

            <ScrollView style={st.list} contentContainerStyle={st.listPad}>
                {filtered.length === 0 ? (<View style={st.empty}><UserPlus color={colors.textSecondary} size={48} /><Text style={[st.emptyTxt, { color: colors.textSecondary }]}>Nenhum contato</Text></View>) : filtered.map(c => (
                    <View key={c.id} style={[st.card, { backgroundColor: colors.card }]}>
                        <View style={st.cardTop}>
                            <View style={[st.avatar, { backgroundColor: relColor(c.relationship) + "20" }]}><Text style={[st.avatarTxt, { color: relColor(c.relationship) }]}>{c.name.charAt(0).toUpperCase()}</Text></View>
                            <View style={{ flex: 1 }}><Text style={[st.nameText, { color: colors.text }]}>{c.name}</Text><Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }}>{ROLES.find(r => r.v === c.politicalRole)?.l}{c.party ? ` • ${c.party}` : ""}</Text></View>
                            <View style={[st.relBadge, { backgroundColor: relColor(c.relationship) + "20" }]}><Text style={{ color: relColor(c.relationship), fontSize: 11, fontWeight: "600" }}>{relLabel(c.relationship)}</Text></View>
                        </View>
                        <View style={st.contactRow}>
                            {c.phone ? <View style={st.contactItem}><Phone color={colors.textSecondary} size={12} /><Text style={[st.contactText, { color: colors.textSecondary }]}>{c.phone}</Text></View> : null}
                            {c.city ? <View style={st.contactItem}><MapPin color={colors.textSecondary} size={12} /><Text style={[st.contactText, { color: colors.textSecondary }]}>{c.city}{c.state ? `/${c.state}` : ""}</Text></View> : null}
                        </View>
                        <View style={st.actions}><TouchableOpacity onPress={() => openEdit(c)} style={[st.actBtn, { backgroundColor: colors.primary + "15" }]}><Edit2 color={colors.primary} size={16} /></TouchableOpacity><TouchableOpacity onPress={() => handleDelete(c)} style={[st.actBtn, { backgroundColor: colors.error + "15" }]}><Trash2 color={colors.error} size={16} /></TouchableOpacity></View>
                    </View>
                ))}
            </ScrollView>

            <Modal visible={showModal} animationType="slide" transparent>
                <View style={st.overlay}><View style={[st.modal, { backgroundColor: colors.card }]}>
                    <View style={st.mHeader}><Text style={[st.mTitle, { color: colors.text }]}>{editing ? "Editar" : "Novo"} Contato</Text><TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}><X color={colors.textSecondary} size={24} /></TouchableOpacity></View>
                    <ScrollView style={st.mBody}>
                        <Text style={[st.label, { color: colors.text }]}>Nome *</Text><TextInput style={[st.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="Nome" placeholderTextColor={colors.textSecondary} value={name} onChangeText={setName} />
                        <Text style={[st.label, { color: colors.text }]}>Cargo</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{ROLES.map(r => (<TouchableOpacity key={r.v} onPress={() => setPoliticalRole(r.v)} style={[st.chip, { backgroundColor: politicalRole === r.v ? colors.primary : colors.backgroundSecondary }]}><Text style={{ color: politicalRole === r.v ? "#fff" : colors.text, fontSize: 12 }}>{r.l}</Text></TouchableOpacity>))}</ScrollView>
                        <Text style={[st.label, { color: colors.text }]}>Relação</Text><View style={st.chipRow}>{(["aliado", "neutro", "oposicao"] as const).map(r => (<TouchableOpacity key={r} onPress={() => setRelationship(r)} style={[st.chip, { backgroundColor: relationship === r ? relColor(r) + "20" : colors.backgroundSecondary, borderColor: relationship === r ? relColor(r) : colors.border }]}><Text style={{ color: relationship === r ? relColor(r) : colors.text, fontSize: 13, fontWeight: "600" }}>{relLabel(r)}</Text></TouchableOpacity>))}</View>
                        <View style={st.row}><View style={{ flex: 1 }}><Text style={[st.label, { color: colors.text }]}>Partido</Text><TextInput style={[st.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="PT, PL..." placeholderTextColor={colors.textSecondary} value={party} onChangeText={setParty} /></View><View style={{ flex: 1, marginLeft: 12 }}><Text style={[st.label, { color: colors.text }]}>Telefone</Text><TextInput style={[st.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]} placeholder="(00) 00000-0000" placeholderTextColor={colors.textSecondary} value={phone} onChangeText={setPhone} keyboardType="phone-pad" /></View></View>
                        <View style={st.row}>
                            <View style={{ flex: 1 }}>
                                <Text style={[st.label, { color: colors.text }]}>UF</Text>
                                <TouchableOpacity
                                    style={[st.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                                    onPress={() => { setShowStateDropdown(!showStateDropdown); setShowCityDropdown(false); }}
                                >
                                    <Text style={{ color: state ? colors.text : colors.textSecondary, fontSize: 15 }}>
                                        {state ? ESTADOS_BR.find(e => e.uf === state)?.nome || state : 'Selecione o estado'}
                                    </Text>
                                    <ChevronDown size={18} color={colors.textSecondary} />
                                </TouchableOpacity>
                                {showStateDropdown && (
                                    <ScrollView style={{ maxHeight: 200, borderWidth: 1, borderColor: colors.border, borderRadius: 10, marginTop: 4 }} nestedScrollEnabled>
                                        {ESTADOS_BR.map(e => (
                                            <TouchableOpacity key={e.uf} onPress={() => { setState(e.uf); setCity(''); setCitySearch(''); setShowStateDropdown(false); }} style={{ paddingVertical: 10, paddingHorizontal: 14, backgroundColor: state === e.uf ? colors.primary + '15' : 'transparent' }}>
                                                <Text style={{ color: state === e.uf ? colors.primary : colors.text, fontSize: 14, fontWeight: state === e.uf ? '600' : '400' }}>{e.uf} - {e.nome}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                )}
                            </View>
                            <View style={{ flex: 1, marginLeft: 12 }}>
                                <Text style={[st.label, { color: colors.text }]}>Cidade</Text>
                                {!state ? (
                                    <View style={[st.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, justifyContent: 'center' }]}>
                                        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Selecione o estado</Text>
                                    </View>
                                ) : loadingCities ? (
                                    <View style={[st.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                                        <ActivityIndicator size="small" color={colors.primary} />
                                        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Carregando...</Text>
                                    </View>
                                ) : (
                                    <>
                                        <TouchableOpacity
                                            style={[st.input, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
                                            onPress={() => { setShowCityDropdown(!showCityDropdown); setShowStateDropdown(false); }}
                                        >
                                            <Text style={{ color: city ? colors.text : colors.textSecondary, fontSize: 15, flex: 1 }} numberOfLines={1}>
                                                {city || 'Selecione a cidade'}
                                            </Text>
                                            <ChevronDown size={18} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                        {showCityDropdown && (
                                            <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 10, marginTop: 4 }}>
                                                <TextInput
                                                    style={[st.input, { borderWidth: 0, borderBottomWidth: 1, borderBottomColor: colors.border, borderRadius: 0 }]}
                                                    placeholder="Buscar cidade..."
                                                    placeholderTextColor={colors.textSecondary}
                                                    value={citySearch}
                                                    onChangeText={setCitySearch}
                                                    autoFocus
                                                />
                                                <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
                                                    {filteredCities.length === 0 ? (
                                                        <View style={{ padding: 14 }}><Text style={{ color: colors.textSecondary, fontSize: 13 }}>Nenhuma cidade encontrada</Text></View>
                                                    ) : filteredCities.map(c => (
                                                        <TouchableOpacity key={c.id} onPress={() => { setCity(c.nome); setShowCityDropdown(false); setCitySearch(''); }} style={{ paddingVertical: 10, paddingHorizontal: 14, backgroundColor: city === c.nome ? colors.primary + '15' : 'transparent' }}>
                                                            <Text style={{ color: city === c.nome ? colors.primary : colors.text, fontSize: 14, fontWeight: city === c.nome ? '600' : '400' }}>{c.nome}</Text>
                                                        </TouchableOpacity>
                                                    ))}
                                                </ScrollView>
                                            </View>
                                        )}
                                    </>
                                )}
                            </View>
                        </View>
                        <Text style={[st.label, { color: colors.text }]}>Observações</Text><TextInput style={[st.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border, minHeight: 60, textAlignVertical: "top" }]} placeholder="Notas..." placeholderTextColor={colors.textSecondary} value={notes} onChangeText={setNotes} multiline />
                    </ScrollView>
                    <View style={st.mFooter}><TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }} style={[st.cancelBtn, { borderColor: colors.border }]}><Text style={[st.cancelTxt, { color: colors.textSecondary }]}>Cancelar</Text></TouchableOpacity><TouchableOpacity onPress={handleSave} disabled={saving} style={[st.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.6 : 1 }]}>{saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={st.saveTxt}>{editing ? "Atualizar" : "Cadastrar"}</Text>}</TouchableOpacity></View>
                </View></View>
            </Modal>
            {DeleteAlertDialog}
            {FeedbackAlertDialog}
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
    cardTop: { flexDirection: "row", alignItems: "center" },
    avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginRight: 12 },
    avatarTxt: { fontSize: 18, fontWeight: "700" }, nameText: { fontSize: 16, fontWeight: "600" },
    relBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    contactRow: { flexDirection: "row", flexWrap: "wrap", gap: 16, marginTop: 10 },
    contactItem: { flexDirection: "row", alignItems: "center", gap: 4 }, contactText: { fontSize: 12 },
    actions: { flexDirection: "row", gap: 8, marginTop: 12, justifyContent: "flex-end" },
    actBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
    overlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
    modal: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "90%" },
    mHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.1)" },
    mTitle: { fontSize: 18, fontWeight: "700" }, mBody: { padding: 20 },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 12 },
    input: { borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1 },
    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "transparent", marginRight: 6, marginBottom: 4 },
    row: { flexDirection: "row", marginTop: 4 },
    mFooter: { flexDirection: "row", padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.1)" },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 10, borderWidth: 1, alignItems: "center" }, cancelTxt: { fontSize: 15, fontWeight: "600" },
    saveBtn: { flex: 2, paddingVertical: 14, borderRadius: 10, alignItems: "center", justifyContent: "center" }, saveTxt: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
