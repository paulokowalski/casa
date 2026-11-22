import { useMemo, useState } from 'react';
import { keyframes } from '@emotion/react';
import { Alert, Box, Button, Typography } from '@mui/material';
import ChildCareRoundedIcon from '@mui/icons-material/ChildCareRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { crescimentoApi } from '../api';
import { AlbumDialog } from '../AlbumDialog';
import { CarrosselAlbum } from '../CarrosselAlbum';
import { Bloco, Carregando, Erro, Visualizador } from '../componentes';
import { acento, cor, fonte, sombraFofa } from '../estilo';
import { cm, dataCurta, gramas, kg, percentil, primeiroNome, quando } from '../formato';
import { ResumoMesCartao } from '../ResumoMesCartao';
import { useCarregar } from '../useCarregar';
import type { Album, Chamada, Compromisso, Crianca, Faixa, FaixaMarcos, Foto, Lugar, Marcos, Resumo } from '../tipos';
import type { PropsAba } from '.';

const flutua = keyframes`50% { transform: translateY(-5px) rotate(-4deg); }`;
const semMovimento = { '@media (prefers-reduced-motion: reduce)': { animation: 'none', transition: 'none' } };

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const titulo = { fontFamily: fonte.titulo, fontWeight: 800, lineHeight: 1.1 } as const;

// ---------- Medidas: comparações para criança (e adulto) entender ----------

/** Valor mínimo → objeto do mesmo peso (kg). Vale o último cujo mínimo o valor alcança. */
const PESO_COMO: [number, string][] = [
  [0, 'um melão'],
  [2.8, 'um gatinho'],
  [4.5, 'um saco de arroz de 5 kg'],
  [6, 'uma melancia pequena'],
  [7.5, 'uma melancia'],
  [9.5, 'um cachorrinho beagle'],
  [12, 'uma abóbora gigante'],
  [15, 'um pneu de carro'],
  [19, 'um galão de água de 20 litros'],
];

/** Valor mínimo → objeto do mesmo tamanho (cm). */
const ALTURA_COMO: [number, string][] = [
  [0, 'um ursinho de pelúcia'],
  [60, 'um violão infantil'],
  [72, 'um violão'],
  [85, 'uma cadeira'],
  [95, 'um pinguim-imperador'],
  [110, 'um canguru pequeno'],
];

function como(tabela: [number, string][], valor: number) {
  return tabela.reduce((achado, [min, txt]) => (valor >= min ? txt : achado), tabela[0][1]);
}

const FAIXA_COR: Record<Faixa, string> = {
  ABAIXO: cor.amareloForte,
  LIMITE_INFERIOR: cor.amareloForte,
  ESPERADA: cor.mentaForte,
  LIMITE_SUPERIOR: cor.amareloForte,
  ACIMA: cor.amareloForte,
};

const Melancia = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden>
    <path d="M6 22 a26 26 0 0 0 52 0 z" fill="#34a853" />
    <path d="M10 22 a22 22 0 0 0 44 0 z" fill="#c8f2c0" />
    <path d="M13 22 a19 19 0 0 0 38 0 z" fill="#f472a8" />
    {[
      [24, 30],
      [32, 35],
      [40, 30],
      [28, 40],
      [36, 40],
    ].map(([x, y]) => (
      <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="1.6" ry="2.6" fill={cor.sobrePastel} />
    ))}
  </svg>
);

const Regua = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden>
    <rect x="22" y="4" width="18" height="56" rx="3" fill={cor.amarelo} />
    {Array.from({ length: 9 }, (_, k) => (
      <line
        key={k}
        x1="22"
        x2={k % 2 ? 29 : 33}
        y1={9 + k * 6}
        y2={9 + k * 6}
        stroke={cor.amareloForte}
        strokeWidth="2"
        strokeLinecap="round"
      />
    ))}
    <path d="M44 14 l14 -5 v10 z" fill="#f472a8" />
  </svg>
);

const Cabeca = () => (
  <svg viewBox="0 0 64 64" width="100%" height="100%" aria-hidden>
    <circle cx="32" cy="36" r="20" fill="#f6d2b8" />
    <ellipse cx="32" cy="26" rx="26" ry="8" fill="none" stroke={cor.lilasForte} strokeWidth="3" strokeDasharray="4 4" />
    <circle cx="25" cy="38" r="2.2" fill={cor.sobrePastel} />
    <circle cx="39" cy="38" r="2.2" fill={cor.sobrePastel} />
    <path d="M27 45 q5 5 10 0" stroke="#7a3b4f" strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </svg>
);

// ---------- Capa ----------

const Nuvem = ({ sx }: { sx: object }) => (
  <Box component="svg" viewBox="0 0 100 50" aria-hidden sx={{ position: 'absolute', opacity: 0.07, ...sx }}>
    <path d="M20 46 a16 16 0 0 1 2 -32 a22 22 0 0 1 40 -4 a18 18 0 0 1 20 36 z" fill="#ffffff" />
  </Box>
);

const Estrela = ({ sx }: { sx: object }) => (
  <Box component="svg" viewBox="0 0 20 20" aria-hidden sx={{ position: 'absolute', ...sx }}>
    <path
      d="M10 0 l2.6 6.4 6.9 .5 -5.3 4.4 1.7 6.7 -5.9 -3.7 -5.9 3.7 1.7 -6.7 -5.3 -4.4 6.9 -.5 z"
      fill={cor.amarelo}
    />
  </Box>
);

function Capa({
  crianca,
  chamada,
  onChamada,
}: Readonly<{ crianca: Crianca; chamada: Chamada | null; onChamada: (() => void) | null }>) {
  const nome = primeiroNome(crianca.nome);
  const a = acento(crianca.sexo);
  return (
    <Box
      component="header"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '36px',
        background: `linear-gradient(180deg, ${cor.azulClaro}, ${cor.rosaClaro})`,
        p: { xs: '28px 20px 26px', sm: '28px 28px' },
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'auto minmax(0, 1fr)' },
        justifyItems: { xs: 'center', sm: 'start' },
        textAlign: { xs: 'center', sm: 'left' },
        alignItems: 'center',
        gap: 2.5,
      }}
    >
      <Nuvem sx={{ width: 110, top: 14, right: -10 }} />
      <Nuvem sx={{ width: 130, bottom: -14, left: -30 }} />
      <Nuvem sx={{ width: 80, bottom: -8, left: '55%' }} />
      <Estrela sx={{ width: 18, bottom: 28, right: 30 }} />
      <Estrela sx={{ width: 12, top: 16, left: '42%' }} />
      <Estrela sx={{ width: 14, top: 22, left: 22 }} />

      <Box
        sx={{
          position: 'relative',
          width: { xs: 132, lg: 164 },
          height: { xs: 132, lg: 164 },
          borderRadius: '50%',
          border: `6px solid ${cor.papel}`,
          boxShadow: sombraFofa,
          overflow: 'hidden',
          bgcolor: cor.amarelo,
          display: 'grid',
          placeItems: 'center',
          color: a.forte,
        }}
      >
        {crianca.foto ? (
          <Box
            component="img"
            src={crianca.foto.urls.media}
            alt={crianca.nome}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <ChildCareRoundedIcon sx={{ fontSize: 72 }} />
        )}
      </Box>

      <Box sx={{ position: 'relative', display: 'grid', gap: 0.75, minWidth: 0, justifyItems: 'inherit' }}>
        <Typography
          component="h2"
          sx={{ ...titulo, fontSize: { xs: '2.3rem', sm: '3rem', lg: '3.4rem' }, color: a.forte }}
        >
          Oi, {nome}!
        </Typography>
        <Typography sx={{ fontFamily: fonte.mao, fontSize: '1.6rem', lineHeight: 1, color: cor.tinta }}>
          {crianca.idade} de muito amor
        </Typography>
        {chamada && onChamada && (
          <Box
            component="button"
            type="button"
            onClick={onChamada}
            sx={{
              mt: 0.75,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.25,
              maxWidth: '100%',
              bgcolor: cor.papel,
              border: 0,
              borderRadius: '20px',
              p: '8px 14px 8px 8px',
              font: 'inherit',
              color: cor.tinta,
              textAlign: 'left',
              cursor: 'pointer',
              boxShadow: sombraFofa,
              transition: 'transform .15s',
              '&:hover': { transform: 'translateY(-2px)' },
              '&:focus-visible': { outline: `3px solid ${cor.lilasForte}`, outlineOffset: 3 },
            }}
          >
            {/* balão com o número do mês */}
            <Box
              sx={{
                position: 'relative',
                flexShrink: 0,
                width: 46,
                height: 50,
                borderRadius: '50% 50% 50% 50% / 55% 55% 45% 45%',
                bgcolor: cor.amarelo,
                color: cor.sobrePastel,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: fonte.titulo,
                fontWeight: 800,
                lineHeight: 1,
                animation: `${flutua} 3.2s ease-in-out infinite`,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -9,
                  left: '50%',
                  width: '2px',
                  height: 9,
                  bgcolor: cor.tintaSuave,
                },
                ...semMovimento,
              }}
            >
              <Box sx={{ fontSize: '1.35rem' }}>{chamada.numero ?? '★'}</Box>
              {chamada.unidade && <Box sx={{ fontSize: '0.55rem' }}>{chamada.unidade}</Box>}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, lineHeight: 1.25 }}>
                {chamada.dias === 0
                  ? `Hoje ${nome} faz ${chamada.titulo}!`
                  : chamada.dias > 0
                    ? `Faltam ${chamada.dias} ${chamada.dias === 1 ? 'dia' : 'dias'} para ${nome} fazer ${chamada.titulo}!`
                    : `${chamada.titulo}: falta a foto`}
              </Typography>
              <Typography variant="body2" sx={{ color: cor.tintaSuave, fontWeight: 600 }}>
                {chamada.dias > 0 ? 'Já separou a roupinha da foto?' : 'Toque para guardar a foto no álbum.'}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ---------- Medidas em adesivos ----------

function Medidas({ resumo, crianca, ir }: Readonly<{ resumo: Resumo; crianca: Crianca; ir: PropsAba['ir'] }>) {
  const { PESO: peso, COMPRIMENTO: altura, PERIMETRO: cabeca } = resumo.ultimas;
  const adesivos = [
    {
      id: 'peso',
      rotulo: 'Peso',
      u: peso,
      valor: peso ? kg(peso.valor) : '–',
      frase: peso ? `do peso de ${como(PESO_COMO, peso.valor)}` : 'ainda sem pesagem',
      fundo: cor.rosaClaro,
      tinta: cor.rosaForte,
      desenho: <Melancia />,
    },
    {
      id: 'altura',
      rotulo: 'Altura',
      u: altura,
      valor: altura ? cm(altura.valor) : '–',
      frase: altura ? `do tamanho de ${como(ALTURA_COMO, altura.valor)}` : 'ainda sem medida',
      fundo: cor.azulClaro,
      tinta: cor.azulForte,
      desenho: <Regua />,
    },
    {
      id: 'cabeca',
      rotulo: 'Cabeça',
      u: cabeca,
      valor: cabeca ? cm(cabeca.valor) : '–',
      frase:
        cabeca && crianca.perimetroNascerCm != null && cabeca.valor > crianca.perimetroNascerCm
          ? `cresceu ${cm(cabeca.valor - crianca.perimetroNascerCm)} desde que nasceu`
          : cabeca
            ? 'perímetro da cabeça'
            : 'ainda sem medida',
      fundo: cor.lilasClaro,
      tinta: cor.lilasForte,
      desenho: <Cabeca />,
    },
  ];

  return (
    <Box component="section" aria-labelledby="t-medidas">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
        <Typography id="t-medidas" component="h2" sx={{ ...titulo, fontSize: '1.75rem' }}>
          Como estou crescendo
        </Typography>
        <Button
          size="small"
          onClick={() => ir('curvas')}
          endIcon={<ChevronRightRoundedIcon />}
          sx={{ fontWeight: 800, color: cor.rosaForte }}
        >
          Ver curvas
        </Button>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: { xs: 1, sm: 1.5 }, mt: 1.5 }}>
        {adesivos.map((m) => (
          <Box
            key={m.id}
            component="button"
            type="button"
            onClick={() => ir('curvas')}
            sx={{
              border: 0,
              font: 'inherit',
              color: cor.tinta,
              cursor: 'pointer',
              bgcolor: m.fundo,
              borderRadius: '28px',
              p: { xs: '14px 6px 12px', sm: '16px 10px 14px' },
              display: 'grid',
              gap: 0.5,
              justifyItems: 'center',
              alignContent: 'start',
              textAlign: 'center',
              boxShadow: '0 5px 0 rgba(59,47,63,0.07)',
              transition: 'transform .25s',
              '&:hover': { transform: 'rotate(-2deg) translateY(-2px)' },
              '&:focus-visible': { outline: `3px solid ${cor.lilasForte}`, outlineOffset: 3 },
              ...semMovimento,
            }}
          >
            <Box sx={{ width: { xs: 48, sm: 64 }, height: { xs: 48, sm: 64 } }}>{m.desenho}</Box>
            <Box
              sx={{
                fontSize: '0.7rem',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: m.tinta,
              }}
            >
              {m.rotulo}
            </Box>
            <Box
              sx={{
                ...titulo,
                fontSize: { xs: '1.2rem', sm: '1.6rem' },
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {m.valor}
            </Box>
            <Box sx={{ fontSize: '0.78rem', fontWeight: 700, color: cor.tintaSuave, lineHeight: 1.25 }}>{m.frase}</Box>
            {m.u && (
              <Box
                sx={{ fontSize: '0.72rem', fontWeight: 800, color: m.u.faixa ? FAIXA_COR[m.u.faixa] : cor.tintaSuave }}
              >
                {[percentil(m.u.percentil), dataCurta(m.u.data, false)].filter(Boolean).join(' · ')}
              </Box>
            )}
          </Box>
        ))}
      </Box>
      {resumo.ganhoPeso && (
        <Typography variant="body2" sx={{ mt: 1.5, textAlign: 'center', color: cor.tintaSuave }}>
          Ganhou <b>{gramas(resumo.ganhoPeso.gramas)}</b> em {resumo.ganhoPeso.dias} dias (
          {Math.round(resumo.ganhoPeso.gramasPorDia)} g/dia
          {resumo.ganhoPeso.esperadoMinimo != null &&
            `; o esperado nesta idade é ${resumo.ganhoPeso.esperadoMinimo}–${resumo.ganhoPeso.esperadoMaximo} g/dia`}
          ).
        </Typography>
      )}
      {resumo.alertas.map((al) => (
        <Alert
          key={al.codigo + (al.indicador ?? '')}
          severity={al.nivel === 'ATENCAO' ? 'warning' : 'info'}
          sx={{ mt: 1, borderRadius: 4 }}
        >
          <strong>{al.titulo}.</strong> {al.texto}
        </Alert>
      ))}
    </Box>
  );
}

// ---------- Vem aí ----------

const AGENDA_COR: Record<Compromisso['tipo'], string> = {
  VACINA: cor.menta,
  CONSULTA: cor.azul,
  MESVERSARIO: cor.amarelo,
};

const cartao = {
  bgcolor: cor.papel,
  borderRadius: '26px',
  p: 2.25,
  boxShadow: sombraFofa,
  display: 'grid',
  gap: 1.5,
  alignContent: 'start',
  minWidth: 0,
} as const;

function VemAi({ agenda, ir }: Readonly<{ agenda: Compromisso[]; ir: PropsAba['ir'] }>) {
  return (
    <Box component="section" aria-labelledby="t-agenda" sx={cartao}>
      <Typography id="t-agenda" component="h2" sx={{ ...titulo, fontSize: '1.4rem' }}>
        Vem aí
      </Typography>
      {agenda.length === 0 && (
        <Typography variant="body2" sx={{ color: cor.tintaSuave }}>
          Nada nos próximos 60 dias.
        </Typography>
      )}
      {agenda.map((c) => {
        const [, m, d] = c.data.slice(0, 10).split('-').map(Number);
        return (
          <Box
            key={c.tipo + c.data + c.titulo}
            component="button"
            type="button"
            onClick={() => ir(c.tipo === 'VACINA' ? 'vacinas' : c.tipo === 'MESVERSARIO' ? 'album' : 'diario')}
            sx={{
              display: 'grid',
              gridTemplateColumns: '52px minmax(0, 1fr)',
              gap: 1.5,
              alignItems: 'center',
              border: 0,
              bgcolor: 'transparent',
              p: 0,
              font: 'inherit',
              color: cor.tinta,
              textAlign: 'left',
              cursor: 'pointer',
              borderRadius: 3,
              '&:focus-visible': { outline: `3px solid ${cor.lilasForte}`, outlineOffset: 3 },
            }}
          >
            {/* folhinha de calendário */}
            <Box
              sx={{
                width: 52,
                borderRadius: '14px',
                overflow: 'hidden',
                textAlign: 'center',
                bgcolor: cor.creme,
                boxShadow: '0 3px 0 rgba(59,47,63,0.08)',
                fontFamily: fonte.titulo,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              <Box
                sx={{
                  bgcolor: c.atrasado ? cor.rosa : AGENDA_COR[c.tipo],
                  color: cor.sobrePastel,
                  fontSize: '0.66rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  py: '3px',
                }}
              >
                {MESES[m - 1]}
              </Box>
              <Box sx={{ fontSize: '1.35rem', pt: '5px', pb: '6px' }}>{String(d).padStart(2, '0')}</Box>
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 800, lineHeight: 1.25 }}>{c.titulo}</Typography>
              <Typography
                variant="body2"
                noWrap
                sx={{ fontWeight: 600, color: c.atrasado ? cor.rosaForte : cor.tintaSuave }}
              >
                {[c.detalhe, c.atrasado ? 'atrasada' : quando(c.dias)].filter(Boolean).join(' · ')}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

// ---------- Vamos brincar? ----------

function VamosBrincar({ faixa, nome, ir }: Readonly<{ faixa: FaixaMarcos; nome: string; ir: PropsAba['ir'] }>) {
  return (
    <Box component="section" aria-labelledby="t-brincar" sx={{ ...cartao, bgcolor: cor.mentaClaro }}>
      <Box>
        <Typography id="t-brincar" component="h2" sx={{ ...titulo, fontSize: '1.4rem' }}>
          Vamos brincar?
        </Typography>
        <Typography variant="body2" sx={{ color: cor.tintaSuave, fontWeight: 600 }}>
          Para estimular {nome} na fase de {faixa.nome}
        </Typography>
      </Box>
      <Box component="ol" sx={{ m: 0, p: 0, listStyle: 'none', display: 'grid', gap: 1.25 }}>
        {faixa.brincadeiras.slice(0, 4).map((b, k) => (
          <Box
            component="li"
            key={b}
            sx={{ display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr)', gap: 1.25, alignItems: 'start' }}
          >
            <Box
              aria-hidden
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: cor.menta,
                color: cor.sobrePastel,
                display: 'grid',
                placeItems: 'center',
                fontFamily: fonte.titulo,
                fontWeight: 800,
              }}
            >
              {k + 1}
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: cor.tinta, pt: 0.4 }}>
              {b}
            </Typography>
          </Box>
        ))}
      </Box>
      <Button
        onClick={() => ir('marcos')}
        endIcon={<ChevronRightRoundedIcon />}
        sx={{ justifySelf: 'start', fontWeight: 800, color: cor.mentaForte, px: 0 }}
      >
        {faixa.atingidos} de {faixa.total} marcos desta fase
      </Button>
    </Box>
  );
}

// ---------- Tela ----------

interface DadosInicio {
  resumo: Resumo;
  agenda: Compromisso[];
  album: Album;
  marcos: Marcos | null;
}

export function Inicio({ crianca, versao, alterou, ir }: Readonly<PropsAba>) {
  const { dados, erro, recarregar } = useCarregar<DadosInicio>(async () => {
    const [resumo, agenda, album, marcos] = await Promise.all([
      crescimentoApi.resumo(crianca.id),
      crescimentoApi.agenda(crianca.id),
      crescimentoApi.album(crianca.id),
      // as brincadeiras são um extra: se os marcos falharem, a tela abre sem elas
      crescimentoApi.marcos(crianca.id).catch(() => null),
    ]);
    return { resumo, agenda, album, marcos };
  }, [crianca.id, versao]);
  const [lugar, setLugar] = useState<Lugar | null>(null);
  const [visor, setVisor] = useState<{ lugar: Lugar; fotos: Foto[]; inicio: number } | null>(null);

  // abre as fotos da página do álbum em tela cheia, da primeira à última (a capa aparece enquanto as outras chegam)
  const verFotos = (l: Lugar) => {
    if (!l.capa) return;
    setVisor({ lugar: l, fotos: [l.capa], inicio: 0 });
    if (!l.registroId || l.quantidadeFotos < 2) return;
    crescimentoApi
      .registro(crianca.id, l.registroId)
      .then((r) => {
        if (r.fotos.length === 0) return;
        setVisor((v) => (v && v.lugar.chave === l.chave ? { ...v, fotos: r.fotos, inicio: 0 } : v));
      })
      .catch(() => undefined);
  };
  const nome = primeiroNome(crianca.nome);

  const lugarChamada = useMemo(
    () => dados?.album.mesversarios.find((l) => l.chave === dados.album.chamada?.chave) ?? null,
    [dados],
  );

  if (erro && !dados) return <Erro mensagem={erro} tentar={recarregar} />;
  if (!dados) return <Carregando />;
  const { resumo, agenda, album, marcos } = dados;
  const faixa = marcos?.faixas.find((f) => f.id === marcos.faixaAtualId) ?? null;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4, pb: 4 }}>
      <Capa
        crianca={crianca}
        chamada={lugarChamada ? album.chamada : null}
        onChamada={lugarChamada ? () => setLugar(lugarChamada) : null}
      />

      <CarrosselAlbum album={album} onAbrir={verFotos} onVerTudo={() => ir('album')} parado={visor !== null} />

      {/* telas largas: medidas e resumo à esquerda, agenda e brincadeiras à direita */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 3fr) minmax(0, 2fr)' },
          gap: 4,
          alignItems: 'start',
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 4, minWidth: 0 }}>
          <Medidas resumo={resumo} crianca={crianca} ir={ir} />
          <ResumoMesCartao key={crianca.id} crianca={crianca} versao={versao} />
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) minmax(0, 1fr)', lg: 'minmax(0, 1fr)' },
            gap: 2,
            alignItems: 'start',
            minWidth: 0,
          }}
        >
          <VemAi agenda={agenda} ir={ir} />
          {faixa && faixa.brincadeiras.length > 0 ? (
            <VamosBrincar faixa={faixa} nome={nome} ir={ir} />
          ) : (
            <Bloco fundo={cor.mentaClaro} onClick={() => ir('marcos')} sx={{ borderRadius: '26px', p: 2.25 }}>
              <Typography component="h2" sx={{ ...titulo, fontSize: '1.4rem' }}>
                Vamos brincar?
              </Typography>
              <Typography variant="body2" sx={{ color: cor.tintaSuave, fontWeight: 600 }}>
                Veja o que {nome} está aprendendo agora e brincadeiras para estimular.
              </Typography>
            </Bloco>
          )}
        </Box>
      </Box>

      <AlbumDialog
        crianca={crianca}
        aberto={lugar !== null}
        lugar={lugar}
        onFechar={() => setLugar(null)}
        onSalvo={() => {
          setLugar(null);
          alterou();
        }}
      />
      <Visualizador
        fotos={visor?.fotos ?? []}
        inicio={visor?.inicio ?? 0}
        aberto={visor !== null}
        onFechar={() => setVisor(null)}
        legenda={
          visor && (
            <Box sx={{ mb: 0.5 }}>
              <Typography sx={{ fontFamily: fonte.mao, fontSize: '1.9rem', lineHeight: 1 }}>
                {visor.lugar.titulo}
              </Typography>
              <Typography variant="body2" sx={{ color: '#ccc' }}>
                {dataCurta(visor.lugar.data ?? visor.lugar.dataPrevista)}
                {visor.lugar.texto ? ` · ${visor.lugar.texto}` : ''}
              </Typography>
            </Box>
          )
        }
      />
    </Box>
  );
}
