export function FormatNumber (value: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

export function DateFormat(value: string | Date | null | undefined): string {
    try {
        // Verifica se o valor é nulo, indefinido ou vazio
        if (!value) {
            return "Data inválida";
        }

        // Se o valor já for um objeto Date válido
        if (value instanceof Date && !isNaN(value.getTime())) {
            return new Intl.DateTimeFormat('pt-BR').format(value);
        }

        // Tenta converter a string ou outros formatos para uma data
        const parsedDate = new Date(value);

        // Verifica se a conversão foi bem-sucedida
        if (isNaN(parsedDate.getTime())) {
            return "Data inválida";
        }

        // Retorna a data formatada
        return new Intl.DateTimeFormat('pt-BR').format(parsedDate);
    } catch (error) {
        console.error("Erro ao formatar data:", error);
        return "Erro ao formatar data";
    }
}