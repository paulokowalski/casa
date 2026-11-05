import { Box, Checkbox, FormControlLabel, IconButton, TextField, Typography } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { idxDaData, rotuloMes, rotuloMesLongo } from '../../lib/financas/parcelas';
import { palette, tones } from '../../styles/tokens';
import { formatCurrency, maskCurrencyInput, toCurrencyInput } from '../../utils/format';
import { LinhaResumo } from './LinhaResumo';

interface CancelamentoParcelasProps {
  dataCompra: string;
  valorParcela: number;
  totalOriginal: number;
  pagas: number;
  setPagas: (n: number) => void;
  comEstorno: boolean;
  setComEstorno: (v: boolean) => void;
  valorEstorno: string;
  setValorEstorno: (v: string) => void;
  valorEstornoNum: number;
  dataEstorno: string;
  setDataEstorno: (v: string) => void;
}

/** Aba "Cancelar parcelas": escolhe quantas foram pagas, lança estorno e mostra o resumo. */
export function CancelamentoParcelas(p: Readonly<CancelamentoParcelasProps>) {
  const ini = idxDaData(p.dataCompra);
  const removidas = p.totalOriginal - p.pagas;
  const idxEstorno = idxDaData(p.dataEstorno);

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.35fr) minmax(0, 1fr)' } }}>
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box>
          <Typography variant="h6" component="h3">
            Quantas parcelas foram realmente pagas?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, mb: 1.5 }}>
            As demais serão removidas. As pagas continuam no histórico e nos gráficos.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <IconButton
              aria-label="Diminuir parcelas pagas"
              onClick={() => p.setPagas(Math.max(1, p.pagas - 1))}
              disabled={p.pagas <= 1}
              sx={{ border: 1, borderColor: 'grey.300', width: 44, height: 44 }}
            >
              <RemoveIcon />
            </IconButton>
            <Box
              aria-live="polite"
              sx={{
                minWidth: 110,
                height: 44,
                border: 1,
                borderColor: 'primary.main',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              {p.pagas}&nbsp;
              <Box component="span" sx={{ fontWeight: 500, color: 'text.secondary' }}>
                de {p.totalOriginal}
              </Box>
            </Box>
            <IconButton
              aria-label="Aumentar parcelas pagas"
              onClick={() => p.setPagas(Math.min(p.totalOriginal - 1, p.pagas + 1))}
              disabled={p.pagas >= p.totalOriginal - 1}
              sx={{ border: 1, borderColor: 'grey.300', width: 44, height: 44 }}
            >
              <AddIcon />
            </IconButton>
            <Typography variant="caption">Nenhuma paga? Exclua a compra.</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: 1 }}>
          {Array.from({ length: p.totalOriginal }, (_, i) => i + 1).map((k) => {
            const mantida = k <= p.pagas;
            return (
              <Box
                key={k}
                sx={{
                  height: 44,
                  borderRadius: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  bgcolor: mantida ? tones.success.bg : 'grey.50',
                  border: '1px solid',
                  borderStyle: mantida ? 'solid' : 'dashed',
                  borderColor: mantida ? tones.success.border : 'grey.300',
                  color: mantida ? tones.success.fg : 'text.secondary',
                  textDecoration: mantida ? 'none' : 'line-through',
                }}
              >
                {k}/{p.totalOriginal}
                <Box component="small" sx={{ fontSize: 10, fontWeight: 500 }}>
                  {ini !== null ? rotuloMes(ini + k, -1) : ''}
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box
          sx={{
            border: 1,
            borderColor: 'divider',
            borderRadius: 2,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <FormControlLabel
            control={<Checkbox checked={p.comEstorno} onChange={(e) => p.setComEstorno(e.target.checked)} />}
            label={
              <Box>
                <Typography fontWeight={600}>Recebi estorno de valor já pago</Typography>
                <Typography variant="body2" color="text.secondary">
                  Cria um lançamento negativo (crédito) na fatura
                </Typography>
              </Box>
            }
            sx={{ alignItems: 'flex-start', m: 0, '& .MuiCheckbox-root': { pt: 0.25 } }}
          />
          {p.comEstorno && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5 }}>
              <TextField
                size="small"
                label="Valor estornado"
                value={p.valorEstorno}
                onChange={(e) => p.setValorEstorno(maskCurrencyInput(e.target.value.replace('-', '')))}
                placeholder={toCurrencyInput(p.valorParcela)}
                inputProps={{ inputMode: 'decimal' }}
              />
              <TextField
                size="small"
                label="Data do estorno"
                type="date"
                value={p.dataEstorno}
                onChange={(e) => p.setDataEstorno(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              {idxEstorno !== null && (
                <Typography variant="caption" sx={{ gridColumn: '1 / -1' }}>
                  Como todo lançamento, o crédito entra na fatura de <b>{rotuloMesLongo(idxEstorno + 1)}</b>.
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>

      <Box
        component="aside"
        aria-label="Resumo do cancelamento"
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
          Resumo
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
          <LinhaResumo
            rotulo="Original"
            valor={`${p.totalOriginal}x ${formatCurrency(p.valorParcela, true)} = ${formatCurrency(p.valorParcela * p.totalOriginal, true)}`}
            riscado
          />
          <LinhaResumo
            rotulo="Depois"
            valor={`${p.pagas}x ${formatCurrency(p.valorParcela, true)} = ${formatCurrency(p.valorParcela * p.pagas, true)}`}
            forte
          />
          <LinhaResumo
            rotulo="Parcelas removidas"
            valor={
              ini !== null && removidas > 0
                ? `${removidas} (${rotuloMesLongo(ini + p.pagas + 1)} → ${rotuloMesLongo(ini + p.totalOriginal)})`
                : String(removidas)
            }
          />
          {p.comEstorno && p.valorEstornoNum > 0 && (
            <LinhaResumo rotulo="Estorno" valor={`− ${formatCurrency(p.valorEstornoNum)}`} cor={tones.success.fg} />
          )}
          <Box sx={{ borderTop: 1, borderColor: 'divider', pt: 1 }}>
            <LinhaResumo
              rotulo="Custo real da compra"
              valor={formatCurrency(p.valorParcela * p.pagas - (p.comEstorno ? p.valorEstornoNum : 0))}
              forte
            />
          </Box>
        </Box>
        <Box sx={{ bgcolor: tones.success.bg, border: 1, borderColor: tones.success.border, borderRadius: 2, p: 2 }}>
          <Typography variant="caption" sx={{ color: tones.success.fg }}>
            Deixa de sair nos próximos {removidas} {removidas === 1 ? 'mês' : 'meses'}
          </Typography>
          <Typography sx={{ fontSize: '1.375rem', fontWeight: 700, color: tones.success.fg }}>
            {formatCurrency(p.valorParcela * removidas)}
          </Typography>
          <Box sx={{ mt: 1, height: 6, borderRadius: 99, bgcolor: palette.gray[200], overflow: 'hidden' }}>
            <Box
              sx={{ width: `${(p.pagas / p.totalOriginal) * 100}%`, height: '100%', bgcolor: tones.success.solid }}
            />
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, fontSize: 12, color: 'text.secondary' }}>
          <InfoOutlinedIcon sx={{ fontSize: 16, mt: '1px' }} />
          <span>
            A compra passa a aparecer como{' '}
            <b style={{ color: tones.error.fg }}>
              CANCELADA {p.pagas}/{p.totalOriginal}
            </b>{' '}
            na tabela. Dá para reverter quando quiser.
          </span>
        </Box>
      </Box>
    </Box>
  );
}
