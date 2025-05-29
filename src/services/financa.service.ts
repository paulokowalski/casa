import { api } from './api';
import Item from '../interface/Item';

export interface Compra {
    id: string;
    dataParcela: string;
    dataCompra: string;
    nomeCompra: string;
    nomeCartao: string;
    nomePessoa: string;
    numeroParcela: number;
    numeroTotalParcela: number;
    ultimaParcela: string;
    valorFaltante: number;
    valorParcela: number;
    valorTotal: number;
    comprasCartao: CompraCartao[];
}

export interface CompraCartao {
    nomeCartao: string;
    valorTotal: number;
}

export interface Despesa {
    valorMes: number;
    valorProximoMes: number;
    valorSaindo: number;
    valorParcelaSaindo: number;
    valorSaindoTotal: number;
}

export interface DespesaPorMes {
    valorMes: number;
    valorProximoMes: number;
    valorSaindo: number;
    valorParcelaSaindo: number;
    valorSaindoTotal: number;
}

export interface FiltroResponse {
    anos: Item[];
    meses: Item[];
    pessoas: Item[];
    cartoes: Item[];
}

class FinancaService {
    async buscarCompras(ano: string, mes: string, pessoa: string, cartao: string, ultimaParcela: string): Promise<{ compras: Compra[], data: any }> {
        const response = await api.get(`/v1/compra/${ano}/${mes}/${pessoa}/${cartao}/${ultimaParcela}`);
        return response.data;
    }

    async buscarDespesa(ano: string, mes: string, pessoa: string): Promise<Despesa> {
        const response = await api.get(`/v1/despesa/${ano}/${mes}/${pessoa}`);
        return response.data;
    }

    async buscarDespesasPorMes(ano: string, pessoa: string): Promise<Record<string, DespesaPorMes>> {
        const response = await api.get(`/v1/despesa/${ano}/${pessoa}`);
        return response.data.despesasPorMes;
    }

    async cadastrarCompra(dados: {
        nomeProduto: string;
        valorProduto: string;
        dataCompra: string;
        numeroParcelas: string;
        nomePessoaCompra: string;
        nomeCartao: string;
    }): Promise<void> {
        await api.post('/v1/compra', dados);
    }

    async excluirCompra(id: string): Promise<void> {
        await api.delete(`/v1/compra/${id}`);
    }

    async buscarAnos(): Promise<Item[]> {
        const response = await api.get('/v1/filtro/anos');
        return response.data;
    }

    async buscarMeses(ano: string): Promise<Item[]> {
        const response = await api.get(`/v1/filtro/meses/${ano}`);
        return response.data;
    }

    async buscarPessoas(ano: string, mes: string): Promise<Item[]> {
        const response = await api.get(`/v1/filtro/pessoas/${ano}/${mes}`);
        return response.data;
    }

    async buscarCartoes(ano: string, mes: string, pessoa: string): Promise<Item[]> {
        const response = await api.get(`/v1/filtro/cartao/${ano}/${mes}/${pessoa}`);
        return response.data;
    }
}

export const financaService = new FinancaService(); 