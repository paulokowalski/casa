import { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, MenuItem, TextField, Typography } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { crescimentoApi } from './api';
import { Bloco } from './componentes';
import { ConversaIa } from './ConversaIa';
import { cor } from './estilo';
import { dataCurta, dataLocalISO } from './formato';
import { useCarregar } from './useCarregar';
import type { Crianca, ResumoMes } from './tipos';

const rotulo = (mes: number) => `${mes + 1}º mês`;

/**
 * Resumo de um mês de vida feito pela IA, com perguntas para a consulta. Só gera quando alguém toca no botão.
 * Use com key={crianca.id} para recomeçar ao trocar de criança.
 */
export function ResumoMesCartao({ crianca, versao }: Readonly<{ crianca: Crianca; versao: number }>) {
  const { dados, setDados } = useCarregar(() => crescimentoApi.resumosMes(crianca.id), [crianca.id, versao]);
  const [mes, setMes] = useState<number | null>(null);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  // por padrão, o último mês completo (ou o primeiro, para recém-nascidos)
  useEffect(() => {
    if (dados && mes === null) setMes(Math.max(0, dados.mesAtual - 1));
  }, [dados, mes]);

  if (!dados?.disponivel || mes === null) return null;
  const resumo = dados.resumos.find((r) => r.mes === mes) ?? null;
  const meses = Array.from({ length: dados.mesAtual + 1 }, (_, i) => dados.mesAtual - i);

  const gerar = async () => {
    setGerando(true);
    setErro(null);
    try {
      const novo = await crescimentoApi.gerarResumoMes(crianca.id, mes);
      setDados({ ...dados, resumos: [novo, ...dados.resumos.filter((r) => r.mes !== mes)] });
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setGerando(false);
    }
  };

  const copiar = async (r: ResumoMes) => {
    const texto = `Perguntas para a consulta (${r.rotulo}):\n${r.perguntas.map((p) => `• ${p}`).join('\n')}`;
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErro('Não consegui copiar. Selecione o texto e copie à mão.');
    }
  };

  return (
    <Bloco fundo={cor.amareloClaro}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
        <AutoAwesomeRoundedIcon sx={{ color: cor.amareloForte }} />
        <Typography sx={{ fontWeight: 700, flex: 1, minWidth: 120 }}>Resumo do mês</Typography>
        <TextField
          select
          size="small"
          value={mes}
          onChange={(e) => {
            setMes(Number(e.target.value));
            setErro(null);
          }}
          disabled={gerando}
          sx={{
            minWidth: 140,
            bgcolor: 'background.paper',
            borderRadius: 1,
          }}
          slotProps={{
            htmlInput: { 'aria-label': 'Mês de vida' },
            select: { renderValue: (v) => rotulo(Number(v)) },
          }}
        >
          {meses.map((m) => (
            <MenuItem key={m} value={m}>
              {rotulo(m)}
              {m === dados.mesAtual ? ' (atual)' : ''}
              {dados.resumos.some((r) => r.mes === m) ? ' ✓' : ''}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {erro && (
        <Alert severity="warning" sx={{ mb: 1.5 }} onClose={() => setErro(null)}>
          {erro}
        </Alert>
      )}

      {gerando ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 2 }}>
          <CircularProgress size={22} sx={{ color: cor.amareloForte }} />
          <Typography variant="body2" sx={{ color: cor.tintaSuave }}>
            Lendo o mês e escrevendo o resumo… leva uns 10 segundos.
          </Typography>
        </Box>
      ) : resumo ? (
        <>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
            {resumo.texto}
          </Typography>
          {resumo.perguntas.length > 0 && (
            <>
              <Typography variant="body2" sx={{ fontWeight: 700, mt: 2, mb: 0.5 }}>
                Para perguntar na consulta
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2.5, '& li': { mb: 0.5 } }}>
                {resumo.perguntas.map((p) => (
                  <Typography component="li" variant="body2" key={p}>
                    {p}
                  </Typography>
                ))}
              </Box>
            </>
          )}
          <Typography variant="caption" sx={{ display: 'block', color: cor.tintaSuave, mt: 1.5 }}>
            {dataCurta(resumo.inicio)} a {dataCurta(resumo.fim)} · feito em {dataCurta(dataLocalISO(resumo.geradoEm))}
            {resumo.parcial ? ', antes do mês acabar' : ''}. Texto gerado por IA: confira com o pediatra.
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            {resumo.perguntas.length > 0 && (
              <Button size="small" startIcon={<ContentCopyRoundedIcon />} onClick={() => copiar(resumo)}>
                {copiado ? 'Copiado!' : 'Copiar perguntas'}
              </Button>
            )}
            {crianca.podeEditar && (
              <Button size="small" startIcon={<RefreshRoundedIcon />} onClick={gerar}>
                Refazer
              </Button>
            )}
          </Box>
          <ConversaIa
            crianca={crianca}
            resumo={resumo}
            onAlterada={(conversa) =>
              setDados({ ...dados, resumos: dados.resumos.map((r) => (r.mes === resumo.mes ? { ...r, conversa } : r)) })
            }
          />
        </>
      ) : (
        <>
          <Typography variant="body2" sx={{ color: cor.tintaSuave, mb: 1.5 }}>
            A IA lê as medidas, o diário, os marcos e as vacinas do {rotulo(mes)} e escreve um resumo com perguntas para
            levar ao pediatra. Fotos e o nome não são enviados.
          </Typography>
          {crianca.podeEditar ? (
            <Button
              variant="contained"
              disableElevation
              startIcon={<AutoAwesomeRoundedIcon />}
              onClick={gerar}
              sx={{ bgcolor: cor.amareloForte, '&:hover': { bgcolor: cor.amareloForte, filter: 'brightness(0.95)' } }}
            >
              Gerar resumo do {rotulo(mes)}
            </Button>
          ) : (
            <Typography variant="caption" sx={{ color: cor.tintaSuave }}>
              Ainda não há resumo deste mês.
            </Typography>
          )}
        </>
      )}
    </Bloco>
  );
}
