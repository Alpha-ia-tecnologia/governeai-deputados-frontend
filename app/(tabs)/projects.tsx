import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, Modal } from "react-native";
import { Plus, FileText, Eye, Edit2, Trash2, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";
import { Badge, Button } from "@/components/UI";
import { useAlertDialog } from "@/components/Advanced";
import { useToast } from "@/contexts/ToastContext";
import { StatusLabels } from "@/constants/labels";
import { StatusColors } from "@/constants/colors";
import { useData } from "@/contexts/DataContext";
import { LawProject, Amendment } from "@/types";

export default function ProjectsScreen() {
  const router = useRouter();
  const { projects, amendments, deleteProject, deleteAmendment } = useData();
  const { showAlert, AlertDialogComponent } = useAlertDialog();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"projects" | "amendments">("projects");

  const [selectedProject, setSelectedProject] = useState<LawProject | null>(null);
  const [selectedAmendment, setSelectedAmendment] = useState<Amendment | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);

  const handleDeleteProject = (id: string, title: string) => {
    showAlert({
      title: "Excluir Projeto",
      description: `Tem certeza que deseja excluir o projeto "${title}"?`,
      variant: "danger",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          await deleteProject(id);
          showToast({ type: 'success', title: 'Sucesso', message: 'Projeto excluído com sucesso!' });
        } catch (error) {
          showToast({ type: 'error', title: 'Erro', message: 'Não foi possível excluir o projeto.' });
        }
      },
    });
  };

  const handleDeleteAmendment = (id: string, code: string) => {
    showAlert({
      title: "Excluir Emenda",
      description: `Tem certeza que deseja excluir a emenda "${code}"?`,
      variant: "danger",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          await deleteAmendment(id);
          showToast({ type: 'success', title: 'Sucesso', message: 'Emenda excluída com sucesso!' });
        } catch (error) {
          showToast({ type: 'error', title: 'Erro', message: 'Não foi possível excluir a emenda.' });
        }
      },
    });
  };

  const handleViewProject = (project: LawProject) => {
    setSelectedProject(project);
    setShowProjectModal(true);
  };

  const handleViewAmendment = (amendment: Amendment) => {
    setSelectedAmendment(amendment);
    setShowAmendmentModal(true);
  };

  const ProjectDetailsModal = () => (
    <Modal
      visible={showProjectModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowProjectModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalhes do Projeto</Text>
            <TouchableOpacity onPress={() => setShowProjectModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            {selectedProject && (
              <>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Número:</Text>
                  <Text style={styles.modalValue}>{selectedProject.number}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Título:</Text>
                  <Text style={styles.modalValue}>{selectedProject.title}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Status:</Text>
                  <Badge
                    label={StatusLabels[selectedProject.status]}
                    color={StatusColors[selectedProject.status]}
                  />
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Data Protocolo:</Text>
                  <Text style={styles.modalValue}>
                    {new Date(selectedProject.protocolDate).toLocaleDateString("pt-BR")}
                  </Text>
                </View>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Resumo</Text>
                  <Text style={styles.modalText}>{selectedProject.summary}</Text>
                </View>
                {selectedProject.fullText && (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Texto Completo</Text>
                    <Text style={styles.modalText}>{selectedProject.fullText}</Text>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const AmendmentDetailsModal = () => (
    <Modal
      visible={showAmendmentModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAmendmentModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalhes da Emenda</Text>
            <TouchableOpacity onPress={() => setShowAmendmentModal(false)}>
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            {selectedAmendment && (
              <>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Código:</Text>
                  <Text style={styles.modalValue}>{selectedAmendment.code}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Destinação:</Text>
                  <Text style={styles.modalValue}>{selectedAmendment.destination}</Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Status:</Text>
                  <Badge
                    label={StatusLabels[selectedAmendment.status]}
                    color={StatusColors[selectedAmendment.status]}
                  />
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Valor:</Text>
                  <Text style={styles.modalValue}>
                    R$ {selectedAmendment.value.toLocaleString("pt-BR")}
                  </Text>
                </View>
                <View style={styles.modalRow}>
                  <Text style={styles.modalLabel}>Execução:</Text>
                  <Text style={styles.modalValue}>{selectedAmendment.executionPercentage}%</Text>
                </View>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Objetivo</Text>
                  <Text style={styles.modalText}>{selectedAmendment.objective}</Text>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "projects" && styles.activeTab]}
          onPress={() => setActiveTab("projects")}
        >
          <Text style={[styles.tabText, activeTab === "projects" && styles.activeTabText]}>
            Projetos de Lei
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "amendments" && styles.activeTab]}
          onPress={() => setActiveTab("amendments")}
        >
          <Text style={[styles.tabText, activeTab === "amendments" && styles.activeTabText]}>
            Emendas
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {activeTab === "projects" ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Projetos de Lei</Text>
              <Button
                title=""
                onPress={() => router.push("/add-project")}
                icon={<Plus color="#fff" size={20} />}
                variant="primary"
                style={styles.addButton}
              />
            </View>
            {projects.length === 0 ? (
              <View style={styles.emptyState}>
                <FileText color={Colors.light.textSecondary} size={48} />
                <Text style={styles.emptyText}>Nenhum projeto cadastrado</Text>
                <Text style={styles.emptySubtext}>Adicione um novo projeto de lei</Text>
              </View>
            ) : (
              projects.map((project) => (
                <View key={project.id} style={styles.projectCard}>
                  <View style={styles.projectHeader}>
                    <Text style={styles.projectNumber}>{project.number}</Text>
                    <Badge
                      label={StatusLabels[project.status]}
                      color={StatusColors[project.status]}
                    />
                  </View>
                  <Text style={styles.projectTitle}>{project.title}</Text>
                  <Text style={styles.projectSummary}>{project.summary}</Text>
                  <View style={styles.projectFooter}>
                    <Text style={styles.projectDate}>
                      Protocolado: {new Date(project.protocolDate).toLocaleDateString("pt-BR")}
                    </Text>
                    <Text style={styles.projectViews}>{project.views} visualizações</Text>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.viewButton]}
                      onPress={() => handleViewProject(project)}
                    >
                      <Eye size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Ver</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => router.push({ pathname: "/edit-project", params: { id: project.id } })}
                    >
                      <Edit2 size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteProject(project.id, project.title)}
                    >
                      <Trash2 size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        ) : (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Emendas</Text>
              <Button
                title=""
                onPress={() => router.push("/add-amendment")}
                icon={<Plus color="#fff" size={20} />}
                variant="primary"
                style={styles.addButton}
              />
            </View>
            {amendments.length === 0 ? (
              <View style={styles.emptyState}>
                <FileText color={Colors.light.textSecondary} size={48} />
                <Text style={styles.emptyText}>Nenhuma emenda cadastrada</Text>
                <Text style={styles.emptySubtext}>Adicione uma nova emenda parlamentar</Text>
              </View>
            ) : (
              amendments.map((amendment) => (
                <View key={amendment.id} style={styles.amendmentCard}>
                  <View style={styles.amendmentHeader}>
                    <Text style={styles.amendmentCode}>{amendment.code}</Text>
                    <Badge
                      label={StatusLabels[amendment.status]}
                      color={StatusColors[amendment.status]}
                    />
                  </View>
                  <Text style={styles.amendmentDestination}>{amendment.destination}</Text>
                  <Text style={styles.amendmentObjective}>{amendment.objective}</Text>
                  <View style={styles.amendmentFooter}>
                    <Text style={styles.amendmentValue}>
                      R$ {amendment.value.toLocaleString("pt-BR")}
                    </Text>
                    <View style={styles.progressContainer}>
                      <Text style={styles.progressText}>
                        {amendment.executionPercentage}% executado
                      </Text>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${amendment.executionPercentage}%`,
                              backgroundColor: Colors.light.success,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.viewButton]}
                      onPress={() => handleViewAmendment(amendment)}
                    >
                      <Eye size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Ver</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.editButton]}
                      onPress={() => router.push({ pathname: "/edit-amendment", params: { id: amendment.id } })}
                    >
                      <Edit2 size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.deleteButton]}
                      onPress={() => handleDeleteAmendment(amendment.id, amendment.code)}
                    >
                      <Trash2 size={18} color="#fff" />
                      <Text style={styles.actionButtonText}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <ProjectDetailsModal />
      <AmendmentDetailsModal />

      {/* Alert Dialog Moderno */}
      {AlertDialogComponent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: Colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.textSecondary,
  },
  activeTabText: {
    color: Colors.light.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addButton: {
    paddingHorizontal: 16,
    minWidth: 48,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: 16,
  },
  projectCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  projectNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.primary,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  projectSummary: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  projectFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  projectDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  projectViews: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  amendmentCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.secondary,
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
  amendmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  amendmentCode: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.light.secondary,
  },
  amendmentDestination: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  amendmentObjective: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  amendmentFooter: {
    gap: 8,
    marginBottom: 16,
  },
  amendmentValue: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.light.secondary,
  },
  progressContainer: {
    gap: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.text,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  viewButton: {
    backgroundColor: Colors.light.textSecondary,
  },
  editButton: {
    backgroundColor: Colors.light.primary,
  },
  deleteButton: {
    backgroundColor: Colors.light.error,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  modalBody: {
    padding: 16,
  },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.backgroundSecondary,
  },
  modalLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  modalValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 16,
  },
  modalSection: {
    marginTop: 16,
    gap: 8,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  modalText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
});
