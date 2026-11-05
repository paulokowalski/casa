import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { usePessoa } from '../../contexts/PessoaContext';
import {
  lerCancelamento,
  montarCancelamento,
  montarReversao,
  nomeComCancelamento,
  nomeSemMarcacao,
  parcelasVencidasAte,
  valorParcelaDe,
} from '../../lib/financas/parcelas';
import type { Simulacao } from '../../lib/financas/analise';
import type { CompraInput, Item, Parcela } from '../../types/financas';
import { formatCurrency, maskCurrencyInput, parseCurrency, toCurrencyInput, todayISO } from '../../utils/format';
import { CancelamentoParcelas } from './CancelamentoParcelas';
import { ImpactoCompra } from './ImpactoCompra';

export type AbaTransacao = 'dados' | 'cancelar';

interface TransacaoModalProps {
  open: boolean;
  /** Parcela da compra em edição; `null` para cadastrar */
  parcela: Parcela | null;
  abaInicial?: AbaTransacao;
  categorias: Item[];
  tiposLancamento: Item[];
  /** Grava a compra: POST sem `id`, PUT com `id`. Deve lançar Error com a mensagem em caso de falha. */
  onSalvar: (dados: CompraInput, id?: string) => Promise<void>;
  /** Simulação de impacto de uma nova compra (opcional) */
  simular?: (valor: number, numeroParcelas: number, dataCompra: string) => Simulacao | null;
  onClose: () => void;
  onSucesso: (mensagem: string) => void;
}

const PARCELAS = Array.from({ length: 48 }, (_, i) => i + 1);

/** Acha o código do item pelo código ou pela descrição (a API devolve só o nome do cartão/categoria). */
function resolverId(valor: string | undefined, itens: Item[]): string {
  if (!valor) return '';
  const alvo = valor.toUpperCase();
  return itens.find((i) => i.codigo === valor || i.descricao?.toUpperCase() === alvo)?.codigo ?? '';
}

/** Cadastro/edição de transação, com simulação de impacto e cancelamento de parcelas. */
export function TransacaoModal({
  open,
  parcela,
  abaInicial = 'dados',
  categorias,
  tiposLancamento,
  onSalvar,
  simular,
  onClose,
  onSucesso,
}: Readonly<TransacaoModalProps>) {
  const { pessoas } = usePessoa();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const edicao = Boolean(parcela);
  const cancelamento = parcela ? lerCancelamento(parcela.nomeCompra) : null;
  const podeCancelar = Boolean(parcela && (parcela.numeroTotalParcela > 1 || cancelamento));

  const [aba, setAba] = useState<AbaTransacao>('dados');
  const [produto, setProduto] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(todayISO());
  const [numParcelas, setNumParcelas] = useState(1);
  const [pessoasSel, setPessoasSel] = useState<string[]>([]);
  const [tipoId, setTipoId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const totalOriginal = cancelamento ? cancelamento.totalOriginal : (parcela?.numeroTotalParcela ?? 1);
  const valorParcela = parcela ? valorParcelaDe(parcela.valorTotal, parcela.numeroTotalParcela) : 0;
  const [pagas, setPagas] = useState(1);
  const [comEstorno, setComEstorno] = useState(false);
  const [valorEstorno, setValorEstorno] = useState('');
  const [dataEstorno, setDataEstorno] = useState(todayISO());

  // Preenche o formulário ao abrir
  useEffect(() => {
    if (!open) return;
    setErro(null);
    setSalvando(false);
    setComEstorno(false);
    setValorEstorno('');
    setDataEstorno(todayISO());
    if (parcela) {
      const info = lerCancelamento(parcela.nomeCompra);
      const total = info ? info.totalOriginal : parcela.numeroTotalParcela;
      const hoje = new Date();
      const sugerido = info
        ? info.pagas
        : parcelasVencidasAte(parcela.dataCompra, total, hoje.getFullYear() * 12 + hoje.getMonth());
      const pessoa = pessoas.find((p) => p.nome.toUpperCase() === parcela.nomePessoa.toUpperCase());

      setAba(abaInicial === 'cancelar' && (parcela.numeroTotalParcela > 1 || info) ? 'cancelar' : 'dados');
      setProduto(nomeSemMarcacao(parcela.nomeCompra));
      setValor(toCurrencyInput(Number(parcela.valorTotal) || 0));
      setData(parcela.dataCompra || todayISO());
      setNumParcelas(parcela.numeroTotalParcela || 1);
      setPessoasSel([pessoa ? pessoa.nome : parcela.nomePessoa]);
      setTipoId(resolverId(parcela.nomeCartao, tiposLancamento));
      setCategoriaId(resolverId(parcela.categoria, categorias));
      setPagas(Math.max(1, Math.min(total - 1, sugerido || 1)));
    } else {
      setAba('dados');
      setProduto('');
      setValor('');
      setData(todayISO());
      setNumParcelas(1);
      setPessoasSel([]);
      setTipoId('');
      setCategoriaId('');
    }
    // pessoas/categorias/tipos podem chegar depois; o formulário só é preenchido ao abrir
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, parcela, abaInicial]);

  const valorNum = parseCurrency(valor);
  const valorEstornoNum = Math.abs(parseCurrency(valorEstorno));
  const removidas = totalOriginal - pagas;

  const simulacao = useMemo(
    () => (edicao || !simular || valorNum <= 0 ? null : simular(valorNum, numParcelas, data)),
    [edicao, simular, valorNum, numParcelas, data],
  );

  async function executar(acao: () => Promise<void>, mensagem: string) {
    setErro(null);
    setSalvando(true);
    try {
      await acao();
      onSucesso(mensagem);
      onClose();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível concluir a operação.');
    } finally {
      setSalvando(false);
    }
  }

  function salvarDados() {
    if (!produto.trim()) return setErro('Informe o produto.');
    if (!valorNum) return setErro('Informe o valor da compra.');
    if (!tipoId) return setErro('Selecione o tipo de lançamento (cartão).');
    if (pessoasSel.length === 0) return setErro('Selecione ao menos uma pessoa.');
    const nome = cancelamento
      ? nomeComCancelamento(produto.trim().toUpperCase(), cancelamento.pagas, cancelamento.totalOriginal)
      : produto.trim();
    void executar(
      () =>
        onSalvar(
          {
            nomeProduto: nome,
            valorProduto: valorNum,
            dataCompra: data,
            numeroParcelas: numParcelas,
            nomePessoaCompra: pessoasSel.join(','),
            tipoLancamentoId: tipoId,
            categoriaId: categoriaId || null,
          },
          parcela?.id,
        ),
      edicao ? 'Transação atualizada.' : 'Transação cadastrada.',
    );
  }

  function confirmarCancelamento() {
    if (!parcela) return;
    if (!tipoId) return setErro('Não foi possível identificar o cartão desta compra. Ajuste na aba "Dados da compra".');
    if (comEstorno && valorEstornoNum <= 0) return setErro('Informe o valor do estorno.');
    void executar(
      async () => {
        if (!cancelamento || cancelamento.pagas !== pagas) {
          await onSalvar(montarCancelamento(parcela, pagas, tipoId, categoriaId || null), parcela.id);
        }
        if (comEstorno) {
          await onSalvar({
            nomeProduto: `ESTORNO ${nomeSemMarcacao(parcela.nomeCompra)}`,
            valorProduto: -valorEstornoNum,
            dataCompra: dataEstorno,
            numeroParcelas: 1,
            nomePessoaCompra: parcela.nomePessoa,
            tipoLancamentoId: tipoId,
            categoriaId: categoriaId || null,
          });
        }
      },
      `Cancelamento registrado: ${removidas} parcela${removidas === 1 ? '' : 's'} removida${removidas === 1 ? '' : 's'}${comEstorno ? ' e estorno lançado' : ''}.`,
    );
  }

  function reverter() {
    if (!parcela) return;
    const dados = montarReversao(parcela, tipoId, categoriaId || null);
    if (!dados) return;
    void executar(() => onSalvar(dados, parcela.id), 'Cancelamento revertido: parcelas restauradas.');
  }

  const larga = Boolean((!edicao && simulacao) || aba === 'cancelar');

  return (
    <Dialog
      open={open}
      onClose={salvando ? undefined : onClose}
      fullWidth
      fullScreen={fullScreen}
      maxWidth={larga ? 'md' : 'sm'}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2,
          pb: podeCancelar ? 0 : 2,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          {edicao ? 'Editar transação' : 'Nova transação'}
          {parcela && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 400 }}>
              {nomeSemMarcacao(parcela.nomeCompra)} · {formatCurrency(parcela.valorTotal)} em{' '}
              {parcela.numeroTotalParcela}x de {formatCurrency(valorParcela)} · {parcela.nomeCartao}
            </Typography>
          )}
        </Box>
        <IconButton aria-label="Fechar" onClick={onClose} disabled={salvando} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {podeCancelar && (
        <Tabs
          value={aba}
          onChange={(_e, v: AbaTransacao) => {
            setAba(v);
            setErro(null);
          }}
          sx={{ px: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab value="dados" label="Dados da compra" />
          <Tab
            value="cancelar"
            label={cancelamento ? 'Cancelamento' : 'Cancelar parcelas'}
            sx={{ color: 'error.main', '&.Mui-selected': { color: 'error.main' } }}
          />
        </Tabs>
      )}

      <DialogContent dividers={!podeCancelar} sx={{ p: 0 }}>
        {erro && (
          <Alert severity="error" sx={{ m: 2, mb: 0 }} onClose={() => setErro(null)}>
            {erro}
          </Alert>
        )}

        {aba === 'dados' && (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: simulacao ? 'minmax(0, 1.25fr) minmax(0, 1fr)' : '1fr' },
            }}
          >
            <Box
              sx={{
                p: 3,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
                alignContent: 'start',
              }}
            >
              {cancelamento && (
                <Alert severity="warning" icon={<InfoOutlinedIcon />} sx={{ gridColumn: '1 / -1' }}>
                  Compra cancelada ({cancelamento.pagas} de {cancelamento.totalOriginal} pagas). Para mudar parcelas,
                  use a aba “Cancelamento”.
                </Alert>
              )}
              <TextField
                label="Produto"
                value={produto}
                onChange={(e) => setProduto(e.target.value)}
                fullWidth
                sx={{ gridColumn: '1 / -1' }}
                autoFocus={!edicao}
              />
              <TextField
                label="Valor da compra"
                value={valor}
                onChange={(e) => setValor(maskCurrencyInput(e.target.value))}
                fullWidth
                helperText="Use “-” na frente para estornos/créditos"
                inputProps={{ inputMode: 'decimal' }}
              />
              <TextField
                label="Data da compra"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                select
                label="Parcelas"
                value={numParcelas}
                onChange={(e) => setNumParcelas(Number(e.target.value))}
                fullWidth
                disabled={Boolean(cancelamento)}
              >
                {PARCELAS.map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}x{valorNum > 0 && n > 1 ? ` de ${formatCurrency(valorParcelaDe(valorNum, n))}` : ''}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Tipo de lançamento (cartão)"
                value={tipoId}
                onChange={(e) => setTipoId(e.target.value)}
                fullWidth
              >
                {tiposLancamento.map((t) => (
                  <MenuItem key={t.codigo} value={t.codigo}>
                    {t.descricao.toUpperCase()}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Categoria"
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                fullWidth
              >
                <MenuItem value="">Sem categoria</MenuItem>
                {categorias.map((c) => (
                  <MenuItem key={c.codigo} value={c.codigo}>
                    {c.descricao}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label={edicao ? 'Pessoa' : 'Pessoa(s)'}
                value={edicao ? (pessoasSel[0] ?? '') : pessoasSel}
                onChange={(e) => {
                  const v = e.target.value as unknown as string | string[];
                  if (edicao) setPessoasSel(v ? [String(v)] : []);
                  else setPessoasSel(typeof v === 'string' ? v.split(',').filter(Boolean) : v);
                }}
                fullWidth
                SelectProps={{ multiple: !edicao, renderValue: (s) => (Array.isArray(s) ? s.join(', ') : String(s)) }}
                helperText={
                  !edicao && pessoasSel.length > 1
                    ? `O valor será dividido igualmente entre ${pessoasSel.length} pessoas`
                    : ' '
                }
              >
                {pessoas.map((p) => (
                  <MenuItem key={p.id} value={p.nome}>
                    {p.nome.toUpperCase()}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            {simulacao && <ImpactoCompra simulacao={simulacao} numeroParcelas={numParcelas} />}
          </Box>
        )}

        {aba === 'cancelar' && parcela && (
          <CancelamentoParcelas
            dataCompra={parcela.dataCompra}
            valorParcela={valorParcela}
            totalOriginal={totalOriginal}
            pagas={pagas}
            setPagas={setPagas}
            comEstorno={comEstorno}
            setComEstorno={setComEstorno}
            valorEstorno={valorEstorno}
            setValorEstorno={setValorEstorno}
            valorEstornoNum={valorEstornoNum}
            dataEstorno={dataEstorno}
            setDataEstorno={setDataEstorno}
          />
        )}
      </DialogContent>

      <DialogActions
        sx={{ justifyContent: aba === 'cancelar' && cancelamento ? 'space-between' : 'flex-end', flexWrap: 'wrap' }}
      >
        {aba === 'cancelar' && cancelamento && (
          <Button onClick={reverter} disabled={salvando} color="inherit">
            Reverter cancelamento ({cancelamento.totalOriginal}x)
          </Button>
        )}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" onClick={onClose} disabled={salvando}>
            Fechar
          </Button>
          {aba === 'dados' ? (
            <Button
              variant="contained"
              onClick={salvarDados}
              disabled={salvando}
              startIcon={salvando ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {edicao ? 'Salvar alterações' : 'Cadastrar'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              onClick={confirmarCancelamento}
              disabled={salvando || (Boolean(cancelamento) && cancelamento?.pagas === pagas && !comEstorno)}
              startIcon={salvando ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              {cancelamento && cancelamento.pagas === pagas
                ? 'Lançar estorno'
                : `Cancelar ${removidas} parcela${removidas === 1 ? '' : 's'}`}
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
}
