import { useEffect, useState } from 'react';
import { InputAdornment, TextField, Tooltip } from '@mui/material';
import { FilterBar } from '../../../components/ui/FilterBar';
import { useGestaoCartao } from '../../../contexts/GestaoCartaoContext';
import { TODOS } from '../../../services/financas';
import type { Item } from '../../../types/financas';
import { maskCurrencyInput, parseCurrency, toCurrencyInput } from '../../../utils/format';

const opcoes = (itens: Item[]) => itens.map((i) => ({ value: i.codigo, label: i.descricao }));

const ULTIMA_PARCELA = [
  { value: TODOS, label: 'Todas' },
  { value: 'SIM', label: 'Sim' },
  { value: 'NAO', label: 'Não' },
];

export function Filtro() {
  const f = useGestaoCartao();
  const [orcamentoTexto, setOrcamentoTexto] = useState(f.orcamento ? toCurrencyInput(f.orcamento) : '');

  useEffect(() => setOrcamentoTexto(f.orcamento ? toCurrencyInput(f.orcamento) : ''), [f.orcamento]);

  const confirmarOrcamento = () => {
    const v = parseCurrency(orcamentoTexto);
    f.salvarOrcamento(v > 0 ? v : null);
  };

  return (
    <FilterBar
      onSubmit={f.buscar}
      loading={f.loading || f.carregando}
      fields={[
        {
          id: 'cartao-ano',
          label: 'Ano',
          value: f.selecionados.ano,
          options: opcoes(f.anos),
          onChange: f.selecionarAno,
        },
        {
          id: 'cartao-mes',
          label: 'Mês',
          value: f.selecionados.mes,
          options: opcoes(f.meses),
          onChange: f.selecionarMes,
        },
        {
          id: 'cartao-pessoa',
          label: 'Pessoa',
          value: f.selecionados.pessoa,
          options: opcoes(f.pessoas),
          onChange: f.selecionarPessoa,
        },
        {
          id: 'cartao-cartao',
          label: 'Cartão',
          value: f.selecionados.cartao,
          options: opcoes(f.cartoes),
          onChange: f.selecionarCartao,
        },
        {
          id: 'cartao-ultima',
          label: 'Última parcela',
          value: f.ultimaParcela,
          options: ULTIMA_PARCELA,
          onChange: f.setUltimaParcela,
        },
      ]}
    >
      <Tooltip title="Seu teto de gastos mensal. Fica salvo neste navegador, por pessoa.">
        <TextField
          size="small"
          label="Orçamento mensal"
          value={orcamentoTexto}
          placeholder="Definir"
          onChange={(e) => setOrcamentoTexto(maskCurrencyInput(e.target.value.replace('-', '')))}
          onBlur={confirmarOrcamento}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              confirmarOrcamento();
            }
          }}
          inputProps={{ inputMode: 'decimal' }}
          InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
          fullWidth
        />
      </Tooltip>
    </FilterBar>
  );
}
