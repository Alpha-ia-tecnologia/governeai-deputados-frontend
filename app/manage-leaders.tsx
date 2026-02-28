import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Platform,
  Modal,
  TextInput,
  ScrollView,
  Animated,
} from "react-native";
import { Stack, router } from "expo-router";
import {
  Plus,
  Users,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  MapPin,
  Phone,
  Mail,
  Target,
  TrendingUp,
  Filter,
  Award,
  AlertCircle,
  ArrowLeft,
  Cake
} from "lucide-react-native";
import { useData } from "@/contexts/DataContext";
import { SearchBar, EmptyState, Badge } from "@/components/UI";
import { useAlertDialog, useToast, ToastProvider } from "@/components/Advanced";
import Colors from "@/constants/colors";
import { Leader, Voter } from "@/types";

type FilterType = "all" | "active" | "inactive" | "above_goal" | "below_goal";
type SortType = "name" | "voters" | "performance";

export default function ManageLeadersScreen() {
  const { leaders, deleteLeader, updateLeader, voters } = useData();
  const { showAlert: showConfirmDialog, AlertDialogComponent } = useAlertDialog();
  const [search, setSearch] = useState("");
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortType, setSortType] = useState<SortType>("name");
  const [showFilters, setShowFilters] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Leader>>({});
  const [selectedVoter, setSelectedVoter] = useState<Voter | null>(null);
  const [isVoterDetailModalVisible, setIsVoterDetailModalVisible] = useState(false);

  const filteredAndSortedLeaders = leaders
    .filter((leader) => {
      const matchesSearch =
        leader.name.toLowerCase().includes(search.toLowerCase()) ||
        leader.cpf.includes(search) ||
        leader.phone.includes(search) ||
        leader.email.toLowerCase().includes(search.toLowerCase()) ||
        leader.region.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      switch (filterType) {
        case "active":
          return leader.active;
        case "inactive":
          return !leader.active;
        case "above_goal":
          return leader.votersCount >= leader.votersGoal;
        case "below_goal":
          return leader.votersCount < leader.votersGoal;
        default:
          return true;
      }
    })
    .sort((a, b) => {
      switch (sortType) {
        case "voters":
          return b.votersCount - a.votersCount;
        case "performance":
          const aPerf = a.votersGoal > 0 ? (a.votersCount / a.votersGoal) * 100 : 0;
          const bPerf = b.votersGoal > 0 ? (b.votersCount / b.votersGoal) * 100 : 0;
          return bPerf - aPerf;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleEdit = (leader: Leader) => {
    setSelectedLeader(leader);
    setEditForm({
      name: leader.name,
      cpf: leader.cpf,
      phone: leader.phone,
      email: leader.email,
      region: leader.region,
      votersGoal: leader.votersGoal,
      active: leader.active,
    });
    setIsEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedLeader) return;

    if (!editForm.name || !editForm.phone || !editForm.email || !editForm.region) {
      showConfirmDialog({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "warning",
        confirmText: "OK",
        showCancel: false,
      });
      return;
    }

    try {
      await updateLeader(selectedLeader.id, editForm);
      setIsEditModalVisible(false);
      showConfirmDialog({
        title: "Sucesso",
        description: "Liderança atualizada com sucesso!",
        variant: "success",
        confirmText: "OK",
        showCancel: false,
      });
    } catch (error) {
      console.error("Error updating leader:", error);
      showConfirmDialog({
        title: "Erro",
        description: "Não foi possível atualizar a liderança",
        variant: "danger",
        confirmText: "OK",
        showCancel: false,
      });
    }
  };

  const handleViewDetails = (leader: Leader) => {
    setSelectedLeader(leader);
    setIsDetailModalVisible(true);
  };

  const handleToggleActive = (leader: Leader) => {
    const title = leader.active ? "Desativar Liderança" : "Ativar Liderança";
    const message = `Tem certeza que deseja ${leader.active ? "desativar" : "ativar"} ${leader.name}?`;

    showConfirmDialog({
      title,
      description: message,
      variant: leader.active ? "warning" : "success",
      confirmText: leader.active ? "Desativar" : "Ativar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          await updateLeader(leader.id, { active: !leader.active });
          showConfirmDialog({
            title: "Sucesso",
            description: `Liderança ${leader.active ? "desativada" : "ativada"} com sucesso!`,
            variant: "success",
            confirmText: "OK",
            showCancel: false,
          });
        } catch (error) {
          console.error("Error toggling leader:", error);
          showConfirmDialog({
            title: "Erro",
            description: "Não foi possível alterar o status da liderança",
            variant: "danger",
            confirmText: "OK",
            showCancel: false,
          });
        }
      },
    });
  };

  const handleDelete = (leader: Leader) => {
    showConfirmDialog({
      title: "Excluir Liderança",
      description: `Tem certeza que deseja excluir ${leader.name}? Esta ação não pode ser desfeita.`,
      variant: "danger",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          await deleteLeader(leader.id);
          showConfirmDialog({
            title: "Sucesso",
            description: "Liderança excluída com sucesso!",
            variant: "success",
            confirmText: "OK",
            showCancel: false,
          });
        } catch (error) {
          console.error("Error deleting leader:", error);
          showConfirmDialog({
            title: "Erro",
            description: "Não foi possível excluir a liderança",
            variant: "danger",
            confirmText: "OK",
            showCancel: false,
          });
        }
      },
    });
  };

  const getLeaderVoters = (leaderId: string) => {
    return voters.filter(v => v.leaderId === leaderId);
  };

  const renderLeaderCard = ({ item }: { item: Leader }) => {
    const progressPercentage =
      item.votersGoal > 0 ? (item.votersCount / item.votersGoal) * 100 : 0;

    const leaderVoters = getLeaderVoters(item.id);
    const recentVoters = leaderVoters.filter(v => {
      const createdDate = new Date(v.createdAt);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate >= thirtyDaysAgo;
    }).length;

    return (
      <TouchableOpacity
        style={styles.leaderCard}
        onPress={() => handleViewDetails(item)}
        activeOpacity={0.7}
      >
        <View style={styles.leaderHeader}>
          <View style={[
            styles.leaderAvatar,
            { backgroundColor: item.active ? Colors.light.primary + "20" : Colors.light.textSecondary + "20" }
          ]}>
            <Users color={item.active ? Colors.light.primary : Colors.light.textSecondary} size={28} />
          </View>
          <View style={styles.leaderInfo}>
            <View style={styles.leaderNameRow}>
              <Text style={styles.leaderName} numberOfLines={1}>{item.name}</Text>
              {item.active ? (
                <Badge label="Ativo" color={Colors.light.success} />
              ) : (
                <Badge label="Inativo" color={Colors.light.textSecondary} />
              )}
            </View>
            <View style={styles.detailRow}>
              <MapPin color={Colors.light.textSecondary} size={14} />
              <Text style={styles.leaderDetails}>{item.region}</Text>
            </View>
            <View style={styles.detailRow}>
              <Phone color={Colors.light.textSecondary} size={14} />
              <Text style={styles.leaderDetails}>{item.phone}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statBoxValue}>{item.votersCount}</Text>
            <Text style={styles.statBoxLabel}>Eleitores</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxValue}>{item.votersGoal}</Text>
            <Text style={styles.statBoxLabel}>Meta</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statBoxValue, { color: recentVoters > 0 ? Colors.light.success : Colors.light.textSecondary }]}>
              +{recentVoters}
            </Text>
            <Text style={styles.statBoxLabel}>Últimos 30d</Text>
          </View>
        </View>

        <View style={styles.leaderStats}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progresso da Meta</Text>
            <Text style={[styles.progressText, {
              color: progressPercentage >= 100 ? Colors.light.success :
                progressPercentage >= 75 ? Colors.light.warning :
                  progressPercentage >= 50 ? Colors.light.primary : Colors.light.error
            }]}>
              {progressPercentage.toFixed(0)}%
            </Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(progressPercentage, 100)}%`,
                  backgroundColor:
                    progressPercentage >= 100
                      ? Colors.light.success
                      : progressPercentage >= 75
                        ? Colors.light.warning
                        : progressPercentage >= 50
                          ? Colors.light.primary
                          : Colors.light.error,
                },
              ]}
            />
          </View>
        </View>

        <View style={styles.leaderActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonEdit]}
            onPress={() => handleEdit(item)}
          >
            <Edit2 color={Colors.light.primary} size={18} />
            <Text style={[styles.actionButtonText, { color: Colors.light.primary }]}>
              Editar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonToggle]}
            onPress={() => handleToggleActive(item)}
          >
            {item.active ? (
              <XCircle color={Colors.light.error} size={18} />
            ) : (
              <CheckCircle color={Colors.light.success} size={18} />
            )}
            <Text
              style={[
                styles.actionButtonText,
                { color: item.active ? Colors.light.error : Colors.light.success },
              ]}
            >
              {item.active ? "Desativar" : "Ativar"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const totalVoters = leaders.reduce((sum, l) => sum + l.votersCount, 0);
  const activeLeaders = leaders.filter(l => l.active).length;
  const leadersAboveGoal = leaders.filter(l => l.votersCount >= l.votersGoal).length;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Gerenciar Lideranças",
          headerStyle: {
            backgroundColor: Colors.light.primary,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "600" as const,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.push('/(tabs)/settings');
                }
              }}
              style={{ marginLeft: 16 }}
            >
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <SearchBar
            placeholder="Buscar liderança..."
            value={search}
            onChangeText={setSearch}
            containerStyle={styles.searchBar}
          />

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter color="#fff" size={20} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/add-leader")}
          >
            <Plus color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filtersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.filterChip, filterType === "all" && styles.filterChipActive]}
                onPress={() => setFilterType("all")}
              >
                <Text style={[styles.filterChipText, filterType === "all" && styles.filterChipTextActive]}>
                  Todas ({leaders.length})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterType === "active" && styles.filterChipActive]}
                onPress={() => setFilterType("active")}
              >
                <Text style={[styles.filterChipText, filterType === "active" && styles.filterChipTextActive]}>
                  Ativas ({activeLeaders})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterType === "inactive" && styles.filterChipActive]}
                onPress={() => setFilterType("inactive")}
              >
                <Text style={[styles.filterChipText, filterType === "inactive" && styles.filterChipTextActive]}>
                  Inativas ({leaders.length - activeLeaders})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterType === "above_goal" && styles.filterChipActive]}
                onPress={() => setFilterType("above_goal")}
              >
                <Text style={[styles.filterChipText, filterType === "above_goal" && styles.filterChipTextActive]}>
                  Acima da Meta ({leadersAboveGoal})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, filterType === "below_goal" && styles.filterChipActive]}
                onPress={() => setFilterType("below_goal")}
              >
                <Text style={[styles.filterChipText, filterType === "below_goal" && styles.filterChipTextActive]}>
                  Abaixo da Meta ({leaders.length - leadersAboveGoal})
                </Text>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.sortContainer}>
              <Text style={styles.sortLabel}>Ordenar:</Text>
              <TouchableOpacity
                style={[styles.sortButton, sortType === "name" && styles.sortButtonActive]}
                onPress={() => setSortType("name")}
              >
                <Text style={[styles.sortButtonText, sortType === "name" && styles.sortButtonTextActive]}>Nome</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, sortType === "voters" && styles.sortButtonActive]}
                onPress={() => setSortType("voters")}
              >
                <Text style={[styles.sortButtonText, sortType === "voters" && styles.sortButtonTextActive]}>Eleitores</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sortButton, sortType === "performance" && styles.sortButtonActive]}
                onPress={() => setSortType("performance")}
              >
                <Text style={[styles.sortButtonText, sortType === "performance" && styles.sortButtonTextActive]}>Performance</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Users color={Colors.light.primary} size={20} />
            <Text style={styles.summaryValue}>{leaders.length}</Text>
            <Text style={styles.summaryLabel}>Lideranças</Text>
          </View>
          <View style={styles.summaryCard}>
            <Target color={Colors.light.success} size={20} />
            <Text style={styles.summaryValue}>{totalVoters}</Text>
            <Text style={styles.summaryLabel}>Eleitores</Text>
          </View>
          <View style={styles.summaryCard}>
            <Award color={Colors.light.warning} size={20} />
            <Text style={styles.summaryValue}>{leadersAboveGoal}</Text>
            <Text style={styles.summaryLabel}>Na Meta</Text>
          </View>
        </View>

        {filteredAndSortedLeaders.length === 0 ? (
          <EmptyState
            icon={<Users color={Colors.light.textSecondary} size={64} />}
            title="Nenhuma liderança encontrada"
            description={
              search
                ? "Tente ajustar os filtros ou busca"
                : "Comece adicionando a primeira liderança"
            }
            action={{
              label: "Adicionar Liderança",
              onPress: () => router.push("/add-leader"),
            }}
          />
        ) : (
          <FlatList
            data={filteredAndSortedLeaders}
            renderItem={renderLeaderCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}

        <Modal
          visible={isEditModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsEditModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Editar Liderança</Text>
                <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
                  <X color={Colors.light.text} size={24} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nome *</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.name}
                    onChangeText={(text) => setEditForm({ ...editForm, name: text })}
                    placeholder="Nome completo"
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>CPF</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: Colors.light.backgroundSecondary }]}
                    value={editForm.cpf}
                    editable={false}
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Telefone *</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.phone}
                    onChangeText={(text) => setEditForm({ ...editForm, phone: text })}
                    placeholder="(00) 00000-0000"
                    keyboardType="phone-pad"
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email *</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.email}
                    onChangeText={(text) => setEditForm({ ...editForm, email: text })}
                    placeholder="email@exemplo.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Região *</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.region}
                    onChangeText={(text) => setEditForm({ ...editForm, region: text })}
                    placeholder="Ex: Centro, Zona Sul"
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Meta de Eleitores</Text>
                  <TextInput
                    style={styles.input}
                    value={editForm.votersGoal?.toString()}
                    onChangeText={(text) => setEditForm({ ...editForm, votersGoal: parseInt(text) || 0 })}
                    placeholder="0"
                    keyboardType="number-pad"
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => setIsEditModalVisible(false)}
                >
                  <Text style={styles.modalButtonTextSecondary}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={handleSaveEdit}
                >
                  <Text style={styles.modalButtonTextPrimary}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={isDetailModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsDetailModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedLeader && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Detalhes da Liderança</Text>
                    <TouchableOpacity onPress={() => setIsDetailModalVisible(false)}>
                      <X color={Colors.light.text} size={24} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalBody}>
                    <View style={styles.detailHeader}>
                      <View style={styles.detailAvatar}>
                        <Users color={Colors.light.primary} size={40} />
                      </View>
                      <View style={styles.detailHeaderInfo}>
                        <Text style={styles.detailName}>{selectedLeader.name}</Text>
                        {selectedLeader.active ? (
                          <Badge label="Ativo" color={Colors.light.success} style={{ alignSelf: "flex-start" as const }} />
                        ) : (
                          <Badge label="Inativo" color={Colors.light.textSecondary} style={{ alignSelf: "flex-start" as const }} />
                        )}
                      </View>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Informações de Contato</Text>
                      <View style={styles.detailItem}>
                        <Phone color={Colors.light.primary} size={20} />
                        <Text style={styles.detailItemText}>{selectedLeader.phone}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Mail color={Colors.light.primary} size={20} />
                        <Text style={styles.detailItemText}>{selectedLeader.email}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <MapPin color={Colors.light.primary} size={20} />
                        <Text style={styles.detailItemText}>{selectedLeader.region}</Text>
                      </View>
                      {selectedLeader.birthDate && (
                        <View style={styles.detailItem}>
                          <Cake color={Colors.light.primary} size={20} />
                          <Text style={styles.detailItemText}>
                            {new Date(selectedLeader.birthDate).toLocaleDateString("pt-BR")}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Performance</Text>
                      <View style={styles.performanceGrid}>
                        <View style={styles.performanceCard}>
                          <Users color={Colors.light.primary} size={28} />
                          <Text style={styles.performanceValue}>{selectedLeader.votersCount}</Text>
                          <Text style={styles.performanceLabel}>Eleitores Cadastrados</Text>
                        </View>
                        <View style={styles.performanceCard}>
                          <Target color={Colors.light.success} size={28} />
                          <Text style={styles.performanceValue}>{selectedLeader.votersGoal}</Text>
                          <Text style={styles.performanceLabel}>Meta</Text>
                        </View>
                      </View>

                      <View style={styles.performanceBar}>
                        <View style={styles.performanceBarHeader}>
                          <Text style={styles.performanceBarLabel}>Progresso</Text>
                          <Text style={styles.performanceBarValue}>
                            {selectedLeader.votersGoal > 0
                              ? ((selectedLeader.votersCount / selectedLeader.votersGoal) * 100).toFixed(0)
                              : 0}%
                          </Text>
                        </View>
                        <View style={styles.progressBarContainer}>
                          <View
                            style={[
                              styles.progressBar,
                              {
                                width: `${Math.min(
                                  selectedLeader.votersGoal > 0
                                    ? (selectedLeader.votersCount / selectedLeader.votersGoal) * 100
                                    : 0,
                                  100
                                )}%`,
                                backgroundColor: Colors.light.success,
                              },
                            ]}
                          />
                        </View>
                      </View>

                      {selectedLeader.votersCount >= selectedLeader.votersGoal && (
                        <View style={styles.achievementBanner}>
                          <Award color={Colors.light.warning} size={24} />
                          <Text style={styles.achievementText}>Meta atingida! 🎉</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Informações Adicionais</Text>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>CPF:</Text>
                        <Text style={styles.infoValue}>{selectedLeader.cpf || "Não informado"}</Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Data de Cadastro:</Text>
                        <Text style={styles.infoValue}>
                          {new Date(selectedLeader.createdAt).toLocaleDateString("pt-BR")}
                        </Text>
                      </View>
                    </View>

                    {/* Seção de Eleitores Vinculados */}
                    <View style={styles.detailSection}>
                      <View style={styles.votersSectionHeader}>
                        <Text style={styles.detailSectionTitle}>Eleitores Vinculados</Text>
                        <Badge
                          label={`${getLeaderVoters(selectedLeader.id).length} eleitores`}
                          color={Colors.light.primary}
                        />
                      </View>

                      {getLeaderVoters(selectedLeader.id).length === 0 ? (
                        <View style={styles.noVotersContainer}>
                          <Users color={Colors.light.textSecondary} size={32} />
                          <Text style={styles.noVotersText}>
                            Nenhum eleitor vinculado a esta liderança
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.votersList}>
                          {getLeaderVoters(selectedLeader.id).map((voter, index) => (
                            <TouchableOpacity
                              key={voter.id}
                              style={[
                                styles.voterListItem,
                                index === getLeaderVoters(selectedLeader.id).length - 1 && { borderBottomWidth: 0 }
                              ]}
                              onPress={() => {
                                setSelectedVoter(voter);
                                setIsVoterDetailModalVisible(true);
                              }}
                            >
                              <View style={styles.voterListAvatar}>
                                <Text style={styles.voterListAvatarText}>
                                  {voter.name.charAt(0).toUpperCase()}
                                </Text>
                              </View>
                              <View style={styles.voterListInfo}>
                                <Text style={styles.voterListName} numberOfLines={1}>
                                  {voter.name}
                                </Text>
                                <View style={styles.voterListDetails}>
                                  {voter.phone && (
                                    <View style={styles.voterListDetailItem}>
                                      <Phone color={Colors.light.textSecondary} size={12} />
                                      <Text style={styles.voterListDetailText}>{voter.phone}</Text>
                                    </View>
                                  )}
                                  {voter.neighborhood && (
                                    <View style={styles.voterListDetailItem}>
                                      <MapPin color={Colors.light.textSecondary} size={12} />
                                      <Text style={styles.voterListDetailText}>{voter.neighborhood}</Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </ScrollView>

                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonPrimary, { flex: 1 }]}
                      onPress={() => {
                        setIsDetailModalVisible(false);
                        handleEdit(selectedLeader);
                      }}
                    >
                      <Edit2 color="#fff" size={18} />
                      <Text style={styles.modalButtonTextPrimary}>Editar Liderança</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Modal de Detalhes do Eleitor */}
        <Modal
          visible={isVoterDetailModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsVoterDetailModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {selectedVoter && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Detalhes do Eleitor</Text>
                    <TouchableOpacity onPress={() => setIsVoterDetailModalVisible(false)}>
                      <X color={Colors.light.text} size={24} />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalBody}>
                    <View style={styles.detailHeader}>
                      <View style={styles.voterDetailAvatar}>
                        <Text style={styles.voterDetailAvatarText}>
                          {selectedVoter.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.detailHeaderInfo}>
                        <Text style={styles.detailName}>{selectedVoter.name}</Text>
                        <Text style={styles.voterSubtitle}>
                          Liderança: {selectedVoter.leaderName || "Não vinculado"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Informações Pessoais</Text>
                      {selectedVoter.cpf && (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>CPF:</Text>
                          <Text style={styles.infoValue}>{selectedVoter.cpf}</Text>
                        </View>
                      )}
                      {selectedVoter.voterRegistration && (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Título de Eleitor:</Text>
                          <Text style={styles.infoValue}>{selectedVoter.voterRegistration}</Text>
                        </View>
                      )}
                      {selectedVoter.birthDate && (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Data de Nascimento:</Text>
                          <Text style={styles.infoValue}>
                            {new Date(selectedVoter.birthDate).toLocaleDateString("pt-BR")}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Contato</Text>
                      <View style={styles.detailItem}>
                        <Phone color={Colors.light.primary} size={20} />
                        <Text style={styles.detailItemText}>
                          {selectedVoter.phone || "Não informado"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Endereço</Text>
                      {(selectedVoter.street || selectedVoter.neighborhood || selectedVoter.city) ? (
                        <>
                          {selectedVoter.street && (
                            <View style={styles.infoRow}>
                              <Text style={styles.infoLabel}>Rua:</Text>
                              <Text style={styles.infoValue}>
                                {selectedVoter.street}{selectedVoter.number ? `, ${selectedVoter.number}` : ""}
                              </Text>
                            </View>
                          )}
                          {selectedVoter.complement && (
                            <View style={styles.infoRow}>
                              <Text style={styles.infoLabel}>Complemento:</Text>
                              <Text style={styles.infoValue}>{selectedVoter.complement}</Text>
                            </View>
                          )}
                          {selectedVoter.neighborhood && (
                            <View style={styles.infoRow}>
                              <Text style={styles.infoLabel}>Bairro:</Text>
                              <Text style={styles.infoValue}>{selectedVoter.neighborhood}</Text>
                            </View>
                          )}
                          {selectedVoter.cep && (
                            <View style={styles.infoRow}>
                              <Text style={styles.infoLabel}>CEP:</Text>
                              <Text style={styles.infoValue}>{selectedVoter.cep}</Text>
                            </View>
                          )}
                          {(selectedVoter.city || selectedVoter.state) && (
                            <View style={styles.infoRow}>
                              <Text style={styles.infoLabel}>Cidade/UF:</Text>
                              <Text style={styles.infoValue}>
                                {[selectedVoter.city, selectedVoter.state].filter(Boolean).join(" - ")}
                              </Text>
                            </View>
                          )}
                        </>
                      ) : (
                        <Text style={styles.noDataText}>Endereço não informado</Text>
                      )}
                    </View>

                    {selectedVoter.notes && (
                      <View style={styles.detailSection}>
                        <Text style={styles.detailSectionTitle}>Observações</Text>
                        <View style={styles.notesContainer}>
                          <Text style={styles.notesText}>{selectedVoter.notes}</Text>
                        </View>
                      </View>
                    )}

                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Informações do Sistema</Text>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Cadastrado em:</Text>
                        <Text style={styles.infoValue}>
                          {new Date(selectedVoter.createdAt).toLocaleDateString("pt-BR")}
                        </Text>
                      </View>
                      {selectedVoter.updatedAt && (
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Última atualização:</Text>
                          <Text style={styles.infoValue}>
                            {new Date(selectedVoter.updatedAt).toLocaleDateString("pt-BR")}
                          </Text>
                        </View>
                      )}
                    </View>
                  </ScrollView>

                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonSecondary]}
                      onPress={() => setIsVoterDetailModalVisible(false)}
                    >
                      <Text style={styles.modalButtonTextSecondary}>Fechar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonPrimary]}
                      onPress={() => {
                        setIsVoterDetailModalVisible(false);
                        setIsDetailModalVisible(false);
                        router.push(`/edit-voter?voterId=${selectedVoter.id}`);
                      }}
                    >
                      <Edit2 color="#fff" size={18} />
                      <Text style={styles.modalButtonTextPrimary}>Editar</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Alert Dialog Moderno */}
        {AlertDialogComponent}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  header: {
    flexDirection: "row" as const,
    padding: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.secondary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      },
    }),
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      },
    }),
  },
  filtersContainer: {
    backgroundColor: Colors.light.card,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "500" as const,
  },
  filterChipTextActive: {
    color: "#fff",
    fontWeight: "600" as const,
  },
  sortContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: 12,
    gap: 8,
  },
  sortLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: "500" as const,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  sortButtonActive: {
    backgroundColor: Colors.light.primary + "20",
  },
  sortButtonText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  sortButtonTextActive: {
    color: Colors.light.primary,
    fontWeight: "600" as const,
  },
  summaryContainer: {
    flexDirection: "row" as const,
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 12,
    alignItems: "center" as const,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      },
    }),
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  list: {
    padding: 16,
    paddingTop: 0,
  },
  leaderCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      },
    }),
  },
  leaderHeader: {
    flexDirection: "row" as const,
    marginBottom: 16,
  },
  leaderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },
  leaderInfo: {
    flex: 1,
    gap: 4,
  },
  detailRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  statsGrid: {
    flexDirection: "row" as const,
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
    alignItems: "center" as const,
  },
  statBoxValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  statBoxLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  progressHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: "500" as const,
  },
  leaderNameRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 4,
  },
  leaderName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  leaderDetails: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  leaderStats: {
    marginBottom: 16,
  },
  statItem: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    gap: 4,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 4,
    overflow: "hidden" as const,
    marginBottom: 4,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: "right" as const,
  },
  leaderActions: {
    flexDirection: "row" as const,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonEdit: {
    backgroundColor: Colors.light.primary + "15",
  },
  actionButtonToggle: {
    backgroundColor: Colors.light.backgroundSecondary,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end" as const,
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0 -4px 12px rgba(0,0,0,0.15)",
      },
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
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  modalBody: {
    padding: 20,
  },
  modalFooter: {
    flexDirection: "row" as const,
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  modalButton: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  modalButtonPrimary: {
    backgroundColor: Colors.light.primary,
  },
  modalButtonSecondary: {
    backgroundColor: Colors.light.backgroundSecondary,
  },
  modalButtonTextPrimary: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600" as const,
  },
  modalButtonTextSecondary: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: "600" as const,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  detailHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    marginBottom: 20,
  },
  detailAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.primary + "20",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 16,
  },
  detailHeaderInfo: {
    flex: 1,
    gap: 8,
  },
  detailName: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingVertical: 8,
  },
  detailItemText: {
    fontSize: 15,
    color: Colors.light.textSecondary,
  },
  performanceGrid: {
    flexDirection: "row" as const,
    gap: 12,
    marginBottom: 16,
  },
  performanceCard: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center" as const,
  },
  performanceValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 8,
  },
  performanceLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
    textAlign: "center" as const,
  },
  performanceBar: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
  },
  performanceBarHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    marginBottom: 8,
  },
  performanceBarLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  performanceBarValue: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.light.success,
  },
  achievementBanner: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    backgroundColor: Colors.light.warning + "15",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  achievementText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.warning,
  },
  infoRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  // Estilos para a lista de eleitores vinculados
  votersSectionHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  noVotersContainer: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 24,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
  },
  noVotersText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 12,
    textAlign: "center" as const,
  },
  votersList: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    maxHeight: 300,
  },
  voterListItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  voterListAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary + "20",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },
  voterListAvatarText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  voterListInfo: {
    flex: 1,
  },
  voterListName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  voterListDetails: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
  },
  voterListDetailItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
  },
  voterListDetailText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  // Estilos para o modal de detalhes do eleitor
  voterDetailAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.success + "20",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 16,
  },
  voterDetailAvatarText: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.success,
  },
  voterSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  noDataText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontStyle: "italic" as const,
  },
  notesContainer: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
  },
  notesText: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
});
