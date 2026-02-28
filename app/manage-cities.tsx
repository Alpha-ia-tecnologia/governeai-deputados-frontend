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
    Building2,
    Edit2,
    Trash2,
    X,
    MapPin,
    Users,
    Target,
    Search,
    Check,
} from "lucide-react-native";
import { router } from "expo-router";
import { useTheme } from "@/contexts/ThemeContext";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { City } from "@/types";
import { MARANHAO_CITIES, findCityData } from "@/constants/maranhao-cities";


export default function ManageCitiesScreen() {
    const { colors } = useTheme();
    const { cities, addCity, updateCity, deleteCity } = useData();
    const { showToast } = useToast();

    const [showModal, setShowModal] = useState(false);
    const [editingCity, setEditingCity] = useState<City | null>(null);
    const [search, setSearch] = useState("");
    const [saving, setSaving] = useState(false);

    // Form state
    const [name, setName] = useState("");
    const [citySearch, setCitySearch] = useState("");
    const [ibgeCode, setIbgeCode] = useState("");
    const [population, setPopulation] = useState("");
    const [votersGoal, setVotersGoal] = useState("");
    const [leadersGoal, setLeadersGoal] = useState("");

    const filteredMACities = useMemo(() => {
        if (!citySearch.trim()) return MARANHAO_CITIES;
        const q = citySearch.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return MARANHAO_CITIES.filter((c) =>
            c.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").includes(q)
        );
    }, [citySearch]);

    const resetForm = () => {
        setName("");
        setCitySearch("");
        setIbgeCode("");
        setPopulation("");
        setVotersGoal("");
        setLeadersGoal("");
        setEditingCity(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (city: City) => {
        setEditingCity(city);
        setName(city.name);
        setCitySearch("");
        setIbgeCode(city.ibgeCode || "");
        setPopulation(city.population ? String(city.population) : "");
        setVotersGoal(String(city.votersGoal || 0));
        setLeadersGoal(String(city.leadersGoal || 0));
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            showToast({ title: "Nome da cidade é obrigatório", type: "error" });
            return;
        }

        setSaving(true);
        try {
            const data: any = {
                name: name.trim(),
                state: "MA",
                ibgeCode: ibgeCode.trim() || undefined,
                population: population ? parseInt(population) : undefined,
                votersGoal: votersGoal ? parseInt(votersGoal) : 0,
                leadersGoal: leadersGoal ? parseInt(leadersGoal) : 0,
                active: true,
            };

            if (editingCity) {
                await updateCity(editingCity.id, data);
                showToast({ title: "Cidade atualizada com sucesso!", type: "success" });
            } else {
                await addCity(data);
                showToast({ title: "Cidade cadastrada com sucesso!", type: "success" });
            }

            setShowModal(false);
            resetForm();
        } catch (error: any) {
            showToast({ title: error.message || "Erro ao salvar cidade", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (city: City) => {
        Alert.alert(
            "Excluir Cidade",
            `Tem certeza que deseja excluir "${city.name}"?`,
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Excluir",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteCity(city.id);
                            showToast({ title: "Cidade excluída com sucesso!", type: "success" });
                        } catch (error: any) {
                            showToast({ title: error.message || "Erro ao excluir cidade", type: "error" });
                        }
                    },
                },
            ]
        );
    };

    const filteredCities = cities.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.state.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color={colors.text} size={24} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Gestão de Cidades</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        {cities.length} {cities.length === 1 ? "município" : "municípios"} no Maranhão
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={openAddModal}
                    style={[styles.addButton, { backgroundColor: colors.primary }]}
                >
                    <Plus color="#fff" size={20} />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <View style={[styles.searchBox, { backgroundColor: colors.card }]}>
                    <Search color={colors.textSecondary} size={18} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Buscar cidade..."
                        placeholderTextColor={colors.textSecondary}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            {/* Cities List */}
            <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                {filteredCities.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Building2 color={colors.textSecondary} size={48} />
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                            {search ? "Nenhuma cidade encontrada" : "Nenhuma cidade cadastrada"}
                        </Text>
                        <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                            {search ? "Tente outro termo de busca" : "Toque no + para adicionar uma cidade"}
                        </Text>
                    </View>
                ) : (
                    filteredCities.map((city) => (
                        <View
                            key={city.id}
                            style={[styles.cityCard, { backgroundColor: colors.card }]}
                        >
                            <View style={styles.cityHeader}>
                                <View style={[styles.cityIcon, { backgroundColor: colors.primary + "15" }]}>
                                    <Building2 color={colors.primary} size={22} />
                                </View>
                                <View style={styles.cityInfo}>
                                    <Text style={[styles.cityName, { color: colors.text }]}>{city.name}</Text>
                                    <View style={styles.cityMeta}>
                                        <MapPin color={colors.textSecondary} size={12} />
                                        <Text style={[styles.cityState, { color: colors.textSecondary }]}>
                                            {city.state}
                                            {city.population ? ` • ${city.population.toLocaleString("pt-BR")} hab.` : ""}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.actions}>
                                    <TouchableOpacity
                                        onPress={() => openEditModal(city)}
                                        style={[styles.actionBtn, { backgroundColor: colors.primary + "15" }]}
                                    >
                                        <Edit2 color={colors.primary} size={16} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(city)}
                                        style={[styles.actionBtn, { backgroundColor: colors.error + "15" }]}
                                    >
                                        <Trash2 color={colors.error} size={16} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Goals */}
                            <View style={styles.goalsRow}>
                                <View style={[styles.goalChip, { backgroundColor: colors.backgroundSecondary }]}>
                                    <Users color={colors.primary} size={14} />
                                    <Text style={[styles.goalText, { color: colors.text }]}>
                                        Meta Eleitores: {city.votersGoal || 0}
                                    </Text>
                                </View>
                                <View style={[styles.goalChip, { backgroundColor: colors.backgroundSecondary }]}>
                                    <Target color={colors.success || colors.primary} size={14} />
                                    <Text style={[styles.goalText, { color: colors.text }]}>
                                        Meta Lideranças: {city.leadersGoal || 0}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Add/Edit Modal */}
            <Modal visible={showModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {editingCity ? "Editar Cidade" : "Nova Cidade"}
                            </Text>
                            <TouchableOpacity onPress={() => { setShowModal(false); resetForm(); }}>
                                <X color={colors.textSecondary} size={24} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} nestedScrollEnabled>
                            <Text style={[styles.label, { color: colors.text }]}>Município *</Text>
                            {name ? (
                                <View style={[styles.selectedCityBox, { backgroundColor: colors.primary + "12", borderColor: colors.primary }]}>
                                    <Check color={colors.primary} size={16} />
                                    <Text style={[styles.selectedCityText, { color: colors.primary }]}>{name}</Text>
                                    <TouchableOpacity onPress={() => setName("")} style={styles.clearCityBtn}>
                                        <X color={colors.textSecondary} size={16} />
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <View style={[styles.citySelectorSearch, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                                        <Search color={colors.textSecondary} size={16} />
                                        <TextInput
                                            style={[styles.citySelectorInput, { color: colors.text }]}
                                            placeholder="Buscar município..."
                                            placeholderTextColor={colors.textSecondary}
                                            value={citySearch}
                                            onChangeText={setCitySearch}
                                            autoFocus
                                        />
                                    </View>
                                    <ScrollView style={[styles.cityList, { borderColor: colors.border }]} nestedScrollEnabled>
                                        {filteredMACities.length === 0 ? (
                                            <Text style={[styles.noCityText, { color: colors.textSecondary }]}>Nenhum município encontrado</Text>
                                        ) : (
                                            filteredMACities.map((c) => (
                                                <TouchableOpacity
                                                    key={c.name}
                                                    onPress={() => {
                                                        setName(c.name);
                                                        setPopulation(String(c.population));
                                                        setCitySearch("");
                                                    }}
                                                    style={[styles.cityOption, { borderBottomColor: colors.border }]}
                                                >
                                                    <Building2 color={colors.textSecondary} size={14} />
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={[styles.cityOptionText, { color: colors.text }]}>{c.name}</Text>
                                                        <Text style={{ color: colors.textSecondary, fontSize: 11 }}>
                                                            {c.population.toLocaleString("pt-BR")} habitantes
                                                        </Text>
                                                    </View>
                                                </TouchableOpacity>
                                            ))
                                        )}
                                    </ScrollView>
                                </>
                            )}

                            <Text style={[styles.label, { color: colors.text }]}>Estado</Text>
                            <View style={[styles.fixedStateBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                                <MapPin color={colors.primary} size={16} />
                                <Text style={[styles.fixedStateText, { color: colors.text }]}>Maranhão — MA</Text>
                            </View>

                            <Text style={[styles.label, { color: colors.text }]}>Código IBGE</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                                placeholder="Código IBGE (opcional)"
                                placeholderTextColor={colors.textSecondary}
                                value={ibgeCode}
                                onChangeText={setIbgeCode}
                                keyboardType="numeric"
                            />

                            <Text style={[styles.label, { color: colors.text }]}>População</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                                placeholder="População estimada"
                                placeholderTextColor={colors.textSecondary}
                                value={population}
                                onChangeText={setPopulation}
                                keyboardType="numeric"
                            />

                            <View style={styles.goalsForm}>
                                <View style={styles.goalField}>
                                    <Text style={[styles.label, { color: colors.text }]}>Meta de Eleitores</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                                        placeholder="0"
                                        placeholderTextColor={colors.textSecondary}
                                        value={votersGoal}
                                        onChangeText={setVotersGoal}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={styles.goalField}>
                                    <Text style={[styles.label, { color: colors.text }]}>Meta de Lideranças</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
                                        placeholder="0"
                                        placeholderTextColor={colors.textSecondary}
                                        value={leadersGoal}
                                        onChangeText={setLeadersGoal}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
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
                                        {editingCity ? "Atualizar" : "Cadastrar"}
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
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
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
    searchContainer: { padding: 16, paddingBottom: 8 },
    searchBox: {
        flexDirection: "row", alignItems: "center",
        borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 15 },
    list: { flex: 1 },
    listContent: { padding: 16, paddingTop: 8 },
    emptyState: { alignItems: "center", paddingTop: 60, gap: 12 },
    emptyText: { fontSize: 16, fontWeight: "600" },
    emptySubtext: { fontSize: 14 },
    cityCard: {
        borderRadius: 12, padding: 16, marginBottom: 12,
        ...Platform.select({
            web: { boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
            android: { elevation: 2 },
        }),
    },
    cityHeader: { flexDirection: "row", alignItems: "center" },
    cityIcon: {
        width: 44, height: 44, borderRadius: 22,
        justifyContent: "center", alignItems: "center", marginRight: 12,
    },
    cityInfo: { flex: 1 },
    cityName: { fontSize: 16, fontWeight: "600" },
    cityMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
    cityState: { fontSize: 13 },
    actions: { flexDirection: "row", gap: 8 },
    actionBtn: {
        width: 34, height: 34, borderRadius: 17,
        justifyContent: "center", alignItems: "center",
    },
    goalsRow: { flexDirection: "row", gap: 8, marginTop: 12 },
    goalChip: {
        flex: 1, flexDirection: "row", alignItems: "center", gap: 6,
        paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8,
    },
    goalText: { fontSize: 12, fontWeight: "500" },
    modalOverlay: {
        flex: 1, justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalContent: {
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        maxHeight: "85%",
    },
    modalHeader: {
        flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        padding: 20, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.1)",
    },
    modalTitle: { fontSize: 18, fontWeight: "700" },
    modalBody: { padding: 20 },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 12 },
    input: {
        borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1,
    },
    fixedStateBox: {
        flexDirection: "row", alignItems: "center", gap: 8,
        borderRadius: 10, padding: 12, borderWidth: 1,
    },
    fixedStateText: { fontSize: 15, fontWeight: "600" },
    // City selector
    selectedCityBox: {
        flexDirection: "row", alignItems: "center", gap: 8,
        borderRadius: 10, padding: 12, borderWidth: 1,
    },
    selectedCityText: { fontSize: 15, fontWeight: "700", flex: 1 },
    clearCityBtn: { padding: 4 },
    citySelectorSearch: {
        flexDirection: "row", alignItems: "center", gap: 8,
        borderRadius: 10, padding: 10, borderWidth: 1,
    },
    citySelectorInput: {
        flex: 1, fontSize: 14,
        ...Platform.select({ web: { outlineStyle: "none" as any } }),
    },
    cityList: { maxHeight: 200, borderWidth: 1, borderRadius: 10, marginTop: 6, overflow: "hidden" as any },
    cityOption: {
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1,
    },
    cityOptionText: { fontSize: 14 },
    noCityText: { padding: 14, fontSize: 13, textAlign: "center" as any },
    goalsForm: { flexDirection: "row", gap: 12, marginTop: 4 },
    goalField: { flex: 1 },
    modalFooter: {
        flexDirection: "row", padding: 20, gap: 12,
        borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.1)",
    },
    cancelBtn: {
        flex: 1, paddingVertical: 14, borderRadius: 10,
        borderWidth: 1, alignItems: "center",
    },
    cancelBtnText: { fontSize: 15, fontWeight: "600" },
    saveBtn: {
        flex: 2, paddingVertical: 14, borderRadius: 10,
        alignItems: "center", justifyContent: "center",
    },
    saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
