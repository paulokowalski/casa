import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Chip, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded';
import MedicalServicesRoundedIcon from '@mui/icons-material/MedicalServicesRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../contexts/ToastContext';
import { crescimentoApi } from '../api';
import { Carregando, Erro, Miniatura, Visualizador } from '../componentes';
import { cor } from '../estilo';
import { cm, dataCurta, dataLonga, gramas, kg, mesDeVidaTexto, percentil } from '../formato';
import { RegistroDialog } from '../RegistroDialog';
import type { Foto, ItemLinhaDoTempo, Medicao, Registro, TipoRegistro } from '../tipos';
import type { PropsAba } from '.';

type Filtro = 'TUDO' | TipoRegistro | 'FOTOS';
const FILTROS: { id: Filtro; rotulo: string }[] = [
  { id: 'TUDO', rotulo: 'Tudo' },
  { id: 'FOTOS', rotulo: 'Com fotos' },
  { id: 'MOMENTO', rotulo: 'Momentos' },
  { id: 'PESAGEM', rotulo: 'Pesagens' },
  { id: 'CONSULTA', rotulo: 'Consultas' },
];

const TIPO: Record<TipoRegistro, { icone: React.ReactNode; cor: string; fundo: string; rotulo: string }> = {
  MOMENTO: { icone: <FavoriteRoundedIcon />, cor: cor.rosaForte, fundo: cor.rosaClaro, rotulo: 'Momento' },
  PESAGEM: { icone: <MonitorWeightRoundedIcon />, cor: cor.mentaForte, fundo: cor.mentaClaro, rotulo: 'Pesagem' },
  CONSULTA: { icone: <MedicalServicesRoundedIcon />, cor: cor.azulForte, fundo: cor.azulClaro, rotulo: 'Consulta' },
};

function Medidas({ m, ganho, dias }: Readonly<{ m: Medicao; ganho: number | null; dias: number | null }>) {
  const partes = [
    m.peso && `${kg(m.peso.valor)} ${percentil(m.peso.percentil)}`,
    m.comprimento && `${cm(m.comprimento.valor)} ${percentil(m.comprimento.percentil)}`,
    m.perimetro && `cabeça ${cm(m.perimetro.valor)} ${percentil(m.perimetro.percentil)}`,
  ].filter(Boolean);
  return (
    <Typography variant="body2" sx={{ fontWeight: 600, color: cor.tinta }}>
      {partes.join(' · ')}
      {ganho != null && dias != null && (
        <Box component="span" sx={{ fontWeight: 400, color: cor.tintaSuave }}>
          {' '}
          ({gramas(ganho)} em {dias} dias)
        </Box>
      )}
    </Typography>
  );
}

function Fotos({ fotos, abrir }: Readonly<{ fotos: Foto[]; abrir: (i: number) => void }>) {
  if (fotos.length === 0) return null;
  const mostrar = fotos.slice(0, fotos.length === 1 ? 1 : 4);
  const resto = fotos.length - mostrar.length;
  if (fotos.length === 1)
    return (
      <Box
        component="button"
        type="button"
        onClick={() => abrir(0)}
        aria-label="Ver foto"
        sx={{
          p: 0,
          border: 0,
          mt: 1,
          borderRadius: 3,
          overflow: 'hidden',
          display: 'block',
          cursor: 'zoom-in',
          maxWidth: 360,
          width: '100%',
        }}
      >
        <Box component="img" src={fotos[0].urls.media} alt="" loading="lazy" sx={{ width: '100%', display: 'block' }} />
      </Box>
    );
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0.75, mt: 1, maxWidth: 420 }}>
      {mostrar.map((f, i) => (
        <Box key={f.id} sx={{ position: 'relative' }}>
          <Miniatura foto={f} onClick={() => abrir(i)} />
          {i === mostrar.length - 1 && resto > 0 && (
            <Box
              onClick={() => abrir(i)}
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'rgba(0,0,0,.45)',
                color: '#fff',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                cursor: 'zoom-in',
              }}
            >
              +{resto}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}

function Item({
  item,
  podeEditar,
  editar,
  excluirMedicao,
  verFotos,
}: Readonly<{
  item: ItemLinhaDoTempo;
  podeEditar: boolean;
  editar: (r: Registro) => void;
  excluirMedicao: (m: Medicao) => void;
  verFotos: (fotos: Foto[], i: number, r: Registro) => void;
}>) {
  const t = TIPO[item.tipo];
  const r = item.registro;
  const m = r?.medicao ?? item.medicao;
  return (
    <Box sx={{ display: 'flex', gap: 1.5 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          bgcolor: t.fundo,
          color: t.cor,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& svg': { fontSize: 18 },
          mt: 0.5,
        }}
      >
        {t.icone}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, bgcolor: cor.papel, border: `1px solid ${cor.borda}`, borderRadius: 3, p: 1.5 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: cor.tintaSuave }}>
              {dataLonga(item.data)} · {item.idade}
              {r?.criadoPorNome && ` · ${r.criadoPorNome.split(' ')[0]}`}
            </Typography>
            {r?.album && (
              <Chip
                size="small"
                icon={<AutoAwesomeRoundedIcon />}
                label={r.album.rotulo}
                sx={{
                  ml: 1,
                  height: 20,
                  bgcolor: cor.amareloClaro,
                  color: cor.amareloForte,
                  '& .MuiChip-icon': { color: cor.amareloForte, fontSize: 14 },
                }}
              />
            )}
          </Box>
          {podeEditar && r && (
            <IconButton size="small" aria-label="Editar" onClick={() => editar(r)} sx={{ mt: -0.5 }}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          )}
          {podeEditar && !r && item.medicao && (
            <Tooltip title="Excluir medição">
              <IconButton
                size="small"
                aria-label="Excluir medição"
                onClick={() => excluirMedicao(item.medicao!)}
                sx={{ mt: -0.5 }}
              >
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        {r?.tipo === 'CONSULTA' && (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            Consulta{r.profissional && ` · ${r.profissional}`}
          </Typography>
        )}
        {m && <Medidas m={m} ganho={item.ganhoPesoGramas} dias={item.ganhoPesoDias} />}
        {r?.texto && (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 0.5, color: cor.tinta }}>
            {r.texto}
          </Typography>
        )}
        {r?.proximaConsulta && (
          <Typography variant="body2" sx={{ color: cor.azulForte, mt: 0.5 }}>
            Retorno: {dataCurta(r.proximaConsulta)}
          </Typography>
        )}
        {r && <Fotos fotos={r.fotos} abrir={(i) => verFotos(r.fotos, i, r)} />}
      </Box>
    </Box>
  );
}

const TAMANHO = 20;

export function Diario({ crianca, versao, alterou }: Readonly<PropsAba>) {
  const { notify } = useToast();
  const [filtro, setFiltro] = useState<Filtro>('TUDO');
  const [itens, setItens] = useState<ItemLinhaDoTempo[]>([]);
  const [pagina, setPagina] = useState(0);
  const [temMais, setTemMais] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [editando, setEditando] = useState<Registro | null | 'novo'>(null);
  const [apagar, setApagar] = useState<Medicao | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [vendo, setVendo] = useState<{ fotos: Foto[]; i: number; legenda: string } | null>(null);

  // só a chamada mais recente vale: troca de filtro (ou recarga) com uma busca em andamento descarta a antiga
  const seq = useRef(0);
  const carregar = useCallback(
    (p: number) => {
      const minha = ++seq.current;
      setCarregando(true);
      crescimentoApi
        .linhaDoTempo(crianca.id, {
          pagina: p,
          tamanho: TAMANHO,
          tipo: filtro === 'TUDO' || filtro === 'FOTOS' ? null : filtro,
          soComFotos: filtro === 'FOTOS',
        })
        .then((l) => {
          if (minha !== seq.current) return;
          setItens((atual) => (p === 0 ? l.itens : [...atual, ...l.itens]));
          setPagina(p);
          setTemMais(l.temMais);
          setErro(null);
        })
        .catch((e: Error) => {
          if (minha === seq.current) setErro(e.message);
        })
        .finally(() => {
          if (minha === seq.current) setCarregando(false);
        });
    },
    [crianca.id, filtro],
  );

  useEffect(() => carregar(0), [carregar, versao]);

  async function excluirMedicao() {
    if (!apagar) return;
    setOcupado(true);
    try {
      await crescimentoApi.excluirMedicao(crianca.id, apagar.id);
      setApagar(null);
      notify('Medição excluída');
      alterou();
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      setOcupado(false);
    }
  }

  // agrupa por mês de vida, na ordem que veio (mais recente primeiro)
  const grupos: { mes: number; itens: ItemLinhaDoTempo[] }[] = [];
  for (const it of itens) {
    const g = grupos[grupos.length - 1];
    if (g && g.mes === it.mesDeVida) g.itens.push(it);
    else grupos.push({ mes: it.mesDeVida, itens: [it] });
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
        <Stack direction="row" spacing={0.75} sx={{ overflowX: 'auto', flex: 1, pb: 0.5 }}>
          {FILTROS.map((f) => (
            <Chip
              key={f.id}
              label={f.rotulo}
              onClick={() => {
                if (f.id === filtro) return;
                setItens([]);
                setTemMais(false);
                setFiltro(f.id);
              }}
              color={filtro === f.id ? 'primary' : 'default'}
              variant={filtro === f.id ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>
        {crianca.podeEditar && (
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setEditando('novo')}>
            Registrar
          </Button>
        )}
      </Box>
      {erro && itens.length === 0 ? (
        <Erro mensagem={erro} tentar={() => carregar(0)} />
      ) : carregando && itens.length === 0 ? (
        <Carregando />
      ) : itens.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: 'center', py: 5 }}>
          Nada registrado {filtro === 'TUDO' ? 'ainda' : 'com este filtro'}.
        </Typography>
      ) : (
        <Box sx={{ maxWidth: 760 }}>
          {grupos.map((g) => (
            <Box key={`${g.mes}-${g.itens[0].data}`} sx={{ mb: 2.5 }}>
              <Typography
                component="h2"
                sx={{
                  display: 'inline-block',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  bgcolor: cor.lilasClaro,
                  color: cor.lilasForte,
                  borderRadius: 999,
                  px: 1.5,
                  py: 0.25,
                  mb: 1.25,
                }}
              >
                {mesDeVidaTexto(g.mes)}
              </Typography>
              <Stack spacing={1.25}>
                {g.itens.map((it) => (
                  <Item
                    key={(it.registro?.id ?? it.medicao?.id) as string}
                    item={it}
                    podeEditar={crianca.podeEditar}
                    editar={setEditando}
                    excluirMedicao={setApagar}
                    verFotos={(fotos, i, r) => setVendo({ fotos, i, legenda: r.texto ?? dataLonga(r.data) })}
                  />
                ))}
              </Stack>
            </Box>
          ))}
          {temMais && (
            <Box sx={{ textAlign: 'center' }}>
              <Button
                onClick={() => carregar(pagina + 1)}
                disabled={carregando}
                startIcon={carregando ? <CircularProgress size={16} /> : undefined}
              >
                Ver mais antigos
              </Button>
            </Box>
          )}
        </Box>
      )}
      <RegistroDialog
        crianca={crianca}
        aberto={editando !== null}
        registro={editando === 'novo' ? null : editando}
        tipoInicial={filtro === 'PESAGEM' || filtro === 'CONSULTA' ? filtro : 'MOMENTO'}
        onFechar={() => setEditando(null)}
        onSalvo={() => {
          setEditando(null);
          alterou();
        }}
      />
      <ConfirmDialog
        open={apagar !== null}
        title="Excluir medição?"
        description={apagar ? `A medição de ${dataLonga(apagar.data)} sai das curvas.` : ''}
        confirmLabel="Excluir"
        destructive
        loading={ocupado}
        onConfirm={excluirMedicao}
        onClose={() => setApagar(null)}
      />
      <Visualizador
        fotos={vendo?.fotos ?? []}
        inicio={vendo?.i ?? 0}
        aberto={vendo !== null}
        onFechar={() => setVendo(null)}
        legenda={vendo && <Typography variant="body2">{vendo.legenda}</Typography>}
      />
    </Box>
  );
}
