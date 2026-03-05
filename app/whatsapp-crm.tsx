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
    Search,
    X,
    Tag,
    Users,
    Mail,
    Phone,
    Building2,
    StickyNote,
    BarChart3,
    Save,
    UserCheck,
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Spacing, Radius, Typography, Shadows } from '@/constants/colors';
import {
    whatsappLabelService,
    whatsappCrmService,
    WhatsappLabel,
    WhatsappCrmContact,
    CrmStats,
} from '@/services/whatsappCrm.service';

const LABEL_COLORS = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#F97316', '#6366F1', '#14B8A6',
];

export default function WhatsappCrmScreen() {
    const { colors } = useTheme();

    const [activeTab, setActiveTab] = useState<'contacts' | 'labels'>('contacts');
    const [contacts, setContacts] = useState<WhatsappCrmContact[]>([]);
    const [labels, setLabels] = useState<WhatsappLabel[]>([]);
    const [stats, setStats] = useState<CrmStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');

    // Label modal
    const [showLabelModal, setShowLabelModal] = useState(false);
    const [labelName, setLabelName] = useState('');
    const [labelColor, setLabelColor] = useState(LABEL_COLORS[0]);
    const [editingLabel, setEditingLabel] = useState<WhatsappLabel | null>(null);

    // Contact detail modal
    const [showContactModal, setShowContactModal] = useState(false);
    const [selectedContact, setSelectedContact] = useState<WhatsappCrmContact | null>(null);
    const [crmForm, setCrmForm] = useState({ name: '', email: '', cpf: '', notes: '', companyName: '' });
    const [saving, setSaving] = useState(false);

    const loadContacts = useCallback(async () => {
        try {
            setLoading(true);
            const [contactData, statsData, labelData] = await Promise.all([
                whatsappCrmService.getAll(searchText || undefined),
                whatsappCrmService.getStats(),
                whatsappLabelService.getAll(),
            ]);
            setContacts(contactData);
            setStats(statsData);
            setLabels(labelData);
        } catch (e) {
            console.error('Erro ao carregar CRM:', e);
        } finally {
            setLoading(false);
        }
    }, [searchText]);

    useEffect(() => { loadContacts(); }, [searchText]);

    // ─── Label CRUD ───
    const handleSaveLabel = async () => {
        if (!labelName.trim()) return;
        try {
            if (editingLabel) {
                await whatsappLabelService.update(editingLabel.id, { name: labelName, color: labelColor });
            } else {
                await whatsappLabelService.create({ name: labelName, color: labelColor });
            }
            setShowLabelModal(false);
            resetLabelForm();
            loadContacts();
        } catch (e: any) { console.error(e.message); }
    };

    const handleDeleteLabel = async (id: string) => {
        try {
            await whatsappLabelService.delete(id);
            loadContacts();
        } catch (e: any) { console.error(e.message); }
    };

    const resetLabelForm = () => { setLabelName(''); setLabelColor(LABEL_COLORS[0]); setEditingLabel(null); };

    // ─── Contact CRM ───
    const openContactDetail = (contact: WhatsappCrmContact) => {
        setSelectedContact(contact);
        setCrmForm({
            name: contact.name || '',
            email: contact.email || '',
            cpf: contact.cpf || '',
            notes: contact.notes || '',
            companyName: contact.companyName || '',
        });
        setShowContactModal(true);
    };

    const handleSaveCrm = async () => {
        if (!selectedContact) return;
        setSaving(true);
        try {
            await whatsappCrmService.updateCrm(selectedContact.id, crmForm);
            setShowContactModal(false);
            loadContacts();
        } catch (e: any) { console.error(e.message); }
        finally { setSaving(false); }
    };

    // ─── Toggle label on contact ───
    const handleToggleLabel = async (contact: WhatsappCrmContact, label: WhatsappLabel) => {
        const hasLabel = contact.labels?.some(l => l.id === label.id);
        try {
            if (hasLabel) {
                await whatsappLabelService.removeFromContact(label.id, contact.id);
            } else {
                await whatsappLabelService.addToContact(label.id, contact.id);
            }
            loadContacts();
        } catch (e: any) { console.error(e.message); }
    };

    // ═══════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════

    const renderStatsBar = () => {
        if (!stats) return null;
        const items = [
            { label: 'Total', value: stats.total, icon: Users, color: '#3B82F6' },
            { label: 'Com E-mail', value: stats.withEmail, icon: Mail, color: '#10B981' },
            { label: 'Com CPF', value: stats.withCpf, icon: UserCheck, color: '#8B5CF6' },
            { label: 'Com Empresa', value: stats.withCompany, icon: Building2, color: '#F59E0B' },
            { label: 'Vinculado', value: stats.linkedToVoter, icon: BarChart3, color: '#EC4899' },
        ];
        return (
            <View style={styles.statsRow}>
                {items.map(item => {
                    const Icon = item.icon;
                    return (
                        <View key={item.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            <Icon size={18} color={item.color} />
                            <Text style={[styles.statValue, { color: colors.text }]}>{item.value}</Text>
                            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{item.label}</Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    const renderContactCard = ({ item }: { item: WhatsappCrmContact }) => (
        <TouchableOpacity
            style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => openContactDetail(item)}
        >
            <View style={[styles.contactAvatar, { backgroundColor: '#25D366' }]}>
                <Text style={styles.contactAvatarText}>
                    {(item.name || item.phone || '?')[0].toUpperCase()}
                </Text>
            </View>
            <View style={styles.contactInfo}>
                <Text style={[styles.contactName, { color: colors.text }]} numberOfLines={1}>
                    {item.name || 'Sem nome'}
                </Text>
                <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>{item.phone}</Text>
                {item.labels && item.labels.length > 0 && (
                    <View style={styles.labelsRow}>
                        {item.labels.map(label => (
                            <View key={label.id} style={[styles.labelChip, { backgroundColor: label.color + '20' }]}>
                                <View style={[styles.labelDot, { backgroundColor: label.color }]} />
                                <Text style={[styles.labelChipText, { color: label.color }]}>{label.name}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
            <View style={styles.contactMeta}>
                {item.email && <Mail size={14} color={colors.textMuted} />}
                {item.companyName && <Building2 size={14} color={colors.textMuted} />}
            </View>
        </TouchableOpacity>
    );

    const renderLabelCard = ({ item }: { item: WhatsappLabel }) => (
        <View style={[styles.labelCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.labelColorBar, { backgroundColor: item.color }]} />
            <View style={styles.labelCardInfo}>
                <Text style={[styles.labelCardName, { color: colors.text }]}>{item.name}</Text>
                <Text style={[styles.labelCardCount, { color: colors.textMuted }]}>
                    {item.contacts?.length || 0} contatos
                </Text>
            </View>
            <View style={styles.labelCardActions}>
                <TouchableOpacity onPress={() => { setEditingLabel(item); setLabelName(item.name); setLabelColor(item.color); setShowLabelModal(true); }}>
                    <Edit3 size={16} color={colors.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteLabel(item.id)}>
                    <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={20} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>CRM & Labels</Text>
                <TouchableOpacity
                    onPress={() => { resetLabelForm(); setShowLabelModal(true); }}
                    style={[styles.primaryBtn, { backgroundColor: '#25D366' }]}
                >
                    <Plus size={16} color="#FFF" />
                    <Text style={styles.primaryBtnText}>Nova Label</Text>
                </TouchableOpacity>
            </View>

            {/* Stats */}
            {renderStatsBar()}

            {/* Tabs */}
            <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
                {(['contacts', 'labels'] as const).map(tab => (
                    <TouchableOpacity
                        key={tab}
                        style={[styles.tab, activeTab === tab && { borderBottomColor: '#25D366', borderBottomWidth: 2 }]}
                        onPress={() => setActiveTab(tab)}
                    >
                        <Text style={[styles.tabText, { color: activeTab === tab ? '#25D366' : colors.textMuted }]}>
                            {tab === 'contacts' ? `Contatos (${contacts.length})` : `Labels (${labels.length})`}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Search (contacts only) */}
            {activeTab === 'contacts' && (
                <View style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary }]}>
                    <Search size={16} color={colors.textMuted} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text }]}
                        placeholder="Buscar por nome, telefone, e-mail..."
                        placeholderTextColor={colors.textMuted}
                        value={searchText}
                        onChangeText={setSearchText}
                    />
                </View>
            )}

            {/* List */}
            {loading ? (
                <View style={styles.centered}><ActivityIndicator size="large" color="#25D366" /></View>
            ) : activeTab === 'contacts' ? (
                <FlatList data={contacts} keyExtractor={item => item.id} renderItem={renderContactCard} contentContainerStyle={styles.list} />
            ) : (
                <FlatList data={labels} keyExtractor={item => item.id} renderItem={renderLabelCard} contentContainerStyle={styles.list} />
            )}

            {/* ═══ Label Modal ═══ */}
            <Modal visible={showLabelModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modal, { backgroundColor: colors.card }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                {editingLabel ? 'Editar Label' : 'Nova Label'}
                            </Text>
                            <TouchableOpacity onPress={() => { setShowLabelModal(false); resetLabelForm(); }}>
                                <X size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalBody}>
                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nome</Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]}
                                placeholder="Nome da label"
                                placeholderTextColor={colors.textMuted}
                                value={labelName}
                                onChangeText={setLabelName}
                            />
                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Cor</Text>
                            <View style={styles.colorGrid}>
                                {LABEL_COLORS.map(c => (
                                    <TouchableOpacity
                                        key={c}
                                        style={[styles.colorSwatch, { backgroundColor: c, borderWidth: labelColor === c ? 3 : 0, borderColor: '#fff' }]}
                                        onPress={() => setLabelColor(c)}
                                    />
                                ))}
                            </View>
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => { setShowLabelModal(false); resetLabelForm(); }}>
                                <Text style={{ color: colors.text }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: labelName.trim() ? '#25D366' : colors.disabled }]} onPress={handleSaveLabel} disabled={!labelName.trim()}>
                                <Text style={styles.submitBtnText}>{editingLabel ? 'Salvar' : 'Criar'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ═══ Contact CRM Modal ═══ */}
            <Modal visible={showContactModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modal, { backgroundColor: colors.card, maxWidth: 560 }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>
                                📇 {selectedContact?.name || selectedContact?.phone}
                            </Text>
                            <TouchableOpacity onPress={() => setShowContactModal(false)}>
                                <X size={20} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalBody}>
                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Nome</Text>
                            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]} value={crmForm.name} onChangeText={v => setCrmForm(p => ({ ...p, name: v }))} />

                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>E-mail</Text>
                            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]} value={crmForm.email} onChangeText={v => setCrmForm(p => ({ ...p, email: v }))} keyboardType="email-address" />

                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>CPF</Text>
                            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]} value={crmForm.cpf} onChangeText={v => setCrmForm(p => ({ ...p, cpf: v }))} />

                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Empresa</Text>
                            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]} value={crmForm.companyName} onChangeText={v => setCrmForm(p => ({ ...p, companyName: v }))} />

                            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Notas</Text>
                            <TextInput style={[styles.textArea, { color: colors.text, borderColor: colors.border, backgroundColor: colors.backgroundSecondary }]} value={crmForm.notes} onChangeText={v => setCrmForm(p => ({ ...p, notes: v }))} multiline numberOfLines={3} />

                            {/* Labels */}
                            {labels.length > 0 && selectedContact && (
                                <>
                                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Labels</Text>
                                    <View style={styles.labelsGrid}>
                                        {labels.map(label => {
                                            const active = selectedContact.labels?.some(l => l.id === label.id);
                                            return (
                                                <TouchableOpacity
                                                    key={label.id}
                                                    style={[styles.labelToggle, { backgroundColor: active ? label.color + '30' : colors.backgroundSecondary, borderColor: active ? label.color : colors.border }]}
                                                    onPress={() => handleToggleLabel(selectedContact, label)}
                                                >
                                                    <View style={[styles.labelDot, { backgroundColor: label.color }]} />
                                                    <Text style={{ color: active ? label.color : colors.text, fontSize: Typography.sizes.sm }}>
                                                        {label.name}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </>
                            )}
                        </ScrollView>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={() => setShowContactModal(false)}>
                                <Text style={{ color: colors.text }}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: '#25D366' }]} onPress={handleSaveCrm} disabled={saving}>
                                {saving ? <ActivityIndicator size="small" color="#FFF" /> : (
                                    <>
                                        <Save size={14} color="#FFF" />
                                        <Text style={styles.submitBtnText}> Salvar</Text>
                                    </>
                                )}
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

    statsRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm },
    statCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md, paddingHorizontal: Spacing.sm, borderRadius: Radius.lg, borderWidth: 1, gap: 2 },
    statValue: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, lineHeight: Typography.sizes.xl * 1.2 },
    statLabel: { fontSize: Typography.sizes.xs, textAlign: 'center' },

    tabRow: { flexDirection: 'row', borderBottomWidth: 1 },
    tab: { flex: 1, alignItems: 'center', paddingVertical: Spacing.md },
    tabText: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },

    searchBar: { flexDirection: 'row', alignItems: 'center', margin: Spacing.lg, marginBottom: 0, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.lg, gap: Spacing.sm },
    searchInput: { flex: 1, fontSize: Typography.sizes.base, ...(Platform.OS === 'web' ? { outlineStyle: 'none' as any } : {}) },

    list: { padding: Spacing.lg, gap: Spacing.sm },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    // Contact card
    contactCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, gap: Spacing.md },
    contactAvatar: { width: 42, height: 42, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center' },
    contactAvatarText: { color: '#FFF', fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold },
    contactInfo: { flex: 1 },
    contactName: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold },
    contactPhone: { fontSize: Typography.sizes.sm },
    labelsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
    labelChip: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm },
    labelDot: { width: 6, height: 6, borderRadius: 3 },
    labelChipText: { fontSize: 10, fontWeight: Typography.weights.semibold },
    contactMeta: { flexDirection: 'row', gap: Spacing.sm },

    // Label card
    labelCard: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, gap: Spacing.md },
    labelColorBar: { width: 4, height: 32, borderRadius: 2 },
    labelCardInfo: { flex: 1 },
    labelCardName: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold },
    labelCardCount: { fontSize: Typography.sizes.sm },
    labelCardActions: { flexDirection: 'row', gap: Spacing.md },

    // Modals
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modal: { width: '90%', maxWidth: 520, borderRadius: Radius.xl, ...Shadows.xl },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
    modalTitle: { fontSize: Typography.sizes.md, fontWeight: Typography.weights.bold },
    modalBody: { padding: Spacing.lg },
    modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.sm, padding: Spacing.lg, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
    fieldLabel: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium, marginBottom: 6, marginTop: Spacing.md },
    input: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.sizes.base },
    textArea: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, fontSize: Typography.sizes.base, minHeight: 80, textAlignVertical: 'top' },
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    colorSwatch: { width: 32, height: 32, borderRadius: Radius.full },
    labelsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    labelToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.md, borderWidth: 1 },
    cancelBtn: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: Radius.md, borderWidth: 1 },
    submitBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderRadius: Radius.md },
    submitBtnText: { color: '#FFF', fontWeight: Typography.weights.semibold },
});
