import { useEffect, useState, type FormEvent } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { Modal } from '../../components/ui/Modal';
import { usePessoa, type Pessoa } from '../../contexts/PessoaContext';
import { useUsuario } from '../../contexts/AuthContext';
import type { Papel } from '../../types/auth';

interface CadastroModalProps {
  open: boolean;
  pessoa: Pessoa | null;
  onClose: () => void;
  onSuccess: (mensagem: string) => void;
}

const FORM_ID = 'form-pessoa';
const SENHA_MINIMA = 8;

export function CadastroModal({ open, pessoa, onClose, onSuccess }: Readonly<CadastroModalProps>) {
  const { criarPessoa, editarPessoa } = usePessoa();
  const { id: usuarioId } = useUsuario();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [papel, setPapel] = useState<Papel>('USUARIO');
  const [ativo, setAtivo] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const ehVoceMesmo = pessoa?.id === usuarioId;

  useEffect(() => {
    if (!open) return;
    setNome(pessoa?.nome ?? '');
    setEmail(pessoa?.email ?? '');
    setSenha('');
    setPapel(pessoa?.papel ?? 'USUARIO');
    setAtivo(pessoa?.ativo ?? true);
    setErro(null);
  }, [open, pessoa]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (senha && senha.length < SENHA_MINIMA) {
      setErro(`A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`);
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const dados = { nome: nome.trim(), email: email.trim(), senha: senha || undefined, papel, ativo };
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

  const ajudaSenha = pessoa?.temAcesso
    ? 'Deixe em branco para manter a senha atual.'
    : 'Sem senha, a pessoa aparece nas compras mas não consegue entrar.';

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
        <TextField
          id="pessoa-nome"
          label="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          helperText="Precisa ser igual ao nome usado nas compras."
          required
          fullWidth
          autoFocus
        />
        <TextField
          id="pessoa-email"
          label="E-mail (login)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        <TextField
          id="pessoa-senha"
          label={pessoa?.temAcesso ? 'Nova senha' : 'Senha'}
          type="password"
          autoComplete="new-password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          helperText={ajudaSenha}
          fullWidth
        />
        <TextField
          id="pessoa-papel"
          select
          label="Perfil"
          value={papel}
          onChange={(e) => setPapel(e.target.value as Papel)}
          disabled={ehVoceMesmo}
          helperText={
            ehVoceMesmo
              ? 'Você não pode mudar o seu próprio perfil.'
              : papel === 'ADMIN'
                ? 'Vê os dados de todos e gerencia pessoas.'
                : 'Vê só os próprios dados.'
          }
          fullWidth
        >
          <MenuItem value="USUARIO">Usuário</MenuItem>
          <MenuItem value="ADMIN">Administrador</MenuItem>
        </TextField>
        {pessoa && (
          <FormControlLabel
            control={
              <Switch
                id="pessoa-ativo"
                checked={ativo}
                onChange={(e) => setAtivo(e.target.checked)}
                disabled={ehVoceMesmo}
              />
            }
            label={ativo ? 'Acesso ativo' : 'Acesso bloqueado'}
          />
        )}
        {erro && (
          <Typography color="error" variant="body2" role="alert">
            {erro}
          </Typography>
        )}
      </Box>
    </Modal>
  );
}
