import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFinanca } from '../../../contexts/FinancaContext';
import { getTransacoes, api } from '../../../services/api';
import { API_URLS } from '../../../config/urls';
import { LoadingCard } from '../../../components/ui/LoadingCard';

const MESES = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

export function GraficoBarras() {
  const { pessoa, ano, pessoas, loading } = useFinanca();
  const [dadosAno, setDadosAno] = useState<any[]>([]);

  useEffect(() => {
    async function carregarDadosAno() {
      if (!pessoa || !ano) {
        setDadosAno([]);
        return;
      }
      const receitas: number[] = Array(12).fill(0);
      const despesas: number[] = Array(12).fill(0);
      const despesasCartao: number[] = Array(12).fill(0);
      // Descobrir nome da pessoa
      const pessoaObj = pessoas.find(p => String(p.id) === String(pessoa));
      const pessoaNome = pessoaObj ? pessoaObj.nome : '';
      await Promise.all(
        Array.from({ length: 12 }, (_, i) => i + 1).map(async (mes) => {
          // Buscar transações normais
          const res = await getTransacoes({ pessoaId: pessoa, ano, mes: String(mes).padStart(2, '0') });
          const transacoes = Array.isArray(res.data) ? res.data : [];
          receitas[mes - 1] = transacoes.filter((t: any) => t.tipo === 'receita').reduce((acc, t) => acc + t.valor, 0);
          despesas[mes - 1] = transacoes.filter((t: any) => t.tipo === 'despesa').reduce((acc, t) => acc + t.valor, 0);
          // Buscar despesas de cartão de crédito
          try {
            if (pessoaNome) {
              const url = API_URLS.COMPRA_SEM_CARTAO(ano, String(mes).padStart(2, '0'), pessoaNome);
              const cartaoRes = await api.get(url);
              let despesasCartaoArr = cartaoRes.data;
              if (despesasCartaoArr && Array.isArray(despesasCartaoArr.compras)) {
                despesasCartaoArr = despesasCartaoArr.compras;
              } else if (!Array.isArray(despesasCartaoArr)) {
                if (despesasCartaoArr && Array.isArray(despesasCartaoArr.data)) {
                  despesasCartaoArr = despesasCartaoArr.data;
                } else if (despesasCartaoArr && Array.isArray(despesasCartaoArr.items)) {
                  despesasCartaoArr = despesasCartaoArr.items;
                } else if (despesasCartaoArr && typeof despesasCartaoArr === 'object') {
                  despesasCartaoArr = Object.values(despesasCartaoArr);
                } else {
                  despesasCartaoArr = [];
                }
              }
              despesasCartao[mes - 1] = (despesasCartaoArr || []).reduce((acc: number, c: any) => acc + (Number(c.valorParcela) || 0), 0);
            }
          } catch {}
        })
      );
      // Montar dados para o gráfico
      const data = MESES.map((mes, idx) => ({
        mes,
        Receita: receitas[idx],
        Despesa: despesas[idx] + despesasCartao[idx],
      }));
      setDadosAno(data);
    }
    carregarDadosAno();
  }, [pessoa, ano, pessoas]);

  if (loading) {
    return (
      <Box sx={{ height: 320, background: '#f5f6fa', borderRadius: 2, mt: 2, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingCard title="Gráfico de Receitas e Despesas do Ano" variant="detailed" />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6">Gráfico de Receitas e Despesas do Ano</Typography>
      <Box sx={{ height: 320, background: '#f5f6fa', borderRadius: 2, mt: 2, p: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosAno} margin={{ top: 16, right: 24, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" style={{ fontWeight: 700 }} />
            <YAxis tickFormatter={(v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
            <Tooltip formatter={(v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} />
            <Legend />
            <Bar dataKey="Receita" name="Receita" radius={[8,8,0,0]} fill="#6ee7b7" />
            <Bar dataKey="Despesa" name="Despesa" radius={[8,8,0,0]} fill="#fca5a5" />
          </BarChart>
        </ResponsiveContainer>
        {loading && <Typography align="center" sx={{ mt: 2 }}>Carregando dados do ano...</Typography>}
      </Box>
    </Box>
  );
} 