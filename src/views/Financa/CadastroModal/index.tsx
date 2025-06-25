import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, FormControlLabel, Checkbox } from '@mui/material';
import { useFinanca, TipoTransacao, Transacao as TransacaoBase } from '../../../contexts/FinancaContext';
import { atualizarTransacaoSerie } from '../../../services/api';
import { Dialog as MuiDialog } from '@mui/material';
import { Typography } from '@mui/material';

type Transacao = TransacaoBase & { idSerie?: string };

interface CadastroModalProps {
  open: boolean;
  onClose: () => void;
  transacao?: Transacao | null;
}

export function CadastroModal({ open, onClose, transacao }: CadastroModalProps) {
  const { adicionar, editar, pessoa, ano, mes } = useFinanca();
  const [tipo, setTipo] = useState<TipoTransacao>('despesa');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState('');
  const [fixa, setFixa] = useState(false);
  const [modalSerie, setModalSerie] = useState(false);
  const [payloadTemp, setPayloadTemp] = useState<any>(null);

  useEffect(() => {
    if (transacao) {
      setTipo(transacao.tipo);
      setDescricao(transacao.descricao);

      // Valor: garantir sempre formato brasileiro
      let valorNum = Number(transacao.valor);
      if (isNaN(valorNum)) {
        const limpo = String(transacao.valor).replace(/[^\d,\.]/g, '').replace(',', '.');
        valorNum = Number(limpo);
      }
      setValor(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorNum));

      // Data: garantir yyyy-MM-dd
      let dataStr = transacao.data;
      if (dataStr && !/^\d{4}-\d{2}-\d{2}$/.test(dataStr)) {
        const d = new Date(dataStr);
        if (!isNaN(d.getTime())) {
          dataStr = d.toISOString().slice(0, 10);
        }
      }
      setData(dataStr || '');
      setFixa(transacao.fixa);
    } else {
      setTipo('despesa');
      setDescricao('');
      setValor('');
      setData('');
      setFixa(false);
    }
  }, [transacao, open]);

  function formatDateToISO(dateStr: string) {
    if (!dateStr) return '';
    // Se já estiver no formato yyyy-MM-dd, retorna direto
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    // Tenta converter para Date e formatar
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return dateStr;
  }

  // Função para formatar valor como moeda brasileira
  function formatarValorBR(valor: string) {
    if (!valor) return '';
    // Remove tudo que não for número
    const onlyNumbers = valor.replace(/\D/g, '');
    const number = parseFloat(onlyNumbers) / 100;
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // Função para converter valor formatado para número
  function valorBRtoNumber(valor: string) {
    if (!valor) return 0;
    // Remove tudo que não for número ou vírgula
    const clean = valor.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  }

  // Handler para input de valor
  function handleValorChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    // Permite colar valores já formatados ou só números
    setValor(formatarValorBR(raw));
  }

  // Handler para colar valor
  function handleValorPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('Text');
    setValor(formatarValorBR(pasted));
    e.preventDefault();
  }

  function handleSubmit() {
    const payload = {
      tipo,
      descricao,
      valor: valorBRtoNumber(valor),
      data: formatDateToISO(data),
      fixa,
      pessoa,
      ano,
      mes,
    };
    if (transacao && transacao.fixa && transacao.idSerie) {
      setPayloadTemp(payload);
      setModalSerie(true);
    } else if (transacao) {
      editar(transacao.id, payload);
      onClose();
    } else {
      adicionar(payload);
      onClose();
    }
  }

  function handleEditarUnico() {
    if (transacao && payloadTemp) {
      editar(transacao.id, payloadTemp);
      setModalSerie(false);
      setPayloadTemp(null);
      onClose();
    }
  }

  async function handleEditarSerie() {
    if (transacao && transacao.idSerie && payloadTemp) {
      await atualizarTransacaoSerie(transacao.idSerie, payloadTemp, data);
      setModalSerie(false);
      setPayloadTemp(null);
      onClose();
    }
  }

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{transacao ? 'Editar' : 'Cadastrar'} {tipo === 'despesa' ? 'Despesa' : 'Receita'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
          <FormControlLabel
            control={<Checkbox checked={fixa} onChange={e => setFixa(e.target.checked)} />}
            label="Despesa/Receita fixa?"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
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