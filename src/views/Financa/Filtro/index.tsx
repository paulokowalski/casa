import { useEffect, useState, useContext } from "react";
import { api } from "../../../services/api";
import { FinancaContext } from "../../../contexts/FinancaContext";
import { DespesaContext } from "../../../contexts/DespesaContext";
import Item from "../../../interface/Item";
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { addMonths, format } from 'date-fns';

const itemVazio: Item = { codigo: 'TODOS', descricao: 'TODOS' };

export function Filtro() {
    const { buscarFinancas } = useContext(FinancaContext);
    const { buscarDespesa } = useContext(DespesaContext);

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

    useEffect(() => {
        api.get('/v1/filtro/anos')
            .then(response => setItemsAnos(response.data))
    }, []);

    function selecionarAno(item: Item) {
        setAnoSelecionado(item.codigo);
        api.get('/v1/filtro/meses/' + item.codigo)
            .then(response => setItemsMeses(response.data));
    }

    function selecionarMes(item: Item) {
        setMesSelecionado(item.codigo);
        api.get('/v1/filtro/pessoas/' + anoSelecionado + '/' + item.codigo)
            .then(response => setItemsPessoas(response.data))
            .catch(err => console.log(err));
    }

    function selecionarPessoa(item: Item) {
        setPessoaSelecionado(item.codigo);
        api.get('/v1/filtro/cartao/' + anoSelecionado + '/' + mesSelecionado + '/' + item.codigo)
            .then(response => setItemsCartoes(response.data))
            .catch(err => console.log(err));
        itemsCartoes.push(itemVazio);
    }

    function selecionarCartao(item: Item) {
        setCartaoSelecionado(item.codigo);
    }

    function selecionarUltimaParcela(item: Item) {
        setUltimaParcelaSelecionado(item.codigo);
    }

    function buscar() {
        if (anoSelecionado && mesSelecionado && pessoaSelecionado) {
            buscarFinancas(
                itemsAnos.find(i => i.codigo === anoSelecionado) || itemVazio,
                itemsMeses.find(i => i.codigo === mesSelecionado) || itemVazio,
                itemsPessoas.find(i => i.codigo === pessoaSelecionado) || itemVazio,
                itemsCartoes.find(i => i.codigo === cartaoSelecionado) || itemVazio,
                itemsUltimaParcela.find(i => i.codigo === ultimaParcelaSelecionado) || itemVazio
            );
            buscarDespesa(
                itemsAnos.find(i => i.codigo === anoSelecionado) || itemVazio,
                itemsMeses.find(i => i.codigo === mesSelecionado) || itemVazio,
                itemsPessoas.find(i => i.codigo === pessoaSelecionado) || itemVazio
            );
        }
    }

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 2 }}>
            <FormControl fullWidth size="small">
                <InputLabel>Ano</InputLabel>
                <Select
                    value={anoSelecionado}
                    label="Ano"
                    onChange={(e: SelectChangeEvent) => {
                        const item = itemsAnos.find(i => i.codigo === e.target.value);
                        if (item) selecionarAno(item);
                    }}
                >
                    {itemsAnos.map(item => (
                        <MenuItem key={item.codigo} value={item.codigo}>
                            {item.descricao}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth size="small">
                <InputLabel>Mês</InputLabel>
                <Select
                    value={mesSelecionado}
                    label="Mês"
                    onChange={(e: SelectChangeEvent) => {
                        const item = itemsMeses.find(i => i.codigo === e.target.value);
                        if (item) selecionarMes(item);
                    }}
                >
                    {itemsMeses.map(item => (
                        <MenuItem key={item.codigo} value={item.codigo}>
                            {item.descricao}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth size="small">
                <InputLabel>Pessoa</InputLabel>
                <Select
                    value={pessoaSelecionado}
                    label="Pessoa"
                    onChange={(e: SelectChangeEvent) => {
                        const item = itemsPessoas.find(i => i.codigo === e.target.value);
                        if (item) selecionarPessoa(item);
                    }}
                >
                    {itemsPessoas.map(item => (
                        <MenuItem key={item.codigo} value={item.codigo}>
                            {item.descricao}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth size="small">
                <InputLabel>Cartão</InputLabel>
                <Select
                    value={cartaoSelecionado}
                    label="Cartão"
                    onChange={(e: SelectChangeEvent) => {
                        const item = itemsCartoes.find(i => i.codigo === e.target.value);
                        if (item) selecionarCartao(item);
                    }}
                >
                    {itemsCartoes.map(item => (
                        <MenuItem key={item.codigo} value={item.codigo}>
                            {item.descricao}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth size="small">
                <InputLabel>Última Parcela</InputLabel>
                <Select
                    value={ultimaParcelaSelecionado}
                    label="Última Parcela"
                    onChange={(e: SelectChangeEvent) => {
                        const item = itemsUltimaParcela.find(i => i.codigo === e.target.value);
                        if (item) selecionarUltimaParcela(item);
                    }}
                >
                    {itemsUltimaParcela.map(item => (
                        <MenuItem key={item.codigo} value={item.codigo}>
                            {item.descricao}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <Button 
                variant="contained" 
                color="primary" 
                onClick={buscar}
                fullWidth
                sx={{ height: '40px' }}
            >
                Pesquisar
            </Button>
        </Box>
    );
}