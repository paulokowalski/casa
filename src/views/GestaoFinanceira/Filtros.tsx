import { useEffect, useState } from 'react';
import { InputAdornment, TextField, Tooltip } from '@mui/material';
import { FilterBar } from '../../components/ui/FilterBar';
import { useGestaoFinanceira } from '../../contexts/GestaoFinanceiraContext';
import { useToast } from '../../contexts/ToastContext';
import { MONTHS_PT, maskCurrencyInput, parseCurrency, toCurrencyInput } from '../../utils/format';

const MESES = MONTHS_PT.map((m, i) => ({ value: String(i + 1), label: m }));

/** Mês, pessoa e renda líquida. Mudar um filtro recarrega a tela na hora. */
export function Filtros() {
  const f = useGestaoFinanceira();
  const { notify } = useToast();
  const [rendaTexto, setRendaTexto] = useState('');

  useEffect(() => setRendaTexto(f.renda ? toCurrencyInput(f.renda) : ''), [f.renda]);

  const confirmarRenda = async () => {
    const valor = parseCurrency(rendaTexto);
    const novo = valor > 0 ? valor : null;
    if (novo === f.renda && !f.rendaHerdada) return;
    try {
      await f.salvarRenda(novo);
      notify(novo ? 'Renda salva.' : 'Renda removida.');
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Erro ao salvar a renda.', 'error');
    }
  };

  return (
    <FilterBar
      fields={[
        {
          id: 'gf-ano',
          label: 'Ano',
          value: String(f.ano),
          options: f.anos.map((a) => ({ value: String(a), label: String(a) })),
          onChange: (v) => f.setAno(Number(v)),
        },
        { id: 'gf-mes', label: 'Mês', value: String(f.mes), options: MESES, onChange: (v) => f.setMes(Number(v)) },
        {
          id: 'gf-pessoa',
          label: 'Pessoa',
          value: f.pessoa ? String(f.pessoa.id) : '',
          options: f.pessoas.map((p) => ({ value: String(p.id), label: p.nome })),
          onChange: (v) => f.setPessoaId(Number(v)),
        },
      ]}
    >
      <Tooltip title="Sua renda líquida no mês. Vale para os meses seguintes até você mudar.">
        <TextField
          size="small"
          label="Renda líquida do mês"
          value={rendaTexto}
          placeholder="Informar"
          helperText={f.rendaHerdada ? 'Mesma do mês anterior' : undefined}
          onChange={(e) => setRendaTexto(maskCurrencyInput(e.target.value.replace('-', '')))}
          onBlur={confirmarRenda}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              void confirmarRenda();
            }
          }}
          inputProps={{ inputMode: 'decimal' }}
          InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
          fullWidth
          sx={{ '& .MuiFormHelperText-root': { position: 'absolute', bottom: -18, m: 0 } }}
        />
      </Tooltip>
    </FilterBar>
  );
}
