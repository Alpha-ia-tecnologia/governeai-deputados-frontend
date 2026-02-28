import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Platform,
  Modal,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Stack, router } from "expo-router";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Button } from "@/components/UI";
import Colors from "@/constants/colors";
import { ChevronDown, Calendar as CalendarIcon, Search } from "lucide-react-native";
import { cepService } from "@/services/cep.service";
import { leadersService } from "@/services/leaders.service";
import { Leader } from "@/types";

// Lista de estados brasileiros
const ESTADOS_BR = [
  { uf: 'AC', nome: 'Acre' },
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' },
  { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' },
  { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' },
  { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' },
  { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'TO', nome: 'Tocantins' },
];



export default function AddVoterScreen() {
  const { addVoter, leaders, isLoading: dataLoading, refreshData } = useData();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [loadingCep, setLoadingCep] = useState(false);
  const [showLeaderPicker, setShowLeaderPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    voterRegistration: "",
    birthDate: "",
    phone: "",
    // Campos de endereço
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    // Campos do Gabinete Social
    zona: "",
    localidade: "",
    articulador: "",
    idade: "",
    // Outros
    votesCount: "",
    leaderId: "",
    leaderName: "",
    vereadorId: "",
    notes: "",
  });

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9)
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const formatDate = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatVoterRegistration = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 8)
      return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
    return `${numbers.slice(0, 4)} ${numbers.slice(4, 8)} ${numbers.slice(8, 12)}`;
  };

  const formatCep = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleCepSearch = async () => {
    const cleanCep = formData.cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      showToast({ type: 'warning', title: 'CEP Inválido', message: 'Digite um CEP válido com 8 dígitos' });
      return;
    }

    setLoadingCep(true);
    try {
      const result = await cepService.searchByCep(cleanCep);
      if (result) {
        setFormData({
          ...formData,
          street: result.street,
          neighborhood: result.neighborhood,
          city: result.city,
          state: result.state,
          cep: formatCep(result.cep),
        });
      } else {
        showToast({ type: 'warning', title: 'CEP não encontrado', message: 'Não foi possível encontrar o endereço para este CEP' });
      }
    } catch (error) {
      showToast({ type: 'error', title: 'Erro', message: 'Ocorreu um erro ao buscar o CEP' });
    } finally {
      setLoadingCep(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'Nome é obrigatório' });
      return false;
    }
    if (!formData.phone.trim()) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'WhatsApp é obrigatório' });
      return false;
    }
    if (formData.birthDate.trim() && formData.birthDate.replace(/\D/g, "").length !== 8) {
      showToast({ type: 'error', title: 'Dados inválidos', message: 'Data de nascimento inválida' });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const [day, month, year] = formData.birthDate.split("/");
      const birthDateISO = `${year}-${month}-${day}`;

      let finalLeaderId = formData.leaderId;

      // Se a liderança selecionada é um usuário órfão (userId igual ao id),
      // precisamos criar o registro de Leader primeiro
      if (selectedLeader && selectedLeader.userId === selectedLeader.id) {
        console.log('AddVoterScreen: Criando leader para usuário órfão:', selectedLeader.userId);
        try {
          const newLeader = await leadersService.createFromUser(selectedLeader.userId, {
            name: selectedLeader.name,
            cpf: selectedLeader.cpf,
            phone: selectedLeader.phone,
            email: selectedLeader.email,
            region: selectedLeader.region,
          });
          finalLeaderId = newLeader.id;
          console.log('AddVoterScreen: Leader criado com sucesso, novo ID:', finalLeaderId);
          // Atualizar a lista de leaders
          refreshData();
        } catch (err) {
          console.error('AddVoterScreen: Erro ao criar leader:', err);
          showToast({ type: 'error', title: 'Erro', message: 'Não foi possível registrar a liderança. Tente novamente.' });
          setLoading(false);
          return;
        }
      }

      await addVoter({
        name: formData.name.trim(),
        cpf: formData.cpf || undefined,
        voterRegistration: formData.voterRegistration || undefined,
        birthDate: formData.birthDate.trim() ? birthDateISO : undefined,
        phone: formData.phone,
        // Campos de endereço
        cep: formData.cep.replace(/\D/g, "") || undefined,
        street: formData.street.trim() || undefined,
        number: formData.number.trim() || undefined,
        complement: formData.complement.trim() || undefined,
        neighborhood: formData.neighborhood.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state || undefined,
        // Campos do Gabinete Social
        zona: formData.zona || undefined,
        localidade: formData.localidade.trim() || undefined,
        articulador: formData.articulador.trim() || undefined,
        idade: formData.idade ? parseInt(formData.idade) : undefined,
        // Outros
        votesCount: formData.votesCount ? parseInt(formData.votesCount) : 0,
        leaderId: finalLeaderId || undefined,
        leaderName: formData.leaderName || undefined,
        vereadorId: formData.vereadorId || undefined,
        notes: formData.notes.trim() || undefined,
      });

      showToast({
        type: 'success',
        title: 'Sucesso',
        message: 'Eleitor cadastrado com sucesso!',
        onDismiss: () => router.back()
      });
      // Navegar após um pequeno delay para o usuário ver a notificação
      setTimeout(() => router.back(), 1500);
    } catch (error: any) {
      console.error("Error adding voter:", error);

      // Mensagem específica para diferentes tipos de erro
      let errorMessage = "Não foi possível cadastrar o eleitor";
      if (error?.message?.includes("timeout")) {
        errorMessage = "O servidor está demorando para responder. Por favor, tente novamente.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      showToast({ type: 'error', title: 'Erro', message: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const selectLeader = (leader: Leader) => {
    setSelectedLeader(leader);
    setFormData({
      ...formData,
      leaderId: leader.id,
      leaderName: leader.name,
      vereadorId: leader.vereadorId || "",
    });
    setShowLeaderPicker(false);
  };

  const selectState = (uf: string) => {
    setFormData({ ...formData, state: uf });
    setShowStatePicker(false);
  };

  const onDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (date) {
        setSelectedDate(date);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        setFormData({ ...formData, birthDate: `${day}/${month}/${year}` });
      }
    } else if (date) {
      setSelectedDate(date);
    }
  };

  const confirmIOSDate = () => {
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const year = selectedDate.getFullYear();
    setFormData({ ...formData, birthDate: `${day}/${month}/${year}` });
    setShowDatePicker(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Novo Eleitor",
          headerStyle: {
            backgroundColor: Colors.light.primary,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "600" as const,
          },
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.form}>
          {/* Dados Pessoais */}
          <Text style={styles.sectionTitle}>Dados Pessoais</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Nome Completo <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Digite o nome completo"
              placeholderTextColor={Colors.light.textSecondary}
              value={formData.name}
              onChangeText={(value) => setFormData({ ...formData, name: value })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CPF</Text>
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              placeholderTextColor={Colors.light.textSecondary}
              value={formData.cpf}
              onChangeText={(value) =>
                setFormData({ ...formData, cpf: formatCPF(value) })
              }
              keyboardType="numeric"
              maxLength={14}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Título de Eleitor</Text>
            <TextInput
              style={styles.input}
              placeholder="0000 0000 0000"
              placeholderTextColor={Colors.light.textSecondary}
              value={formData.voterRegistration}
              onChangeText={(value) =>
                setFormData({ ...formData, voterRegistration: formatVoterRegistration(value) })
              }
              keyboardType="numeric"
              maxLength={14}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Data de Nascimento
            </Text>
            <View style={styles.dateInputContainer}>
              <TextInput
                style={styles.dateInput}
                placeholder="DD/MM/AAAA"
                placeholderTextColor={Colors.light.textSecondary}
                value={formData.birthDate}
                onChangeText={(value) =>
                  setFormData({ ...formData, birthDate: formatDate(value) })
                }
                keyboardType="numeric"
                maxLength={10}
              />
              <TouchableOpacity
                style={styles.calendarIconButton}
                onPress={() => setShowDatePicker(true)}
              >
                <CalendarIcon color={Colors.light.primary} size={20} />
              </TouchableOpacity>
            </View>
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
                    maximumDate={new Date()}
                    locale="pt-BR"
                    style={styles.datePicker}
                  />
                </View>
              </View>
            </Modal>
          ) : Platform.OS === 'android' && showDatePicker ? (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              maximumDate={new Date()}
            />
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Telefone / WhatsApp <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              placeholderTextColor={Colors.light.textSecondary}
              value={formData.phone}
              onChangeText={(value) =>
                setFormData({ ...formData, phone: formatPhone(value) })
              }
              keyboardType="phone-pad"
              maxLength={15}
            />
          </View>

          {/* Gabinete Social */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Gabinete Social</Text>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Zona</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setFormData({ ...formData, zona: formData.zona === 'RURAL' ? 'URBANA' : formData.zona === 'URBANA' ? '' : 'RURAL' })}
              >
                <Text style={[styles.pickerText, !formData.zona && styles.pickerPlaceholder]}>
                  {formData.zona || "Selecione"}
                </Text>
                <ChevronDown color={Colors.light.textSecondary} size={20} />
              </TouchableOpacity>
            </View>
            <View style={[styles.inputGroup, { flex: 2, marginLeft: 12 }]}>
              <Text style={styles.label}>Localidade</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: SETOR 01, 1º DISTRITO"
                placeholderTextColor={Colors.light.textSecondary}
                value={formData.localidade}
                onChangeText={(value) => setFormData({ ...formData, localidade: value })}
              />
            </View>
          </View>


          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.label}>Articulador</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome do articulador"
                placeholderTextColor={Colors.light.textSecondary}
                value={formData.articulador}
                onChangeText={(value) => setFormData({ ...formData, articulador: value })}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Idade</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: 30"
                placeholderTextColor={Colors.light.textSecondary}
                value={formData.idade}
                onChangeText={(value) => setFormData({ ...formData, idade: value.replace(/\D/g, "") })}
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
          </View>

          {/* Endereço */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Endereço</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>CEP</Text>
            <View style={styles.cepContainer}>
              <TextInput
                style={[styles.input, styles.cepInput]}
                placeholder="00000-000"
                placeholderTextColor={Colors.light.textSecondary}
                value={formData.cep}
                onChangeText={(value) =>
                  setFormData({ ...formData, cep: formatCep(value) })
                }
                keyboardType="numeric"
                maxLength={9}
              />
              <TouchableOpacity
                style={styles.cepButton}
                onPress={handleCepSearch}
                disabled={loadingCep}
              >
                {loadingCep ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Search color="#fff" size={20} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>
              Digite o CEP e clique na lupa para buscar o endereço automaticamente
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Rua/Logradouro</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da rua"
              placeholderTextColor={Colors.light.textSecondary}
              value={formData.street}
              onChangeText={(value) => setFormData({ ...formData, street: value })}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Número</Text>
              <TextInput
                style={styles.input}
                placeholder="Nº"
                placeholderTextColor={Colors.light.textSecondary}
                value={formData.number}
                onChangeText={(value) => setFormData({ ...formData, number: value })}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 2, marginLeft: 12 }]}>
              <Text style={styles.label}>Complemento</Text>
              <TextInput
                style={styles.input}
                placeholder="Apto, Bloco, etc"
                placeholderTextColor={Colors.light.textSecondary}
                value={formData.complement}
                onChangeText={(value) => setFormData({ ...formData, complement: value })}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bairro</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do bairro"
              placeholderTextColor={Colors.light.textSecondary}
              value={formData.neighborhood}
              onChangeText={(value) =>
                setFormData({ ...formData, neighborhood: value })
              }
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 2 }]}>
              <Text style={styles.label}>Cidade</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome da cidade"
                placeholderTextColor={Colors.light.textSecondary}
                value={formData.city}
                onChangeText={(value) => setFormData({ ...formData, city: value })}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.label}>Estado</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setShowStatePicker(!showStatePicker)}
              >
                <Text
                  style={[
                    styles.pickerText,
                    !formData.state && styles.pickerPlaceholder,
                  ]}
                >
                  {formData.state || "UF"}
                </Text>
                <ChevronDown color={Colors.light.textSecondary} size={20} />
              </TouchableOpacity>
            </View>
          </View>

          {showStatePicker && (
            <View style={styles.pickerOptions}>
              <ScrollView style={{ maxHeight: 200 }}>
                {ESTADOS_BR.map((estado) => (
                  <TouchableOpacity
                    key={estado.uf}
                    style={styles.pickerOption}
                    onPress={() => selectState(estado.uf)}
                  >
                    <Text style={styles.pickerOptionText}>{estado.uf} - {estado.nome}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Informações Eleitorais */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Informações Eleitorais</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Quantidade de Votos <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 5"
              placeholderTextColor={Colors.light.textSecondary}
              value={formData.votesCount}
              onChangeText={(value) =>
                setFormData({ ...formData, votesCount: value.replace(/\D/g, "") })
              }
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Liderança Responsável <Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowLeaderPicker(!showLeaderPicker)}
            >
              <Text
                style={[
                  styles.pickerText,
                  !formData.leaderName && styles.pickerPlaceholder,
                ]}
              >
                {formData.leaderName || "Selecione uma liderança"}
              </Text>
              <ChevronDown color={Colors.light.textSecondary} size={20} />
            </TouchableOpacity>

            {showLeaderPicker && (
              <View style={styles.pickerOptions}>
                {leaders.filter((l) => l.active).length === 0 ? (
                  <View style={styles.noLeadersContainer}>
                    <Text style={styles.noLeadersText}>
                      Nenhuma liderança cadastrada
                    </Text>
                    <TouchableOpacity
                      style={styles.addLeaderLink}
                      onPress={() => {
                        setShowLeaderPicker(false);
                        router.push("/add-leader");
                      }}
                    >
                      <Text style={styles.addLeaderLinkText}>
                        + Cadastrar Liderança
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  leaders
                    .filter((l) => l.active)
                    .map((leader) => (
                      <TouchableOpacity
                        key={leader.id}
                        style={styles.pickerOption}
                        onPress={() => selectLeader(leader)}
                      >
                        <Text style={styles.pickerOptionText}>{leader.name}</Text>
                        <Text style={styles.pickerOptionSubtext}>
                          {leader.region} • {leader.votersCount}/{leader.votersGoal}{" "}
                          eleitores
                        </Text>
                      </TouchableOpacity>
                    ))
                )}
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notas adicionais sobre o eleitor"
              placeholderTextColor={Colors.light.textSecondary}
              value={formData.notes}
              onChangeText={(value) => setFormData({ ...formData, notes: value })}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Cadastrar Eleitor"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            size="large"
          />
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
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.primary,
    marginBottom: 8,
  },
  inputGroup: {
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.text,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textArea: {
    minHeight: 100,
  },
  row: {
    flexDirection: "row" as const,
  },
  cepContainer: {
    flexDirection: "row" as const,
    gap: 8,
  },
  cepInput: {
    flex: 1,
  },
  cepButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  helperText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  picker: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  pickerText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  pickerPlaceholder: {
    color: Colors.light.textSecondary,
  },
  pickerOptions: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginTop: 4,
  },
  pickerOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  pickerOptionText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  pickerOptionSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
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
  dateInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingVertical: 12,
  },
  calendarIconButton: {
    padding: 4,
    marginLeft: 8,
  },
  footer: {
    marginTop: 32,
    marginBottom: 16,
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
  noLeadersContainer: {
    padding: 16,
    alignItems: "center" as const,
  },
  noLeadersText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
    textAlign: "center" as const,
  },
  addLeaderLink: {
    padding: 8,
  },
  addLeaderLinkText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
});
