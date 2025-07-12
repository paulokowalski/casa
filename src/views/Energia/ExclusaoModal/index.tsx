import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { DadosEnergia } from '../../../contexts/EnergiaContext';

interface ExclusaoModalProps {
  open: boolean;
  onClose: () => void;
  excluindo?: DadosEnergia | null;
  onConfirmar: () => void;
}

export function ExclusaoModal({ open, onClose, excluindo, onConfirmar }: ExclusaoModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: '#f5f6fa', background: '#23263a' }}>
        Confirmar Exclusão
      </DialogTitle>
      <DialogContent sx={{ background: '#23263a', pt: 2 }}>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" sx={{ color: '#f5f6fa', mb: 2 }}>
            Tem certeza que deseja excluir os dados de energia do dia{' '}
            <strong>
              {excluindo ? new Date(excluindo.data).toLocaleDateString('pt-BR') : ''}
            </strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: '#a0aec0' }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ background: '#23263a', p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#f5f6fa' }}>
          Cancelar
        </Button>
        <Button
          onClick={onConfirmar}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            },
          }}
        >
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
} 