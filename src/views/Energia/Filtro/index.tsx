import { useState, useEffect } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useEnergia } from '../../../contexts/EnergiaContext';
import { colors } from '../../../styles/colors';

const selectSx = {
  color: colors.text.primary,
  backgroundColor: colors.bg.elevated,
  borderRadius: 1,
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.border.default,
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.border.light,
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: colors.primary.light,
  },
  '& .MuiSvgIcon-root': {
    color: colors.text.secondary,
  },
};

export function Filtro() {
  const { ano, setAno, mes, setMes } = useEnergia();

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
          <InputLabel sx={{ color: colors.text.secondary }}>Ano</InputLabel>
          <Select
            value={ano}
            onChange={(e) => setAno(e.target.value)}
            sx={selectSx}
          >
            {anos.map((anoOption) => (
              <MenuItem key={anoOption} value={String(anoOption)}>
                {anoOption}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: colors.text.secondary }}>Mês</InputLabel>
          <Select
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            sx={selectSx}
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
