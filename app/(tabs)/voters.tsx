import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
  TextInput,
} from "react-native";
import {
  Plus,
  User,
  Users,
  ChevronDown,
  X,
  Check,
  HeartHandshake,
  Clock,
  CheckCircle2,
  Activity,
  Search,
  Filter,
  Download,
  Calendar,
  UserCheck,
} from "lucide-react-native";
import { router } from "expo-router";
import { useData, useFilteredVoters } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { SearchBar, EmptyState } from "@/components/UI";
import Colors from "@/constants/colors";
import { Voter, Leader, HelpCategory, HelpStatus } from "@/types";
import { CategoryLabels, StatusLabels } from "@/constants/labels";
import { DEFAULT_ATENDIMENTO_TYPES } from "@/constants/atendimento-types";

type TabType = "eleitores" | "atendimentos";

export default function VotersScreen() {
  const { leaders, helpRecords } = useData();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("eleitores");

  // ─── Eleitores state ───
  const [search, setSearch] = useState("");
  const [selectedLeader, setSelectedLeader] = useState<string>();
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const filteredVoters = useFilteredVoters(search, selectedLeader);

  // ─── Atendimentos state ───
  const [atendSearch, setAtendSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<HelpCategory | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<HelpStatus | "all">("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // ─── Eleitores helpers ───
  const selectedLeaderData = leaders.find((l) => l.id === selectedLeader);
  const filterLabel = selectedLeaderData
    ? `${selectedLeaderData.name} (${selectedLeaderData.votersCount})`
    : `Todas as Articuladores Políticos (${filteredVoters.length})`;

  const handleSelectLeader = (leaderId?: string) => {
    setSelectedLeader(leaderId);
    setShowLeaderModal(false);
  };

  // ─── Atendimentos helpers ───
  const categories: (HelpCategory | "all")[] = [
    "all", "saude", "educacao", "assistencia_social", "infraestrutura", "emprego", "documentacao", "outros",
  ];
  const statuses: (HelpStatus | "all")[] = ["all", "pending", "in_progress", "completed"];

  const categoryAllLabel: Record<string, string> = { all: "Todas", ...CategoryLabels };
  const statusAllLabel: Record<string, string> = { all: "Todos", ...StatusLabels };

  const formatDateInput = (text: string, setter: (val: string) => void) => {
    const cleaned = text.replace(/\D/g, "");
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    if (cleaned.length > 4) formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4) + "/" + cleaned.slice(4, 8);
    setter(formatted);
  };

  const parseDate = (dateStr: string): Date | null => {
    if (!dateStr || dateStr.length !== 10) return null;
    const [day, month, year] = dateStr.split("/");
    if (!day || !month || !year) return null;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  // All atendimento types from records + defaults
  const allAtendimentoTypes = useMemo(() => {
    const typesFromRecords = helpRecords
      .map((r) => r.description)
      .filter((d): d is string => !!d && d.trim() !== "");
    const uniqueTypes = [...new Set([...DEFAULT_ATENDIMENTO_TYPES, ...typesFromRecords])].sort();
    return uniqueTypes;
  }, [helpRecords]);

  // Filter records
  const filteredRecords = useMemo(() => {
    let records = [...helpRecords];

    if (atendSearch.trim()) {
      const q = atendSearch.toLowerCase();
      records = records.filter(
        (r) =>
          r.voterName?.toLowerCase().includes(q) ||
          r.description?.toLowerCase().includes(q) ||
          r.leaderName?.toLowerCase().includes(q) ||
          r.responsibleName?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "all") {
      records = records.filter((r) => r.category === selectedCategory);
    }

    if (selectedStatus !== "all") {
      records = records.filter((r) => r.status === selectedStatus);
    }

    if (selectedType !== "all") {
      records = records.filter((r) => r.description === selectedType);
    }

    const fromDate = parseDate(dateFrom);
    if (fromDate) {
      records = records.filter((r) => {
        const recordDate = r.serviceDate ? new Date(r.serviceDate) : new Date(r.createdAt);
        return recordDate >= fromDate;
      });
    }

    const toDate = parseDate(dateTo);
    if (toDate) {
      toDate.setHours(23, 59, 59, 999);
      records = records.filter((r) => {
        const recordDate = r.serviceDate ? new Date(r.serviceDate) : new Date(r.createdAt);
        return recordDate <= toDate;
      });
    }

    records.sort((a, b) => {
      const dateA = a.serviceDate ? new Date(a.serviceDate).getTime() : new Date(a.createdAt).getTime();
      const dateB = b.serviceDate ? new Date(b.serviceDate).getTime() : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    return records;
  }, [helpRecords, atendSearch, selectedCategory, selectedStatus, selectedType, dateFrom, dateTo]);

  // Stats
  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const pending = filteredRecords.filter((r) => r.status === "pending").length;
    const inProgress = filteredRecords.filter((r) => r.status === "in_progress").length;
    const completed = filteredRecords.filter((r) => r.status === "completed").length;

    // Category breakdown
    const byCategory: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      const cat = CategoryLabels[r.category] || r.category;
      byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    // Type breakdown (top 5)
    const byType: Record<string, number> = {};
    filteredRecords.forEach((r) => {
      const type = r.description || "Sem tipo";
      byType[type] = (byType[type] || 0) + 1;
    });
    const topTypes = Object.entries(byType)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    return { total, pending, inProgress, completed, byCategory, topTypes };
  }, [filteredRecords]);

  // Export CSV
  const handleExport = () => {
    try {
      const headers = [
        "Data Atendimento", "Eleitor", "Tipo", "Categoria", "Status",
        "Responsável", "Articulador Político", "Observações", "Data Registro",
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

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedType("all");
    setDateFrom("");
    setDateTo("");
    setAtendSearch("");
  };

  const hasActiveFilters = selectedCategory !== "all" || selectedStatus !== "all" || selectedType !== "all" || dateFrom || dateTo;

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
      case "completed": return <CheckCircle2 color={Colors.light.success} size={14} />;
      case "in_progress": return <Activity color={Colors.light.warning} size={14} />;
      case "pending": return <Clock color={Colors.light.error} size={14} />;
      default: return null;
    }
  };

  // ─── Render: Voter Card ───
  const renderVoterCard = ({ item }: { item: Voter }) => (
    <TouchableOpacity
      style={styles.voterCard}
      onPress={() => router.push({ pathname: "/voter-details", params: { id: item.id } })}
    >
      <View style={styles.voterAvatar}>
        <User color={Colors.light.primary} size={24} />
      </View>
      <View style={styles.voterInfo}>
        <Text style={styles.voterName}>{item.name}</Text>
        <Text style={styles.voterDetails}>
          {item.phone} • {item.neighborhood}
        </Text>
        <Text style={styles.voterLeader}>Articulador Político: {item.leaderName}</Text>
      </View>
      <View style={styles.voterBadge}>
        <Text style={styles.voterBadgeText}>{item.votesCount}</Text>
        <Text style={styles.voterBadgeLabel}>votos</Text>
      </View>
    </TouchableOpacity>
  );

  const renderLeaderItem = (leader: Leader) => {
    const isSelected = selectedLeader === leader.id;
    return (
      <TouchableOpacity
        key={leader.id}
        style={[styles.leaderItem, isSelected && styles.leaderItemSelected]}
        onPress={() => handleSelectLeader(leader.id)}
      >
        <View style={styles.leaderItemContent}>
          <Users color={isSelected ? Colors.light.primary : Colors.light.textSecondary} size={20} />
          <View style={styles.leaderItemInfo}>
            <Text style={[styles.leaderItemName, isSelected && styles.leaderItemNameSelected]}>
              {leader.name}
            </Text>
            <Text style={styles.leaderItemCount}>
              {leader.votersCount} eleitor{leader.votersCount !== 1 ? "es" : ""}
            </Text>
          </View>
        </View>
        {isSelected && <Check color={Colors.light.primary} size={20} />}
      </TouchableOpacity>
    );
  };

  // ─── Render: Eleitores Tab ───
  const renderEleitoresTab = () => (
    <>
      <View style={styles.topActions}>
        <TouchableOpacity
          style={styles.manageLeadersButton}
          onPress={() => router.push("/manage-leaders")}
        >
          <Users color={Colors.light.primary} size={20} />
          <Text style={styles.manageLeadersText}>Gerenciar Articuladores Políticos</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.header}>
        <SearchBar
          placeholder="Buscar por nome, telefone ou CPF..."
          value={search}
          onChangeText={setSearch}
          containerStyle={styles.searchBar}
        />
        <TouchableOpacity style={styles.addButton} onPress={() => router.push("/add-voter")}>
          <Plus color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={styles.filterDropdown}
          onPress={() => setShowLeaderModal(true)}
        >
          <Users color={Colors.light.primary} size={18} />
          <Text style={styles.filterDropdownText} numberOfLines={1}>
            {filterLabel}
          </Text>
          <ChevronDown color={Colors.light.textSecondary} size={20} />
        </TouchableOpacity>
        {selectedLeader && (
          <TouchableOpacity style={styles.clearFilterButton} onPress={() => setSelectedLeader(undefined)}>
            <X color={Colors.light.textSecondary} size={18} />
          </TouchableOpacity>
        )}
      </View>

      {filteredVoters.length === 0 ? (
        <EmptyState
          icon={<User color={Colors.light.textSecondary} size={64} />}
          title="Nenhum eleitor encontrado"
          description={
            search ? "Tente ajustar os filtros ou busca" : "Comece adicionando o primeiro eleitor"
          }
          action={{ label: "Adicionar Eleitor", onPress: () => router.push("/add-voter") }}
        />
      ) : (
        <FlatList
          data={filteredVoters}
          renderItem={renderVoterCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </>
  );

  // ─── Render: Atendimentos Tab ───
  const renderAtendimentosTab = () => (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { borderLeftColor: Colors.light.primary }]}>
          <HeartHandshake color={Colors.light.primary} size={22} />
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: Colors.light.error }]}>
          <Clock color={Colors.light.error} size={22} />
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: Colors.light.warning }]}>
          <Activity color={Colors.light.warning} size={22} />
          <Text style={styles.statNumber}>{stats.inProgress}</Text>
          <Text style={styles.statLabel}>Andamento</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: Colors.light.success }]}>
          <CheckCircle2 color={Colors.light.success} size={22} />
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Concluídos</Text>
        </View>
      </View>

      {/* Top Types Analysis */}
      {stats.topTypes.length > 0 && (
        <View style={styles.analysisCard}>
          <Text style={styles.analysisTitle}>Top 5 Tipos de Atendimento</Text>
          {stats.topTypes.map(([type, count], idx) => (
            <View key={type} style={styles.analysisRow}>
              <View style={styles.analysisRank}>
                <Text style={styles.analysisRankText}>{idx + 1}º</Text>
              </View>
              <Text style={styles.analysisType} numberOfLines={1}>{type}</Text>
              <View style={styles.analysisBarContainer}>
                <View
                  style={[
                    styles.analysisBar,
                    { width: `${(count / stats.topTypes[0][1]) * 100}%` },
                  ]}
                />
              </View>
              <Text style={styles.analysisCount}>{count}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Category Breakdown */}
      {Object.keys(stats.byCategory).length > 0 && (
        <View style={styles.analysisCard}>
          <Text style={styles.analysisTitle}>Por Categoria</Text>
          {Object.entries(stats.byCategory)
            .sort(([, a], [, b]) => b - a)
            .map(([cat, count]) => (
              <View key={cat} style={styles.analysisCatRow}>
                <Text style={styles.analysisCatName}>{cat}</Text>
                <View style={styles.analysisCatBadge}>
                  <Text style={styles.analysisCatCount}>{count}</Text>
                </View>
              </View>
            ))}
        </View>
      )}

      {/* Search + Actions */}
      <View style={styles.atendSearchRow}>
        <View style={styles.atendSearchContainer}>
          <Search color={Colors.light.textSecondary} size={18} />
          <TextInput
            style={styles.atendSearchInput}
            value={atendSearch}
            onChangeText={setAtendSearch}
            placeholder="Buscar por eleitor, tipo..."
            placeholderTextColor={Colors.light.textSecondary}
          />
          {atendSearch ? (
            <TouchableOpacity onPress={() => setAtendSearch("")}>
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
        <TouchableOpacity style={styles.iconButton} onPress={handleExport}>
          <Download color={Colors.light.primary} size={20} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionLabel}>Categoria</Text>
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
            <Text style={styles.filterSectionLabel}>Status</Text>
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
            <Text style={styles.filterSectionLabel}>Tipo de Atendimento</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.chipRow}>
                <TouchableOpacity
                  style={[styles.chip, selectedType === "all" && styles.chipSelected]}
                  onPress={() => setSelectedType("all")}
                >
                  <Text style={[styles.chipText, selectedType === "all" && styles.chipTextSelected]}>Todos</Text>
                </TouchableOpacity>
                {allAtendimentoTypes.slice(0, 15).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, selectedType === type && styles.chipSelected]}
                    onPress={() => setSelectedType(type)}
                  >
                    <Text
                      style={[styles.chipText, selectedType === type && styles.chipTextSelected]}
                      numberOfLines={1}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionLabel}>Período</Text>
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

      {/* Result Count */}
      <View style={styles.resultCount}>
        <Text style={styles.resultCountText}>
          {filteredRecords.length} atendimento{filteredRecords.length !== 1 ? "s" : ""} encontrado{filteredRecords.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Records List */}
      {filteredRecords.length === 0 ? (
        <View style={styles.emptyState}>
          <HeartHandshake color={Colors.light.textSecondary} size={48} />
          <Text style={styles.emptyStateTitle}>Nenhum atendimento encontrado</Text>
          <Text style={styles.emptyStateSubtext}>Tente ajustar os filtros</Text>
        </View>
      ) : (
        <View style={styles.recordsList}>
          {filteredRecords.map((record) => (
            <TouchableOpacity
              key={record.id}
              style={styles.recordCard}
              onPress={() =>
                router.push({ pathname: "/edit-help", params: { helpId: record.id } })
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
                <Text style={styles.recordNotes} numberOfLines={2}>{record.notes}</Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "eleitores" && styles.tabActive]}
          onPress={() => setActiveTab("eleitores")}
        >
          <User color={activeTab === "eleitores" ? Colors.light.primary : Colors.light.textSecondary} size={18} />
          <Text style={[styles.tabText, activeTab === "eleitores" && styles.tabTextActive]}>
            Eleitores
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "atendimentos" && styles.tabActive]}
          onPress={() => setActiveTab("atendimentos")}
        >
          <HeartHandshake color={activeTab === "atendimentos" ? Colors.light.primary : Colors.light.textSecondary} size={18} />
          <Text style={[styles.tabText, activeTab === "atendimentos" && styles.tabTextActive]}>
            Atendimentos
          </Text>
          {helpRecords.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{helpRecords.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === "eleitores" ? renderEleitoresTab() : renderAtendimentosTab()}

      {/* Leader Selection Modal */}
      <Modal
        visible={showLeaderModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowLeaderModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar por Articulador Político</Text>
              <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowLeaderModal(false)}>
                <X color={Colors.light.text} size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              <TouchableOpacity
                style={[styles.leaderItem, !selectedLeader && styles.leaderItemSelected]}
                onPress={() => handleSelectLeader(undefined)}
              >
                <View style={styles.leaderItemContent}>
                  <Users color={!selectedLeader ? Colors.light.primary : Colors.light.textSecondary} size={20} />
                  <View style={styles.leaderItemInfo}>
                    <Text style={[styles.leaderItemName, !selectedLeader && styles.leaderItemNameSelected]}>
                      Todas as Articuladores Políticos
                    </Text>
                    <Text style={styles.leaderItemCount}>Mostrar todos os eleitores</Text>
                  </View>
                </View>
                {!selectedLeader && <Check color={Colors.light.primary} size={20} />}
              </TouchableOpacity>
              <View style={styles.divider} />
              {leaders.map(renderLeaderItem)}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  // ─── Tab Styles ───
  tabContainer: {
    flexDirection: "row" as const,
    backgroundColor: Colors.light.card,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 14,
    padding: 4,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
      android: { elevation: 2 },
      web: { boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
    }),
  },
  tab: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 12,
    gap: 6,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: `${Colors.light.primary}12`,
    borderWidth: 1,
    borderColor: `${Colors.light.primary}30`,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.textSecondary,
  },
  tabTextActive: {
    color: Colors.light.primary,
    fontWeight: "700" as const,
  },
  tabBadge: {
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700" as const,
  },
  // ─── Eleitores Styles ───
  topActions: {
    padding: 16,
    paddingBottom: 0,
  },
  manageLeadersButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 8,
  },
  manageLeadersText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  header: {
    flexDirection: "row" as const,
    padding: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    ...Platform.select({
      ios: { shadowColor: Colors.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 4 },
      web: { boxShadow: "0 2px 8px rgba(0,0,0,0.2)" },
    }),
  },
  filterContainer: {
    flexDirection: "row" as const,
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
    alignItems: "center" as const,
  },
  filterDropdown: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: 10,
  },
  filterDropdownText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  clearFilterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  voterCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: Colors.light.shadow, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 2 },
      web: { boxShadow: "0 2px 4px rgba(0,0,0,0.1)" },
    }),
  },
  voterAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },
  voterInfo: { flex: 1 },
  voterName: { fontSize: 16, fontWeight: "600" as const, color: Colors.light.text, marginBottom: 4 },
  voterDetails: { fontSize: 14, color: Colors.light.textSecondary, marginBottom: 2 },
  voterLeader: { fontSize: 12, color: Colors.light.textSecondary },
  voterBadge: { alignItems: "center" as const },
  voterBadgeText: { fontSize: 20, fontWeight: "700" as const, color: Colors.light.primary },
  voterBadgeLabel: { fontSize: 11, color: Colors.light.textSecondary },
  // ─── Atendimentos Styles ───
  statsContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
    marginTop: 8,
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
  statNumber: { fontSize: 20, fontWeight: "700" as const, color: Colors.light.text },
  statLabel: { fontSize: 11, color: Colors.light.textSecondary, textAlign: "center" as const },
  // Analysis
  analysisCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
      android: { elevation: 2 },
      web: { boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
    }),
  },
  analysisTitle: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  analysisRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  analysisRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${Colors.light.primary}15`,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  analysisRankText: {
    fontSize: 12,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  analysisType: {
    flex: 1,
    fontSize: 13,
    color: Colors.light.text,
  },
  analysisBarContainer: {
    width: 60,
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    overflow: "hidden" as const,
  },
  analysisBar: {
    height: "100%",
    backgroundColor: Colors.light.primary,
    borderRadius: 3,
  },
  analysisCount: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.light.primary,
    minWidth: 24,
    textAlign: "right" as const,
  },
  analysisCatRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingVertical: 4,
  },
  analysisCatName: {
    fontSize: 14,
    color: Colors.light.text,
  },
  analysisCatBadge: {
    backgroundColor: `${Colors.light.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  analysisCatCount: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  // Search
  atendSearchRow: {
    flexDirection: "row" as const,
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  atendSearchContainer: {
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
  atendSearchInput: {
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
  // Filters
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
  filterSection: { gap: 8 },
  filterSectionLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  chipRow: { flexDirection: "row" as const, gap: 8 },
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
  chipText: { fontSize: 13, color: Colors.light.text },
  chipTextSelected: { color: "#fff", fontWeight: "600" as const },
  dateRow: { flexDirection: "row" as const, gap: 8 },
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
  clearFiltersText: { fontSize: 14, fontWeight: "600" as const, color: Colors.light.error },
  // Result
  resultCount: { paddingHorizontal: 16, marginBottom: 12 },
  resultCountText: { fontSize: 13, color: Colors.light.textSecondary, fontStyle: "italic" as const },
  // Empty state
  emptyState: { alignItems: "center" as const, paddingVertical: 48, gap: 12 },
  emptyStateTitle: { fontSize: 16, fontWeight: "600" as const, color: Colors.light.text },
  emptyStateSubtext: { fontSize: 14, color: Colors.light.textSecondary },
  // Records
  recordsList: { paddingHorizontal: 16, gap: 10 },
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
  recordHeader: { gap: 4 },
  recordTitleRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  recordType: { fontSize: 15, fontWeight: "700" as const, color: Colors.light.text, flex: 1, marginRight: 8 },
  statusBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: { fontSize: 12, fontWeight: "600" as const },
  recordCategory: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.primary,
    textTransform: "uppercase" as const,
  },
  recordBody: { gap: 6 },
  recordInfoRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
  recordInfoText: { fontSize: 14, color: Colors.light.textSecondary },
  recordNotes: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontStyle: "italic" as const,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border + "60",
    paddingTop: 8,
  },
  // ─── Modal Styles ───
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end" as const,
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 8 },
      web: { boxShadow: "0 -4px 24px rgba(0,0,0,0.15)" },
    }),
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: { fontSize: 18, fontWeight: "600" as const, color: Colors.light.text },
  modalCloseButton: { padding: 4 },
  modalList: { padding: 16 },
  leaderItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  leaderItemSelected: { backgroundColor: `${Colors.light.primary}15` },
  leaderItemContent: { flexDirection: "row" as const, alignItems: "center" as const, flex: 1, gap: 12 },
  leaderItemInfo: { flex: 1 },
  leaderItemName: { fontSize: 15, fontWeight: "500" as const, color: Colors.light.text },
  leaderItemNameSelected: { color: Colors.light.primary, fontWeight: "600" as const },
  leaderItemCount: { fontSize: 13, color: Colors.light.textSecondary, marginTop: 2 },
  divider: { height: 1, backgroundColor: Colors.light.border, marginVertical: 8 },
});
