import { useCallback, useState } from 'react';
import { Secao } from './Secao';
import { Internet } from './Internet';
import { Ventilacao } from './Ventilacao';
import { useRepetir } from './useRepetir';
import { useSearchParams } from 'react-router-dom';
import { Box, IconButton, Tab, Tabs, TextField, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { PageHeader } from '../../components/ui/PageHeader';
import { servidorService } from '../../services/servidor';
import type { EventoServidor, ServidorAgora, ServidorDia, ServidorHost, ServidorResumoDia } from '../../types/servidor';
import { Agora } from './Agora';
import { ContainersAgora } from './Containers';
import { SaudeDiscos } from './SaudeDiscos';
import { HistoricoContainers, HistoricoDia, HistoricoDiscos } from './HistoricoDia';
import { formatDateBR } from '../../utils/format';
import { TabelaDias } from './TabelaDias';
import { Host } from './Host';
import { diasAtras, duracao, isoLocal } from './formatos';

const ATUALIZAR_AGORA_MS = 15_000;
const ATUALIZAR_HISTORICO_MS = 5 * 60_000;
/** O host grava o status uma vez por minuto. */
const ATUALIZAR_HOST_MS = 60_000;
const DIAS_DE_EVENTOS = 7;
const DIAS_NA_TABELA = 30;

const ABAS = [
  { id: 'geral', rotulo: 'Visão geral' },
  { id: 'internet', rotulo: 'Internet' },
  { id: 'discos', rotulo: 'Discos' },
  { id: 'ventilacao', rotulo: 'Ventilação' },
  { id: 'containers', rotulo: 'Containers' },
  { id: 'sistema', rotulo: 'Sistema' },
  { id: 'historico', rotulo: 'Histórico' },
] as const;
type Aba = (typeof ABAS)[number]['id'];

export function ServidorView() {
  const hoje = isoLocal(new Date());
  const [data, setData] = useState(hoje);
  const [params, setParams] = useSearchParams();
  const aba: Aba = ABAS.find((a) => a.id === params.get('aba'))?.id ?? 'geral';
  const irPara = (v: Aba) =>
    setParams(
      (p) => {
        if (v === 'geral') p.delete('aba');
        else p.set('aba', v);
        return p;
      },
      { replace: true },
    );

  const [agora, setAgora] = useState<ServidorAgora | null>(null);
  const [carregandoAgora, setCarregandoAgora] = useState(true);
  const [erroAgora, setErroAgora] = useState<string | null>(null);

  const [host, setHost] = useState<ServidorHost | null>(null);
  const [carregandoHost, setCarregandoHost] = useState(true);
  const [erroHost, setErroHost] = useState<string | null>(null);
  const [eventos, setEventos] = useState<EventoServidor[]>([]);

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

  const lerHost = useCallback(() => {
    servidorService
      .host()
      .then((h) => {
        setHost(h);
        setErroHost(null);
      })
      .catch((e: Error) => setErroHost(e.message))
      .finally(() => setCarregandoHost(false));
    servidorService
      .eventos(diasAtras(DIAS_DE_EVENTOS - 1), isoLocal(new Date()))
      .then(setEventos)
      .catch(() => undefined);
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
  useRepetir(lerHost, ATUALIZAR_HOST_MS);
  useRepetir(lerDia, ATUALIZAR_HISTORICO_MS);
  useRepetir(lerDias, ATUALIZAR_HISTORICO_MS);

  // as abas Internet e Ventilação leem os próprios dados: o contador avisa que o botão foi apertado
  const [pedidoAtualizar, setPedidoAtualizar] = useState(0);
  const atualizarTudo = () => {
    lerAgora();
    lerHost();
    lerDia();
    lerDias();
    setPedidoAtualizar((n) => n + 1);
  };

  const subtitulo = agora
    ? [agora.host, agora.modelo, `ligado há ${duracao(agora.uptimeSegundos)}`].filter(Boolean).join(' · ')
    : 'CPU, memória, temperatura, discos e rede';

  const seletorDia = (
    <TextField
      size="small"
      type="date"
      label="Dia"
      value={data}
      onChange={(e) => e.target.value && setData(e.target.value)}
      slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: hoje } }}
      sx={{ width: 170 }}
    />
  );
  const lidoAgora = agora
    ? `Lido às ${agora.lidoEm.slice(11, 19)} · atualiza a cada 15 s${agora.kernel ? ` · kernel ${agora.kernel}` : ''}`
    : 'Atualiza a cada 15 s';
  const lidoHost = host
    ? `Lido pelo host às ${host.lidoEm.slice(11, 16)} · atualiza a cada minuto`
    : 'Atualiza a cada minuto';
  const doDia = data === hoje ? 'Hoje' : `Dia ${formatDateBR(data)}`;

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

      <Tabs
        value={aba}
        onChange={(_e, v: Aba) => irPara(v)}
        variant="scrollable"
        allowScrollButtonsMobile
        sx={{ borderBottom: 1, borderColor: 'divider', mt: { xs: -1, md: -1.5 } }}
      >
        {ABAS.map((a) => (
          <Tab key={a.id} value={a.id} label={a.rotulo} sx={{ minWidth: 72 }} />
        ))}
      </Tabs>

      {aba === 'geral' && (
        <Secao id="geral" titulo="Agora" info={lidoAgora} erro={erroAgora}>
          <Agora agora={agora} carregando={carregandoAgora} npuPct={host?.npu?.nucleosPct} />
        </Secao>
      )}

      {aba === 'internet' && (
        <Internet
          data={data}
          seletorDia={seletorDia}
          tituloDia={doDia}
          host={host}
          eventos={eventos}
          pedidoAtualizar={pedidoAtualizar}
        />
      )}

      {aba === 'discos' && (
        <>
          <Secao id="discos-agora" titulo="Agora" info={lidoAgora} erro={erroAgora}>
            <SaudeDiscos discos={agora?.discos ?? []} carregando={carregandoAgora} />
          </Secao>
          <Secao id="discos-dia" titulo={doDia} acao={seletorDia} erro={erroHistorico}>
            <HistoricoDiscos dia={dia} carregando={carregandoDia} dias={dias} />
          </Secao>
        </>
      )}

      {aba === 'ventilacao' && (
        <Ventilacao
          data={data}
          seletorDia={seletorDia}
          tituloDia={doDia}
          onSelecionarDia={setData}
          discos={agora?.discos ?? []}
          pedidoAtualizar={pedidoAtualizar}
        />
      )}

      {aba === 'containers' && (
        <>
          <Secao id="containers-agora" titulo="Agora" info={lidoAgora} erro={erroAgora}>
            <ContainersAgora containers={agora?.containers ?? []} carregando={carregandoAgora} />
          </Secao>
          <Secao id="containers-dia" titulo={doDia} acao={seletorDia} erro={erroHistorico}>
            <HistoricoContainers dia={dia} carregando={carregandoDia} />
          </Secao>
        </>
      )}

      {aba === 'sistema' && (
        <Secao id="sistema" titulo="Sistema" info={lidoHost} erro={erroHost}>
          <Host host={host} carregando={carregandoHost} eventos={eventos} />
        </Secao>
      )}

      {aba === 'historico' && (
        <>
          <Secao id="historico-dia" titulo={doDia} acao={seletorDia} erro={erroHistorico}>
            <HistoricoDia dia={dia} carregando={carregandoDia} />
          </Secao>
          <TabelaDias dias={dias} carregando={carregandoDias} selecionado={data} onSelecionar={setData} />
        </>
      )}
    </Box>
  );
}
