import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { getGeracaoSolar } from '../services/api';

export interface DadosEnergia {
  id: string;
  data: string;
  horario: string;
  geracao: number;
  consumo: number;
  injecao: number;
  pessoa: string;
  ano: string;
  mes: string;
}

interface EnergiaContextData {
  dadosEnergia: DadosEnergia[];
  geracaoTotal: number;
  adicionar: (d: Omit<DadosEnergia, 'id'>) => void;
  editar: (id: string, d: Omit<DadosEnergia, 'id'>) => void;
  excluir: (id: string) => void;
  recarregarDados: () => void;
  ano: string;
  setAno: (a: string) => void;
  mes: string;
  setMes: (m: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
}

const EnergiaContext = createContext<EnergiaContextData>({} as any);
export const useEnergia = () => useContext(EnergiaContext);

export function EnergiaProvider({ children }: { children: React.ReactNode }) {
  const [dadosEnergia, setDadosEnergia] = useState<DadosEnergia[]>([]);
  const [geracaoTotal, setGeracaoTotal] = useState<number>(0);
  const [ano, setAno] = useState('');
  const [mes, setMes] = useState('');
  const [loading, setLoading] = useState(false);

  // Carregar dados baseado nos filtros
  useEffect(() => {
    const carregarDados = async () => {
      if (!ano || !mes) return; // Só carrega se ano e mês estiverem definidos
      
      setLoading(true);
      try {
        // Construir data baseada nos filtros
        const dataStr = `${ano}-${mes.padStart(2, '0')}-01`; // Primeiro dia do mês
        
        const res = await getGeracaoSolar(dataStr);
        const payload = res.data;
        
        if (payload && payload.potencias) {
          // Converter dados do formato do dashboard para o formato da tela de energia
          const dadosEnergia = payload.potencias.map((item: any, index: number) => {
            const [ano, mes, dia, hora, minuto, segundo] = item.data;
            const dataFormatada = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const horario = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
            
            return {
              id: `hoje-${index}`,
              data: dataFormatada,
              horario: horario,
              geracao: item.potencia, // Potência real em Watts
              consumo: 0, // Não temos dados de consumo real
              injecao: 0, // Não temos dados de injeção real
              pessoa: '',
              ano: String(ano),
              mes: String(mes).padStart(2, '0'),
            };
          });
          
          setDadosEnergia(dadosEnergia);
          
          // Usar o valor de geração total da API (em kWh)
          
          // Verificar diferentes possíveis nomes do campo
          const possiveisCampos = ['gerado', 'geracao', 'geracaoTotal', 'totalGeracao', 'energia', 'energiaTotal', 'totalEnergia', 'kwh', 'totalKwh'];
          let valorGeracao = null;
          
          // Verificar campos diretos
          for (const campo of possiveisCampos) {
            if (payload[campo] !== undefined) {
              valorGeracao = payload[campo];
              break;
            }
          }
          
          // Se não encontrou, verificar se está dentro de uma estrutura aninhada
          if (valorGeracao === null) {
            if (payload.data && typeof payload.data === 'object') {
              for (const campo of possiveisCampos) {
                if (payload.data[campo] !== undefined) {
                  valorGeracao = payload.data[campo];
                  break;
                }
              }
            }
            
            // Verificar se está dentro de payload.potencias
            if (valorGeracao === null && payload.potencias && Array.isArray(payload.potencias)) {
              // Procurar por um campo que contenha o total
              for (const potencia of payload.potencias) {
                if (typeof potencia === 'object' && potencia !== null) {
                  for (const campo of possiveisCampos) {
                    if (potencia[campo] !== undefined) {
                      valorGeracao = potencia[campo];
                      break;
                    }
                  }
                  if (valorGeracao !== null) break;
                }
              }
            }
          }
          
          if (valorGeracao !== null) {
            setGeracaoTotal(valorGeracao);
          } else {
            // Se não encontrar o campo de geração, calcular baseado nas potências
            // Assumindo que cada registro representa 1 minuto de medição
            const totalWatts = dadosEnergia.reduce((acc: number, dado: DadosEnergia) => acc + dado.geracao, 0);
            const totalKwh = (totalWatts * 1) / (1000 * 60); // 1 minuto = 1/60 hora
            setGeracaoTotal(totalKwh);
          }
        } else {
          setDadosEnergia([]);
          setGeracaoTotal(0);
        }
      } catch (error) {
        console.error('Erro ao carregar dados de energia:', error);
        setDadosEnergia([]);
      } finally {
        setLoading(false);
      }
    };

    // Carregar dados quando os filtros mudarem
    carregarDados();
  }, [ano, mes]); // Recarrega quando ano ou mês mudarem

  function adicionar(d: Omit<DadosEnergia, 'id'>) {
    const novoDado = {
      ...d,
      id: Date.now().toString(),
    };
    setDadosEnergia(prev => [...prev, novoDado]);
  }

  function editar(id: string, d: Omit<DadosEnergia, 'id'>) {
    setDadosEnergia(prev => prev.map(item => item.id === id ? { ...d, id } : item));
  }

  function excluir(id: string) {
    setDadosEnergia(prev => prev.filter(item => item.id !== id));
  }

  function recarregarDados() {
    if (!ano || !mes) return; // Só recarrega se ano e mês estiverem definidos
    
    setLoading(true);
    const carregarDados = async () => {
      try {
        // Construir data baseada nos filtros
        const dataStr = `${ano}-${mes.padStart(2, '0')}-01`; // Primeiro dia do mês
        
        const res = await getGeracaoSolar(dataStr);
        const payload = res.data;
        
        if (payload && payload.potencias) {
          const dadosEnergia = payload.potencias.map((item: any, index: number) => {
            const [ano, mes, dia, hora, minuto, segundo] = item.data;
            const dataFormatada = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
            const horario = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
            
            return {
              id: `hoje-${index}`,
              data: dataFormatada,
              horario: horario,
              geracao: item.potencia,
              consumo: 0,
              injecao: 0,
              pessoa: '',
              ano: String(ano),
              mes: String(mes).padStart(2, '0'),
            };
          });
          
          setDadosEnergia(dadosEnergia);
          
          // Verificar diferentes possíveis nomes do campo
          const possiveisCampos = ['gerado', 'geracao', 'geracaoTotal', 'totalGeracao', 'energia', 'energiaTotal', 'totalEnergia', 'kwh', 'totalKwh'];
          let valorGeracao = null;
          
          // Verificar campos diretos
          for (const campo of possiveisCampos) {
            if (payload[campo] !== undefined) {
              valorGeracao = payload[campo];
              break;
            }
          }
          
          // Se não encontrou, verificar se está dentro de uma estrutura aninhada
          if (valorGeracao === null) {
            if (payload.data && typeof payload.data === 'object') {
              for (const campo of possiveisCampos) {
                if (payload.data[campo] !== undefined) {
                  valorGeracao = payload.data[campo];
                  break;
                }
              }
            }
            
            // Verificar se está dentro de payload.potencias
            if (valorGeracao === null && payload.potencias && Array.isArray(payload.potencias)) {
              // Procurar por um campo que contenha o total
              for (const potencia of payload.potencias) {
                if (typeof potencia === 'object' && potencia !== null) {
                  for (const campo of possiveisCampos) {
                    if (potencia[campo] !== undefined) {
                      valorGeracao = potencia[campo];
                      break;
                    }
                  }
                  if (valorGeracao !== null) break;
                }
              }
            }
          }
          
          if (valorGeracao !== null) {
            setGeracaoTotal(valorGeracao);
          } else {
            // Se não encontrar o campo de geração, calcular baseado nas potências
            // Assumindo que cada registro representa 1 minuto de medição
            const totalWatts = dadosEnergia.reduce((acc: number, dado: DadosEnergia) => acc + dado.geracao, 0);
            const totalKwh = (totalWatts * 1) / (1000 * 60); // 1 minuto = 1/60 hora
            setGeracaoTotal(totalKwh);
          }
        } else {
          setDadosEnergia([]);
          setGeracaoTotal(0);
        }
      } catch (error) {
        console.error('Erro ao recarregar dados de energia:', error);
        setDadosEnergia([]);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }

  return (
    <EnergiaContext.Provider value={{
      dadosEnergia,
      geracaoTotal,
      adicionar,
      editar,
      excluir,
      recarregarDados,
      ano,
      setAno,
      mes,
      setMes,
      loading,
      setLoading,
    }}>
      {children}
    </EnergiaContext.Provider>
  );
} 