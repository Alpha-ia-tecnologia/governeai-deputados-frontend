import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import { useToast } from "@/contexts/ToastContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import { ChevronDown } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { usersService } from "@/services";
import { User, UserRole } from "@/types";
import Colors from "@/constants/colors";

export default function EditarUsuarioScreen() {
  const { userId } = useLocalSearchParams();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showVereadorDropdown, setShowVereadorDropdown] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [vereadores, setVereadores] = useState<User[]>([]);
  const [loadingVereadores, setLoadingVereadores] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    cpf: "",
    phone: "",
    role: "assessor" as UserRole,
    region: "",
    city: "",
    state: "",
    vereadorId: "",
    active: true,
    password: "",
    confirmPassword: "",
  });

  const [showStateDropdown, setShowStateDropdown] = useState(false);

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

  const [errors, setErrors] = useState<Record<string, string>>({});

  const roles: { value: UserRole; label: string; description: string }[] = [
    {
      value: "admin",
      label: "Administrador",
      description: "Acesso total ao sistema",
    },
    {
      value: "vereador",
      label: "Vereador",
      description: "Gestão de projetos e emendas",
    },
    {
      value: "lideranca",
      label: "Liderança",
      description: "Gestão de eleitores da região",
    },
    {
      value: "assessor",
      label: "Assessor",
      description: "Suporte e atendimentos",
    },
  ];

  useEffect(() => {
    loadUser();
  }, [userId]);

  // Carrega a lista de vereadores quando o role muda para assessor ou lideranca
  useEffect(() => {
    if (formData.role === "assessor" || formData.role === "lideranca") {
      loadVereadores();
    }
  }, [formData.role]);

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

  // Verifica se precisa mostrar o seletor de vereador
  const needsVereadorSelection = formData.role === "assessor" || formData.role === "lideranca";

  const loadUser = async () => {
    if (!userId) {
      showToast({ title: 'Erro', message: 'ID do usuário não encontrado', type: 'error' });
      router.back();
      return;
    }

    try {
      setIsLoading(true);
      const userData = await usersService.getById(userId as string);
      setUser(userData);
      setFormData({
        name: userData.name,
        email: userData.email,
        cpf: formatCPF(userData.cpf),
        phone: formatPhone(userData.phone),
        role: userData.role,
        region: userData.region || "",
        city: userData.city || "",
        state: userData.state || "",
        vereadorId: userData.vereadorId || "",
        active: userData.active,
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      showToast({ title: 'Erro', message: 'Não foi possível carregar os dados do usuário', type: 'error' });
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    // CPF é opcional, mas se preenchido deve ser válido
    if (formData.cpf.trim() && !validateCPF(formData.cpf)) {
      newErrors.cpf = "CPF inválido";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório";
    }

    // Validar vereador para assessor e lideranca
    if ((formData.role === "assessor" || formData.role === "lideranca") && !formData.vereadorId) {
      newErrors.vereadorId = "Selecione o vereador responsável";
    }

    // Validar cidade para vereador (necessário para o mapa de calor)
    if (formData.role === "vereador" && !formData.city.trim()) {
      newErrors.city = "Cidade de atuação é obrigatória para vereadores";
    }

    if (formData.role === "vereador" && !formData.state) {
      newErrors.state = "Estado é obrigatório para vereadores";
    }

    // Validar senha apenas se estiver sendo alterada
    if (showPasswordSection) {
      if (!formData.password) {
        newErrors.password = "Senha é obrigatória";
      } else if (formData.password.length < 6) {
        newErrors.password = "Senha deve ter pelo menos 6 caracteres";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "As senhas não coincidem";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCPF = (cpf: string) => {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, "");

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpf)) return false;

    // Validação dos dígitos verificadores
    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;

    return true;
  };

  const formatCPF = (text: string) => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, "");

    // Limita a 11 dígitos
    const cpf = numbers.substring(0, 11);

    // Aplica a máscara
    if (cpf.length <= 3) {
      return cpf;
    } else if (cpf.length <= 6) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
    } else if (cpf.length <= 9) {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
    } else {
      return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
    }
  };

  const formatPhone = (text: string) => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, "");

    // Limita a 11 dígitos
    const phone = numbers.substring(0, 11);

    // Aplica a máscara
    if (phone.length <= 2) {
      return phone;
    } else if (phone.length <= 7) {
      return `(${phone.slice(0, 2)}) ${phone.slice(2)}`;
    } else if (phone.length <= 10) {
      return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
    } else {
      return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast({ title: 'Erro', message: 'Por favor, corrija os erros no formulário', type: 'error' });
      return;
    }

    if (!userId) return;

    try {
      setIsSaving(true);

      const updateData: any = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        cpf: formData.cpf.replace(/\D/g, ""),
        phone: formData.phone.replace(/\D/g, ""),
        role: formData.role,
        region: formData.region.trim() || undefined,
        active: formData.active,
      };

      // Adicionar vereadorId para assessor e lideranca
      if (formData.role === "assessor" || formData.role === "lideranca") {
        updateData.vereadorId = formData.vereadorId;
      } else {
        // Limpar vereadorId para outros perfis
        updateData.vereadorId = null;
      }

      // Adicionar cidade e estado para vereador (necessário para mapa de calor)
      if (formData.role === "vereador") {
        updateData.city = formData.city.trim();
        updateData.state = formData.state;
      }

      // Adicionar senha apenas se estiver sendo alterada
      if (showPasswordSection && formData.password) {
        updateData.password = formData.password;
      }

      await usersService.update(userId as string, updateData);

      // Voltar para a tela anterior
      showToast({ title: 'Sucesso', message: 'Usuário atualizado com sucesso!', type: 'success' });
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error: any) {
      showToast({
        title: 'Erro',
        message: error.response?.data?.message || 'Não foi possível atualizar o usuário',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const renderInput = (
    label: string,
    field: keyof typeof formData,
    placeholder: string,
    options: {
      secureTextEntry?: boolean;
      keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
      autoCapitalize?: "none" | "sentences" | "words" | "characters";
      formatter?: (text: string) => string;
      editable?: boolean;
    } = {}
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          errors[field] && styles.inputError,
          options.editable === false && styles.inputDisabled,
        ]}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        value={formData[field]}
        onChangeText={(text) => {
          const formattedText = options.formatter ? options.formatter(text) : text;
          setFormData({ ...formData, [field]: formattedText });
          if (errors[field]) {
            setErrors({ ...errors, [field]: "" });
          }
        }}
        secureTextEntry={options.secureTextEntry}
        keyboardType={options.keyboardType}
        autoCapitalize={options.autoCapitalize}
        editable={options.editable !== false && !isSaving}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Carregando dados do usuário...</Text>
      </View>
    );
  }

  const isEditingSelf = userId === currentUser?.id;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Editar Usuário</Text>
            <Text style={styles.subtitle}>
              Atualize os dados do usuário {user?.name}
            </Text>
          </View>

          {isEditingSelf && (
            <View style={styles.warning}>
              <Text style={styles.warningText}>
                Você está editando seu próprio perfil. Algumas opções podem estar desabilitadas.
              </Text>
            </View>
          )}

          <View style={styles.form}>
            {renderInput("Nome Completo", "name", "Digite o nome completo")}

            {renderInput("Email", "email", "exemplo@email.com", {
              keyboardType: "email-address",
              autoCapitalize: "none",
            })}

            {renderInput("CPF", "cpf", "000.000.000-00", {
              keyboardType: "numeric",
              formatter: formatCPF,
            })}

            {renderInput("Telefone", "phone", "(00) 00000-0000", {
              keyboardType: "phone-pad",
              formatter: formatPhone,
            })}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Perfil de Acesso</Text>
              <TouchableOpacity
                style={[
                  styles.dropdown,
                  isEditingSelf && styles.dropdownDisabled,
                ]}
                onPress={() => !isEditingSelf && setShowRoleDropdown(!showRoleDropdown)}
                disabled={isSaving || isEditingSelf}
              >
                <View>
                  <Text style={styles.dropdownText}>
                    {roles.find((r) => r.value === formData.role)?.label}
                  </Text>
                  <Text style={styles.dropdownDescription}>
                    {roles.find((r) => r.value === formData.role)?.description}
                  </Text>
                </View>
                <ChevronDown size={20} color={isEditingSelf ? "#ccc" : "#6b7280"} />
              </TouchableOpacity>

              {showRoleDropdown && !isEditingSelf && (
                <View style={styles.dropdownOptions}>
                  {roles.map((role) => (
                    <TouchableOpacity
                      key={role.value}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setFormData({ ...formData, role: role.value, vereadorId: "" });
                        setShowRoleDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownOptionText}>
                        {role.label}
                      </Text>
                      <Text style={styles.dropdownOptionDescription}>
                        {role.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Seletor de Vereador para assessor e liderança */}
            {needsVereadorSelection && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Vereador Responsável *</Text>
                {loadingVereadores ? (
                  <View style={styles.loadingVereadores}>
                    <ActivityIndicator size="small" color={Colors.light.primary} />
                    <Text style={styles.loadingVereadoresText}>Carregando vereadores...</Text>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[
                        styles.dropdown,
                        errors.vereadorId && styles.dropdownError,
                      ]}
                      onPress={() => setShowVereadorDropdown(!showVereadorDropdown)}
                      disabled={isSaving}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[
                          styles.dropdownText,
                          !formData.vereadorId && styles.dropdownPlaceholder
                        ]}>
                          {formData.vereadorId
                            ? vereadores.find((v) => v.id === formData.vereadorId)?.name || "Vereador não encontrado"
                            : "Selecione o vereador"}
                        </Text>
                      </View>
                      <ChevronDown size={20} color="#6b7280" />
                    </TouchableOpacity>

                    {showVereadorDropdown && (
                      <View style={styles.dropdownOptions}>
                        {vereadores.length === 0 ? (
                          <View style={styles.dropdownOption}>
                            <Text style={styles.dropdownOptionDescription}>
                              Nenhum vereador cadastrado
                            </Text>
                          </View>
                        ) : (
                          vereadores.map((vereador) => (
                            <TouchableOpacity
                              key={vereador.id}
                              style={[
                                styles.dropdownOption,
                                formData.vereadorId === vereador.id && styles.dropdownOptionSelected,
                              ]}
                              onPress={() => {
                                setFormData({ ...formData, vereadorId: vereador.id });
                                setShowVereadorDropdown(false);
                                if (errors.vereadorId) {
                                  setErrors({ ...errors, vereadorId: "" });
                                }
                              }}
                            >
                              <Text style={[
                                styles.dropdownOptionText,
                                formData.vereadorId === vereador.id && styles.dropdownOptionTextSelected,
                              ]}>
                                {vereador.name}
                              </Text>
                              <Text style={styles.dropdownOptionDescription}>
                                {vereador.email}
                              </Text>
                            </TouchableOpacity>
                          ))
                        )}
                      </View>
                    )}
                  </>
                )}
                {errors.vereadorId && (
                  <Text style={styles.errorText}>{errors.vereadorId}</Text>
                )}
              </View>
            )}

            {/* Campos de cidade e estado para vereador */}
            {formData.role === "vereador" && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Cidade de Atuação *</Text>
                  <TextInput
                    style={[styles.input, errors.city && styles.inputError]}
                    placeholder="Digite a cidade onde atua"
                    placeholderTextColor="#9ca3af"
                    value={formData.city}
                    onChangeText={(text) => {
                      setFormData({ ...formData, city: text });
                      if (errors.city) {
                        setErrors({ ...errors, city: "" });
                      }
                    }}
                    editable={!isSaving}
                  />
                  {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
                  <Text style={styles.helperText}>
                    A cidade será usada para centralizar o mapa de calor dos eleitores
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Estado *</Text>
                  <TouchableOpacity
                    style={[styles.dropdown, errors.state && styles.dropdownError]}
                    onPress={() => setShowStateDropdown(!showStateDropdown)}
                    disabled={isSaving}
                  >
                    <Text style={[
                      styles.dropdownText,
                      !formData.state && styles.dropdownPlaceholder
                    ]}>
                      {formData.state
                        ? ESTADOS_BR.find((e) => e.uf === formData.state)?.nome || formData.state
                        : "Selecione o estado"}
                    </Text>
                    <ChevronDown size={20} color="#6b7280" />
                  </TouchableOpacity>

                  {showStateDropdown && (
                    <ScrollView style={styles.stateDropdownScroll}>
                      <View style={styles.dropdownOptions}>
                        {ESTADOS_BR.map((estado) => (
                          <TouchableOpacity
                            key={estado.uf}
                            style={[
                              styles.dropdownOption,
                              formData.state === estado.uf && styles.dropdownOptionSelected,
                            ]}
                            onPress={() => {
                              setFormData({ ...formData, state: estado.uf });
                              setShowStateDropdown(false);
                              if (errors.state) {
                                setErrors({ ...errors, state: "" });
                              }
                            }}
                          >
                            <Text style={[
                              styles.dropdownOptionText,
                              formData.state === estado.uf && styles.dropdownOptionTextSelected,
                            ]}>
                              {estado.uf} - {estado.nome}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  )}
                  {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}
                </View>
              </>
            )}

            {(formData.role === "lideranca" || formData.role === "vereador") &&
              renderInput(
                "Região",
                "region",
                "Digite a região de atuação (opcional)"
              )}

            <View style={styles.inputGroup}>
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.label}>Status do Usuário</Text>
                  <Text style={styles.switchDescription}>
                    {formData.active ? "Usuário ativo no sistema" : "Usuário desativado"}
                  </Text>
                </View>
                <Switch
                  value={formData.active}
                  onValueChange={(value) => setFormData({ ...formData, active: value })}
                  disabled={isSaving || isEditingSelf}
                  trackColor={{ false: "#e5e7eb", true: "#86efac" }}
                  thumbColor={formData.active ? "#16a34a" : "#f3f4f6"}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.passwordToggle}
              onPress={() => setShowPasswordSection(!showPasswordSection)}
            >
              <Text style={styles.passwordToggleText}>
                {showPasswordSection ? "Cancelar alteração de senha" : "Alterar senha"}
              </Text>
            </TouchableOpacity>

            {showPasswordSection && (
              <>
                {renderInput("Nova Senha", "password", "Mínimo 6 caracteres", {
                  secureTextEntry: true,
                })}

                {renderInput(
                  "Confirmar Nova Senha",
                  "confirmPassword",
                  "Digite a senha novamente",
                  {
                    secureTextEntry: true,
                  }
                )}
              </>
            )}

            <View style={styles.info}>
              <Text style={styles.infoText}>
                Última atualização: {new Date(user?.updatedAt || "").toLocaleDateString("pt-BR")}
              </Text>
              <Text style={styles.infoText}>
                Criado em: {new Date(user?.createdAt || "").toLocaleDateString("pt-BR")}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={isSaving}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, isSaving && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Salvar Alterações</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#6b7280",
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  warning: {
    backgroundColor: "#fef3c7",
    borderWidth: 1,
    borderColor: "#fbbf24",
    margin: 20,
    marginBottom: 0,
    padding: 12,
    borderRadius: 8,
  },
  warningText: {
    color: "#92400e",
    fontSize: 14,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  inputError: {
    borderColor: "#dc2626",
  },
  inputDisabled: {
    backgroundColor: "#f3f4f6",
    color: "#9ca3af",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    marginTop: 4,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownDisabled: {
    backgroundColor: "#f3f4f6",
  },
  dropdownText: {
    fontSize: 16,
    color: "#1f2937",
  },
  dropdownDescription: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  dropdownOptions: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    marginTop: 8,
    overflow: "hidden",
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  dropdownOptionText: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
  },
  dropdownOptionDescription: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  dropdownError: {
    borderColor: "#dc2626",
  },
  dropdownPlaceholder: {
    color: "#9ca3af",
  },
  dropdownOptionSelected: {
    backgroundColor: "#f0f9ff",
  },
  dropdownOptionTextSelected: {
    color: Colors.light.primary,
  },
  loadingVereadores: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
  },
  loadingVereadoresText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#6b7280",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchDescription: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  passwordToggle: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  passwordToggleText: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: "500",
  },
  info: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  actions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  stateDropdownScroll: {
    maxHeight: 200,
  },
});
