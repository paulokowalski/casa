import { Paper, Typography, Box, Fab, Icon } from '@mui/material';
import Container from "@mui/material/Container";
import { FinancaProvider } from "../../contexts/FinancaContext";
import { DespesaProvider } from "../../contexts/DespesaContext";
import { Summary } from "./Summary";
import { CadastroModal } from "./CadastroModal";
import { Filtro } from "./Filtro";
import { TabelaTransacao } from "./TabelaTransacao";
import { GraficoBarras } from "./GraficoBarras";
import { useState } from "react";

export function Financa() {
    const [openCadastroModal, setOpenCadastroModal] = useState(false);

    const handleOpenCadastroModal = () => setOpenCadastroModal(true);
    const handleCloseCadastroModal = () => setOpenCadastroModal(false);

    return (
        <FinancaProvider>
            <DespesaProvider>
                <Container 
                    maxWidth="xl" 
                    sx={{ 
                        py: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch'
                    }}
                >
                    <Box sx={{ display: 'grid', gap: 3 }}>
                        {/* Seção de Resumo */}
                        <Box>
                            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                                <Summary/>
                            </Paper>
                        </Box>

                        {/* Seção de Filtros */}
                        <Box>
                            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Filtros
                                </Typography>
                                <Filtro/>
                            </Paper>
                        </Box>

                        {/* Seção de Tabela */}
                        <Box>
                            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    Transações
                                </Typography>
                                <TabelaTransacao/>
                            </Paper>
                        </Box>

                        {/* Seção do Gráfico */}
                        <Box>
                            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                                <GraficoBarras />
                            </Paper>
                        </Box>
                    </Box>

                    <CadastroModal 
                        open={openCadastroModal}
                        onClose={handleCloseCadastroModal}
                    />

                    <Box sx={{ position: 'fixed', bottom: 16, right: 16 }}>
                        <Fab 
                            color="primary" 
                            aria-label="add"
                            onClick={handleOpenCadastroModal}
                        >
                            <Icon>add</Icon>
                        </Fab>
                    </Box>
                </Container>
            </DespesaProvider>
        </FinancaProvider>
    );
}


