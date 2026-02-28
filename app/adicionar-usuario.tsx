import React, { useState, useEffect, useCallback, useRef } from "react";
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
} from "react-native";
import { useToast } from "@/contexts/ToastContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { ChevronDown, AlertCircle, CheckCircle } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { usersService, leadersService } from "@/services";
import { User, UserRole } from "@/types";
import Colors from "@/constants/colors";

export default function AdicionarUsuarioScreen() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showVereadorDropdown, setShowVereadorDropdown] = useState(false);
  const [vereadores, setVereadores] = useState<User[]>([]);
  const [loadingVereadores, setLoadingVereadores] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    cpf: "",
    phone: "",
    role: "assessor" as UserRole,
    region: "",
    city: "",
    state: "",
    vereadorId: "",
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

  // Estados para verificação de campos únicos
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [checkingCpf, setCheckingCpf] = useState(false);
  const [cpfExists, setCpfExists] = useState(false);
  const [cpfChecked, setCpfChecked] = useState(false);

  // Refs para debounce
  const emailTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const cpfTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função para verificar email com debounce
  const checkEmailDebounced = useCallback((email: string) => {
    // Limpar timeout anterior
    if (emailTimeoutRef.current) {
      clearTimeout(emailTimeoutRef.current);
    }

    // Reset estados
    setEmailChecked(false);
    setEmailExists(false);

    // Validação básica antes de fazer a requisição
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setCheckingEmail(false);
      return;
    }

    setCheckingEmail(true);

    // Debounce de 500ms
    emailTimeoutRef.current = setTimeout(async () => {
      try {
        const exists = await usersService.checkEmailExists(email);
        setEmailExists(exists);
        setEmailChecked(true);
        if (exists) {
          setErrors(prev => ({ ...prev, email: "Este email já está cadastrado" }));
        }
      } catch (error) {
        console.error("Erro ao verificar email:", error);
      } finally {
        setCheckingEmail(false);
      }
    }, 500);
  }, []);

  // Função para verificar CPF com debounce
  const checkCpfDebounced = useCallback((cpf: string) => {
    // Limpar timeout anterior
    if (cpfTimeoutRef.current) {
      clearTimeout(cpfTimeoutRef.current);
    }

    // Reset estados
    setCpfChecked(false);
    setCpfExists(false);

    // Remove formatação e valida
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11 || !validateCPF(cpf)) {
      setCheckingCpf(false);
      return;
    }

    setCheckingCpf(true);

    // Debounce de 500ms
    cpfTimeoutRef.current = setTimeout(async () => {
      try {
        const exists = await usersService.checkCpfExists(cleanCpf);
        setCpfExists(exists);
        setCpfChecked(true);
        if (exists) {
          setErrors(prev => ({ ...prev, cpf: "Este CPF já está cadastrado" }));
        }
      } catch (error) {
        console.error("Erro ao verificar CPF:", error);
      } finally {
        setCheckingCpf(false);
      }
    }, 500);
  }, []);

  // Limpar timeouts ao desmontar
  useEffect(() => {
    return () => {
      if (emailTimeoutRef.current) clearTimeout(emailTimeoutRef.current);
      if (cpfTimeoutRef.current) clearTimeout(cpfTimeoutRef.current);
    };
  }, []);

  // Todos os roles disponíveis
  const allRoles: { value: UserRole; label: string; description: string }[] = [
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
      value: "assessor",
      label: "Assessor",
      description: "Mesmo nível de acesso do vereador",
    },
    {
      value: "lideranca",
      label: "Liderança",
      description: "Gestão de eleitores da região",
    },
  ];

  // Filtra os roles que o usuário atual pode criar
  const roles = allRoles.filter((role) => {
    if (currentUser?.role === "admin") {
      // Admin pode criar qualquer tipo
      return true;
    } else if (currentUser?.role === "vereador" || currentUser?.role === "assessor") {
      // Vereador e Assessor só podem criar assessor e liderança
      return role.value === "assessor" || role.value === "lideranca";
    }
    return false;
  });

  // Carrega a lista de vereadores quando o role muda para assessor ou lideranca
  // Somente admin precisa selecionar vereador, pois vereador/assessor criam vinculado a si
  useEffect(() => {
    if ((formData.role === "assessor" || formData.role === "lideranca") && currentUser?.role === "admin") {
      loadVereadores();
    }
  }, [formData.role, currentUser?.role]);

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
  // Somente admin precisa selecionar - vereador e assessor já vinculam automaticamente
  const needsVereadorSelection =
    (formData.role === "assessor" || formData.role === "lideranca") &&
    currentUser?.role === "admin";

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    } else if (emailExists) {
      newErrors.email = "Este email já está cadastrado";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem";
    }

    // CPF é opcional, mas se preenchido deve ser válido
    if (formData.cpf.trim() && !validateCPF(formData.cpf)) {
      newErrors.cpf = "CPF inválido";
    } else if (formData.cpf.trim() && cpfExists) {
      newErrors.cpf = "Este CPF já está cadastrado";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefone é obrigatório";
    }

    // Validar vereador para assessor e lideranca (somente admin precisa selecionar)
    if (
      (formData.role === "assessor" || formData.role === "lideranca") &&
      currentUser?.role === "admin" &&
      !formData.vereadorId
    ) {
      newErrors.vereadorId = "Selecione o vereador responsável";
    }

    // Validar cidade para vereador (necessário para o mapa de calor)
    if (formData.role === "vereador" && !formData.city.trim()) {
      newErrors.city = "Cidade de atuação é obrigatória para vereadores";
    }

    if (formData.role === "vereador" && !formData.state) {
      newErrors.state = "Estado é obrigatório para vereadores";
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

    try {
      setIsLoading(true);

      const userData: any = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        cpf: formData.cpf.replace(/\D/g, ""),
        phone: formData.phone.replace(/\D/g, ""),
        role: formData.role,
        region: formData.region.trim() || undefined,
      };

      // Adicionar vereadorId para assessor e lideranca (somente quando admin seleciona)
      // Vereador e assessor não precisam enviar - o backend vincula automaticamente
      if (
        (formData.role === "assessor" || formData.role === "lideranca") &&
        currentUser?.role === "admin" &&
        formData.vereadorId
      ) {
        userData.vereadorId = formData.vereadorId;
      }

      // Adicionar cidade e estado para vereador (necessário para mapa de calor)
      if (formData.role === "vereador") {
        userData.city = formData.city.trim();
        userData.state = formData.state;
      }

      const newUser = await usersService.create(userData);

      // Se o usuário for uma liderança, criar também o registro de liderança
      if (formData.role === "lideranca") {
        try {
          await leadersService.create({
            name: userData.name,
            cpf: userData.cpf,
            phone: userData.phone,
            email: userData.email,
            region: userData.region || "Região não informada",
            votersGoal: 0, // Meta inicial padrão
            active: true,
            userId: newUser.id, // Vincular ao usuário criado
          });
          console.log("Registro de liderança criado automaticamente para o usuário:", newUser.id);
        } catch (leaderError) {
          console.error("Erro ao criar registro de liderança automático:", leaderError);
          // Não falhar o cadastro do usuário se falhar a criação da liderança,
          // pois o fix no leaders.service.ts já trata a exibição.
          // Apenas logar o erro.
        }
      }

      showToast({ title: 'Sucesso', message: 'Usuário criado com sucesso!', type: 'success' });
      setTimeout(() => {
        router.back();
      }, 1000);
    } catch (error: any) {
      showToast({
        title: 'Erro',
        message: error.response?.data?.message || 'Não foi possível criar o usuário',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
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
    } = {}
  ) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, errors[field] && styles.inputError]}
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
        editable={!isLoading}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

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
            <Text style={styles.title}>Novo Usuário</Text>
            <Text style={styles.subtitle}>
              Preencha os dados para criar um novo usuário no sistema
            </Text>
          </View>

          <View style={styles.form}>
            {renderInput("Nome Completo *", "name", "Digite o nome completo")}

            {/* Campo de Email com validação em tempo real */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={[
                    styles.input,
                    styles.inputFlex,
                    errors.email && styles.inputError,
                    emailChecked && !emailExists && styles.inputSuccess,
                  ]}
                  placeholder="exemplo@email.com"
                  placeholderTextColor="#9ca3af"
                  value={formData.email}
                  onChangeText={(text) => {
                    setFormData({ ...formData, email: text });
                    if (errors.email) {
                      setErrors({ ...errors, email: "" });
                    }
                    checkEmailDebounced(text);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                {checkingEmail && (
                  <View style={styles.inputIconContainer}>
                    <ActivityIndicator size="small" color={Colors.light.primary} />
                  </View>
                )}
                {!checkingEmail && emailChecked && !emailExists && (
                  <View style={styles.inputIconContainer}>
                    <CheckCircle size={20} color="#22c55e" />
                  </View>
                )}
                {!checkingEmail && emailExists && (
                  <View style={styles.inputIconContainer}>
                    <AlertCircle size={20} color="#dc2626" />
                  </View>
                )}
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              {!errors.email && emailChecked && !emailExists && (
                <Text style={styles.successText}>Email disponível</Text>
              )}
            </View>

            {/* Campo de CPF com validação em tempo real */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CPF (opcional)</Text>
              <View style={styles.inputWithIcon}>
                <TextInput
                  style={[
                    styles.input,
                    styles.inputFlex,
                    errors.cpf && styles.inputError,
                    cpfChecked && !cpfExists && styles.inputSuccess,
                  ]}
                  placeholder="000.000.000-00"
                  placeholderTextColor="#9ca3af"
                  value={formData.cpf}
                  onChangeText={(text) => {
                    const formattedCpf = formatCPF(text);
                    setFormData({ ...formData, cpf: formattedCpf });
                    if (errors.cpf) {
                      setErrors({ ...errors, cpf: "" });
                    }
                    checkCpfDebounced(formattedCpf);
                  }}
                  keyboardType="numeric"
                  editable={!isLoading}
                />
                {checkingCpf && (
                  <View style={styles.inputIconContainer}>
                    <ActivityIndicator size="small" color={Colors.light.primary} />
                  </View>
                )}
                {!checkingCpf && cpfChecked && !cpfExists && (
                  <View style={styles.inputIconContainer}>
                    <CheckCircle size={20} color="#22c55e" />
                  </View>
                )}
                {!checkingCpf && cpfExists && (
                  <View style={styles.inputIconContainer}>
                    <AlertCircle size={20} color="#dc2626" />
                  </View>
                )}
              </View>
              {errors.cpf && <Text style={styles.errorText}>{errors.cpf}</Text>}
              {!errors.cpf && cpfChecked && !cpfExists && (
                <Text style={styles.successText}>CPF disponível</Text>
              )}
            </View>

            {renderInput("Telefone *", "phone", "(00) 00000-0000", {
              keyboardType: "phone-pad",
              formatter: formatPhone,
            })}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Perfil de Acesso *</Text>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setShowRoleDropdown(!showRoleDropdown)}
                disabled={isLoading}
              >
                <View>
                  <Text style={styles.dropdownText}>
                    {roles.find((r) => r.value === formData.role)?.label}
                  </Text>
                  <Text style={styles.dropdownDescription}>
                    {roles.find((r) => r.value === formData.role)?.description}
                  </Text>
                </View>
                <ChevronDown size={20} color="#6b7280" />
              </TouchableOpacity>

              {showRoleDropdown && (
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
                      disabled={isLoading}
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
                    editable={!isLoading}
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
                    disabled={isLoading}
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

            {renderInput("Senha *", "password", "Mínimo 6 caracteres", {
              secureTextEntry: true,
            })}

            {renderInput(
              "Confirmar Senha *",
              "confirmPassword",
              "Digite a senha novamente",
              {
                secureTextEntry: true,
              }
            )}

            <View style={styles.info}>
              <Text style={styles.infoText}>
                * Campos obrigatórios
              </Text>
              <Text style={styles.infoText}>
                O usuário receberá as credenciais de acesso por email
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Criar Usuário</Text>
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
  inputSuccess: {
    borderColor: "#22c55e",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
  },
  inputFlex: {
    flex: 1,
  },
  inputIconContainer: {
    position: "absolute",
    right: 12,
    height: "100%",
    justifyContent: "center",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    marginTop: 4,
  },
  successText: {
    color: "#22c55e",
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
  info: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#1e40af",
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
