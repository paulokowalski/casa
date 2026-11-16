import type { ReactNode } from 'react';
import { Box, LinearProgress, Skeleton, Typography } from '@mui/material';
import DeveloperBoardOutlinedIcon from '@mui/icons-material/DeveloperBoardOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import ThermostatOutlinedIcon from '@mui/icons-material/ThermostatOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import HourglassBottomOutlinedIcon from '@mui/icons-material/HourglassBottomOutlined';
import ViewInArOutlinedIcon from '@mui/icons-material/ViewInArOutlined';
import WhatshotOutlinedIcon from '@mui/icons-material/WhatshotOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import { KpiCard } from '../../components/ui/KpiCard';
import { SectionCard } from '../../components/ui/SectionCard';
import { StatusPill } from '../../components/ui/StatusPill';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Tone } from '../../styles/tokens';
import type { ServidorAgora, ServidorDisco } from '../../types/servidor';
import {
  bytes,
  graus,
  ms,
  numero,
  pct,
  taxa,
  tomCarga,
  tomLatencia,
  tomLimiteCpu,
  tomPressao,
  tomTemperatura,
  tomTemperaturaDisco,
  tomUso,
} from './formatos';

const corBarra: Record<Tone, 'success' | 'warning' | 'error' | 'primary' | 'inherit'> = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  brand: 'primary',
  info: 'primary',
  violet: 'primary',
  neutral: 'inherit',
};

export function Barra({ valor, tom }: Readonly<{ valor: number; tom: Tone }>) {
  return (
    <LinearProgress
      variant="determinate"
      value={Math.max(0, Math.min(100, valor))}
      color={corBarra[tom]}
      sx={{ height: 6, borderRadius: 999, bgcolor: 'grey.100' }}
    />
  );
}

function Linha({ rotulo, valor, children }: Readonly<{ rotulo: ReactNode; valor: ReactNode; children?: ReactNode }>) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, fontSize: '0.8125rem' }}>
        <Box
          component="span"
          sx={{ color: 'text.secondary', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}
        >
          {rotulo}
        </Box>
        <Box component="span" sx={{ fontWeight: 600, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
          {valor}
        </Box>
      </Box>
      {children}
    </Box>
  );
}

function TemperaturaDisco({ disco, doDia }: Readonly<{ disco: ServidorDisco; doDia?: boolean }>) {
  const valor = doDia ? disco.temperaturaMax : disco.temperatura;
  if (valor !== null && valor !== undefined) {
    return (
      <StatusPill
        size="sm"
        tone={tomTemperaturaDisco(valor, disco.tipo)}
        title={doDia ? `Média do dia ${graus(disco.temperaturaMedia)}` : (disco.modelo ?? undefined)}
      >
        {doDia ? 'máx ' : ''}
        {graus(valor)}
      </StatusPill>
    );
  }
  if (!doDia && disco.estadoTemperatura === 'repouso') {
    return (
      <StatusPill size="sm" tone="neutral" title="Disco parado; não foi acordado só para ler a temperatura">
        em repouso
      </StatusPill>
    );
  }
  return null;
}

export function ListaDiscos({ discos, doDia }: Readonly<{ discos: ServidorDisco[]; doDia?: boolean }>) {
  if (discos.length === 0) return <EmptyState message="Nenhum disco medido." compact />;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {discos.map((d) => (
        <Linha
          key={d.nome}
          rotulo={
            <Box
              component="span"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}
              title={d.modelo ?? undefined}
            >
              {d.nome}
              <TemperaturaDisco disco={d} doDia={doDia} />
            </Box>
          }
          valor={
            <>
              {pct(d.pct)}{' '}
              <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                · {bytes(d.usado)} de {bytes(d.total)}
              </Box>
            </>
          }
        >
          <Barra valor={d.pct} tom={tomUso(d.pct)} />
        </Linha>
      ))}
    </Box>
  );
}

const grade4 = {
  display: 'grid',
  gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
  gap: { xs: 1.5, md: 2.5 },
} as const;

/** Maior pressão (PSI some) entre CPU, memória e I/O, com o nome do recurso. */
function maiorPressao(p: ServidorAgora['pressao'] | undefined): { valor: number | null; recurso: string } {
  if (!p) return { valor: null, recurso: '' };
  const itens: [string, number | null][] = [
    ['CPU', p.cpu],
    ['memória', p.memoria],
    ['disco (I/O)', p.io],
  ];
  return itens.reduce<{ valor: number | null; recurso: string }>(
    (a, [recurso, v]) => (v !== null && (a.valor === null || v > a.valor) ? { valor: v, recurso } : a),
    { valor: null, recurso: '' },
  );
}

export function Agora({
  agora,
  carregando,
  npuPct,
}: Readonly<{ agora: ServidorAgora | null; carregando: boolean; npuPct?: number[] }>) {
  const semDados = !agora && carregando;
  const nucleos = agora?.cpu.nucleos.length ?? 0;
  const temp = (sensor: string) => agora?.temperaturas.find((t) => t.sensor === sensor)?.celsius;
  const discoMaisQuente = agora?.discos
    .filter((d) => d.temperatura !== null)
    .reduce<ServidorDisco | null>((a, d) => (!a || (d.temperatura ?? 0) > (a.temperatura ?? 0) ? d : a), null);
  const pressao = maiorPressao(agora?.pressao);
  const discoMaisOcupado = agora?.discosAtividade.reduce<ServidorAgora['discosAtividade'][number] | null>(
    (a, d) => (!a || d.ocupacaoPct > a.ocupacaoPct ? d : a),
    null,
  );
  const npuMedia = npuPct && npuPct.length > 0 ? npuPct.reduce((a, b) => a + b, 0) / npuPct.length : null;
  const limitados = agora?.clusters.filter((c) => c.limitePct !== null && c.limitePct < 99.5) ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 2.5 } }}>
      <Box sx={grade4}>
        <KpiCard
          label="CPU"
          icon={<DeveloperBoardOutlinedIcon />}
          tone={tomUso(agora?.cpu.usoPct)}
          loading={semDados}
          value={pct(agora?.cpu.usoPct)}
          footer={agora ? `${nucleos} núcleos · iowait ${pct(agora.cpu.iowaitPct)}` : undefined}
        />
        <KpiCard
          label="Memória"
          icon={<MemoryOutlinedIcon />}
          tone={tomUso(agora?.memoria.pct)}
          loading={semDados}
          value={pct(agora?.memoria.pct)}
          footer={
            agora
              ? `${bytes(agora.memoria.usada)} de ${bytes(agora.memoria.total)} · swap ${pct(agora.memoria.swapPct)}`
              : undefined
          }
        />
        <KpiCard
          label="Temperatura"
          icon={<ThermostatOutlinedIcon />}
          tone={tomTemperatura(agora?.temperaturaMax)}
          loading={semDados}
          value={graus(agora?.temperaturaMax)}
          footer={
            agora
              ? [
                  temp('soc') !== undefined ? `SoC ${graus(temp('soc'))}` : 'maior sensor',
                  discoMaisQuente ? `discos até ${graus(discoMaisQuente.temperatura)}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ')
              : undefined
          }
        />
        <KpiCard
          label="Carga (load)"
          icon={<SpeedOutlinedIcon />}
          tone={tomCarga(agora?.carga.min1, nucleos)}
          loading={semDados}
          value={numero(agora?.carga.min1)}
          footer={
            agora
              ? `5 min ${numero(agora.carga.min5)} · 15 min ${numero(agora.carga.min15)} · ${agora.carga.processos} processos`
              : undefined
          }
        />
      </Box>

      <Box sx={grade4}>
        <KpiCard
          label="Pressão (espera)"
          icon={<HourglassBottomOutlinedIcon />}
          tone={tomPressao(pressao.valor)}
          loading={semDados}
          value={pct(pressao.valor)}
          footer={
            agora
              ? `CPU ${pct(agora.pressao.cpu)} · mem ${pct(agora.pressao.memoria)} · I/O ${pct(agora.pressao.io)}`
              : undefined
          }
        />
        <KpiCard
          label="Limite da CPU"
          icon={<WhatshotOutlinedIcon />}
          tone={tomLimiteCpu(agora?.cpuLimitePct)}
          loading={semDados}
          value={agora?.cpuLimitePct === null ? '—' : pct(agora?.cpuLimitePct, 0)}
          footer={
            agora
              ? limitados.length > 0
                ? `segurada por calor: ${limitados.map((c) => `CPU ${c.nucleos.join(',')} até ${c.limiteMhz} MHz`).join(' · ')}`
                : 'frequência máxima liberada (sem redução por calor)'
              : undefined
          }
        />
        <KpiCard
          label="Latência dos discos"
          icon={<StorageOutlinedIcon />}
          tone={tomLatencia(agora?.discoLatenciaMs)}
          loading={semDados}
          value={agora?.discoLatenciaMs === null ? 'ocioso' : ms(agora?.discoLatenciaMs)}
          footer={
            agora && discoMaisOcupado
              ? `mais ocupado: ${discoMaisOcupado.disco} ${pct(discoMaisOcupado.ocupacaoPct, 0)}${
                  agora.redeErros > 0 ? ` · ${agora.redeErros} erro(s) de rede` : ''
                }`
              : undefined
          }
        />
        <KpiCard
          label="GPU · NPU"
          icon={<ViewInArOutlinedIcon />}
          tone={tomUso(Math.max(agora?.gpuPct ?? 0, npuMedia ?? 0))}
          loading={semDados}
          value={`${pct(agora?.gpuPct, 0)} · ${pct(npuMedia, 0)}`}
          footer={
            npuPct && npuPct.length > 0
              ? `NPU por núcleo: ${npuPct.map((n) => `${n}%`).join(' / ')}`
              : 'NPU sem leitura'
          }
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' },
          gap: { xs: 2, md: 2.5 },
        }}
      >
        <SectionCard title="Núcleos" subtitle="Uso e frequência de cada núcleo">
          {semDados ? (
            <Skeleton variant="rounded" height={180} />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {agora?.cpu.nucleos.map((n) => (
                <Linha
                  key={n.nucleo}
                  rotulo={`CPU ${n.nucleo}`}
                  valor={
                    <>
                      {pct(n.usoPct, 0)}
                      {n.mhz !== null && (
                        <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                          {' '}
                          · {n.mhz.toLocaleString('pt-BR')} MHz
                        </Box>
                      )}
                    </>
                  }
                >
                  <Barra valor={n.usoPct} tom={tomUso(n.usoPct)} />
                </Linha>
              ))}
            </Box>
          )}
        </SectionCard>

        <SectionCard title="Temperaturas" subtitle="Sensores térmicos da placa">
          {semDados ? (
            <Skeleton variant="rounded" height={180} />
          ) : agora && agora.temperaturas.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {agora.temperaturas.map((t) => (
                <Box
                  key={t.sensor}
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}
                >
                  <Box component="span" sx={{ color: 'text.secondary' }}>
                    {t.sensor}
                  </Box>
                  <StatusPill tone={tomTemperatura(t.celsius)} size="sm">
                    {graus(t.celsius)}
                  </StatusPill>
                </Box>
              ))}
            </Box>
          ) : (
            <EmptyState message="Nenhum sensor de temperatura encontrado." compact />
          )}
        </SectionCard>

        <SectionCard title="Discos" subtitle="Espaço usado e temperatura">
          {semDados ? <Skeleton variant="rounded" height={180} /> : <ListaDiscos discos={agora?.discos ?? []} />}
        </SectionCard>

        <SectionCard title="Rede e disco" subtitle="Tráfego neste momento">
          {semDados ? (
            <Skeleton variant="rounded" height={180} />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {agora?.rede.map((r) => (
                <Box key={r.interfaceRede}>
                  <Typography variant="caption" component="p" sx={{ mb: 0.25 }}>
                    {r.interfaceRede}
                  </Typography>
                  <Linha rotulo="↓ Recebendo" valor={taxa(r.recebidaBps)} />
                  <Linha rotulo="↑ Enviando" valor={taxa(r.enviadaBps)} />
                </Box>
              ))}
              <Box>
                <Typography variant="caption" component="p" sx={{ mb: 0.25 }}>
                  Discos
                </Typography>
                <Linha rotulo="Leitura" valor={taxa(agora?.discoIo.leituraBps)} />
                <Linha rotulo="Escrita" valor={taxa(agora?.discoIo.escritaBps)} />
              </Box>
            </Box>
          )}
        </SectionCard>
      </Box>
    </Box>
  );
}
