import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { useEnergia, DadosEnergia } from '../../../contexts/EnergiaContext';

interface CadastroModalProps {
  open: boolean;
  onClose: () => void;
  editando?: DadosEnergia | null;
  onSuccess: () => void;
}

export function CadastroModal({ open, onClose, editando, onSuccess }: CadastroModalProps) {
  const { adicionar, editar } = useEnergia();
  const [formData, setFormData] = useState({
    data: '',
    horario: '',
    geracao: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (editando) {
      setFormData({
        data: editando.data,
        horario: editando.horario,
        geracao: editando.geracao.toString(),
      });
    } else {
      setFormData({
        data: '',
        horario: '',
        geracao: '',
      });
    }
    setErrors({});
  }, [editando, open]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.data) {
      newErrors.data = 'Data é obrigatória';
    }

    if (!formData.horario) {
      newErrors.horario = 'Horário é obrigatório';
    }

    if (!formData.geracao || isNaN(Number(formData.geracao))) {
      newErrors.geracao = 'Potência deve ser um número válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const hoje = new Date();
    const dadosEnergia: Omit<DadosEnergia, 'id'> = {
      data: formData.data,
      horario: formData.horario,
      geracao: Number(formData.geracao),
      consumo: 0,
      injecao: 0,
      pessoa: '',
      ano: String(hoje.getFullYear()),
      mes: String(hoje.getMonth() + 1).padStart(2, '0'),
    };

    if (editando) {
      editar(editando.id, dadosEnergia);
    } else {
      adicionar(dadosEnergia);
    }

    onSuccess();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: '#f5f6fa', background: '#23263a' }}>
        {editando ? 'Editar Dados de Energia' : 'Cadastrar Dados de Energia'}
      </DialogTitle>
      <DialogContent sx={{ background: '#23263a', pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Data"
            type="date"
            value={formData.data}
            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
            error={!!errors.data}
            helperText={errors.data}
            fullWidth
            sx={{
              '& .MuiInputLabel-root': { color: '#f5f6fa' },
              '& .MuiInputBase-input': { color: '#f5f6fa' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#444857' },
                '&:hover fieldset': { borderColor: '#6366f1' },
                '&.Mui-focused fieldset': { borderColor: '#6366f1' },
              },
            }}
          />
          <TextField
            label="Horário (HH:MM)"
            value={formData.horario}
            onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
            error={!!errors.horario}
            helperText={errors.horario}
            fullWidth
            sx={{
              '& .MuiInputLabel-root': { color: '#f5f6fa' },
              '& .MuiInputBase-input': { color: '#f5f6fa' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#444857' },
                '&:hover fieldset': { borderColor: '#6366f1' },
                '&.Mui-focused fieldset': { borderColor: '#6366f1' },
              },
            }}
          />
          <TextField
            label="Potência (W)"
            type="number"
            value={formData.geracao}
            onChange={(e) => setFormData({ ...formData, geracao: e.target.value })}
            error={!!errors.geracao}
            helperText={errors.geracao}
            fullWidth
            sx={{
              '& .MuiInputLabel-root': { color: '#f5f6fa' },
              '& .MuiInputBase-input': { color: '#f5f6fa' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': { borderColor: '#444857' },
                '&:hover fieldset': { borderColor: '#6366f1' },
                '&.Mui-focused fieldset': { borderColor: '#6366f1' },
              },
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ background: '#23263a', p: 2 }}>
        <Button onClick={onClose} sx={{ color: '#f5f6fa' }}>
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
            },
          }}
        >
          {editando ? 'Salvar' : 'Cadastrar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 