import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExecutiveRequest, RequestStatus, RequestType } from '../types';

const STORAGE_KEY = '@governeai:executive_requests';

// Gerar ID simples
const generateId = (): string => {
    return 'req-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
};

const getStoredRequests = async (): Promise<ExecutiveRequest[]> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

const saveRequests = async (requests: ExecutiveRequest[]): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
};

export const executiveRequestsService = {
    /**
     * Listar todos os ofícios/requerimentos (localStorage)
     */
    async getAll(): Promise<ExecutiveRequest[]> {
        const requests = await getStoredRequests();
        return requests.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },

    /**
     * Buscar ofício/requerimento por ID
     */
    async getById(id: string): Promise<ExecutiveRequest> {
        const requests = await getStoredRequests();
        const request = requests.find(r => r.id === id);
        if (!request) throw new Error('Requerimento não encontrado');
        return request;
    },

    /**
     * Criar novo ofício/requerimento
     */
    async create(data: Omit<ExecutiveRequest, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExecutiveRequest> {
        const requests = await getStoredRequests();

        // Verificar duplicidade de protocolo
        if (requests.some(r => r.protocolNumber === data.protocolNumber)) {
            throw new Error('Já existe um requerimento com este número de protocolo');
        }

        const now = new Date().toISOString();
        const newRequest: ExecutiveRequest = {
            ...data,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
        };
        requests.push(newRequest);
        await saveRequests(requests);
        return newRequest;
    },

    /**
     * Atualizar ofício/requerimento
     */
    async update(id: string, data: Partial<ExecutiveRequest>): Promise<ExecutiveRequest> {
        const requests = await getStoredRequests();
        const index = requests.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Requerimento não encontrado');

        // Verificar duplicidade de protocolo em caso de alteração
        if (data.protocolNumber && data.protocolNumber !== requests[index].protocolNumber) {
            if (requests.some(r => r.protocolNumber === data.protocolNumber && r.id !== id)) {
                throw new Error('Já existe um requerimento com este número de protocolo');
            }
        }

        requests[index] = {
            ...requests[index],
            ...data,
            id,
            updatedAt: new Date().toISOString(),
        };
        await saveRequests(requests);
        return requests[index];
    },

    /**
     * Deletar ofício/requerimento
     */
    async delete(id: string): Promise<void> {
        const requests = await getStoredRequests();
        const filtered = requests.filter(r => r.id !== id);
        if (filtered.length === requests.length) throw new Error('Requerimento não encontrado');
        await saveRequests(filtered);
    },
};
