import type { ReactNode } from 'react';
import { Box, Link } from '@mui/material';
import { SectionCard } from '../../components/ui/SectionCard';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { StatusPill } from '../../components/ui/StatusPill';
import { formatDateBR } from '../../utils/format';
import type { ServidorResumoDia } from '../../types/servidor';
import { bytes, graus, numero, pct, tomPressao, tomTemperatura, tomTemperaturaDisco, tomUso } from './formatos';

const DIA_SEMANA = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' });

function diaSemana(iso: string): string {
  const [a, m, d] = iso.split('-').map(Number);
  return DIA_SEMANA.format(new Date(a, m - 1, d)).replace('.', '');
}

function MediaPico({ media, pico, texto }: Readonly<{ media: string; pico: ReactNode; texto?: string }>) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end' }} title={texto}>
      <Box component="span" sx={{ color: 'text.secondary' }}>
        {media}
      </Box>
      {pico}
    </Box>
  );
}

interface TabelaDiasProps {
  dias: ServidorResumoDia[];
  carregando: boolean;
  selecionado: string;
  onSelecionar: (data: string) => void;
}

export function TabelaDias({ dias, carregando, selecionado, onSelecionar }: Readonly<TabelaDiasProps>) {
  const colunas: DataColumn<ServidorResumoDia>[] = [
    {
      id: 'data',
      header: 'Dia',
      render: (d) => (
        <Link
          component="button"
          type="button"
          underline="hover"
          onClick={() => onSelecionar(d.data)}
          sx={{ fontWeight: d.data === selecionado ? 700 : 500, fontSize: 'inherit' }}
        >
          {formatDateBR(d.data)}{' '}
          <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
            {diaSemana(d.data)}
          </Box>
        </Link>
      ),
    },
    {
      id: 'cpu',
      header: 'CPU média · pico',
      align: 'right',
      render: (d) => (
        <MediaPico
          media={pct(d.resumo.cpu.media)}
          pico={
            <StatusPill size="sm" tone={tomUso(d.resumo.cpu.max)}>
              {pct(d.resumo.cpu.max, 0)}
            </StatusPill>
          }
        />
      ),
    },
    {
      id: 'memoria',
      header: 'Memória média · pico',
      align: 'right',
      render: (d) => (
        <MediaPico
          media={pct(d.resumo.memoria.media)}
          pico={
            <StatusPill size="sm" tone={tomUso(d.resumo.memoria.max)}>
              {pct(d.resumo.memoria.max, 0)}
            </StatusPill>
          }
        />
      ),
    },
    {
      id: 'temperatura',
      header: 'Temperatura média · pico',
      align: 'right',
      render: (d) => (
        <MediaPico
          media={graus(d.resumo.temperatura.media)}
          pico={
            <StatusPill size="sm" tone={tomTemperatura(d.resumo.temperatura.max)}>
              {graus(d.resumo.temperatura.max)}
            </StatusPill>
          }
        />
      ),
    },
    {
      id: 'discos',
      header: 'Discos pico',
      align: 'right',
      render: (d) =>
        d.resumo.discoTemperaturaMax === null ? (
          '—'
        ) : (
          <StatusPill size="sm" tone={tomTemperaturaDisco(d.resumo.discoTemperaturaMax, 'hdd')}>
            {graus(d.resumo.discoTemperaturaMax)}
          </StatusPill>
        ),
    },
    { id: 'carga', header: 'Carga pico', align: 'right', render: (d) => numero(d.resumo.carga.max) },
    {
      id: 'pressao',
      header: 'Pressão pico',
      align: 'right',
      render: (d) => {
        const p = [d.resumo.pressaoCpu?.max, d.resumo.pressaoMemoria?.max, d.resumo.pressaoIo?.max].filter(
          (v): v is number => v !== null && v !== undefined,
        );
        if (p.length === 0) return '—';
        const max = Math.max(...p);
        return (
          <StatusPill size="sm" tone={tomPressao(max)}>
            {pct(max, 0)}
          </StatusPill>
        );
      },
    },
    {
      id: 'internet',
      header: 'Internet fora',
      align: 'right',
      render: (d) =>
        !d.host ? (
          '—'
        ) : (
          <StatusPill
            size="sm"
            tone={d.host.minutosSemInternet === 0 ? 'success' : d.host.minutosSemInternet > 10 ? 'error' : 'warning'}
          >
            {d.host.minutosSemInternet} min
          </StatusPill>
        ),
    },
    {
      id: 'eventos',
      header: 'Eventos (erros)',
      align: 'right',
      render: (d) =>
        !d.host ? (
          '—'
        ) : (
          <StatusPill size="sm" tone={d.host.eventosErro > 0 ? 'error' : 'neutral'}>
            {d.host.eventos} ({d.host.eventosErro})
          </StatusPill>
        ),
    },
    {
      id: 'rede',
      header: 'Rede ↓ / ↑',
      align: 'right',
      render: (d) => `${bytes(d.resumo.redeRecebidaBytes)} / ${bytes(d.resumo.redeEnviadaBytes)}`,
    },
    {
      id: 'disco',
      header: 'Disco lido / escrito',
      align: 'right',
      render: (d) => `${bytes(d.resumo.discoLidoBytes)} / ${bytes(d.resumo.discoEscritoBytes)}`,
    },
    {
      id: 'amostras',
      header: 'Amostras',
      align: 'right',
      render: (d) => d.resumo.amostras.toLocaleString('pt-BR'),
    },
  ];

  return (
    <SectionCard
      title="Estatísticas diárias"
      subtitle="Últimos 30 dias · clique num dia para ver o histórico"
      padding="flush"
    >
      <DataTable
        columns={colunas}
        rows={dias}
        getRowKey={(d) => d.data}
        loading={carregando}
        minWidth={1340}
        defaultRowsPerPage={10}
        emptyMessage="Ainda não há estatísticas gravadas."
        rowSx={(d) => (d.data === selecionado ? { bgcolor: 'action.selected' } : undefined)}
      />
    </SectionCard>
  );
}
