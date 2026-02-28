import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  RefreshControl,
  Platform,
} from "react-native";
import { useToast } from "@/contexts/ToastContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Filter,
  X,
  AlertTriangle,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { usersService } from "@/services";
import { User, UserRole } from "@/types";
import Colors from "@/constants/colors";

export default function GerenciamentoUsuariosScreen() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estados para modal de confirmação
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState<{
    title: string;
    message: string;
    confirmText: string;
    confirmStyle: "default" | "destructive";
    onConfirm: () => void;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [])
  );

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, selectedRole, showOnlyActive]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      console.log('GerenciamentoUsuarios: Carregando usuários...');
      const data = await usersService.getAll();
      console.log(`GerenciamentoUsuarios: ${data.length} usuários carregados`);
      setUsers(data || []);
    } catch (error: any) {
      console.error('GerenciamentoUsuarios: Erro ao carregar usuários:', error);
      setUsers([]); // Definir array vazio em caso de erro
      // Não mostrar alert para não incomodar o usuário
      // Alert.alert("Erro", "Não foi possível carregar os usuários");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Filtrar por busca
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.cpf.includes(searchQuery)
      );
    }

    // Filtrar por role
    if (selectedRole !== "all") {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    // Filtrar por status ativo
    if (showOnlyActive) {
      filtered = filtered.filter((user) => user.active);
    }

    setFilteredUsers(filtered);
  };

  // Função helper para mostrar confirmação (funciona em web e mobile)
  const showConfirmation = (
    title: string,
    message: string,
    confirmText: string,
    confirmStyle: "default" | "destructive",
    onConfirm: () => void
  ) => {
    if (Platform.OS === "web") {
      // No web, usar modal customizado
      setConfirmModalData({ title, message, confirmText, confirmStyle, onConfirm });
      setShowConfirmModal(true);
    } else {
      // No mobile, usar Alert nativo
      Alert.alert(title, message, [
        { text: "Cancelar", style: "cancel" },
        { text: confirmText, style: confirmStyle, onPress: onConfirm },
      ]);
    }
  };

  // Função helper para mostrar mensagem de sucesso/erro
  const showMessage = (title: string, message: string, isError: boolean = false) => {
    showToast({ title, message, type: isError ? 'error' : 'success' });
  };

  const handleToggleActive = async (userId: string, currentStatus: boolean) => {
    console.log(`Tentando ${currentStatus ? 'desativar' : 'ativar'} usuário ${userId}`);

    const executeToggle = async () => {
      try {
        setIsProcessing(true);
        console.log(`Chamando toggleActive para usuário ${userId} com status ${!currentStatus}`);
        await usersService.toggleActive(userId, !currentStatus);
        console.log('Status atualizado com sucesso');
        await loadUsers();
        showMessage(
          "Sucesso",
          currentStatus
            ? "Usuário desativado com sucesso"
            : "Usuário ativado com sucesso",
          false
        );
      } catch (error: any) {
        console.error('Erro ao alterar status:', error);
        showMessage(
          "Erro",
          error.response?.data?.message || "Não foi possível atualizar o status",
          true
        );
      } finally {
        setIsProcessing(false);
      }
    };

    showConfirmation(
      currentStatus ? "Desativar Usuário" : "Ativar Usuário",
      currentStatus
        ? "Tem certeza que deseja desativar este usuário?"
        : "Tem certeza que deseja ativar este usuário?",
      "Confirmar",
      currentStatus ? "destructive" : "default",
      executeToggle
    );
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    console.log(`Tentando excluir usuário ${userId} (${userName})`);

    const executeDelete = async () => {
      try {
        setIsProcessing(true);
        console.log(`Chamando delete para usuário ${userId}`);
        await usersService.delete(userId);
        console.log('Usuário excluído com sucesso');
        await loadUsers();
        showMessage("Sucesso", `Usuário ${userName} foi excluído com sucesso`, false);
      } catch (error: any) {
        console.error('Erro ao excluir usuário:', error);
        showMessage(
          "Erro",
          error.response?.data?.message || "Não foi possível excluir o usuário",
          true
        );
      } finally {
        setIsProcessing(false);
      }
    };

    showConfirmation(
      "Excluir Usuário",
      `Tem certeza que deseja excluir o usuário ${userName}?\n\nEsta ação não pode ser desfeita.`,
      "Excluir",
      "destructive",
      executeDelete
    );
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "#dc2626";
      case "vereador":
        return "#2563eb";
      case "lideranca":
        return "#16a34a";
      case "assessor":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "vereador":
        return "Vereador";
      case "lideranca":
        return "Liderança";
      case "assessor":
        return "Assessor";
      default:
        return role;
    }
  };

  const renderUserCard = (user: User) => {
    const isCurrentUser = user.id === currentUser?.id;

    return (
      <View key={user.id} style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user.name} {isCurrentUser && "(Você)"}
            </Text>
            <Text style={styles.userEmail}>{user.email}</Text>
            <View style={styles.userDetails}>
              <Text style={styles.userDetailText}>CPF: {user.cpf}</Text>
              <Text style={styles.userDetailText}>Tel: {user.phone}</Text>
            </View>
          </View>
          <View style={styles.userBadges}>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: getRoleBadgeColor(user.role) },
              ]}
            >
              <Text style={styles.roleBadgeText}>
                {getRoleLabel(user.role)}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: user.active ? "#16a34a" : "#dc2626" },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {user.active ? "Ativo" : "Inativo"}
              </Text>
            </View>
          </View>
        </View>

        {/* Mostra o vereador vinculado para assessores e lideranças */}
        {(user.role === "assessor" || user.role === "lideranca") && user.vereadorName && (
          <View style={styles.vereadorInfo}>
            <Text style={styles.vereadorLabel}>Vinculado a:</Text>
            <Text style={styles.vereadorName}>{user.vereadorName}</Text>
          </View>
        )}

        {user.region && (
          <Text style={styles.userRegion}>Região: {user.region}</Text>
        )}

        <View style={styles.userActions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.editButton,
              isCurrentUser && styles.disabledButton
            ]}
            onPress={() =>
              router.push({
                pathname: "/editar-usuario",
                params: { userId: user.id },
              })
            }
            disabled={isCurrentUser || isProcessing}
          >
            <Edit2 size={18} color={isCurrentUser ? "#9ca3af" : "#fff"} />
            <Text
              style={[
                styles.actionButtonText,
                styles.editButtonText,
                isCurrentUser && styles.disabledText,
              ]}
            >
              Editar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              user.active ? styles.deactivateButton : styles.activateButton,
              isCurrentUser && styles.disabledButton
            ]}
            onPress={() => handleToggleActive(user.id, user.active)}
            disabled={isCurrentUser || isProcessing}
          >
            {user.active ? (
              <UserX size={18} color={isCurrentUser ? "#9ca3af" : "#fff"} />
            ) : (
              <UserCheck
                size={18}
                color={isCurrentUser ? "#9ca3af" : "#fff"}
              />
            )}
            <Text
              style={[
                styles.actionButtonText,
                user.active ? styles.deactivateButtonText : styles.activateButtonText,
                isCurrentUser && styles.disabledText,
              ]}
            >
              {user.active ? "Desativar" : "Ativar"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.deleteButton,
              isCurrentUser && styles.disabledButton
            ]}
            onPress={() => handleDeleteUser(user.id, user.name)}
            disabled={isCurrentUser || isProcessing}
          >
            <Trash2 size={18} color={isCurrentUser ? "#9ca3af" : "#fff"} />
            <Text
              style={[
                styles.actionButtonText,
                styles.deleteButtonText,
                isCurrentUser && styles.disabledText,
              ]}
            >
              Excluir
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const FilterModal = () => (
    <Modal
      visible={showFilterModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilterModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtros</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Perfil</Text>
            <View style={styles.filterOptions}>
              {/* Admin vê todos os filtros, vereador/assessor só veem assessor e liderança */}
              {(currentUser?.role === "admin"
                ? ["all", "admin", "vereador", "assessor", "lideranca"]
                : ["all", "assessor", "lideranca"]
              ).map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.filterOption,
                    selectedRole === role && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedRole(role as UserRole | "all")}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedRole === role && styles.filterOptionTextActive,
                    ]}
                  >
                    {role === "all" ? "Todos" : getRoleLabel(role as UserRole)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>Status</Text>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setShowOnlyActive(!showOnlyActive)}
            >
              <View
                style={[
                  styles.checkbox,
                  showOnlyActive && styles.checkboxChecked,
                ]}
              >
                {showOnlyActive && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                Mostrar apenas usuários ativos
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setShowFilterModal(false)}
          >
            <Text style={styles.applyButtonText}>Aplicar Filtros</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Modal de confirmação customizado (para funcionar no web)
  const ConfirmModal = () => (
    <Modal
      visible={showConfirmModal}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowConfirmModal(false)}
    >
      <View style={styles.confirmModalOverlay}>
        <View style={styles.confirmModalContent}>
          <View style={styles.confirmModalIcon}>
            <AlertTriangle size={40} color={confirmModalData?.confirmStyle === "destructive" ? "#dc2626" : Colors.light.primary} />
          </View>
          <Text style={styles.confirmModalTitle}>{confirmModalData?.title}</Text>
          <Text style={styles.confirmModalMessage}>{confirmModalData?.message}</Text>
          <View style={styles.confirmModalButtons}>
            <TouchableOpacity
              style={[styles.confirmModalButton, styles.confirmModalCancelButton]}
              onPress={() => {
                setShowConfirmModal(false);
                setConfirmModalData(null);
              }}
            >
              <Text style={styles.confirmModalCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.confirmModalButton,
                confirmModalData?.confirmStyle === "destructive"
                  ? styles.confirmModalDestructiveButton
                  : styles.confirmModalConfirmButton,
              ]}
              onPress={() => {
                setShowConfirmModal(false);
                confirmModalData?.onConfirm();
                setConfirmModalData(null);
              }}
            >
              <Text style={styles.confirmModalConfirmText}>
                {confirmModalData?.confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Carregando usuários...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingContent}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.processingText}>Processando...</Text>
          </View>
        </View>
      )}

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#6b7280" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome, email ou CPF..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={20} color="#6b7280" />
            {(selectedRole !== "all" || showOnlyActive) && (
              <View style={styles.filterIndicator} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push("/adicionar-usuario")}
          >
            <Plus size={20} color="#fff" />
            <Text style={styles.addButtonText}>Novo Usuário</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              loadUsers();
            }}
          />
        }
      >
        <View style={styles.stats}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{users.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {users.filter((u) => u.active).length}
            </Text>
            <Text style={styles.statLabel}>Ativos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {currentUser?.role === "admin"
                ? users.filter((u) => u.role === "admin").length
                : users.filter((u) => u.role === "assessor").length}
            </Text>
            <Text style={styles.statLabel}>
              {currentUser?.role === "admin" ? "Admins" : "Assessores"}
            </Text>
          </View>
        </View>

        {filteredUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Nenhum usuário encontrado
            </Text>
          </View>
        ) : (
          <View style={styles.usersList}>
            {filteredUsers.map((user) => renderUserCard(user))}
          </View>
        )}
      </ScrollView>

      <FilterModal />
      <ConfirmModal />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6b7280",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1f2937",
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterButton: {
    position: "relative",
    padding: 10,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
  },
  filterIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2563eb",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  statCard: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.primary,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  usersList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  userDetails: {
    flexDirection: "row",
    gap: 15,
  },
  userDetailText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  userBadges: {
    alignItems: "flex-end",
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  userRegion: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  vereadorInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  vereadorLabel: {
    fontSize: 13,
    color: "#6b7280",
    marginRight: 6,
  },
  vereadorName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },
  userActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 4,
  },
  editButton: {
    backgroundColor: "#2563eb",
  },
  activateButton: {
    backgroundColor: "#16a34a",
  },
  deactivateButton: {
    backgroundColor: "#f59e0b",
  },
  deleteButton: {
    backgroundColor: "#dc2626",
  },
  disabledButton: {
    backgroundColor: "#e5e7eb",
  },
  actionButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
  },
  editButtonText: {
    color: "#fff",
  },
  activateButtonText: {
    color: "#fff",
  },
  deactivateButtonText: {
    color: "#fff",
  },
  deleteButtonText: {
    color: "#fff",
  },
  disabledText: {
    color: "#9ca3af",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6b7280",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  filterOptionActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: "#6b7280",
  },
  filterOptionTextActive: {
    color: "#fff",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  checkmark: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 16,
    color: "#1f2937",
  },
  applyButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  processingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  processingContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  processingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  // Estilos do modal de confirmação
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  confirmModalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  confirmModalIcon: {
    marginBottom: 16,
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  confirmModalMessage: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  confirmModalButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  confirmModalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmModalCancelButton: {
    backgroundColor: "#f3f4f6",
  },
  confirmModalConfirmButton: {
    backgroundColor: Colors.light.primary,
  },
  confirmModalDestructiveButton: {
    backgroundColor: "#dc2626",
  },
  confirmModalCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  confirmModalConfirmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
