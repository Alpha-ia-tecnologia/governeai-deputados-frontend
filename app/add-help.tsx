import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import Colors from "@/constants/colors";
import { HelpCategory, HelpStatus } from "@/types";
import { CategoryLabels, StatusLabels } from "@/constants/labels";
import { ArrowLeft, Save } from "lucide-react-native";

export default function AddHelpScreen() {
  const { voterId, voterName } = useLocalSearchParams();
  const { addHelpRecord, refreshData, voters, leaders } = useData();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [category, setCategory] = useState<HelpCategory>("outros");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<HelpStatus>("pending");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    // Buscar o eleitor para pegar a liderança associada
    const voter = voters.find((v) => v.id === voterId);

    if (!voter) {
      showToast({ type: 'error', title: 'Erro', message: 'Eleitor não encontrado. Atualize a lista.' });
      return;
    }

    if (!voter.leaderId) {
      showToast({ type: 'error', title: 'Erro', message: 'Este eleitor não possui uma liderança associada.' });
      return;
    }

    if (!description.trim()) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'Por favor, descreva a ajuda prestada' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Buscar a liderança para obter o vereadorId
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
        status,
        responsibleId: user?.id || "",
        responsibleName: user?.name || "",
        notes: notes.trim() || undefined,
        vereadorId: vereadorId, // Herda o vereadorId do eleitor ou da liderança
      });

      showToast({ type: 'success', title: 'Sucesso', message: 'Ajuda registrada com sucesso!' });
      setTimeout(() => handleGoBack(), 1500);
    } catch (error: any) {
      console.error("Error adding help record:", error);
      const errorMessage = error.message || "Não foi possível registrar a ajuda";
      showToast({ type: 'error', title: 'Erro', message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Registrar Ajuda",
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

          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Liderança Responsável:</Text>
            <Text style={styles.infoValue}>
              {(() => {
                const voter = voters.find((v) => v.id === voterId);
                return voter?.leaderName || "Não definida";
              })()}
            </Text>
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
              {isSubmitting ? "Salvando..." : "Registrar Ajuda"}
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
