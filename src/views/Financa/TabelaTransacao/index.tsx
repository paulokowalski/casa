import { Box, Typography, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Transacao } from '../../../contexts/FinancaContext';

interface TabelaTransacaoProps {
  transacoes: Transacao[];
  onEditar: (transacao: Transacao) => void;
  onExcluir: (transacao: Transacao) => void;
}

export function TabelaTransacao({ transacoes, onEditar, onExcluir }: TabelaTransacaoProps) {

  return (
    <Box>
      <Typography variant="h6">Tabela de Despesas e Receitas</Typography>
      <TableContainer sx={{ mt: 2, background: '#f5f6fa', borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Tipo</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Valor</TableCell>
              <TableCell>Data</TableCell>
              <TableCell>Fixa?</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transacoes.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <Chip label={t.tipo === 'despesa' ? 'DESPESA' : 'RECEITA'} color={t.tipo === 'despesa' ? 'error' : 'success'} size="small" />
                </TableCell>
                <TableCell>{t.descricao}</TableCell>
                <TableCell>R$ {t.valor.toFixed(2)}</TableCell>
                <TableCell>{t.data}</TableCell>
                <TableCell>{t.fixa ? 'Sim' : 'Não'}</TableCell>
                <TableCell>{t.categoria || '-'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => onEditar(t)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => onExcluir(t)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 