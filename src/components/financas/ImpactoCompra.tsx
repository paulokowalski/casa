import { Box, Typography } from '@mui/material';
import { rotuloMesLongo } from '../../lib/financas/parcelas';
import type { Simulacao } from '../../lib/financas/analise';
import { palette, tones } from '../../styles/tokens';
import { formatCurrency, formatPercent } from '../../utils/format';
import { LinhaResumo } from './LinhaResumo';

interface ImpactoCompraProps {
  simulacao: Simulacao;
  numeroParcelas: number;
}

export function ImpactoCompra({ simulacao: s, numeroParcelas }: Readonly<ImpactoCompraProps>) {
  const antes = s.pctOrcamentoAntes;
  const depois = s.pctOrcamentoDepois;
  const estoura = depois !== null && depois > 1;

  return (
    <Box
      component="aside"
      aria-label="Impacto da compra"
      sx={{
        bgcolor: 'grey.50',
        borderLeft: { md: 1 },
        borderTop: { xs: 1, md: 0 },
        borderColor: 'divider',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography variant="h6" component="h3">
        Impacto no seu orçamento
      </Typography>

      <Box
        sx={{
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <LinhaResumo rotulo="Parcela" valor={`${formatCurrency(s.valorParcela)} × ${numeroParcelas}`} />
        <LinhaResumo rotulo="Primeira parcela" valor={rotuloMesLongo(s.primeiraIdx)} />
        <LinhaResumo rotulo="Última parcela" valor={rotuloMesLongo(s.ultimaIdx)} />
      </Box>

      <Box>
        <LinhaResumo
          rotulo={`Parcelas já assumidas em ${rotuloMesLongo(s.primeiraIdx)}`}
          valor={`${formatCurrency(s.comprometidoAntes, true)} → ${formatCurrency(s.comprometidoDepois, true)}`}
        />
        {antes !== null && depois !== null && (
          <>
            <Box
              sx={{
                mt: 1,
                display: 'flex',
                height: 8,
                borderRadius: 99,
                overflow: 'hidden',
                bgcolor: palette.gray[200],
              }}
            >
              <Box sx={{ width: `${Math.min(100, antes * 100)}%`, bgcolor: palette.brand[500] }} />
              <Box
                sx={{
                  width: `${Math.max(0, Math.min(100, depois * 100) - Math.min(100, antes * 100))}%`,
                  bgcolor: estoura ? tones.error.solid : tones.warning.solid,
                }}
              />
            </Box>
            <Typography
              variant="caption"
              sx={{ display: 'block', mt: 0.5, color: estoura ? tones.error.fg : 'text.secondary' }}
            >
              {formatPercent(antes)} → {formatPercent(depois)} do orçamento só com parcelas
            </Typography>
          </>
        )}
      </Box>

      {s.sugestao && (
        <Box
          sx={{
            bgcolor: tones.warning.bg,
            border: 1,
            borderColor: tones.warning.border,
            borderRadius: 2,
            p: 1.5,
            fontSize: '0.8125rem',
            color: tones.warning.fg,
          }}
        >
          Sugestão: comprando em <b>{rotuloMesLongo(s.sugestao.compraIdx)}</b>
          {s.sugestao.nomes.length > 0 && <>, depois que terminarem {s.sugestao.nomes.join(', ')}</>}, a parcela cabe no
          espaço liberado sem aumentar seu comprometimento.
        </Box>
      )}
    </Box>
  );
}
