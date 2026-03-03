import api from './api';
import { Leader } from '../types';

export const leadersService = {
  /**
   * Listar todas as articuladores políticos
   */
  async getAll(): Promise<Leader[]> {
    try {
      console.log('LeadersService: Buscando articuladores políticos e usuários...');

      // Buscar articuladores políticos e usuários em paralelo
      const [leadersResponse, usersResponse] = await Promise.all([
        api.get<Leader[]>('/leaders').catch(err => {
          console.error('LeadersService: Erro ao buscar articuladores políticos:', err);
          return { data: [] as Leader[] };
        }),
        api.get<any[]>('/users').catch(err => {
          console.error('LeadersService: Erro ao buscar usuários:', err);
          return { data: [] as any[] };
        })
      ]);

      const leaders = Array.isArray(leadersResponse.data) ? leadersResponse.data : [];

      // Safely extract users from response
      let users: any[] = [];
      if (Array.isArray(usersResponse.data)) {
        users = usersResponse.data;
      } else if (usersResponse.data && Array.isArray((usersResponse.data as any).data)) {
        users = (usersResponse.data as any).data;
      } else if (usersResponse.data && Array.isArray((usersResponse.data as any).users)) {
        users = (usersResponse.data as any).users;
      } else {
        console.warn('LeadersService: Resposta de usuários não é um array:', usersResponse.data);
      }

      console.log(`LeadersService: Encontrados ${leaders.length} articuladores políticos e ${users.length} usuários`);

      // Filtrar usuários com role 'lideranca'
      const leadershipUsers = users.filter(u => u.role === 'lideranca' && u.active);

      // Identificar usuários que já têm registro de articulador político (pelo ID do usuário ou email)
      const existingLeaderUserIds = new Set(leaders.map(l => l.userId).filter(Boolean));
      const existingLeaderEmails = new Set(leaders.map(l => l.email).filter(Boolean));

      // Mapear usuários órfãos para o formato de Leader
      const orphanUsersAsLeaders: Leader[] = leadershipUsers
        .filter(u => !existingLeaderUserIds.has(u.id) && !existingLeaderEmails.has(u.email))
        .map(u => ({
          id: u.id, // Usar ID do usuário temporariamente
          name: u.name,
          cpf: u.cpf,
          phone: u.phone,
          email: u.email,
          region: u.region || 'Região não informada',
          votersCount: 0,
          votersGoal: 0,
          active: u.active,
          userId: u.id,
          createdAt: u.createdAt,
          vereadorId: u.vereadorId
        }));

      // Enriquecer articuladores políticos existentes com vereadorId dos usuários correspondentes
      const enrichedLeaders = leaders.map(leader => {
        if (leader.vereadorId) return leader; // Já tem vereadorId

        // Tentar encontrar usuário correspondente
        const user = users.find(u => u.id === leader.userId || u.email === leader.email);
        if (user && user.vereadorId) {
          return { ...leader, vereadorId: user.vereadorId };
        }
        return leader;
      });

      console.log(`LeadersService: Adicionando ${orphanUsersAsLeaders.length} usuários de articulador político sem registro específico`);

      // Combinar listas
      return [...enrichedLeaders, ...orphanUsersAsLeaders];
    } catch (error: any) {
      console.error('LeadersService: Erro geral ao buscar articuladores políticos:', error);
      return [];
    }
  },

  /**
   * Buscar articulador político por ID
   */
  async getById(id: string): Promise<Leader> {
    const response = await api.get<Leader>(`/leaders/${id}`);
    return response.data;
  },

  /**
   * Criar nova articulador político
   */
  async create(data: Omit<Leader, 'id' | 'createdAt' | 'votersCount'>): Promise<Leader> {
    console.log('LeadersService.create: Sending data =', data);
    try {
      const response = await api.post<Leader>('/leaders', data);
      console.log('LeadersService.create: Response =', response.data);
      return response.data;
    } catch (error: any) {
      console.error('LeadersService.create: Error =', error);
      console.error('LeadersService.create: Error response =', error?.response?.data);
      throw error;
    }
  },

  /**
   * Atualizar articulador político
   */
  async update(id: string, data: Partial<Leader>): Promise<Leader> {
    const response = await api.patch<Leader>(`/leaders/${id}`, data);
    return response.data;
  },

  /**
   * Deletar articulador político
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/leaders/${id}`);
  },

  /**
   * Cria um registro de Leader a partir de um usuário com role articulador político
   * Usado quando o usuário existe mas não tem registro correspondente na tabela leaders
   */
  async createFromUser(userId: string, userData: { name: string; cpf?: string; phone: string; email?: string; region?: string }): Promise<Leader> {
    console.log('LeadersService: Criando leader a partir de user:', userId);
    const response = await api.post<Leader>(`/leaders/from-user/${userId}`, userData);
    console.log('LeadersService: Leader criado:', response.data);
    return response.data;
  },
};
