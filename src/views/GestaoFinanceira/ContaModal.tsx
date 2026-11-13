import { useEffect, useState, type FormEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import { Modal } from '../../components/ui/Modal';
import { useGestaoFinanceira } from '../../contexts/GestaoFinanceiraContext';
import { mesIdx, rotuloMesLongo } from '../../lib/financas/parcelas';
import { palette, tones } from '../../styles/tokens';
import type { Conta, ContaInput, TipoConta } from '../../types/contas';
import { formatCurrency, maskCurrencyInput, parseCurrency, toCurrencyInput } from '../../utils/format';

interface ContaModalProps {
  open: boolean;
  conta: Conta | null;
  onClose: () => void;
  onSucesso: (mensagem: string) => void;
  onExcluir?: (conta: Conta) => void;
}

const TIPOS: { id: TipoConta; nome: string; desc: string }[] = [
  { id: 'RECORRENTE', nome: 'Todo mês', desc: 'Plano, escola, internet' },
  { id: 'PARCELADA', nome: 'Parcelada', desc: 'Financiamento, IPTU' },
  { id: 'UNICA', nome: 'Uma vez', desc: 'Conta avulsa' },
];

interface Form {
  tipo: TipoConta;
  descricao: string;
  categoriaId: string;
  pessoaId: string;
  valor: string;
  dia: string;
  inicio: string;
  fim: string;
  parcelaAtual: string;
  totalParcelas: string;
  juros: string;
  valorVariavel: boolean;
  debitoAutomatico: boolean;
}

const FORM_ID = 'form-conta';
const idxDe = (c: string) => mesIdx({ ano: Number(c.slice(0, 4)), mes: Number(c.slice(5, 7)) });

export function ContaModal({ open, conta, onClose, onSucesso, onExcluir }: Readonly<ContaModalProps>) {
  const ctx = useGestaoFinanceira();
  const [f, setF] = useState<Form | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setErro(null);
    setF({
      tipo: conta?.tipo ?? 'RECORRENTE',
      descricao: conta?.descricao ?? '',
      categoriaId: conta?.categoriaId ?? '',
      pessoaId: String(conta?.pessoaId ?? ctx.pessoa?.id ?? ''),
      valor: conta ? toCurrencyInput(conta.valor) : '',
      dia: conta ? String(conta.diaVencimento) : '10',
      inicio: conta?.competenciaInicio ?? ctx.competencia,
      fim: conta?.tipo === 'RECORRENTE' ? (conta.competenciaFim ?? '') : '',
      parcelaAtual: String(conta?.parcelaInicial ?? 1),
      totalParcelas: conta?.totalParcelas ? String(conta.totalParcelas) : '',
      juros: conta?.jurosMes ? String(conta.jurosMes).replace('.', ',') : '',
      valorVariavel: conta?.valorVariavel ?? false,
      debitoAutomatico: conta?.debitoAutomatico ?? false,
    });
  }, [open, conta]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!f) return null;
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => (s ? { ...s, [k]: v } : s));

  const valor = parseCurrency(f.valor);
  const parcelaAtual = Number(f.parcelaAtual) || 1;
  const total = Number(f.totalParcelas) || 0;
  const qtdParcelas = Math.max(0, total - parcelaAtual + 1);
  const inicioIdx = f.inicio ? idxDe(f.inicio) : null;

  let resumo: { titulo: string; texto: string } | null = null;
  if (inicioIdx !== null) {
    const ini = rotuloMesLongo(inicioIdx).toLowerCase();
    if (f.tipo === 'PARCELADA' && total > 0 && parcelaAtual <= total) {
      const fim = rotuloMesLongo(inicioIdx + qtdParcelas - 1).toLowerCase();
      resumo = {
        titulo: `Serão lançadas ${qtdParcelas} parcela${qtdParcelas === 1 ? '' : 's'}, de ${ini} a ${fim}`,
        texto: `Parcelas ${parcelaAtual} a ${total}${valor > 0 ? ` · total de ${formatCurrency(valor * qtdParcelas)}` : ''}${parcelaAtual > 1 ? ` · as ${parcelaAtual - 1} já pagas não entram nos meses anteriores` : ''}.`,
      };
    } else if (f.tipo === 'RECORRENTE') {
      resumo = {
        titulo: f.fim
          ? `Lançada todo mês, de ${ini} a ${rotuloMesLongo(idxDe(f.fim)).toLowerCase()}`
          : 'Lançada todo mês, sem data para acabar',
        texto: f.fim
          ? 'Depois do último mês ela some da lista.'
          : `Aparece em todos os meses a partir de ${ini}. Para encerrar, informe o último mês ou exclua a conta.`,
      };
    } else if (f.tipo === 'UNICA') {
      resumo = { titulo: `Lançada só em ${ini}`, texto: 'Entra no total do mês e na lista de contas a pagar.' };
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!f) return;
    setErro(null);
    if (!f.descricao.trim()) return setErro('Informe a descrição.');
    if (!(valor > 0)) return setErro('Informe o valor.');
    if (!f.pessoaId) return setErro('Selecione a pessoa.');
    if (f.tipo === 'PARCELADA' && !(total >= 1 && parcelaAtual >= 1 && parcelaAtual <= total))
      return setErro('Confira a parcela atual e o total de parcelas.');

    const juros = f.juros ? Number(f.juros.replace(',', '.')) : null;
    const dados: ContaInput = {
      pessoaId: Number(f.pessoaId),
      categoriaId: f.categoriaId || null,
      descricao: f.descricao.trim(),
      tipo: f.tipo,
      valor,
      diaVencimento: Math.min(31, Math.max(1, Number(f.dia) || 1)),
      competenciaInicio: f.inicio,
      competenciaFim: f.tipo === 'RECORRENTE' && f.fim ? f.fim : null,
      parcelaInicial: f.tipo === 'PARCELADA' ? parcelaAtual : null,
      totalParcelas: f.tipo === 'PARCELADA' ? total : null,
      jurosMes: f.tipo === 'PARCELADA' && juros && juros > 0 ? juros : null,
      valorVariavel: f.valorVariavel,
      debitoAutomatico: f.debitoAutomatico,
    };
    setSalvando(true);
    try {
      await ctx.salvarConta(dados, conta?.id);
      onSucesso(conta ? 'Conta atualizada.' : 'Conta cadastrada.');
      onClose();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={salvando ? () => undefined : onClose}
      title={conta ? 'Editar conta' : 'Nova conta'}
      maxWidth="sm"
      actions={
        <>
          {conta && onExcluir && (
            <Button color="error" onClick={() => onExcluir(conta)} disabled={salvando} sx={{ mr: 'auto' }}>
              Excluir
            </Button>
          )}
          <Button variant="outlined" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant="contained"
            disabled={salvando}
            startIcon={salvando ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Salvar conta
          </Button>
        </>
      }
    >
      <Box
        component="form"
        id={FORM_ID}
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Gastos que não passam pelo cartão de crédito.
        </Typography>

        <Box
          role="radiogroup"
          aria-label="Como ela se repete?"
          sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}
        >
          {TIPOS.map((t) => {
            const on = f.tipo === t.id;
            return (
              <ButtonBase
                key={t.id}
                role="radio"
                aria-checked={on}
                onClick={() => set('tipo', t.id)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  textAlign: 'left',
                  minHeight: 60,
                  px: 1.5,
                  borderRadius: 2,
                  border: `${on ? 2 : 1}px solid ${on ? palette.brand[600] : palette.gray[300]}`,
                  bgcolor: on ? tones.brand.bg : 'background.paper',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t.nome}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {t.desc}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>

        <TextField
          label="Descrição"
          value={f.descricao}
          onChange={(e) => set('descricao', e.target.value)}
          required
          fullWidth
          slotProps={{ htmlInput: { maxLength: 120 } }}
        />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <FormControl fullWidth>
            <InputLabel id="conta-categoria">Categoria</InputLabel>
            <Select
              labelId="conta-categoria"
              label="Categoria"
              value={f.categoriaId}
              onChange={(e) => set('categoriaId', String(e.target.value))}
            >
              <MenuItem value="">
                <em>Sem categoria</em>
              </MenuItem>
              {ctx.categorias.map((c) => (
                <MenuItem key={c.codigo} value={c.codigo}>
                  {c.descricao}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="conta-pessoa">Pessoa</InputLabel>
            <Select
              labelId="conta-pessoa"
              label="Pessoa"
              value={f.pessoaId}
              onChange={(e) => set('pessoaId', String(e.target.value))}
            >
              {ctx.pessoas.map((p) => (
                <MenuItem key={p.id} value={String(p.id)}>
                  {p.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
          <TextField
            label={f.tipo === 'PARCELADA' ? 'Valor da parcela' : 'Valor'}
            value={f.valor}
            onChange={(e) => set('valor', maskCurrencyInput(e.target.value.replace('-', '')))}
            slotProps={{
              input: { startAdornment: <InputAdornment position="start">R$</InputAdornment> },
              htmlInput: { inputMode: 'decimal' },
            }}
            required
          />
          <TextField
            label="Dia do vencimento"
            type="number"
            value={f.dia}
            onChange={(e) => set('dia', e.target.value)}
            slotProps={{ htmlInput: { min: 1, max: 31 } }}
            required
          />
          <TextField
            label={f.tipo === 'UNICA' ? 'Mês' : 'Primeiro mês'}
            type="month"
            value={f.inicio}
            onChange={(e) => set('inicio', e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            required
            sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}
          />
        </Box>

        {f.tipo === 'PARCELADA' && (
          <>
            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}
            >
              <TextField
                label="Parcela no primeiro mês"
                type="number"
                value={f.parcelaAtual}
                onChange={(e) => set('parcelaAtual', e.target.value)}
                slotProps={{ htmlInput: { min: 1 } }}
              />
              <TextField
                label="Total de parcelas"
                type="number"
                value={f.totalParcelas}
                onChange={(e) => set('totalParcelas', e.target.value)}
                slotProps={{ htmlInput: { min: 1 } }}
                required
              />
              <TextField
                label="Juros a.m. (opcional)"
                value={f.juros}
                placeholder="ex.: 1,49"
                onChange={(e) => set('juros', e.target.value.replace(/[^\d,]/g, ''))}
                slotProps={{
                  input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
                  htmlInput: { inputMode: 'decimal' },
                }}
                sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: -1 }}>
              Financiamento já em andamento? Informe a parcela deste primeiro mês (ex.: 24 de 48). Os juros permitem
              calcular quanto você economiza antecipando parcelas.
            </Typography>
          </>
        )}

        {f.tipo === 'RECORRENTE' && (
          <TextField
            label="Último mês (opcional)"
            type="month"
            value={f.fim}
            onChange={(e) => set('fim', e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            helperText="Deixe vazio se não tem data para acabar."
          />
        )}

        <Box>
          <FormControlLabel
            control={<Switch checked={f.valorVariavel} onChange={(e) => set('valorVariavel', e.target.checked)} />}
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Valor varia todo mês
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Água, luz e gás: o valor vira estimativa e você confirma quando a conta chegar
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', m: 0, gap: 1, '& .MuiSwitch-root': { mt: -0.5 } }}
          />
          <FormControlLabel
            control={
              <Switch checked={f.debitoAutomatico} onChange={(e) => set('debitoAutomatico', e.target.checked)} />
            }
            label={
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Débito automático
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Marca como paga sozinha na data do vencimento
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', m: 0, mt: 1.5, gap: 1, '& .MuiSwitch-root': { mt: -0.5 } }}
          />
        </Box>

        {resumo && (
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              p: 1.75,
              borderRadius: 2,
              bgcolor: palette.gray[50],
              border: `1px solid ${palette.gray[200]}`,
            }}
          >
            <EventRepeatIcon sx={{ color: palette.brand[600], fontSize: 20, mt: 0.25 }} />
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {resumo.titulo}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {resumo.texto}
              </Typography>
            </Box>
          </Box>
        )}

        {conta && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            As mudanças valem a partir de {rotuloMesLongo(idxDe(ctx.competencia)).toLowerCase()}. Meses já pagos não
            mudam.
          </Typography>
        )}

        {erro && (
          <Alert severity="error" role="alert">
            {erro}
          </Alert>
        )}
      </Box>
    </Modal>
  );
}
