import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Stack, router } from "expo-router";
import { ChevronDown } from "lucide-react-native";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Button } from "@/components/UI";
import { usersService } from "@/services/users.service";
import Colors from "@/constants/colors";
import { User } from "@/types";

export default function AddLeaderScreen() {
  const { addLeader } = useData();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [loadingVereadores, setLoadingVereadores] = useState(false);
  const [vereadores, setVereadores] = useState<User[]>([]);
  const [showVereadorPicker, setShowVereadorPicker] = useState(false);
  const [selectedVereador, setSelectedVereador] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    birthDate: "",
    phone: "",
    email: "",
    region: "",
    votersGoal: "",
  });

  // Verificar se o usuário é admin (precisa selecionar vereador)
  const isAdmin = user?.role === "admin";

  // Carregar vereadores se for admin
  useEffect(() => {
    if (isAdmin) {
      loadVereadores();
    }
  }, [isAdmin]);

  const loadVereadores = async () => {
    try {
      setLoadingVereadores(true);
      const allUsers = await usersService.getAll();
      const vereadorsList = allUsers.filter(
        (u: User) => u.role === "vereador" && u.active
      );
      setVereadores(vereadorsList);
    } catch (error) {
      console.error("Erro ao carregar vereadores:", error);
    } finally {
      setLoadingVereadores(false);
    }
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    if (numbers.length <= 9)
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const formatDate = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
  };

  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, "");
    return numbers.length === 11;
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'Nome é obrigatório' });
      return false;
    }
    // CPF é opcional, mas se preenchido deve ser válido
    if (formData.cpf.trim() && !validateCPF(formData.cpf)) {
      showToast({ type: 'error', title: 'Erro', message: 'CPF inválido' });
      return false;
    }
    if (!formData.phone.trim()) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'Telefone é obrigatório' });
      return false;
    }
    if (!formData.email.trim()) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'Email é obrigatório' });
      return false;
    }
    if (!formData.region.trim()) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'Região é obrigatória' });
      return false;
    }
    if (!formData.votersGoal.trim()) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'Meta de eleitores é obrigatória' });
      return false;
    }
    // Admin deve selecionar um vereador
    if (isAdmin && !selectedVereador) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'Selecione o vereador responsável' });
      return false;
    }
    return true;
  };

  const selectVereador = (vereador: User) => {
    setSelectedVereador(vereador);
    setShowVereadorPicker(false);
  };

  const handleSubmit = async () => {
    console.log("AddLeader: handleSubmit called");

    if (!validateForm()) {
      console.log("AddLeader: validateForm failed");
      return;
    }

    console.log("AddLeader: validateForm passed, setting loading...");
    setLoading(true);
    try {
      // Determinar o vereadorId
      let vereadorId: string | undefined;
      if (isAdmin && selectedVereador) {
        vereadorId = selectedVereador.id;
      } else if (user?.role === "vereador") {
        vereadorId = user.id;
      } else if (user?.vereadorId) {
        vereadorId = user.vereadorId;
      }

      console.log("AddLeader: vereadorId determined =", vereadorId);

      const leaderData = {
        name: formData.name.trim(),
        cpf: formData.cpf,
        birthDate: formData.birthDate ? (() => {
          const [day, month, year] = formData.birthDate.split("/");
          return `${year}-${month}-${day}`;
        })() : undefined,
        phone: formData.phone,
        email: formData.email.trim().toLowerCase(),
        region: formData.region.trim(),
        votersGoal: parseInt(formData.votersGoal),
        active: true,
        vereadorId,
      };

      console.log("AddLeader: Calling addLeader with data =", leaderData);

      await addLeader(leaderData);

      console.log("AddLeader: addLeader SUCCESS!");

      // Desativar loading antes de mostrar toast
      setLoading(false);

      // Mostrar mensagem de sucesso e navegar
      showToast({ type: 'success', title: 'Sucesso', message: 'Liderança cadastrada com sucesso!' });
      setTimeout(() => {
        console.log("AddLeader: Navigating to manage-leaders");
        router.replace("/manage-leaders");
      }, 1500);
    } catch (error: any) {
      console.error("AddLeader: Error adding leader:", error);
      setLoading(false);
      const errorMessage = error.message || "Não foi possível cadastrar a liderança";
      showToast({ type: 'error', title: 'Erro', message: errorMessage });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Nova Liderança",
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
          {/* Campo de Vereador - Apenas para Admin */}
          {isAdmin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Vereador Responsável <Text style={styles.required}>*</Text>
              </Text>
              {loadingVereadores ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={Colors.light.primary} />
                  <Text style={styles.loadingText}>Carregando vereadores...</Text>
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.picker}
                    onPress={() => setShowVereadorPicker(!showVereadorPicker)}
                  >
                    <Text
                      style={[
                        styles.pickerText,
                        !selectedVereador && styles.pickerPlaceholder,
                      ]}
                    >
                      {selectedVereador?.name || "Selecione um vereador"}
                    </Text>
                    <ChevronDown color={Colors.light.textSecondary} size={20} />
                  </TouchableOpacity>

                  {showVereadorPicker && (
                    <View style={styles.pickerOptions}>
                      {vereadores.length === 0 ? (
                        <View style={styles.noOptionsContainer}>
                          <Text style={styles.noOptionsText}>
                            Nenhum vereador encontrado
                          </Text>
                        </View>
                      ) : (
                        <ScrollView style={{ maxHeight: 200 }}>
                          {vereadores.map((vereador) => (
                            <TouchableOpacity
                              key={vereador.id}
                              style={[
                                styles.pickerOption,
                                selectedVereador?.id === vereador.id && styles.pickerOptionSelected,
                              ]}
                              onPress={() => selectVereador(vereador)}
                            >
                              <Text style={styles.pickerOptionText}>{vereador.name}</Text>
                              <Text style={styles.pickerOptionSubtext}>{vereador.email}</Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  )}
                </>
              )}
            </View>
          )}

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
            <Text style={styles.label}>
              CPF (opcional)
            </Text>
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
            <Text style={styles.label}>
              Data de Nascimento (opcional)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={Colors.light.textSecondary}
              value={formData.birthDate}
              onChangeText={(value) =>
                setFormData({ ...formData, birthDate: formatDate(value) })
              }
              keyboardType="numeric"
              maxLength={10}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Telefone <Text style={styles.required}>*</Text>
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="email@exemplo.com"
              placeholderTextColor={Colors.light.textSecondary}
              value={formData.email}
              onChangeText={(value) => setFormData({ ...formData, email: value })}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Região/Área de Atuação <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Centro, Bairro São José"
              placeholderTextColor={Colors.light.textSecondary}
              value={formData.region}
              onChangeText={(value) => setFormData({ ...formData, region: value })}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Meta de Eleitores <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 100"
              placeholderTextColor={Colors.light.textSecondary}
              value={formData.votersGoal}
              onChangeText={(value) =>
                setFormData({ ...formData, votersGoal: value.replace(/\D/g, "") })
              }
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Cadastrar Liderança"
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
  footer: {
    marginTop: 32,
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 12,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
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
  pickerOptionSelected: {
    backgroundColor: Colors.light.primary + "10",
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
  noOptionsContainer: {
    padding: 16,
    alignItems: "center" as const,
  },
  noOptionsText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center" as const,
  },
});
