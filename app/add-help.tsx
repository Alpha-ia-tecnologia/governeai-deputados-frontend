import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  FlatList,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import Colors from "@/constants/colors";
import { HelpCategory, HelpStatus } from "@/types";
import { CategoryLabels, StatusLabels } from "@/constants/labels";
import { DEFAULT_ATENDIMENTO_TYPES } from "@/constants/atendimento-types";
import { ArrowLeft, Save, Search, Plus, X, ChevronDown, Calendar } from "lucide-react-native";

export default function AddHelpScreen() {
  const { voterId, voterName } = useLocalSearchParams();
  const { addHelpRecord, refreshData, voters, leaders } = useData();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [category, setCategory] = useState<HelpCategory>("outros");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<HelpStatus>("pending");
  const [notes, setNotes] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Formatar data DD/MM/AAAA
  const formatDateInput = (text: string) => {
    const cleaned = text.replace(/\D/g, "");
    let formatted = cleaned;
    if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    if (cleaned.length > 4) formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4) + "/" + cleaned.slice(4, 8);
    setServiceDate(formatted);
  };

  // Converter DD/MM/AAAA para YYYY-MM-DD
  const parseDateToISO = (dateStr: string): string | undefined => {
    if (!dateStr || dateStr.length !== 10) return undefined;
    const [day, month, year] = dateStr.split("/");
    if (!day || !month || !year) return undefined;
    return `${year}-${month}-${day}`;
  };

  // Estado do dropdown pesquisável de atendimento
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customTypes, setCustomTypes] = useState<string[]>([]);

  // Combinar tipos pré-definidos com tipos customizados
  const allTypes = useMemo(() => {
    const combined = [...DEFAULT_ATENDIMENTO_TYPES, ...customTypes];
    return [...new Set(combined)]; // Remove duplicados
  }, [customTypes]);

  // Filtrar tipos baseado na busca
  const filteredTypes = useMemo(() => {
    if (!searchQuery.trim()) return allTypes;
    return allTypes.filter((type) =>
      type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allTypes, searchQuery]);

  // Verificar se o texto digitado existe nos tipos
  const canCreateNew = useMemo(() => {
    if (!searchQuery.trim()) return false;
    return !allTypes.some(
      (type) => type.toLowerCase() === searchQuery.trim().toLowerCase()
    );
  }, [allTypes, searchQuery]);

  const handleSelectType = (type: string) => {
    setDescription(type);
    setSearchQuery("");
    setIsDropdownOpen(false);
  };

  const handleCreateNewType = () => {
    const newType = searchQuery.trim();
    if (newType) {
      setCustomTypes((prev) => [...prev, newType]);
      setDescription(newType);
      setSearchQuery("");
      setIsDropdownOpen(false);
    }
  };

  const handleClearSelection = () => {
    setDescription("");
    setSearchQuery("");
  };

  // Função de navegação segura para voltar
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/voters');
    }
  };

  const categories: HelpCategory[] = [
    "saude",
    "educacao",
    "assistencia_social",
    "infraestrutura",
    "emprego",
    "documentacao",
    "outros",
  ];

  const statuses: HelpStatus[] = ["pending", "in_progress", "completed"];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      showToast({ type: 'success', title: 'Sucesso', message: 'Dados atualizados com sucesso!' });
    } catch (error: any) {
      console.error("Error refreshing data:", error);
      showToast({ type: 'error', title: 'Erro', message: 'Não foi possível atualizar os dados' });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSubmit = async () => {
    // Buscar o eleitor para pegar a Articulador Político associada
    const voter = voters.find((v) => v.id === voterId);

    if (!voter) {
      showToast({ type: 'error', title: 'Erro', message: 'Eleitor não encontrado. Atualize a lista.' });
      return;
    }

    if (!voter.leaderId) {
      showToast({ type: 'error', title: 'Erro', message: 'Este eleitor não possui uma Articulador Político associada.' });
      return;
    }

    if (!description.trim()) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'Por favor, selecione o tipo de atendimento' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Buscar a Articulador Político para obter o vereadorId
      const leader = leaders.find((l) => l.id === voter.leaderId);
      const vereadorId = voter.vereadorId || leader?.vereadorId;

      if (!vereadorId) {
        showToast({ type: 'error', title: 'Erro', message: 'Não foi possível identificar o vereador responsável.' });
        setIsSubmitting(false);
        return;
      }

      await addHelpRecord({
        voterId: voterId as string,
        voterName: voterName as string,
        leaderId: voter.leaderId,
        leaderName: voter.leaderName || "",
        category,
        description: description.trim(),
        serviceDate: parseDateToISO(serviceDate),
        status,
        responsibleId: user?.id || "",
        responsibleName: user?.name || "",
        notes: notes.trim() || undefined,
        vereadorId: vereadorId, // Herda o vereadorId do eleitor ou da Articulador Político
      });

      showToast({ type: 'success', title: 'Sucesso', message: 'Atendimento registrado com sucesso!' });
      setTimeout(() => handleGoBack(), 1500);
    } catch (error: any) {
      console.error("Error adding help record:", error);
      const errorMessage = error.message || "Não foi possível registrar o atendimento";
      showToast({ type: 'error', title: 'Erro', message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Registrar Atendimento",
          headerStyle: {
            backgroundColor: Colors.light.primary,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "600" as const,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={handleGoBack}>
              <ArrowLeft color="#fff" size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Botão Voltar */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <ArrowLeft color={Colors.light.primary} size={20} />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>

        <View style={styles.form}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Eleitor:</Text>
            <Text style={styles.infoValue}>{voterName}</Text>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Articulador Político Responsável:</Text>
            <Text style={styles.infoValue}>
              {(() => {
                const voter = voters.find((v) => v.id === voterId);
                return voter?.leaderName || "Não definida";
              })()}
            </Text>
          </View>

          {/* Data do Atendimento */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Data do Atendimento
            </Text>
            <View style={styles.dateInputContainer}>
              <Calendar color={Colors.light.textSecondary} size={18} />
              <TextInput
                style={styles.dateInput}
                value={serviceDate}
                onChangeText={formatDateInput}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
          </View>

          {/* Tipo de Atendimento - Dropdown Pesquisável */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Tipo de Atendimento <Text style={styles.required}>*</Text>
            </Text>

            {description ? (
              // Valor selecionado
              <View style={styles.selectedContainer}>
                <Text style={styles.selectedText}>{description}</Text>
                <TouchableOpacity
                  onPress={handleClearSelection}
                  style={styles.clearButton}
                >
                  <X color={Colors.light.textSecondary} size={18} />
                </TouchableOpacity>
              </View>
            ) : (
              // Campo de busca + dropdown
              <View style={styles.dropdownContainer}>
                <TouchableOpacity
                  style={styles.searchInputContainer}
                  onPress={() => setIsDropdownOpen(true)}
                  activeOpacity={0.8}
                >
                  <Search color={Colors.light.textSecondary} size={18} />
                  <TextInput
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={(text) => {
                      setSearchQuery(text);
                      if (!isDropdownOpen) setIsDropdownOpen(true);
                    }}
                    placeholder="Pesquisar tipo de atendimento..."
                    placeholderTextColor={Colors.light.textSecondary}
                    onFocus={() => setIsDropdownOpen(true)}
                  />
                  <ChevronDown
                    color={Colors.light.textSecondary}
                    size={18}
                    style={{ transform: [{ rotate: isDropdownOpen ? "180deg" : "0deg" }] }}
                  />
                </TouchableOpacity>

                {isDropdownOpen && (
                  <View style={styles.dropdownList}>
                    <ScrollView
                      style={styles.dropdownScroll}
                      nestedScrollEnabled
                      keyboardShouldPersistTaps="handled"
                    >
                      {filteredTypes.map((type, index) => (
                        <TouchableOpacity
                          key={`type-${index}`}
                          style={styles.dropdownItem}
                          onPress={() => handleSelectType(type)}
                        >
                          <Text style={styles.dropdownItemText}>{type}</Text>
                        </TouchableOpacity>
                      ))}

                      {filteredTypes.length === 0 && !canCreateNew && (
                        <View style={styles.dropdownEmpty}>
                          <Text style={styles.dropdownEmptyText}>
                            Nenhum tipo encontrado
                          </Text>
                        </View>
                      )}

                      {canCreateNew && (
                        <TouchableOpacity
                          style={styles.createNewButton}
                          onPress={handleCreateNewType}
                        >
                          <Plus color={Colors.light.primary} size={18} />
                          <Text style={styles.createNewButtonText}>
                            Cadastrar "{searchQuery.trim()}"
                          </Text>
                        </TouchableOpacity>
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Categoria <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.chipContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.chip,
                    category === cat && styles.chipSelected,
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      category === cat && styles.chipTextSelected,
                    ]}
                  >
                    {CategoryLabels[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Status <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.chipContainer}>
              {statuses.map((stat) => (
                <TouchableOpacity
                  key={stat}
                  style={[
                    styles.chip,
                    status === stat && styles.chipSelected,
                  ]}
                  onPress={() => setStatus(stat)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      status === stat && styles.chipTextSelected,
                    ]}
                  >
                    {StatusLabels[stat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Observações adicionais (opcional)..."
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Save color="#fff" size={20} />
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Salvando..." : "Registrar Atendimento"}
            </Text>
          </TouchableOpacity>
        </View>
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
  form: {
    padding: 16,
    gap: 20,
  },
  infoCard: {
    backgroundColor: Colors.light.card,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.primary,
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
  infoLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  required: {
    color: Colors.light.error,
  },
  input: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.light.text,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  // Dropdown pesquisável
  dropdownContainer: {
    position: "relative" as const,
    zIndex: 10,
  },
  searchInputContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 0,
  },
  dropdownList: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    marginTop: 4,
    overflow: "hidden" as const,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      },
    }),
  },
  dropdownScroll: {
    maxHeight: 240,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border + "40",
  },
  dropdownItemText: {
    fontSize: 15,
    color: Colors.light.text,
  },
  dropdownEmpty: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: "center" as const,
  },
  dropdownEmptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontStyle: "italic" as const,
  },
  createNewButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: Colors.light.primary + "10",
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  createNewButtonText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  selectedContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.primary + "15",
    borderWidth: 1,
    borderColor: Colors.light.primary + "40",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  selectedText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  clearButton: {
    padding: 4,
  },
  chipContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  // Data do atendimento
  dateInputContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 0,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  chipTextSelected: {
    color: "#fff",
    fontWeight: "600" as const,
  },
  submitButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
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
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  warningContainer: {
    backgroundColor: "#FFF3CD",
    borderWidth: 1,
    borderColor: "#FFC107",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  warningText: {
    fontSize: 14,
    color: "#856404",
    textAlign: "center" as const,
  },
  refreshButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center" as const,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: "#fff",
  },
});
