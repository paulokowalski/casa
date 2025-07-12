import { useState } from 'react';
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
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useEnergia, DadosEnergia } from '../../../contexts/EnergiaContext';
import { LoadingCard } from '../../../components/ui/LoadingCard';

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
      <Typography variant="h6" sx={{ color: '#f5f6fa', mb: 2 }}>Dados de Energia Solar</Typography>
      <TableContainer component={Paper} sx={{ background: '#23263a', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: '#181a20' }}>
              <TableCell sx={{ color: '#f5f6fa', fontWeight: 700 }}>Horário</TableCell>
              <TableCell sx={{ color: '#f5f6fa', fontWeight: 700 }} align="right">Potência (W)</TableCell>
              <TableCell sx={{ color: '#f5f6fa', fontWeight: 700 }} align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} sx={{ color: '#f5f6fa', textAlign: 'center', py: 4 }}>
                  Nenhum dado de energia encontrado
                </TableCell>
              </TableRow>
            ) : (
              dados.map((dado) => (
                <TableRow key={dado.id} sx={{ '&:hover': { background: '#2d3748' } }}>
                  <TableCell sx={{ color: '#f5f6fa' }}>
                    {dado.horario}
                  </TableCell>
                  <TableCell sx={{ color: '#fbbf24', fontWeight: 600 }} align="right">
                    {dado.geracao.toFixed(1)}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => onEditar(dado)}
                        sx={{ color: '#60a5fa', '&:hover': { background: 'rgba(96, 165, 250, 0.1)' } }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onExcluir(dado)}
                        sx={{ color: '#f87171', '&:hover': { background: 'rgba(248, 113, 113, 0.1)' } }}
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