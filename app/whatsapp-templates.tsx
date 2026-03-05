import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    Platform,
    ActivityIndicator,
    ScrollView,
    Modal,
} from 'react-native';
import { router } from 'expo-router';
import {
    ArrowLeft,
    Plus,
    Trash2,
    Edit3,
    Send,
    RefreshCw,
    FileText,
    CheckCircle,
    Clock,
    XCircle,
    Search,
    X,
    ChevronDown,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, Radius, Typography, Shadows } from '@/constants/colors';
import {
    whatsappTemplateService,
    WhatsappTemplate,
    CreateTemplatePayload,
} from '@/services/whatsappTemplate.service';

// ─── Status visual ───
const StatusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
    APPROVED: { icon: CheckCircle, color: '#065F46', bg: '#D1FAE5', label: 'Aprovado' },
    PENDING: { icon: Clock, color: '#92400E', bg: '#FEF3C7', label: 'Pendente' },
    REJECTED: { icon: XCircle, color: '#991B1B', bg: '#FEE2E2', label: 'Rejeitado' },
};

const CategoryLabels: Record<string, string> = {
    UTILITY: 'Utilidade',
    MARKETING: 'Marketing',
    AUTHENTICATION: 'Autenticação',
};

export default function WhatsappTemplatesScreen() {
    const { colors } = useTheme();

    const [templates, setTemplates] = useState<WhatsappTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSendModal, setShowSendModal] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<WhatsappTemplate | null>(null);

    // Formulário de criação
    const [formName, setFormName] = useState('');
    const [formCategory, setFormCategory] = useState<'UTILITY' | 'MARKETING' | 'AUTHENTICATION'>('UTILITY');
    const [formLanguage, setFormLanguage] = useState('pt_BR');
    const [formBodyText, setFormBodyText] = useState('');
    const [formFooterText, setFormFooterText] = useState('');
    const [formSaving, setFormSaving] = useState(false);

    // Formulário de envio
    const [sendPhone, setSendPhone] = useState('');
    const [sendSending, setSendSending] = useState(false);

    const loadTemplates = useCallback(async () => {
        try {
            setLoading(true);
            const data = await whatsappTemplateService.getAll();
            setTemplates(data);
        } catch (error) {
            console.error('Erro ao carregar templates:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTemplates();
    }, []);

    const filtered = templates.filter(t => {
        if (!searchText) return true;
        return t.name.toLowerCase().includes(searchText.toLowerCase());
    });

    // ─── Criar template ───
    const handleCreate = async () => {
        if (!formName.trim() || !formBodyText.trim()) return;
        setFormSaving(true);

        const components: any[] = [
            { type: 'BODY', text: formBodyText },
        ];
        if (formFooterText.trim()) {
            components.push({ type: 'FOOTER', text: formFooterText });
        }

        try {
            await whatsappTemplateService.create({
                name: formName.toLowerCase().replace(/\s+/g, '_'),
                category: formCategory,
                language: formLanguage,
                components,
            });
            setShowCreateModal(false);
            resetForm();
            loadTemplates();
        } catch (error: any) {
            console.error('Erro ao criar template:', error.message);
        } finally {
            setFormSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await whatsappTemplateService.delete(id);
            loadTemplates();
        } catch (error: any) {
            console.error('Erro ao deletar:', error.message);
        }
    };

    const handleSync = async () => {
        try {
            await whatsappTemplateService.sync();
            loadTemplates();
        } catch (error: any) {
            console.error('Erro ao sincronizar:', error.message);
        }
    };

    // ─── Enviar template ───
    const handleSend = async () => {
        if (!sendPhone.trim() || !selectedTemplate) return;
        setSendSending(true);
        try {
            await whatsappTemplateService.send({
                phone: sendPhone.replace(/\D/g, ''),
                templateName: selectedTemplate.name,
                languageCode: selectedTemplate.language,
            });
            setShowSendModal(false);
            setSendPhone('');
            setSelectedTemplate(null);
        } catch (error: any) {
            console.error('Erro ao enviar:', error.message);
        } finally {
            setSendSending(false);
        }
    };

    const resetForm = () => {
        setFormName('');
        setFormCategory('UTILITY');
        setFormLanguage('pt_BR');
        setFormBodyText('');
        setFormFooterText('');
    };

    // ─── Extrair preview de texto do body ───
    const getBodyPreview = (template: WhatsappTemplate): string => {
        const bodyComp = template.components?.find((c: any) => c.type === 'BODY');
        return bodyComp?.text || '(sem conteúdo)';
    };

    // ═══ RENDER ═══
    const renderTemplateCard = ({ item }: { item: WhatsappTemplate }) => {
        const statusCfg = StatusConfig[item.status] || StatusConfig.PENDING;
        const StatusIcon = statusCfg.icon;

        return (
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                        <FileText size={18} color={colors.primary} />
                        <Text style={[styles.cardName, { color: colors.text }]}>{item.name}</Text>
                    </View>
                    <View style={[styles.statusChip, { backgroundColor: statusCfg.bg }]}>
                        <StatusIcon size={12} color={statusCfg.color} />
                        <Text style={[styles.statusChipText, { color: statusCfg.color }]}>{statusCfg.label}</Text>
                    </View>
                </View>

                {/* Body preview */}
                <Text style={[styles.bodyPreview, { color: colors.textSecondary }]} numberOfLines={3}>
                    {getBodyPreview(item)}
                </Text>

                {/* Meta info */}
                <View style={styles.metaRow}>
                    <View style={[styles.metaChip, { backgroundColor: colors.backgroundSecondary }]}>
                        <Text style={[styles.metaChipText, { color: colors.textMuted }]}>
                            {CategoryLabels[item.category] || item.category}
                        </Text>
                    </View>
                    <View style={[styles.metaChip, { backgroundColor: colors.backgroundSecondary }]}>
                        <Text style={[styles.metaChipText, { color: colors.textMuted }]}>{item.language}</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.cardActions}>
                    {item.status === 'APPROVED' && (
                        <TouchableOpacity
                            style={[styles.actionBtn, { backgroundColor: '#D1FAE5' }]}
                            onPress={() => {
                                setSelectedTemplate(item);
                                setShowSendModal(true);
                            }}
                        >
                            <Send size={14} color="#065F46" />
                            <Text style={[styles.actionBtnText, { color: '#065F46' }]}>Enviar</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
                        onPress={() => handleDelete(item.id)}
                    >
                        <Trash2 size={14} color="#991B1B" />
                        <Text style={[styles.actionBtnText, { color: '#991B1B' }]}>Excluir</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Templates WhatsApp</Text>
                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={handleSync} style={[styles.iconBtn, { backgroundColor: colors.backgroundSecondary }]}>
                        <RefreshCw size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setShowCreateModal(true)}
                        style={[styles.primaryBtn, { backgroundColor: '#25D366' }]}
                    >
                        <Plus size={16} color="#FFF" />
                        <Text style={styles.primaryBtnText}>Novo Template</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search */}
            <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary }]}>
                <Search size={16} color={colors.textMuted} />
                <TextInput
                    style={[styles.searchInput, { color: colors.text }]}
                    placeholder="Buscar templates..."
                    placeholderTextColor={colors.textMuted}
                    value={searchText}
                    onChangeText={setSearchText}
                />
            </View>

            {/* List */}
            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#25D366" />
                </View>
            ) : filtered.length === 0 ? (
                <View style={styles.centered}>
                    <FileText size={48} color={colors.textMuted} />
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>Nenhum template encontrado</Text>
                    <Text style={[styles.emptySubText, { color: colors.textMuted }]}>
                        Crie um template para iniciar conversas fora da janela de 24h
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item.id}
                    renderItem={renderTemplateCard}
                    contentContainerStyle={styles.list}
                    numColumns={Platform.OS === 'web' ? 2 : 1}
                    key={Platform.OS === 'web' ? '2col' : '1col'}
                />
            )}

            {/* ═══ Create Modal ═══ */}
            <Modal visible={showCreateModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modal, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Novo Template</Text>
                            <TouchableOpacity onPress={() => { setShowCreateModal(false); resetForm(); }}>
                                <X size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>Nome (lowercase, sem espaços)</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                                placeholder="nome_do_template"
                                placeholderTextColor={colors.textMuted}
                                value={formName}
                                onChangeText={setFormName}
                                autoCapitalize="none"
                            />

                            <Text style={[styles.label, { color: colors.textSecondary }]}>Categoria</Text>
                            <View style={styles.categoryRow}>
                                {(['UTILITY', 'MARKETING', 'AUTHENTICATION'] as const).map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        style={[
                                            styles.categoryChip,
                                            {
                                                backgroundColor: formCategory === cat ? '#25D366' : colors.backgroundSecondary,
                                                borderColor: formCategory === cat ? '#25D366' : colors.border,
                                            },
                                        ]}
                                        onPress={() => setFormCategory(cat)}
                                    >
                                        <Text style={{
                                            color: formCategory === cat ? '#FFF' : colors.text,
                                            fontSize: Typography.sizes.sm,
                                            fontWeight: Typography.weights.medium,
                                        }}>
                                            {CategoryLabels[cat]}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text style={[styles.label, { color: colors.textSecondary }]}>Idioma</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                                value={formLanguage}
                                onChangeText={setFormLanguage}
                            />

                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                Corpo da mensagem (use {'{{1}}'}, {'{{2}}'} para variáveis)
                            </Text>
                            <TextInput
                                style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                                placeholder="Olá {{1}}, sua solicitação {{2}} foi atualizada."
                                placeholderTextColor={colors.textMuted}
                                value={formBodyText}
                                onChangeText={setFormBodyText}
                                multiline
                                numberOfLines={4}
                            />

                            <Text style={[styles.label, { color: colors.textSecondary }]}>Rodapé (opcional)</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                                placeholder="Gabinete do Vereador"
                                placeholderTextColor={colors.textMuted}
                                value={formFooterText}
                                onChangeText={setFormFooterText}
                            />
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.cancelBtn, { borderColor: colors.border }]}
                                onPress={() => { setShowCreateModal(false); resetForm(); }}
                            >
                                <Text style={{ color: colors.text }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.submitBtn, {
                                    backgroundColor: formName && formBodyText ? '#25D366' : colors.disabled,
                                }]}
                                onPress={handleCreate}
                                disabled={!formName || !formBodyText || formSaving}
                            >
                                {formSaving
                                    ? <ActivityIndicator size="small" color="#FFF" />
                                    : <Text style={styles.submitBtnText}>Criar e Submeter</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ═══ Send Modal ═══ */}
            <Modal visible={showSendModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modal, { backgroundColor: colors.card, maxHeight: 340 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                Enviar Template: {selectedTemplate?.name}
                            </Text>
                            <TouchableOpacity onPress={() => { setShowSendModal(false); setSendPhone(''); }}>
                                <X size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <Text style={[styles.label, { color: colors.textSecondary }]}>
                                Telefone do destinatário (com DDI: 5511999998888)
                            </Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                                placeholder="5511999998888"
                                placeholderTextColor={colors.textMuted}
                                value={sendPhone}
                                onChangeText={setSendPhone}
                                keyboardType="phone-pad"
                            />

                            <View style={[styles.previewBox, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
                                <Text style={[styles.previewLabel, { color: colors.textMuted }]}>Preview:</Text>
                                <Text style={[styles.previewText, { color: colors.text }]}>
                                    {selectedTemplate ? getBodyPreview(selectedTemplate) : ''}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.cancelBtn, { borderColor: colors.border }]}
                                onPress={() => { setShowSendModal(false); setSendPhone(''); }}
                            >
                                <Text style={{ color: colors.text }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.submitBtn, {
                                    backgroundColor: sendPhone.trim() ? '#25D366' : colors.disabled,
                                }]}
                                onPress={handleSend}
                                disabled={!sendPhone.trim() || sendSending}
                            >
                                {sendSending
                                    ? <ActivityIndicator size="small" color="#FFF" />
                                    : <>
                                        <Send size={14} color="#FFF" />
                                        <Text style={styles.submitBtnText}> Enviar</Text>
                                    </>
                                }
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );

}

// ═══ Styles ═══
const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', padding: Spacing.lg,
        borderBottomWidth: 1, gap: Spacing.sm, ...Shadows.sm,
    },
    backBtn: { padding: Spacing.xs },
    headerTitle: { flex: 1, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.bold },
    headerActions: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
    iconBtn: { width: 36, height: 36, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
    primaryBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md,
    },
    primaryBtnText: { color: '#FFF', fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },

    searchBar: {
        flexDirection: 'row', alignItems: 'center', margin: Spacing.lg,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.lg, gap: Spacing.sm,
    },
    searchInput: {
        flex: 1, fontSize: Typography.sizes.base,
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}),
    },

    list: { padding: Spacing.lg, gap: Spacing.md },

    card: {
        flex: 1, margin: Spacing.xs, borderWidth: 1, borderRadius: Radius.lg,
        padding: Spacing.lg, ...Shadows.sm, maxWidth: Platform.OS === 'web' ? '49%' : '100%',
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
    cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
    cardName: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
    statusChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.sm,
    },
    statusChipText: { fontSize: 10, fontWeight: Typography.weights.semibold },
    bodyPreview: { fontSize: Typography.sizes.sm, lineHeight: 18, marginBottom: Spacing.md },
    metaRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
    metaChip: { paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.sm },
    metaChipText: { fontSize: 10, fontWeight: Typography.weights.medium },
    cardActions: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'flex-end' },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md,
    },
    actionBtnText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },

    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
    emptyText: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
    emptySubText: { fontSize: Typography.sizes.sm, textAlign: 'center', maxWidth: 300 },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modal: { width: '90%', maxWidth: 520, borderRadius: Radius.xl, ...Shadows.xl },
    modalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
    },
    modalTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold },
    modalBody: { padding: Spacing.lg },
    modalFooter: {
        flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm,
        padding: Spacing.lg, borderTopWidth: 1, borderTopColor: '#E5E7EB',
    },
    label: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium, marginBottom: 6, marginTop: Spacing.md },
    input: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.sizes.base },
    textArea: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.sizes.base, minHeight: 100, textAlignVertical: 'top' },
    categoryRow: { flexDirection: 'row', gap: Spacing.sm },
    categoryChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1 },
    cancelBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
    submitBtn: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: Radius.md,
    },
    submitBtnText: { color: '#FFF', fontWeight: Typography.weights.semibold },
    previewBox: { marginTop: Spacing.md, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
    previewLabel: { fontSize: Typography.sizes.xs, marginBottom: 4 },
    previewText: { fontSize: Typography.sizes.sm, lineHeight: 18 },
});
