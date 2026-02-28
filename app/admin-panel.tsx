import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useToast } from '@/contexts/ToastContext';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function AdminPanelScreen() {
  const { user, register } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    cpf: '',
    phone: '',
    role: 'vereador',
    region: '',
  });

  // Redirecionar se não for admin
  if (user?.role !== 'admin') {
    router.back();
    return null;
  }

  const handleSubmit = async () => {
    // Validações
    if (!formData.name || !formData.email || !formData.password || !formData.cpf || !formData.phone) {
      showToast({ title: 'Erro', message: 'Por favor, preencha todos os campos obrigatórios', type: 'error' });
      return;
    }

    if (formData.password.length < 6) {
      showToast({ title: 'Erro', message: 'A senha deve ter no mínimo 6 caracteres', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await register(formData);

      if (response) {
        showToast({ title: 'Sucesso', message: 'Usuário cadastrado com sucesso!', type: 'success' });
        // Limpar formulário
        setFormData({
          name: '',
          email: '',
          password: '',
          cpf: '',
          phone: '',
          role: 'vereador',
          region: '',
        });
      }
    } catch (error: any) {
      showToast({ title: 'Erro', message: error.message || 'Erro ao cadastrar usuário', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft color={Colors.light.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Painel de Administração</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <UserPlus color={Colors.light.primary} size={24} />
            <Text style={styles.sectionTitle}>Cadastrar Novo Usuário</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>
              Nome Completo <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do usuário"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              editable={!isLoading}
            />

            <Text style={styles.label}>
              E-mail <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="email@exemplo.com"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            <Text style={styles.label}>
              Senha <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              editable={!isLoading}
            />

            <Text style={styles.label}>
              CPF <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="000.000.000-00"
              value={formData.cpf}
              onChangeText={(text) => setFormData({ ...formData, cpf: text })}
              keyboardType="numeric"
              editable={!isLoading}
            />

            <Text style={styles.label}>
              Telefone <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="(00) 00000-0000"
              value={formData.phone}
              onChangeText={(text) => setFormData({ ...formData, phone: text })}
              keyboardType="phone-pad"
              editable={!isLoading}
            />

            <Text style={styles.label}>Tipo de Usuário</Text>
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  formData.role === 'vereador' && styles.roleOptionSelected,
                ]}
                onPress={() => setFormData({ ...formData, role: 'vereador' })}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.roleText,
                    formData.role === 'vereador' && styles.roleTextSelected,
                  ]}
                >
                  Vereador
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleOption,
                  formData.role === 'assessor' && styles.roleOptionSelected,
                ]}
                onPress={() => setFormData({ ...formData, role: 'assessor' })}
                disabled={isLoading}
              >
                <Text
                  style={[
                    styles.roleText,
                    formData.role === 'assessor' && styles.roleTextSelected,
                  ]}
                >
                  Assessor
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Região</Text>
            <TextInput
              style={styles.input}
              placeholder="Região de atuação"
              value={formData.region}
              onChangeText={(text) => setFormData({ ...formData, region: text })}
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Cadastrar Usuário</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
    marginLeft: 12,
  },
  form: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
    marginTop: 12,
  },
  required: {
    color: Colors.light.error,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  roleOptionSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  roleTextSelected: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
