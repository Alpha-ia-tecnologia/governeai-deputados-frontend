import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Platform,
    ActivityIndicator,
    Switch,
    Modal,
    Image,
} from 'react-native';
import { router } from 'expo-router';
import {
    ArrowLeft,
    Settings,
    Key,
    Phone,
    Globe,
    Bot,
    Clock,
    Bell,
    CheckCircle2,
    XCircle,
    Eye,
    EyeOff,
    Save,
    Zap,
    Users,
    Link,
    Plus,
    Trash2,
    RefreshCw,
    Smartphone,
    QrCode,
    X,
    Wifi,
    WifiOff,
    Loader2,
    Server,
    Copy,
    Shield,
    Hash,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, Radius, Typography, Shadows } from '@/constants/colors';
import {
    whatsappSettingsService,
    WhatsappSettingsData,
} from '@/services/whatsappSettings.service';
import {
    whatsappChannelService,
    WhatsappChannelData,
} from '@/services/whatsappChannel.service';

export default function WhatsappSettingsScreen() {
    const { colors } = useTheme();
    const [settings, setSettings] = useState<WhatsappSettingsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testingEvolution, setTestingEvolution] = useState(false);
    const [evolutionTestResult, setEvolutionTestResult] = useState<{ success: boolean; message: string } | null>(null);
    const [showApiKey, setShowApiKey] = useState(false);
    const [showAccessToken, setShowAccessToken] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [copiedWebhook, setCopiedWebhook] = useState(false);

    // Channels
    const [channels, setChannels] = useState<WhatsappChannelData[]>([]);
    const [loadingChannels, setLoadingChannels] = useState(false);

    // Create channel modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newChannelName, setNewChannelName] = useState('');
    const [creating, setCreating] = useState(false);

    // QR Code modal
    const [showQrModal, setShowQrModal] = useState(false);
    const [qrData, setQrData] = useState<any>(null);
    const [qrChannelId, setQrChannelId] = useState<string | null>(null);
    const [pollingStatus, setPollingStatus] = useState(false);
    const pollRef = useRef<any>(null);

    // ─── Load ───

    const loadSettings = useCallback(async () => {
        try {
            setLoading(true);
            const data = await whatsappSettingsService.getSettings();
            setSettings(data);
        } catch (e) {
            console.error('Erro ao carregar configurações:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadChannels = useCallback(async () => {
        try {
            setLoadingChannels(true);
            const data = await whatsappChannelService.getAll();
            setChannels(data);
        } catch (e) {
            console.error('Erro ao carregar canais:', e);
        } finally {
            setLoadingChannels(false);
        }
    }, []);

    useEffect(() => { loadSettings(); loadChannels(); }, []);

    useEffect(() => {
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, []);

    // ─── Settings Handlers ───

    const updateField = (field: keyof WhatsappSettingsData, value: any) => {
        if (!settings) return;
        setSettings({ ...settings, [field]: value });
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            const updated = await whatsappSettingsService.updateSettings(settings);
            setSettings(updated);
            setHasChanges(false);
            setEvolutionTestResult(null);
        } catch (e: any) { console.error(e.message); }
        finally { setSaving(false); }
    };

    const handleTestEvolution = async () => {
        // Save first if there are changes
        if (hasChanges) await handleSave();
        setTestingEvolution(true);
        setEvolutionTestResult(null);
        try {
            const result = await whatsappChannelService.testConnection();
            setEvolutionTestResult(result);
        } catch (e: any) {
            setEvolutionTestResult({ success: false, message: e.message });
        } finally {
            setTestingEvolution(false);
        }
    };

    // ─── Channel Handlers ───

    const handleCreateChannel = async () => {
        if (!newChannelName.trim()) return;
        setCreating(true);
        try {
            const result = await whatsappChannelService.create(newChannelName.trim());
            setShowCreateModal(false);
            setNewChannelName('');
            loadChannels();

            // If QR code returned, show it
            if (result.qrcode) {
                setQrData(result.qrcode);
                setQrChannelId(result.channel.id);
                setShowQrModal(true);
                startPolling(result.channel.id);
            }
        } catch (e: any) {
            console.error(e.message);
            setEvolutionTestResult({ success: false, message: e.response?.data?.message || e.message });
        } finally {
            setCreating(false);
        }
    };

    const handleShowQr = async (channel: WhatsappChannelData) => {
        try {
            const result = await whatsappChannelService.getQrCode(channel.id);
            setQrData(result);
            setQrChannelId(channel.id);
            setShowQrModal(true);
            startPolling(channel.id);
        } catch (e: any) {
            console.error(e.message);
        }
    };

    const handleDeleteChannel = async (channel: WhatsappChannelData) => {
        try {
            await whatsappChannelService.delete(channel.id);
            loadChannels();
        } catch (e: any) { console.error(e.message); }
    };

    const startPolling = (channelId: string) => {
        if (pollRef.current) clearInterval(pollRef.current);
        setPollingStatus(true);
        pollRef.current = setInterval(async () => {
            try {
                const result = await whatsappChannelService.getStatus(channelId);
                if (result.channel.status === 'CONNECTED') {
                    clearInterval(pollRef.current);
                    pollRef.current = null;
                    setPollingStatus(false);
                    setShowQrModal(false);
                    loadChannels();
                }
            } catch { /* ignore */ }
        }, 5000);
    };

    const closeQrModal = () => {
        setShowQrModal(false);
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
        setPollingStatus(false);
    };

    // ─── Status helpers ───

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'CONNECTED': return '#10B981';
            case 'CONNECTING': return '#F59E0B';
            case 'CREATED': return '#6366F1';
            default: return '#EF4444';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'CONNECTED': return 'Conectado';
            case 'CONNECTING': return 'Conectando...';
            case 'CREATED': return 'Aguardando QR';
            default: return 'Desconectado';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'CONNECTED': return Wifi;
            case 'CONNECTING': return Loader2;
            default: return WifiOff;
        }
    };

    // ─── Loading ───

    if (loading || !settings) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.centered}><ActivityIndicator size="large" color="#25D366" /></View>
            </View>
        );
    }

    // ─── Sub-components ───

    const SectionHeader = ({ icon: Icon, title, color = '#25D366' }: { icon: any; title: string; color?: string }) => (
        <View style={styles.sectionHeader}>
            <Icon size={18} color={color} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
        </View>
    );

    const FieldRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
        <View style={styles.fieldRow}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
            {children}
        </View>
    );

    const ToggleRow = ({ label, description, value, onToggle }: { label: string; description?: string; value: boolean; onToggle: (v: boolean) => void }) => (
        <View style={[styles.toggleRow, { borderBottomColor: colors.border }]}>
            <View style={{ flex: 1 }}>
                <Text style={[styles.toggleLabel, { color: colors.text }]}>{label}</Text>
                {description && <Text style={[styles.toggleDesc, { color: colors.textMuted }]}>{description}</Text>}
            </View>
            <Switch
                value={value}
                onValueChange={onToggle}
                trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
                thumbColor={value ? '#25D366' : '#9CA3AF'}
            />
        </View>
    );

    // ─── RENDER ───

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={20} color={colors.text} />
                </TouchableOpacity>
                <Settings size={22} color="#25D366" />
                <Text style={[styles.headerTitle, { color: colors.text }]}>Configurações WhatsApp</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.saveBtn, { backgroundColor: hasChanges ? '#25D366' : colors.disabled }]}
                    disabled={!hasChanges || saving}
                >
                    {saving ? <ActivityIndicator size="small" color="#FFF" /> : (
                        <>
                            <Save size={14} color="#FFF" />
                            <Text style={styles.saveBtnText}>Salvar</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* ═══ 1. Conexão Evolution API ═══ */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <SectionHeader icon={Server} title="Conexão Evolution API" color="#6366F1" />

                    <FieldRow label="URL do Servidor Evolution">
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                            value={settings.evolutionApiUrl || ''}
                            onChangeText={v => updateField('evolutionApiUrl', v)}
                            placeholder="https://api.evolution.com"
                            placeholderTextColor={colors.textMuted}
                            autoCapitalize="none"
                        />
                    </FieldRow>

                    <FieldRow label="API Key">
                        <View style={styles.tokenRow}>
                            <TextInput
                                style={[styles.input, styles.tokenInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                                value={settings.evolutionApiKey || ''}
                                onChangeText={v => updateField('evolutionApiKey', v)}
                                secureTextEntry={!showApiKey}
                                placeholder="sua-api-key-aqui"
                                placeholderTextColor={colors.textMuted}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={[styles.iconBtn, { backgroundColor: colors.backgroundSecondary }]}
                                onPress={() => setShowApiKey(!showApiKey)}
                            >
                                {showApiKey ? <EyeOff size={16} color={colors.textMuted} /> : <Eye size={16} color={colors.textMuted} />}
                            </TouchableOpacity>
                        </View>
                    </FieldRow>

                    {/* Test connection */}
                    <TouchableOpacity
                        style={[styles.testBtn, { borderColor: testingEvolution ? colors.textMuted : '#6366F1' }]}
                        onPress={handleTestEvolution}
                        disabled={testingEvolution}
                    >
                        {testingEvolution ? <ActivityIndicator size="small" color="#6366F1" /> : <Zap size={16} color="#6366F1" />}
                        <Text style={{ color: '#6366F1', fontWeight: '600', fontSize: Typography.sizes.sm }}>
                            {testingEvolution ? 'Testando...' : 'Testar Conexão'}
                        </Text>
                    </TouchableOpacity>

                    {evolutionTestResult && (
                        <View style={[styles.testResult, { backgroundColor: evolutionTestResult.success ? '#D1FAE5' : '#FEE2E2' }]}>
                            {evolutionTestResult.success
                                ? <CheckCircle2 size={16} color="#065F46" />
                                : <XCircle size={16} color="#991B1B" />
                            }
                            <Text style={{ color: evolutionTestResult.success ? '#065F46' : '#991B1B', fontSize: Typography.sizes.sm, flex: 1 }}>
                                {evolutionTestResult.message}
                            </Text>
                        </View>
                    )}

                    <View style={[styles.infoBox, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
                        <Globe size={14} color="#2563EB" />
                        <Text style={{ color: '#1E40AF', fontSize: 11, flex: 1 }}>
                            A Evolution API permite conectar múltiplos números WhatsApp. Configure a URL e API Key do seu servidor Evolution para gerenciar canais.
                        </Text>
                    </View>
                </View>

                {/* ═══ 2. API Oficial Meta (WABA) ═══ */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <SectionHeader icon={Shield} title="API Oficial Meta (WABA)" color="#1877F2" />

                    <View style={[styles.infoBox, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', marginBottom: Spacing.md }]}>
                        <Globe size={14} color="#2563EB" />
                        <Text style={{ color: '#1E40AF', fontSize: 11, flex: 1 }}>
                            Configure as credenciais da API oficial do WhatsApp Business (Meta). Obtenha o Access Token e Phone Number ID no painel da Meta for Developers.
                        </Text>
                    </View>

                    {/* Webhook URL (auto-generated, read-only) */}
                    <FieldRow label="Webhook URL (cole na Meta)">
                        <View style={styles.tokenRow}>
                            <TextInput
                                style={[styles.input, styles.tokenInput, { color: colors.text, borderColor: colors.border, backgroundColor: '#F0F9FF' }]}
                                value={`${settings.webhookUrl || (typeof window !== 'undefined' ? window.location.origin.replace(':8081', ':3000') : 'https://seu-servidor.com')}/whatsapp/webhook`}
                                editable={false}
                                selectTextOnFocus
                            />
                            <TouchableOpacity
                                style={[styles.iconBtn, { backgroundColor: copiedWebhook ? '#D1FAE5' : colors.backgroundSecondary }]}
                                onPress={async () => {
                                    const url = `${settings.webhookUrl || (typeof window !== 'undefined' ? window.location.origin.replace(':8081', ':3000') : 'https://seu-servidor.com')}/whatsapp/webhook`;
                                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                                        await navigator.clipboard.writeText(url);
                                        setCopiedWebhook(true);
                                        setTimeout(() => setCopiedWebhook(false), 2000);
                                    }
                                }}
                            >
                                {copiedWebhook
                                    ? <CheckCircle2 size={16} color="#10B981" />
                                    : <Copy size={16} color={colors.textMuted} />
                                }
                            </TouchableOpacity>
                        </View>
                    </FieldRow>

                    {/* Verify Token */}
                    <FieldRow label="Verify Token (para validação do webhook)">
                        <View style={styles.tokenRow}>
                            <TextInput
                                style={[styles.input, styles.tokenInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                                value={settings.verifyToken || ''}
                                onChangeText={v => updateField('verifyToken', v)}
                                placeholder="token-de-verificacao"
                                placeholderTextColor={colors.textMuted}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={[styles.iconBtn, { backgroundColor: colors.backgroundSecondary }]}
                                onPress={async () => {
                                    if (settings.verifyToken && typeof navigator !== 'undefined' && navigator.clipboard) {
                                        await navigator.clipboard.writeText(settings.verifyToken);
                                    }
                                }}
                            >
                                <Copy size={16} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                    </FieldRow>

                    {/* Access Token */}
                    <FieldRow label="Access Token (Permanent)">
                        <View style={styles.tokenRow}>
                            <TextInput
                                style={[styles.input, styles.tokenInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                                value={settings.accessToken || ''}
                                onChangeText={v => updateField('accessToken', v)}
                                secureTextEntry={!showAccessToken}
                                placeholder="EAAxxxxxxx..."
                                placeholderTextColor={colors.textMuted}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={[styles.iconBtn, { backgroundColor: colors.backgroundSecondary }]}
                                onPress={() => setShowAccessToken(!showAccessToken)}
                            >
                                {showAccessToken ? <EyeOff size={16} color={colors.textMuted} /> : <Eye size={16} color={colors.textMuted} />}
                            </TouchableOpacity>
                        </View>
                    </FieldRow>

                    {/* Phone Number ID */}
                    <FieldRow label="Phone Number ID">
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                            value={settings.phoneNumberId || ''}
                            onChangeText={v => updateField('phoneNumberId', v)}
                            placeholder="1234567890"
                            placeholderTextColor={colors.textMuted}
                            autoCapitalize="none"
                            keyboardType="numeric"
                        />
                    </FieldRow>

                    {/* Business Account ID */}
                    <FieldRow label="Business Account ID">
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                            value={settings.businessAccountId || ''}
                            onChangeText={v => updateField('businessAccountId', v)}
                            placeholder="1234567890"
                            placeholderTextColor={colors.textMuted}
                            autoCapitalize="none"
                            keyboardType="numeric"
                        />
                    </FieldRow>

                    {/* API Version */}
                    <FieldRow label="Versão da API">
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary, width: 120 }]}
                            value={settings.apiVersion || 'v21.0'}
                            onChangeText={v => updateField('apiVersion', v)}
                            placeholder="v21.0"
                            placeholderTextColor={colors.textMuted}
                            autoCapitalize="none"
                        />
                    </FieldRow>
                </View>

                {/* ═══ 3. Canais Conectados (Evolution) ═══ */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.sectionHeader, { marginBottom: Spacing.md }]}>
                        <Smartphone size={18} color="#25D366" />
                        <Text style={[styles.sectionTitle, { color: colors.text, flex: 1 }]}>Canais Conectados</Text>
                        <TouchableOpacity
                            onPress={() => setShowCreateModal(true)}
                            style={[styles.addChannelBtn, { backgroundColor: '#25D366' }]}
                        >
                            <Plus size={14} color="#FFF" />
                            <Text style={styles.addChannelBtnText}>Novo Canal</Text>
                        </TouchableOpacity>
                    </View>

                    {loadingChannels ? (
                        <ActivityIndicator size="small" color="#25D366" style={{ paddingVertical: Spacing.lg }} />
                    ) : channels.length === 0 ? (
                        <View style={[styles.emptyState, { borderColor: colors.border }]}>
                            <QrCode size={32} color={colors.textMuted} />
                            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                                Nenhum canal conectado
                            </Text>
                            <Text style={{ color: colors.textMuted, fontSize: Typography.sizes.xs, textAlign: 'center' }}>
                                Clique em "Novo Canal" para adicionar um número WhatsApp via QR Code
                            </Text>
                        </View>
                    ) : (
                        <View style={{ gap: Spacing.sm }}>
                            {channels.map(channel => {
                                const StatusIcon = getStatusIcon(channel.status);
                                return (
                                    <View key={channel.id} style={[styles.channelCard, { borderColor: colors.border }]}>
                                        <View style={[styles.channelAvatar, { backgroundColor: getStatusColor(channel.status) + '20' }]}>
                                            <Phone size={18} color={getStatusColor(channel.status)} />
                                        </View>
                                        <View style={styles.channelInfo}>
                                            <Text style={[styles.channelName, { color: colors.text }]}>
                                                {channel.instanceName}
                                            </Text>
                                            <View style={styles.channelMetaRow}>
                                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(channel.status) + '20' }]}>
                                                    <StatusIcon size={10} color={getStatusColor(channel.status)} />
                                                    <Text style={{ color: getStatusColor(channel.status), fontSize: 10, fontWeight: '600' }}>
                                                        {getStatusLabel(channel.status)}
                                                    </Text>
                                                </View>
                                                {channel.phone && (
                                                    <Text style={{ color: colors.textMuted, fontSize: Typography.sizes.xs }}>
                                                        {channel.phone}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        <View style={styles.channelActions}>
                                            {channel.status !== 'CONNECTED' && (
                                                <TouchableOpacity
                                                    onPress={() => handleShowQr(channel)}
                                                    style={[styles.channelActionBtn, { backgroundColor: '#EFF6FF' }]}
                                                >
                                                    <QrCode size={14} color="#2563EB" />
                                                </TouchableOpacity>
                                            )}
                                            <TouchableOpacity
                                                onPress={() => handleDeleteChannel(channel)}
                                                style={[styles.channelActionBtn, { backgroundColor: '#FEE2E2' }]}
                                            >
                                                <Trash2 size={14} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    <TouchableOpacity onPress={loadChannels} style={styles.refreshRow}>
                        <RefreshCw size={12} color={colors.textMuted} />
                        <Text style={{ color: colors.textMuted, fontSize: Typography.sizes.xs }}>Atualizar lista</Text>
                    </TouchableOpacity>
                </View>

                {/* ═══ 3. Bot ═══ */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <SectionHeader icon={Bot} title="Bot Automático" color="#10B981" />

                    <ToggleRow
                        label="Bot ativado"
                        description="Responder automaticamente novas conversas"
                        value={settings.botEnabled}
                        onToggle={v => updateField('botEnabled', v)}
                    />

                    <FieldRow label="Mensagem de boas-vindas">
                        <TextInput
                            style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                            value={settings.welcomeMessage || ''}
                            onChangeText={v => updateField('welcomeMessage', v)}
                            placeholder="Olá! 👋 Bem-vindo ao atendimento..."
                            placeholderTextColor={colors.textMuted}
                            multiline
                            numberOfLines={3}
                        />
                    </FieldRow>

                    <FieldRow label="Mensagem fora do expediente">
                        <TextInput
                            style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                            value={settings.offlineMessage || ''}
                            onChangeText={v => updateField('offlineMessage', v)}
                            placeholder="Nosso atendimento funciona de segunda a sexta..."
                            placeholderTextColor={colors.textMuted}
                            multiline
                            numberOfLines={3}
                        />
                    </FieldRow>
                </View>

                {/* ═══ 4. Horário de Atendimento ═══ */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <SectionHeader icon={Clock} title="Horário de Atendimento" color="#F59E0B" />

                    <View style={styles.hoursRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Início</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                                value={settings.businessHoursStart}
                                onChangeText={v => updateField('businessHoursStart', v)}
                                placeholder="08:00"
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Fim</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                                value={settings.businessHoursEnd}
                                onChangeText={v => updateField('businessHoursEnd', v)}
                                placeholder="18:00"
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>
                    </View>

                    <FieldRow label="Dias de funcionamento">
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                            value={settings.businessDays}
                            onChangeText={v => updateField('businessDays', v)}
                            placeholder="segunda a sexta"
                            placeholderTextColor={colors.textMuted}
                        />
                    </FieldRow>
                </View>

                {/* ═══ 5. Atendimento ═══ */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <SectionHeader icon={Users} title="Atendimento" color="#8B5CF6" />

                    <ToggleRow
                        label="Auto-atribuição"
                        description="Atribuir conversas automaticamente a atendentes disponíveis"
                        value={settings.autoAssignEnabled}
                        onToggle={v => updateField('autoAssignEnabled', v)}
                    />

                    <FieldRow label="Máx. de chats simultâneos por atendente">
                        <TextInput
                            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary, width: 80 }]}
                            value={String(settings.maxConcurrentChats)}
                            onChangeText={v => updateField('maxConcurrentChats', parseInt(v) || 5)}
                            keyboardType="numeric"
                        />
                    </FieldRow>
                </View>

                {/* ═══ 6. Notificações ═══ */}
                <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <SectionHeader icon={Bell} title="Notificações" color="#EC4899" />

                    <ToggleRow
                        label="Nova conversa"
                        description="Notificar quando uma nova conversa chegar"
                        value={settings.notifyNewConversation}
                        onToggle={v => updateField('notifyNewConversation', v)}
                    />

                    <ToggleRow
                        label="Transferência"
                        description="Notificar quando uma conversa for transferida"
                        value={settings.notifyTransfer}
                        onToggle={v => updateField('notifyTransfer', v)}
                    />

                    <ToggleRow
                        label="Sons"
                        description="Reproduzir som ao receber mensagens"
                        value={settings.soundEnabled}
                        onToggle={v => updateField('soundEnabled', v)}
                    />
                </View>

                <View style={{ height: Spacing.xxl }} />
            </ScrollView>

            {/* ═══ Create Channel Modal ═══ */}
            <Modal visible={showCreateModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modal, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                📱 Novo Canal WhatsApp
                            </Text>
                            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                <X size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nome da Instância</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                                value={newChannelName}
                                onChangeText={setNewChannelName}
                                placeholder="ex: gabinete-principal"
                                placeholderTextColor={colors.textMuted}
                                autoCapitalize="none"
                            />
                            <Text style={{ color: colors.textMuted, fontSize: Typography.sizes.xs, marginTop: 4 }}>
                                Use apenas letras minúsculas, números e hífens. Sem espaços.
                            </Text>
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setShowCreateModal(false)}>
                                <Text style={{ color: colors.text }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.submitBtn, { backgroundColor: newChannelName.trim() ? '#25D366' : colors.disabled }]}
                                onPress={handleCreateChannel}
                                disabled={!newChannelName.trim() || creating}
                            >
                                {creating ? <ActivityIndicator size="small" color="#FFF" /> : (
                                    <>
                                        <Plus size={14} color="#FFF" />
                                        <Text style={styles.submitBtnText}> Criar Canal</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ═══ QR Code Modal ═══ */}
            <Modal visible={showQrModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modal, { backgroundColor: colors.card, maxWidth: 400 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                📷 Escanear QR Code
                            </Text>
                            <TouchableOpacity onPress={closeQrModal}>
                                <X size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                        <View style={[styles.modalBody, { alignItems: 'center' }]}>
                            {qrData?.base64 ? (
                                <Image
                                    source={{ uri: qrData.base64.startsWith('data:') ? qrData.base64 : `data:image/png;base64,${qrData.base64}` }}
                                    style={styles.qrImage}
                                    resizeMode="contain"
                                />
                            ) : qrData?.code ? (
                                <View style={styles.qrCodeBox}>
                                    <QrCode size={64} color="#25D366" />
                                    <Text style={{ color: colors.text, fontSize: Typography.sizes.sm, textAlign: 'center', marginTop: Spacing.md }}>
                                        Use o código de pareamento:
                                    </Text>
                                    <Text style={[styles.pairingCode, { color: '#25D366' }]}>
                                        {qrData.pairingCode || qrData.code}
                                    </Text>
                                </View>
                            ) : (
                                <View style={styles.qrCodeBox}>
                                    <ActivityIndicator size="large" color="#25D366" />
                                    <Text style={{ color: colors.textMuted, marginTop: Spacing.md }}>Gerando QR Code...</Text>
                                </View>
                            )}

                            {pollingStatus && (
                                <View style={[styles.pollingBadge, { backgroundColor: '#FEF3C7' }]}>
                                    <ActivityIndicator size="small" color="#D97706" />
                                    <Text style={{ color: '#92400E', fontSize: Typography.sizes.xs, fontWeight: '500' }}>
                                        Aguardando conexão... Escaneie o QR Code no WhatsApp do celular
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={[styles.modalFooter, { justifyContent: 'center' }]}>
                            <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={closeQrModal}>
                                <Text style={{ color: colors.text }}>Fechar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, gap: Spacing.sm, ...Shadows.sm },
    backBtn: { padding: Spacing.xs },
    headerTitle: { flex: 1, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
    saveBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md },
    saveBtnText: { color: '#FFF', fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { padding: Spacing.lg, gap: Spacing.md },

    // Sections
    section: { borderWidth: 1, borderRadius: Radius.xl, padding: Spacing.lg, ...Shadows.sm },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.lg },
    sectionTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold },

    // Fields
    fieldRow: { marginBottom: Spacing.md },
    fieldLabel: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium, marginBottom: 6 },
    input: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.sizes.base },
    textArea: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.sizes.base, minHeight: 80, textAlignVertical: 'top' },
    tokenRow: { flexDirection: 'row', gap: Spacing.sm },
    tokenInput: { flex: 1 },
    iconBtn: { width: 44, height: 44, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },

    // Toggle
    toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: Spacing.md, borderBottomWidth: 1 },
    toggleLabel: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.medium },
    toggleDesc: { fontSize: Typography.sizes.xs, marginTop: 2 },

    // Hours
    hoursRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },

    // Test
    testBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginTop: Spacing.sm },
    testResult: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, marginTop: Spacing.sm },

    // Info
    infoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1, marginTop: Spacing.md },

    // Channels
    addChannelBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.md },
    addChannelBtnText: { color: '#FFF', fontSize: Typography.sizes.xs, fontWeight: Typography.weights.semibold },
    emptyState: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm, borderWidth: 1, borderStyle: 'dashed', borderRadius: Radius.lg },
    emptyText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
    channelCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderWidth: 1, borderRadius: Radius.lg, gap: Spacing.md },
    channelAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    channelInfo: { flex: 1 },
    channelName: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold },
    channelMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 2 },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm },
    channelActions: { flexDirection: 'row', gap: Spacing.sm },
    channelActionBtn: { width: 32, height: 32, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
    refreshRow: { flexDirection: 'row', alignItems: 'center', gap: 4, justifyContent: 'center', marginTop: Spacing.md, paddingVertical: Spacing.xs },

    // Modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modal: { width: '90%', maxWidth: 520, borderRadius: Radius.xl, ...Shadows.xl },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    modalTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold },
    modalBody: { padding: Spacing.lg },
    modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm, padding: Spacing.lg, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
    cancelBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
    submitBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: Radius.md },
    submitBtnText: { color: '#FFF', fontWeight: Typography.weights.semibold },

    // QR Code
    qrImage: { width: 280, height: 280, borderRadius: Radius.lg },
    qrCodeBox: { alignItems: 'center', paddingVertical: Spacing.xl },
    pairingCode: { fontSize: 24, fontWeight: '700', letterSpacing: 4, marginTop: Spacing.sm },
    pollingBadge: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, marginTop: Spacing.lg, width: '100%' },
});
