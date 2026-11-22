import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, IconButton, Typography } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import { cor, fonte, sombraFofa } from './estilo';
import { dataCurta } from './formato';
import type { Album, Lugar, TipoLugar } from './tipos';

const TIPO: Record<TipoLugar, { rotulo: string; fundo: string }> = {
  MESVERSARIO: { rotulo: 'Mêsversário', fundo: cor.amarelo },
  PRIMEIRA_VEZ: { rotulo: 'Primeira vez', fundo: cor.rosa },
  ESPECIAL: { rotulo: 'Especial', fundo: cor.lilas },
};

/** Cores da "fita adesiva" que prende cada polaroid. */
const FITAS = [cor.amarelo, cor.azul, cor.menta, cor.rosa, cor.lilas];
/** Inclinação de cada polaroid, para parecerem coladas à mão. */
const GIROS = [-2, 2, -1];

const INTERVALO_MS = 4500;

/** Páginas do álbum que já têm foto, da mais recente para a mais antiga. */
function paginasComFoto(album: Album): Lugar[] {
  return [...album.mesversarios, ...album.primeirasVezes, ...album.especiais]
    .filter((l) => l.capa)
    .sort((a, b) => (b.data ?? b.dataPrevista ?? '').localeCompare(a.data ?? a.dataPrevista ?? ''));
}

function titulo(l: Lugar) {
  if (l.tipo === 'MESVERSARIO' && l.numero && /^\d/.test(l.numero)) return `${l.numero} ${l.unidade ?? ''}`.trim();
  return l.titulo;
}

/**
 * Carrossel do álbum em polaroids: deslizar com o dedo (scroll-snap), setas no computador, indicadores e troca
 * automática (pausa ao tocar, passar o mouse, com `parado` ou com "reduzir movimento"). Tocar abre as fotos da página.
 */
export function CarrosselAlbum({
  album,
  onAbrir,
  onVerTudo,
  parado = false,
}: Readonly<{ album: Album; onAbrir: (l: Lugar) => void; onVerTudo: () => void; parado?: boolean }>) {
  const paginas = useMemo(() => paginasComFoto(album), [album]);
  const trilho = useRef<HTMLDivElement>(null);
  const [ativo, setAtivo] = useState(0);
  const [pausado, setPausado] = useState(false);

  // centraliza o cartão i no trilho
  const irPara = useCallback((i: number) => {
    const el = trilho.current;
    const alvo = el?.children[i] as HTMLElement | undefined;
    if (!el || !alvo) return;
    el.scrollTo({
      left: alvo.offsetLeft - el.offsetLeft - (el.clientWidth - alvo.clientWidth) / 2,
      behavior: 'smooth',
    });
  }, []);

  // qual cartão está mais perto do centro do trilho
  const aoRolar = () => {
    const el = trilho.current;
    if (!el) return;
    const centro = el.scrollLeft + el.clientWidth / 2 + el.offsetLeft;
    let melhor = 0;
    let menor = Infinity;
    Array.from(el.children).forEach((c, i) => {
      const h = c as HTMLElement;
      const d = Math.abs(h.offsetLeft + h.clientWidth / 2 - centro);
      if (d < menor) {
        menor = d;
        melhor = i;
      }
    });
    setAtivo(melhor);
  };

  useEffect(() => {
    if (pausado || parado || paginas.length < 2) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const t = window.setInterval(() => {
      if (document.hidden) return;
      irPara(ativo + 1 >= paginas.length ? 0 : ativo + 1);
    }, INTERVALO_MS);
    return () => window.clearInterval(t);
  }, [ativo, pausado, parado, paginas.length, irPara]);

  if (paginas.length === 0) return null;

  const seta = (lado: 'esq' | 'dir') => (
    <IconButton
      aria-label={lado === 'esq' ? 'Página anterior' : 'Próxima página'}
      onClick={() => irPara(lado === 'esq' ? Math.max(0, ativo - 1) : Math.min(paginas.length - 1, ativo + 1))}
      disabled={lado === 'esq' ? ativo === 0 : ativo >= paginas.length - 1}
      sx={{
        display: { xs: 'none', sm: 'inline-flex' },
        position: 'absolute',
        top: '42%',
        [lado === 'esq' ? 'left' : 'right']: 4,
        transform: 'translateY(-50%)',
        zIndex: 2,
        width: 46,
        height: 46,
        bgcolor: cor.papel,
        color: cor.rosaForte,
        boxShadow: sombraFofa,
        '&:hover': { bgcolor: cor.papel, transform: 'translateY(-50%) scale(1.06)' },
        '&.Mui-disabled': { opacity: 0, pointerEvents: 'none' },
        transition: 'opacity .2s, transform .2s',
      }}
    >
      {lado === 'esq' ? <ChevronLeftRoundedIcon /> : <ChevronRightRoundedIcon />}
    </IconButton>
  );

  return (
    <Box
      component="section"
      aria-roledescription="carrossel"
      aria-label="Álbum"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
      onTouchStart={() => setPausado(true)}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
        <Typography
          component="h2"
          sx={{ fontFamily: fonte.titulo, fontWeight: 800, fontSize: '1.75rem', lineHeight: 1.1 }}
        >
          Nosso álbum
        </Typography>
        <Button
          size="small"
          onClick={onVerTudo}
          endIcon={<ChevronRightRoundedIcon />}
          sx={{ fontWeight: 800, color: cor.rosaForte }}
        >
          Ver tudo
        </Button>
      </Box>

      <Box sx={{ position: 'relative' }}>
        {seta('esq')}
        <Box
          ref={trilho}
          onScroll={aoRolar}
          sx={{
            display: 'flex',
            gap: 2.25,
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            // espaço para a fita, a inclinação e a sombra não serem cortadas pela rolagem
            px: 1.5,
            pt: 2.5,
            pb: 3,
            mx: -1.5,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {paginas.map((l, i) => {
            const t = TIPO[l.tipo];
            const atual = i === ativo;
            const giro = GIROS[i % GIROS.length];
            return (
              <Box
                key={l.chave}
                component="button"
                type="button"
                onClick={() => onAbrir(l)}
                aria-label={`Ver as fotos de ${l.titulo}`}
                aria-current={atual ? 'true' : undefined}
                sx={{
                  flex: { xs: '0 0 74%', sm: '0 0 44%', md: '0 0 31%', lg: '0 0 23%', xl: '0 0 18.5%' },
                  maxWidth: 380,
                  scrollSnapAlign: 'center',
                  position: 'relative',
                  bgcolor: cor.papel,
                  border: 0,
                  borderRadius: '6px',
                  p: '12px 12px 14px',
                  cursor: 'pointer',
                  font: 'inherit',
                  color: cor.tinta,
                  textAlign: 'center',
                  boxShadow: sombraFofa,
                  transform: atual ? 'rotate(0deg) scale(1.03)' : `rotate(${giro}deg)`,
                  transition: 'transform .35s cubic-bezier(.3,1.6,.5,1)',
                  '&:hover img': { transform: 'scale(1.05)' },
                  '&:focus-visible': { outline: `3px solid ${cor.lilasForte}`, outlineOffset: 3 },
                  '@media (prefers-reduced-motion: reduce)': { transition: 'none', '& img': { transition: 'none' } },
                }}
              >
                {/* fita adesiva */}
                <Box
                  aria-hidden
                  sx={{
                    position: 'absolute',
                    top: -10,
                    left: '50%',
                    width: 76,
                    height: 22,
                    transform: 'translateX(-50%) rotate(-3deg)',
                    bgcolor: FITAS[i % FITAS.length],
                    opacity: 0.85,
                    borderRadius: '3px',
                    zIndex: 1,
                  }}
                />
                <Box sx={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: '3px', overflow: 'hidden' }}>
                  <Box
                    component="img"
                    src={l.capa!.urls.media}
                    alt=""
                    loading={i < 3 ? 'eager' : 'lazy'}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      bgcolor: cor.rosaClaro,
                      transition: 'transform .6s cubic-bezier(.2,.8,.2,1)',
                    }}
                  />
                  {l.chave !== 'nascimento' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        px: 1.25,
                        py: 0.3,
                        borderRadius: 99,
                        bgcolor: t.fundo,
                        color: cor.sobrePastel,
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        letterSpacing: 0.4,
                        textTransform: 'uppercase',
                      }}
                    >
                      {t.rotulo}
                    </Box>
                  )}
                  {l.quantidadeFotos > 1 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 8,
                        bottom: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        px: 1,
                        py: 0.3,
                        borderRadius: 99,
                        bgcolor: 'rgba(23,23,28,0.8)',
                        color: cor.tinta,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                      }}
                    >
                      <PhotoLibraryRoundedIcon sx={{ fontSize: 14, color: cor.rosaForte }} />
                      {l.quantidadeFotos} fotos
                    </Box>
                  )}
                </Box>
                <Typography
                  sx={{
                    fontFamily: fonte.mao,
                    fontWeight: 600,
                    fontSize: '1.75rem',
                    lineHeight: 1.05,
                    mt: 1.25,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {titulo(l)}
                </Typography>
                <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: cor.tintaSuave }}>
                  {dataCurta(l.data ?? l.dataPrevista)}
                  {l.pesoKg ? ` · ${l.pesoKg.toLocaleString('pt-BR', { maximumFractionDigits: 3 })} kg` : ''}
                </Typography>
              </Box>
            );
          })}
        </Box>
        {seta('dir')}
      </Box>

      {paginas.length > 12 && (
        <Typography
          variant="caption"
          sx={{ display: 'block', textAlign: 'center', color: cor.tintaSuave, fontWeight: 700 }}
        >
          {ativo + 1} de {paginas.length}
        </Typography>
      )}
      {paginas.length > 1 && paginas.length <= 12 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
          {paginas.map((l, i) => (
            <Box
              key={l.chave}
              component="button"
              type="button"
              aria-label={`Ir para ${l.titulo}`}
              onClick={() => irPara(i)}
              sx={{
                p: 0,
                border: 0,
                cursor: 'pointer',
                height: 10,
                width: i === ativo ? 26 : 10,
                borderRadius: 99,
                bgcolor: i === ativo ? cor.rosaForte : cor.borda,
                transition: 'width .3s, background-color .3s',
              }}
            />
          ))}
        </Box>
      )}
      <Typography
        sx={{ textAlign: 'center', fontFamily: fonte.mao, fontSize: '1.35rem', color: cor.tintaSuave, mt: 0.5 }}
      >
        Toque numa foto para ver todas
      </Typography>
    </Box>
  );
}
