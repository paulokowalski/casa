import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { crescimentoApi } from './api';
import { cor } from './estilo';
import { dataCurta, dataLocalISO, primeiroNome } from './formato';
import type { Crianca, PerguntaIa, ResumoMes } from './tipos';

const MAX = 500;

/** Perguntas dos pais à IA sobre o mês do resumo. Só assuntos da criança; a API recusa o resto. */
export function ConversaIa({
  crianca,
  resumo,
  onAlterada,
}: Readonly<{ crianca: Crianca; resumo: ResumoMes; onAlterada: (conversa: PerguntaIa[]) => void }>) {
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aExcluir, setAExcluir] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const nome = primeiroNome(crianca.nome);
  const valido = texto.trim().length >= 3 && texto.length <= MAX;

  const enviar = async () => {
    if (!valido || enviando) return;
    setEnviando(true);
    setErro(null);
    try {
      const nova = await crescimentoApi.perguntarIa(crianca.id, resumo.mes, texto.trim());
      onAlterada([...resumo.conversa, nova]);
      setTexto('');
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  const excluir = async () => {
    const id = aExcluir;
    if (!id || excluindo) return;
    setExcluindo(true);
    try {
      await crescimentoApi.excluirPerguntaIa(crianca.id, id);
      onAlterada(resumo.conversa.filter((p) => p.id !== id));
      setAExcluir(null);
    } catch (e) {
      setErro((e as Error).message);
      setAExcluir(null);
    } finally {
      setExcluindo(false);
    }
  };

  if (!crianca.podeEditar && resumo.conversa.length === 0) return null;

  return (
    <Box sx={{ mt: 2, pt: 2, borderTop: `1px dashed ${cor.amarelo}` }}>
      <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
        Perguntas sobre o {resumo.rotulo}
      </Typography>

      {resumo.conversa.map((p) => (
        <Box key={p.id} sx={{ mb: 1.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', gap: 0.5 }}>
            <Box
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 3,
                borderTopRightRadius: 4,
                px: 1.5,
                py: 1,
                maxWidth: '85%',
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>
                {p.pergunta}
              </Typography>
            </Box>
            {crianca.podeEditar && (
              <Tooltip title="Apagar pergunta">
                <IconButton
                  size="small"
                  aria-label="Apagar pergunta"
                  disabled={excluindo}
                  onClick={() => setAExcluir(p.id)}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6, mt: 1, overflowWrap: 'anywhere' }}>
            {p.resposta}
          </Typography>
          <Typography variant="caption" sx={{ color: cor.tintaSuave }}>
            {dataCurta(dataLocalISO(p.feitaEm))} · resposta da IA, não substitui o pediatra
          </Typography>
        </Box>
      ))}

      {erro && (
        <Alert severity="warning" sx={{ mb: 1 }} onClose={() => setErro(null)}>
          {erro}
        </Alert>
      )}

      {crianca.podeEditar && (
        <>
          <TextField
            fullWidth
            multiline
            minRows={2}
            maxRows={6}
            size="small"
            placeholder={`Pergunte sobre ${nome}: sono, cólica, alimentação, marcos…`}
            value={texto}
            onChange={(e) => setTexto(e.target.value.slice(0, MAX))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                void enviar();
              }
            }}
            disabled={enviando}
            sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
            slotProps={{ htmlInput: { 'aria-label': 'Pergunta para a IA', maxLength: MAX } }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Typography variant="caption" sx={{ color: cor.tintaSuave, flex: 1 }}>
              Só sobre {nome} e seus cuidados. Em urgência, procure atendimento. {texto.length}/{MAX}
            </Typography>
            <Button
              size="small"
              variant="contained"
              disableElevation
              disabled={!valido || enviando}
              onClick={enviar}
              startIcon={enviando ? <CircularProgress size={14} color="inherit" /> : <SendRoundedIcon />}
              sx={{ bgcolor: cor.amareloForte, '&:hover': { bgcolor: cor.amareloForte, filter: 'brightness(0.95)' } }}
            >
              {enviando ? 'Pensando…' : 'Perguntar'}
            </Button>
          </Box>
        </>
      )}

      <ConfirmDialog
        open={aExcluir !== null}
        title="Apagar pergunta?"
        description="A pergunta e a resposta da IA serão apagadas. Para ter a resposta de novo, será preciso perguntar outra vez."
        confirmLabel="Apagar"
        destructive
        loading={excluindo}
        onConfirm={excluir}
        onClose={() => !excluindo && setAExcluir(null)}
      />
    </Box>
  );
}
