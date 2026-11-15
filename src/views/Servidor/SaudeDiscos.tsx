import type { ReactNode } from 'react';
import { Box, Skeleton, Typography } from '@mui/material';
import { SectionCard } from '../../components/ui/SectionCard';
import { StatusPill } from '../../components/ui/StatusPill';
import { EmptyState } from '../../components/ui/EmptyState';
import type { Tone } from '../../styles/tokens';
import type { SaudeDisco, ServidorDisco, SituacaoDisco } from '../../types/servidor';
import { Barra } from './Agora';
import { bytes, graus, tomTemperaturaDisco } from './formatos';

const SITUACAO: Record<SituacaoDisco, { rotulo: string; tom: Tone }> = {
  boa: { rotulo: 'Saudável', tom: 'success' },
  atencao: { rotulo: 'Atenção', tom: 'warning' },
  critica: { rotulo: 'Crítico', tom: 'error' },
};

const TIPO: Record<string, string> = { nvme: 'NVMe', ssd: 'SSD', hdd: 'HD' };

const inteiro = (v: number | null | undefined) => (v === null || v === undefined ? '—' : v.toLocaleString('pt-BR'));

/** 27607 h → "3 anos e 2 meses" (aproximado), para dar noção da idade do disco. */
function idade(horas: number | null): string | null {
  if (horas === null) return null;
  const dias = horas / 24;
  if (dias < 60) return `${Math.round(dias)} dias`;
  const meses = Math.round(dias / 30.44);
  const anos = Math.floor(meses / 12);
  const resto = meses % 12;
  if (anos === 0) return `${meses} meses`;
  return `${anos} ano${anos > 1 ? 's' : ''}${resto ? ` e ${resto} ${resto > 1 ? 'meses' : 'mês'}` : ''}`;
}

function Dado({ rotulo, valor, tom }: Readonly<{ rotulo: string; valor: ReactNode; tom?: Tone }>) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, fontSize: '0.8125rem' }}>
      <Box component="span" sx={{ color: 'text.secondary' }}>
        {rotulo}
      </Box>
      <Box component="span" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
        {tom ? (
          <StatusPill size="sm" tone={tom}>
            {valor}
          </StatusPill>
        ) : (
          valor
        )}
      </Box>
    </Box>
  );
}

/** Contador que deveria ser zero: verde em zero, na cor do nível quando não. */
function Contador({ rotulo, valor, tomSeMaior }: Readonly<{ rotulo: string; valor: number | null; tomSeMaior: Tone }>) {
  if (valor === null) return null;
  return <Dado rotulo={rotulo} valor={inteiro(valor)} tom={valor > 0 ? tomSeMaior : 'success'} />;
}

function Temperatura({ disco, s }: Readonly<{ disco: ServidorDisco; s: SaudeDisco }>) {
  const atual =
    disco.temperatura !== null ? graus(disco.temperatura) : disco.estadoTemperatura === 'repouso' ? 'em repouso' : '—';
  const limite = s.temperaturaLimite;
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Dado
        rotulo="Temperatura agora"
        valor={atual}
        tom={disco.temperatura !== null ? tomTemperaturaDisco(disco.temperatura, disco.tipo) : 'neutral'}
      />
      {limite !== null && disco.temperatura !== null && (
        <Barra
          valor={(100 * disco.temperatura) / (s.temperaturaLimiteAbsoluto ?? limite)}
          tom={tomTemperaturaDisco(disco.temperatura, disco.tipo)}
        />
      )}
      {limite !== null && (
        <Dado
          rotulo="Limite do fabricante"
          valor={`${graus(limite)}${s.temperaturaLimiteAbsoluto !== null ? ` · absoluto ${graus(s.temperaturaLimiteAbsoluto)}` : ''}`}
        />
      )}
      {(s.temperaturaMinVida !== null || s.temperaturaMaxVida !== null) && (
        <Dado
          rotulo="Mín / máx da vida"
          valor={`${s.temperaturaMinVida !== null ? graus(s.temperaturaMinVida) : '—'} / ${graus(s.temperaturaMaxVida)}`}
        />
      )}
      {s.vezesAcimaLimite !== null && (
        <Contador rotulo="Vezes acima do limite" valor={s.vezesAcimaLimite} tomSeMaior="warning" />
      )}
    </Box>
  );
}

function CartaoDisco({ disco }: Readonly<{ disco: ServidorDisco }>) {
  const s = disco.saude;
  const sit = s ? SITUACAO[s.situacao] : null;
  const anos = idade(s?.horasLigado ?? null);
  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.25,
        minWidth: 0,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ fontWeight: 600 }}>{disco.nome}</Box>
          <Typography variant="caption" component="div" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {[disco.tipo ? TIPO[disco.tipo] : null, disco.modelo, bytes(disco.total, 0)].filter(Boolean).join(' · ')}
          </Typography>
        </Box>
        {sit ? <StatusPill tone={sit.tom}>{sit.rotulo}</StatusPill> : <StatusPill tone="neutral">Sem SMART</StatusPill>}
      </Box>

      {!s ? (
        <Typography variant="caption">
          Este disco não informa SMART (ex.: memória eMMC) ou a leitura do host não está ativa.
        </Typography>
      ) : (
        <>
          {s.alertas.length > 0 && (
            <Box
              component="ul"
              sx={{ m: 0, pl: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 0.5 }}
            >
              {s.alertas.map((a) => (
                <Box
                  component="li"
                  key={a.mensagem}
                  sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start', fontSize: '0.8125rem' }}
                >
                  <Box
                    aria-hidden
                    sx={(t) => ({
                      mt: '6px',
                      width: 8,
                      height: 8,
                      flexShrink: 0,
                      borderRadius: '50%',
                      bgcolor:
                        a.nivel === 'critico'
                          ? t.palette.error.main
                          : a.nivel === 'atencao'
                            ? t.palette.warning.main
                            : t.palette.grey[400],
                    })}
                  />
                  <Box component="span">
                    <Box
                      component="span"
                      sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
                    >
                      {a.nivel === 'critico' ? 'Crítico: ' : a.nivel === 'atencao' ? 'Atenção: ' : 'Info: '}
                    </Box>
                    {a.mensagem}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
          {s.alertas.length === 0 && <Typography variant="caption">Nenhum sinal de problema no SMART.</Typography>}

          <Temperatura disco={disco} s={s} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, pt: 1, borderTop: 1, borderColor: 'divider' }}>
            {s.aprovado !== null && (
              <Dado
                rotulo="Autoteste SMART"
                valor={s.aprovado ? 'aprovado' : 'reprovado'}
                tom={s.aprovado ? 'success' : 'error'}
              />
            )}
            {s.horasLigado !== null && (
              <Dado rotulo="Tempo ligado" valor={`${inteiro(s.horasLigado)} h${anos ? ` (${anos})` : ''}`} />
            )}
            {s.vezesLigado !== null && <Dado rotulo="Vezes ligado" valor={inteiro(s.vezesLigado)} />}
            <Contador rotulo="Setores realocados" valor={s.setoresRealocados} tomSeMaior="warning" />
            <Contador rotulo="Setores pendentes" valor={s.setoresPendentes} tomSeMaior="error" />
            <Contador rotulo="Setores ilegíveis" valor={s.setoresIrrecuperaveis} tomSeMaior="error" />
            <Contador rotulo="Erros não corrigidos" valor={s.errosNaoCorrigidos} tomSeMaior="warning" />
            <Contador rotulo="Erros de cabo (CRC)" valor={s.errosComunicacao} tomSeMaior="neutral" />
            {s.ciclosCabeca !== null && <Dado rotulo="Ciclos da cabeça" valor={inteiro(s.ciclosCabeca)} />}
            {s.nvme && (
              <>
                {s.nvme.desgaste !== null && (
                  <Dado
                    rotulo="Vida útil usada"
                    valor={`${s.nvme.desgaste}%`}
                    tom={s.nvme.desgaste >= 100 ? 'error' : s.nvme.desgaste >= 80 ? 'warning' : 'success'}
                  />
                )}
                {s.nvme.reservaDisponivel !== null && (
                  <Dado
                    rotulo="Reserva de blocos"
                    valor={`${s.nvme.reservaDisponivel}%${s.nvme.reservaMinima !== null ? ` (mín. ${s.nvme.reservaMinima}%)` : ''}`}
                  />
                )}
                <Contador rotulo="Erros de mídia" valor={s.nvme.errosMidia} tomSeMaior="error" />
                {s.nvme.bytesEscritos !== null && (
                  <Dado
                    rotulo="Escrito / lido na vida"
                    valor={`${bytes(s.nvme.bytesEscritos)} / ${bytes(s.nvme.bytesLidos)}`}
                  />
                )}
                <Contador rotulo="Minutos acima do aviso" valor={s.nvme.minutosAcimaAviso} tomSeMaior="warning" />
                <Contador rotulo="Minutos acima do crítico" valor={s.nvme.minutosAcimaCritico} tomSeMaior="error" />
                {s.nvme.desligamentosInesperados !== null && (
                  <Dado rotulo="Desligamentos sem aviso" valor={inteiro(s.nvme.desligamentosInesperados)} />
                )}
              </>
            )}
          </Box>
          {s.lidoEm && disco.estadoTemperatura === 'repouso' && (
            <Typography variant="caption">
              Disco em repouso: dados da última leitura, em{' '}
              {new Date(s.lidoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}.
            </Typography>
          )}
        </>
      )}
    </Box>
  );
}

export function SaudeDiscos({ discos, carregando }: Readonly<{ discos: ServidorDisco[]; carregando: boolean }>) {
  const comSmart = discos.filter((d) => d.saude);
  const criticos = comSmart.filter((d) => d.saude?.situacao === 'critica').length;
  const atencao = comSmart.filter((d) => d.saude?.situacao === 'atencao').length;
  const resumo = comSmart.length
    ? [
        criticos ? `${criticos} crítico${criticos > 1 ? 's' : ''}` : null,
        atencao ? `${atencao} em atenção` : null,
        !criticos && !atencao ? 'todos saudáveis' : null,
      ]
        .filter(Boolean)
        .join(' · ')
    : 'SMART de cada disco';

  return (
    <SectionCard title="Saúde dos discos" subtitle={`${resumo} · avaliação pelo SMART, atualizada a cada minuto`}>
      {carregando && discos.length === 0 ? (
        <Skeleton variant="rounded" height={260} />
      ) : discos.length === 0 ? (
        <EmptyState message="Nenhum disco medido." compact />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: 'repeat(2, minmax(0, 1fr))',
              xl: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          {discos.map((d) => (
            <CartaoDisco key={d.nome} disco={d} />
          ))}
        </Box>
      )}
    </SectionCard>
  );
}
