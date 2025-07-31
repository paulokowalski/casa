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

  useEffect(() => {
    const carregarDados = async () => {
      if (!ano || !mes) return;
      
      setLoading(true);
      try {
        const dataStr = `${ano}-${mes.padStart(2, '0')}-01`;
        
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
          
          const possiveisCampos = ['gerado', 'geracao', 'geracaoTotal', 'totalGeracao', 'energia', 'energiaTotal', 'totalEnergia', 'kwh', 'totalKwh'];
          let valorGeracao = null;
          
          for (const campo of possiveisCampos) {
            if (payload[campo] !== undefined) {
              valorGeracao = payload[campo];
              break;
            }
          }
          
          if (valorGeracao === null) {
            if (payload.data && typeof payload.data === 'object') {
              for (const campo of possiveisCampos) {
                if (payload.data[campo] !== undefined) {
                  valorGeracao = payload.data[campo];
                  break;
                }
              }
            }
            
            if (valorGeracao === null && payload.potencias && Array.isArray(payload.potencias)) {
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
            const totalWatts = dadosEnergia.reduce((acc: number, dado: DadosEnergia) => acc + dado.geracao, 0);
            const totalKwh = (totalWatts * 1) / (1000 * 60);
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

    carregarDados();
  }, [ano, mes]);

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
    if (!ano || !mes) return;
    
    setLoading(true);
    const carregarDados = async () => {
      try {
        const dataStr = `${ano}-${mes.padStart(2, '0')}-01`;
        
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
          
          const possiveisCampos = ['gerado', 'geracao', 'geracaoTotal', 'totalGeracao', 'energia', 'energiaTotal', 'totalEnergia', 'kwh', 'totalKwh'];
          let valorGeracao = null;
          
          for (const campo of possiveisCampos) {
            if (payload[campo] !== undefined) {
              valorGeracao = payload[campo];
              break;
            }
          }
          
          if (valorGeracao === null) {
            if (payload.data && typeof payload.data === 'object') {
              for (const campo of possiveisCampos) {
                if (payload.data[campo] !== undefined) {
                  valorGeracao = payload.data[campo];
                  break;
                }
              }
            }
            
            if (valorGeracao === null && payload.potencias && Array.isArray(payload.potencias)) {
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
            const totalWatts = dadosEnergia.reduce((acc: number, dado: DadosEnergia) => acc + dado.geracao, 0);
            const totalKwh = (totalWatts * 1) / (1000 * 60);
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