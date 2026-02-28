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
import {
  User,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Camera,
  Save,
  X,
  ChevronLeft,
} from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Button } from "@/components/UI";
import Colors from "@/constants/colors";
import { router } from "expo-router";
import { Stack } from "expo-router";

export default function ProfileScreen() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    cpf: user?.cpf || "",
    region: user?.region || "",
  });

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'O nome é obrigatório' });
      return;
    }

    if (!formData.email.trim()) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'O email é obrigatório' });
      return;
    }

    if (!formData.phone.trim()) {
      showToast({ type: 'error', title: 'Campo obrigatório', message: 'O telefone é obrigatório' });
      return;
    }

    setIsSaving(true);
    try {
      await updateUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
        region: formData.region,
      });

      showToast({ type: 'success', title: 'Sucesso', message: 'Perfil atualizado com sucesso!' });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast({ type: 'error', title: 'Erro', message: 'Não foi possível atualizar o perfil' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      cpf: user?.cpf || "",
      region: user?.region || "",
    });
    setIsEditing(false);
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    }
    return numbers.slice(0, 11);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
    return numbers.slice(0, 11);
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case "vereador":
        return "Vereador";
      case "admin":
        return "Administrador";
      case "lideranca":
        return "Liderança";
      case "assessor":
        return "Assessor";
      default:
        return "";
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: "Meu Perfil",
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: Platform.OS === "web" ? 0 : -8 }}
            >
              <ChevronLeft color={Colors.light.text} size={24} />
            </TouchableOpacity>
          ),
          headerRight: () =>
            !isEditing ? (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
            ) : null,
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User color={Colors.light.primary} size={48} />
            </View>
            {isEditing && (
              <TouchableOpacity style={styles.cameraButton}>
                <Camera color="#fff" size={16} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.roleLabel}>{getRoleLabel()}</Text>
          {user?.active && (
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Ativo</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Pessoais</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <User color={Colors.light.textSecondary} size={20} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Nome Completo</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  placeholder="Digite seu nome completo"
                  placeholderTextColor={Colors.light.textSecondary}
                />
              ) : (
                <Text style={styles.inputValue}>{user?.name}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Mail color={Colors.light.textSecondary} size={20} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Email</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  placeholder="Digite seu email"
                  placeholderTextColor={Colors.light.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.inputValue}>{user?.email}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <Phone color={Colors.light.textSecondary} size={20} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>Telefone</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phone: formatPhone(text) })
                  }
                  placeholder="(00) 00000-0000"
                  placeholderTextColor={Colors.light.textSecondary}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.inputValue}>{user?.phone}</Text>
              )}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputIcon}>
              <CreditCard color={Colors.light.textSecondary} size={20} />
            </View>
            <View style={styles.inputContent}>
              <Text style={styles.inputLabel}>CPF</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={formData.cpf}
                  onChangeText={(text) =>
                    setFormData({ ...formData, cpf: formatCPF(text) })
                  }
                  placeholder="000.000.000-00"
                  placeholderTextColor={Colors.light.textSecondary}
                  keyboardType="number-pad"
                />
              ) : (
                <Text style={styles.inputValue}>{user?.cpf}</Text>
              )}
            </View>
          </View>

          {(user?.role === "lideranca" || user?.region) && (
            <View style={styles.inputGroup}>
              <View style={styles.inputIcon}>
                <MapPin color={Colors.light.textSecondary} size={20} />
              </View>
              <View style={styles.inputContent}>
                <Text style={styles.inputLabel}>Região de Atuação</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={formData.region}
                    onChangeText={(text) =>
                      setFormData({ ...formData, region: text })
                    }
                    placeholder="Digite a região de atuação"
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                ) : (
                  <Text style={styles.inputValue}>
                    {user?.region || "Não informado"}
                  </Text>
                )}
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações do Sistema</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tipo de Usuário</Text>
            <Text style={styles.infoValue}>{getRoleLabel()}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Data de Cadastro</Text>
            <Text style={styles.infoValue}>
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString("pt-BR")
                : "-"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={styles.statusBadgeInline}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {user?.active ? "Ativo" : "Inativo"}
              </Text>
            </View>
          </View>
        </View>

        {isEditing && (
          <View style={styles.actions}>
            <Button
              title="Cancelar"
              onPress={handleCancel}
              variant="outline"
              size="large"
              icon={<X color={Colors.light.text} size={20} />}
              style={styles.actionButton}
            />
            <Button
              title="Salvar"
              onPress={handleSave}
              variant="primary"
              size="large"
              loading={isSaving}
              icon={<Save color="#fff" size={20} />}
              style={styles.actionButton}
            />
          </View>
        )}
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
    paddingBottom: 32,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  avatarSection: {
    alignItems: "center" as const,
    paddingVertical: 24,
  },
  avatarContainer: {
    position: "relative" as const,
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.light.card,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 3,
    borderColor: Colors.light.primary,
  },
  cameraButton: {
    position: "absolute" as const,
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.primary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 3,
    borderColor: Colors.light.backgroundSecondary,
  },
  roleLabel: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.primary,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.success + "20",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeInline: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.success + "20",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.success,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 16,
  },
  inputGroup: {
    flexDirection: "row" as const,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      },
    }),
  },
  inputIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 12,
  },
  inputContent: {
    flex: 1,
    justifyContent: "center" as const,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
    marginBottom: 4,
    textTransform: "uppercase" as const,
  },
  inputValue: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "500" as const,
  },
  input: {
    fontSize: 16,
    color: Colors.light.text,
    padding: 0,
    fontWeight: "500" as const,
  },
  infoRow: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      },
    }),
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  actions: {
    flexDirection: "row" as const,
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
});
