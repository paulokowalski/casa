export function FormatNumber (value: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

export function DateFormat (value: string) {
    return new Intl.DateTimeFormat('pt-BR').format(
        new Date(value)
    );
}

export function DiminuirValor(value1: number, value2: number) {
    return value1 - value2;
}