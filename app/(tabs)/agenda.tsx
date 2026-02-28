import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus,
  X,
  Check,
  Bell,
  User,
  CheckCircle2,
  Circle,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { Badge, Button } from "@/components/UI";
import { useAlertDialog } from "@/components/Advanced";
import {
  useData,
  useUpcomingAppointments,
} from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Appointment, AppointmentType, ReminderConfig } from "@/types";

const TypeLabels: Record<AppointmentType, string> = {
  compromisso: "Compromisso",
  acao: "Ação",
  reuniao: "Reunião",
  visita: "Visita",
  ligacao: "Ligação",
  outro: "Outro",
};

const TypeColors: Record<AppointmentType, string> = {
  compromisso: "#3B82F6",
  acao: "#10B981",
  reuniao: "#8B5CF6",
  visita: "#F59E0B",
  ligacao: "#EC4899",
  outro: "#6B7280",
};

const ReminderOptions = [
  { label: "5 minutos antes", value: 5 },
  { label: "15 minutos antes", value: 15 },
  { label: "30 minutos antes", value: 30 },
  { label: "1 hora antes", value: 60 },
  { label: "2 horas antes", value: 120 },
  { label: "1 dia antes", value: 1440 },
];

// Funções helper para alertas cross-platform
const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const showConfirm = (title: string, message: string, onConfirm: () => void, confirmText: string = "Confirmar") => {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(
      title,
      message,
      [
        { text: "Cancelar", style: "cancel" },
        { text: confirmText, onPress: onConfirm },
      ]
    );
  }
};

export default function AgendaScreen() {
  const { appointments, addAppointment, completeAppointment, deleteAppointment, voters } = useData();
  const { user } = useAuth();
  const upcomingAppointments = useUpcomingAppointments(30);
  const { showAlert: showDeleteAlert, AlertDialogComponent: DeleteAlertDialog } = useAlertDialog();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  // Inicializar com data e hora atuais
  const getInitialDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getInitialTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Função auxiliar para converter data DD-MM-AAAA para AAAA-MM-DD (formato HTML5)
  const convertDateToHTML5 = (date: string) => {
    if (!date) return '';
    const parts = date.split('-');
    if (parts.length !== 3) return '';
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "compromisso" as AppointmentType,
    date: getInitialDate(),
    time: getInitialTime(),
    duration: "",
    location: "",
    voterId: "",
    notes: "",
    selectedReminders: [30, 60] as number[],
  });

  const handleSubmit = async () => {
    console.log('handleSubmit called');
    console.log('formData:', formData);

    if (!formData.title || !formData.date || !formData.time) {
      console.log('Validation failed - missing required fields');
      showAlert("Erro", "Preencha todos os campos obrigatórios");
      return;
    }

    // Validar formato da data
    const dateParts = formData.date.split('-');
    console.log('dateParts:', dateParts);

    if (dateParts.length !== 3) {
      console.log('Validation failed - date format incorrect');
      showAlert("Erro", "Data inválida. Use o formato DD-MM-AAAA");
      return;
    }

    const [day, month, year] = dateParts;
    if (!day || !month || !year || year.length !== 4) {
      console.log('Validation failed - date parts invalid');
      showAlert("Erro", "Data inválida. Use o formato DD-MM-AAAA");
      return;
    }

    const voter = voters.find((v) => v.id === formData.voterId);

    const reminders: ReminderConfig[] = formData.selectedReminders.map((minutes) => ({
      id: `${Date.now()}-${minutes}`,
      minutes,
    }));

    // Converter data de DD-MM-AAAA para AAAA-MM-DD
    const dateISO = `${year}-${month}-${day}`;
    console.log('dateISO:', dateISO);

    const appointmentData = {
      title: formData.title,
      description: formData.description,
      type: formData.type,
      status: "scheduled",
      date: dateISO,
      time: formData.time,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      location: formData.location,
      voterId: formData.voterId || undefined,
      voterName: voter?.name,
      responsibleId: user?.id || "1",
      responsibleName: user?.name || "Admin",
      notes: formData.notes,
      reminders,
    };

    console.log('Sending appointment data:', appointmentData);

    try {
      console.log('Calling addAppointment...');
      await addAppointment(appointmentData);
      console.log('Appointment added successfully');

      showAlert("Sucesso", "Compromisso cadastrado com sucesso!");
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      console.error("Error adding appointment:", error);
      const errorMessage = error?.message || error?.toString() || "Não foi possível cadastrar o compromisso";
      showAlert("Erro", errorMessage);
    }
  };

  const handleComplete = async () => {
    if (!selectedAppointment) return;

    try {
      await completeAppointment(selectedAppointment.id, completionNotes);
      showAlert("Sucesso", "Compromisso concluído!");
      setShowCompleteModal(false);
      setSelectedAppointment(null);
      setCompletionNotes("");
    } catch (error) {
      console.error("Error completing appointment:", error);
      showAlert("Erro", "Não foi possível concluir o compromisso");
    }
  };

  const handleDelete = (id: string) => {
    showDeleteAlert({
      title: "Excluir compromisso",
      description: "Tem certeza que deseja excluir este compromisso? Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      variant: "danger",
      onConfirm: async () => {
        try {
          await deleteAppointment(id);
          showAlert("Sucesso", "Compromisso excluído!");
        } catch (error) {
          console.error("Error deleting appointment:", error);
          showAlert("Erro", "Não foi possível excluir o compromisso");
        }
      },
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      type: "compromisso",
      date: getInitialDate(),
      time: getInitialTime(),
      duration: "",
      location: "",
      voterId: "",
      notes: "",
      selectedReminders: [30, 60],
    });
    setSelectedDate(new Date());
    setSelectedTime(new Date());
  };

  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (date) {
        setSelectedDate(date);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        setFormData({ ...formData, date: `${day}-${month}-${year}` });
      }
    } else if (date) {
      setSelectedDate(date);
    }
  };

  const confirmIOSDate = () => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    setFormData({ ...formData, date: `${day}-${month}-${year}` });
    setShowDatePicker(false);
  };

  const onTimeChange = (event: any, time?: Date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (time) {
        setSelectedTime(time);
        const hours = String(time.getHours()).padStart(2, '0');
        const minutes = String(time.getMinutes()).padStart(2, '0');
        setFormData({ ...formData, time: `${hours}:${minutes}` });
      }
    } else if (time) {
      setSelectedTime(time);
    }
  };

  const confirmIOSTime = () => {
    const hours = String(selectedTime.getHours()).padStart(2, '0');
    const minutes = String(selectedTime.getMinutes()).padStart(2, '0');
    setFormData({ ...formData, time: `${hours}:${minutes}` });
    setShowTimePicker(false);
  };

  const toggleReminder = (minutes: number) => {
    if (formData.selectedReminders.includes(minutes)) {
      setFormData({
        ...formData,
        selectedReminders: formData.selectedReminders.filter((m) => m !== minutes),
      });
    } else {
      setFormData({
        ...formData,
        selectedReminders: [...formData.selectedReminders, minutes],
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Meus Compromissos</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus color="#fff" size={24} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Próximos 30 dias</Text>
          {upcomingAppointments.length === 0 ? (
            <View style={styles.emptyContainer}>
              <CalendarIcon color={Colors.light.textSecondary} size={48} />
              <Text style={styles.emptyText}>Nenhum compromisso agendado</Text>
            </View>
          ) : (
            upcomingAppointments.map((appointment) => {
              const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);

              return (
                <View key={appointment.id} style={styles.appointmentCard}>
                  <View style={styles.appointmentHeader}>
                    <View style={styles.appointmentType}>
                      <View
                        style={[
                          styles.typeBadge,
                          { backgroundColor: TypeColors[appointment.type] },
                        ]}
                      />
                      <Text style={styles.appointmentTitle}>{appointment.title}</Text>
                    </View>
                  </View>

                  {appointment.description && (
                    <Text style={styles.appointmentDescription}>
                      {appointment.description}
                    </Text>
                  )}

                  <View style={styles.appointmentDetails}>
                    <View style={styles.detailRow}>
                      <CalendarIcon color={Colors.light.textSecondary} size={16} />
                      <Text style={styles.detailText}>
                        {appointmentDate.toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </Text>
                    </View>

                    <View style={styles.detailRow}>
                      <Clock color={Colors.light.textSecondary} size={16} />
                      <Text style={styles.detailText}>
                        {appointmentDate.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        {appointment.duration && ` (${appointment.duration} min)`}
                      </Text>
                    </View>

                    {appointment.location && (
                      <View style={styles.detailRow}>
                        <MapPin color={Colors.light.textSecondary} size={16} />
                        <Text style={styles.detailText}>{appointment.location}</Text>
                      </View>
                    )}

                    {appointment.voterName && (
                      <View style={styles.detailRow}>
                        <User color={Colors.light.textSecondary} size={16} />
                        <Text style={styles.detailText}>{appointment.voterName}</Text>
                      </View>
                    )}

                    {appointment.reminders.length > 0 && (
                      <View style={styles.detailRow}>
                        <Bell color={Colors.light.textSecondary} size={16} />
                        <Text style={styles.detailText}>
                          {appointment.reminders.length} lembrete(s) configurado(s)
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.appointmentActions}>
                    <Badge
                      label={TypeLabels[appointment.type]}
                      color={TypeColors[appointment.type]}
                    />
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.completeButton}
                        onPress={() => {
                          setSelectedAppointment(appointment);
                          setShowCompleteModal(true);
                        }}
                      >
                        <Check color="#10B981" size={20} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(appointment.id)}
                      >
                        <X color="#EF4444" size={20} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {appointments.filter((a) => a.status === "completed").length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Concluídos</Text>
            {appointments
              .filter((a) => a.status === "completed")
              .slice(0, 5)
              .map((appointment) => {
                const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);

                return (
                  <View key={appointment.id} style={[styles.appointmentCard, styles.completedCard]}>
                    <View style={styles.completedHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                        <CheckCircle2 color="#10B981" size={20} />
                        <Text style={styles.completedTitle}>{appointment.title}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDelete(appointment.id)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <X color={Colors.light.textSecondary} size={20} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.completedDate}>
                      Concluído em{" "}
                      {appointment.completedAt &&
                        new Date(appointment.completedAt).toLocaleDateString("pt-BR")}
                    </Text>
                    {appointment.completedNotes && (
                      <Text style={styles.completedNotes}>
                        {appointment.completedNotes}
                      </Text>
                    )}
                  </View>
                );
              })}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Novo Compromisso</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X color={Colors.light.text} size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Título <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholder="Ex: Reunião com eleitor"
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Detalhes do compromisso"
                placeholderTextColor={Colors.light.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Tipo <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.typeGrid}>
                {(Object.keys(TypeLabels) as AppointmentType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      formData.type === type && styles.typeOptionSelected,
                      { borderColor: TypeColors[type] },
                      formData.type === type && { backgroundColor: TypeColors[type] + "20" },
                    ]}
                    onPress={() => setFormData({ ...formData, type })}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        formData.type === type && {
                          color: TypeColors[type],
                          fontWeight: "700",
                        },
                      ]}
                    >
                      {TypeLabels[type]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>
                  Data <Text style={styles.required}>*</Text>
                </Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="date"
                    value={convertDateToHTML5(formData.date)}
                    onChange={(e) => {
                      const date = e.target.value;
                      if (date) {
                        const [year, month, day] = date.split('-');
                        setFormData({ ...formData, date: `${day}-${month}-${year}` });
                      }
                    }}
                    required
                    style={{
                      backgroundColor: Colors.light.card,
                      borderWidth: 1,
                      borderStyle: 'solid',
                      borderColor: Colors.light.border,
                      borderRadius: 12,
                      padding: 12,
                      fontSize: 16,
                      color: Colors.light.text,
                      width: '100%',
                      minHeight: 48,
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      cursor: 'pointer',
                    } as any}
                    className="date-input"
                  />
                ) : (
                  <View style={styles.dateInputContainer}>
                    <TextInput
                      style={styles.dateTextInput}
                      value={formData.date}
                      onChangeText={(text) => setFormData({ ...formData, date: text })}
                      placeholder="DD-MM-AAAA"
                      placeholderTextColor={Colors.light.textSecondary}
                    />
                    <TouchableOpacity
                      style={styles.calendarIconButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <CalendarIcon color={Colors.light.primary} size={20} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={[styles.formGroup, styles.formGroupHalf]}>
                <Text style={styles.label}>
                  Hora <Text style={styles.required}>*</Text>
                </Text>
                {Platform.OS === 'web' ? (
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => {
                      setFormData({ ...formData, time: e.target.value });
                    }}
                    required
                    style={{
                      backgroundColor: Colors.light.card,
                      borderWidth: 1,
                      borderStyle: 'solid',
                      borderColor: Colors.light.border,
                      borderRadius: 12,
                      padding: 12,
                      fontSize: 16,
                      color: Colors.light.text,
                      width: '100%',
                      minHeight: 48,
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      cursor: 'pointer',
                    } as any}
                    className="time-input"
                  />
                ) : (
                  <View style={styles.dateInputContainer}>
                    <TextInput
                      style={styles.dateTextInput}
                      value={formData.time}
                      onChangeText={(text) => setFormData({ ...formData, time: text })}
                      placeholder="HH:MM"
                      placeholderTextColor={Colors.light.textSecondary}
                    />
                    <TouchableOpacity
                      style={styles.calendarIconButton}
                      onPress={() => setShowTimePicker(true)}
                    >
                      <Clock color={Colors.light.primary} size={20} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Duração (minutos)</Text>
              <TextInput
                style={styles.input}
                value={formData.duration}
                onChangeText={(text) => setFormData({ ...formData, duration: text })}
                placeholder="Ex: 60"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Local</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholder="Ex: Gabinete"
                placeholderTextColor={Colors.light.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Lembretes</Text>
              <View style={styles.reminderGrid}>
                {ReminderOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.reminderOption}
                    onPress={() => toggleReminder(option.value)}
                  >
                    {formData.selectedReminders.includes(option.value) ? (
                      <CheckCircle2 color={Colors.light.primary} size={20} />
                    ) : (
                      <Circle color={Colors.light.border} size={20} />
                    )}
                    <Text style={styles.reminderOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Observações</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                placeholder="Anotações adicionais"
                placeholderTextColor={Colors.light.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          {Platform.OS === 'ios' && Platform.OS !== 'web' ? (
            <>
              <Modal
                visible={showDatePicker}
                transparent
                animationType="slide"
              >
                <View style={styles.pickerModalOverlay}>
                  <View style={styles.pickerModalContent}>
                    <View style={styles.pickerModalHeader}>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={styles.pickerModalCancel}>Cancelar</Text>
                      </TouchableOpacity>
                      <Text style={styles.pickerModalTitle}>Selecione a Data</Text>
                      <TouchableOpacity onPress={confirmIOSDate}>
                        <Text style={styles.pickerModalConfirm}>Confirmar</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display="spinner"
                      onChange={onDateChange}
                      locale="pt-BR"
                      style={styles.dateTimePicker}
                    />
                  </View>
                </View>
              </Modal>
              <Modal
                visible={showTimePicker}
                transparent
                animationType="slide"
              >
                <View style={styles.pickerModalOverlay}>
                  <View style={styles.pickerModalContent}>
                    <View style={styles.pickerModalHeader}>
                      <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                        <Text style={styles.pickerModalCancel}>Cancelar</Text>
                      </TouchableOpacity>
                      <Text style={styles.pickerModalTitle}>Selecione a Hora</Text>
                      <TouchableOpacity onPress={confirmIOSTime}>
                        <Text style={styles.pickerModalConfirm}>Confirmar</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={selectedTime}
                      mode="time"
                      display="spinner"
                      onChange={onTimeChange}
                      locale="pt-BR"
                      style={styles.dateTimePicker}
                    />
                  </View>
                </View>
              </Modal>
            </>
          ) : Platform.OS !== 'web' ? (
            <>
              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  locale="pt-BR"
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={selectedTime}
                  mode="time"
                  display="default"
                  onChange={onTimeChange}
                  locale="pt-BR"
                />
              )}
            </>
          ) : null}

          <View style={styles.modalFooter}>
            <Button
              title="Cancelar"
              onPress={() => setShowAddModal(false)}
              variant="outline"
              style={styles.footerButton}
            />
            <Button
              title="Salvar"
              onPress={handleSubmit}
              variant="primary"
              style={styles.footerButton}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCompleteModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowCompleteModal(false)}
      >
        <View style={styles.overlayContainer}>
          <View style={styles.completeModal}>
            <View style={styles.completeModalHeader}>
              <Text style={styles.completeModalTitle}>Concluir Compromisso</Text>
              <TouchableOpacity onPress={() => setShowCompleteModal(false)}>
                <X color={Colors.light.text} size={24} />
              </TouchableOpacity>
            </View>

            <Text style={styles.completeModalSubtitle}>
              {selectedAppointment?.title}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Como foi o compromisso?</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={completionNotes}
                onChangeText={setCompletionNotes}
                placeholder="Adicione observações sobre o que foi realizado..."
                placeholderTextColor={Colors.light.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.completeModalActions}>
              <Button
                title="Cancelar"
                onPress={() => setShowCompleteModal(false)}
                variant="outline"
                style={styles.footerButton}
              />
              <Button
                title="Concluir"
                onPress={handleComplete}
                variant="primary"
                style={styles.footerButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Alert Dialog Moderno para Exclusão */}
      {DeleteAlertDialog}
    </View>
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
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  addButton: {
    backgroundColor: Colors.light.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
      },
    }),
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  appointmentCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      },
    }),
  },
  appointmentHeader: {
    marginBottom: 12,
  },
  appointmentType: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  typeBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  appointmentTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    flex: 1,
  },
  appointmentDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  appointmentDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  appointmentActions: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  actionButtons: {
    flexDirection: "row" as const,
    gap: 12,
  },
  completeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#10B98120",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#EF444420",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  completedCard: {
    opacity: 0.7,
  },
  completedHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 8,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  completedDate: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  completedNotes: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontStyle: "italic" as const,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formGroupHalf: {
    flex: 1,
  },
  formRow: {
    flexDirection: "row" as const,
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  required: {
    color: "#EF4444",
  },
  input: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top" as const,
  },
  typeGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
  },
  typeOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  typeOptionSelected: {
    borderWidth: 2,
  },
  typeOptionText: {
    fontSize: 14,
    color: Colors.light.text,
  },
  reminderGrid: {
    gap: 12,
  },
  reminderOption: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    paddingVertical: 12,
  },
  reminderOptionText: {
    fontSize: 15,
    color: Colors.light.text,
  },
  modalFooter: {
    flexDirection: "row" as const,
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  footerButton: {
    flex: 1,
  },
  dateInputContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  dateTextInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 12,
  },
  calendarIconButton: {
    padding: 4,
    marginLeft: 8,
  },
  dateButton: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
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
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end' as const,
  },
  pickerModalContent: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
  },
  pickerModalHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  pickerModalTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.light.text,
  },
  pickerModalCancel: {
    fontSize: 17,
    color: Colors.light.textSecondary,
  },
  pickerModalConfirm: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.light.primary,
  },
  dateTimePicker: {
    height: 250,
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 16,
  },
  completeModal: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    padding: 20,
  },
  completeModalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  completeModalTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  completeModalSubtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 20,
  },
  completeModalActions: {
    flexDirection: "row" as const,
    gap: 12,
    marginTop: 20,
  },
});
