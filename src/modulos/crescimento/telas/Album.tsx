import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PhotoLibraryRoundedIcon from '@mui/icons-material/PhotoLibraryRounded';
import { crescimentoApi } from '../api';
import { AlbumDialog } from '../AlbumDialog';
import { Carregando, Erro } from '../componentes';
import { acento, cor } from '../estilo';
import { dataCurta, kg, quando } from '../formato';
import { useCarregar } from '../useCarregar';
import type { Lugar } from '../tipos';
import type { PropsAba } from '.';

const PASTEIS = [cor.rosa, cor.azul, cor.menta, cor.amarelo, cor.lilas];

function Cartao({
  lugar,
  indice,
  onClick,
  forte,
}: Readonly<{ lugar: Lugar; indice: number; onClick?: () => void; forte: string }>) {
  const feito = lugar.situacao === 'FEITO';
  const hoje = lugar.situacao === 'HOJE';
  const futuro = lugar.situacao === 'FUTURO';
  const fundo = PASTEIS[indice % PASTEIS.length];
  const subtitulo = feito
    ? [dataCurta(lugar.data), lugar.pesoKg != null ? kg(lugar.pesoKg) : null].filter(Boolean).join(' · ')
    : futuro && lugar.dias != null
      ? quando(lugar.dias)
      : hoje
        ? 'é agora! Toque para guardar'
        : lugar.dataPrevista
          ? `${dataCurta(lugar.dataPrevista)} · sem foto`
          : 'ainda não';
  return (
    <Box
      component={onClick ? 'button' : 'div'}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      aria-label={`${lugar.titulo}: ${subtitulo}`}
      sx={{
        p: 0,
        border: 0,
        font: 'inherit',
        textAlign: 'left',
        cursor: onClick ? 'pointer' : 'default',
        bgcolor: cor.papel,
        borderRadius: 4,
        overflow: 'hidden',
        boxShadow: feito ? '0 4px 14px rgba(59,47,63,.10)' : 'none',
        outline: hoje ? `3px solid ${cor.amarelo}` : `1px solid ${cor.borda}`,
        opacity: futuro ? 0.6 : 1,
        transition: 'transform .12s',
        '&:hover': onClick ? { transform: 'translateY(-2px)' } : undefined,
        '&:focus-visible': { outline: `3px solid ${cor.lilas}` },
      }}
    >
      <Box sx={{ position: 'relative', aspectRatio: '4 / 5', bgcolor: feito ? cor.creme : `${fundo}33` }}>
        {feito && lugar.capa ? (
          <Box
            component="img"
            src={lugar.capa.urls.mini}
            alt=""
            loading="lazy"
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: forte,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            <Box sx={{ fontSize: lugar.numero && lugar.numero.length > 2 ? '2rem' : '2.75rem' }}>
              {lugar.numero ?? '★'}
            </Box>
            {lugar.unidade && <Box sx={{ fontSize: '0.8rem', mt: 0.5 }}>{lugar.unidade}</Box>}
          </Box>
        )}
        {feito && (
          <Box
            sx={{
              position: 'absolute',
              left: 8,
              bottom: 8,
              minWidth: 40,
              height: 40,
              px: 0.75,
              borderRadius: 999,
              bgcolor: fundo,
              border: `3px solid ${cor.papel}`,
              color: cor.sobrePastel,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.95rem',
            }}
          >
            {lugar.numero ?? '★'}
          </Box>
        )}
        {feito && lugar.quantidadeFotos > 1 && (
          <Box
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              bgcolor: 'rgba(0,0,0,.5)',
              color: '#fff',
              borderRadius: 999,
              px: 0.75,
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.25,
            }}
          >
            <PhotoLibraryRoundedIcon sx={{ fontSize: 12 }} /> {lugar.quantidadeFotos}
          </Box>
        )}
      </Box>
      <Box sx={{ p: 1.25 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: cor.tinta }} noWrap>
          {lugar.titulo}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: hoje ? cor.amareloForte : cor.tintaSuave, fontWeight: hoje ? 700 : 400 }}
          noWrap
          component="p"
        >
          {subtitulo}
        </Typography>
      </Box>
    </Box>
  );
}

function Secao({
  titulo,
  subtitulo,
  children,
}: Readonly<{ titulo: string; subtitulo?: string; children: React.ReactNode }>) {
  return (
    <Box component="section" sx={{ mb: 3 }}>
      <Typography component="h2" variant="h4" sx={{ mb: 0.25 }}>
        {titulo}
      </Typography>
      {subtitulo && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {subtitulo}
        </Typography>
      )}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1.5 }}>
        {children}
      </Box>
    </Box>
  );
}

export function AlbumTela({ crianca, versao, alterou }: Readonly<PropsAba>) {
  const { dados: album, erro, recarregar } = useCarregar(() => crescimentoApi.album(crianca.id), [crianca.id, versao]);
  const [aberto, setAberto] = useState<{ lugar: Lugar | null } | null>(null);
  const forte = acento(crianca.sexo).forte;

  if (erro && !album) return <Erro mensagem={erro} tentar={recarregar} />;
  if (!album) return <Carregando />;

  const feitas = album.primeirasVezes.filter((l) => l.situacao === 'FEITO');
  const faltam = album.primeirasVezes.filter((l) => l.situacao !== 'FEITO');
  const abrir = (l: Lugar) =>
    crianca.podeEditar || l.situacao === 'FEITO' ? () => setAberto({ lugar: l }) : undefined;
  return (
    <Box>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {album.totalFotos} {album.totalFotos === 1 ? 'foto' : 'fotos'} · {album.mesversariosComFoto} de{' '}
        {album.mesversariosPassados} mêsversários com foto · {album.primeirasVezesFeitas} primeiras vezes
      </Typography>
      <Secao titulo="Mêsversários" subtitulo="Uma foto por mês, do nascimento ao primeiro ano e além.">
        {album.mesversarios.map((l, i) => (
          <Cartao key={l.chave} lugar={l} indice={i} onClick={abrir(l)} forte={forte} />
        ))}
      </Secao>
      <Secao titulo="Primeiras vezes" subtitulo={faltam.length > 0 ? 'Toque numa delas quando acontecer.' : undefined}>
        {feitas.map((l, i) => (
          <Cartao key={l.chave} lugar={l} indice={i + 2} onClick={abrir(l)} forte={forte} />
        ))}
      </Secao>
      {faltam.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: -1.5, mb: 3 }}>
          {faltam.map((l) => (
            <Box
              key={l.chave}
              component="button"
              type="button"
              onClick={abrir(l)}
              disabled={!crianca.podeEditar}
              sx={{
                border: `1px dashed ${cor.rosa}`,
                bgcolor: cor.papel,
                color: cor.tinta,
                borderRadius: 999,
                px: 1.5,
                py: 0.75,
                font: 'inherit',
                fontSize: '0.8125rem',
                cursor: crianca.podeEditar ? 'pointer' : 'default',
                '&:hover': { bgcolor: cor.rosaClaro },
              }}
            >
              {l.titulo}
            </Box>
          ))}
        </Box>
      )}
      <Secao titulo="Momentos especiais" subtitulo="Batizado, primeira viagem, visita dos avós...">
        {album.especiais.map((l, i) => (
          <Cartao key={l.chave} lugar={l} indice={i + 4} onClick={abrir(l)} forte={forte} />
        ))}
        {crianca.podeEditar && (
          <Box
            component="button"
            type="button"
            onClick={() => setAberto({ lugar: null })}
            sx={{
              border: `2px dashed ${cor.lilas}`,
              borderRadius: 4,
              bgcolor: cor.lilasClaro,
              color: cor.lilasForte,
              font: 'inherit',
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: 160,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0.5,
            }}
          >
            <AddRoundedIcon sx={{ fontSize: 32 }} />
            Novo momento
          </Box>
        )}
      </Secao>
      <AlbumDialog
        crianca={crianca}
        aberto={aberto !== null}
        lugar={aberto?.lugar ?? null}
        onFechar={() => setAberto(null)}
        onSalvo={() => {
          setAberto(null);
          alterou();
        }}
      />
    </Box>
  );
}
