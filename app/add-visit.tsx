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
import { ArrowLeft, Save, Calendar } from "lucide-react-native";

export default function AddVisitScreen() {
  const { voterId, voterName } = useLocalSearchParams();
  const { addVisit, refreshData, voters } = useData();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Inicializar data no formato DD-MM-AAAA
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const [date, setDate] = useState(`${day}-${month}-${year}`);
  const [objective, setObjective] = useState("");
  const [result, setResult] = useState("");
  const [nextSteps, setNextSteps] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
    if (!objective.trim()) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'Por favor, descreva o objetivo da visita' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Buscar o eleitor para pegar o leaderId correto
      const voter = voters.find((v) => v.id === voterId);

      if (!voter) {
        showToast({ type: 'error', title: 'Erro', message: 'Eleitor não encontrado. Por favor, atualize os dados.' });
        setIsSubmitting(false);
        return;
      }

      if (!voter.leaderId) {
        showToast({ type: 'error', title: 'Erro', message: 'Este eleitor não possui uma liderança associada.' });
        setIsSubmitting(false);
        return;
      }

      // Converter data de DD-MM-AAAA para AAAA-MM-DD
      const [day, month, year] = date.split('-');
      const dateISO = `${year}-${month}-${day}`;

      await addVisit({
        voterId: voterId as string,
        voterName: voterName as string,
        leaderId: voter.leaderId,
        leaderName: voter.leaderName || "",
        date: dateISO,
        objective: objective.trim(),
        result: result.trim() || undefined,
        nextSteps: nextSteps.trim() || undefined,
        vereadorId: voter.vereadorId, // Herda o vereadorId do eleitor
      });

      showToast({ type: 'success', title: 'Sucesso', message: 'Visita registrada com sucesso!' });
      setTimeout(() => router.back(), 1500);
    } catch (error: any) {
      console.error("Error adding visit:", error);
      const errorMessage = error.message || "Não foi possível registrar a visita";
      showToast({ type: 'error', title: 'Erro', message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Registrar Visita",
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
              Data da Visita <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={styles.dateInput}
                value={date}
                onChangeText={setDate}
                placeholder="DD-MM-AAAA"
                placeholderTextColor={Colors.light.textSecondary}
              />
              <Calendar color={Colors.light.primary} size={20} />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>
              Objetivo da Visita <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={objective}
              onChangeText={setObjective}
              placeholder="Descreva o objetivo da visita..."
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Resultado/Observações</Text>
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
              placeholder="Defina os próximos passos (opcional)..."
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
              {isSubmitting ? "Salvando..." : "Registrar Visita"}
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
  dateInputContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 14,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
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
