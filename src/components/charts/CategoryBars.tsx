import { Box, ButtonBase, Typography } from '@mui/material';
import { TrendPill } from '../ui/StatusPill';
import { palette } from '../../styles/tokens';
import { capitalize, formatCurrency } from '../../utils/format';

export interface CategoryBarItem {
  nome: string;
  valor: number;
  /** variação vs período anterior (fração), opcional */
  delta?: number | null;
}

interface CategoryBarsProps {
  itens: CategoryBarItem[];
  selecionada?: string | null;
  onSelecionar?: (nome: string | null) => void;
  max?: number;
}

/** Ranking em barras horizontais — mais fácil de comparar que pizza. Clique filtra. */
export function CategoryBars({ itens, selecionada, onSelecionar, max = 8 }: Readonly<CategoryBarsProps>) {
  const visiveis = itens.filter((i) => i.valor > 0).slice(0, max);
  const maior = Math.max(1, ...visiveis.map((i) => i.valor));

  return (
    <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {visiveis.map((item) => {
        const ativa = selecionada === item.nome;
        const apagada = Boolean(selecionada) && !ativa;
        return (
          <li key={item.nome}>
            <ButtonBase
              onClick={onSelecionar ? () => onSelecionar(ativa ? null : item.nome) : undefined}
              disabled={!onSelecionar}
              aria-pressed={onSelecionar ? ativa : undefined}
              sx={{
                width: '100%',
                display: 'block',
                textAlign: 'left',
                borderRadius: 2,
                px: 1,
                py: 0.75,
                mx: -1,
                boxSizing: 'content-box',
                bgcolor: ativa ? palette.brand[50] : 'transparent',
                opacity: apagada ? 0.5 : 1,
                '&:hover': { bgcolor: onSelecionar ? palette.gray[50] : 'transparent' },
                '&.Mui-focusVisible': { outline: `2px solid ${palette.brand[300]}` },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 500 }} noWrap>
                  {capitalize(item.nome)}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(item.valor, true)}
                  </Typography>
                  {item.delta !== undefined && (
                    <TrendPill value={item.delta} positiveIsGood={false} neutralBelow={0.05} />
                  )}
                </Box>
              </Box>
              <Box
                sx={{ height: 8, borderRadius: 99, bgcolor: palette.gray[100], overflow: 'hidden' }}
                aria-hidden="true"
              >
                <Box
                  sx={{
                    width: `${(item.valor / maior) * 100}%`,
                    height: '100%',
                    borderRadius: 99,
                    bgcolor: palette.brand[600],
                  }}
                />
              </Box>
            </ButtonBase>
          </li>
        );
      })}
    </Box>
  );
}
