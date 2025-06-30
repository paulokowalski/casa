import React, { useEffect, useState } from 'react';
import { Box, Button, Container, Typography, IconButton, TextField } from '@mui/material';
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
      <Box sx={{ mb: 4, textAlign: 'center' }} className="fade-in">
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 800,
            mb: 1,
            color: '#764ba2',
            textShadow: '0 4px 16px rgba(39,26,69,0.18)',
          }}
        >
          Pessoas
        </Typography>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#764ba2',
            fontWeight: 400,
            textShadow: '0 2px 8px rgba(39,26,69,0.18)',
          }}
        >
          Gerencie os usuários do sistema
        </Typography>
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
      {/* FAB Moderno */}
      <Box sx={{ 
        position: 'fixed', 
        bottom: 24, 
        right: 24,
        zIndex: 1000,
      }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenModal(true)}
          sx={{
            minWidth: 0,
            width: 56,
            height: 56,
            borderRadius: '50%',
            p: 0,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              transform: 'scale(1.05)',
              boxShadow: '0 12px 35px rgba(102, 126, 234, 0.4)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 12H19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Button>
      </Box>
    </Container>
  );
};

export default PessoaView; 