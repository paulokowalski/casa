import { api } from './api';
import { API_URLS } from '../config/urls';
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

class GestaoCartaoService {
    async buscarCompras(ano: string, mes: string, pessoa: string, cartao: string, ultimaParcela: string): Promise<{ compras: Compra[], data: any }> {
        const response = await api.get(API_URLS.COMPRA(ano, mes, pessoa, cartao, ultimaParcela));
        return response.data;
    }

    async buscarDespesa(ano: string, mes: string, pessoa: string): Promise<Despesa> {
        const response = await api.get(API_URLS.DESPESA(ano, mes, pessoa));
        return response.data;
    }

    async buscarDespesasPorMes(ano: string, pessoa: string): Promise<Record<string, DespesaPorMes>> {
        const response = await api.get(API_URLS.DESPESA_SEM_MES(ano, pessoa));
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
        await api.post(API_URLS.COMPRA_ID(''), dados);
    }

    async excluirCompra(id: string): Promise<void> {
        await api.delete(API_URLS.COMPRA_ID(id));
    }

    async buscarAnos(): Promise<Item[]> {
        const response = await api.get(API_URLS.FILTRO_ANOS);
        return response.data;
    }

    async buscarMeses(ano: string): Promise<Item[]> {
        const response = await api.get(API_URLS.FILTRO_MESES(ano));
        return response.data;
    }

    async buscarPessoas(ano: string, mes: string): Promise<Item[]> {
        const response = await api.get(API_URLS.FILTRO_PESSOAS(ano, mes));
        return response.data;
    }

    async buscarCartoes(ano: string, mes: string, pessoa: string): Promise<Item[]> {
        const response = await api.get(API_URLS.FILTRO_CARTAO(ano, mes, pessoa));
        return response.data;
    }
}

export const gestaoCartaoService = new GestaoCartaoService(); 