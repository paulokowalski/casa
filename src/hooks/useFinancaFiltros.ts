import { useState, useEffect, useCallback } from 'react';
import { financaService } from '../services/financa.service';
import Item from '../interface/Item';

const itemVazio: Item = { codigo: 'TODOS', descricao: 'TODOS' };

export function useFinancaFiltros() {
    const [anoSelecionado, setAnoSelecionado] = useState<string>('');
    const [mesSelecionado, setMesSelecionado] = useState<string>('');
    const [pessoaSelecionado, setPessoaSelecionado] = useState<string>('');
    const [cartaoSelecionado, setCartaoSelecionado] = useState<string>('');
    const [ultimaParcelaSelecionado, setUltimaParcelaSelecionado] = useState<string>('');

    const [itemsAnos, setItemsAnos] = useState<Item[]>([]);
    const [itemsMeses, setItemsMeses] = useState<Item[]>([]);
    const [itemsPessoas, setItemsPessoas] = useState<Item[]>([]);
    const [itemsCartoes, setItemsCartoes] = useState<Item[]>([]);

    const itemsUltimaParcela: Item[] = [
        { codigo: 'SIM', descricao: 'SIM' },
        { codigo: 'NAO', descricao: 'NÃO' },
        itemVazio
    ];

    const carregarAnos = useCallback(async () => {
        try {
            const anos = await financaService.buscarAnos();
            setItemsAnos(anos);
        } catch (error) {
            console.error('Erro ao carregar anos:', error);
        }
    }, []);

    const carregarMeses = useCallback(async (ano: string) => {
        if (!ano) return;
        try {
            const meses = await financaService.buscarMeses(ano);
            setItemsMeses(meses);
        } catch (error) {
            console.error('Erro ao carregar meses:', error);
        }
    }, []);

    const carregarPessoas = useCallback(async (ano: string, mes: string) => {
        if (!ano || !mes) return;
        try {
            const pessoas = await financaService.buscarPessoas(ano, mes);
            setItemsPessoas(pessoas);
        } catch (error) {
            console.error('Erro ao carregar pessoas:', error);
        }
    }, []);

    const carregarCartoes = useCallback(async (ano: string, mes: string, pessoa: string) => {
        if (!ano || !mes || !pessoa) return;
        try {
            const cartoes = await financaService.buscarCartoes(ano, mes, pessoa);
            setItemsCartoes(cartoes);
        } catch (error) {
            console.error('Erro ao carregar cartões:', error);
        }
    }, []);

    useEffect(() => {
        carregarAnos();
    }, [carregarAnos]);

    const handleAnoChange = useCallback((ano: string) => {
        setAnoSelecionado(ano);
        setMesSelecionado('');
        setPessoaSelecionado('');
        setCartaoSelecionado('');
        carregarMeses(ano);
    }, [carregarMeses]);

    const handleMesChange = useCallback((mes: string) => {
        setMesSelecionado(mes);
        setPessoaSelecionado('');
        setCartaoSelecionado('');
        if (anoSelecionado) {
            carregarPessoas(anoSelecionado, mes);
        }
    }, [anoSelecionado, carregarPessoas]);

    const handlePessoaChange = useCallback((pessoa: string) => {
        setPessoaSelecionado(pessoa);
        setCartaoSelecionado('');
        if (anoSelecionado && mesSelecionado) {
            carregarCartoes(anoSelecionado, mesSelecionado, pessoa);
        }
    }, [anoSelecionado, mesSelecionado, carregarCartoes]);

    return {
        filtros: {
            anoSelecionado,
            mesSelecionado,
            pessoaSelecionado,
            cartaoSelecionado,
            ultimaParcelaSelecionado
        },
        items: {
            itemsAnos,
            itemsMeses,
            itemsPessoas,
            itemsCartoes,
            itemsUltimaParcela
        },
        handlers: {
            handleAnoChange,
            handleMesChange,
            handlePessoaChange,
            setCartaoSelecionado,
            setUltimaParcelaSelecionado
        }
    };
} 