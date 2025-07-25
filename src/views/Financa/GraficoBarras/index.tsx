import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useFinanca } from '../../../contexts/FinancaContext';
import { getTransacoes, api } from '../../../services/api';
import { API_URLS } from '../../../config/urls';
import { LoadingCard } from '../../../components/ui/LoadingCard';
import { formatCurrency } from '../../../functions/global';

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
      <Box sx={{ height: 320, background: '#23263a', borderRadius: 2, mt: 2, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingCard title="Gráfico de Receitas e Despesas do Ano" variant="detailed" />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ color: '#f5f6fa', mb: 2 }}>Gráfico de Receitas e Despesas do Ano</Typography>
      <Box sx={{ height: 380, background: '#23263a', borderRadius: 2, mt: 2, p: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dadosAno} margin={{ top: 16, right: 24, left: 0, bottom: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#444857" />
            <XAxis dataKey="mes" style={{ fontWeight: 700, fontSize: 12, fill: '#f5f6fa' }} tick={{ fill: '#f5f6fa' }} />
            <YAxis tickFormatter={(v: number) => formatCurrency(v)} tick={{ fill: '#f5f6fa' }} axisLine={{ stroke: '#444857' }} />
            <Tooltip contentStyle={{ background: '#181a20', color: '#f5f6fa', border: '1px solid #6366f1' }} formatter={(v: number) => formatCurrency(v)} />
            <Legend wrapperStyle={{ color: '#f5f6fa' }} />
            <Bar dataKey="Receita" name="Receita" radius={[8,8,0,0]} fill="#34d399" />
            <Bar dataKey="Despesa" name="Despesa" radius={[8,8,0,0]} fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
        {loading && <Typography align="center" sx={{ mt: 2, color: '#f5f6fa' }}>Carregando dados do ano...</Typography>}
      </Box>
    </Box>
  );
} 