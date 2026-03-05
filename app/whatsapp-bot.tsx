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
    Play,
    Pause,
    Bot,
    Settings,
    Zap,
    MessageCircle,
    ArrowRightLeft,
    X,
    Star,
    Copy,
    ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, Radius, Typography, Shadows } from '@/constants/colors';
import {
    whatsappBotService,
    BotFlow,
    BotFlowTemplate,
} from '@/services/whatsappBot.service';

const StepTypeConfig: Record<string, { icon: any; color: string; label: string }> = {
    greeting: { icon: MessageCircle, color: '#10B981', label: 'Saudação' },
    menu: { icon: Settings, color: '#3B82F6', label: 'Menu' },
    text_response: { icon: MessageCircle, color: '#6366F1', label: 'Resposta' },
    collect_info: { icon: Settings, color: '#F59E0B', label: 'Coletar Info' },
    transfer_to_human: { icon: ArrowRightLeft, color: '#EF4444', label: 'Transferir' },
    send_template: { icon: Zap, color: '#8B5CF6', label: 'Template' },
    end: { icon: X, color: '#6B7280', label: 'Encerrar' },
};

export default function WhatsappBotScreen() {
    const { colors } = useTheme();

    const [flows, setFlows] = useState<BotFlow[]>([]);
    const [templates, setTemplates] = useState<BotFlowTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedFlow, setSelectedFlow] = useState<BotFlow | null>(null);

    // Create form
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formKeywords, setFormKeywords] = useState('');
    const [formIsDefault, setFormIsDefault] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<BotFlowTemplate | null>(null);
    const [saving, setSaving] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [flowData, templateData] = await Promise.all([
                whatsappBotService.getFlows(),
                whatsappBotService.getTemplates(),
            ]);
            setFlows(flowData);
            setTemplates(templateData);
        } catch (e) {
            console.error('Erro ao carregar bot:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, []);

    const handleCreate = async () => {
        if (!formName.trim() || !selectedTemplate) return;
        setSaving(true);
        try {
            await whatsappBotService.createFlow({
                name: formName,
                description: formDescription || undefined,
                steps: selectedTemplate.steps,
                entryStepId: selectedTemplate.entryStepId,
                triggerKeywords: formKeywords ? formKeywords.split(',').map(k => k.trim()) : [],
                isDefault: formIsDefault,
            });
            setShowCreateModal(false);
            resetForm();
            loadData();
        } catch (e: any) { console.error(e.message); }
        finally { setSaving(false); }
    };

    const handleToggle = async (id: string) => {
        try {
            await whatsappBotService.toggleFlow(id);
            loadData();
        } catch (e: any) { console.error(e.message); }
    };

    const handleDelete = async (id: string) => {
        try {
            await whatsappBotService.deleteFlow(id);
            loadData();
        } catch (e: any) { console.error(e.message); }
    };

    const resetForm = () => {
        setFormName('');
        setFormDescription('');
        setFormKeywords('');
        setFormIsDefault(false);
        setSelectedTemplate(null);
    };

    // ═══ RENDER ═══

    const renderFlowCard = ({ item }: { item: BotFlow }) => {
        const isActive = item.status === 'active';
        return (
            <View style={[styles.flowCard, { backgroundColor: colors.card, borderColor: isActive ? '#25D366' : colors.border }]}>
                <View style={styles.flowHeader}>
                    <View style={styles.flowTitleRow}>
                        <Bot size={20} color={isActive ? '#25D366' : colors.textMuted} />
                        <Text style={[styles.flowName, { color: colors.text }]}>{item.name}</Text>
                        {item.isDefault && (
                            <View style={[styles.defaultChip, { backgroundColor: '#FEF3C7' }]}>
                                <Star size={10} color="#92400E" />
                                <Text style={{ color: '#92400E', fontSize: 10, fontWeight: '600' }}>Padrão</Text>
                            </View>
                        )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isActive ? '#D1FAE5' : '#F3F4F6' }]}>
                        <View style={[styles.statusDot, { backgroundColor: isActive ? '#10B981' : '#9CA3AF' }]} />
                        <Text style={{ color: isActive ? '#065F46' : '#6B7280', fontSize: 11, fontWeight: '600' }}>
                            {isActive ? 'Ativo' : 'Inativo'}
                        </Text>
                    </View>
                </View>

                {item.description && (
                    <Text style={[styles.flowDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}

                {/* Steps summary */}
                <View style={styles.stepsRow}>
                    {item.steps.slice(0, 5).map(step => {
                        const cfg = StepTypeConfig[step.type] || StepTypeConfig.text_response;
                        const Icon = cfg.icon;
                        return (
                            <View key={step.id} style={[styles.stepChip, { backgroundColor: cfg.color + '15' }]}>
                                <Icon size={10} color={cfg.color} />
                                <Text style={{ fontSize: 9, color: cfg.color, fontWeight: '600' }}>{cfg.label}</Text>
                            </View>
                        );
                    })}
                    {item.steps.length > 5 && (
                        <Text style={[styles.moreSteps, { color: colors.textMuted }]}>+{item.steps.length - 5}</Text>
                    )}
                </View>

                {/* Keywords */}
                {item.triggerKeywords?.length > 0 && (
                    <View style={styles.kwRow}>
                        <Zap size={12} color={colors.textMuted} />
                        <Text style={[styles.kwText, { color: colors.textMuted }]}>
                            {item.triggerKeywords.join(', ')}
                        </Text>
                    </View>
                )}

                {/* Actions */}
                <View style={styles.flowActions}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: isActive ? '#FEE2E2' : '#D1FAE5' }]}
                        onPress={() => handleToggle(item.id)}
                    >
                        {isActive ? <Pause size={14} color="#991B1B" /> : <Play size={14} color="#065F46" />}
                        <Text style={{ color: isActive ? '#991B1B' : '#065F46', fontSize: 12, fontWeight: '600' }}>
                            {isActive ? 'Pausar' : 'Ativar'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={() => { setSelectedFlow(item); setShowDetailModal(true); }}
                    >
                        <Settings size={14} color={colors.textSecondary} />
                        <Text style={{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }}>Ver Fluxo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
                        onPress={() => handleDelete(item.id)}
                    >
                        <Trash2 size={14} color="#991B1B" />
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
                <Bot size={22} color="#25D366" />
                <Text style={[styles.headerTitle, { color: colors.text }]}>Bot & Automação</Text>
                <TouchableOpacity
                    onPress={() => { resetForm(); setShowCreateModal(true); }}
                    style={[styles.primaryBtn, { backgroundColor: '#25D366' }]}
                >
                    <Plus size={16} color="#FFF" />
                    <Text style={styles.primaryBtnText}>Novo Fluxo</Text>
                </TouchableOpacity>
            </View>

            {/* List */}
            {loading ? (
                <View style={styles.centered}><ActivityIndicator size="large" color="#25D366" /></View>
            ) : flows.length === 0 ? (
                <View style={styles.centered}>
                    <Bot size={56} color={colors.textMuted} />
                    <Text style={[styles.emptyText, { color: colors.textMuted }]}>Nenhum fluxo configurado</Text>
                    <Text style={[styles.emptySubText, { color: colors.textMuted }]}>
                        Crie um fluxo para responder automaticamente aos clientes
                    </Text>
                </View>
            ) : (
                <FlatList data={flows} keyExtractor={i => i.id} renderItem={renderFlowCard} contentContainerStyle={styles.list} />
            )}

            {/* ═══ Create Modal ═══ */}
            <Modal visible={showCreateModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modal, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>Novo Fluxo</Text>
                            <TouchableOpacity onPress={() => { setShowCreateModal(false); resetForm(); }}>
                                <X size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nome do fluxo</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                                placeholder="Ex: Atendimento Principal"
                                placeholderTextColor={colors.textMuted}
                                value={formName}
                                onChangeText={setFormName}
                            />

                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Descrição (opcional)</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                                placeholder="Breve descrição"
                                placeholderTextColor={colors.textMuted}
                                value={formDescription}
                                onChangeText={setFormDescription}
                            />

                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Palavras-chave (separadas por vírgula)</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                                placeholder="oi, olá, bom dia"
                                placeholderTextColor={colors.textMuted}
                                value={formKeywords}
                                onChangeText={setFormKeywords}
                            />

                            <TouchableOpacity
                                style={styles.defaultToggle}
                                onPress={() => setFormIsDefault(!formIsDefault)}
                            >
                                <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: formIsDefault ? '#25D366' : 'transparent' }]}>
                                    {formIsDefault && <Text style={{ color: '#FFF', fontSize: 12 }}>✓</Text>}
                                </View>
                                <Text style={[{ color: colors.text, fontSize: Typography.sizes.sm }]}>Definir como fluxo padrão</Text>
                            </TouchableOpacity>

                            <Text style={[styles.fieldLabel, { color: colors.textSecondary, marginTop: Spacing.lg }]}>Selecione um modelo base:</Text>
                            {templates.map(tpl => (
                                <TouchableOpacity
                                    key={tpl.name}
                                    style={[styles.templateCard, {
                                        backgroundColor: selectedTemplate === tpl ? '#25D36610' : colors.backgroundSecondary,
                                        borderColor: selectedTemplate === tpl ? '#25D366' : colors.border,
                                    }]}
                                    onPress={() => setSelectedTemplate(tpl)}
                                >
                                    <Copy size={16} color={selectedTemplate === tpl ? '#25D366' : colors.textMuted} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.templateName, { color: colors.text }]}>{tpl.name}</Text>
                                        <Text style={[styles.templateDesc, { color: colors.textMuted }]}>{tpl.description}</Text>
                                        <Text style={[styles.templateSteps, { color: colors.textMuted }]}>
                                            {tpl.steps.length} etapas
                                        </Text>
                                    </View>
                                    {selectedTemplate === tpl && <View style={[styles.radioSelected, { borderColor: '#25D366' }]} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => { setShowCreateModal(false); resetForm(); }}>
                                <Text style={{ color: colors.text }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.submitBtn, { backgroundColor: formName && selectedTemplate ? '#25D366' : colors.disabled }]}
                                onPress={handleCreate}
                                disabled={!formName || !selectedTemplate || saving}
                            >
                                {saving ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.submitBtnText}>Criar Fluxo</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ═══ Detail Modal ═══ */}
            <Modal visible={showDetailModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modal, { backgroundColor: colors.card, maxWidth: 560 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                🤖 {selectedFlow?.name}
                            </Text>
                            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                                <X size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            {selectedFlow?.steps.map((step, index) => {
                                const cfg = StepTypeConfig[step.type] || StepTypeConfig.text_response;
                                const Icon = cfg.icon;
                                return (
                                    <View key={step.id}>
                                        <View style={[styles.stepDetail, { borderLeftColor: cfg.color }]}>
                                            <View style={styles.stepDetailHeader}>
                                                <Icon size={14} color={cfg.color} />
                                                <Text style={[styles.stepDetailType, { color: cfg.color }]}>{cfg.label}</Text>
                                                <Text style={[styles.stepDetailId, { color: colors.textMuted }]}>#{step.id}</Text>
                                            </View>
                                            <Text style={[styles.stepDetailMsg, { color: colors.text }]}>{step.message}</Text>
                                            {step.options && step.options.map(opt => (
                                                <View key={opt.value} style={[styles.optionItem, { backgroundColor: colors.backgroundSecondary }]}>
                                                    <Text style={{ color: colors.text, fontSize: Typography.sizes.sm }}>
                                                        {opt.label}
                                                    </Text>
                                                    <View style={styles.optionArrow}>
                                                        <ChevronRight size={12} color={colors.textMuted} />
                                                        <Text style={{ color: colors.textMuted, fontSize: 10 }}>{opt.nextStepId}</Text>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                        {index < (selectedFlow?.steps.length || 0) - 1 && (
                                            <View style={styles.stepConnector} />
                                        )}
                                    </View>
                                );
                            })}
                        </ScrollView>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.backgroundSecondary }]} onPress={() => setShowDetailModal(false)}>
                                <Text style={{ color: colors.text, fontWeight: '600' }}>Fechar</Text>
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
    primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md },
    primaryBtnText: { color: '#FFF', fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
    emptyText: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.semibold },
    emptySubText: { fontSize: Typography.sizes.sm, textAlign: 'center', maxWidth: 300 },
    list: { padding: Spacing.lg, gap: Spacing.md },

    // Flow card
    flowCard: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadows.sm },
    flowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
    flowTitleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
    flowName: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold },
    defaultChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.sm, paddingVertical: 3, borderRadius: Radius.full },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    flowDesc: { fontSize: Typography.sizes.sm, marginBottom: Spacing.sm },
    stepsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: Spacing.sm },
    stepChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm },
    moreSteps: { fontSize: 10, alignSelf: 'center' },
    kwRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.md },
    kwText: { fontSize: 11 },
    flowActions: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'flex-end' },
    actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md },

    // Modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modal: { width: '90%', maxWidth: 520, maxHeight: '85%', borderRadius: Radius.xl, ...Shadows.xl },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    modalTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold },
    modalBody: { padding: Spacing.lg },
    modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm, padding: Spacing.lg, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
    fieldLabel: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium, marginBottom: 6, marginTop: Spacing.md },
    input: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.sizes.base },
    cancelBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
    submitBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: Radius.md },
    submitBtnText: { color: '#FFF', fontWeight: Typography.weights.semibold },

    defaultToggle: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md },
    checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },

    templateCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, marginBottom: Spacing.sm },
    templateName: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold },
    templateDesc: { fontSize: Typography.sizes.sm },
    templateSteps: { fontSize: 10, marginTop: 2 },
    radioSelected: { width: 18, height: 18, borderRadius: 9, borderWidth: 5 },

    // Step detail
    stepDetail: { borderLeftWidth: 3, paddingLeft: Spacing.md, paddingVertical: Spacing.sm },
    stepDetailHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
    stepDetailType: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold },
    stepDetailId: { fontSize: 10 },
    stepDetailMsg: { fontSize: Typography.sizes.sm, lineHeight: 18, marginBottom: 4 },
    optionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.sm, borderRadius: Radius.sm, marginTop: 4 },
    optionArrow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    stepConnector: { width: 2, height: 12, backgroundColor: '#D1D5DB', marginLeft: 12 },
});
