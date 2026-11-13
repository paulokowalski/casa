import type { ReactNode } from 'react';
import { Box, Button, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterField {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}

interface FilterBarProps {
  fields: FilterField[];
  onSubmit?: () => void;
  submitLabel?: string;
  loading?: boolean;
  children?: ReactNode;
}

export function FilterBar({ fields, onSubmit, submitLabel = 'Buscar', loading, children }: Readonly<FilterBarProps>) {
  return (
    <Box
      component="form"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(auto-fill, minmax(160px, 1fr))' },
        gap: 1.5,
        alignItems: 'center',
      }}
    >
      {fields.map((f) => {
        const labelId = `${f.id}-label`;
        const hasValue = f.options.some((o) => o.value === f.value);
        return (
          <FormControl key={f.id} size="small" disabled={f.disabled} fullWidth>
            <InputLabel id={labelId}>{f.label}</InputLabel>
            <Select
              labelId={labelId}
              label={f.label}
              value={hasValue ? f.value : ''}
              onChange={(e) => f.onChange(String(e.target.value))}
            >
              {f.options.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      })}
      {children}
      {onSubmit && (
        <Button type="submit" variant="contained" startIcon={<SearchIcon />} disabled={loading} sx={{ minHeight: 40 }}>
          {submitLabel}
        </Button>
      )}
    </Box>
  );
}
