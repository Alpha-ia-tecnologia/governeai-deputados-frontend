import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  Modal,
  ScrollView,
} from "react-native";
import { Plus, User, Users, ChevronDown, X, Check } from "lucide-react-native";
import { router } from "expo-router";
import { useData, useFilteredVoters } from "@/contexts/DataContext";
import { SearchBar, EmptyState } from "@/components/UI";
import Colors from "@/constants/colors";
import { Voter, Leader } from "@/types";

export default function VotersScreen() {
  const { leaders } = useData();
  const [search, setSearch] = useState("");
  const [selectedLeader, setSelectedLeader] = useState<string>();
  const [showLeaderModal, setShowLeaderModal] = useState(false);

  const filteredVoters = useFilteredVoters(search, selectedLeader);

  const selectedLeaderData = leaders.find((l) => l.id === selectedLeader);
  const filterLabel = selectedLeaderData
    ? `${selectedLeaderData.name} (${selectedLeaderData.votersCount})`
    : `Todas as Lideranças (${filteredVoters.length})`;

  const handleSelectLeader = (leaderId?: string) => {
    setSelectedLeader(leaderId);
    setShowLeaderModal(false);
  };

  const renderVoterCard = ({ item }: { item: Voter }) => {
    return (
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
          <Text style={styles.voterLeader}>Liderança: {item.leaderName}</Text>
        </View>
        <View style={styles.voterBadge}>
          <Text style={styles.voterBadgeText}>{item.votesCount}</Text>
          <Text style={styles.voterBadgeLabel}>votos</Text>
        </View>
      </TouchableOpacity>
    );
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.topActions}>
        <TouchableOpacity
          style={styles.manageLeadersButton}
          onPress={() => router.push("/manage-leaders")}
        >
          <Users color={Colors.light.primary} size={20} />
          <Text style={styles.manageLeadersText}>Gerenciar Lideranças</Text>
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

      {/* Dropdown Filter */}
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
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={() => setSelectedLeader(undefined)}
          >
            <X color={Colors.light.textSecondary} size={18} />
          </TouchableOpacity>
        )}
      </View>

      {filteredVoters.length === 0 ? (
        <EmptyState
          icon={<User color={Colors.light.textSecondary} size={64} />}
          title="Nenhum eleitor encontrado"
          description={
            search
              ? "Tente ajustar os filtros ou busca"
              : "Comece adicionando o primeiro eleitor"
          }
          action={{
            label: "Adicionar Eleitor",
            onPress: () => router.push("/add-voter"),
          }}
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
              <Text style={styles.modalTitle}>Filtrar por Liderança</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowLeaderModal(false)}
              >
                <X color={Colors.light.text} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalList}>
              {/* Option for All Leaders */}
              <TouchableOpacity
                style={[styles.leaderItem, !selectedLeader && styles.leaderItemSelected]}
                onPress={() => handleSelectLeader(undefined)}
              >
                <View style={styles.leaderItemContent}>
                  <Users
                    color={!selectedLeader ? Colors.light.primary : Colors.light.textSecondary}
                    size={20}
                  />
                  <View style={styles.leaderItemInfo}>
                    <Text
                      style={[
                        styles.leaderItemName,
                        !selectedLeader && styles.leaderItemNameSelected,
                      ]}
                    >
                      Todas as Lideranças
                    </Text>
                    <Text style={styles.leaderItemCount}>
                      Mostrar todos os eleitores
                    </Text>
                  </View>
                </View>
                {!selectedLeader && <Check color={Colors.light.primary} size={20} />}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Leaders List */}
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
  voterAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },
  voterInfo: {
    flex: 1,
  },
  voterName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  voterDetails: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  voterLeader: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  voterBadge: {
    alignItems: "center" as const,
  },
  voterBadgeText: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  voterBadgeLabel: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  // Modal Styles
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
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
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
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalList: {
    padding: 16,
  },
  leaderItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  leaderItemSelected: {
    backgroundColor: `${Colors.light.primary}15`,
  },
  leaderItemContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    flex: 1,
    gap: 12,
  },
  leaderItemInfo: {
    flex: 1,
  },
  leaderItemName: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  leaderItemNameSelected: {
    color: Colors.light.primary,
    fontWeight: "600" as const,
  },
  leaderItemCount: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: 8,
  },
});
