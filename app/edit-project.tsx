import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  Modal,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { Button } from "@/components/UI";
import Colors from "@/constants/colors";
import { ProjectStatus, ProjectTimelineItem } from "@/types";
import { X } from "lucide-react-native";

const statusOptions: { value: ProjectStatus; label: string }[] = [
  { value: "em_elaboracao", label: "Em Elaboração" },
  { value: "protocolado", label: "Protocolado" },
  { value: "em_tramitacao", label: "Em Tramitação" },
  { value: "aprovado", label: "Aprovado" },
  { value: "rejeitado", label: "Rejeitado" },
  { value: "arquivado", label: "Arquivado" },
];

export default function EditProjectScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const id = params.id as string;
  const { updateProject, projects } = useData();
  const { showToast } = useToast();

  const [number, setNumber] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [fullText, setFullText] = useState("");
  const [protocolDate, setProtocolDate] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("em_elaboracao");
  const [pdfUrl, setPdfUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (id) {
      const project = projects.find(p => p.id === id);
      if (project) {
        setNumber(project.number);
        setTitle(project.title);
        setSummary(project.summary);
        setFullText(project.fullText || "");
        if (project.protocolDate) {
          const date = new Date(project.protocolDate);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          setProtocolDate(`${year}-${month}-${day}`);
          setSelectedDate(date);
        }
        setStatus(project.status);
        setPdfUrl(project.pdfUrl || "");
      } else {
        showToast({ type: 'error', title: 'Erro', message: 'Projeto não encontrado' });
        router.back();
      }
    }
  }, [id, projects]);

  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (date) {
        setSelectedDate(date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        setProtocolDate(`${year}-${month}-${day}`);
      }
    } else if (date) {
      setSelectedDate(date);
    }
  };

  const confirmIOSDate = () => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    setProtocolDate(`${year}-${month}-${day}`);
    setShowDatePicker(false);
  };

  const handleSubmit = async () => {
    if (!number.trim() || !title.trim() || !summary.trim()) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'Preencha todos os campos obrigatórios' });
      return;
    }

    if (!protocolDate.trim() && status !== "em_elaboracao") {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'A data de protocolo é obrigatória para projetos protocolados' });
      return;
    }

    setIsLoading(true);
    try {
      // Logic to update timeline could be added here if needed
      // For now, we just update the project fields

      await updateProject(id, {
        number: number.trim(),
        title: title.trim(),
        summary: summary.trim(),
        fullText: fullText.trim() || undefined,
        protocolDate: protocolDate.trim() ? new Date(protocolDate).toISOString() : new Date().toISOString(),
        status,
        pdfUrl: pdfUrl.trim() || undefined,
      });

      showToast({ type: 'success', title: 'Sucesso', message: 'Projeto atualizado com sucesso!' });
      setTimeout(() => router.back(), 1500);
    } catch (error) {
      console.error("Error updating project:", error);
      showToast({ type: 'error', title: 'Erro', message: 'Não foi possível atualizar o projeto' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Editar Projeto de Lei",
          headerStyle: {
            backgroundColor: Colors.light.primary,
          },
          headerTintColor: "#fff",
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Número do Projeto <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={number}
              onChangeText={setNumber}
              placeholder="Ex: PL 001/2025"
              placeholderTextColor={Colors.light.textSecondary}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Título <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Título do projeto"
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Ementa/Resumo <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={summary}
              onChangeText={setSummary}
              placeholder="Breve descrição do projeto"
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Texto Completo</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={fullText}
              onChangeText={setFullText}
              placeholder="Texto completo do projeto (opcional)"
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              numberOfLines={6}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Data de Protocolo</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text
                style={[
                  styles.dateText,
                  !protocolDate && styles.datePlaceholder,
                ]}
              >
                {protocolDate || "Selecione a data"}
              </Text>
            </TouchableOpacity>
          </View>

          {Platform.OS === 'ios' ? (
            <Modal
              visible={showDatePicker}
              transparent
              animationType="slide"
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.modalCancel}>Cancelar</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Selecione a Data</Text>
                    <TouchableOpacity onPress={confirmIOSDate}>
                      <Text style={styles.modalConfirm}>Confirmar</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="spinner"
                    onChange={onDateChange}
                    locale="pt-BR"
                    style={styles.datePicker}
                  />
                </View>
              </View>
            </Modal>
          ) : (
            showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                locale="pt-BR"
              />
            )
          )}

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
            <Text style={styles.label}>URL do PDF (opcional)</Text>
            <TextInput
              style={styles.input}
              value={pdfUrl}
              onChangeText={setPdfUrl}
              placeholder="https://exemplo.com/projeto.pdf"
              placeholderTextColor={Colors.light.textSecondary}
              autoCapitalize="none"
              keyboardType="url"
            />
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
  dateButton: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minHeight: 48,
    justifyContent: "center" as const,
  },
  dateText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  datePlaceholder: {
    color: Colors.light.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  modalCancel: {
    fontSize: 17,
    color: Colors.light.textSecondary,
  },
  modalConfirm: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.light.primary,
  },
  datePicker: {
    height: 250,
  },
});

