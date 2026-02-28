import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { useAlertDialog } from "@/components/Advanced";
import { Button } from "@/components/UI";
import Colors from "@/constants/colors";
import { AmendmentStatus } from "@/types";
import { Trash2 } from "lucide-react-native";

const statusOptions: { value: AmendmentStatus; label: string }[] = [
  { value: "aprovada", label: "Aprovada" },
  { value: "em_execucao", label: "Em Execução" },
  { value: "executada", label: "Executada" },
  { value: "cancelada", label: "Cancelada" },
];

export default function EditAmendmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string;
  const { updateAmendment, deleteAmendment, amendments } = useData();
  const { showToast } = useToast();
  const { showAlert, AlertDialogComponent } = useAlertDialog();

  const [code, setCode] = useState("");
  const [value, setValue] = useState("");
  const [destination, setDestination] = useState("");
  const [objective, setObjective] = useState("");
  const [status, setStatus] = useState<AmendmentStatus>("aprovada");
  const [executionPercentage, setExecutionPercentage] = useState("0");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const amendment = amendments.find(a => a.id === id);
      if (amendment) {
        setCode(amendment.code);
        setValue(amendment.value.toString());
        setDestination(amendment.destination);
        setObjective(amendment.objective);
        setStatus(amendment.status);
        setExecutionPercentage(amendment.executionPercentage.toString());
      } else {
        showToast({ type: 'error', title: 'Erro', message: 'Emenda não encontrada' });
        router.back();
      }
    }
  }, [id, amendments]);

  const handleDelete = () => {
    showAlert({
      title: "Excluir Emenda",
      description: "Tem certeza que deseja excluir esta emenda? Esta ação não pode ser desfeita.",
      variant: "danger",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          setIsLoading(true);
          await deleteAmendment(id);
          showToast({ type: 'success', title: 'Sucesso', message: 'Emenda excluída com sucesso!' });
          setTimeout(() => router.back(), 1500);
        } catch (error) {
          console.error("Error deleting amendment:", error);
          showToast({ type: 'error', title: 'Erro', message: 'Não foi possível excluir a emenda' });
          setIsLoading(false);
        }
      },
    });
  };

  const handleSubmit = async () => {
    if (!code.trim() || !value.trim() || !destination.trim() || !objective.trim()) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'Preencha todos os campos obrigatórios' });
      return;
    }

    const numericValue = parseFloat(value.replace(/[^\d.,]/g, "").replace(",", "."));
    if (isNaN(numericValue) || numericValue <= 0) {
      showToast({ type: 'error', title: 'Erro', message: 'Valor inválido' });
      return;
    }

    const percentage = parseInt(executionPercentage, 10);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      showToast({ type: 'error', title: 'Erro', message: 'Percentual de execução deve estar entre 0 e 100' });
      return;
    }

    setIsLoading(true);
    try {
      await updateAmendment(id, {
        code: code.trim(),
        value: numericValue,
        destination: destination.trim(),
        objective: objective.trim(),
        status,
        executionPercentage: percentage,
      });

      showToast({ type: 'success', title: 'Sucesso', message: 'Emenda atualizada com sucesso!' });
      setTimeout(() => router.back(), 1500);
    } catch (error) {
      console.error("Error updating amendment:", error);
      showToast({ type: 'error', title: 'Erro', message: 'Não foi possível atualizar a emenda' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Editar Emenda",
          headerStyle: {
            backgroundColor: Colors.light.primary,
          },
          headerTintColor: "#fff",
          headerRight: () => (
            <TouchableOpacity onPress={handleDelete} style={{ marginRight: 16 }}>
              <Trash2 color="#fff" size={24} />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Código/Número <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              placeholder="Ex: EM 001/2025"
              placeholderTextColor={Colors.light.textSecondary}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Valor (R$) <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              placeholder="Ex: 150000.00"
              placeholderTextColor={Colors.light.textSecondary}
              keyboardType="decimal-pad"
            />
            <Text style={styles.hint}>Use ponto ou vírgula para decimais</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Destino/Beneficiário <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={destination}
              onChangeText={setDestination}
              placeholder="Ex: Secretaria de Saúde"
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Objetivo <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={objective}
              onChangeText={setObjective}
              placeholder="Descreva o objetivo da emenda"
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Status <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.statusGrid}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusOption,
                    status === option.value && styles.statusOptionActive,
                  ]}
                  onPress={() => setStatus(option.value)}
                >
                  <Text
                    style={[
                      styles.statusOptionText,
                      status === option.value && styles.statusOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Percentual de Execução <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={executionPercentage}
              onChangeText={setExecutionPercentage}
              placeholder="0 a 100"
              placeholderTextColor={Colors.light.textSecondary}
              keyboardType="number-pad"
            />
            <Text style={styles.hint}>Valor entre 0 e 100</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Cancelar"
              onPress={() => router.back()}
              variant="outline"
              style={styles.button}
            />
            <Button
              title="Salvar Alterações"
              onPress={handleSubmit}
              variant="primary"
              style={styles.button}
              disabled={isLoading}
            />
          </View>
        </View>
      </ScrollView>

      {/* Alert Dialog Moderno */}
      {AlertDialogComponent}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  content: {
    padding: 16,
  },
  form: {
    gap: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
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
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    minHeight: 48,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top" as const,
  },
  hint: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  statusGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.card,
  },
  statusOptionActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  statusOptionTextActive: {
    color: "#fff",
  },
  buttonContainer: {
    flexDirection: "row" as const,
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
});

