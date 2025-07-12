import { useState, useEffect } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { useEnergia } from '../../../contexts/EnergiaContext';

export function Filtro() {
  const { ano, setAno, mes, setMes } = useEnergia();
  
  // Gerar lista de anos de 2025 a 2035
  const anos = Array.from({ length: 11 }, (_, i) => 2025 + i);
  const meses = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  // Definir valores padrão se não estiverem definidos
  useEffect(() => {
    if (!ano) {
      const anoAtual = new Date().getFullYear();
      setAno(String(anoAtual));
    }
    if (!mes) {
      const mesAtual = String(new Date().getMonth() + 1).padStart(2, '0');
      setMes(mesAtual);
    }
  }, [ano, mes, setAno, setMes]);

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: '#f5f6fa' }}>Ano</InputLabel>
          <Select
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            sx={{
              color: '#f5f6fa',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#444857',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#6366f1',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#6366f1',
              },
              '& .MuiSvgIcon-root': {
                color: '#f5f6fa',
              },
            }}
          >
            {anos.map((anoOption) => (
              <MenuItem key={anoOption} value={String(anoOption)}>
                {anoOption}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: '#f5f6fa' }}>Mês</InputLabel>
          <Select
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            sx={{
              color: '#f5f6fa',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#444857',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#6366f1',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#6366f1',
              },
              '& .MuiSvgIcon-root': {
                color: '#f5f6fa',
              },
            }}
          >
            {meses.map((mesOption) => (
              <MenuItem key={mesOption.value} value={mesOption.value}>
                {mesOption.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
} 