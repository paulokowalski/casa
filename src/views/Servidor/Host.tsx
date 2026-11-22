import type { ReactNode } from 'react';
import { Alert, Box, Skeleton, Typography } from '@mui/material';
import { SectionCard } from '../../components/ui/SectionCard';
import { StatusPill } from '../../components/ui/StatusPill';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Tone } from '../../styles/tokens';
import type { AparelhoTailscale, EventoServidor, NivelEvento, ServidorHost, UnidadeHost } from '../../types/servidor';
import { bytes, dataHora, pct, relativo, tomIdadeBackup, tomUso } from './formatos';

const grade = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
  gap: { xs: 2, md: 2.5 },
} as const;

const coluna = { display: 'flex', flexDirection: 'column', gap: 1 } as const;

const TOM_NIVEL: Record<NivelEvento, Tone> = {
  info: 'info',
  sucesso: 'success',
  atencao: 'warning',
  erro: 'error',
};

const ROTULO_TIPO: Record<string, string> = {
  ssh: 'SSH',
  backup: 'Backup',
  alerta: 'Alerta',
  servico: 'Serviço',
  disco: 'Disco',
  container: 'Container',
  internet: 'Internet',
  tailscale: 'Tailscale',
  reboot: 'Atualização',
  kernel: 'Kernel',
  boot: 'Boot',
};

/** Linha rótulo · valor, com o valor opcionalmente numa pílula colorida. */
export function Item({
  rotulo,
  valor,
  tom,
  dica,
}: Readonly<{ rotulo: ReactNode; valor: ReactNode; tom?: Tone; dica?: string }>) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, fontSize: '0.8125rem' }}>
      <Box component="span" sx={{ color: 'text.secondary', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {rotulo}
      </Box>
      <Box
        component="span"
        sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}
        title={dica}
      >
        {tom ? (
          <StatusPill size="sm" tone={tom} title={dica}>
            {valor}
          </StatusPill>
        ) : (
          valor
        )}
      </Box>
    </Box>
  );
}

export function Subtitulo({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Typography variant="caption" component="p" sx={{ mt: 0.5, fontWeight: 600 }}>
      {children}
    </Typography>
  );
}

function horas(seg: number | null): string {
  if (seg === null) return 'sem cópia';
  const h = seg / 3600;
  return h < 1 ? `${Math.round(seg / 60)} min` : `${h.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} h`;
}

function Backup({ h }: Readonly<{ h: ServidorHost }>) {
  const ult = h.backup.ultimaExecucao;
  const duracao =
    ult.inicio && ult.fim ? Math.round((new Date(ult.fim).getTime() - new Date(ult.inicio).getTime()) / 60000) : null;
  return (
    <SectionCard title="Backup" subtitle="Idade do último snapshot em cada cópia (roda 1x por dia)">
      <Box sx={coluna}>
        {h.backup.repositorios.map((r) => (
          <Item
            key={r.nome}
            rotulo={`${r.nome}${r.montado === false ? ' (desmontado)' : ''}`}
            valor={`${horas(r.idadeSegundos)}${r.snapshots !== null ? ` · ${r.snapshots} snapshots` : ''}`}
            tom={r.montado === false ? 'error' : tomIdadeBackup(r.idadeSegundos)}
            dica={r.ultimoSnapshot ? `Último: ${dataHora(r.ultimoSnapshot)}` : undefined}
          />
        ))}
        <Subtitulo>Última execução</Subtitulo>
        <Item
          rotulo={ult.rodandoAgora ? 'Rodando agora' : dataHora(ult.fim)}
          valor={ult.rodandoAgora ? 'em andamento' : ult.sucesso ? 'sem falhas' : `${ult.falhas ?? '?'} falha(s)`}
          tom={ult.rodandoAgora ? 'info' : ult.sucesso ? 'success' : 'error'}
          dica={duracao !== null ? `Durou ${duracao} min` : undefined}
        />
        <Item
          rotulo="Próxima"
          valor={`${dataHora(h.backup.proximaExecucao)} (${relativo(h.backup.proximaExecucao)})`}
        />
      </Box>
    </SectionCard>
  );
}

function Alertas({ h }: Readonly<{ h: ServidorHost }>) {
  const { alertados, pendentes, verificadoEm } = h.alertas;
  return (
    <SectionCard
      title="Alertas do monitor"
      subtitle={`Os mesmos do Telegram · verificado ${relativo(verificadoEm)} (a cada 15 min)`}
    >
      {alertados.length === 0 && pendentes.length === 0 ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StatusPill tone="success">Nenhum problema</StatusPill>
          <Typography variant="caption">containers, serviços, discos, sites, DNS, temperatura e backup ok</Typography>
        </Box>
      ) : (
        <Box sx={coluna}>
          {alertados.map((a) => (
            <Alert key={a} severity="error" sx={{ py: 0 }}>
              {a}
            </Alert>
          ))}
          {pendentes.map((a) => (
            <Alert key={a} severity="warning" sx={{ py: 0 }}>
              {a} <em>(aguardando confirmação)</em>
            </Alert>
          ))}
        </Box>
      )}
    </SectionCard>
  );
}

/** Handshake WireGuard com o servidor mais novo que isso = aparelho trocando tráfego com ele agora. */
const ACESSO_RECENTE_MS = 3 * 60 * 1000;

function acessandoAgora(a: AparelhoTailscale): boolean {
  if (!a.ultimoHandshake) return false;
  return Date.now() - new Date(a.ultimoHandshake).getTime() < ACESSO_RECENTE_MS;
}

/** Acessando agora primeiro, depois online, depois offline (o visto mais recentemente antes). */
function ordemAparelho(a: AparelhoTailscale): number {
  if (acessandoAgora(a)) return 0;
  return a.online ? 1 : 2;
}

function AparelhosVpn({ aparelhos, eu }: Readonly<{ aparelhos: AparelhoTailscale[]; eu?: string | null }>) {
  if (aparelhos.length === 0) return null;
  const lista = [...aparelhos].sort(
    (a, b) =>
      ordemAparelho(a) - ordemAparelho(b) ||
      (b.ultimoVisto ?? '').localeCompare(a.ultimoVisto ?? '') ||
      a.nome.localeCompare(b.nome),
  );
  return (
    <>
      <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
        Aparelhos na VPN
      </Typography>
      {lista.map((a) => {
        const acessando = acessandoAgora(a);
        const outroDono = a.dono && a.dono !== eu ? ` · ${a.dono}` : '';
        let valor: string;
        let tom: Tone;
        if (acessando) {
          valor = 'acessando agora';
          tom = 'info';
        } else if (a.online) {
          valor = a.ultimoHandshake ? `online · acessou ${relativo(a.ultimoHandshake)}` : 'online';
          tom = 'success';
        } else {
          valor = a.ultimoVisto ? `offline · visto ${relativo(a.ultimoVisto)}` : 'offline';
          tom = 'neutral';
        }
        return (
          <Item
            key={a.id}
            rotulo={`${a.nome} · ${a.so}${outroDono}`}
            valor={valor}
            tom={tom}
            dica={`${a.ip} · trocados com o servidor desde a última conexão: ${bytes(a.recebidos + a.enviados)}`}
          />
        );
      })}
    </>
  );
}

/** Tailscale: estado deste servidor na tailnet e os aparelhos que acessam por ela. */
export function Vpn({ h }: Readonly<{ h: ServidorHost }>) {
  const t = h.rede.tailscale;
  return (
    <SectionCard title="VPN (Tailscale)" subtitle="Acesso de fora de casa a este servidor">
      <Box sx={coluna}>
        {t ? (
          <Item
            rotulo={`Este servidor (${t.ip})`}
            valor={t.online ? `online · ${t.paresOnline}/${t.pares} aparelhos` : t.estado}
            tom={t.online ? 'success' : 'error'}
          />
        ) : (
          <Item rotulo="Tailscale" valor="sem leitura" tom="neutral" />
        )}
        {t?.aparelhos && <AparelhosVpn aparelhos={t.aparelhos} eu={t.usuario} />}
      </Box>
    </SectionCard>
  );
}

function nomeUnidade(u: UnidadeHost): string {
  return u.unidade.replace(/\.service$/, '');
}

function Servicos({ h }: Readonly<{ h: ServidorHost }>) {
  const instalados = h.servicos.filter((s) => s.instalado);
  const comTimer = instalados.filter((s) => s.timerAtivo !== null);
  const daemons = instalados.filter((s) => s.timerAtivo === null);
  const tom = (s: UnidadeHost): Tone =>
    !s.ok || s.timerAtivo === false ? 'error' : s.reinicios > 0 ? 'warning' : 'success';
  return (
    <SectionCard
      title="Serviços e tarefas"
      subtitle={
        h.unidadesFalhas.length > 0
          ? `Unidades com falha no systemd: ${h.unidadesFalhas.join(', ')}`
          : 'Nenhuma unidade com falha no systemd'
      }
    >
      <Box sx={coluna}>
        <Subtitulo>Tarefas agendadas</Subtitulo>
        {comTimer.map((s) => (
          <Item
            key={s.unidade}
            rotulo={nomeUnidade(s)}
            valor={
              s.timerAtivo === false
                ? 'timer parado'
                : !s.ok
                  ? `falhou (${s.resultado})`
                  : `${relativo(s.ultimaExecucao)} · próx. ${relativo(s.proximaExecucao)}`
            }
            tom={tom(s)}
            dica={`Última: ${dataHora(s.ultimaExecucao)} · próxima: ${dataHora(s.proximaExecucao)}`}
          />
        ))}
        <Subtitulo>Serviços</Subtitulo>
        {daemons.map((s) => (
          <Item
            key={s.unidade}
            rotulo={nomeUnidade(s)}
            valor={s.ok ? (s.reinicios > 0 ? `rodando · ${s.reinicios} reinício(s)` : 'rodando') : s.estado}
            tom={tom(s)}
          />
        ))}
      </Box>
    </SectionCard>
  );
}

function Montagens({ h }: Readonly<{ h: ServidorHost }>) {
  const inodes = new Map((h.inodes ?? []).map((i) => [i.ponto, i]));
  return (
    <SectionCard
      title="Discos montados"
      subtitle={`Remontagem automática a cada 2 min · última ação ${relativo(h.montagens.ultimaRemontagemAutomatica)}`}
    >
      <Box sx={coluna}>
        {h.montagens.discos.map((d) => {
          const i = inodes.get(d.ponto);
          return (
            <Box key={d.ponto} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Item
                rotulo={`${d.ponto}${d.dispositivo ? ` · ${d.dispositivo.replace('/dev/', '')}` : ''}`}
                valor={!d.montado ? 'desmontado' : d.somenteLeitura ? 'só leitura' : `inodes ${pct(i?.pct, 0)}`}
                tom={!d.montado || d.somenteLeitura ? 'error' : tomUso(i?.pct)}
                dica={
                  i ? `${i.usados.toLocaleString('pt-BR')} de ${i.total.toLocaleString('pt-BR')} inodes` : undefined
                }
              />
            </Box>
          );
        })}
        {inodes.get('/') && (
          <Item
            rotulo="/ (eMMC, sistema)"
            valor={`inodes ${pct(inodes.get('/')?.pct, 0)}`}
            tom={tomUso(inodes.get('/')?.pct)}
          />
        )}
      </Box>
    </SectionCard>
  );
}

function Atualizacoes({ h }: Readonly<{ h: ServidorHost }>) {
  const a = h.atualizacoes;
  return (
    <SectionCard title="Atualizações" subtitle="Pacotes do sistema (segurança instala sozinho) e imagens novas (Diun)">
      <Box sx={coluna}>
        <Item
          rotulo="Reinício necessário"
          valor={a.reinicioNecessario ? `sim${a.reinicioPor.length ? ` (${a.reinicioPor.join(', ')})` : ''}` : 'não'}
          tom={a.reinicioNecessario ? 'warning' : 'success'}
        />
        <Item
          rotulo="Pacotes pendentes"
          valor={
            a.pacotesSeguranca > 0 ? `${a.pacotesPendentes} (${a.pacotesSeguranca} de segurança)` : a.pacotesPendentes
          }
          tom={a.pacotesSeguranca > 0 ? 'error' : a.pacotesPendentes > 0 ? 'info' : 'success'}
          dica={a.pacotes.map((p) => `${p.pacote} ${p.versao}`).join('\n') || undefined}
        />
        {a.pacotes.length > 0 && (
          <Typography variant="caption" component="p" sx={{ wordBreak: 'break-word' }}>
            {a.pacotes.map((p) => p.pacote).join(', ')}
          </Typography>
        )}
        <Item
          rotulo="Imagens Docker novas (7 dias)"
          valor={a.imagensNovas7d.length}
          tom={a.imagensNovas7d.length > 0 ? 'info' : 'success'}
        />
        {a.imagensNovas7d.length > 0 && (
          <Typography variant="caption" component="p" sx={{ wordBreak: 'break-word' }}>
            {a.imagensNovas7d.map((i) => i.replace(/^docker\.io\/(library\/)?/, '')).join(', ')}
          </Typography>
        )}
      </Box>
    </SectionCard>
  );
}

const TIPO_DOCKER: Record<string, string> = {
  Images: 'Imagens',
  Containers: 'Containers',
  'Local Volumes': 'Volumes',
  'Build Cache': 'Cache de build',
};

function Docker({ h }: Readonly<{ h: ServidorHost }>) {
  const reiniciaram = (h.docker?.containers ?? []).filter((c) => c.reinicios > 0 || c.oomKilled);
  const espaco = h.docker?.espaco ?? [];
  const recuperavel = espaco.reduce((a, e) => a + e.recuperavel, 0);
  return (
    <SectionCard
      title="Docker"
      subtitle={`Espaço usado · ${bytes(recuperavel)} podem ser liberados (docker system prune)`}
    >
      <Box sx={coluna}>
        {espaco.map((e) => (
          <Item
            key={e.tipo}
            rotulo={`${TIPO_DOCKER[e.tipo] ?? e.tipo} (${e.ativos}/${e.total} em uso)`}
            valor={`${bytes(e.tamanho)}${e.recuperavel > 0 ? ` · ${bytes(e.recuperavel)} livráveis` : ''}`}
          />
        ))}
        <Subtitulo>Reinícios sozinhos</Subtitulo>
        {reiniciaram.length === 0 ? (
          <Item rotulo="Nenhum container reiniciou sozinho" valor="ok" tom="success" />
        ) : (
          reiniciaram.map((c) => (
            <Item
              key={c.nome}
              rotulo={c.nome}
              valor={`${c.reinicios} reinício(s)${c.oomKilled ? ' · sem memória (OOM)' : ''}`}
              tom={c.oomKilled ? 'error' : 'warning'}
              dica={`Iniciado ${dataHora(c.iniciadoEm)}`}
            />
          ))
        )}
      </Box>
    </SectionCard>
  );
}

function Kernel({ h }: Readonly<{ h: ServidorHost }>) {
  return (
    <SectionCard title="Kernel" subtitle="Erros de disco, USB e falta de memória nas últimas 24 h">
      <Box sx={coluna}>
        <Item
          rotulo="Ocorrências"
          valor={h.kernel.eventos24h}
          tom={h.kernel.eventos24h === 0 ? 'success' : h.kernel.eventos24h > 5 ? 'error' : 'warning'}
        />
        {h.kernel.ultimos.map((l) => (
          <Typography key={l} variant="caption" component="p" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {l}
          </Typography>
        ))}
      </Box>
    </SectionCard>
  );
}

function Ssh({ h }: Readonly<{ h: ServidorHost }>) {
  return (
    <SectionCard title="Logins SSH" subtitle="Últimos 7 dias (também avisados no Telegram)">
      {h.loginsSsh.length === 0 ? (
        <EmptyState message="Nenhum login nos últimos 7 dias." compact />
      ) : (
        <Box sx={coluna}>
          {h.loginsSsh.map((l) => (
            <Item
              key={`${l.quando}-${l.origem}`}
              rotulo={`${dataHora(l.quando)} · ${l.usuario}`}
              valor={`${l.origem} · ${l.metodo === 'publickey' ? 'chave' : l.metodo}`}
              tom={l.metodo === 'publickey' ? 'neutral' : 'warning'}
            />
          ))}
        </Box>
      )}
    </SectionCard>
  );
}

export function ListaEventos({ eventos, vazio }: Readonly<{ eventos: EventoServidor[]; vazio: string }>) {
  if (eventos.length === 0) return <EmptyState message={vazio} compact />;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, maxHeight: 420, overflowY: 'auto', pr: 0.5 }}>
      {eventos.map((e, i) => (
        <Box
          key={`${e.quando}-${i}`}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '86px 1fr', sm: '96px 92px 1fr' },
            gap: 1,
            alignItems: 'center',
            fontSize: '0.8125rem',
          }}
        >
          <Box component="span" sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums' }}>
            {dataHora(e.quando)}
          </Box>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <StatusPill size="sm" tone={TOM_NIVEL[e.nivel] ?? 'neutral'}>
              {ROTULO_TIPO[e.tipo] ?? e.tipo}
            </StatusPill>
          </Box>
          <Box component="span" sx={{ minWidth: 0, wordBreak: 'break-word' }}>
            {e.mensagem}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export function Host({
  host,
  carregando,
  eventos,
}: Readonly<{ host: ServidorHost | null; carregando: boolean; eventos: EventoServidor[] }>) {
  if (!host && carregando) return <Skeleton variant="rounded" height={320} />;
  if (!host) {
    return (
      <EmptyState message="Status do host indisponível (timer casa-monitor-host parado ou MONITOR_HOST_ARQUIVO vazio)." />
    );
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 2.5 } }}>
      {host.desatualizado && (
        <Alert severity="warning">
          O status do host não é atualizado desde {dataHora(host.lidoEm)}. Verifique o timer: systemctl status
          casa-monitor-host.timer
        </Alert>
      )}
      <Box sx={grade}>
        <Alertas h={host} />
        <Backup h={host} />
        <Servicos h={host} />
        <Montagens h={host} />
        <Atualizacoes h={host} />
        <Docker h={host} />
        <Kernel h={host} />
        <Ssh h={host} />
      </Box>
      <SectionCard
        title="Eventos"
        subtitle="Últimos 7 dias: backups, alertas, quedas, discos, containers, logins, acessos pela VPN e boots"
      >
        <ListaEventos eventos={eventos} vazio="Nenhum evento registrado nos últimos 7 dias." />
      </SectionCard>
    </Box>
  );
}
