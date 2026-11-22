import { useEffect, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../contexts/ToastContext';
import { crescimentoApi } from '../api';
import { Carregando, Erro } from '../componentes';
import { cor } from '../estilo';
import { hojeISO } from '../formato';
import { useCarregar } from '../useCarregar';
import type { Area, Marco } from '../tipos';
import type { PropsAba } from '.';

const AREAS: Record<Area, { rotulo: string; cor: string; fundo: string }> = {
  MOTOR: { rotulo: 'Movimento', cor: cor.azulForte, fundo: cor.azulClaro },
  SOCIAL: { rotulo: 'Social', cor: cor.rosaForte, fundo: cor.rosaClaro },
  LINGUAGEM: { rotulo: 'Linguagem', cor: cor.lilasForte, fundo: cor.lilasClaro },
  COGNITIVO: { rotulo: 'Cognição', cor: cor.mentaForte, fundo: cor.mentaClaro },
};

const SITUACAO_FAIXA = { PASSADA: 'já passou', ATUAL: 'fase atual', PROXIMA: 'próxima fase', FUTURA: '' } as const;

export function MarcosTela({ crianca, versao }: Readonly<PropsAba>) {
  const { notify } = useToast();
  const { dados, erro, recarregar, setDados } = useCarregar(
    () => crescimentoApi.marcos(crianca.id),
    [crianca.id, versao],
  );
  const [aberta, setAberta] = useState<string | false>(false);
  const [editando, setEditando] = useState<Marco | null>(null);
  const [data, setData] = useState('');
  const [nota, setNota] = useState('');
  const [ocupado, setOcupado] = useState<string | null>(null);

  useEffect(() => {
    if (dados && aberta === false) setAberta(dados.faixaAtualId);
  }, [dados, aberta]);

  async function alternar(m: Marco) {
    setOcupado(m.id);
    try {
      if (m.situacao === 'ATINGIDO') await crescimentoApi.desmarcar(crianca.id, m.id);
      else await crescimentoApi.marcar(crianca.id, m.id);
      setDados(await crescimentoApi.marcos(crianca.id));
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      setOcupado(null);
    }
  }

  async function salvarDetalhe() {
    if (!editando) return;
    setOcupado(editando.id);
    try {
      await crescimentoApi.marcar(crianca.id, editando.id, data, nota);
      setDados(await crescimentoApi.marcos(crianca.id));
      setEditando(null);
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      setOcupado(null);
    }
  }

  if (erro && !dados) return <Erro mensagem={erro} tentar={recarregar} />;
  if (!dados) return <Carregando />;

  return (
    <Box sx={{ maxWidth: 820 }}>
      <Alert severity={dados.marcosAtencao > 0 ? 'warning' : 'info'} sx={{ mb: 2 }}>
        {dados.aviso}
        {dados.marcosAtencao > 0 && ` Há ${dados.marcosAtencao} marco(s) de fases anteriores sem registro.`}
        {dados.idadeCorrigida && ' A fase segue a idade corrigida.'}
      </Alert>
      {dados.faixas.map((f) => (
        <Accordion
          key={f.id}
          expanded={aberta === f.id}
          onChange={(_e, exp) => setAberta(exp ? f.id : '')}
          disableGutters
          sx={{
            mb: 1,
            borderRadius: '12px !important',
            border: `1px solid ${f.situacao === 'ATUAL' ? cor.lilas : cor.borda}`,
            '&::before': { display: 'none' },
            opacity: f.situacao === 'FUTURA' ? 0.7 : 1,
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography sx={{ fontWeight: 700 }}>{f.nome}</Typography>
                {SITUACAO_FAIXA[f.situacao] && (
                  <Chip
                    size="small"
                    label={SITUACAO_FAIXA[f.situacao]}
                    sx={{
                      height: 20,
                      bgcolor: f.situacao === 'ATUAL' ? cor.lilasClaro : 'transparent',
                      color: f.situacao === 'ATUAL' ? cor.lilasForte : 'text.secondary',
                    }}
                  />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, maxWidth: 260 }}>
                <LinearProgress
                  variant="determinate"
                  value={(f.atingidos / f.total) * 100}
                  sx={{
                    flex: 1,
                    height: 6,
                    borderRadius: 3,
                    bgcolor: cor.mentaClaro,
                    '& .MuiLinearProgress-bar': { bgcolor: cor.mentaForte },
                  }}
                />
                <Typography variant="caption">
                  {f.atingidos}/{f.total}
                </Typography>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Stack spacing={0.5}>
              {f.marcos.map((m) => {
                const a = AREAS[m.area];
                return (
                  <Box
                    key={m.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 0.5,
                      borderRadius: 2,
                      bgcolor: m.situacao === 'ATENCAO' ? cor.amareloClaro : 'transparent',
                    }}
                  >
                    <Checkbox
                      checked={m.situacao === 'ATINGIDO'}
                      disabled={!crianca.podeEditar || ocupado === m.id}
                      onChange={() => alternar(m)}
                      slotProps={{ input: { 'aria-label': m.texto } }}
                      sx={{ color: a.cor, '&.Mui-checked': { color: a.cor } }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body1" sx={{ color: cor.tinta }}>
                        {m.texto}
                      </Typography>
                      <Typography variant="caption" sx={{ color: a.cor, fontWeight: 600 }}>
                        {a.rotulo}
                      </Typography>
                      {m.situacao === 'ATINGIDO' && (
                        <Typography variant="caption" sx={{ color: cor.tintaSuave }}>
                          {' '}
                          · aos {m.idadeAoAtingir}
                          {m.nota && ` · ${m.nota}`}
                        </Typography>
                      )}
                    </Box>
                    {crianca.podeEditar && m.situacao === 'ATINGIDO' && (
                      <IconButton
                        size="small"
                        aria-label="Data e anotação"
                        onClick={() => {
                          setEditando(m);
                          setData(m.atingidoEm ?? hojeISO());
                          setNota(m.nota ?? '');
                        }}
                      >
                        <EditCalendarOutlinedIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                );
              })}
            </Stack>
            {(f.situacao === 'ATUAL' || f.situacao === 'PROXIMA') && (
              <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 3, bgcolor: cor.amareloClaro }}>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, display: 'flex', gap: 0.75, alignItems: 'center', mb: 0.5 }}
                >
                  <LightbulbOutlinedIcon fontSize="small" sx={{ color: cor.amareloForte }} /> Para estimular
                </Typography>
                {f.brincadeiras.map((b) => (
                  <Typography key={b} variant="body2" sx={{ color: cor.tinta }}>
                    • {b}
                  </Typography>
                ))}
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      ))}
      <Typography variant="caption" sx={{ display: 'block', mt: 2 }}>
        Fonte: {dados.fonte}.
      </Typography>
      <Modal
        open={editando !== null}
        onClose={() => setEditando(null)}
        title={editando?.texto}
        maxWidth="xs"
        actions={
          <>
            <Button variant="outlined" onClick={() => setEditando(null)}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={salvarDetalhe} disabled={Boolean(ocupado)}>
              Salvar
            </Button>
          </>
        }
      >
        <Stack spacing={2}>
          <TextField
            label="Quando aconteceu"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: crianca.nascimento, max: hojeISO() } }}
          />
          <TextField
            label="Anotação"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            multiline
            minRows={2}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
        </Stack>
      </Modal>
    </Box>
  );
}
