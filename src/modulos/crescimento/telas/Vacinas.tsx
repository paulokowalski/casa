import { useState } from 'react';
import { Alert, Box, Button, IconButton, LinearProgress, Stack, TextField, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../contexts/ToastContext';
import { crescimentoApi } from '../api';
import { Carregando, Erro } from '../componentes';
import { cor } from '../estilo';
import { dataCurta, hojeISO } from '../formato';
import { useCarregar } from '../useCarregar';
import type { Dose, SituacaoVacina, VacinaExtra } from '../tipos';
import type { PropsAba } from '.';

const SITUACAO: Record<SituacaoVacina, { rotulo: string; cor: string; fundo: string }> = {
  APLICADA: { rotulo: 'aplicada', cor: cor.mentaForte, fundo: cor.mentaClaro },
  TOMAR_AGORA: { rotulo: 'tomar agora', cor: cor.azulForte, fundo: cor.azulClaro },
  ATRASADA: { rotulo: 'atrasada', cor: cor.amareloForte, fundo: cor.amareloClaro },
  PROXIMA: { rotulo: 'em breve', cor: cor.lilasForte, fundo: cor.lilasClaro },
  FUTURA: { rotulo: '', cor: cor.tintaSuave, fundo: 'transparent' },
  PRAZO_ENCERRADO: { rotulo: 'prazo encerrado', cor: cor.tintaSuave, fundo: cor.creme },
};

type Edicao = { tipo: 'dose'; dose: Dose } | { tipo: 'extra'; extra: VacinaExtra | null };

export function VacinasTela({ crianca, versao, alterou }: Readonly<PropsAba>) {
  const { notify } = useToast();
  const { dados, erro, recarregar } = useCarregar(() => crescimentoApi.vacinas(crianca.id), [crianca.id, versao]);
  const [edicao, setEdicao] = useState<Edicao | null>(null);
  const [nome, setNome] = useState('');
  const [data, setData] = useState('');
  const [lote, setLote] = useState('');
  const [local, setLocal] = useState('');
  const [ocupado, setOcupado] = useState(false);

  function abrir(e: Edicao) {
    setEdicao(e);
    const atual = e.tipo === 'dose' ? e.dose : e.extra;
    setNome(e.tipo === 'extra' ? (e.extra?.nome ?? '') : '');
    setData(atual?.aplicadaEm ?? hojeISO());
    setLote(atual?.lote ?? '');
    setLocal(atual?.local ?? ultimoLocal());
  }

  function ultimoLocal() {
    const doses = dados?.grupos.flatMap((g) => g.doses).filter((d) => d.local && d.aplicadaEm) ?? [];
    doses.sort((a, b) => (b.aplicadaEm ?? '').localeCompare(a.aplicadaEm ?? ''));
    return doses[0]?.local ?? '';
  }

  async function executar(acao: () => Promise<unknown>, mensagem: string) {
    setOcupado(true);
    try {
      await acao();
      setEdicao(null);
      notify(mensagem);
      alterou();
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      setOcupado(false);
    }
  }

  if (erro && !dados) return <Erro mensagem={erro} tentar={recarregar} />;
  if (!dados) return <Carregando />;

  const salvar = () => {
    const corpo = { aplicadaEm: data, lote, local };
    if (edicao?.tipo === 'dose')
      executar(() => crescimentoApi.aplicarVacina(crianca.id, edicao.dose.id, corpo), 'Vacina registrada');
    else if (edicao?.tipo === 'extra')
      executar(async () => {
        // a API não edita vacina extra: cria a nova ANTES de apagar a antiga, para uma falha no meio não perder o
        // registro (no pior caso fica duplicado e o aviso diz qual apagar)
        await crescimentoApi.aplicarExtra(crianca.id, { ...corpo, nome });
        if (edicao.extra) {
          try {
            await crescimentoApi.removerVacina(crianca.id, edicao.extra.id);
          } catch {
            alterou();
            throw new Error(
              `A vacina foi salva, mas o registro antigo de "${edicao.extra.nome}" ficou duplicado. Desfaça o antigo.`,
            );
          }
        }
      }, 'Vacina registrada');
  };
  const remover = () => {
    const id = edicao?.tipo === 'dose' ? edicao.dose.id : edicao?.extra?.id;
    if (id) executar(() => crescimentoApi.removerVacina(crianca.id, id), 'Registro desfeito');
  };
  const registrada = edicao?.tipo === 'dose' ? Boolean(edicao.dose.aplicadaEm) : Boolean(edicao?.extra);

  return (
    <Box sx={{ maxWidth: 820 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Typography sx={{ fontWeight: 700 }}>
            {dados.aplicadas} de {dados.total} doses do calendário
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(dados.aplicadas / dados.total) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              mt: 0.5,
              bgcolor: cor.mentaClaro,
              '& .MuiLinearProgress-bar': { bgcolor: cor.mentaForte },
            }}
          />
        </Box>
        {dados.pendentes > 0 && (
          <Typography sx={{ color: cor.amareloForte, fontWeight: 600 }}>{dados.pendentes} para tomar</Typography>
        )}
      </Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        {dados.aviso}
      </Alert>
      <Stack spacing={1.5}>
        {dados.grupos.map((g) => (
          <Box
            key={g.idadeMeses}
            sx={{ bgcolor: cor.papel, border: `1px solid ${cor.borda}`, borderRadius: 3, overflow: 'hidden' }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                px: 2,
                py: 1,
                bgcolor: g.aplicadas === g.total ? cor.mentaClaro : cor.creme,
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>{g.rotulo}</Typography>
              <Typography variant="body2" color="text.secondary">
                {dataCurta(g.data)} · {g.aplicadas}/{g.total}
              </Typography>
            </Box>
            {g.doses.map((d) => {
              const s = SITUACAO[d.situacao];
              return (
                <Box
                  key={d.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderTop: `1px solid ${cor.borda}`,
                  }}
                >
                  {d.situacao === 'APLICADA' ? (
                    <CheckCircleRoundedIcon sx={{ color: cor.mentaForte }} />
                  ) : (
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        border: `2px solid ${s.cor}`,
                        flexShrink: 0,
                        opacity: 0.6,
                      }}
                    />
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {d.vacina}
                    </Typography>
                    <Typography variant="caption" sx={{ color: cor.tintaSuave }}>
                      {d.dose}
                      {d.aplicadaEm && ` · ${dataCurta(d.aplicadaEm)}`}
                      {d.local && ` · ${d.local}`}
                      {d.dataLimite && !d.aplicadaEm && ` · até ${dataCurta(d.dataLimite)}`}
                    </Typography>
                  </Box>
                  {s.rotulo && d.situacao !== 'APLICADA' && (
                    <Box
                      sx={{
                        px: 1,
                        borderRadius: 999,
                        bgcolor: s.fundo,
                        color: s.cor,
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {s.rotulo}
                    </Box>
                  )}
                  {crianca.podeEditar &&
                    (d.aplicadaEm ? (
                      <IconButton
                        size="small"
                        aria-label={`Editar ${d.vacina}`}
                        onClick={() => abrir({ tipo: 'dose', dose: d })}
                      >
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    ) : (
                      d.situacao !== 'FUTURA' && (
                        <Button size="small" onClick={() => abrir({ tipo: 'dose', dose: d })}>
                          Registrar
                        </Button>
                      )
                    ))}
                </Box>
              );
            })}
          </Box>
        ))}
        <Box sx={{ bgcolor: cor.papel, border: `1px solid ${cor.borda}`, borderRadius: 3, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontWeight: 700 }}>Outras vacinas</Typography>
            {crianca.podeEditar && (
              <Button size="small" startIcon={<AddRoundedIcon />} onClick={() => abrir({ tipo: 'extra', extra: null })}>
                Adicionar
              </Button>
            )}
          </Box>
          {dados.extras.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Particulares ou de campanha (meningo B, gripe de outros anos...).
            </Typography>
          ) : (
            dados.extras.map((x) => (
              <Box key={x.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.75 }}>
                <CheckCircleRoundedIcon sx={{ color: cor.mentaForte }} />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>{x.nome}</Typography>
                  <Typography variant="caption">
                    {dataCurta(x.aplicadaEm)}
                    {x.local && ` · ${x.local}`}
                  </Typography>
                </Box>
                {crianca.podeEditar && (
                  <IconButton
                    size="small"
                    aria-label={`Editar ${x.nome}`}
                    onClick={() => abrir({ tipo: 'extra', extra: x })}
                  >
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            ))
          )}
        </Box>
      </Stack>
      <Modal
        open={edicao !== null}
        onClose={() => !ocupado && setEdicao(null)}
        maxWidth="xs"
        title={edicao?.tipo === 'dose' ? `${edicao.dose.vacina} · ${edicao.dose.dose}` : 'Outra vacina'}
        actions={
          <>
            {registrada && (
              <Button color="error" onClick={remover} disabled={ocupado} sx={{ mr: 'auto' }}>
                Desfazer
              </Button>
            )}
            <Button variant="outlined" onClick={() => setEdicao(null)} disabled={ocupado}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={salvar}
              disabled={ocupado || (edicao?.tipo === 'extra' && !nome.trim())}
            >
              Salvar
            </Button>
          </>
        }
      >
        <Stack spacing={2}>
          {edicao?.tipo === 'extra' && (
            <TextField
              label="Vacina"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 80 } }}
            />
          )}
          <TextField
            label="Data da aplicação"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: crianca.nascimento, max: hojeISO() } }}
          />
          <TextField
            label="Lote (opcional)"
            value={lote}
            onChange={(e) => setLote(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 40 } }}
          />
          <TextField
            label="Local (opcional)"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            placeholder="UBS, clínica..."
            slotProps={{ htmlInput: { maxLength: 80 } }}
          />
        </Stack>
      </Modal>
    </Box>
  );
}
