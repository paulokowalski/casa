import { useContext } from "react";
import { FormatNumber } from '../../../functions/global';
import { DespesaContext } from "../../../contexts/DespesaContext";
import { Box, Paper, Typography } from '@mui/material';

export function Summary() {
    const { despesa } = useContext(DespesaContext);

    const summaryItems = [
        {
            title: "Total",
            value: FormatNumber(despesa?.valorMes as number),
            color: "#4caf50" // verde
        },
        {
            title: "Valor Próximo Mês",
            value: FormatNumber(despesa?.valorProximoMes as number),
            color: "#2196f3" // azul
        },
        {
            title: "Valor Saindo",
            value: FormatNumber(despesa?.valorSaindo as number),
            color: "#f44336" // vermelho
        },
        {
            title: "Valor Parcela Saindo",
            value: FormatNumber(despesa?.valorParcelaSaindo as number),
            color: "#ff9800" // laranja
        },
        {
            title: "Valor Total Saindo",
            value: FormatNumber(despesa?.valorSaindoTotal as number),
            color: "#e91e63" // rosa
        }
    ];

    return (
        <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(5, 1fr)'
            },
            gap: { xs: 2, md: 3 },
            width: '100%',
        }}>
            {summaryItems.map((item, index) => (
                <Paper 
                    key={index}
                    elevation={3}
                    sx={{
                        p: { xs: 2, md: 3 },
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: 2,
                        borderTop: `4px solid ${item.color}`,
                        width: '100%',
                    }}
                >
                    <Typography variant="h6" component="h2" gutterBottom>
                        {item.title}
                    </Typography>
                    <Typography variant="h4" component="p" sx={{ color: item.color }}>
                        {item.value}
                    </Typography>
                </Paper>
            ))}
        </Box>
    );
}