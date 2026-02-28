import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import Colors from "@/constants/colors";
import { HelpCategory, HelpStatus } from "@/types";
import { CategoryLabels, StatusLabels } from "@/constants/labels";
import { ArrowLeft, Save } from "lucide-react-native";

export default function EditHelpScreen() {
  const { helpId } = useLocalSearchParams();
  const { helpRecords, updateHelpRecord, leaders } = useData();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState<HelpCategory>("outros");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<HelpStatus>("pending");
  const [notes, setNotes] = useState("");
  const [selectedLeaderId, setSelectedLeaderId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voterName, setVoterName] = useState("");
  const [isLayoutMounted, setIsLayoutMounted] = useState(false);

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

  useEffect(() => {
    // Marcar layout como montado
    setIsLayoutMounted(true);
  }, []);

  useEffect(() => {
    if (helpId) {
      const helpRecord = helpRecords.find((h) => h.id === helpId);
      if (helpRecord) {
        setCategory(helpRecord.category);
        setDescription(helpRecord.description);
        setStatus(helpRecord.status);
        setNotes(helpRecord.notes || "");
        setSelectedLeaderId(helpRecord.leaderId);
        setVoterName(helpRecord.voterName);
        setIsLoading(false);
      } else if (isLayoutMounted) {
        showToast({ type: 'error', title: 'Erro', message: 'Registro de ajuda não encontrado' });
        handleGoBack();
      }
    }
  }, [helpId, helpRecords, isLayoutMounted]);

  const handleSubmit = async () => {
    if (!selectedLeaderId) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'Por favor, selecione uma liderança' });
      return;
    }

    if (!description.trim()) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'Por favor, descreva a ajuda prestada' });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedLeader = leaders.find((l) => l.id === selectedLeaderId);

      await updateHelpRecord(helpId as string, {
        leaderId: selectedLeaderId,
        leaderName: selectedLeader?.name || "",
        category,
        description: description.trim(),
        status,
        notes: notes.trim() || undefined,
        vereadorId: selectedLeader?.vereadorId, // Atualiza o vereadorId baseado na liderança
      });

      showToast({ type: 'success', title: 'Sucesso', message: 'Ajuda atualizada com sucesso!' });
      setTimeout(() => handleGoBack(), 1500);
    } catch (error: any) {
      console.error("Error updating help record:", error);
      showToast({ type: 'error', title: 'Erro', message: error.message || 'Não foi possível atualizar a ajuda' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Editar Ajuda",
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
      <ScrollView style={styles.container}>
        <View style={styles.form}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Eleitor:</Text>
            <Text style={styles.infoValue}>{voterName}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Liderança Responsável <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.chipContainer}>
              {leaders.map((leader) => (
                <TouchableOpacity
                  key={leader.id}
                  style={[
                    styles.chip,
                    selectedLeaderId === leader.id && styles.chipSelected,
                  ]}
                  onPress={() => setSelectedLeaderId(leader.id)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedLeaderId === leader.id && styles.chipTextSelected,
                    ]}
                  >
                    {leader.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
              Descrição <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descreva a ajuda prestada..."
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
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
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.light.backgroundSecondary,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.light.textSecondary,
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
  chipContainer: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
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
});
