import { useContext } from "react";
import { formatCurrency } from '../../../functions/global';
import { GestaoCartaoContext } from "../../../contexts/GestaoCartaoContext";
import { Box, Typography } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Card } from '../../../components/Card';
import { LoadingCard } from '../../../components/ui/LoadingCard';
import { colors, resolveCardAccent } from '../../../styles/colors';

export function Summary() {
    const { despesa, loading } = useContext(GestaoCartaoContext);
    const summaryItems = [
        {
            title: "Gastos no Cartão",
            value: formatCurrency(despesa?.gastosNoCartao as number),
            color: colors.semantic.error,
            accent: colors.semantic.error,
            icon: <CreditCardIcon />,
        },
        {
            title: "Compras Parceladas",
            value: formatCurrency(despesa?.comprasParceladas as number),
            color: colors.semantic.warning,
            accent: colors.semantic.warning,
            icon: <ReceiptLongIcon />,
        },
        {
            title: "Total",
            value: formatCurrency(despesa?.valorMes as number),
            color: colors.semantic.success,
            accent: colors.semantic.success,
            icon: <AccountBalanceWalletIcon />,
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
                },
                gap: { xs: 2, md: 2.5 },
                width: '100%',
            }}>
                <LoadingCard title="Total" variant="compact" />
                <LoadingCard title="Próximo Mês" variant="compact" />
                <LoadingCard title="Valor Saindo" variant="compact" />
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
            },
            gap: { xs: 2, md: 2.5 },
            width: '100%',
        }}>
            {summaryItems.map((item, index) => (
                <Card
                    key={index}
                    gradient={item.accent}
                >
                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', py: 0.5, px: 0.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 40,
                                height: 40,
                                borderRadius: 1.5,
                                bgcolor: resolveCardAccent(item.accent).iconBg,
                                color: item.color,
                                '& svg': { fontSize: 20 },
                            }}>{item.icon}</Box>
                            <Typography variant="subtitle2" sx={{ color: colors.text.secondary, fontWeight: 500, fontSize: '0.875rem' }}>
                                {item.title}
                            </Typography>
                        </Box>
                        <Typography
                            variant="h5"
                            component="p"
                            sx={{
                                color: item.color,
                                fontWeight: 700,
                                fontSize: { xs: '1.25rem', md: '1.5rem' },
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
