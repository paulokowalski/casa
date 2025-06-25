import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Typography, Paper, IconButton, TextField } from '@mui/material';
import { Table } from '../../components/ui/Table';
import { Modal } from '../../components/ui/Modal';
import CadastroModal from './CadastroModal';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { usePessoa } from '../../contexts/PessoaContext';
import { LoadingOverlay } from '../../components/ui/LoadingOverlay';
import { Card } from '../../components/Card';

interface Pessoa {
  id: number;
  nome: string;
  email: string;
  acoes?: never;
}

const PessoaView: React.FC = () => {
  const { pessoas, carregarPessoas, loading, editarPessoa, excluirPessoa } = usePessoa();
  const [openModal, setOpenModal] = useState(false);
  const [editPessoa, setEditPessoa] = useState<Pessoa | null>(null);
  const [deletePessoa, setDeletePessoa] = useState<Pessoa | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editLoading, setEditLoading] = useState(false);

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
    setEditLoading(true);
    try {
      await editarPessoa(editPessoa.id, editNome, editEmail);
      setEditPessoa(null);
    } finally {
      setEditLoading(false);
    }
  };

  // Excluir pessoa
  const handleDelete = (pessoa: Pessoa) => {
    setDeletePessoa(pessoa);
  };

  const handleDeleteConfirm = async () => {
    if (!deletePessoa) return;
    setEditLoading(true);
    try {
      await excluirPessoa(deletePessoa.id);
      setDeletePessoa(null);
    } finally {
      setEditLoading(false);
    }
  };

  const columns = [
    { id: 'id', label: 'ID' },
    { id: 'nome', label: 'Nome' },
    { id: 'email', label: 'Email' },
    {
      id: 'acoes',
      label: 'Ações',
      align: 'right' as const,
      render: (_: Pessoa['acoes'], row: Pessoa) => (
        <>
          <IconButton color="primary" onClick={() => handleEdit(row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(row)}>
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Container maxWidth="md">
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={4} mb={2}>
        <Typography variant="h4">Pessoas</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpenModal(true)}>
          Nova Pessoa
        </Button>
      </Box>
      <Card title="Lista de Pessoas">
        <LoadingOverlay loading={loading} text="Carregando...">
          <Table<Pessoa>
            columns={columns}
            data={pessoas}
            emptyMessage="Nenhuma pessoa cadastrada."
            rowsPerPageOptions={[5, 10, 25]}
            defaultRowsPerPage={10}
          />
        </LoadingOverlay>
      </Card>
      <CadastroModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={carregarPessoas}
      />
      {/* Modal de edição */}
      <Modal
        open={!!editPessoa}
        onClose={() => setEditPessoa(null)}
        title="Editar Pessoa"
        maxWidth="xs"
        actions={
          <>
            <Button onClick={() => setEditPessoa(null)} color="secondary">Cancelar</Button>
            <Button onClick={handleEditSave} color="primary" variant="contained" disabled={loading}>
              Salvar
            </Button>
          </>
        }
      >
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
      </Modal>
      {/* Modal de confirmação de exclusão */}
      <Modal
        open={!!deletePessoa}
        onClose={() => setDeletePessoa(null)}
        title="Confirmar Exclusão"
        maxWidth="xs"
        actions={
          <>
            <Button onClick={() => setDeletePessoa(null)} color="secondary" variant="outlined">
              Cancelar
            </Button>
            <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={loading}>
              Excluir
            </Button>
          </>
        }
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} mt={2} mb={2}>
          <WarningAmberIcon sx={{ color: 'error.main', fontSize: 48 }} />
          <Typography variant="body1" sx={{ color: 'error.main', fontWeight: 500, textAlign: 'center' }}>
            Tem certeza que deseja excluir a pessoa <b>"{deletePessoa?.nome}"</b>?
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
            Esta ação não poderá ser desfeita.
          </Typography>
        </Box>
      </Modal>
    </Container>
  );
};

export default PessoaView; 