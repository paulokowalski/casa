import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { api } from '../services/api';
import { API_URLS } from '../config/urls';

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

export interface DadosGeracaoMensal {
  mes: string;
  geracao: number;
}

export interface DadosGeracaoDiaria {
  dia: string;
  geracao: number;
}

export interface DadosPotenciaDia {
  horario: string;
  potencia: number;
}

interface EnergiaContextData {
  // Estados existentes
  dadosEnergia: DadosEnergia[];
  geracaoTotal: number;
  ano: string;
  setAno: (a: string) => void;
  mes: string;
  setMes: (m: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  
  // Novos estados para os gráficos
  dadosGeracaoMensal: DadosGeracaoMensal[];
  dadosGeracaoDiaria: DadosGeracaoDiaria[];
  dadosPotenciaDia: DadosPotenciaDia[];
  geracaoDia: number | undefined;
  loadingMensal: boolean;
  loadingDiaria: boolean;
  loadingPotencia: boolean;
  
  // Funções existentes
  adicionar: (d: Omit<DadosEnergia, 'id'>) => void;
  editar: (id: string, d: Omit<DadosEnergia, 'id'>) => void;
  excluir: (id: string) => void;
  recarregarDados: () => void;
  
  // Novas funções para os gráficos
  carregarDadosGeracaoMensal: () => void;
  carregarDadosGeracaoDiaria: () => void;
  carregarDadosPotenciaDia: (diaSelecionado: number) => void;
}

const EnergiaContext = createContext<EnergiaContextData>({} as any);
export const useEnergia = () => useContext(EnergiaContext);

// Funções auxiliares
function getDiasNoMes(ano: number, mes: number): number {
  return new Date(ano, mes, 0).getDate();
}

const mesesPt = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const mesesEn = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
];

export function EnergiaProvider({ children }: { children: React.ReactNode }) {
  // Estados existentes
  const [dadosEnergia, setDadosEnergia] = useState<DadosEnergia[]>([]);
  const [geracaoTotal, setGeracaoTotal] = useState<number>(0);
  const [ano, setAno] = useState('');
  const [mes, setMes] = useState('');
  const [loading, setLoading] = useState(false);

  // Novos estados para os gráficos
  const [dadosGeracaoMensal, setDadosGeracaoMensal] = useState<DadosGeracaoMensal[]>([]);
  const [dadosGeracaoDiaria, setDadosGeracaoDiaria] = useState<DadosGeracaoDiaria[]>([]);
  const [dadosPotenciaDia, setDadosPotenciaDia] = useState<DadosPotenciaDia[]>([]);
  const [geracaoDia, setGeracaoDia] = useState<number | undefined>(undefined);
  const [loadingMensal, setLoadingMensal] = useState(false);
  const [loadingDiaria, setLoadingDiaria] = useState(false);
  const [loadingPotencia, setLoadingPotencia] = useState(false);

  // Carregar dados de geração mensal
  const carregarDadosGeracaoMensal = useCallback(async () => {
    if (!ano) return;
    
    setLoadingMensal(true);
    try {
      const res = await api.get(API_URLS.GERACAO_SOLAR_ANO(ano));
      const lista = Array.isArray(res.data) ? res.data : [];
      const map: Record<string, number> = {};
      
      lista.forEach((item: any) => {
        let idx = -1;
        if (typeof item.month === 'string') {
          idx = mesesEn.indexOf(item.month.toUpperCase());
        } else if (typeof item.month === 'number') {
          idx = item.month - 1;
        }
        if (idx >= 0) {
          map[idx] = item.value ?? 0;
        }
      });
      
      const dadosGrafico = mesesPt.map((mes, idx) => ({
        mes,
        geracao: map[idx] ?? 0,
      }));
      
      setDadosGeracaoMensal(dadosGrafico);
    } catch (error) {
      console.error('Erro ao carregar dados mensais:', error);
      setDadosGeracaoMensal([]);
    } finally {
      setLoadingMensal(false);
    }
  }, [ano]);

  // Carregar dados de geração diária
  const carregarDadosGeracaoDiaria = useCallback(async () => {
    if (!ano || !mes) return;
    
    setLoadingDiaria(true);
    try {
      const mesNumero = parseInt(mes);
      const diasNoMes = getDiasNoMes(parseInt(ano), mesNumero);
      const diasArray = Array.from({ length: diasNoMes }, (_, i) => i + 1);
      
      const res = await api.get(API_URLS.GERACAO_SOLAR_ANO_MES(ano, mes));
      const obj = res.data || {};
      const lista = Array.isArray(obj.valores) ? obj.valores : [];
      const map: Record<number, number> = {};
      
      lista.forEach((item: any) => {
        let dia = undefined;
        if (item.data) {
          if (typeof item.data === 'string') {
            const partes = item.data.split('T')[0].split('-');
            if (partes.length === 3) dia = Number(partes[2]);
          } else if (Array.isArray(item.data) && item.data.length >= 3) {
            dia = item.data[2];
          }
        }
        if (typeof dia === 'string') dia = Number(dia);
        if (typeof dia === 'number' && !isNaN(dia)) {
          map[dia] = (map[dia] ?? 0) + (item.valor ?? 0);
        }
      });
      
      const dadosGrafico = diasArray.map((dia) => ({
        dia: String(dia),
        geracao: map[dia] ?? 0,
      }));
      
      setDadosGeracaoDiaria(dadosGrafico);
    } catch (error) {
      console.error('Erro ao carregar dados diários:', error);
      setDadosGeracaoDiaria([]);
    } finally {
      setLoadingDiaria(false);
    }
  }, [ano, mes]);

  // Carregar dados de potência do dia
  const carregarDadosPotenciaDia = useCallback(async (diaSelecionado: number) => {
    if (!ano || !mes || !diaSelecionado) {
      setDadosPotenciaDia([]);
      setGeracaoDia(undefined);
      return;
    }
    
    setLoadingPotencia(true);
    try {
      const dataStr = `${ano}-${mes}-${String(diaSelecionado).padStart(2, '0')}`;
      const res = await api.get(API_URLS.GERACAO_SOLAR(dataStr));
      
      const payload = res.data || {};
      const lista = Array.isArray(payload.valores) ? payload.valores : [];
      const dadosGrafico = lista.map((item: any) => {
        let horario = '';
        if (item.data) {
          if (Array.isArray(item.data) && item.data.length >= 6) {
            horario = `${String(item.data[3]).padStart(2, '0')}:${String(item.data[4]).padStart(2, '0')}`;
          } else if (typeof item.data === 'string') {
            const partes = item.data.split('T')[1]?.split(':');
            if (partes && partes.length >= 2) {
              horario = `${partes[0]}:${partes[1]}`;
            }
          }
        }
        return {
          horario,
          potencia: item.valor ?? 0,
        };
      });
      
      setDadosPotenciaDia(dadosGrafico);
      
      // Capturar valor de geração do dia
      const possiveisCampos = ['gerado', 'geracao', 'geracaoTotal', 'totalGeracao', 'energia', 'energiaTotal', 'totalEnergia', 'kwh', 'totalKwh'];
      let valorGeracao = undefined;
      
      for (const campo of possiveisCampos) {
        if (payload[campo] !== undefined) {
          valorGeracao = payload[campo];
          break;
        }
      }
      
      setGeracaoDia(valorGeracao);
    } catch (error) {
      console.error('Erro ao carregar dados de potência:', error);
      setDadosPotenciaDia([]);
      setGeracaoDia(undefined);
    } finally {
      setLoadingPotencia(false);
    }
  }, [ano, mes]);

  // Carregar dados quando ano ou mês mudar
  useEffect(() => {
    carregarDadosGeracaoMensal();
  }, [carregarDadosGeracaoMensal]);

  useEffect(() => {
    carregarDadosGeracaoDiaria();
  }, [carregarDadosGeracaoDiaria]);

  // Carregar dados existentes (mantido para compatibilidade)
  useEffect(() => {
    const carregarDados = async () => {
      if (!ano || !mes) return;
      
      setLoading(true);
      try {
        const dataStr = `${ano}-${mes.padStart(2, '0')}-01`;
        
        const res = await api.get(API_URLS.GERACAO_SOLAR(dataStr));
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
        
        const res = await api.get(API_URLS.GERACAO_SOLAR(dataStr));
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
      // Estados existentes
      dadosEnergia,
      geracaoTotal,
      ano,
      setAno,
      mes,
      setMes,
      loading,
      setLoading,
      
      // Novos estados para os gráficos
      dadosGeracaoMensal,
      dadosGeracaoDiaria,
      dadosPotenciaDia,
      geracaoDia,
      loadingMensal,
      loadingDiaria,
      loadingPotencia,
      
      // Funções existentes
      adicionar,
      editar,
      excluir,
      recarregarDados,
      
      // Novas funções para os gráficos
      carregarDadosGeracaoMensal,
      carregarDadosGeracaoDiaria,
      carregarDadosPotenciaDia,
    }}>
      {children}
    </EnergiaContext.Provider>
  );
} 