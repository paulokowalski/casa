import { Button, Typography } from '@mui/material';
import { Modal } from '../../../components/ui/Modal';
import { Transacao } from '../../../contexts/FinancaContext';
import { toBRDate, formatCurrency } from '../../../functions/global';

interface ExclusaoModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item?: Transacao | null;
}

export function ExclusaoModal({ open, onClose, onConfirm, item }: ExclusaoModalProps) {
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
      <Typography><strong>Valor:</strong> {item?.valor !== undefined && item?.valor !== null ? formatCurrency(item.valor) : ''}</Typography>
      <Typography><strong>Data:</strong> {toBRDate(item?.data)}</Typography>
    </Modal>
  );
} 