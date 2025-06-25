import React from 'react';
import { Box, TextField, Button, MenuItem, Select, InputLabel, FormControl } from '@mui/material';

interface FilterField {
  id: string;
  label: string;
  type: 'text' | 'select';
  options?: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

interface FilterProps {
  fields: FilterField[];
  onFilter: () => void;
  filterLabel?: string;
}

export const Filter: React.FC<FilterProps> = ({ fields, onFilter, filterLabel = 'Filtrar' }) => {
  return (
    <Box display="flex" gap={2} alignItems="flex-end" flexWrap="wrap" mb={2}>
      {fields.map((field) => (
        field.type === 'text' ? (
          <TextField
            key={field.id}
            label={field.label}
            value={field.value}
            onChange={e => field.onChange(e.target.value)}
            variant="outlined"
            size="small"
            sx={{ minWidth: 180 }}
          />
        ) : (
          <FormControl key={field.id} sx={{ minWidth: 180 }} size="small">
            <InputLabel>{field.label}</InputLabel>
            <Select
              label={field.label}
              value={field.value}
              onChange={e => field.onChange(e.target.value)}
            >
              {field.options?.map(opt => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )
      ))}
      <Button
        variant="contained"
        color="primary"
        onClick={onFilter}
        sx={{ height: 40 }}
      >
        {filterLabel}
      </Button>
    </Box>
  );
}; 