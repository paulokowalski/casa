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
import { colors } from '../../../styles/colors';

interface ExclusaoModalProps {
  open: boolean;
  onClose: () => void;
  excluindo?: DadosEnergia | null;
  onConfirmar: () => void;
}

export function ExclusaoModal({ open, onClose, excluindo, onConfirmar }: ExclusaoModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Confirmar Exclusão
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body1" sx={{ color: colors.text.primary, mb: 2 }}>
            Tem certeza que deseja excluir os dados de energia do dia{' '}
            <strong>
              {excluindo ? new Date(excluindo.data).toLocaleDateString('pt-BR') : ''}
            </strong>?
          </Typography>
          <Typography variant="body2" sx={{ color: colors.text.secondary }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={onConfirmar}
          variant="contained"
          color="error"
        >
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
}
