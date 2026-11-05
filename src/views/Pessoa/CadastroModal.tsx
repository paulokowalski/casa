import { useEffect, useState, type FormEvent } from 'react';
import { Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { Modal } from '../../components/ui/Modal';
import { usePessoa, type Pessoa } from '../../contexts/PessoaContext';

interface CadastroModalProps {
  open: boolean;
  /** Pessoa em edição; `null` para cadastrar uma nova */
  pessoa: Pessoa | null;
  onClose: () => void;
  onSuccess: (mensagem: string) => void;
}

const FORM_ID = 'form-pessoa';

/** Cadastro e edição de pessoa no mesmo formulário. */
export function CadastroModal({ open, pessoa, onClose, onSuccess }: Readonly<CadastroModalProps>) {
  const { criarPessoa, editarPessoa } = usePessoa();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setNome(pessoa?.nome ?? '');
    setEmail(pessoa?.email ?? '');
    setErro(null);
  }, [open, pessoa]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      const dados = { nome: nome.trim(), email: email.trim() };
      if (pessoa) await editarPessoa(pessoa.id, dados);
      else await criarPessoa(dados);
      onSuccess(pessoa ? 'Pessoa atualizada.' : 'Pessoa cadastrada.');
      onClose();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Erro ao salvar.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={salvando ? () => undefined : onClose}
      title={pessoa ? 'Editar pessoa' : 'Nova pessoa'}
      maxWidth="xs"
      actions={
        <>
          <Button variant="outlined" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant="contained"
            disabled={salvando}
            startIcon={salvando ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            Salvar
          </Button>
        </>
      }
    >
      <Box
        component="form"
        id={FORM_ID}
        onSubmit={handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}
      >
        <TextField label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} required fullWidth autoFocus />
        <TextField
          label="E-mail"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        {erro && (
          <Typography color="error" variant="body2" role="alert">
            {erro}
          </Typography>
        )}
      </Box>
    </Modal>
  );
}
