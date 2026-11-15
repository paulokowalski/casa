import { useCallback, useEffect, useState } from 'react';
import { Alert, Box, IconButton, TextField, Tooltip, Typography } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { PageHeader } from '../../components/ui/PageHeader';
import { servidorService } from '../../services/servidor';
import type { ServidorAgora, ServidorDia, ServidorResumoDia } from '../../types/servidor';
import { Agora } from './Agora';
import { HistoricoDia } from './HistoricoDia';
import { TabelaDias } from './TabelaDias';
import { diasAtras, duracao, isoLocal } from './formatos';

const ATUALIZAR_AGORA_MS = 15_000;
const ATUALIZAR_HISTORICO_MS = 5 * 60_000;
const DIAS_NA_TABELA = 30;

/** Repete a função enquanto a aba está visível e roda de novo assim que ela volta a aparecer. */
function useRepetir(fn: () => void, intervaloMs: number) {
  useEffect(() => {
    fn();
    const timer = window.setInterval(() => {
      if (!document.hidden) fn();
    }, intervaloMs);
    const aoVoltar = () => {
      if (!document.hidden) fn();
    };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [fn, intervaloMs]);
}

export function ServidorView() {
  const hoje = isoLocal(new Date());
  const [data, setData] = useState(hoje);

  const [agora, setAgora] = useState<ServidorAgora | null>(null);
  const [carregandoAgora, setCarregandoAgora] = useState(true);
  const [erroAgora, setErroAgora] = useState<string | null>(null);

  const [dia, setDia] = useState<ServidorDia | null>(null);
  const [carregandoDia, setCarregandoDia] = useState(true);
  const [dias, setDias] = useState<ServidorResumoDia[]>([]);
  const [carregandoDias, setCarregandoDias] = useState(true);
  const [erroHistorico, setErroHistorico] = useState<string | null>(null);

  const lerAgora = useCallback(() => {
    servidorService
      .agora()
      .then((a) => {
        setAgora(a);
        setErroAgora(null);
      })
      .catch((e: Error) => setErroAgora(e.message))
      .finally(() => setCarregandoAgora(false));
  }, []);

  const lerDia = useCallback(() => {
    setCarregandoDia(true);
    servidorService
      .dia(data)
      .then((d) => {
        setDia(d);
        setErroHistorico(null);
      })
      .catch((e: Error) => {
        setDia(null);
        setErroHistorico(e.message);
      })
      .finally(() => setCarregandoDia(false));
  }, [data]);

  const lerDias = useCallback(() => {
    setCarregandoDias(true);
    servidorService
      .dias(diasAtras(DIAS_NA_TABELA - 1), isoLocal(new Date()))
      .then(setDias)
      .catch((e: Error) => setErroHistorico(e.message))
      .finally(() => setCarregandoDias(false));
  }, []);

  useRepetir(lerAgora, ATUALIZAR_AGORA_MS);
  useRepetir(lerDia, ATUALIZAR_HISTORICO_MS);
  useRepetir(lerDias, ATUALIZAR_HISTORICO_MS);

  const atualizarTudo = () => {
    lerAgora();
    lerDia();
    lerDias();
  };

  const subtitulo = agora
    ? [agora.host, agora.modelo, `ligado há ${duracao(agora.uptimeSegundos)}`].filter(Boolean).join(' · ')
    : 'CPU, memória, temperatura, discos e rede';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
      <PageHeader
        section="Administração"
        title="Saúde do Servidor"
        subtitle={subtitulo}
        actions={
          <Tooltip title="Atualizar agora">
            <IconButton onClick={atualizarTudo} aria-label="Atualizar agora">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      />

      <Box
        component="section"
        aria-labelledby="titulo-agora"
        sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
      >
        <Box
          sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}
        >
          <Typography id="titulo-agora" component="h2" variant="h4">
            Agora
          </Typography>
          <Typography variant="caption">
            {agora ? `Lido às ${agora.lidoEm.slice(11, 19)} · atualiza a cada 15 s` : 'Atualiza a cada 15 s'}
            {agora?.kernel ? ` · kernel ${agora.kernel}` : ''}
          </Typography>
        </Box>
        {erroAgora && <Alert severity="warning">{erroAgora}</Alert>}
        <Agora agora={agora} carregando={carregandoAgora} />
      </Box>

      <Box component="section" aria-labelledby="titulo-dia" sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, flexWrap: 'wrap' }}
        >
          <Typography id="titulo-dia" component="h2" variant="h4">
            Histórico do dia
          </Typography>
          <TextField
            size="small"
            type="date"
            label="Dia"
            value={data}
            onChange={(e) => e.target.value && setData(e.target.value)}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: hoje } }}
            sx={{ width: 170 }}
          />
        </Box>
        {erroHistorico && <Alert severity="warning">{erroHistorico}</Alert>}
        <HistoricoDia dia={dia} carregando={carregandoDia} />
      </Box>

      <TabelaDias dias={dias} carregando={carregandoDias} selecionado={data} onSelecionar={setData} />
    </Box>
  );
}
