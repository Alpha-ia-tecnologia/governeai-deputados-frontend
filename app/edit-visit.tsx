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
import { useToast } from "@/contexts/ToastContext";
import Colors from "@/constants/colors";
import { ArrowLeft, Save, Calendar } from "lucide-react-native";
import DateTimeInput from "@/components/DateTimeInput";

export default function EditVisitScreen() {
  const { visitId } = useLocalSearchParams();
  const { visits, updateVisit, leaders } = useData();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [date, setDate] = useState(new Date());
  const [objective, setObjective] = useState("");
  const [result, setResult] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [selectedLeaderId, setSelectedLeaderId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voterName, setVoterName] = useState("");

  useEffect(() => {
    if (visitId) {
      const visit = visits.find((v) => v.id === visitId);
      if (visit) {
        setDate(new Date(visit.date));
        setObjective(visit.objective);
        setResult(visit.result || "");
        setNextSteps(visit.nextSteps || "");
        setSelectedLeaderId(visit.leaderId);
        setVoterName(visit.voterName);
        setIsLoading(false);
      } else {
        showToast({ type: 'error', title: 'Erro', message: 'Registro de visita não encontrado' });
        router.back();
      }
    }
  }, [visitId, visits]);

  const handleSubmit = async () => {
    if (!selectedLeaderId) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'Por favor, selecione uma liderança' });
      return;
    }

    if (!objective.trim()) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'Por favor, informe o objetivo da visita' });
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedLeader = leaders.find((l) => l.id === selectedLeaderId);

      await updateVisit(visitId as string, {
        leaderId: selectedLeaderId,
        leaderName: selectedLeader?.name || "",
        date: date.toISOString().split("T")[0],
        objective: objective.trim(),
        result: result.trim() || undefined,
        nextSteps: nextSteps.trim() || undefined,
        vereadorId: selectedLeader?.vereadorId, // Atualiza o vereadorId baseado na liderança
      });

      showToast({ type: 'success', title: 'Sucesso', message: 'Visita atualizada com sucesso!' });
      setTimeout(() => router.back(), 1500);
    } catch (error: any) {
      console.error("Error updating visit:", error);
      showToast({ type: 'error', title: 'Erro', message: error.message || 'Não foi possível atualizar a visita' });
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
          title: "Editar Visita",
          headerStyle: {
            backgroundColor: Colors.light.secondary,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "600" as const,
          },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
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
              Data da Visita <Text style={styles.required}>*</Text>
            </Text>
            <DateTimeInput
              value={date}
              onChange={setDate}
              mode="date"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Objetivo <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={objective}
              onChangeText={setObjective}
              placeholder="Qual o objetivo da visita?"
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Resultado</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={result}
              onChangeText={setResult}
              placeholder="Descreva o resultado da visita (opcional)..."
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Próximos Passos</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={nextSteps}
              onChangeText={setNextSteps}
              placeholder="Quais os próximos passos? (opcional)..."
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
    borderLeftColor: Colors.light.secondary,
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
    backgroundColor: Colors.light.secondary,
    borderColor: Colors.light.secondary,
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
    backgroundColor: Colors.light.secondary,
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
