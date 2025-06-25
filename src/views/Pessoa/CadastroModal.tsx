import React, { useState } from 'react';
import { api } from '../../services/api';
import { API_URLS } from '../../config/urls';
import { Box, Button, Modal, TextField, Typography } from '@mui/material';

interface CadastroModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const CadastroModal: React.FC<CadastroModalProps> = ({ open, onClose, onSuccess }) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post(API_URLS.PESSOAS, { nome, email });
      setNome('');
      setEmail('');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Erro ao cadastrar pessoa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="modal-cadastro-pessoa">
      <Box sx={style} component="form" onSubmit={handleSubmit}>
        <Typography id="modal-cadastro-pessoa" variant="h6" component="h2" gutterBottom>
          Cadastrar Pessoa
        </Typography>
        <TextField
          label="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        {error && <Typography color="error">{error}</Typography>}
        <Box mt={2} display="flex" justifyContent="flex-end">
          <Button onClick={onClose} color="secondary" disabled={loading} sx={{ mr: 1 }}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default CadastroModal; 