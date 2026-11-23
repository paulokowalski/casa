import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import ChildCareRoundedIcon from '@mui/icons-material/ChildCareRounded';
import { crescimentoApi } from '../api';
import { AvatarCrianca, Carregando, Erro } from '../componentes';
import { CriancaDialog } from '../CriancaDialog';
import { FamiliaDialog } from '../FamiliaDialog';
import { cor } from '../estilo';
import { primeiroNome } from '../formato';
import { useCarregar } from '../useCarregar';
import type { Crianca, Familia } from '../tipos';

const Inicio = lazy(() => import('./Inicio').then((m) => ({ default: m.Inicio })));
const AlbumTela = lazy(() => import('./Album').then((m) => ({ default: m.AlbumTela })));
const Diario = lazy(() => import('./Diario').then((m) => ({ default: m.Diario })));
const Curvas = lazy(() => import('./Curvas').then((m) => ({ default: m.Curvas })));
const MarcosTela = lazy(() => import('./Marcos').then((m) => ({ default: m.MarcosTela })));
const VacinasTela = lazy(() => import('./Vacinas').then((m) => ({ default: m.VacinasTela })));
const ExamesTela = lazy(() => import('./Exames').then((m) => ({ default: m.ExamesTela })));

export type Aba = 'inicio' | 'album' | 'diario' | 'curvas' | 'marcos' | 'vacinas' | 'exames';
const ABAS: { id: Aba; rotulo: string }[] = [
  { id: 'inicio', rotulo: 'Início' },
  { id: 'album', rotulo: 'Álbum' },
  { id: 'diario', rotulo: 'Diário' },
  { id: 'curvas', rotulo: 'Curvas' },
  { id: 'marcos', rotulo: 'Marcos' },
  { id: 'vacinas', rotulo: 'Vacinas' },
  { id: 'exames', rotulo: 'Exames' },
];
const ULTIMA = 'crescimento.ultimaCrianca';

function lerUltima(): string | null {
  try {
    return localStorage.getItem(ULTIMA);
  } catch {
    return null;
  }
}

interface Dados {
  familias: Familia[];
  criancas: Crianca[];
}

async function carregarTudo(): Promise<Dados> {
  const familias = await crescimentoApi.familias();
  const listas = await Promise.all(familias.map((f) => crescimentoApi.criancas(f.id)));
  return { familias, criancas: listas.flat() };
}

/** Primeiro acesso: cria a família e cadastra a primeira criança. */
function BoasVindas({ onCriada }: Readonly<{ onCriada: (f: Familia) => void }>) {
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);
  return (
    <Box sx={{ maxWidth: 460, mx: 'auto', textAlign: 'center', py: 6 }}>
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          bgcolor: cor.rosaClaro,
          color: cor.rosaForte,
          mx: 'auto',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChildCareRoundedIcon sx={{ fontSize: 48 }} />
      </Box>
      <Typography variant="h2" sx={{ mb: 1 }}>
        Crescimento das crianças
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Fotos dos mêsversários, diário, curvas da OMS, marcos, vacinas e exames, num lugar só. Comece dando um nome à
        família.
      </Typography>
      <Stack direction="row" spacing={1}>
        <TextField
          fullWidth
          size="small"
          label="Nome da família"
          placeholder="Kowalski"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <Button
          variant="contained"
          disabled={!nome.trim() || ocupado}
          onClick={async () => {
            setOcupado(true);
            try {
              onCriada(await crescimentoApi.criarFamilia(nome.trim()));
            } catch (e) {
              setErro((e as Error).message);
            } finally {
              setOcupado(false);
            }
          }}
        >
          Criar
        </Button>
      </Stack>
      {erro && <Erro mensagem={erro} />}
    </Box>
  );
}

export function CrescimentoView() {
  const [params, setParams] = useSearchParams();
  const { dados, erro, carregando, recarregar, setDados } = useCarregar(carregarTudo, []);
  const [versao, setVersao] = useState(0);
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const [editarCrianca, setEditarCrianca] = useState<Crianca | null | 'nova'>(null);
  const [familiaAberta, setFamiliaAberta] = useState(false);

  const criancas = useMemo(() => dados?.criancas ?? [], [dados]);
  const idEscolhido = params.get('c') ?? lerUltima();
  const crianca = criancas.find((c) => c.id === idEscolhido) ?? criancas[0] ?? null;
  const familia = dados?.familias.find((f) => f.id === crianca?.familiaId) ?? dados?.familias[0] ?? null;
  const aba = (ABAS.some((a) => a.id === params.get('aba')) ? params.get('aba') : 'inicio') as Aba;

  useEffect(() => {
    if (!crianca) return;
    try {
      localStorage.setItem(ULTIMA, crianca.id);
    } catch {
      /* sem armazenamento: só não lembra */
    }
  }, [crianca]);

  function ir(novaAba: Aba, criancaId = crianca?.id) {
    const p = new URLSearchParams(params);
    if (criancaId) p.set('c', criancaId);
    p.set('aba', novaAba);
    setParams(p, { replace: novaAba === aba });
    window.scrollTo({ top: 0 });
  }

  /** Depois de qualquer alteração: recarrega os dados da criança (foto, idade) e a aba. */
  function alterou() {
    setVersao((v) => v + 1);
    if (crianca)
      crescimentoApi
        .criancas(crianca.familiaId)
        .then((lista) =>
          setDados(
            (d) => d && { ...d, criancas: [...d.criancas.filter((c) => c.familiaId !== crianca.familiaId), ...lista] },
          ),
        )
        .catch(() => undefined);
  }

  if (carregando && !dados) return <Carregando />;
  if (erro && !dados) return <Erro mensagem={erro} tentar={recarregar} />;
  if (!dados) return null;
  if (dados.familias.length === 0)
    return (
      <BoasVindas
        onCriada={(f) => {
          setDados({ familias: [f], criancas: [] });
          setEditarCrianca('nova');
        }}
      />
    );

  const responsavel = familia?.meuPapel === 'RESPONSAVEL';
  const props = crianca ? { crianca, versao, alterou, ir } : null;

  return (
    <Box>
      {/* cabeçalho */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        {crianca && <AvatarCrianca crianca={crianca} tamanho={56} />}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography component="h1" variant="h2" sx={{ fontSize: { xs: '1.375rem', md: '1.5rem' } }} noWrap>
            {crianca ? crianca.nome : 'Crescimento'}
          </Typography>
          {crianca && (
            <Typography color="text.secondary" variant="body2">
              {crianca.idade}
              {crianca.prematuro &&
                crianca.idadeCorrigidaDias != null &&
                ' · prematuro (curvas e marcos pela idade corrigida)'}
            </Typography>
          )}
        </Box>
        <IconButton aria-label="Mais opções" onClick={(e) => setMenu(e.currentTarget)}>
          <MoreVertRoundedIcon />
        </IconButton>
        <Menu anchorEl={menu} open={Boolean(menu)} onClose={() => setMenu(null)}>
          {crianca?.podeEditar && (
            <MenuItem
              onClick={() => {
                setMenu(null);
                setEditarCrianca(crianca);
              }}
            >
              <ListItemIcon>
                <EditOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Dados de {primeiroNome(crianca.nome)}
            </MenuItem>
          )}
          {responsavel && (
            <MenuItem
              onClick={() => {
                setMenu(null);
                setEditarCrianca('nova');
              }}
            >
              <ListItemIcon>
                <AddRoundedIcon fontSize="small" />
              </ListItemIcon>
              Nova criança
            </MenuItem>
          )}
          {familia && (
            <MenuItem
              onClick={() => {
                setMenu(null);
                setFamiliaAberta(true);
              }}
            >
              <ListItemIcon>
                <GroupOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Família e permissões
            </MenuItem>
          )}
        </Menu>
      </Box>

      {criancas.length > 1 && (
        <Stack direction="row" spacing={1} sx={{ mb: 1.5, overflowX: 'auto', pb: 0.5 }}>
          {criancas.map((c) => (
            <Chip
              key={c.id}
              label={primeiroNome(c.nome)}
              avatar={<AvatarCrianca crianca={c} tamanho={24} />}
              color={c.id === crianca?.id ? 'primary' : 'default'}
              variant={c.id === crianca?.id ? 'filled' : 'outlined'}
              onClick={() => ir(aba, c.id)}
            />
          ))}
        </Stack>
      )}

      {!crianca ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Nenhuma criança cadastrada ainda.
          </Typography>
          {responsavel && (
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setEditarCrianca('nova')}>
              Cadastrar criança
            </Button>
          )}
        </Box>
      ) : (
        <>
          <Tabs
            value={aba}
            onChange={(_e, v: Aba) => ir(v)}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            {ABAS.map((a) => (
              <Tab key={a.id} value={a.id} label={a.rotulo} sx={{ minWidth: 72 }} />
            ))}
          </Tabs>
          <Suspense fallback={<LinearProgress aria-label="Carregando" />}>
            {props && aba === 'inicio' && <Inicio key={crianca.id} {...props} />}
            {props && aba === 'album' && <AlbumTela key={crianca.id} {...props} />}
            {props && aba === 'diario' && <Diario key={crianca.id} {...props} />}
            {props && aba === 'curvas' && <Curvas key={crianca.id} {...props} />}
            {props && aba === 'marcos' && <MarcosTela key={crianca.id} {...props} />}
            {props && aba === 'vacinas' && <VacinasTela key={crianca.id} {...props} />}
            {props && aba === 'exames' && <ExamesTela key={crianca.id} {...props} />}
          </Suspense>
        </>
      )}

      {familia && (
        <CriancaDialog
          familiaId={familia.id}
          aberto={editarCrianca !== null}
          crianca={editarCrianca === 'nova' ? null : editarCrianca}
          onFechar={() => setEditarCrianca(null)}
          onSalvo={(c) => {
            setEditarCrianca(null);
            if (c) {
              setDados((d) => d && { ...d, criancas: [...d.criancas.filter((x) => x.id !== c.id), c] });
              ir(aba, c.id);
              setVersao((v) => v + 1);
            } else {
              const p = new URLSearchParams(params);
              p.delete('c');
              setParams(p, { replace: true });
              recarregar();
            }
          }}
        />
      )}
      {familia && (
        <FamiliaDialog
          familia={familia}
          aberto={familiaAberta}
          onFechar={() => setFamiliaAberta(false)}
          onAlterada={(f) =>
            f ? setDados((d) => d && { ...d, familias: d.familias.map((x) => (x.id === f.id ? f : x)) }) : recarregar()
          }
        />
      )}
    </Box>
  );
}

export interface PropsAba {
  crianca: Crianca;
  /** Muda depois de cada alteração: as abas recarregam. */
  versao: number;
  alterou: () => void;
  ir: (aba: Aba) => void;
}
