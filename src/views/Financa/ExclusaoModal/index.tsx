import { Button, Typography } from '@mui/material';
import { Modal } from '../../../components/ui/Modal';
import { Transacao } from '../../../contexts/FinancaContext';

interface ExclusaoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item?: Transacao | null;
}

export function ExclusaoModal({ open, onClose, onConfirm, item }: ExclusaoModalProps) {
  // Função para formatar a data para dd/MM/yyyy
  function formatarData(data?: string) {
    if (!data) return '';
    const dataStr = String(data);
    const match = dataStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${match[3]}/${match[2]}/${match[1]}`;
    }
    // Se vier em formato timestamp
    const timestamp = Number(dataStr);
    if (!isNaN(timestamp) && dataStr.length >= 8) {
      const d = new Date(timestamp);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString('pt-BR');
      }
    }
    // Se vier em outro formato, tenta criar Date
    const d = new Date(dataStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('pt-BR');
    }
    // Se não conseguir, retorna como está
    return dataStr;
  }
  if (!item) return null;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Excluir ${item?.tipo === 'receita' ? 'Receita' : 'Despesa'}`}
      maxWidth="xs"
      actions={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={onConfirm}>Excluir</Button>
        </>
      }
    >
      <Typography>Tem certeza que deseja excluir esta {item?.tipo === 'receita' ? 'receita' : 'despesa'}?</Typography>
      <Typography><strong>Descrição:</strong> {item?.descricao}</Typography>
      <Typography><strong>Valor:</strong> {item?.valor !== undefined && item?.valor !== null ? item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : ''}</Typography>
      <Typography><strong>Data:</strong> {formatarData(item?.data)}</Typography>
    </Modal>
  );
} 