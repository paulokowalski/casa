import { Box, TextField, MenuItem, Button } from '@mui/material';
import { useState } from 'react';

export function Filtro() {
  const [tipo, setTipo] = useState('todos');
  const [descricao, setDescricao] = useState('');
  const [fixa, setFixa] = useState('todos');

  function handleBuscar() {
    // Lógica de busca
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <TextField
        select
        label="Tipo"
        value={tipo}
        onChange={e => setTipo(e.target.value)}
        size="small"
        sx={{ minWidth: 120, bgcolor: 'white', borderRadius: 1 }}
      >
        <MenuItem value="todos">Todos</MenuItem>
        <MenuItem value="despesa">Despesa</MenuItem>
        <MenuItem value="receita">Receita</MenuItem>
      </TextField>
      <TextField
        label="Descrição"
        value={descricao}
        onChange={e => setDescricao(e.target.value)}
        size="small"
        sx={{ minWidth: 180, bgcolor: 'white', borderRadius: 1 }}
      />
      <TextField
        select
        label="Fixa?"
        value={fixa}
        onChange={e => setFixa(e.target.value)}
        size="small"
        sx={{ minWidth: 120, bgcolor: 'white', borderRadius: 1 }}
      >
        <MenuItem value="todos">Todos</MenuItem>
        <MenuItem value="sim">Sim</MenuItem>
        <MenuItem value="nao">Não</MenuItem>
      </TextField>
      <Button 
        variant="contained" 
        onClick={handleBuscar}
        sx={{ 
          bgcolor: 'white', 
          color: '#5b86e5',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.9)',
          }
        }}
      >
        Buscar
      </Button>
    </Box>
  );
} 