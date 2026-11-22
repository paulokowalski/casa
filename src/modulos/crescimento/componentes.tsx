import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  LinearProgress,
  Skeleton,
  Tooltip,
  Typography,
} from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ChildCareRoundedIcon from '@mui/icons-material/ChildCareRounded';
import { crescimentoApi } from './api';
import { acento, cor } from './estilo';
import type { Crianca, Foto } from './tipos';

export function Carregando({ linhas = 3 }: Readonly<{ linhas?: number }>) {
  return (
    <Box sx={{ display: 'grid', gap: 1.5 }} aria-busy="true" aria-label="Carregando">
      {Array.from({ length: linhas }, (_, i) => (
        <Skeleton key={i} variant="rounded" height={i === 0 ? 120 : 64} />
      ))}
    </Box>
  );
}

export function Erro({ mensagem, tentar }: Readonly<{ mensagem: string; tentar?: () => void }>) {
  return (
    <Alert
      severity="error"
      action={
        tentar && (
          <Button color="inherit" size="small" onClick={tentar}>
            Tentar de novo
          </Button>
        )
      }
    >
      {mensagem}
    </Alert>
  );
}

export function AvatarCrianca({ crianca, tamanho = 48 }: Readonly<{ crianca: Crianca; tamanho?: number }>) {
  const a = acento(crianca.sexo);
  return (
    <Avatar
      src={crianca.foto?.urls.mini}
      alt={crianca.nome}
      sx={{ width: tamanho, height: tamanho, bgcolor: a.claro, color: a.forte, border: `3px solid ${a.medio}` }}
    >
      <ChildCareRoundedIcon sx={{ fontSize: tamanho * 0.55 }} />
    </Avatar>
  );
}

/** Miniatura quadrada (recortada) de uma foto. */
export function Miniatura({
  foto,
  tamanho,
  raio = 2,
  onClick,
  rotulo,
}: Readonly<{ foto: Foto; tamanho?: number | string; raio?: number; onClick?: () => void; rotulo?: string }>) {
  return (
    <Box
      component={onClick ? 'button' : 'div'}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={rotulo ?? 'Ver foto'}
      sx={{
        p: 0,
        border: 0,
        cursor: onClick ? 'zoom-in' : 'default',
        width: tamanho ?? '100%',
        aspectRatio: '1 / 1',
        borderRadius: raio,
        overflow: 'hidden',
        bgcolor: cor.rosaClaro,
        display: 'block',
        '&:focus-visible': { outline: `3px solid ${cor.lilas}`, outlineOffset: 2 },
      }}
    >
      <Box
        component="img"
        src={foto.urls.mini}
        alt=""
        loading="lazy"
        sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </Box>
  );
}

/** Foto em tela cheia, com navegação entre as fotos. */
export function Visualizador({
  fotos,
  inicio,
  aberto,
  onFechar,
  legenda,
}: Readonly<{ fotos: Foto[]; inicio: number; aberto: boolean; onFechar: () => void; legenda?: ReactNode }>) {
  const [i, setI] = useState(inicio);
  useEffect(() => setI(inicio), [inicio, aberto]);
  const toque = useRef<{ x: number; y: number } | null>(null);
  const foto = fotos[Math.min(i, fotos.length - 1)];
  useEffect(() => {
    if (!aberto) return;
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1));
      if (e.key === 'ArrowRight') setI((x) => Math.min(fotos.length - 1, x + 1));
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [aberto, fotos.length]);
  if (!foto) return null;
  return (
    <Dialog open={aberto} onClose={onFechar} fullScreen slotProps={{ paper: { sx: { bgcolor: '#111' } } }}>
      <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1, zIndex: 1 }}>
        <Tooltip title="Baixar original">
          <IconButton
            component="a"
            href={foto.urls.original}
            download
            sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,.4)' }}
          >
            <DownloadRoundedIcon />
          </IconButton>
        </Tooltip>
        <IconButton onClick={onFechar} aria-label="Fechar" sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,.4)' }}>
          <CloseIcon />
        </IconButton>
      </Box>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1,
          minHeight: 0,
          touchAction: 'pan-y pinch-zoom',
        }}
        onClick={onFechar}
        // deslizar para os lados troca de foto
        onTouchStart={(e) => {
          const t = e.touches[0];
          toque.current = e.touches.length === 1 && t ? { x: t.clientX, y: t.clientY } : null;
        }}
        onTouchEnd={(e) => {
          const ini = toque.current;
          const t = e.changedTouches[0];
          toque.current = null;
          if (!ini || !t) return;
          const dx = t.clientX - ini.x;
          if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(t.clientY - ini.y)) return;
          setI((x) => (dx < 0 ? Math.min(fotos.length - 1, x + 1) : Math.max(0, x - 1)));
        }}
      >
        <Box
          component="img"
          src={foto.urls.media}
          alt=""
          onClick={(e) => e.stopPropagation()}
          sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 1 }}
        />
      </Box>
      {fotos.length > 1 && (
        <>
          <IconButton
            aria-label="Foto anterior"
            disabled={i === 0}
            onClick={() => setI(i - 1)}
            sx={{ position: 'absolute', left: 8, top: '50%', color: '#fff', bgcolor: 'rgba(0,0,0,.4)' }}
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            aria-label="Próxima foto"
            disabled={i === fotos.length - 1}
            onClick={() => setI(i + 1)}
            sx={{ position: 'absolute', right: 8, top: '50%', color: '#fff', bgcolor: 'rgba(0,0,0,.4)' }}
          >
            <ChevronRightIcon />
          </IconButton>
        </>
      )}
      <Box sx={{ color: '#eee', textAlign: 'center', p: 1.5, pb: 'calc(12px + env(safe-area-inset-bottom))' }}>
        {legenda}
        {fotos.length > 1 && (
          <Typography variant="caption" sx={{ color: '#aaa', display: 'block' }}>
            {i + 1} de {fotos.length}
          </Typography>
        )}
        {fotos.length > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, overflowX: 'auto', mt: 1, p: 0.5 }}>
            {fotos.map((f, k) => (
              <Box
                key={f.id}
                component="button"
                type="button"
                aria-label={`Foto ${k + 1}`}
                aria-current={k === i ? 'true' : undefined}
                onClick={() => setI(k)}
                sx={{
                  flex: '0 0 48px',
                  height: 48,
                  p: 0,
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  bgcolor: 'transparent',
                  border: `3px solid ${k === i ? cor.amarelo : 'transparent'}`,
                  opacity: k === i ? 1 : 0.55,
                  transition: 'opacity .2s',
                  '&:hover': { opacity: 1 },
                }}
              >
                <Box
                  component="img"
                  src={f.urls.mini}
                  alt=""
                  loading="lazy"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Dialog>
  );
}

/**
 * Escolha de fotos para um registro: envia na hora (para a API reduzir e tirar a localização) e devolve a lista.
 * A última foto é a capa no álbum. `novas` guarda as enviadas aqui, para apagar se o usuário desistir.
 */
export function SeletorFotos({
  criancaId,
  fotos,
  onChange,
  novas,
  comCapa,
  onEnviando,
}: Readonly<{
  criancaId: string;
  fotos: Foto[];
  onChange: (fotos: Foto[]) => void;
  novas: React.MutableRefObject<Set<string>>;
  comCapa?: boolean;
  /** avisa o diálogo enquanto há envio, para ele não salvar nem fechar no meio (as fotos ficariam órfãs) */
  onEnviando?: (enviando: boolean) => void;
}>) {
  const input = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState<{ feitas: number; total: number } | null>(null);
  const [erros, setErros] = useState<string[]>([]);
  const atual = useRef(fotos);
  atual.current = fotos;

  async function enviar(arquivos: FileList | null) {
    if (!arquivos?.length) return;
    const lista = Array.from(arquivos);
    setErros([]);
    setEnviando({ feitas: 0, total: lista.length });
    onEnviando?.(true);
    const problemas: string[] = [];
    try {
      for (const [n, arq] of lista.entries()) {
        try {
          const f = await crescimentoApi.enviarFoto(criancaId, arq);
          if (!f.jaExistia) novas.current.add(f.id);
          if (!atual.current.some((x) => x.id === f.id)) onChange([...atual.current, f]);
        } catch (e) {
          problemas.push((e as Error).message);
        }
        setEnviando({ feitas: n + 1, total: lista.length });
      }
    } finally {
      setEnviando(null);
      onEnviando?.(false);
    }
    setErros(problemas);
    if (input.current) input.current.value = '';
  }

  const capa = fotos.length - 1;
  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(84px, 1fr))', gap: 1 }}>
        {fotos.map((f, i) => (
          <Box key={f.id} sx={{ position: 'relative' }}>
            <Miniatura foto={f} />
            <IconButton
              size="small"
              aria-label="Tirar esta foto"
              onClick={() => onChange(fotos.filter((x) => x.id !== f.id))}
              sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,.85)', p: 0.25 }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
            {comCapa && fotos.length > 1 && (
              <Tooltip title={i === capa ? 'Capa' : 'Usar como capa'}>
                <IconButton
                  size="small"
                  aria-label={i === capa ? 'Capa' : 'Usar como capa'}
                  onClick={() => onChange([...fotos.filter((x) => x.id !== f.id), f])}
                  sx={{ position: 'absolute', bottom: 2, right: 2, bgcolor: 'rgba(255,255,255,.85)', p: 0.25 }}
                >
                  {i === capa ? (
                    <StarRoundedIcon sx={{ fontSize: 18, color: cor.amareloForte }} />
                  ) : (
                    <StarBorderRoundedIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ))}
        <Box
          component="button"
          type="button"
          disabled={Boolean(enviando)}
          onClick={() => input.current?.click()}
          sx={{
            aspectRatio: '1 / 1',
            borderRadius: 2,
            border: `2px dashed ${cor.rosa}`,
            bgcolor: cor.rosaClaro,
            color: cor.rosaForte,
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            font: 'inherit',
            fontSize: '0.75rem',
            fontWeight: 600,
            '&:focus-visible': { outline: `3px solid ${cor.lilas}` },
          }}
        >
          {enviando ? <CircularProgress size={22} sx={{ color: cor.rosaForte }} /> : <AddPhotoAlternateOutlinedIcon />}
          {enviando ? `${enviando.feitas}/${enviando.total}` : 'Fotos'}
        </Box>
      </Box>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => enviar(e.target.files)} />
      {enviando && (
        <LinearProgress
          variant="determinate"
          value={(enviando.feitas / enviando.total) * 100}
          sx={{ mt: 1, borderRadius: 1 }}
          aria-label="Enviando fotos"
        />
      )}
      {comCapa && fotos.length > 1 && (
        <Typography variant="caption" sx={{ display: 'block', mt: 0.75 }}>
          A foto com estrela é a capa no álbum.
        </Typography>
      )}
      {erros.map((e) => (
        <Alert key={e} severity="warning" sx={{ mt: 1 }}>
          {e}
        </Alert>
      ))}
    </Box>
  );
}

/** Cartão colorido com ícone e texto (atalhos e destaques). */
export function Bloco({
  fundo,
  children,
  onClick,
  sx,
}: Readonly<{ fundo: string; children: ReactNode; onClick?: () => void; sx?: object }>) {
  return (
    <Box
      component={onClick ? 'button' : 'div'}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      sx={{
        bgcolor: fundo,
        borderRadius: 4,
        p: 2,
        border: 0,
        textAlign: 'left',
        font: 'inherit',
        color: cor.tinta,
        cursor: onClick ? 'pointer' : 'default',
        width: '100%',
        transition: 'transform .12s',
        '&:hover': onClick ? { transform: 'translateY(-1px)' } : undefined,
        '&:focus-visible': { outline: `3px solid ${cor.lilas}`, outlineOffset: 2 },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
