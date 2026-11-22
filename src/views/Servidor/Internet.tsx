import { useCallback, useState, type ReactNode } from 'react';
import { Alert, Box, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import RouterOutlinedIcon from '@mui/icons-material/RouterOutlined';
import { KpiCard } from '../../components/ui/KpiCard';
import { SectionCard } from '../../components/ui/SectionCard';
import { StatusPill } from '../../components/ui/StatusPill';
import { EmptyState } from '../../components/ui/EmptyState';
import { colors } from '../../styles/colors';
import type { Tone } from '../../styles/tokens';
import { servidorService } from '../../services/servidor';
import type {
  EventoServidor,
  InternetAgora,
  InternetDia,
  PingAlvo,
  ServidorHost,
  TesteVelocidade,
} from '../../types/servidor';
import { Grafico } from './HistoricoDia';
import { Item, ListaEventos, Subtitulo, Vpn } from './Host';
import { bytes, dataHora, diasAtras, isoLocal, minutosLegivel, ms, pct, relativo } from './formatos';
import { useAtualizarAoPedir, useRepetir } from './useRepetir';
import { Secao } from './Secao';

const ATUALIZAR_AGORA_MS = 60_000;
const ATUALIZAR_HISTORICO_MS = 5 * 60_000;
const DIAS_DE_VELOCIDADE = 30;

const grade4 = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
  gap: { xs: 2, md: 2.5 },
} as const;

const grade3 = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
  gap: { xs: 2, md: 2.5 },
} as const;

const doisPorLinha = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
  gap: { xs: 2, md: 2.5 },
} as const;

const coluna = { display: 'flex', flexDirection: 'column', gap: 1 } as const;

// ---- limites (ms e %) ----

/** Ping: até o roteador/modem é rede local (passa de 10 ms = Wi-Fi/cabo ruim); até a internet, 80 ms já pesa. */
function tomPing(p: PingAlvo | undefined): Tone {
  if (!p || p.mediaMs === null) return 'error';
  const local = p.id === 'roteador' || p.id === 'modem';
  if (p.perdaPct >= 10) return 'error';
  if (p.perdaPct > 0) return 'warning';
  if (p.mediaMs > (local ? 10 : 80)) return 'warning';
  return 'success';
}

function tomDns(ok: boolean, tempo: number | null): Tone {
  if (!ok) return 'error';
  if ((tempo ?? 0) > 300) return 'warning';
  return 'success';
}

function mbps(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  return `${v.toLocaleString('pt-BR', { maximumFractionDigits: v < 10 ? 1 : 0 })} Mbit/s`;
}

const numeroBR = (v: number | null | undefined) => (v === null || v === undefined ? '—' : v.toLocaleString('pt-BR'));
const msEixo = (v: number) => `${v}ms`;
const pctEixo = (v: number) => `${v}%`;
const mbpsEixo = (v: number) => `${v}`;

// ---- agora ----

function Kpis({ i, carregando }: Readonly<{ i: InternetAgora | null; carregando: boolean }>) {
  const semDados = !i && carregando;
  const cf = i?.ping.find((p) => p.id === 'cloudflare');
  const google = i?.ping.find((p) => p.id === 'google');
  const pihole = i?.dns.find((d) => d.id === 'pihole');
  const outrosDns = i?.dns.filter((d) => d.id !== 'pihole') ?? [];
  const v = i?.velocidade;
  const perda = Math.min(cf?.perdaPct ?? 100, google?.perdaPct ?? 100);
  return (
    <Box sx={grade4}>
      <KpiCard
        label="Internet"
        icon={<PublicOutlinedIcon />}
        loading={semDados}
        tone={!i ? 'neutral' : !i.online ? 'error' : tomPing(cf)}
        value={!i ? '—' : i.online ? ms(cf?.mediaMs) : 'fora do ar'}
        footer={
          i?.online
            ? `ping Cloudflare · jitter ${ms(cf?.jitterMs)} · perda ${pct(perda, 0)}`
            : i
              ? 'sem resposta da Cloudflare nem do Google'
              : undefined
        }
      />
      <KpiCard
        label="Velocidade"
        icon={<SpeedOutlinedIcon />}
        loading={semDados}
        tone={!v ? 'neutral' : v.ok ? 'success' : 'error'}
        value={
          v?.ok ? (
            <>
              {Math.round(v.downloadMbps ?? 0)} ↓{' '}
              <Box component="span" sx={{ color: 'text.secondary' }}>
                / {Math.round(v.uploadMbps ?? 0)} ↑
              </Box>{' '}
              <Box component="span" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                Mbit/s
              </Box>
            </>
          ) : v ? (
            'falhou'
          ) : (
            'sem teste'
          )
        }
        footer={
          v
            ? `teste ${relativo(v.testadoEm)} · latência ${ms(v.latenciaMs)}${
                v.latenciaCargaMs !== null ? ` (com carga ${ms(v.latenciaCargaMs)})` : ''
              }`
            : 'roda a cada 4 horas'
        }
      />
      <KpiCard
        label="DNS (Pi-hole)"
        icon={<DnsOutlinedIcon />}
        loading={semDados}
        tone={pihole ? tomDns(pihole.ok, pihole.tempoMs) : 'neutral'}
        value={!pihole ? '—' : pihole.ok ? ms(pihole.tempoMs) : 'falhando'}
        footer={outrosDns.map((d) => `${d.nome} ${d.ok ? ms(d.tempoMs) : 'falhou'}`).join(' · ') || undefined}
      />
      <KpiCard
        label="IP público"
        icon={<RouterOutlinedIcon />}
        loading={semDados}
        tone={i?.publico?.ip ? 'brand' : 'neutral'}
        value={
          <Box component="span" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {i?.publico?.ip ?? '—'}
          </Box>
        }
        footer={
          i?.publico
            ? [i.publico.provedor, i.publico.asn ? `AS${i.publico.asn}` : null, i.publico.cidade]
                .filter(Boolean)
                .join(' · ')
            : undefined
        }
      />
    </Box>
  );
}

function Pings({ i }: Readonly<{ i: InternetAgora }>) {
  return (
    <SectionCard
      title="Ping"
      subtitle="10 pacotes por alvo a cada minuto · do mais perto (roteador) ao mais longe"
      padding="flush"
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ pl: 3 }}>Alvo</TableCell>
            <TableCell align="right">Média</TableCell>
            <TableCell align="right">Jitter</TableCell>
            <TableCell align="right" sx={{ pr: 3 }}>
              Perda
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {i.ping.map((p) => (
            <TableRow key={p.id}>
              <TableCell sx={{ pl: 3 }}>
                <Box sx={{ fontWeight: 500 }}>{p.nome}</Box>
                <Typography variant="caption" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {p.alvo}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <StatusPill size="sm" tone={tomPing(p)}>
                  {p.mediaMs === null ? 'sem resposta' : ms(p.mediaMs)}
                </StatusPill>
              </TableCell>
              <TableCell align="right" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {ms(p.jitterMs)}
              </TableCell>
              <TableCell align="right" sx={{ pr: 3, fontVariantNumeric: 'tabular-nums' }}>
                {pct(p.perdaPct, 0)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Typography variant="caption" component="p" sx={{ px: 3, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
        Lento só a partir do modem = problema na operadora. Roteador lento ou perdendo = rede da casa.
      </Typography>
    </SectionCard>
  );
}

function Dns({ i }: Readonly<{ i: InternetAgora }>) {
  const p = i.pihole;
  return (
    <SectionCard title="DNS e Pi-hole" subtitle="Tempo para resolver google.com e o Pi-hole nas últimas 24 h">
      <Box sx={coluna}>
        {i.dns.map((d) => (
          <Item
            key={d.id}
            rotulo={`${d.nome} (${d.servidor})`}
            valor={d.ok ? ms(d.tempoMs) : 'falhou'}
            tom={tomDns(d.ok, d.tempoMs)}
          />
        ))}
        {p && !p.ok && <Alert severity="warning">Pi-hole sem resposta: {p.erro}</Alert>}
        {p?.ok && (
          <>
            <Subtitulo>Pi-hole</Subtitulo>
            <Item
              rotulo="Bloqueio de anúncios"
              valor={p.bloqueio === 'enabled' ? 'ligado' : (p.bloqueio ?? '—')}
              tom={p.bloqueio === 'enabled' ? 'success' : 'warning'}
            />
            <Item rotulo="Consultas (24 h)" valor={numeroBR(p.consultas24h)} />
            <Item rotulo="Bloqueadas" valor={`${numeroBR(p.bloqueadas24h)} (${pct(p.bloqueadasPct)})`} />
            <Item
              rotulo="Respondidas do cache · encaminhadas"
              valor={`${numeroBR(p.doCache24h)} · ${numeroBR(p.encaminhadas24h)}`}
            />
            <Item rotulo="Aparelhos usando agora" valor={numeroBR(p.clientesAtivos)} />
            <Item rotulo="Domínios na lista de bloqueio" valor={numeroBR(p.dominiosNaLista)} />
            {(p.upstreams?.length ?? 0) > 0 && <Subtitulo>Servidores que o Pi-hole consulta</Subtitulo>}
            {p.upstreams?.map((u) => (
              <Item
                key={`${u.ip}:${u.porta}`}
                rotulo={`${u.nome} · ${numeroBR(u.consultas)} consultas`}
                valor={ms(u.tempoMs)}
                tom={(u.tempoMs ?? 0) > 300 ? 'warning' : undefined}
              />
            ))}
          </>
        )}
      </Box>
    </SectionCard>
  );
}

function Conexao({ i }: Readonly<{ i: InternetAgora }>) {
  const pub = i.publico;
  const nic = i.interface;
  return (
    <SectionCard title="Conexão" subtitle="Endereço na internet, operadora e a placa de rede do servidor">
      <Box sx={coluna}>
        <Item rotulo="IP público (IPv4)" valor={pub?.ip ?? '—'} />
        <Item
          rotulo="IPv6"
          valor={pub?.ipv6 ?? (nic?.ipv6Global ? 'sem acesso' : 'não disponível')}
          tom={pub?.ipv6 ? 'success' : 'neutral'}
          dica="O roteador não entrega IPv6 para a rede da casa"
        />
        <Item rotulo="Operadora" valor={pub?.provedor ? `${pub.provedor}${pub.asn ? ` (AS${pub.asn})` : ''}` : '—'} />
        <Item rotulo="Localização do IP" valor={[pub?.cidade, pub?.regiao].filter(Boolean).join(', ') || '—'} />
        <Item rotulo="Servidor Cloudflare mais próximo" valor={pub?.servidorCloudflare ?? '—'} />
        <Item
          rotulo="IP verificado"
          valor={relativo(pub?.verificadoEm)}
          tom={pub?.erro ? 'warning' : undefined}
          dica={pub?.erro ?? 'Consultado a cada 15 minutos'}
        />
        {nic && (
          <>
            <Subtitulo>Placa de rede ({nic.nome})</Subtitulo>
            <Item
              rotulo="Link"
              valor={
                nic.velocidadeMbps ? `${nic.velocidadeMbps.toLocaleString('pt-BR')} Mbit/s ${nic.duplex ?? ''}` : '—'
              }
              tom={nic.estado === 'up' ? ((nic.velocidadeMbps ?? 0) < 1000 ? 'warning' : 'success') : 'error'}
              dica="Abaixo de 1000 Mbit/s o cabo ou a porta limitam a velocidade"
            />
            <Item rotulo="IP na rede da casa" valor={nic.ipLocal ?? '—'} />
            <Item rotulo="Roteador" valor={nic.gateway ?? '—'} />
            <Item
              rotulo="Recebido · enviado (desde o boot)"
              valor={`${bytes(nic.recebidos)} · ${bytes(nic.enviados)}`}
            />
            <Item
              rotulo="Erros · pacotes descartados"
              valor={`${numeroBR(nic.erros)} · ${numeroBR(nic.descartados)}`}
              tom={nic.erros > 0 ? 'warning' : undefined}
            />
          </>
        )}
      </Box>
    </SectionCard>
  );
}

// ---- histórico ----

function Total({ rotulo, valor }: Readonly<{ rotulo: string; valor: ReactNode }>) {
  return (
    <Box>
      <Typography variant="caption" component="p">
        {rotulo}
      </Typography>
      <Box sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{valor}</Box>
    </Box>
  );
}

function ResumoDia({ dia }: Readonly<{ dia: InternetDia }>) {
  const r = dia.resumo;
  const nenhum = (min: number) => (min === 0 ? 'nenhum minuto' : minutosLegivel(min));
  return (
    <SectionCard title="Resumo do dia" subtitle={`${r.amostras.toLocaleString('pt-BR')} medições de 1 minuto`}>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5, fontSize: '0.8125rem' }}>
        <Total
          rotulo="Internet fora"
          valor={
            <StatusPill size="sm" tone={r.minutosOffline === 0 ? 'success' : 'error'}>
              {nenhum(r.minutosOffline)}
            </StatusPill>
          }
        />
        <Total
          rotulo="Minutos com perda de pacotes"
          valor={
            <StatusPill size="sm" tone={r.minutosComPerda === 0 ? 'success' : 'warning'}>
              {nenhum(r.minutosComPerda)}
            </StatusPill>
          }
        />
        <Total
          rotulo="Ping Cloudflare mín · média · pico"
          valor={`${ms(r.ping.min)} · ${ms(r.ping.media)} · ${ms(r.ping.max)}`}
        />
        <Total rotulo="Jitter médio · perda média" valor={`${ms(r.jitterMedio)} · ${pct(r.perdaMedia)}`} />
        <Total rotulo="Roteador · modem (média)" valor={`${ms(r.roteadorMedio)} · ${ms(r.modemMedio)}`} />
        <Total rotulo="Google (média)" valor={ms(r.googleMedio)} />
        <Total
          rotulo="DNS Pi-hole · Cloudflare (média)"
          valor={`${ms(r.dnsPiholeMedio)} · ${ms(r.dnsCloudflareMedio)}`}
        />
        <Total rotulo="Pi-hole falhando" valor={nenhum(r.minutosDnsFalhando)} />
        <Total
          rotulo={`Download ${r.testes > 0 ? `(${r.testes} teste${r.testes > 1 ? 's' : ''})` : ''} mín · média · máx`}
          valor={r.testes > 0 ? `${mbps(r.download.min)} · ${mbps(r.download.media)} · ${mbps(r.download.max)}` : '—'}
        />
        <Total
          rotulo="Upload mín · média · máx"
          valor={r.testes > 0 ? `${mbps(r.upload.min)} · ${mbps(r.upload.media)} · ${mbps(r.upload.max)}` : '—'}
        />
        <Total
          rotulo="IPs públicos no dia"
          valor={r.ipsPublicos > 1 ? `${r.ipsPublicos} (o IP mudou)` : String(r.ipsPublicos)}
        />
      </Box>
    </SectionCard>
  );
}

function Graficos({ dia }: Readonly<{ dia: InternetDia }>) {
  const s = colors.chart.series;
  return (
    <Box sx={doisPorLinha}>
      <Grafico
        titulo="Ping"
        subtitulo="Média a cada 5 minutos · roteador e modem são a rede da casa"
        pontos={dia.serie}
        formatar={(v) => ms(v)}
        formatarEixo={msEixo}
        series={[
          { chave: 'roteadorMs', nome: 'Roteador', cor: s[2] },
          { chave: 'modemMs', nome: 'Modem', cor: s[6] },
          { chave: 'cloudflareMs', nome: 'Cloudflare', cor: s[0] },
          { chave: 'cloudflareMaxMs', nome: 'Cloudflare (pior)', cor: s[1], tracejada: true },
          { chave: 'googleMs', nome: 'Google', cor: s[4] },
        ]}
      />
      <Grafico
        titulo="Perda de pacotes e quedas"
        subtitulo="% de pacotes perdidos até a internet · % do tempo fora do ar"
        pontos={dia.serie}
        dominio={[0, 'auto']}
        formatar={(v) => pct(v)}
        formatarEixo={pctEixo}
        series={[
          { chave: 'perdaPct', nome: 'Perda', cor: s[3] },
          { chave: 'offlinePct', nome: 'Fora do ar', cor: s[5] },
        ]}
      />
      <Grafico
        titulo="Jitter"
        subtitulo="Variação do ping até a Cloudflare · acima de 30 ms atrapalha chamadas de vídeo e jogos"
        pontos={dia.serie}
        limite={30}
        formatar={(v) => ms(v)}
        formatarEixo={msEixo}
        series={[{ chave: 'jitterMs', nome: 'Jitter', cor: s[7] }]}
      />
      <Grafico
        titulo="DNS"
        subtitulo="Tempo para resolver um nome · Pi-hole (com cache) e direto nos servidores públicos"
        pontos={dia.serie}
        formatar={(v) => ms(v)}
        formatarEixo={msEixo}
        series={[
          { chave: 'dnsPiholeMs', nome: 'Pi-hole', cor: s[0] },
          { chave: 'dnsCloudflareMs', nome: 'Cloudflare', cor: s[2] },
          { chave: 'dnsGoogleMs', nome: 'Google', cor: s[4] },
        ]}
      />
    </Box>
  );
}

function rotuloTeste(iso: string): string {
  return dataHora(iso);
}

function Velocidade({ testes, carregando }: Readonly<{ testes: TesteVelocidade[]; carregando: boolean }>) {
  if (carregando && testes.length === 0) return <Skeleton variant="rounded" height={280} />;
  const s = colors.chart.series;
  const ok = testes.filter((t) => t.ok);
  const pontos = ok.map((t) => ({
    horario: rotuloTeste(t.testadoEm),
    download: t.downloadMbps,
    upload: t.uploadMbps,
    latencia: t.latenciaMs,
    latenciaCarga: t.latenciaCargaMs,
  }));
  const recentes = [...testes].reverse().slice(0, 12);
  return (
    <Box sx={doisPorLinha}>
      {pontos.length > 0 ? (
        <Grafico
          titulo="Velocidade"
          subtitulo={`Testes dos últimos ${DIAS_DE_VELOCIDADE} dias (a cada 4 horas) · Mbit/s`}
          pontos={pontos}
          dominio={[0, 'auto']}
          formatar={mbps}
          formatarEixo={mbpsEixo}
          comPontos
          series={[
            { chave: 'download', nome: 'Download', cor: s[0] },
            { chave: 'upload', nome: 'Upload', cor: s[4] },
          ]}
        />
      ) : (
        <SectionCard title="Velocidade">
          <EmptyState message="Nenhum teste de velocidade ainda. Ele roda a cada 4 horas." />
        </SectionCard>
      )}
      <SectionCard
        title="Últimos testes"
        subtitle="Latência com carga muito acima da normal = bufferbloat (a rede trava quando alguém baixa algo)"
        padding="flush"
      >
        {recentes.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <EmptyState message="Nenhum teste ainda." compact />
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: 3 }}>Quando</TableCell>
                  <TableCell align="right">Download</TableCell>
                  <TableCell align="right">Upload</TableCell>
                  <TableCell align="right" sx={{ pr: 3 }}>
                    Latência · com carga
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentes.map((t) => (
                  <TableRow key={t.testadoEm}>
                    <TableCell sx={{ pl: 3, whiteSpace: 'nowrap' }}>{dataHora(t.testadoEm)}</TableCell>
                    {t.ok ? (
                      <>
                        <TableCell align="right" sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {mbps(t.downloadMbps)}
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                          {mbps(t.uploadMbps)}
                        </TableCell>
                        <TableCell align="right" sx={{ pr: 3, whiteSpace: 'nowrap' }}>
                          {ms(t.latenciaMs)} · {ms(t.latenciaCargaMs)}
                        </TableCell>
                      </>
                    ) : (
                      <TableCell colSpan={3} align="right" sx={{ pr: 3 }}>
                        <StatusPill size="sm" tone="error" title={t.erro ?? undefined}>
                          falhou
                        </StatusPill>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </SectionCard>
    </Box>
  );
}

// ---- aba ----

interface InternetProps {
  data: string;
  /** seletor de dia, mostrado no título do histórico */
  seletorDia: ReactNode;
  tituloDia: string;
  host: ServidorHost | null;
  eventos: EventoServidor[];
  /** Muda quando o botão "Atualizar agora" do cabeçalho é apertado. */
  pedidoAtualizar: number;
}

export function Internet({ data, seletorDia, tituloDia, host, eventos, pedidoAtualizar }: Readonly<InternetProps>) {
  const [agora, setAgora] = useState<InternetAgora | null>(null);
  const [carregandoAgora, setCarregandoAgora] = useState(true);
  const [erroAgora, setErroAgora] = useState<string | null>(null);
  const [dia, setDia] = useState<InternetDia | null>(null);
  const [carregandoDia, setCarregandoDia] = useState(true);
  const [erroDia, setErroDia] = useState<string | null>(null);
  const [testes, setTestes] = useState<TesteVelocidade[]>([]);
  const [carregandoTestes, setCarregandoTestes] = useState(true);
  const [erroTestes, setErroTestes] = useState<string | null>(null);

  const lerAgora = useCallback(() => {
    servidorService
      .internet()
      .then((i) => {
        setAgora(i);
        setErroAgora(null);
      })
      .catch((e: Error) => setErroAgora(e.message))
      .finally(() => setCarregandoAgora(false));
  }, []);

  const lerDia = useCallback(() => {
    setCarregandoDia(true);
    servidorService
      .internetDia(data)
      .then((d) => {
        setDia(d);
        setErroDia(null);
      })
      .catch((e: Error) => {
        setDia(null);
        setErroDia(e.message);
      })
      .finally(() => setCarregandoDia(false));
  }, [data]);

  const lerTestes = useCallback(() => {
    servidorService
      .velocidade(diasAtras(DIAS_DE_VELOCIDADE - 1), isoLocal(new Date()))
      .then((t) => {
        setTestes(t);
        setErroTestes(null);
      })
      .catch((e: Error) => setErroTestes(e.message))
      .finally(() => setCarregandoTestes(false));
  }, []);

  useRepetir(lerAgora, ATUALIZAR_AGORA_MS);
  useRepetir(lerDia, ATUALIZAR_HISTORICO_MS);
  useRepetir(lerTestes, ATUALIZAR_HISTORICO_MS);
  useAtualizarAoPedir(pedidoAtualizar, lerAgora, lerDia, lerTestes);

  const eventosInternet = eventos.filter((e) => e.tipo === 'internet' || e.tipo === 'tailscale');
  const info = agora
    ? `Medido às ${dataHora(agora.lidoEm).slice(-5)} · atualiza a cada minuto`
    : 'Atualiza a cada minuto';

  return (
    <>
      <Secao id="internet-agora" titulo="Agora" info={info} erro={erroAgora}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 2.5 } }}>
          {agora?.desatualizado && (
            <Alert severity="warning">
              A medição não é atualizada desde {dataHora(agora.lidoEm)}. Verifique: systemctl status
              casa-monitor-internet.timer
            </Alert>
          )}
          <Kpis i={agora} carregando={carregandoAgora} />
          {agora ? (
            <Box sx={grade3}>
              <Pings i={agora} />
              <Dns i={agora} />
              <Conexao i={agora} />
            </Box>
          ) : (
            carregandoAgora && <Skeleton variant="rounded" height={320} />
          )}
        </Box>
      </Secao>

      <Secao
        id="internet-velocidade"
        titulo="Velocidade"
        info="Teste pela Cloudflare (speed.cloudflare.com) · ~250 MB por teste"
        erro={erroTestes}
      >
        <Velocidade testes={testes} carregando={carregandoTestes} />
      </Secao>

      <Secao id="internet-dia" titulo={tituloDia} acao={seletorDia} erro={erroDia}>
        {carregandoDia && !dia ? (
          <Skeleton variant="rounded" height={320} />
        ) : !dia || dia.resumo.amostras === 0 ? (
          <SectionCard title="Internet no dia">
            <EmptyState message="Nenhuma medição neste dia (a coleta da internet começou em 21/11/2026)." />
          </SectionCard>
        ) : (
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 2.5 }, opacity: carregandoDia ? 0.6 : 1 }}
          >
            <Box sx={doisPorLinha}>
              <ResumoDia dia={dia} />
              <SectionCard title="Eventos" subtitle="Últimos 7 dias: quedas, perda de pacotes, IP, velocidade e VPN">
                <ListaEventos eventos={eventosInternet} vazio="Nenhum evento de internet nos últimos 7 dias." />
              </SectionCard>
            </Box>
            <Graficos dia={dia} />
          </Box>
        )}
      </Secao>

      {host && (
        <Secao id="internet-vpn" titulo="VPN">
          <Vpn h={host} />
        </Secao>
      )}
    </>
  );
}
