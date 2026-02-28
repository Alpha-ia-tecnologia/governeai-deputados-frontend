import createContextHook from "@nkzw/create-context-hook";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Voter, Leader, HelpRecord, Visit, Appointment, LawProject, Amendment, City, ExecutiveRequest, StaffMember, GabineteTask, LegislativeBill, VotingRecord, PoliticalContact, CeapExpense } from "@/types";
import {
  votersService,
  leadersService,
  helpRecordsService,
  visitsService,
  appointmentsService,
  projectsService,
  amendmentsService,
  notificationService,
  citiesService,
  executiveRequestsService,
  staffService,
  tasksService,
  billsService,
  votingRecordsService,
  politicalContactsService,
  ceapService,
} from "@/services";
import { useAuth } from "./AuthContext";
import { setSyncCallback } from "./PreferencesContext";

export const [DataProvider, useData] = createContextHook(() => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [voters, setVoters] = useState<Voter[]>([]);
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [helpRecords, setHelpRecords] = useState<HelpRecord[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [projects, setProjects] = useState<LawProject[]>([]);
  const [amendments, setAmendments] = useState<Amendment[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [executiveRequests, setExecutiveRequests] = useState<ExecutiveRequest[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [gabineteTasks, setGabineteTasks] = useState<GabineteTask[]>([]);
  const [bills, setBills] = useState<LegislativeBill[]>([]);
  const [votingRecords, setVotingRecords] = useState<VotingRecord[]>([]);
  const [politicalContacts, setPoliticalContacts] = useState<PoliticalContact[]>([]);
  const [ceapExpenses, setCeapExpenses] = useState<CeapExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for auth to finish loading before attempting to load data
    if (authLoading) {
      return;
    }

    // Only load data if user is authenticated
    if (isAuthenticated) {
      loadData();

      // Registrar a função de sincronização para o PreferencesContext
      setSyncCallback(loadData);
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const loadData = async () => {
    try {
      console.log('DataContext.loadData() - Starting data load...');
      setIsLoading(true);
      setError(null);

      const [
        votersData,
        leadersData,
        helpsData,
        visitsData,
        appointmentsData,
        projectsData,
        amendmentsData,
        citiesData,
        executiveRequestsData,
        staffData,
        gabineteTasksData,
        billsData,
        votingRecordsData,
        politicalContactsData,
        ceapExpensesData,
      ] = await Promise.all([
        votersService.getAll().catch(err => { console.error('Error loading voters:', err); return []; }),
        leadersService.getAll().catch(err => { console.error('Error loading leaders:', err); return []; }),
        helpRecordsService.getAll().catch(err => { console.error('Error loading help records:', err); return []; }),
        visitsService.getAll().catch(err => { console.error('Error loading visits:', err); return []; }),
        appointmentsService.getAll().catch(err => { console.error('Error loading appointments:', err); return []; }),
        projectsService.getAll().catch(err => { console.error('Error loading projects:', err); return []; }),
        amendmentsService.getAll().catch(err => { console.error('Error loading amendments:', err); return []; }),
        citiesService.getAll().catch(err => { console.error('Error loading cities:', err); return []; }),
        executiveRequestsService.getAll().catch(err => { console.error('Error loading executive requests:', err); return []; }),
        staffService.getAll().catch(err => { console.error('Error loading staff:', err); return []; }),
        tasksService.getAll().catch(err => { console.error('Error loading tasks:', err); return []; }),
        billsService.getAll().catch(err => { console.error('Error loading bills:', err); return []; }),
        votingRecordsService.getAll().catch(err => { console.error('Error loading voting records:', err); return []; }),
        politicalContactsService.getAll().catch(err => { console.error('Error loading political contacts:', err); return []; }),
        ceapService.getAll().catch(err => { console.error('Error loading ceap expenses:', err); return []; }),
      ]);

      console.log('DataContext.loadData() - Data loaded:', {
        voters: Array.isArray(votersData) ? votersData.length : 'not-array',
        leaders: Array.isArray(leadersData) ? leadersData.length : 'not-array',
        helpRecords: Array.isArray(helpsData) ? helpsData.length : 'not-array',
        visits: Array.isArray(visitsData) ? visitsData.length : 'not-array',
        appointments: Array.isArray(appointmentsData) ? appointmentsData.length : 'not-array',
        projects: Array.isArray(projectsData) ? projectsData.length : 'not-array',
        amendments: Array.isArray(amendmentsData) ? amendmentsData.length : 'not-array',
      });

      setVoters(Array.isArray(votersData) ? votersData : []);
      setLeaders(Array.isArray(leadersData) ? leadersData : []);
      setHelpRecords(Array.isArray(helpsData) ? helpsData : []);
      setVisits(Array.isArray(visitsData) ? visitsData : []);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setAmendments(Array.isArray(amendmentsData) ? amendmentsData : []);
      setCities(Array.isArray(citiesData) ? citiesData : []);
      setExecutiveRequests(Array.isArray(executiveRequestsData) ? executiveRequestsData : []);
      setStaff(Array.isArray(staffData) ? staffData : []);
      setGabineteTasks(Array.isArray(gabineteTasksData) ? gabineteTasksData : []);
      setBills(Array.isArray(billsData) ? billsData : []);
      setVotingRecords(Array.isArray(votingRecordsData) ? votingRecordsData : []);
      setPoliticalContacts(Array.isArray(politicalContactsData) ? politicalContactsData : []);
      setCeapExpenses(Array.isArray(ceapExpensesData) ? ceapExpensesData : []);
    } catch (error: any) {
      console.error("Error loading data:", error);
      setError(error.message || "Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  // Voters
  const addVoter = useCallback(async (voter: Omit<Voter, "id" | "createdAt" | "updatedAt">) => {
    try {
      const newVoter = await votersService.create(voter);
      setVoters((prev) => [...prev, newVoter]);
      // Atualizar lista de lideranças para refletir novo contador
      const updatedLeaders = await leadersService.getAll();
      setLeaders(updatedLeaders);
    } catch (error: any) {
      console.error("Error adding voter:", error);
      // Tratar erro de duplicidade (409 Conflict)
      if (error?.response?.status === 409) {
        const data = error.response.data;
        const msg = data?.message || "Eleitor já cadastrado com mesmo nome e data de nascimento.";
        throw new Error(msg);
      }
      throw new Error(error?.response?.data?.message || error.message || "Erro ao adicionar eleitor");
    }
  }, []);

  const updateVoter = useCallback(async (id: string, updates: Partial<Voter>) => {
    try {
      const updatedVoter = await votersService.update(id, updates);
      setVoters((prev) =>
        prev.map((v) => (v.id === id ? updatedVoter : v))
      );
    } catch (error: any) {
      console.error("Error updating voter:", error);
      throw new Error(error.message || "Erro ao atualizar eleitor");
    }
  }, []);

  const deleteVoter = useCallback(async (id: string) => {
    try {
      await votersService.delete(id);
      setVoters((prev) => prev.filter((v) => v.id !== id));
      // Atualizar lista de lideranças para refletir novo contador
      const updatedLeaders = await leadersService.getAll();
      setLeaders(updatedLeaders);
    } catch (error: any) {
      console.error("Error deleting voter:", error);
      throw new Error(error.message || "Erro ao deletar eleitor");
    }
  }, []);

  // Leaders
  const addLeader = useCallback(async (leader: Omit<Leader, "id" | "createdAt" | "votersCount">) => {
    try {
      const newLeader = await leadersService.create(leader);
      setLeaders((prev) => [...prev, newLeader]);
    } catch (error: any) {
      console.error("Error adding leader:", error);
      throw new Error(error.message || "Erro ao adicionar liderança");
    }
  }, []);

  const updateLeader = useCallback(async (id: string, updates: Partial<Leader>) => {
    try {
      const updatedLeader = await leadersService.update(id, updates);
      setLeaders((prev) =>
        prev.map((l) => (l.id === id ? updatedLeader : l))
      );
    } catch (error: any) {
      console.error("Error updating leader:", error);
      throw new Error(error.message || "Erro ao atualizar liderança");
    }
  }, []);

  const deleteLeader = useCallback(async (id: string) => {
    try {
      await leadersService.delete(id);
      setLeaders((prev) => prev.filter((l) => l.id !== id));
    } catch (error: any) {
      console.error("Error deleting leader:", error);
      throw new Error(error.message || "Erro ao deletar liderança");
    }
  }, []);

  // Help Records
  const addHelpRecord = useCallback(async (
    record: Omit<HelpRecord, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const newRecord = await helpRecordsService.create(record);
      setHelpRecords((prev) => [...prev, newRecord]);
    } catch (error: any) {
      console.error("Error adding help record:", error);
      throw new Error(error.message || "Erro ao adicionar atendimento");
    }
  }, []);

  const updateHelpRecord = useCallback(async (id: string, updates: Partial<HelpRecord>) => {
    try {
      const updatedRecord = await helpRecordsService.update(id, updates);
      setHelpRecords((prev) =>
        prev.map((r) => (r.id === id ? updatedRecord : r))
      );
    } catch (error: any) {
      console.error("Error updating help record:", error);
      throw new Error(error.message || "Erro ao atualizar atendimento");
    }
  }, []);

  const deleteHelpRecord = useCallback(async (id: string) => {
    try {
      await helpRecordsService.delete(id);
      setHelpRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (error: any) {
      console.error("Error deleting help record:", error);
      throw new Error(error.message || "Erro ao deletar atendimento");
    }
  }, []);

  // Visits
  const addVisit = useCallback(async (visit: Omit<Visit, "id" | "createdAt">) => {
    try {
      const newVisit = await visitsService.create(visit);
      setVisits((prev) => [...prev, newVisit]);
    } catch (error: any) {
      console.error("Error adding visit:", error);
      throw new Error(error.message || "Erro ao adicionar visita");
    }
  }, []);

  const updateVisit = useCallback(async (id: string, updates: Partial<Visit>) => {
    try {
      const updatedVisit = await visitsService.update(id, updates);
      setVisits((prev) =>
        prev.map((v) => (v.id === id ? updatedVisit : v))
      );
    } catch (error: any) {
      console.error("Error updating visit:", error);
      throw new Error(error.message || "Erro ao atualizar visita");
    }
  }, []);

  const deleteVisit = useCallback(async (id: string) => {
    try {
      await visitsService.delete(id);
      setVisits((prev) => prev.filter((v) => v.id !== id));
    } catch (error: any) {
      console.error("Error deleting visit:", error);
      throw new Error(error.message || "Erro ao deletar visita");
    }
  }, []);

  // Appointments
  const addAppointment = useCallback(
    async (appointment: Omit<Appointment, "id" | "createdAt" | "updatedAt">) => {
      try {
        const newAppointment = await appointmentsService.create(appointment);
        setAppointments((prev) => [...prev, newAppointment]);

        // Agendar notificações para os lembretes
        await notificationService.scheduleAllReminders(newAppointment);

        return newAppointment;
      } catch (error: any) {
        console.error("Error adding appointment:", error);
        throw new Error(error.message || "Erro ao adicionar compromisso");
      }
    },
    []
  );

  const updateAppointment = useCallback(
    async (id: string, updates: Partial<Appointment>) => {
      try {
        const updatedAppointment = await appointmentsService.update(id, updates);
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? updatedAppointment : a))
        );
      } catch (error: any) {
        console.error("Error updating appointment:", error);
        throw new Error(error.message || "Erro ao atualizar compromisso");
      }
    },
    []
  );

  const deleteAppointment = useCallback(
    async (id: string) => {
      try {
        // Cancelar notificações agendadas para este compromisso
        await notificationService.cancelAppointmentNotifications(id);

        await appointmentsService.delete(id);
        setAppointments((prev) => prev.filter((a) => a.id !== id));
      } catch (error: any) {
        console.error("Error deleting appointment:", error);
        throw new Error(error.message || "Erro ao deletar compromisso");
      }
    },
    []
  );

  const completeAppointment = useCallback(
    async (id: string, notes?: string) => {
      try {
        // Cancelar notificações agendadas para este compromisso (já foi concluído)
        await notificationService.cancelAppointmentNotifications(id);

        const updatedAppointment = await appointmentsService.update(id, {
          status: "completed",
          completed: true,
          completedAt: new Date().toISOString(),
          completedNotes: notes,
        });
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? updatedAppointment : a))
        );
      } catch (error: any) {
        console.error("Error completing appointment:", error);
        throw new Error(error.message || "Erro ao completar compromisso");
      }
    },
    []
  );

  // Projects
  const addProject = useCallback(
    async (project: Omit<LawProject, "id" | "createdAt" | "updatedAt" | "views">) => {
      try {
        const newProject = await projectsService.create(project);
        setProjects((prev) => [...prev, newProject]);
      } catch (error: any) {
        console.error("Error adding project:", error);
        throw new Error(error.message || "Erro ao adicionar projeto");
      }
    },
    []
  );

  const updateProject = useCallback(
    async (id: string, updates: Partial<LawProject>) => {
      try {
        const updatedProject = await projectsService.update(id, updates);
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? updatedProject : p))
        );
      } catch (error: any) {
        console.error("Error updating project:", error);
        throw new Error(error.message || "Erro ao atualizar projeto");
      }
    },
    []
  );

  const deleteProject = useCallback(
    async (id: string) => {
      try {
        await projectsService.delete(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } catch (error: any) {
        console.error("Error deleting project:", error);
        throw new Error(error.message || "Erro ao deletar projeto");
      }
    },
    []
  );

  // Amendments
  const addAmendment = useCallback(
    async (amendment: Omit<Amendment, "id" | "createdAt" | "updatedAt">) => {
      try {
        const newAmendment = await amendmentsService.create(amendment);
        setAmendments((prev) => [...prev, newAmendment]);
      } catch (error: any) {
        console.error("Error adding amendment:", error);
        throw new Error(error.message || "Erro ao adicionar emenda");
      }
    },
    []
  );

  const updateAmendment = useCallback(
    async (id: string, updates: Partial<Amendment>) => {
      try {
        const updatedAmendment = await amendmentsService.update(id, updates);
        setAmendments((prev) =>
          prev.map((a) => (a.id === id ? updatedAmendment : a))
        );
      } catch (error: any) {
        console.error("Error updating amendment:", error);
        throw new Error(error.message || "Erro ao atualizar emenda");
      }
    },
    []
  );

  const deleteAmendment = useCallback(
    async (id: string) => {
      try {
        await amendmentsService.delete(id);
        setAmendments((prev) => prev.filter((a) => a.id !== id));
      } catch (error: any) {
        console.error("Error deleting amendment:", error);
        throw new Error(error.message || "Erro ao deletar emenda");
      }
    },
    []
  );

  // Cities
  const addCity = useCallback(async (city: Omit<City, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newCity = await citiesService.create(city);
      setCities((prev) => [...prev, newCity]);
    } catch (error: any) {
      console.error('Error adding city:', error);
      throw new Error(error?.response?.data?.message || error.message || 'Erro ao adicionar cidade');
    }
  }, []);

  const updateCity = useCallback(async (id: string, updates: Partial<City>) => {
    try {
      const updatedCity = await citiesService.update(id, updates);
      setCities((prev) => prev.map((c) => (c.id === id ? updatedCity : c)));
    } catch (error: any) {
      console.error('Error updating city:', error);
      throw new Error(error.message || 'Erro ao atualizar cidade');
    }
  }, []);

  const deleteCity = useCallback(async (id: string) => {
    try {
      await citiesService.delete(id);
      setCities((prev) => prev.filter((c) => c.id !== id));
    } catch (error: any) {
      console.error('Error deleting city:', error);
      throw new Error(error.message || 'Erro ao deletar cidade');
    }
  }, []);

  // Executive Requests
  const addExecutiveRequest = useCallback(async (request: Omit<ExecutiveRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newRequest = await executiveRequestsService.create(request);
      setExecutiveRequests((prev) => [...prev, newRequest]);
    } catch (error: any) {
      console.error('Error adding executive request:', error);
      throw new Error(error?.response?.data?.message || error.message || 'Erro ao adicionar requerimento');
    }
  }, []);

  const updateExecutiveRequest = useCallback(async (id: string, updates: Partial<ExecutiveRequest>) => {
    try {
      const updatedRequest = await executiveRequestsService.update(id, updates);
      setExecutiveRequests((prev) => prev.map((r) => (r.id === id ? updatedRequest : r)));
    } catch (error: any) {
      console.error('Error updating executive request:', error);
      throw new Error(error.message || 'Erro ao atualizar requerimento');
    }
  }, []);

  const deleteExecutiveRequest = useCallback(async (id: string) => {
    try {
      await executiveRequestsService.delete(id);
      setExecutiveRequests((prev) => prev.filter((r) => r.id !== id));
    } catch (error: any) {
      console.error('Error deleting executive request:', error);
      throw new Error(error.message || 'Erro ao deletar requerimento');
    }
  }, []);

  // Staff (Gabinete)
  const addStaff = useCallback(async (member: Omit<StaffMember, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newMember = await staffService.create(member);
    setStaff((prev) => [...prev, newMember]);
  }, []);

  const updateStaff = useCallback(async (id: string, updates: Partial<StaffMember>) => {
    const updated = await staffService.update(id, updates);
    setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
  }, []);

  const deleteStaff = useCallback(async (id: string) => {
    await staffService.delete(id);
    setStaff((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // Gabinete Tasks
  const addGabineteTask = useCallback(async (task: Omit<GabineteTask, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask = await tasksService.create(task);
    setGabineteTasks((prev) => [...prev, newTask]);
  }, []);

  const updateGabineteTask = useCallback(async (id: string, updates: Partial<GabineteTask>) => {
    const updated = await tasksService.update(id, updates);
    setGabineteTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }, []);

  const deleteGabineteTask = useCallback(async (id: string) => {
    await tasksService.delete(id);
    setGabineteTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Bills (Atividade Legislativa)
  const addBill = useCallback(async (bill: Omit<LegislativeBill, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newBill = await billsService.create(bill);
    setBills((prev) => [...prev, newBill]);
  }, []);

  const updateBill = useCallback(async (id: string, updates: Partial<LegislativeBill>) => {
    const updated = await billsService.update(id, updates);
    setBills((prev) => prev.map((b) => (b.id === id ? updated : b)));
  }, []);

  const deleteBill = useCallback(async (id: string) => {
    await billsService.delete(id);
    setBills((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Voting Records
  const addVotingRecord = useCallback(async (record: Omit<VotingRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newRecord = await votingRecordsService.create(record);
    setVotingRecords((prev) => [...prev, newRecord]);
  }, []);

  const updateVotingRecord = useCallback(async (id: string, updates: Partial<VotingRecord>) => {
    const updated = await votingRecordsService.update(id, updates);
    setVotingRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }, []);

  const deleteVotingRecord = useCallback(async (id: string) => {
    await votingRecordsService.delete(id);
    setVotingRecords((prev) => prev.filter((r) => r.id !== id));
  }, []);

  // Political Contacts
  const addPoliticalContact = useCallback(async (contact: Omit<PoliticalContact, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newContact = await politicalContactsService.create(contact);
    setPoliticalContacts((prev) => [...prev, newContact]);
  }, []);

  const updatePoliticalContact = useCallback(async (id: string, updates: Partial<PoliticalContact>) => {
    const updated = await politicalContactsService.update(id, updates);
    setPoliticalContacts((prev) => prev.map((c) => (c.id === id ? updated : c)));
  }, []);

  const deletePoliticalContact = useCallback(async (id: string) => {
    await politicalContactsService.delete(id);
    setPoliticalContacts((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // CEAP Expenses
  const addCeapExpense = useCallback(async (expense: Omit<CeapExpense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newExpense = await ceapService.create(expense);
    setCeapExpenses((prev) => [...prev, newExpense]);
  }, []);

  const updateCeapExpense = useCallback(async (id: string, updates: Partial<CeapExpense>) => {
    const updated = await ceapService.update(id, updates);
    setCeapExpenses((prev) => prev.map((e) => (e.id === id ? updated : e)));
  }, []);

  const deleteCeapExpense = useCallback(async (id: string) => {
    await ceapService.delete(id);
    setCeapExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return useMemo(
    () => ({
      voters,
      leaders,
      helpRecords,
      visits,
      appointments,
      projects,
      amendments,
      isLoading,
      error,
      refreshData: loadData,
      addVoter,
      updateVoter,
      deleteVoter,
      addLeader,
      updateLeader,
      deleteLeader,
      addHelpRecord,
      updateHelpRecord,
      deleteHelpRecord,
      addVisit,
      updateVisit,
      deleteVisit,
      addAppointment,
      updateAppointment,
      deleteAppointment,
      completeAppointment,
      addProject,
      updateProject,
      deleteProject,
      addAmendment,
      updateAmendment,
      deleteAmendment,
      cities, addCity, updateCity, deleteCity,
      executiveRequests, addExecutiveRequest, updateExecutiveRequest, deleteExecutiveRequest,
      staff, addStaff, updateStaff, deleteStaff,
      gabineteTasks, addGabineteTask, updateGabineteTask, deleteGabineteTask,
      bills, addBill, updateBill, deleteBill,
      votingRecords, addVotingRecord, updateVotingRecord, deleteVotingRecord,
      politicalContacts, addPoliticalContact, updatePoliticalContact, deletePoliticalContact,
      ceapExpenses, addCeapExpense, updateCeapExpense, deleteCeapExpense,
    }),
    [
      voters, leaders, helpRecords, visits, appointments, projects, amendments,
      isLoading, error,
      addVoter, updateVoter, deleteVoter,
      addLeader, updateLeader, deleteLeader,
      addHelpRecord, updateHelpRecord, deleteHelpRecord,
      addVisit, updateVisit, deleteVisit,
      addAppointment, updateAppointment, deleteAppointment, completeAppointment,
      addProject, updateProject, deleteProject,
      addAmendment, updateAmendment, deleteAmendment,
      cities, addCity, updateCity, deleteCity,
      executiveRequests, addExecutiveRequest, updateExecutiveRequest, deleteExecutiveRequest,
      staff, addStaff, updateStaff, deleteStaff,
      gabineteTasks, addGabineteTask, updateGabineteTask, deleteGabineteTask,
      bills, addBill, updateBill, deleteBill,
      votingRecords, addVotingRecord, updateVotingRecord, deleteVotingRecord,
      politicalContacts, addPoliticalContact, updatePoliticalContact, deletePoliticalContact,
      ceapExpenses, addCeapExpense, updateCeapExpense, deleteCeapExpense,
    ]
  );
});

// Custom hooks para filtros e buscas
export function useFilteredVoters(search: string, leaderId?: string) {
  const { voters } = useData();

  return useMemo(() => {
    return voters
      .filter((voter) => {
        const matchesSearch =
          !search ||
          voter.name.toLowerCase().includes(search.toLowerCase()) ||
          voter.phone.includes(search) ||
          voter.cpf?.includes(search);

        const matchesLeader = !leaderId || voter.leaderId === leaderId;

        return matchesSearch && matchesLeader;
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  }, [voters, search, leaderId]);
}

export function useVotersByLeader(leaderId: string) {
  const { voters } = useData();

  return useMemo(() => {
    return voters.filter((voter) => voter.leaderId === leaderId);
  }, [voters, leaderId]);
}

export function useHelpRecordsByVoter(voterId: string) {
  const { helpRecords } = useData();

  return useMemo(() => {
    return helpRecords
      .filter((record) => record.voterId === voterId)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [helpRecords, voterId]);
}

export function useVisitsByVoter(voterId: string) {
  const { visits } = useData();

  return useMemo(() => {
    return visits
      .filter((visit) => visit.voterId === voterId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [visits, voterId]);
}

export function useAppointmentsByDate(date?: string) {
  const { appointments } = useData();

  return useMemo(() => {
    if (!date) {
      return appointments.sort(
        (a, b) =>
          new Date(`${a.date}T${a.time}`).getTime() -
          new Date(`${b.date}T${b.time}`).getTime()
      );
    }

    return appointments
      .filter((appointment) => appointment.date === date)
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.time}`).getTime() -
          new Date(`${b.date}T${b.time}`).getTime()
      );
  }, [appointments, date]);
}

export function useUpcomingAppointments(days: number = 7) {
  const { appointments } = useData();

  return useMemo(() => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return appointments
      .filter((appointment) => {
        const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
        return (
          appointmentDate >= now &&
          appointmentDate <= futureDate &&
          appointment.status === "scheduled"
        );
      })
      .sort(
        (a, b) =>
          new Date(`${a.date}T${a.time}`).getTime() -
          new Date(`${b.date}T${b.time}`).getTime()
      );
  }, [appointments, days]);
}
