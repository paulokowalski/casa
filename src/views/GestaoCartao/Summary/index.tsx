import { useContext } from "react";
import { formatCurrency } from '../../../functions/global';
import { GestaoCartaoContext } from "../../../contexts/GestaoCartaoContext";
import { Box, Typography } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Card } from '../../../components/Card';
import { LoadingCard } from '../../../components/ui/LoadingCard';

export function Summary() {
    const { despesa, loading } = useContext(GestaoCartaoContext);
    const summaryItems = [
        {
            title: "Mês Anterior",
            value: formatCurrency(despesa?.residual as number),
            color: "#64748b",
            gradient: "linear-gradient(135deg, #cbd5e1 0%, #64748b 100%)",
            icon: <HistoryIcon />,
            trend: "down",
            description: "Residual Mês Anterior"
        },
        {
            title: "Gastos no Cartão",
            value: formatCurrency(despesa?.gastoNoCartao as number),
            color: "#ef4444",
            gradient: "linear-gradient(135deg, #fca5a5 0%, #ef4444 100%)",
            icon: <CreditCardIcon />,
            trend: "down",
            description: "Gastos no Cartão"
        },
        {
            title: "Compras Parceladas",
            value: formatCurrency(despesa?.valorParcelaEntrando as number),
            color: "#f59e0b",
            gradient: "linear-gradient(135deg, #fcd34d 0%, #f59e0b 100%)",
            icon: <ReceiptLongIcon />,
            trend: "down",
            description: "Compras Parceladas"
        },
        {
            title: "Total",
            value: formatCurrency(despesa?.valorMes as number),
            color: "#10b981",
            gradient: "linear-gradient(135deg, #6ee7b7 0%, #10b981 100%)",
            icon: <AccountBalanceWalletIcon />,
            trend: "up",
            description: "Valor total do mês"
        }
    ];

    if (loading) {
        return (
            <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)'
                },
                gap: { xs: 2, md: 3 },
                width: '100%',
            }}>
                <LoadingCard title="Total" variant="compact" />
                <LoadingCard title="Próximo Mês" variant="compact" />
                <LoadingCard title="Valor Saindo" variant="compact" />
                <LoadingCard title="Parcelas Saindo" variant="compact" />
                <LoadingCard title="Parcelas Entrando" variant="compact" />
                <LoadingCard title="Total Saindo" variant="compact" />
            </Box>
        );
    }

    return (
        <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)'
            },
            gap: { xs: 2, md: 3 },
            width: '100%',
        }}>
            {summaryItems.map((item, index) => (
                <Card
                    key={index}
                    gradient={item.gradient}
                    className="fade-in-up"
                >
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <span style={{ display: 'flex', alignItems: 'center', color: item.color, fontSize: 18 }}>{item.icon}</span>
                            <Typography variant="subtitle2" sx={{ color: item.color, fontWeight: 500, fontSize: '0.95rem', opacity: 0.85 }}>
                                {item.title}
                            </Typography>
                        </Box>
                        <Typography 
                            variant="h4" 
                            component="p" 
                            sx={{ 
                                color: item.color,
                                fontWeight: 700,
                                fontSize: { xs: '1.35rem', md: '1.7rem' },
                                background: item.gradient,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                mb: 0,
                            }}
                        >
                            {item.value}
                        </Typography>
                    </Box>
                </Card>
            ))}
        </Box>
    );
}