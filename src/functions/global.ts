// Formata um número para moeda brasileira (R$ 1.234,56)
// Exemplo: formatCurrency(1234.56) => 'R$ 1.234,56'
export function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Formata string numérica para moeda brasileira (R$ 1.234,56)
// Exemplo: formatCurrencyInput('123456') => 'R$ 1.234,56'
export function formatCurrencyInput(valor: string): string {
  if (!valor) return '';
  const onlyNumbers = valor.replace(/\D/g, '');
  const number = parseFloat(onlyNumbers) / 100;
  return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Converte string de moeda brasileira para número
// Exemplo: parseCurrency('R$ 1.234,56') => 1234.56
export function parseCurrency(valor: string): number {
  if (!valor) return 0;
  // Permite o sinal de menos no início
  const clean = valor.replace(/[^\d,-]/g, '').replace(',', '.');
  return parseFloat(clean) || 0;
}

// Converte string de data para formato yyyy-MM-dd
// Exemplo: toISODate('10/06/2024') => '2024-06-10'
export function toISODate(dateStr: string): string {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return dateStr;
}

// Converte string de data para formato dd/MM/yyyy
// Exemplo: toBRDate('2024-06-10') => '10/06/2024'
export function toBRDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
  return dateStr;
}