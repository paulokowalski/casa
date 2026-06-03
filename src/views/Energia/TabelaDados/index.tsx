import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEnergia, DadosEnergia } from '../../../contexts/EnergiaContext';
import { LoadingCard } from '../../../components/ui/LoadingCard';
import { colors } from '../../../styles/colors';

interface TabelaDadosProps {
  dados: DadosEnergia[];
  onEditar: (dado: DadosEnergia) => void;
  onExcluir: (dado: DadosEnergia) => void;
  loading: boolean;
}

export function TabelaDados({ dados, onEditar, onExcluir, loading }: TabelaDadosProps) {
  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <LoadingCard title="Tabela de Dados de Energia" variant="detailed" />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ color: colors.text.primary, mb: 2, fontWeight: 600 }}>Dados de Energia Solar</Typography>
      <TableContainer component={Paper} elevation={0} sx={{ background: colors.bg.paper, border: `1px solid ${colors.border.default}`, borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: colors.bg.elevated }}>
              <TableCell sx={{ color: colors.text.secondary, fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }}>Horário</TableCell>
              <TableCell sx={{ color: colors.text.secondary, fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }} align="right">Potência (W)</TableCell>
              <TableCell sx={{ color: colors.text.secondary, fontWeight: 600, fontSize: 13, textTransform: 'uppercase' }} align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} sx={{ color: colors.text.muted, textAlign: 'center', py: 4 }}>
                  Nenhum dado de energia encontrado
                </TableCell>
              </TableRow>
            ) : (
              dados.map((dado, idx) => (
                <TableRow key={dado.id} sx={{ background: idx % 2 === 0 ? colors.bg.paper : colors.bg.elevated, '&:hover': { background: colors.primary.subtle } }}>
                  <TableCell sx={{ color: colors.text.primary }}>
                    {dado.horario}
                  </TableCell>
                  <TableCell sx={{ color: colors.chart.amber, fontWeight: 600 }} align="right">
                    {dado.geracao.toFixed(1)}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => onEditar(dado)}
                        sx={{ color: colors.primary.light }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onExcluir(dado)}
                        sx={{ color: colors.semantic.error }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
