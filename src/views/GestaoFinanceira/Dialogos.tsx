import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Modal } from '../../components/ui/Modal';
import { rotuloMesLongo, mesIdx } from '../../lib/financas/parcelas';
import type { Lancamento } from '../../types/contas';
import { formatCurrency, maskCurrencyInput, parseCurrency, toCurrencyInput } from '../../utils/format';

interface ValorDialogProps {
  lancamento: Lancamento | null;
  onConfirmar: (valor: number, paga: boolean) => Promise<void>;
  onClose: () => void;
}

/** Informar o valor real de uma conta de valor variável (água, luz…) */
export function ValorDialog({ lancamento, onConfirmar, onClose }: Readonly<ValorDialogProps>) {
  const [texto, setTexto] = useState('');
  const [paga, setPaga] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!lancamento) return;
    setTexto(toCurrencyInput(lancamento.valor));
    setPaga(false);
    setErro(null);
  }, [lancamento]);

  async function confirmar() {
    const valor = parseCurrency(texto);
    if (!(valor > 0)) return setErro('Informe o valor da conta.');
    setSalvando(true);
    try {
      await onConfirmar(valor, paga);
      onClose();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      open={Boolean(lancamento)}
      onClose={salvando ? () => undefined : onClose}
      title={`Valor de ${lancamento?.descricao ?? ''}`}
      maxWidth="xs"
      actions={
        <>
          <Button variant="outlined" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={confirmar}
            disabled={salvando}
            startIcon={salvando ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Confirmar valor
          </Button>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          A estimativa era {formatCurrency(lancamento?.valor ?? 0)}. Os próximos meses passam a usar o valor informado
          como estimativa.
        </Typography>
        <TextField
          label="Valor da conta"
          value={texto}
          onChange={(e) => setTexto(maskCurrencyInput(e.target.value.replace('-', '')))}
          InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
          inputProps={{ inputMode: 'decimal' }}
          autoFocus
        />
        <FormControlLabel
          control={<Switch checked={paga} onChange={(e) => setPaga(e.target.checked)} />}
          label="Já está paga"
        />
        {erro && <Alert severity="error">{erro}</Alert>}
      </Box>
    </Modal>
  );
}

interface ExcluirContaDialogProps {
  conta: { id: string; descricao: string } | null;
  competencia: string;
  onExcluir: (id: string, encerrar: boolean) => Promise<void>;
  onClose: () => void;
  onSucesso: (mensagem: string) => void;
}

/** Encerrar a conta a partir do mês (mantém o histórico) ou apagar tudo */
export function ExcluirContaDialog({
  conta,
  competencia,
  onExcluir,
  onClose,
  onSucesso,
}: Readonly<ExcluirContaDialogProps>) {
  const [modo, setModo] = useState<'encerrar' | 'apagar'>('encerrar');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const mes = rotuloMesLongo(
    mesIdx({ ano: Number(competencia.slice(0, 4)), mes: Number(competencia.slice(5, 7)) }),
  ).toLowerCase();

  useEffect(() => {
    if (conta) {
      setModo('encerrar');
      setErro(null);
    }
  }, [conta]);

  async function confirmar() {
    if (!conta) return;
    setSalvando(true);
    try {
      await onExcluir(conta.id, modo === 'encerrar');
      onSucesso(modo === 'encerrar' ? 'Conta encerrada.' : 'Conta excluída.');
      onClose();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao excluir.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      open={Boolean(conta)}
      onClose={salvando ? () => undefined : onClose}
      title={`Excluir ${conta?.descricao ?? ''}`}
      maxWidth="xs"
      actions={
        <>
          <Button variant="outlined" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmar}
            disabled={salvando}
            startIcon={salvando ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {modo === 'encerrar' ? 'Encerrar conta' : 'Apagar tudo'}
          </Button>
        </>
      }
    >
      <RadioGroup value={modo} onChange={(e) => setModo(e.target.value as 'encerrar' | 'apagar')} sx={{ gap: 1.5 }}>
        <FormControlLabel
          value="encerrar"
          control={<Radio />}
          sx={{ alignItems: 'flex-start', '& .MuiRadio-root': { mt: -0.75 } }}
          label={
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Encerrar a partir de {mes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Some deste mês em diante. Os meses anteriores continuam no histórico.
              </Typography>
            </Box>
          }
        />
        <FormControlLabel
          value="apagar"
          control={<Radio />}
          sx={{ alignItems: 'flex-start', '& .MuiRadio-root': { mt: -0.75 } }}
          label={
            <Box>
              <Typography variant="body2" fontWeight={600}>
                Apagar a conta e todo o histórico
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use se ela foi cadastrada por engano. Não pode ser desfeito.
              </Typography>
            </Box>
          }
        />
      </RadioGroup>
      {erro && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {erro}
        </Alert>
      )}
    </Modal>
  );
}
