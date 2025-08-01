import { useContext } from 'react';
import { Box, Typography } from '@mui/material';
import { GestaoCartaoContext } from '../../../contexts/GestaoCartaoContext';
import { Filter } from '../../../components/ui/Filter';

export function Filtro() {
    const {
        itemsAnos,
        itemsMeses,
        itemsPessoas,
        itemsCartoes,
        anoSelecionado,
        mesSelecionado,
        pessoaSelecionado,
        cartaoSelecionado,
        ultimaParcelaSelecionado,
        selecionarAno,
        selecionarMes,
        selecionarPessoa,
        selecionarCartao,
        selecionarUltimaParcela,
        buscar
    } = useContext(GestaoCartaoContext);

    const itemsUltimaParcela = [
        { codigo: 'SIM', descricao: 'SIM' },
        { codigo: 'NAO', descricao: 'NÃO' },
        { codigo: '', descricao: 'Selecione...' }
    ];

    const fields = [
        {
            id: 'ano',
            label: 'Ano',
            type: 'select' as const,
            value: anoSelecionado,
            onChange: selecionarAno,
            options: itemsAnos.map(item => ({ value: item.codigo, label: item.descricao })),
        },
        {
            id: 'mes',
            label: 'Mês',
            type: 'select' as const,
            value: mesSelecionado,
            onChange: selecionarMes,
            options: itemsMeses.map(item => ({ value: item.codigo, label: item.descricao })),
        },
        {
            id: 'pessoa',
            label: 'Pessoa',
            type: 'select' as const,
            value: pessoaSelecionado,
            onChange: selecionarPessoa,
            options: itemsPessoas.map(item => ({ value: item.codigo, label: item.descricao })),
        },
        {
            id: 'cartao',
            label: 'Cartão',
            type: 'select' as const,
            value: cartaoSelecionado,
            onChange: selecionarCartao,
            options: itemsCartoes.map(item => ({ value: item.codigo, label: item.descricao })),
        },
        {
            id: 'ultimaParcela',
            label: 'Última Parcela',
            type: 'select' as const,
            value: ultimaParcelaSelecionado,
            onChange: selecionarUltimaParcela,
            options: itemsUltimaParcela.map(item => ({ value: item.codigo, label: item.descricao })),
        },
    ];

    return (
        <Box>
            <Typography variant="h6" sx={{ color: '#f5f6fa', mb: 2 }}>
                Filtros de Gestão de Cartão
            </Typography>
            <Filter fields={fields} onFilter={buscar} filterLabel="Pesquisar" />
        </Box>
    );
}