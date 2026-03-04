import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Platform, Modal,
    ActivityIndicator, KeyboardAvoidingView, Alert, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { chatService, ChatConversation, ChatMessage, ChatParticipant } from '@/services/chat.service';
import { usersService } from '@/services/users.service';
import {
    ArrowLeft, Send, Plus, Users, MessageCircle, Search, Paperclip,
    UserPlus, X, ChevronDown, Hash, User, MoreVertical, Settings,
    Trash2, Edit3, Check, UserMinus,
} from 'lucide-react-native';
import { API_BASE_URL } from '@/services/api';

export default function ChatScreen() {
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const { colors } = useTheme();

    // State
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);

    // Modals
    const [showNewConversation, setShowNewConversation] = useState(false);
    const [showNewGroup, setShowNewGroup] = useState(false);
    const [showGroupInfo, setShowGroupInfo] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);

    // Users
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

    // Group edit state
    const [editingGroupName, setEditingGroupName] = useState(false);
    const [editGroupNameValue, setEditGroupNameValue] = useState('');

    const messagesEndRef = useRef<ScrollView>(null);
    const pollingRef = useRef<any>(null);

    // ==================== DATA LOADING ====================

    const loadConversations = useCallback(async () => {
        try {
            const data = await chatService.getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadMessages = useCallback(async (convId: string) => {
        try {
            const data = await chatService.getMessages(convId);
            setMessages(data);
            setTimeout(() => messagesEndRef.current?.scrollToEnd?.({ animated: false }), 100);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }, []);

    const loadUsers = useCallback(async () => {
        try {
            const data = await usersService.getAll();
            setAllUsers(data.filter((u: any) => u.id !== currentUser?.id));
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }, [currentUser]);

    useEffect(() => {
        loadConversations();
        loadUsers();
    }, []);

    // Polling for new messages
    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.id);
            pollingRef.current = setInterval(() => {
                loadMessages(selectedConversation.id);
                loadConversations();
            }, 5000);
        }
        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [selectedConversation?.id]);

    // ==================== ACTIONS ====================

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedConversation) return;
        setSendingMessage(true);
        try {
            await chatService.sendMessage(selectedConversation.id, messageInput.trim());
            setMessageInput('');
            await loadMessages(selectedConversation.id);
            await loadConversations();
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setSendingMessage(false);
        }
    };

    const handleSelectConversation = (conv: ChatConversation) => {
        setSelectedConversation(conv);
        setMessages([]);
    };

    const handleCreateDirect = async (targetUserId: string) => {
        try {
            const conv = await chatService.createDirectConversation(targetUserId);
            setShowNewConversation(false);
            await loadConversations();
            setSelectedConversation(conv);
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedMembers.length === 0) return;
        try {
            const conv = await chatService.createGroup(groupName.trim(), selectedMembers);
            setShowNewGroup(false);
            setGroupName('');
            setSelectedMembers([]);
            await loadConversations();
            setSelectedConversation(conv);
        } catch (error) {
            console.error('Error creating group:', error);
        }
    };

    const handleFileUpload = async () => {
        if (Platform.OS === 'web') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '*/*';
            input.onchange = async (e: any) => {
                const file = e.target.files?.[0];
                if (!file || !selectedConversation) return;
                try {
                    const uploaded = await chatService.uploadFile(file);
                    await chatService.sendMessage(
                        selectedConversation.id,
                        `📎 ${uploaded.name}`,
                        uploaded.url,
                        uploaded.name
                    );
                    await loadMessages(selectedConversation.id);
                    await loadConversations();
                } catch (error) {
                    console.error('Error uploading file:', error);
                }
            };
            input.click();
        }
    };

    // ==================== GROUP EDIT ACTIONS ====================

    const handleSaveGroupName = async () => {
        if (!editGroupNameValue.trim() || !selectedConversation) return;
        try {
            await chatService.updateGroup(selectedConversation.id, editGroupNameValue.trim());
            setEditingGroupName(false);
            await loadConversations();
            // Refresh conversation details
            const updated = await chatService.getConversationDetails(selectedConversation.id);
            setSelectedConversation(updated);
        } catch (error) {
            console.error('Error updating group name:', error);
        }
    };

    const handleRemoveMember = async (userId: string) => {
        if (!selectedConversation) return;
        if (Platform.OS === 'web' && !window.confirm('Deseja remover este membro do grupo?')) return;
        try {
            await chatService.removeMember(selectedConversation.id, userId);
            await loadConversations();
            const updated = await chatService.getConversationDetails(selectedConversation.id);
            setSelectedConversation(updated);
        } catch (error) {
            console.error('Error removing member:', error);
        }
    };

    const handleAddMemberToGroup = async (userId: string) => {
        if (!selectedConversation) return;
        try {
            await chatService.addMember(selectedConversation.id, userId);
            await loadConversations();
            const updated = await chatService.getConversationDetails(selectedConversation.id);
            setSelectedConversation(updated);
        } catch (error) {
            console.error('Error adding member:', error);
        }
    };

    const handleDeleteGroup = async () => {
        if (!selectedConversation) return;
        if (Platform.OS === 'web' && !window.confirm('Tem certeza que deseja excluir este grupo? Todas as mensagens serão perdidas.')) return;
        try {
            await chatService.deleteGroup(selectedConversation.id);
            setShowGroupInfo(false);
            setSelectedConversation(null);
            setMessages([]);
            await loadConversations();
        } catch (error) {
            console.error('Error deleting group:', error);
        }
    };

    const isCurrentUserAdmin = selectedConversation?.participants?.some(
        p => p.userId === currentUser?.id && p.role === 'admin'
    );

    const nonMemberUsers = allUsers.filter(
        u => !selectedConversation?.participants?.some(p => p.userId === u.id)
    );

    // ==================== HELPERS ====================

    const getConversationName = (conv: ChatConversation) => {
        if (conv.isGroup) return conv.name || 'Grupo';
        const other = conv.participants?.find(p => p.userId !== currentUser?.id);
        return other?.user?.name || 'Conversa';
    };

    const getConversationInitials = (conv: ChatConversation) => {
        const name = getConversationName(conv);
        return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    };

    const formatTime = (date: string) => {
        const d = new Date(date);
        const now = new Date();
        const isToday = d.toDateString() === now.toDateString();
        if (isToday) return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    const filteredConversations = conversations.filter(c => {
        if (!searchQuery) return true;
        return getConversationName(c).toLowerCase().includes(searchQuery.toLowerCase());
    });

    // ==================== RENDER ====================

    const renderConversationItem = (conv: ChatConversation) => {
        const isSelected = selectedConversation?.id === conv.id;
        const avatarColor = conv.isGroup ? '#8B5CF6' : '#3B82F6';

        return (
            <TouchableOpacity
                key={conv.id}
                onPress={() => handleSelectConversation(conv)}
                style={[styles.convItem, isSelected && { backgroundColor: '#EBF5FF' }]}
            >
                <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
                    {conv.isGroup ? (
                        <Users color="#fff" size={18} />
                    ) : (
                        <Text style={styles.avatarText}>{getConversationInitials(conv)}</Text>
                    )}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={styles.convName} numberOfLines={1}>{getConversationName(conv)}</Text>
                        {conv.lastMessage && (
                            <Text style={styles.convTime}>{formatTime(conv.lastMessage.createdAt)}</Text>
                        )}
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                        <Text style={styles.convPreview} numberOfLines={1}>
                            {conv.lastMessage
                                ? `${conv.isGroup ? conv.lastMessage.senderName.split(' ')[0] + ': ' : ''}${conv.lastMessage.content}`
                                : 'Nenhuma mensagem'}
                        </Text>
                        {conv.unreadCount > 0 && (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>{conv.unreadCount}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const renderMessage = (msg: ChatMessage) => {
        const isMine = msg.senderId === currentUser?.id;
        return (
            <View key={msg.id} style={[styles.msgRow, isMine && { justifyContent: 'flex-end' }]}>
                <View style={[styles.msgBubble, isMine ? styles.msgBubbleMine : styles.msgBubbleOther]}>
                    {!isMine && selectedConversation?.isGroup && (
                        <Text style={styles.msgSender}>{msg.sender?.name?.split(' ')[0]}</Text>
                    )}
                    {msg.attachmentUrl ? (
                        <TouchableOpacity
                            onPress={() => {
                                if (Platform.OS === 'web') {
                                    window.open(`${API_BASE_URL}${msg.attachmentUrl}`, '_blank');
                                }
                            }}
                        >
                            <Text style={[styles.msgText, isMine && styles.msgTextMine, { textDecorationLine: 'underline' }]}>
                                {msg.content}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <Text style={[styles.msgText, isMine && styles.msgTextMine]}>{msg.content}</Text>
                    )}
                    <Text style={[styles.msgTime, isMine && { color: 'rgba(255,255,255,0.7)' }]}>
                        {formatTime(msg.createdAt)}
                    </Text>
                </View>
            </View>
        );
    };

    // ==================== MAIN LAYOUT ====================

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
                    <ArrowLeft color="#fff" size={22} />
                </TouchableOpacity>
                <MessageCircle color="#fff" size={22} />
                <Text style={styles.headerTitle}>Chat Interno</Text>
            </View>

            <View style={styles.mainContent}>
                {/* Left Column - Conversation List */}
                <View style={styles.leftPanel}>
                    {/* Search + Actions */}
                    <View style={styles.searchBar}>
                        <Search color="#9CA3AF" size={16} />
                        <TextInput
                            placeholder="Buscar conversa..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchInput}
                            placeholderTextColor="#9CA3AF"
                        />
                    </View>

                    <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 12, marginBottom: 12 }}>
                        <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => setShowNewConversation(true)}
                        >
                            <Plus color="#3B82F6" size={16} />
                            <Text style={styles.actionBtnText}>Nova Conversa</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#F3E8FF' }]}
                            onPress={() => setShowNewGroup(true)}
                        >
                            <Users color="#8B5CF6" size={16} />
                            <Text style={[styles.actionBtnText, { color: '#8B5CF6' }]}>Novo Grupo</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Conversation List */}
                    {loading ? (
                        <View style={{ padding: 40, alignItems: 'center' }}>
                            <ActivityIndicator size="large" color="#3B82F6" />
                        </View>
                    ) : (
                        <ScrollView style={{ flex: 1 }}>
                            {filteredConversations.length === 0 ? (
                                <View style={{ padding: 30, alignItems: 'center' }}>
                                    <MessageCircle color="#D1D5DB" size={40} />
                                    <Text style={{ color: '#9CA3AF', marginTop: 12, textAlign: 'center' }}>
                                        Nenhuma conversa ainda.{'\n'}Comece uma nova conversa!
                                    </Text>
                                </View>
                            ) : (
                                filteredConversations.map(renderConversationItem)
                            )}
                        </ScrollView>
                    )}
                </View>

                {/* Right Column - Messages */}
                <View style={styles.rightPanel}>
                    {selectedConversation ? (
                        <>
                            {/* Conversation Header */}
                            <View style={styles.convHeader}>
                                <View style={[styles.avatar, { backgroundColor: selectedConversation.isGroup ? '#8B5CF6' : '#3B82F6', width: 36, height: 36 }]}>
                                    {selectedConversation.isGroup ? (
                                        <Users color="#fff" size={16} />
                                    ) : (
                                        <Text style={[styles.avatarText, { fontSize: 12 }]}>{getConversationInitials(selectedConversation)}</Text>
                                    )}
                                </View>
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={styles.convHeaderName}>{getConversationName(selectedConversation)}</Text>
                                    <Text style={styles.convHeaderSub}>
                                        {selectedConversation.isGroup
                                            ? `${selectedConversation.participants?.length || 0} membros`
                                            : 'Online'}
                                    </Text>
                                </View>
                                {selectedConversation.isGroup && (
                                    <TouchableOpacity onPress={() => setShowGroupInfo(true)} style={{ padding: 8 }}>
                                        <Settings color="#6B7280" size={20} />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {/* Messages Area */}
                            <ScrollView
                                ref={messagesEndRef}
                                style={styles.messagesArea}
                                contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
                            >
                                {messages.length === 0 ? (
                                    <View style={{ alignItems: 'center', marginTop: 60 }}>
                                        <MessageCircle color="#D1D5DB" size={48} />
                                        <Text style={{ color: '#9CA3AF', marginTop: 12 }}>
                                            Nenhuma mensagem ainda. Diga olá! 👋
                                        </Text>
                                    </View>
                                ) : (
                                    messages.map(renderMessage)
                                )}
                            </ScrollView>

                            {/* Message Input */}
                            <View style={styles.inputBar}>
                                <TouchableOpacity onPress={handleFileUpload} style={{ padding: 8 }}>
                                    <Paperclip color="#6B7280" size={20} />
                                </TouchableOpacity>
                                <TextInput
                                    value={messageInput}
                                    onChangeText={setMessageInput}
                                    placeholder="Digite sua mensagem..."
                                    style={styles.messageInput}
                                    placeholderTextColor="#9CA3AF"
                                    onSubmitEditing={handleSendMessage}
                                    returnKeyType="send"
                                    multiline
                                />
                                <TouchableOpacity
                                    onPress={handleSendMessage}
                                    disabled={!messageInput.trim() || sendingMessage}
                                    style={[styles.sendBtn, (!messageInput.trim() || sendingMessage) && { opacity: 0.5 }]}
                                >
                                    {sendingMessage ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Send color="#fff" size={18} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </>
                    ) : (
                        <View style={styles.emptyState}>
                            <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#EBF5FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                                <MessageCircle color="#3B82F6" size={36} />
                            </View>
                            <Text style={styles.emptyTitle}>Chat Interno do Gabinete</Text>
                            <Text style={styles.emptySubtitle}>
                                Selecione uma conversa ou inicie uma nova{'\n'}para começar a conversar com sua equipe.
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* ==================== MODALS ==================== */}

            {/* New Direct Conversation Modal */}
            <Modal visible={showNewConversation} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nova Conversa</Text>
                            <TouchableOpacity onPress={() => setShowNewConversation(false)}>
                                <X color="#6B7280" size={22} />
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.modalSubtitle}>Selecione um usuário para conversar:</Text>
                        <ScrollView style={{ maxHeight: 400 }}>
                            {allUsers.map(u => (
                                <TouchableOpacity
                                    key={u.id}
                                    onPress={() => handleCreateDirect(u.id)}
                                    style={styles.userItem}
                                >
                                    <View style={[styles.avatar, { width: 36, height: 36, backgroundColor: '#3B82F6' }]}>
                                        <Text style={[styles.avatarText, { fontSize: 12 }]}>
                                            {u.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View style={{ marginLeft: 10 }}>
                                        <Text style={{ fontWeight: '600', color: '#1F2937' }}>{u.name}</Text>
                                        <Text style={{ fontSize: 12, color: '#6B7280' }}>{u.email}</Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* New Group Modal */}
            <Modal visible={showNewGroup} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Novo Grupo</Text>
                            <TouchableOpacity onPress={() => { setShowNewGroup(false); setGroupName(''); setSelectedMembers([]); }}>
                                <X color="#6B7280" size={22} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.modalLabel}>Nome do Grupo</Text>
                        <TextInput
                            value={groupName}
                            onChangeText={setGroupName}
                            placeholder="Ex: Equipe de Campo"
                            style={styles.modalInput}
                            placeholderTextColor="#9CA3AF"
                        />

                        <Text style={[styles.modalLabel, { marginTop: 16 }]}>
                            Membros ({selectedMembers.length} selecionados)
                        </Text>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {allUsers.map(u => {
                                const isSelected = selectedMembers.includes(u.id);
                                return (
                                    <TouchableOpacity
                                        key={u.id}
                                        onPress={() => {
                                            setSelectedMembers(prev =>
                                                isSelected ? prev.filter(id => id !== u.id) : [...prev, u.id]
                                            );
                                        }}
                                        style={[styles.userItem, isSelected && { backgroundColor: '#EBF5FF' }]}
                                    >
                                        <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                                            {isSelected && <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>✓</Text>}
                                        </View>
                                        <Text style={{ fontWeight: '500', color: '#1F2937', marginLeft: 10 }}>{u.name}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>

                        <TouchableOpacity
                            onPress={handleCreateGroup}
                            disabled={!groupName.trim() || selectedMembers.length === 0}
                            style={[styles.createGroupBtn, (!groupName.trim() || selectedMembers.length === 0) && { opacity: 0.5 }]}
                        >
                            <Users color="#fff" size={18} />
                            <Text style={{ color: '#fff', fontWeight: '700', marginLeft: 8 }}>Criar Grupo</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Group Info / Edit Modal */}
            <Modal visible={showGroupInfo} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Gerenciar Grupo</Text>
                            <TouchableOpacity onPress={() => { setShowGroupInfo(false); setEditingGroupName(false); setShowAddMember(false); }}>
                                <X color="#6B7280" size={22} />
                            </TouchableOpacity>
                        </View>

                        {selectedConversation?.isGroup && (
                            <>
                                {/* Editable Group Name */}
                                <Text style={styles.modalLabel}>Nome do Grupo</Text>
                                {editingGroupName ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}>
                                        <TextInput
                                            value={editGroupNameValue}
                                            onChangeText={setEditGroupNameValue}
                                            style={[styles.modalInput, { flex: 1 }]}
                                            autoFocus
                                            onSubmitEditing={handleSaveGroupName}
                                        />
                                        <TouchableOpacity
                                            onPress={handleSaveGroupName}
                                            style={{ backgroundColor: '#10B981', width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <Check color="#fff" size={18} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => setEditingGroupName(false)}
                                            style={{ backgroundColor: '#F3F4F6', width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            <X color="#6B7280" size={18} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => { setEditGroupNameValue(selectedConversation.name || ''); setEditingGroupName(true); }}
                                        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 }}
                                    >
                                        <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937', flex: 1 }}>
                                            {selectedConversation.name}
                                        </Text>
                                        <Edit3 color="#6B7280" size={16} />
                                    </TouchableOpacity>
                                )}

                                {/* Members Section */}
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <Text style={[styles.modalLabel, { marginBottom: 0 }]}>
                                        Membros ({selectedConversation.participants?.length || 0})
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setShowAddMember(!showAddMember)}
                                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#EBF5FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}
                                    >
                                        <UserPlus color="#3B82F6" size={14} />
                                        <Text style={{ fontSize: 12, color: '#3B82F6', fontWeight: '600' }}>Adicionar</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Add Member Dropdown */}
                                {showAddMember && nonMemberUsers.length > 0 && (
                                    <View style={{ backgroundColor: '#F9FAFB', borderRadius: 10, padding: 8, marginBottom: 8, maxHeight: 150 }}>
                                        <ScrollView>
                                            {nonMemberUsers.map(u => (
                                                <TouchableOpacity
                                                    key={u.id}
                                                    onPress={() => handleAddMemberToGroup(u.id)}
                                                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8, borderRadius: 6 }}
                                                >
                                                    <View style={[styles.avatar, { width: 28, height: 28, backgroundColor: '#3B82F6' }]}>
                                                        <Text style={[styles.avatarText, { fontSize: 9 }]}>
                                                            {u.name?.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()}
                                                        </Text>
                                                    </View>
                                                    <Text style={{ marginLeft: 8, fontSize: 13, color: '#1F2937', fontWeight: '500' }}>{u.name}</Text>
                                                    <View style={{ flex: 1 }} />
                                                    <Plus color="#10B981" size={16} />
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                                {showAddMember && nonMemberUsers.length === 0 && (
                                    <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginBottom: 8 }}>Todos os usuários já são membros</Text>
                                )}

                                {/* Member List */}
                                <ScrollView style={{ maxHeight: 250 }}>
                                    {selectedConversation.participants?.map(p => (
                                        <View key={p.id} style={[styles.userItem, { justifyContent: 'space-between' }]}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                                <View style={[styles.avatar, { width: 32, height: 32, backgroundColor: p.role === 'admin' ? '#F59E0B' : '#3B82F6' }]}>
                                                    <Text style={[styles.avatarText, { fontSize: 10 }]}>
                                                        {p.user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                                    </Text>
                                                </View>
                                                <View style={{ marginLeft: 10, flex: 1 }}>
                                                    <Text style={{ fontWeight: '500', color: '#1F2937' }}>{p.user?.name}</Text>
                                                </View>
                                            </View>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                {p.role === 'admin' && (
                                                    <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                                                        <Text style={{ fontSize: 10, color: '#92400E', fontWeight: '600' }}>Admin</Text>
                                                    </View>
                                                )}
                                                {p.userId !== currentUser?.id && isCurrentUserAdmin && (
                                                    <TouchableOpacity
                                                        onPress={() => handleRemoveMember(p.userId)}
                                                        style={{ padding: 4 }}
                                                    >
                                                        <UserMinus color="#EF4444" size={16} />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    ))}
                                </ScrollView>

                                {/* Delete Group Button (admin only) */}
                                {isCurrentUserAdmin && (
                                    <TouchableOpacity
                                        onPress={handleDeleteGroup}
                                        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, backgroundColor: '#FEE2E2', paddingVertical: 12, borderRadius: 12, gap: 8 }}
                                    >
                                        <Trash2 color="#DC2626" size={18} />
                                        <Text style={{ color: '#DC2626', fontWeight: '700' }}>Excluir Grupo</Text>
                                    </TouchableOpacity>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F1F5F9' },
    header: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14,
        backgroundColor: '#1E40AF',
        ...Platform.select({ web: { boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }, default: { elevation: 4 } }),
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginLeft: 10 },

    mainContent: { flex: 1, flexDirection: 'row' },

    // Left Panel
    leftPanel: {
        width: 340, backgroundColor: '#fff', borderRightWidth: 1, borderRightColor: '#E5E7EB',
    },
    searchBar: {
        flexDirection: 'row', alignItems: 'center', margin: 12, paddingHorizontal: 12, paddingVertical: 8,
        backgroundColor: '#F3F4F6', borderRadius: 10,
    },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#1F2937', outlineStyle: 'none' as any },
    actionBtn: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        paddingVertical: 8, borderRadius: 10, backgroundColor: '#EBF5FF',
    },
    actionBtnText: { fontSize: 12, fontWeight: '600', color: '#3B82F6' },

    convItem: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    },
    convName: { fontSize: 14, fontWeight: '600', color: '#1F2937', flex: 1 },
    convTime: { fontSize: 11, color: '#9CA3AF' },
    convPreview: { fontSize: 12, color: '#6B7280', flex: 1 },

    avatar: {
        width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },

    badge: {
        backgroundColor: '#3B82F6', borderRadius: 10, minWidth: 20, height: 20,
        alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6,
    },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

    // Right Panel
    rightPanel: { flex: 1, backgroundColor: '#FAFBFC' },

    convHeader: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12,
        backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    },
    convHeaderName: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
    convHeaderSub: { fontSize: 12, color: '#6B7280', marginTop: 1 },

    messagesArea: { flex: 1, backgroundColor: '#F8FAFC' },

    msgRow: { flexDirection: 'row', marginBottom: 8 },
    msgBubble: { maxWidth: '70%', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
    msgBubbleMine: { backgroundColor: '#3B82F6', borderBottomRightRadius: 4 },
    msgBubbleOther: { backgroundColor: '#fff', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E5E7EB' },
    msgSender: { fontSize: 11, fontWeight: '700', color: '#8B5CF6', marginBottom: 2 },
    msgText: { fontSize: 14, color: '#1F2937', lineHeight: 20 },
    msgTextMine: { color: '#fff' },
    msgTime: { fontSize: 10, color: '#9CA3AF', marginTop: 4, textAlign: 'right' as any },

    inputBar: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
        backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB',
    },
    messageInput: {
        flex: 1, marginHorizontal: 8, paddingHorizontal: 14, paddingVertical: 10,
        backgroundColor: '#F3F4F6', borderRadius: 20, fontSize: 14, color: '#1F2937',
        maxHeight: 100, outlineStyle: 'none' as any,
    },
    sendBtn: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: '#3B82F6',
        alignItems: 'center', justifyContent: 'center',
    },

    // Empty State
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
    emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1F2937', marginBottom: 8 },
    emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22 },

    // Modals
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
    },
    modalContent: {
        width: 420, maxHeight: '80%', backgroundColor: '#fff', borderRadius: 16, padding: 20,
        ...Platform.select({ web: { boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }, default: { elevation: 10 } }),
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
    modalSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 12 },
    modalLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
    modalInput: {
        borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10, paddingHorizontal: 14,
        paddingVertical: 10, fontSize: 14, color: '#1F2937', outlineStyle: 'none' as any,
    },

    userItem: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12,
        borderRadius: 8, marginBottom: 4,
    },

    checkbox: {
        width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: '#D1D5DB',
        alignItems: 'center', justifyContent: 'center',
    },
    checkboxActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },

    createGroupBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 16,
        backgroundColor: '#8B5CF6', paddingVertical: 12, borderRadius: 12,
    },
});
