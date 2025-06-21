import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Configuração base do cliente HTTP
class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Interceptor de requisição
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error: AxiosError) => {
        console.error('❌ API Request Error:', error.message);
        return Promise.reject(error);
      }
    );

    // Interceptor de resposta
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        console.error('❌ API Response Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  // Método genérico para requisições GET
  async get<T>(url: string, config?: any): Promise<T> {
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Método genérico para requisições POST
  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Tratamento centralizado de erros
  private handleError(error: any): Error {
    if (error.response) {
      // Erro de resposta do servidor
      const status = error.response.status;
      const message = error.response.data?.message || 'Erro no servidor';
      
      switch (status) {
        case 404:
          return new Error('Recurso não encontrado');
        case 500:
          return new Error('Erro interno do servidor');
        default:
          return new Error(`Erro ${status}: ${message}`);
      }
    } else if (error.request) {
      // Erro de rede
      return new Error('Erro de conexão. Verifique sua internet.');
    } else {
      // Outros erros
      return new Error(error.message || 'Erro desconhecido');
    }
  }
}

// Instância singleton do cliente
export const apiClient = new ApiClient(); 