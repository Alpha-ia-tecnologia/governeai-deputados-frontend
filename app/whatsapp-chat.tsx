import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    ScrollView,
    Platform,
    ActivityIndicator,
    KeyboardAvoidingView,
} from 'react-native';
import { router } from 'expo-router';
import {
    ArrowLeft,
    Send,
    Phone,
    Clock,
    CheckCheck,
    Check,
    AlertCircle,
    User,
    UserPlus,
    ArrowRightLeft,
    XCircle,
    MessageCircle,
    Search,
    Inbox,
    RefreshCw,
    Settings,
    BarChart3,
    Bot,
    Tag,
    FileText,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Spacing, Radius, Typography, Shadows } from '@/constants/colors';
import {
    whatsappChatService,
    WhatsappConversation,
    WhatsappMessage,
} from '@/services/whatsappChat.service';
import { whatsappSocket } from '@/services/whatsappSocket.service';

// ═══════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════

const StatusIcon: React.FC<{ status: string; color: string }> = ({ status, color }) => {
    switch (status) {
        case 'read': return <CheckCheck size={14} color="#53BDEB" />;
        case 'delivered': return <CheckCheck size={14} color={color} />;
        case 'sent': return <Check size={14} color={color} />;
        case 'failed': return <AlertCircle size={14} color="#EF4444" />;
        default: return <Clock size={14} color={color} />;
    }
};

const ConversationStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const badgeColors: Record<string, { bg: string; text: string; label: string }> = {
        pending: { bg: '#FEF3C7', text: '#92400E', label: 'Pendente' },
        active: { bg: '#D1FAE5', text: '#065F46', label: 'Ativo' },
        resolved: { bg: '#E5E7EB', text: '#374151', label: 'Resolvido' },
    };
    const c = badgeColors[status] || badgeColors.resolved;
    return (
        <View style={[styles.statusBadge, { backgroundColor: c.bg }]}>
            <Text style={[styles.statusBadgeText, { color: c.text }]}>{c.label}</Text>
        </View>
    );
};

const WindowIndicator: React.FC<{ lastClientMsg: string | null; colors: any }> = ({ lastClientMsg, colors }) => {
    if (!lastClientMsg) return null;
    const diff = Date.now() - new Date(lastClientMsg).getTime();
    const hoursLeft = Math.max(0, 24 - diff / (1000 * 60 * 60));
    const isOpen = hoursLeft > 0;
    return (
        <View style={[styles.windowIndicator, { backgroundColor: isOpen ? '#D1FAE5' : '#FEE2E2' }]}>
            <Clock size={12} color={isOpen ? '#065F46' : '#991B1B'} />
            <Text style={[styles.windowIndicatorText, { color: isOpen ? '#065F46' : '#991B1B' }]}>
                {isOpen ? `${hoursLeft.toFixed(1)}h restantes` : 'Janela expirada — use Template'}
            </Text>
        </View>
    );
};

// ═══════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════

export default function WhatsappChatScreen() {
    const { colors } = useTheme();
    const { user } = useAuth();

    // State
    const [conversations, setConversations] = useState<WhatsappConversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<WhatsappConversation | null>(null);
    const [messages, setMessages] = useState<WhatsappMessage[]>([]);
    const [messageText, setMessageText] = useState('');
    const [searching, setSearching] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'mine'>('all');

    const flatListRef = useRef<FlatList>(null);
    const lastSentAt = useRef<number>(0);

    // ─── Load conversations ───
    const loadConversations = useCallback(async () => {
        try {
            if (conversations.length === 0) setLoading(true);
            const data = await whatsappChatService.getConversations();
            setConversations(data);
        } catch (error) {
            console.error('Erro ao carregar conversas:', error);
        } finally {
            setLoading(false);
        }
    }, [conversations.length]);

    // ─── Load messages for selected conversation ───
    const loadMessages = useCallback(async (conversationId: string) => {
        try {
            let data: WhatsappMessage[];
            if (whatsappChatService.isEvolutionConversation(conversationId)) {
                data = await whatsappChatService.getEvolutionMessages(conversationId);
            } else {
                data = await whatsappChatService.getMessages(conversationId);
            }
            // Sort chronologically (oldest first) for chat display
            data.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
            setMessages(data);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
        } catch (error) {
            console.error('Erro ao carregar mensagens:', error);
        }
    }, []);

    // ─── Connect Socket.IO ───
    useEffect(() => {
        if (user?.id) {
            const vereadorId = (user as any).vereadorId || user.id;
            whatsappSocket.connect(user.id, vereadorId);

            whatsappSocket.on('whatsapp:newMessage', (data: any) => {
                const { conversationId, message } = data;
                // Update messages if viewing this conversation
                if (selectedConversation?.id === conversationId) {
                    setMessages(prev => [...prev, message]);
                    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
                }
                // Refresh conversation list
                loadConversations();
            });

            whatsappSocket.on('whatsapp:statusUpdate', (data: any) => {
                setMessages(prev =>
                    prev.map(msg =>
                        msg.wamid === data.wamid ? { ...msg, deliveryStatus: data.status } : msg
                    )
                );
            });

            whatsappSocket.on('whatsapp:conversationUpdate', () => {
                loadConversations();
            });

            whatsappSocket.on('whatsapp:newConversation', () => {
                loadConversations();
            });

            return () => {
                whatsappSocket.disconnect();
            };
        }
    }, [user?.id]);

    useEffect(() => {
        loadConversations();
    }, []);

    // ─── Auto-refresh conversations (polling for Evolution API) ───
    useEffect(() => {
        const interval = setInterval(() => {
            loadConversations();
        }, 15000); // Refresh every 15 seconds
        return () => clearInterval(interval);
    }, [loadConversations]);

    // ─── Auto-refresh messages for selected conversation ───
    useEffect(() => {
        if (selectedConversation?.id) {
            loadMessages(selectedConversation.id);
            // Polling for new messages every 10 seconds (skip if just sent)
            const interval = setInterval(() => {
                if (Date.now() - lastSentAt.current > 5000) {
                    loadMessages(selectedConversation.id);
                }
            }, 10000);
            return () => clearInterval(interval);
        }
    }, [selectedConversation?.id]);

    // ─── Send message ───
    const handleSendMessage = async () => {
        if (!messageText.trim() || !selectedConversation || sending) return;
        const text = messageText.trim();
        setMessageText('');
        setSending(true);

        try {
            let newMsg: WhatsappMessage;
            if (whatsappChatService.isEvolutionConversation(selectedConversation.id)) {
                newMsg = await whatsappChatService.sendEvolutionMessage(selectedConversation.id, text);
            } else {
                newMsg = await whatsappChatService.sendMessage(selectedConversation.id, text);
            }
            lastSentAt.current = Date.now();
            setMessages(prev => [...prev, newMsg]);
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
            // Reload from API after delay to sync
            setTimeout(() => loadMessages(selectedConversation.id), 3000);
        } catch (error: any) {
            setMessageText(text);
            console.error('Erro ao enviar:', error.message);
        } finally {
            setSending(false);
        }
    };

    // ─── Actions ───
    const handleClaim = async (conv: WhatsappConversation) => {
        try {
            await whatsappChatService.claimConversation(conv.id);
            loadConversations();
        } catch (e: any) { console.error(e.message); }
    };

    const handleResolve = async () => {
        if (!selectedConversation) return;
        try {
            await whatsappChatService.resolveConversation(selectedConversation.id);
            setSelectedConversation(null);
            loadConversations();
        } catch (e: any) { console.error(e.message); }
    };

    // ─── Filters ───
    const filteredConversations = conversations.filter(c => {
        if (activeTab === 'pending') return c.status === 'pending';
        if (activeTab === 'mine') return c.assignedToId === user?.id;
        return true;
    }).filter(c => {
        if (!searching) return true;
        const name = (c.contact?.name || c.contact?.phone || '').toLowerCase();
        return name.includes(searching.toLowerCase());
    });

    // ─── Format time ───
    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) return 'Hoje';
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    };

    // ═══════════════════════════════════════════════════
    // RENDER: Conversation List (Left Panel)
    // ═══════════════════════════════════════════════════
    const renderConversationList = () => (
        <View style={[styles.listPanel, { backgroundColor: colors.background, borderRightColor: colors.border }]}>
            {/* Header */}
            <View style={[styles.listHeader, { borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={20} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.listHeaderTitle}>
                    <Phone size={20} color="#25D366" />
                    <Text style={[styles.headerTitle, { color: colors.text }]}>WhatsApp</Text>
                </View>
                <TouchableOpacity onPress={loadConversations} style={styles.refreshButton}>
                    <RefreshCw size={18} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Navigation toolbar */}
            <View style={[styles.navToolbar, { borderBottomColor: colors.border }]}>
                {[
                    { icon: FileText, label: 'Templates', route: '/whatsapp-templates', color: '#6366F1' },
                    { icon: Tag, label: 'CRM', route: '/whatsapp-crm', color: '#F59E0B' },
                    { icon: Bot, label: 'Bot', route: '/whatsapp-bot', color: '#10B981' },
                    { icon: BarChart3, label: 'Relatórios', route: '/whatsapp-reports', color: '#3B82F6' },
                    { icon: Settings, label: 'Config', route: '/whatsapp-settings', color: '#8B5CF6' },
                ].map(item => {
                    const NavIcon = item.icon;
                    return (
                        <TouchableOpacity
                            key={item.route}
                            style={styles.navItem}
                            onPress={() => router.push(item.route as any)}
                        >
                            <NavIcon size={16} color={item.color} />
                            <Text style={[styles.navLabel, { color: colors.textSecondary }]}>{item.label}</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Search */}
            <View style={[styles.searchContainer, { backgroundColor: colors.backgroundSecondary }]}>
                <Search size={16} color={colors.textMuted} />
                <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Buscar conversa..."
                    placeholderTextColor={colors.textMuted}
                    value={searching}
                    onChangeText={setSearching}
                />
            </View>

            {/* Tabs */}
            <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
                {(['all', 'pending', 'mine'] as const).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && { borderBottomColor: '#25D366', borderBottomWidth: 2 }]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[
                            styles.tabText,
                            { color: activeTab === tab ? '#25D366' : colors.textMuted },
                        ]}>
                            {tab === 'all' ? 'Todas' : tab === 'pending' ? 'Fila' : 'Minhas'}
                        </Text>
                        {tab === 'pending' && conversations.filter(c => c.status === 'pending').length > 0 && (
                            <View style={styles.tabBadge}>
                                <Text style={styles.tabBadgeText}>
                                    {conversations.filter(c => c.status === 'pending').length}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* Conversation list */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#25D366" />
                </View>
            ) : filteredConversations.length === 0 ? (
                <View style={styles.centered}>
                    <Inbox size={48} color={colors.textMuted} />
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                        Nenhuma conversa encontrada
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredConversations}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.conversationItem,
                                {
                                    backgroundColor: selectedConversation?.id === item.id
                                        ? colors.primaryLight
                                        : 'transparent',
                                    borderBottomColor: colors.divider,
                                },
                            ]}
                            onPress={() => setSelectedConversation(item)}
                        >
                            {/* Avatar */}
                            <View style={[styles.avatar, { backgroundColor: '#25D366' }]}>
                                <Text style={styles.avatarText}>
                                    {(item.contact?.name || item.contact?.phone || '?')[0].toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.conversationInfo}>
                                <View style={styles.conversationTop}>
                                    <Text style={[styles.contactName, { color: colors.text }]} numberOfLines={1}>
                                        {item.contact?.name || item.contact?.phone || 'Desconhecido'}
                                    </Text>
                                    <Text style={[styles.timeText, { color: colors.textMuted }]}>
                                        {formatDate(item.updatedAt)}
                                    </Text>
                                </View>
                                <View style={styles.conversationBottom}>
                                    <Text style={[styles.lastMessage, { color: colors.textSecondary }]} numberOfLines={1}>
                                        {item.contact?.phone || ''}
                                    </Text>
                                    <ConversationStatusBadge status={item.status} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    )}
                />
            )}
        </View>
    );

    // ═══════════════════════════════════════════════════
    // RENDER: Message Bubble
    // ═══════════════════════════════════════════════════
    const renderMessage = ({ item }: { item: WhatsappMessage }) => {
        const isOutbound = item.direction === 'outbound';

        return (
            <View style={[
                styles.messageRow,
                isOutbound ? styles.messageRowRight : styles.messageRowLeft,
            ]}>
                <View style={[
                    styles.messageBubble,
                    isOutbound
                        ? [styles.messageBubbleOutbound, { backgroundColor: '#DCF8C6' }]
                        : [styles.messageBubbleInbound, { backgroundColor: colors.card }],
                ]}>
                    {/* Sender name for outbound */}
                    {isOutbound && item.senderUser && (
                        <Text style={styles.senderName}>{item.senderUser.name}</Text>
                    )}

                    {/* Content */}
                    {item.type === 'text' && (
                        <Text style={[styles.messageText, { color: isOutbound ? '#111' : colors.text }]}>
                            {item.content}
                        </Text>
                    )}

                    {item.type === 'image' && (
                        <View style={styles.mediaPlaceholder}>
                            <Text style={{ color: colors.textSecondary }}>📷 Imagem{item.mediaCaption ? `: ${item.mediaCaption}` : ''}</Text>
                        </View>
                    )}

                    {item.type === 'audio' && (
                        <View style={styles.mediaPlaceholder}>
                            <Text style={{ color: colors.textSecondary }}>🎵 Áudio</Text>
                        </View>
                    )}

                    {item.type === 'document' && (
                        <View style={styles.mediaPlaceholder}>
                            <Text style={{ color: colors.textSecondary }}>📎 Documento</Text>
                        </View>
                    )}

                    {item.type === 'video' && (
                        <View style={styles.mediaPlaceholder}>
                            <Text style={{ color: colors.textSecondary }}>🎥 Vídeo</Text>
                        </View>
                    )}

                    {item.type === 'location' && (
                        <View style={styles.mediaPlaceholder}>
                            <Text style={{ color: colors.textSecondary }}>
                                📍 {item.locationName || `${item.latitude}, ${item.longitude}`}
                            </Text>
                        </View>
                    )}

                    {!['text', 'image', 'audio', 'document', 'video', 'location'].includes(item.type) && (
                        <Text style={[styles.messageText, { color: isOutbound ? '#111' : colors.text }]}>
                            {item.content || `[${item.type}]`}
                        </Text>
                    )}

                    {/* Time + status */}
                    <View style={styles.messageFooter}>
                        <Text style={styles.messageTime}>{formatTime(item.createdAt)}</Text>
                        {isOutbound && <StatusIcon status={item.deliveryStatus} color="#999" />}
                    </View>
                </View>
            </View>
        );
    };

    // ═══════════════════════════════════════════════════
    // RENDER: Chat Panel (Right)
    // ═══════════════════════════════════════════════════
    const renderChatPanel = () => {
        if (!selectedConversation) {
            return (
                <View style={[styles.chatPanel, styles.centered, { backgroundColor: colors.backgroundSecondary }]}>
                    <MessageCircle size={64} color={colors.textMuted} />
                    <Text style={[styles.emptyTitle, { color: colors.textMuted }]}>
                        Selecione uma conversa
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
                        Escolha uma conversa à esquerda para iniciar o atendimento
                    </Text>
                </View>
            );
        }

        return (
            <View style={[styles.chatPanel, { backgroundColor: colors.backgroundSecondary }]}>
                {/* Chat Header */}
                <View style={[styles.chatHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                    <View style={[styles.avatar, { backgroundColor: '#25D366' }]}>
                        <Text style={styles.avatarText}>
                            {(selectedConversation.contact?.name || selectedConversation.contact?.phone || '?')[0].toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.chatHeaderInfo}>
                        <Text style={[styles.chatHeaderName, { color: colors.text }]}>
                            {selectedConversation.contact?.name || selectedConversation.contact?.phone}
                        </Text>
                        <Text style={[styles.chatHeaderPhone, { color: colors.textSecondary }]}>
                            {selectedConversation.contact?.phone}
                        </Text>
                    </View>

                    {/* Action buttons */}
                    <View style={styles.chatActions}>
                        {selectedConversation.status === 'pending' && (
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: '#D1FAE5' }]}
                                onPress={() => handleClaim(selectedConversation)}
                            >
                                <UserPlus size={16} color="#065F46" />
                                <Text style={[styles.actionBtnText, { color: '#065F46' }]}>Atender</Text>
                            </TouchableOpacity>
                        )}
                        {selectedConversation.status === 'active' && (
                            <TouchableOpacity
                                style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
                                onPress={handleResolve}
                            >
                                <XCircle size={16} color="#991B1B" />
                                <Text style={[styles.actionBtnText, { color: '#991B1B' }]}>Resolver</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Window indicator */}
                <WindowIndicator
                    lastClientMsg={selectedConversation.lastClientMessageAt}
                    colors={colors}
                />

                {/* Messages */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    keyExtractor={item => item.id}
                    renderItem={renderMessage}
                    contentContainerStyle={styles.messagesList}
                    onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
                />

                {/* Input */}
                {selectedConversation.status !== 'resolved' && (
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    >
                        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
                            <TextInput
                                style={[styles.messageInput, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
                                placeholder="Digite uma mensagem..."
                                placeholderTextColor={colors.textMuted}
                                value={messageText}
                                onChangeText={setMessageText}
                                multiline
                                maxLength={4096}
                                onSubmitEditing={handleSendMessage}
                            />
                            <TouchableOpacity
                                style={[
                                    styles.sendButton,
                                    {
                                        backgroundColor: messageText.trim() ? '#25D366' : colors.disabled,
                                    },
                                ]}
                                onPress={handleSendMessage}
                                disabled={!messageText.trim() || sending}
                            >
                                {sending
                                    ? <ActivityIndicator size="small" color="#FFF" />
                                    : <Send size={18} color="#FFF" />
                                }
                            </TouchableOpacity>
                        </View>
                    </KeyboardAvoidingView>
                )}
            </View>
        );
    };

    // ═══════════════════════════════════════════════════
    // RENDER: Main Layout
    // ═══════════════════════════════════════════════════
    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {renderConversationList()}
            {renderChatPanel()}
        </View>
    );
}

// ═══════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },

    // ─── List Panel ───
    listPanel: {
        width: 380,
        borderRightWidth: 1,
    },
    listHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        gap: Spacing.sm,
    },
    backButton: {
        padding: Spacing.xs,
    },
    listHeaderTitle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    headerTitle: {
        fontSize: Typography.sizes.lg,
        fontWeight: Typography.weights.bold,
    },
    refreshButton: {
        padding: Spacing.xs,
    },

    // ─── Search ───
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: Spacing.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.lg,
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: Typography.sizes.base,
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
    },

    // ─── Tabs ───
    tabRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        gap: 4,
    },
    tabText: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.medium,
    },
    tabBadge: {
        backgroundColor: '#25D366',
        borderRadius: Radius.full,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    tabBadgeText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: Typography.weights.bold,
    },

    // ─── Conversation item ───
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        gap: Spacing.md,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: Radius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#FFF',
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.bold,
    },
    conversationInfo: {
        flex: 1,
    },
    conversationTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    contactName: {
        fontSize: Typography.sizes.base,
        fontWeight: Typography.weights.semibold,
        flex: 1,
    },
    timeText: {
        fontSize: Typography.sizes.xs,
    },
    conversationBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    lastMessage: {
        fontSize: Typography.sizes.sm,
        flex: 1,
    },

    // ─── Status badge ───
    statusBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: Radius.sm,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: Typography.weights.semibold,
    },

    // ─── Window indicator ───
    windowIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
    },
    windowIndicatorText: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.medium,
    },

    // ─── Chat Panel ───
    chatPanel: {
        flex: 1,
    },
    chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        gap: Spacing.md,
        ...Shadows.sm,
    },
    chatHeaderInfo: {
        flex: 1,
    },
    chatHeaderName: {
        fontSize: Typography.sizes.md,
        fontWeight: Typography.weights.semibold,
    },
    chatHeaderPhone: {
        fontSize: Typography.sizes.sm,
    },
    chatActions: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.md,
    },
    actionBtnText: {
        fontSize: Typography.sizes.sm,
        fontWeight: Typography.weights.semibold,
    },

    // ─── Messages ───
    messagesList: {
        padding: Spacing.md,
        paddingBottom: Spacing.xxl,
    },
    messageRow: {
        marginBottom: Spacing.sm,
    },
    messageRowLeft: {
        alignItems: 'flex-start',
    },
    messageRowRight: {
        alignItems: 'flex-end',
    },
    messageBubble: {
        maxWidth: '70%',
        padding: Spacing.md,
        borderRadius: Radius.lg,
    },
    messageBubbleInbound: {
        borderTopLeftRadius: 4,
    },
    messageBubbleOutbound: {
        borderTopRightRadius: 4,
    },
    senderName: {
        fontSize: Typography.sizes.xs,
        fontWeight: Typography.weights.semibold,
        color: '#25D366',
        marginBottom: 2,
    },
    messageText: {
        fontSize: Typography.sizes.base,
        lineHeight: Typography.sizes.base * Typography.lineHeights.normal,
    },
    mediaPlaceholder: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: Radius.sm,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    messageFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 4,
        marginTop: 4,
    },
    messageTime: {
        fontSize: 10,
        color: '#999',
    },

    // ─── Input ───
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: Spacing.md,
        borderTopWidth: 1,
        gap: Spacing.sm,
    },
    messageInput: {
        flex: 1,
        fontSize: Typography.sizes.base,
        padding: Spacing.md,
        borderRadius: Radius.xl,
        maxHeight: 120,
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
    },
    sendButton: {
        width: 42,
        height: 42,
        borderRadius: Radius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // ─── Utilities ───
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.md,
    },
    emptyText: {
        fontSize: Typography.sizes.base,
    },
    emptyTitle: {
        fontSize: Typography.sizes.xl,
        fontWeight: Typography.weights.semibold,
        marginTop: Spacing.lg,
    },
    emptySubtitle: {
        fontSize: Typography.sizes.base,
        textAlign: 'center',
        maxWidth: 300,
    },

    // ─── Nav Toolbar ───
    navToolbar: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        paddingVertical: 6,
        paddingHorizontal: Spacing.sm,
        gap: 2,
    },
    navItem: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 6,
        borderRadius: Radius.sm,
    },
    navLabel: {
        fontSize: 10,
        fontWeight: Typography.weights.semibold,
    },
});
