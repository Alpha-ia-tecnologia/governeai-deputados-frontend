import AsyncStorage from '@react-native-async-storage/async-storage';
import { City } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = '@governeai:cities';

// Gerar UUID simples caso uuid não esteja disponível
const generateId = (): string => {
    try {
        return uuidv4();
    } catch {
        return 'city-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
    }
};

const getStoredCities = async (): Promise<City[]> => {
    try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

const saveCities = async (cities: City[]): Promise<void> => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
};

export const citiesService = {
    /**
     * Listar todas as cidades (localStorage)
     */
    async getAll(): Promise<City[]> {
        const cities = await getStoredCities();
        return cities.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    },

    /**
     * Buscar cidade por ID
     */
    async getById(id: string): Promise<City> {
        const cities = await getStoredCities();
        const city = cities.find(c => c.id === id);
        if (!city) throw new Error('Cidade não encontrada');
        return city;
    },

    /**
     * Criar nova cidade
     */
    async create(data: Omit<City, 'id' | 'createdAt' | 'updatedAt'>): Promise<City> {
        const cities = await getStoredCities();
        const now = new Date().toISOString();
        const newCity: City = {
            ...data,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
        };
        cities.push(newCity);
        await saveCities(cities);
        return newCity;
    },

    /**
     * Atualizar cidade
     */
    async update(id: string, data: Partial<City>): Promise<City> {
        const cities = await getStoredCities();
        const index = cities.findIndex(c => c.id === id);
        if (index === -1) throw new Error('Cidade não encontrada');

        cities[index] = {
            ...cities[index],
            ...data,
            id, // impedir alteração do id
            updatedAt: new Date().toISOString(),
        };
        await saveCities(cities);
        return cities[index];
    },

    /**
     * Deletar cidade
     */
    async delete(id: string): Promise<void> {
        const cities = await getStoredCities();
        const filtered = cities.filter(c => c.id !== id);
        if (filtered.length === cities.length) throw new Error('Cidade não encontrada');
        await saveCities(filtered);
    },
};
