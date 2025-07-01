import { useState, useEffect } from 'react';
import { Button, TextField, MenuItem, FormControlLabel, Checkbox, DialogTitle, DialogContent } from '@mui/material';
import { useFinanca, TipoTransacao, Transacao as TransacaoBase } from '../../../contexts/FinancaContext';
import { atualizarTransacaoSerie } from '../../../services/api';
import { Dialog as MuiDialog } from '@mui/material';
import { Typography } from '@mui/material';
import { Modal } from '../../../components/ui/Modal';
import { formatCurrency, formatCurrencyInput, parseCurrency, toISODate, toBRDate } from '../../../functions/global';

type Transacao = TransacaoBase & { idSerie?: string };

interface CadastroModalProps {
  open: boolean;
  onClose: () => void;
  transacao?: Transacao | null;
  onSuccess?: () => void;
}

export function CadastroModal({ open, onClose, transacao, onSuccess }: CadastroModalProps) {
  const { adicionar, editar, pessoa, setPessoa, ano, mes, pessoas } = useFinanca();
  const [tipo, setTipo] = useState<TipoTransacao>('despesa');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [fixa, setFixa] = useState(false);
  const [modalSerie, setModalSerie] = useState(false);
  const [payloadTemp, setPayloadTemp] = useState<Omit<Transacao, 'id'> | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (transacao) {
      setTipo(transacao.tipo);
      setDescricao(transacao.descricao);
      setValor(formatCurrency(Number(transacao.valor)));
      setData(toISODate(transacao.data) || '');
      setFixa(transacao.fixa);
    } else {
      setTipo('despesa');
      setDescricao('');
      setValor('');
      setData('');
      setFixa(false);
    }
  }, [transacao, open]);

  // Handler para input de valor
  function handleValorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // Permite colar valores já formatados ou só números
    setValor(formatCurrencyInput(raw));
  }

  // Handler para colar valor
  function handleValorPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('Text');
    setValor(formatCurrencyInput(pasted));
    e.preventDefault();
  }

  async function handleSubmit() {
    setErro(null);
    try {
      const payload = {
        tipo,
        descricao,
        valor: parseCurrency(valor),
        data: toISODate(data),
        fixa,
        pessoa,
        ano,
        mes,
        paga: false,
      };
      if (transacao && transacao.fixa && transacao.idSerie) {
        setPayloadTemp(payload);
        setModalSerie(true);
      } else if (transacao) {
        await editar(transacao.id, payload);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        await adicionar(payload);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (e: any) {
      setErro('Erro ao salvar a transação. Tente novamente.');
    }
  }

  function handleEditarUnico() {
    if (transacao && payloadTemp) {
      editar(transacao.id, payloadTemp);
      if (onSuccess) onSuccess();
      setModalSerie(false);
      setPayloadTemp(null);
      onClose();
    }
  }

  async function handleEditarSerie() {
    if (transacao && transacao.idSerie && payloadTemp) {
      await atualizarTransacaoSerie(transacao.idSerie, payloadTemp, data);
      if (onSuccess) onSuccess();
      setModalSerie(false);
      setPayloadTemp(null);
      onClose();
    }
  }

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`${transacao ? 'Editar' : 'Cadastrar'} ${tipo === 'despesa' ? 'Despesa' : 'Receita'}`}
        maxWidth="sm"
        actions={
          <>
            <Button onClick={onClose}>Cancelar</Button>
            <Button onClick={handleSubmit} variant="contained">Salvar</Button>
          </>
        }
      >
        {erro && (
          <div style={{ color: 'red', marginBottom: 8 }}>{erro}</div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
          <TextField
            select
            label="Tipo"
            value={tipo}
            onChange={e => setTipo(e.target.value as TipoTransacao)}
            fullWidth
          >
            <MenuItem value="despesa">Despesa</MenuItem>
            <MenuItem value="receita">Receita</MenuItem>
            <MenuItem value="investimento">Investimento</MenuItem>
          </TextField>
          <TextField
            label="Descrição"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            fullWidth
          />
          <TextField
            label="Valor"
            value={valor}
            onChange={handleValorChange}
            onPaste={handleValorPaste}
            fullWidth
            inputProps={{ inputMode: 'numeric', pattern: '[0-9,.]*' }}
          />
          <TextField
            label="Data"
            value={data}
            onChange={e => setData(e.target.value)}
            fullWidth
            type="date"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            select
            label="Pessoa"
            value={pessoa}
            onChange={e => setPessoa(e.target.value)}
            fullWidth
            required
          >
            {pessoas.map((p) => (
              <MenuItem key={p.id} value={String(p.id)}>
                {p.nome}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={<Checkbox checked={fixa} onChange={e => setFixa(e.target.checked)} />}
            label="Despesa/Receita fixa?"
          />
        </div>
      </Modal>
      {/* Modal de confirmação para editar série */}
      <MuiDialog open={modalSerie} onClose={() => setModalSerie(false)}>
        <DialogTitle>Editar transação fixa</DialogTitle>
        <DialogContent>
          <Typography>Esta transação faz parte de uma série fixa. O que deseja fazer?</Typography>
          <Button onClick={handleEditarUnico} variant="contained" sx={{ mt: 2, mr: 2 }}>Editar apenas este registro</Button>
          <Button onClick={handleEditarSerie} variant="outlined" sx={{ mt: 2 }}>Editar este e os próximos da série</Button>
        </DialogContent>
      </MuiDialog>
    </>
  );
} 