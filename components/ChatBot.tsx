import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { MessageCircle, X, Send } from "lucide-react-native";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import Colors from "@/constants/colors";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Olá! Sou o assistente virtual do Sistema de Gestão para Vereadores de Parnaíba. Como posso ajudá-lo hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();
  const { voters, leaders, helpRecords, visits } = useData();

  const getSystemContext = () => {
    return `Você é um assistente virtual do Sistema de Gestão para Vereadores de Parnaíba. 
    
Informações do sistema:
- Usuário atual: ${user?.name || "Não autenticado"} (${user?.role || "N/A"})
- Total de eleitores cadastrados: ${voters.length}
- Total de lideranças: ${leaders.length}
- Total de atendimentos: ${helpRecords.length}
- Total de visitas: ${visits.length}

Módulos disponíveis no sistema:
1. Gestão de Eleitores - cadastro, edição e visualização de eleitores
2. Gestão de Lideranças - gerenciamento de lideranças políticas
3. Histórico de Ajuda - registro de atendimentos realizados
4. Visitas - registro de visitas às comunidades
5. Projetos de Lei - gerenciamento de projetos legislativos
6. Emendas - acompanhamento de emendas parlamentares
7. Solicitações ao Executivo - registro de ofícios e requerimentos
8. Agenda - gestão de compromissos e eventos
9. Relatórios - dashboards e relatórios gerenciais

Você deve responder perguntas sobre como usar o sistema, explicar funcionalidades, fornecer informações sobre dados cadastrados e ajudar com dúvidas em português do Brasil.`;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer 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",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              {
                role: "system",
                content: getSystemContext(),
              },
              ...messages.map((m) => ({
                role: m.role,
                content: m.content,
              })),
              {
                role: "user",
                content: userMessage.content,
              },
            ],
            max_tokens: 500,
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro na API");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          data.choices[0]?.message?.content ||
          "Desculpe, não consegui processar sua solicitação.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <MessageCircle color="#fff" size={28} />
      </TouchableOpacity>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.chatContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <View style={styles.chatHeader}>
        <View style={styles.headerContent}>
          <MessageCircle color="#fff" size={24} />
          <Text style={styles.headerTitle}>Assistente Virtual</Text>
        </View>
        <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeButton}>
          <X color="#fff" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.role === "user"
                ? styles.userMessage
                : styles.assistantMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                message.role === "user"
                  ? styles.userMessageText
                  : styles.assistantMessageText,
              ]}
            >
              {message.content}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View style={[styles.messageBubble, styles.assistantMessage]}>
            <ActivityIndicator color={Colors.light.text} size="small" />
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Digite sua pergunta..."
          placeholderTextColor={Colors.light.textSecondary}
          multiline
          maxLength={500}
          onSubmitEditing={sendMessage}
          editable={!isLoading}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={[
            styles.sendButton,
            (!input.trim() || isLoading) && styles.sendButtonDisabled,
          ]}
          disabled={!input.trim() || isLoading}
        >
          <Send
            color={!input.trim() || isLoading ? Colors.light.textSecondary : "#fff"}
            size={20}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: "absolute",
    right: 20,
    bottom: 90,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },
  chatContainer: {
    position: "absolute",
    right: 20,
    bottom: 90,
    width: Platform.select({ web: 380, default: 340 }),
    height: Platform.select({ web: 600, default: 500 }),
    backgroundColor: "#fff",
    borderRadius: 16,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    overflow: "hidden",
    zIndex: 1000,
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: "#fff",
  },
  closeButton: {
    padding: 4,
  },
  messagesContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  messagesContent: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: "85%",
    borderRadius: 16,
    padding: 12,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: Colors.light.primary,
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: "#fff",
  },
  assistantMessageText: {
    color: Colors.light.text,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: Colors.light.text,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: Colors.light.border,
  },
});
