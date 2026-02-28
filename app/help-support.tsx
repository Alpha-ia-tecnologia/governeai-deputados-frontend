import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput,
  Linking,
} from "react-native";
import {
  HelpCircle,
  BookOpen,
  Mail,
  Phone,
  MessageCircle,
  ChevronRight,
  ChevronDown,
  Send,
  ExternalLink,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import { Stack } from "expo-router";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Como adicionar um novo eleitor?",
    answer:
      "Para adicionar um novo eleitor, vá até a aba 'Eleitores' e clique no botão '+' no canto superior direito. Preencha as informações necessárias como nome, telefone, endereço e clique em 'Salvar'.",
  },
  {
    question: "Como registrar uma visita ou ajuda?",
    answer:
      "Na tela de detalhes do eleitor, você encontrará botões para 'Adicionar Visita' e 'Adicionar Ajuda'. Clique no botão desejado, preencha os detalhes e confirme o registro.",
  },
  {
    question: "Como gerenciar lideranças?",
    answer:
      "Acesse 'Configurações' > 'Meu Perfil' > 'Gerenciar Lideranças'. Lá você pode adicionar novas lideranças, editar informações ou remover lideranças existentes.",
  },
  {
    question: "Como criar um projeto de lei?",
    answer:
      "Vá até a aba 'Projetos' e clique no botão '+'. Preencha o número do projeto, título, descrição, data e status. Você também pode adicionar emendas ao projeto.",
  },
  {
    question: "Como visualizar a agenda?",
    answer:
      "A aba 'Agenda' mostra todas as sessões legislativas programadas. Você pode visualizar detalhes de cada sessão, incluindo pautas e votações.",
  },
  {
    question: "Como alterar as preferências do sistema?",
    answer:
      "Acesse 'Configurações' > 'Preferências do Sistema' para personalizar notificações, tema, idioma e outras configurações do aplicativo.",
  },
  {
    question: "Como exportar dados?",
    answer:
      "Nas respectivas telas (Eleitores, Projetos, etc.), procure pela opção de exportar. Você pode exportar dados em formato CSV ou PDF.",
  },
  {
    question: "O que fazer se esquecer a senha?",
    answer:
      "Na tela de login, clique em 'Esqueci minha senha'. Você receberá instruções por e-mail para redefinir sua senha.",
  },
];

export default function HelpSupportScreen() {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactMessage, setContactMessage] = useState("");
  const [contactSubject, setContactSubject] = useState("");

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleSendMessage = () => {
    if (!contactSubject.trim() || !contactMessage.trim()) {
      return;
    }
    console.log("Enviando mensagem:", { contactSubject, contactMessage });
    setContactMessage("");
    setContactSubject("");
  };

  const openEmail = () => {
    Linking.openURL("mailto:suporte@sistemagestao.com.br");
  };

  const openPhone = () => {
    Linking.openURL("tel:+558632220000");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Ajuda e Suporte",
          headerStyle: {
            backgroundColor: Colors.light.card,
          },
          headerTintColor: Colors.light.text,
        }}
      />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <HelpCircle color={Colors.light.primary} size={32} />
          </View>
          <Text style={styles.headerTitle}>Central de Ajuda</Text>
          <Text style={styles.headerDescription}>
            Encontre respostas para suas dúvidas ou entre em contato conosco
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perguntas Frequentes</Text>
          {faqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={styles.faqItem}
              onPress={() => toggleFAQ(index)}
            >
              <View style={styles.faqHeader}>
                <BookOpen
                  color={Colors.light.primary}
                  size={20}
                  style={styles.faqIcon}
                />
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                {expandedFAQ === index ? (
                  <ChevronDown color={Colors.light.textSecondary} size={20} />
                ) : (
                  <ChevronRight color={Colors.light.textSecondary} size={20} />
                )}
              </View>
              {expandedFAQ === index && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Canais de Contato</Text>

          <TouchableOpacity style={styles.contactCard} onPress={openEmail}>
            <View style={styles.contactIcon}>
              <Mail color={Colors.light.primary} size={24} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>E-mail</Text>
              <Text style={styles.contactDescription}>
                suporte@sistemagestao.com.br
              </Text>
            </View>
            <ExternalLink color={Colors.light.textSecondary} size={20} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactCard} onPress={openPhone}>
            <View style={styles.contactIcon}>
              <Phone color={Colors.light.primary} size={24} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Telefone</Text>
              <Text style={styles.contactDescription}>
                (86) 3222-0000
              </Text>
              <Text style={styles.contactHours}>
                Seg-Sex: 8h às 18h
              </Text>
            </View>
            <ExternalLink color={Colors.light.textSecondary} size={20} />
          </TouchableOpacity>

          <View style={styles.contactCard}>
            <View style={styles.contactIcon}>
              <MessageCircle color={Colors.light.primary} size={24} />
            </View>
            <View style={styles.contactContent}>
              <Text style={styles.contactTitle}>Chat Online</Text>
              <Text style={styles.contactDescription}>
                Disponível em breve
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Enviar Mensagem</Text>
          <View style={styles.messageForm}>
            <TextInput
              style={styles.input}
              placeholder="Assunto"
              placeholderTextColor={Colors.light.textSecondary}
              value={contactSubject}
              onChangeText={setContactSubject}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Digite sua mensagem..."
              placeholderTextColor={Colors.light.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={contactMessage}
              onChangeText={setContactMessage}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!contactSubject.trim() || !contactMessage.trim()) &&
                  styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!contactSubject.trim() || !contactMessage.trim()}
            >
              <Send color="#fff" size={20} />
              <Text style={styles.sendButtonText}>Enviar Mensagem</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Sistema de Gestão - Parnaíba
          </Text>
          <Text style={styles.footerText}>Versão 1.0.0</Text>
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
  header: {
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 24,
    alignItems: "center" as const,
    marginBottom: 24,
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
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: "center" as const,
  },
  headerDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center" as const,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  faqItem: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
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
  faqHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  faqIcon: {
    marginRight: 12,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  faqAnswer: {
    marginTop: 12,
    marginLeft: 32,
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  contactCard: {
    flexDirection: "row" as const,
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
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginRight: 16,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  contactHours: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontStyle: "italic" as const,
  },
  messageForm: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
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
  input: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textArea: {
    minHeight: 120,
  },
  sendButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    padding: 14,
    gap: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  footer: {
    alignItems: "center" as const,
    paddingVertical: 24,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
});