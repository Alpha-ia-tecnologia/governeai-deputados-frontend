import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useData } from "@/contexts/DataContext";
import { useToast } from "@/contexts/ToastContext";
import { useAlertDialog } from "@/components/Advanced";
import Colors from "@/constants/colors";
import {
  User,
  Calendar,
  Phone,
  MapPin,
  HeartHandshake,
  UserCheck,
  Clock,
  CheckCircle2,
  Circle,
  Activity,
  Plus,
  Edit,
  Trash2,
  Edit2,
} from "lucide-react-native";
import { CategoryLabels, StatusLabels } from "@/constants/labels";
import { HelpRecord, Visit } from "@/types";

export default function VoterDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { voters, helpRecords, visits, deleteVoter, deleteHelpRecord, deleteVisit } = useData();
  const { showToast } = useToast();
  const { showAlert, AlertDialogComponent } = useAlertDialog();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingHelpId, setDeletingHelpId] = useState<string | null>(null);
  const [deletingVisitId, setDeletingVisitId] = useState<string | null>(null);

  const voter = useMemo(
    () => voters.find((v) => v.id === id),
    [voters, id]
  );

  const voterHelps = useMemo(
    () =>
      helpRecords
        .filter((h) => h.voterId === id)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [helpRecords, id]
  );

  const voterVisits = useMemo(
    () =>
      visits
        .filter((v) => v.voterId === id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [visits, id]
  );

  const timeline = useMemo(() => {
    const items = [
      ...voterHelps.map((h) => ({ type: "help" as const, data: h })),
      ...voterVisits.map((v) => ({ type: "visit" as const, data: v })),
    ].sort((a, b) => {
      const dateA =
        a.type === "help"
          ? new Date(a.data.createdAt).getTime()
          : new Date(a.data.date).getTime();
      const dateB =
        b.type === "help"
          ? new Date(b.data.createdAt).getTime()
          : new Date(b.data.date).getTime();
      return dateB - dateA;
    });

    return items;
  }, [voterHelps, voterVisits]);

  if (!voter) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Eleitor não encontrado</Text>
      </View>
    );
  }

  const handleEdit = () => {
    router.push({
      pathname: "/edit-voter",
      params: { id: voter.id },
    });
  };

  const handleDelete = () => {
    console.log("🗑️ handleDelete called for voter:", voter.id);

    showAlert({
      title: "Excluir Eleitor",
      description: `Tem certeza que deseja excluir ${voter.name}? Esta ação não pode ser desfeita.`,
      variant: "danger",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      onConfirm: performDelete,
    });
  };

  const performDelete = async () => {
    console.log("🗑️ performDelete started for voter:", voter.id);
    setIsDeleting(true);

    try {
      console.log("🗑️ Calling deleteVoter...");
      await deleteVoter(voter.id);
      console.log("✅ Voter deleted successfully");

      if (Platform.OS === 'web') {
        showToast({ type: 'success', title: 'Sucesso', message: 'Eleitor excluído com sucesso!' });
        setTimeout(() => router.back(), 1500);
      } else {
        showToast({ type: 'success', title: 'Sucesso', message: 'Eleitor excluído com sucesso!' });
        setTimeout(() => router.back(), 1500);
      }
    } catch (error: any) {
      console.error("❌ Error deleting voter:", error);

      const errorMessage = error.message || "Não foi possível excluir o eleitor";
      showToast({ type: 'error', title: 'Erro', message: errorMessage });
    } finally {
      setIsDeleting(false);
      console.log("🗑️ performDelete finished");
    }
  };

  const handleDeleteHelp = (help: HelpRecord) => {
    showAlert({
      title: "Excluir Ajuda",
      description: `Tem certeza que deseja excluir este registro de ajuda?`,
      variant: "danger",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      onConfirm: () => performDeleteHelp(help.id),
    });
  };

  const performDeleteHelp = async (helpId: string) => {
    setDeletingHelpId(helpId);
    try {
      await deleteHelpRecord(helpId);
      showToast({ type: 'success', title: 'Sucesso', message: 'Ajuda excluída com sucesso!' });
    } catch (error: any) {
      const errorMessage = error.message || "Não foi possível excluir a ajuda";
      showToast({ type: 'error', title: 'Erro', message: errorMessage });
    } finally {
      setDeletingHelpId(null);
    }
  };

  const handleEditHelp = (help: HelpRecord) => {
    router.push({
      pathname: "/edit-help",
      params: { helpId: help.id },
    });
  };

  const handleDeleteVisit = (visit: Visit) => {
    showAlert({
      title: "Excluir Visita",
      description: `Tem certeza que deseja excluir este registro de visita?`,
      variant: "danger",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      onConfirm: () => performDeleteVisit(visit.id),
    });
  };

  const performDeleteVisit = async (visitId: string) => {
    setDeletingVisitId(visitId);
    try {
      await deleteVisit(visitId);
      showToast({ type: 'success', title: 'Sucesso', message: 'Visita excluída com sucesso!' });
    } catch (error: any) {
      const errorMessage = error.message || "Não foi possível excluir a visita";
      showToast({ type: 'error', title: 'Erro', message: errorMessage });
    } finally {
      setDeletingVisitId(null);
    }
  };

  const handleEditVisit = (visit: Visit) => {
    router.push({
      pathname: "/edit-visit",
      params: { visitId: visit.id },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return Colors.light.success;
      case "in_progress":
        return Colors.light.warning;
      case "pending":
        return Colors.light.error;
      default:
        return Colors.light.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 color={Colors.light.success} size={16} />;
      case "in_progress":
        return <Activity color={Colors.light.warning} size={16} />;
      case "pending":
        return <Clock color={Colors.light.error} size={16} />;
      default:
        return <Circle color={Colors.light.textSecondary} size={16} />;
    }
  };

  const renderTimelineItem = (
    item: { type: "help" | "visit"; data: any },
    index: number
  ) => {
    const isLast = index === timeline.length - 1;

    if (item.type === "help") {
      const help = item.data;
      return (
        <View key={`help-${help.id}`} style={styles.timelineItem}>
          <View style={styles.timelineIconContainer}>
            <View
              style={[
                styles.timelineIcon,
                { backgroundColor: Colors.light.primary + "20" },
              ]}
            >
              <HeartHandshake color={Colors.light.primary} size={20} />
            </View>
            {!isLast && <View style={styles.timelineLine} />}
          </View>
          <View style={styles.timelineContent}>
            <View style={styles.timelineHeader}>
              <Text style={styles.timelineTitle}>Ajuda Prestada</Text>
              <View style={styles.statusBadge}>
                {getStatusIcon(help.status)}
                <Text
                  style={[
                    styles.statusText,
                    { color: getStatusColor(help.status) },
                  ]}
                >
                  {StatusLabels[help.status]}
                </Text>
              </View>
            </View>
            <Text style={styles.timelineCategory}>
              {CategoryLabels[help.category]}
            </Text>
            <Text style={styles.timelineDescription}>{help.description}</Text>
            <View style={styles.timelineMeta}>
              <UserCheck color={Colors.light.textSecondary} size={14} />
              <Text style={styles.timelineMetaText}>{help.responsibleName}</Text>
            </View>
            <View style={styles.timelineMeta}>
              <Calendar color={Colors.light.textSecondary} size={14} />
              <Text style={styles.timelineMetaText}>
                {formatDate(help.createdAt)}
              </Text>
            </View>
            <View style={styles.timelineActions}>
              <TouchableOpacity
                style={styles.timelineActionButton}
                onPress={() => handleEditHelp(help)}
              >
                <Edit2 color={Colors.light.primary} size={14} />
                <Text style={styles.timelineActionText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timelineActionButton, styles.timelineActionButtonDelete]}
                onPress={() => handleDeleteHelp(help)}
                disabled={deletingHelpId === help.id}
              >
                <Trash2 color={Colors.light.error} size={14} />
                <Text style={[styles.timelineActionText, styles.timelineActionTextDelete]}>
                  {deletingHelpId === help.id ? "..." : "Excluir"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    } else {
      const visit = item.data;
      return (
        <View key={`visit-${visit.id}`} style={styles.timelineItem}>
          <View style={styles.timelineIconContainer}>
            <View
              style={[
                styles.timelineIcon,
                { backgroundColor: Colors.light.secondary + "20" },
              ]}
            >
              <MapPin color={Colors.light.secondary} size={20} />
            </View>
            {!isLast && <View style={styles.timelineLine} />}
          </View>
          <View style={styles.timelineContent}>
            <View style={styles.timelineHeader}>
              <Text style={styles.timelineTitle}>Visita Realizada</Text>
            </View>
            <Text style={styles.timelineDescription}>{visit.objective}</Text>
            {visit.result && (
              <Text style={styles.timelineResult}>
                <Text style={styles.timelineResultLabel}>Resultado: </Text>
                {visit.result}
              </Text>
            )}
            {visit.nextSteps && (
              <Text style={styles.timelineNextSteps}>
                <Text style={styles.timelineNextStepsLabel}>Próximos passos: </Text>
                {visit.nextSteps}
              </Text>
            )}
            <View style={styles.timelineMeta}>
              <UserCheck color={Colors.light.textSecondary} size={14} />
              <Text style={styles.timelineMetaText}>{visit.leaderName}</Text>
            </View>
            <View style={styles.timelineMeta}>
              <Calendar color={Colors.light.textSecondary} size={14} />
              <Text style={styles.timelineMetaText}>{formatDate(visit.date)}</Text>
            </View>
            <View style={styles.timelineActions}>
              <TouchableOpacity
                style={styles.timelineActionButton}
                onPress={() => handleEditVisit(visit)}
              >
                <Edit2 color={Colors.light.secondary} size={14} />
                <Text style={[styles.timelineActionText, { color: Colors.light.secondary }]}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.timelineActionButton, styles.timelineActionButtonDelete]}
                onPress={() => handleDeleteVisit(visit)}
                disabled={deletingVisitId === visit.id}
              >
                <Trash2 color={Colors.light.error} size={14} />
                <Text style={[styles.timelineActionText, styles.timelineActionTextDelete]}>
                  {deletingVisitId === visit.id ? "..." : "Excluir"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Detalhes do Eleitor",
          headerStyle: {
            backgroundColor: Colors.light.primary,
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "600" as const,
          },
        }}
      />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <User color={Colors.light.primary} size={48} />
          </View>
          <Text style={styles.voterName}>{voter.name}</Text>
          <View style={styles.votesBadge}>
            <Text style={styles.votesBadgeText}>{voter.votesCount}</Text>
            <Text style={styles.votesBadgeLabel}>votos</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Calendar color={Colors.light.textSecondary} size={20} />
            <Text style={styles.infoLabel}>Data de Nascimento</Text>
            <Text style={styles.infoValue}>{formatDate(voter.birthDate)}</Text>
          </View>

          <View style={styles.infoRow}>
            <Phone color={Colors.light.textSecondary} size={20} />
            <Text style={styles.infoLabel}>Telefone</Text>
            <Text style={styles.infoValue}>{voter.phone}</Text>
          </View>

          {voter.address && (
            <View style={styles.infoRow}>
              <MapPin color={Colors.light.textSecondary} size={20} />
              <Text style={styles.infoLabel}>Endereço</Text>
              <Text style={styles.infoValue}>
                {voter.address}
                {voter.neighborhood && `, ${voter.neighborhood}`}
              </Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <UserCheck color={Colors.light.textSecondary} size={20} />
            <Text style={styles.infoLabel}>Liderança</Text>
            <Text style={styles.infoValue}>{voter.leaderName}</Text>
          </View>

          {voter.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Observações:</Text>
              <Text style={styles.notesText}>{voter.notes}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Histórico de Atendimentos</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <HeartHandshake color={Colors.light.primary} size={16} />
                <Text style={styles.statText}>{voterHelps.length} ajudas</Text>
              </View>
              <View style={styles.statItem}>
                <MapPin color={Colors.light.secondary} size={16} />
                <Text style={styles.statText}>{voterVisits.length} visitas</Text>
              </View>
            </View>
          </View>

          {timeline.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Nenhum atendimento registrado ainda
              </Text>
            </View>
          ) : (
            <View style={styles.timeline}>{timeline.map(renderTimelineItem)}</View>
          )}
        </View>

        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() =>
              router.push({
                pathname: "/add-help",
                params: { voterId: voter.id, voterName: voter.name },
              })
            }
          >
            <Plus color="#fff" size={20} />
            <Text style={styles.actionButtonText}>Registrar Ajuda</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={() =>
              router.push({
                pathname: "/add-visit",
                params: { voterId: voter.id, voterName: voter.name },
              })
            }
          >
            <Plus color={Colors.light.primary} size={20} />
            <Text style={styles.actionButtonTextSecondary}>
              Registrar Visita
            </Text>
          </TouchableOpacity>

          <View style={styles.actionButtonRow}>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonEdit]}
              onPress={handleEdit}
            >
              <Edit color={Colors.light.warning} size={20} />
              <Text style={[styles.actionButtonText, styles.actionButtonEditText]}>
                Editar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonDelete]}
              onPress={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 color={Colors.light.error} size={20} />
              <Text style={[styles.actionButtonText, styles.actionButtonDeleteText]}>
                {isDeleting ? "Excluindo..." : "Excluir"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Alert Dialog Moderno */}
      {AlertDialogComponent}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  errorText: {
    textAlign: "center" as const,
    marginTop: 50,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  header: {
    backgroundColor: Colors.light.card,
    alignItems: "center" as const,
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 16,
  },
  voterName: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 12,
    textAlign: "center" as const,
  },
  votesBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: Colors.light.primary + "15",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  votesBadgeText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.primary,
  },
  votesBadgeLabel: {
    fontSize: 14,
    color: Colors.light.primary,
  },
  infoCard: {
    backgroundColor: Colors.light.card,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 16,
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
  infoRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    flex: 2,
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row" as const,
    gap: 16,
  },
  statItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  timeline: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: "row" as const,
    gap: 12,
  },
  timelineIconContainer: {
    alignItems: "center" as const,
    width: 40,
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.light.border,
    marginTop: 8,
    marginBottom: 8,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
      },
    }),
  },
  timelineHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  statusBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600" as const,
  },
  timelineCategory: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.light.primary,
    marginBottom: 8,
    textTransform: "uppercase" as const,
  },
  timelineDescription: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  timelineResult: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  timelineResultLabel: {
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
  timelineNextSteps: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  timelineNextStepsLabel: {
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
  timelineMeta: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 6,
    marginTop: 4,
  },
  timelineMetaText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  emptyState: {
    backgroundColor: Colors.light.card,
    padding: 32,
    borderRadius: 12,
    alignItems: "center" as const,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center" as const,
  },
  actionsSection: {
    padding: 16,
    gap: 12,
    paddingBottom: 32,
  },
  actionButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: Colors.light.primary,
    paddingVertical: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: Colors.light.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
      },
    }),
  },
  actionButtonSecondary: {
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.primary,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#fff",
  },
  actionButtonTextSecondary: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.primary,
  },
  actionButtonRow: {
    flexDirection: "row" as const,
    gap: 12,
  },
  actionButtonEdit: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.warning,
  },
  actionButtonEditText: {
    color: Colors.light.warning,
  },
  actionButtonDelete: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderWidth: 2,
    borderColor: Colors.light.error,
  },
  actionButtonDeleteText: {
    color: Colors.light.error,
  },
  timelineActions: {
    flexDirection: "row" as const,
    justifyContent: "flex-end" as const,
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  timelineActionButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  timelineActionButtonDelete: {
    backgroundColor: Colors.light.error + "10",
  },
  timelineActionText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: Colors.light.primary,
  },
  timelineActionTextDelete: {
    color: Colors.light.error,
  },
});
