import { useMemo, type ReactNode } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import { SectionCard } from '../../components/ui/SectionCard';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { StatusPill } from '../../components/ui/StatusPill';
import type { ContainerDia, ServidorContainer } from '../../types/servidor';
import { bytes, minutosLegivel, pct, situacaoContainer, taxa, tomUso } from './formatos';

function Nome({ nome, imagem }: Readonly<{ nome: string; imagem: string }>) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Box sx={{ fontWeight: 600 }}>{nome}</Box>
      <Typography variant="caption" component="div" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {imagem}
      </Typography>
    </Box>
  );
}

function Situacao({
  estado,
  saude,
  status,
}: Readonly<{ estado: string; saude: string | null; status: string | null }>) {
  const s = situacaoContainer(estado, saude);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.25 }}>
      <StatusPill tone={s.tom} size="sm">
        {s.rotulo}
      </StatusPill>
      {status && (
        <Typography variant="caption" component="span">
          {status}
        </Typography>
      )}
    </Box>
  );
}

function Par({ a, b }: Readonly<{ a: ReactNode; b: ReactNode }>) {
  return (
    <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
      {a}{' '}
      <Box component="span" sx={{ color: 'text.secondary' }}>
        / {b}
      </Box>
    </Box>
  );
}

const semRede = (r: number | null) => (r === null ? 'rede do host' : taxa(r));

export function ContainersAgora({
  containers,
  carregando,
}: Readonly<{ containers: ServidorContainer[]; carregando: boolean }>) {
  const rodando = containers.filter((c) => c.estado === 'running').length;
  const problemas = containers.filter((c) => c.saude === 'doente' || ['restarting', 'dead'].includes(c.estado)).length;

  const colunas: DataColumn<ServidorContainer>[] = [
    { id: 'nome', header: 'Container', render: (c) => <Nome nome={c.nome} imagem={c.imagem} /> },
    {
      id: 'situacao',
      header: 'Situação',
      render: (c) => <Situacao estado={c.estado} saude={c.saude} status={c.status} />,
    },
    {
      id: 'cpu',
      header: 'CPU',
      align: 'right',
      render: (c) =>
        c.cpuPct === null ? (
          '—'
        ) : (
          <StatusPill size="sm" tone={tomUso(c.cpuPct)}>
            {pct(c.cpuPct)}
          </StatusPill>
        ),
    },
    {
      id: 'memoria',
      header: 'Memória',
      align: 'right',
      render: (c) => (c.memUsada === null ? '—' : <Par a={bytes(c.memUsada)} b={pct(c.memPct)} />),
    },
    {
      id: 'rede',
      header: 'Rede ↓ / ↑',
      align: 'right',
      render: (c) =>
        c.estado !== 'running' ? (
          '—'
        ) : c.redeRecebidaBps === null ? (
          <Typography variant="caption">rede do host</Typography>
        ) : (
          <Par a={taxa(c.redeRecebidaBps)} b={semRede(c.redeEnviadaBps)} />
        ),
    },
    {
      id: 'disco',
      header: 'Disco leitura / escrita',
      align: 'right',
      render: (c) =>
        c.discoLeituraBps === null ? '—' : <Par a={taxa(c.discoLeituraBps)} b={taxa(c.discoEscritaBps)} />,
    },
    { id: 'processos', header: 'Processos', align: 'right', render: (c) => c.processos ?? '—' },
  ];

  return (
    <SectionCard
      title="Containers"
      subtitle={
        containers.length
          ? `${rodando} de ${containers.length} rodando${problemas ? ` · ${problemas} com problema` : ''} · CPU em % do servidor inteiro`
          : 'Containers Docker'
      }
      padding="flush"
    >
      {carregando && containers.length === 0 ? (
        <Box sx={{ px: 3, pb: 2 }}>
          <Skeleton variant="rounded" height={160} />
        </Box>
      ) : (
        <DataTable
          columns={colunas}
          rows={containers}
          getRowKey={(c) => c.nome}
          minWidth={900}
          defaultRowsPerPage={25}
          rowsPerPageOptions={[25, 50]}
          emptyMessage="Nenhum container encontrado (monitoramento de containers desligado ou Docker indisponível)."
          rowSx={(c) => (c.estado !== 'running' ? { opacity: 0.65 } : undefined)}
        />
      )}
    </SectionCard>
  );
}

export function ContainersDia({ containers }: Readonly<{ containers: ContainerDia[] }>) {
  const colunas = useMemo<DataColumn<ContainerDia>[]>(
    () => [
      { id: 'nome', header: 'Container', render: (c) => <Nome nome={c.nome} imagem={c.imagem} /> },
      {
        id: 'rodando',
        header: 'Tempo rodando',
        render: (c) => {
          const fora = c.minutos - c.minutosRodando;
          return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.25 }}>
              <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
                {minutosLegivel(c.minutosRodando)}
              </Box>
              {fora > 0 && (
                <StatusPill size="sm" tone={c.minutosRodando === 0 ? 'neutral' : 'warning'}>
                  {minutosLegivel(fora)} fora
                </StatusPill>
              )}
            </Box>
          );
        },
      },
      {
        id: 'cpu',
        header: 'CPU média / pico',
        align: 'right',
        render: (c) =>
          c.cpuMedia === null ? (
            '—'
          ) : (
            <Par
              a={pct(c.cpuMedia)}
              b={
                <StatusPill size="sm" tone={tomUso(c.cpuMax)}>
                  {pct(c.cpuMax)}
                </StatusPill>
              }
            />
          ),
      },
      {
        id: 'memoria',
        header: 'Memória média / pico',
        align: 'right',
        render: (c) => (c.memMedia === null ? '—' : <Par a={bytes(c.memMedia)} b={bytes(c.memMax)} />),
      },
      {
        id: 'rede',
        header: 'Rede ↓ / ↑ no dia',
        align: 'right',
        render: (c) =>
          c.redeRecebidaBytes === null ? (
            c.minutosRodando > 0 ? (
              <Typography variant="caption">rede do host</Typography>
            ) : (
              '—'
            )
          ) : (
            <Par a={bytes(c.redeRecebidaBytes)} b={bytes(c.redeEnviadaBytes)} />
          ),
      },
      {
        id: 'disco',
        header: 'Disco lido / escrito',
        align: 'right',
        render: (c) =>
          c.discoLidoBytes === null ? '—' : <Par a={bytes(c.discoLidoBytes)} b={bytes(c.discoEscritoBytes)} />,
      },
      {
        id: 'situacao',
        header: 'Última situação',
        render: (c) => <Situacao estado={c.estado} saude={c.saude} status={null} />,
      },
    ],
    [],
  );

  return (
    <SectionCard
      title="Containers no dia"
      subtitle="Os que mais usaram CPU primeiro · CPU em % do servidor inteiro"
      padding="flush"
    >
      <DataTable
        columns={colunas}
        rows={containers}
        getRowKey={(c) => c.nome}
        minWidth={960}
        defaultRowsPerPage={25}
        rowsPerPageOptions={[25, 50]}
        emptyMessage="Nenhuma amostra de containers neste dia."
      />
    </SectionCard>
  );
}
