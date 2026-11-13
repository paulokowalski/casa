import { useEffect, useState } from 'react';
import { Alert, Button, Typography } from '@mui/material';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { nomeSemMarcacao } from '../../lib/financas/parcelas';
import type { Parcela } from '../../types/financas';
import { formatCurrency, formatDateBR } from '../../utils/format';

interface ExclusaoTransacaoDialogProps {
  parcela: Parcela | null;
  onExcluir: (id: string) => Promise<void>;
  onClose: () => void;
  onSucesso: (mensagem: string) => void;
  onCancelarParcelas?: (p: Parcela) => void;
}

export function ExclusaoTransacaoDialog({
  parcela,
  onExcluir,
  onClose,
  onSucesso,
  onCancelarParcelas,
}: Readonly<ExclusaoTransacaoDialogProps>) {
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    setErro(null);
    setExcluindo(false);
  }, [parcela]);

  async function confirmar() {
    if (!parcela) return;
    setExcluindo(true);
    try {
      await onExcluir(parcela.id);
      onSucesso('Transação excluída.');
      onClose();
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao excluir.');
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <ConfirmDialog
      open={Boolean(parcela)}
      title="Excluir transação"
      confirmLabel="Excluir"
      destructive
      loading={excluindo}
      error={erro}
      onConfirm={confirmar}
      onClose={onClose}
      description={
        parcela && (
          <>
            Excluir <b>{nomeSemMarcacao(parcela.nomeCompra)}</b> ({formatCurrency(parcela.valorTotal)} em{' '}
            {parcela.numeroTotalParcela}x, compra de {formatDateBR(parcela.dataCompra)}, {parcela.nomeCartao})?
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              Todas as parcelas serão removidas, inclusive as já pagas.
            </Typography>
          </>
        )
      }
    >
      {parcela && parcela.numeroTotalParcela > 1 && onCancelarParcelas && (
        <Alert
          severity="info"
          sx={{ mt: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => onCancelarParcelas(parcela)}>
              Cancelar parcelas
            </Button>
          }
        >
          A compra foi cancelada depois de pagar algumas parcelas? Prefira cancelar só as restantes.
        </Alert>
      )}
    </ConfirmDialog>
  );
}
