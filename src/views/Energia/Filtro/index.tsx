import { FilterBar } from '../../../components/ui/FilterBar';
import { useEnergia } from '../../../contexts/EnergiaContext';
import { MONTHS_PT, capitalize } from '../../../utils/format';

const ANO_INICIAL = 2025;

export function Filtro() {
  const { ano, setAno, mes, setMes } = useEnergia();
  const anoAtual = new Date().getFullYear();
  const anos = Array.from({ length: anoAtual - ANO_INICIAL + 2 }, (_, i) => String(ANO_INICIAL + i));

  return (
    <FilterBar
      fields={[
        {
          id: 'energia-ano',
          label: 'Ano',
          value: ano,
          onChange: setAno,
          options: anos.map((a) => ({ value: a, label: a })),
        },
        {
          id: 'energia-mes',
          label: 'Mês',
          value: mes,
          onChange: setMes,
          options: MONTHS_PT.map((m, i) => ({ value: String(i + 1).padStart(2, '0'), label: capitalize(m) })),
        },
      ]}
    />
  );
}
