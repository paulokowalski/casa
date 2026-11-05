import { FilterBar } from '../../../components/ui/FilterBar';
import { useGestaoCartao } from '../../../contexts/GestaoCartaoContext';
import { TODOS } from '../../../services/financas';
import type { Item } from '../../../types/financas';

const opcoes = (itens: Item[]) => itens.map((i) => ({ value: i.codigo, label: i.descricao }));

const ULTIMA_PARCELA = [
  { value: TODOS, label: 'Todas' },
  { value: 'SIM', label: 'Sim' },
  { value: 'NAO', label: 'Não' },
];

export function Filtro() {
  const f = useGestaoCartao();
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
    />
  );
}
