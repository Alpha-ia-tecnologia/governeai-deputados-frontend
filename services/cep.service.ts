// Serviço de busca de CEP usando ViaCEP (gratuito)

export interface CepResult {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export interface AddressFromCep {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
}

class CepService {
  private readonly VIACEP_URL = 'https://viacep.com.br/ws';

  async searchByCep(cep: string): Promise<AddressFromCep | null> {
    try {
      // Remove caracteres não numéricos
      const cleanCep = cep.replace(/\D/g, '');

      if (cleanCep.length !== 8) {
        console.warn('CEP inválido:', cep);
        return null;
      }

      const response = await fetch(`${this.VIACEP_URL}/${cleanCep}/json/`);

      if (!response.ok) {
        console.error('Erro ao buscar CEP:', response.status);
        return null;
      }

      const data: CepResult = await response.json();

      if (data.erro) {
        console.warn('CEP não encontrado:', cep);
        return null;
      }

      return {
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
        cep: data.cep || cleanCep,
      };
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      return null;
    }
  }

  formatCep(cep: string): string {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length <= 5) {
      return cleanCep;
    }
    return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5, 8)}`;
  }

  isValidCep(cep: string): boolean {
    const cleanCep = cep.replace(/\D/g, '');
    return cleanCep.length === 8;
  }
}

export const cepService = new CepService();
