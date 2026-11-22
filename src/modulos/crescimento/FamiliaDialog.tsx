import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PersonRemoveOutlinedIcon from '@mui/icons-material/PersonRemoveOutlined';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { crescimentoApi } from './api';
import { listarUsuarios, type UsuarioDisponivel } from './diretorio';
import type { Familia, Membro, Papel } from './tipos';

const PAPEIS: Record<Papel, string> = { RESPONSAVEL: 'Pode editar', LEITOR: 'Só vê' };

/** Quem participa da família (responsáveis editam; leitores, como avós, só veem). */
export function FamiliaDialog({
  familia,
  aberto,
  onFechar,
  onAlterada,
}: Readonly<{ familia: Familia; aberto: boolean; onFechar: () => void; onAlterada: (f: Familia | null) => void }>) {
  const [usuarios, setUsuarios] = useState<UsuarioDisponivel[] | null>(null);
  const [novo, setNovo] = useState<number | ''>('');
  const [papel, setPapel] = useState<Papel>('LEITOR');
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [aRemover, setARemover] = useState<Membro | null>(null);
  const responsavel = familia.meuPapel === 'RESPONSAVEL';

  useEffect(() => {
    if (aberto && responsavel) listarUsuarios().then(setUsuarios);
    setErro(null);
  }, [aberto, responsavel]);

  async function executar(acao: () => Promise<Familia | null>) {
    setOcupado(true);
    setErro(null);
    try {
      onAlterada(await acao());
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  const disponiveis = (usuarios ?? []).filter((u) => !familia.membros.some((m) => m.usuarioId === u.id));
  return (
    <Modal open={aberto} onClose={onFechar} title={`Família ${familia.nome}`} maxWidth="xs">
      <Stack spacing={2}>
        <List dense disablePadding>
          {familia.membros.map((m) => (
            <ListItem
              key={m.usuarioId}
              disableGutters
              secondaryAction={
                responsavel && (
                  <IconButton
                    edge="end"
                    aria-label={`Remover ${m.nome ?? ''}`}
                    disabled={ocupado}
                    onClick={() => setARemover(m)}
                  >
                    <PersonRemoveOutlinedIcon />
                  </IconButton>
                )
              }
            >
              <ListItemText primary={m.nome ?? `Usuário ${m.usuarioId}`} secondary={PAPEIS[m.papel]} />
              {responsavel && (
                <Select
                  size="small"
                  value={m.papel}
                  disabled={ocupado}
                  onChange={(e) =>
                    executar(() => crescimentoApi.salvarMembro(familia.id, m.usuarioId, e.target.value as Papel))
                  }
                  sx={{ mr: 5, '& .MuiSelect-select': { textTransform: 'none' } }}
                >
                  {Object.entries(PAPEIS).map(([v, r]) => (
                    <MenuItem key={v} value={v} sx={{ textTransform: 'none !important' }}>
                      {r}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </ListItem>
          ))}
        </List>
        {responsavel && usuarios && disponiveis.length > 0 && (
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Convidar
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 1 }}>
              <TextField
                select
                size="small"
                label="Pessoa"
                value={novo}
                onChange={(e) => setNovo(Number(e.target.value))}
              >
                {disponiveis.map((u) => (
                  <MenuItem key={u.id} value={u.id} sx={{ textTransform: 'none !important' }}>
                    {u.nome}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                value={papel}
                onChange={(e) => setPapel(e.target.value as Papel)}
                aria-label="Permissão"
              >
                {Object.entries(PAPEIS).map(([v, r]) => (
                  <MenuItem key={v} value={v} sx={{ textTransform: 'none !important' }}>
                    {r}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Button
              sx={{ mt: 1 }}
              variant="contained"
              disabled={novo === '' || ocupado}
              onClick={() =>
                executar(async () => {
                  const f = await crescimentoApi.salvarMembro(familia.id, Number(novo), papel);
                  setNovo('');
                  return f;
                })
              }
            >
              Adicionar
            </Button>
          </Box>
        )}
        {responsavel && usuarios === null && (
          <Typography variant="body2" color="text.secondary">
            Para convidar alguém, peça a um administrador do casa.
          </Typography>
        )}
        {erro && <Alert severity="error">{erro}</Alert>}
      </Stack>
      <ConfirmDialog
        open={aRemover !== null}
        title="Remover da família?"
        description={`${aRemover?.nome ?? 'Esta pessoa'} deixa de ver as crianças da família ${familia.nome}. Se for você, o seu acesso acaba na hora.`}
        confirmLabel="Remover"
        destructive
        loading={ocupado}
        onConfirm={() => {
          const m = aRemover;
          if (!m) return;
          void executar(async () => {
            await crescimentoApi.removerMembro(familia.id, m.usuarioId);
            return (await crescimentoApi.familias()).find((f) => f.id === familia.id) ?? null;
          }).finally(() => setARemover(null));
        }}
        onClose={() => !ocupado && setARemover(null)}
      />
    </Modal>
  );
}
