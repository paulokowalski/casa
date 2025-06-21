import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Box, Button, Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import CadastroModal from './CadastroModal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { red } from '@mui/material/colors';

interface Pessoa {
  id: number;
  nome: string;
  email: string;
}

// Função para buscar pessoas (find)
async function findPessoa(): Promise<Pessoa[]> {
  const { data } = await api.get<Pessoa[]>('/v1/pessoas');
  return data;
}

const PessoaView: React.FC = () => {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editPessoa, setEditPessoa] = useState<Pessoa | null>(null);
  const [deletePessoa, setDeletePessoa] = useState<Pessoa | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const carregarPessoas = async () => {
    const pessoas = await findPessoa();
    setPessoas(pessoas);
  };

  useEffect(() => {
    carregarPessoas();
  }, []);

  // Editar pessoa
  const handleEdit = (pessoa: Pessoa) => {
    setEditPessoa(pessoa);
    setEditNome(pessoa.nome);
    setEditEmail(pessoa.email);
  };

  const handleEditSave = async () => {
    if (!editPessoa) return;
    setLoading(true);
    try {
      await api.put(`/v1/pessoas/${editPessoa.id}`, { nome: editNome, email: editEmail });
      setEditPessoa(null);
      await carregarPessoas();
    } finally {
      setLoading(false);
    }
  };

  // Excluir pessoa
  const handleDelete = (pessoa: Pessoa) => {
    setDeletePessoa(pessoa);
  };

  const handleDeleteConfirm = async () => {
    if (!deletePessoa) return;
    setLoading(true);
    try {
      await api.delete(`/v1/pessoas/${deletePessoa.id}`);
      setDeletePessoa(null);
      await carregarPessoas();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={2}>
        <Typography variant="h4">Pessoas</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
          Nova Pessoa
        </Button>
      </Box>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pessoas.map((pessoa) => (
              <TableRow key={pessoa.id}>
                <TableCell>{pessoa.id}</TableCell>
                <TableCell>{pessoa.nome}</TableCell>
                <TableCell>{pessoa.email}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" onClick={() => handleEdit(pessoa)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(pessoa)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <CadastroModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={carregarPessoas}
      />
      {/* Modal de edição */}
      <Dialog open={!!editPessoa} onClose={() => setEditPessoa(null)}>
        <DialogTitle>Editar Pessoa</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            value={editNome}
            onChange={e => setEditNome(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Email"
            value={editEmail}
            onChange={e => setEditEmail(e.target.value)}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditPessoa(null)} color="secondary">Cancelar</Button>
          <Button onClick={handleEditSave} color="primary" variant="contained" disabled={loading}>
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Modal de confirmação de exclusão */}
      <Dialog 
        open={!!deletePessoa} 
        onClose={() => setDeletePessoa(null)}
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 8px 40px rgba(255,0,0,0.18)',
            background: 'linear-gradient(135deg, #fff 80%, #ffeaea 100%)',
            minWidth: 380,
            maxWidth: '90vw',
            p: 0,
          }
        }}
        >
        <DialogTitle sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: red[700], fontWeight: 700, pt: 4, pb: 1 }}>
          <WarningAmberIcon sx={{ color: red[700], fontSize: 48, mb: 1 }} />
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent sx={{ pb: 2, pt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ color: red[700], fontWeight: 500, mb: 2, textAlign: 'center' }}>
            Tem certeza que deseja excluir a pessoa <b>"{deletePessoa?.nome}"</b>?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            Esta ação não poderá ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pb: 4, pr: 4, pl: 4, justifyContent: 'center', gap: 2 }}>
          <Button onClick={() => setDeletePessoa(null)} color="secondary" variant="outlined" sx={{ minWidth: 120, borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={loading} sx={{ minWidth: 140, borderRadius: 2, fontWeight: 700, boxShadow: '0 2px 12px rgba(255,0,0,0.12)' }}>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PessoaView; 