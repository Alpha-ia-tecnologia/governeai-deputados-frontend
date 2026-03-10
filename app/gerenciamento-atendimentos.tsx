import React, { useState, useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  RefreshControl,
} from "react-native";
import { Stack, router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import Colors from "@/constants/colors";
import { HelpCategory, HelpStatus, HelpRecord } from "@/types";
import { CategoryLabels, StatusLabels } from "@/constants/labels";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  HeartHandshake,
  Clock,
  CheckCircle2,
  Activity,
  X,
  Calendar,
  User,
  UserCheck,
} from "lucide-react-native";

export default function GerenciamentoAtendimentosScreen() {
  const { helpRecords, refreshData } = useData();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<HelpStatus | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const categories: (HelpCategory | "all")[] = [
    "all",
    "saude",
    "educacao",
    "assistencia_social",
    "infraestrutura",
    "emprego",
    "documentacao",
    "outros",
  ];

  const statuses: (HelpStatus | "all")[] = ["all", "pending", "in_progress", "completed"];

  const categoryAllLabel: Record<string, string> = {
    all: "Todas",
    ...CategoryLabels,
  };

  const statusAllLabel: Record<string, string> = {
    all: "Todos",
    ...StatusLabels,
  };

  // Formatar data DD/MM/AAAA
  const formatDateInput = (text: string, setter: (val: string) => void) => {
    const cleaned = text.replace(/\D/g, "");
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    if (cleaned.length > 4) formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4) + "/" + cleaned.slice(4, 8);
    setter(formatted);
  };

  // Converter DD/MM/AAAA para Date
  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr || dateStr.length !== 10) return null;
    const [day, month, year] = dateStr.split("/");
    if (!day || !month || !year) return null;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  // Formatar data ISO para DD/MM/AAAA
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Filtrar registros
  const filteredRecords = useMemo(() => {
    let records = [...helpRecords];

    // Busca
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      records = records.filter(
        (r) =>
          r.voterName.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.leaderName?.toLowerCase().includes(q) ||
          r.responsibleName?.toLowerCase().includes(q)
      );
    }

    // Categoria
    if (selectedCategory !== "all") {
      records = records.filter((r) => r.category === selectedCategory);
    }

    // Status
    if (selectedStatus !== "all") {
      records = records.filter((r) => r.status === selectedStatus);
    }

    // Data de
    const fromDate = parseDate(dateFrom);
    if (fromDate) {
      records = records.filter((r) => {
        const recordDate = r.serviceDate ? new Date(r.serviceDate) : new Date(r.createdAt);
        return recordDate >= fromDate;
      });
    }

    // Data até
    const toDate = parseDate(dateTo);
    if (toDate) {
      toDate.setHours(23, 59, 59, 999);
      records = records.filter((r) => {
        const recordDate = r.serviceDate ? new Date(r.serviceDate) : new Date(r.createdAt);
        return recordDate <= toDate;
      });
    }

    // Ordenar por data mais recente
    records.sort((a, b) => {
      const dateA = a.serviceDate ? new Date(a.serviceDate).getTime() : new Date(a.createdAt).getTime();
      const dateB = b.serviceDate ? new Date(b.serviceDate).getTime() : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return records;
  }, [helpRecords, searchQuery, selectedCategory, selectedStatus, dateFrom, dateTo]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const pending = filteredRecords.filter((r) => r.status === "pending").length;
    const inProgress = filteredRecords.filter((r) => r.status === "in_progress").length;
    const completed = filteredRecords.filter((r) => r.status === "completed").length;
    return { total, pending, inProgress, completed };
  }, [filteredRecords]);

  // Exportar CSV
  const handleExport = () => {
    try {
      const headers = [
        "Data Atendimento",
        "Eleitor",
        "Tipo",
        "Categoria",
        "Status",
        "Responsável",
        "Articulador Político",
        "Observações",
        "Data Registro",
      ];

      const rows = filteredRecords.map((r) => [
        formatDate(r.serviceDate || r.createdAt),
        r.voterName,
        r.description || "",
        CategoryLabels[r.category] || r.category,
        StatusLabels[r.status] || r.status,
        r.responsibleName || "",
        r.leaderName || "",
        (r.notes || "").replace(/"/g, '""'),
        formatDate(r.createdAt),
      ]);

      const csvContent = [
        headers.join(";"),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(";")),
      ].join("\n");

      if (Platform.OS === "web") {
        const BOM = "\uFEFF";
        const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `atendimentos_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        showToast({ type: "success", title: "Exportado", message: `${filteredRecords.length} atendimentos exportados` });
      } else {
        showToast({ type: "info", title: "Exportação", message: "Exportação disponível apenas na versão web" });
      }
    } catch (error) {
      showToast({ type: "error", title: "Erro", message: "Não foi possível exportar os dados" });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedStatus("all");
    setDateFrom("");
    setDateTo("");
    setSearchQuery("");
  };

  const hasActiveFilters = selectedCategory !== "all" || selectedStatus !== "all" || dateFrom || dateTo;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return Colors.light.success;
      case "in_progress": return Colors.light.warning;
      case "pending": return Colors.light.error;
      default: return Colors.light.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle2 color={Colors.light.success} size={16} />;
      case "in_progress": return <Activity color={Colors.light.warning} size={16} />;
      case "pending": return <Clock color={Colors.light.error} size={16} />;
      default: return null;
    }
  };

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/settings");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Gestão de Atendimentos",
          headerStyle: { backgroundColor: Colors.light.primary },
          headerTintColor: "#fff",
          headerTitleStyle: { fontWeight: "600" as const },
          headerLeft: () => (
            <TouchableOpacity onPress={handleGoBack}>
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Botão Voltar */}
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <ArrowLeft color={Colors.light.primary} size={20} />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        {/* Estatísticas */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { borderLeftColor: Colors.light.primary }]}>
            <HeartHandshake color={Colors.light.primary} size={24} />
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: Colors.light.error }]}>
            <Clock color={Colors.light.error} size={24} />
            <Text style={styles.statNumber}>{stats.pending}</Text>
            <Text style={styles.statLabel}>Pendentes</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: Colors.light.warning }]}>
            <Activity color={Colors.light.warning} size={24} />
            <Text style={styles.statNumber}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>Andamento</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: Colors.light.success }]}>
            <CheckCircle2 color={Colors.light.success} size={24} />
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Concluídos</Text>
          </View>
        </View>

        {/* Busca + Ações */}
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Search color={Colors.light.textSecondary} size={18} />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar por eleitor, tipo..."
              placeholderTextColor={Colors.light.textSecondary}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <X color={Colors.light.textSecondary} size={18} />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity
            style={[styles.iconButton, showFilters && styles.iconButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter color={showFilters ? "#fff" : Colors.light.primary} size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleExport}
          >
            <Download color={Colors.light.primary} size={20} />
          </TouchableOpacity>
        </View>

        {/* Filtros */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Categoria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.chip, selectedCategory === cat && styles.chipSelected]}
                      onPress={() => setSelectedCategory(cat)}
                    >
                      <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextSelected]}>
                        {categoryAllLabel[cat]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Status</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {statuses.map((stat) => (
                    <TouchableOpacity
                      key={stat}
                      style={[styles.chip, selectedStatus === stat && styles.chipSelected]}
                      onPress={() => setSelectedStatus(stat)}
                    >
                      <Text style={[styles.chipText, selectedStatus === stat && styles.chipTextSelected]}>
                        {statusAllLabel[stat]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Período</Text>
              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <Calendar color={Colors.light.textSecondary} size={16} />
                  <TextInput
                    style={styles.dateInput}
                    value={dateFrom}
                    onChangeText={(t) => formatDateInput(t, setDateFrom)}
                    placeholder="De: DD/MM/AAAA"
                    placeholderTextColor={Colors.light.textSecondary}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
                <View style={styles.dateField}>
                  <Calendar color={Colors.light.textSecondary} size={16} />
                  <TextInput
                    style={styles.dateInput}
                    value={dateTo}
                    onChangeText={(t) => formatDateInput(t, setDateTo)}
                    placeholder="Até: DD/MM/AAAA"
                    placeholderTextColor={Colors.light.textSecondary}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
              </View>
            </View>

            {hasActiveFilters && (
              <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
                <X color={Colors.light.error} size={16} />
                <Text style={styles.clearFiltersText}>Limpar Filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Contador */}
        <View style={styles.resultCount}>
          <Text style={styles.resultCountText}>
            {filteredRecords.length} atendimento{filteredRecords.length !== 1 ? "s" : ""} encontrado{filteredRecords.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Lista */}
        {filteredRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <HeartHandshake color={Colors.light.textSecondary} size={48} />
            <Text style={styles.emptyStateTitle}>Nenhum atendimento encontrado</Text>
            <Text style={styles.emptyStateText}>Tente ajustar os filtros</Text>
          </View>
        ) : (
          <View style={styles.recordsList}>
            {filteredRecords.map((record) => (
              <TouchableOpacity
                key={record.id}
                style={styles.recordCard}
                onPress={() =>
                  router.push({
                    pathname: "/edit-help",
                    params: { helpId: record.id },
                  })
                }
              >
                <View style={styles.recordHeader}>
                  <View style={styles.recordTitleRow}>
                    <Text style={styles.recordType} numberOfLines={1}>
                      {record.description || "Sem tipo"}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(record.status) + "20" }]}>
                      {getStatusIcon(record.status)}
                      <Text style={[styles.statusBadgeText, { color: getStatusColor(record.status) }]}>
                        {StatusLabels[record.status]}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.recordCategory}>
                    {CategoryLabels[record.category] || record.category}
                  </Text>
                </View>

                <View style={styles.recordBody}>
                  <View style={styles.recordInfoRow}>
                    <User color={Colors.light.textSecondary} size={14} />
                    <Text style={styles.recordInfoText}>{record.voterName}</Text>
                  </View>
                  <View style={styles.recordInfoRow}>
                    <UserCheck color={Colors.light.textSecondary} size={14} />
                    <Text style={styles.recordInfoText}>{record.responsibleName || "—"}</Text>
                  </View>
                  <View style={styles.recordInfoRow}>
                    <Calendar color={Colors.light.textSecondary} size={14} />
                    <Text style={styles.recordInfoText}>
                      {formatDate(record.serviceDate || record.createdAt)}
                    </Text>
                  </View>
                </View>

                {record.notes ? (
                  <Text style={styles.recordNotes} numberOfLines={2}>
                    {record.notes}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  backButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.light.primary,
    fontWeight: "600" as const,
  },
  // Estatísticas
  statsContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 70,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 12,
    alignItems: "center" as const,
    gap: 4,
    borderLeftWidth: 3,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
      android: { elevation: 2 },
      web: { boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
    }),
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    textAlign: "center" as const,
  },
  // Busca
  searchRow: {
    flexDirection: "row" as const,
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.light.text,
    paddingVertical: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  iconButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  // Filtros
  filtersContainer: {
    marginHorizontal: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    gap: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
      web: { boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
    }),
  },
  filterSection: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  chipRow: {
    flexDirection: "row" as const,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors.light.text,
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "600" as const,
  },
  dateRow: {
    flexDirection: "row" as const,
    gap: 8,
  },
  dateField: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    gap: 6,
  },
  dateInput: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
    paddingVertical: 10,
  },
  clearFiltersButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    paddingVertical: 8,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.error,
  },
  // Resultado
  resultCount: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultCountText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontStyle: "italic" as const,
  },
  // Empty state
  emptyState: {
    alignItems: "center" as const,
    paddingVertical: 48,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  // Cards
  recordsList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  recordCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
      android: { elevation: 2 },
      web: { boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
    }),
  },
  recordHeader: {
    gap: 4,
  },
  recordTitleRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  recordType: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  recordCategory: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.primary,
    textTransform: "uppercase" as const,
  },
  recordBody: {
    gap: 6,
  },
  recordInfoRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  recordInfoText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  recordNotes: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontStyle: "italic" as const,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border + "60",
    paddingTop: 8,
  },
});
