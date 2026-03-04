/**
 * Serviço para buscar municípios via API do IBGE
 * https://servicodados.ibge.gov.br/api/v1/localidades/estados/{UF}/municipios
 */

export interface IBGEMunicipio {
    id: number;
    nome: string;
}

// Cache in-memory para evitar refetch ao trocar de aba e voltar
const cache: Record<string, IBGEMunicipio[]> = {};

/**
 * Busca municípios de um estado (UF) via API do IBGE.
 * Retorna lista ordenada alfabeticamente pelo nome.
 * Usa cache in-memory para evitar requests repetidos.
 */
export async function fetchCitiesByState(uf: string): Promise<IBGEMunicipio[]> {
    if (!uf) return [];

    const key = uf.toUpperCase();
    if (cache[key]) return cache[key];

    try {
        const response = await fetch(
            `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${key}/municipios?orderBy=nome`
        );

        if (!response.ok) {
            throw new Error(`Erro ao buscar municípios: ${response.status}`);
        }

        const data = await response.json();
        const cities: IBGEMunicipio[] = data.map((m: any) => ({
            id: m.id,
            nome: m.nome,
        }));

        // Ordenar alfabeticamente (API já ordena, mas garantir)
        cities.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));

        cache[key] = cities;
        return cities;
    } catch (error) {
        console.error('Erro ao buscar municípios do IBGE:', error);
        return [];
    }
}
