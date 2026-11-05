import { useCallback, useEffect, useState } from 'react';
import { filtrosService, TODOS } from '../services/financas';
import type { Item } from '../types/financas';

export interface FiltrosSelecionados {
  ano: string;
  mes: string;
  pessoa: string;
  cartao: string;
}

const ITEM_TODOS: Item = { codigo: TODOS, descricao: 'Todos' };

/**
 * Cascata de filtros ano → mês → pessoa → cartão usada nas telas de cartão e financeira.
 * Ao abrir, já seleciona o mês atual (ou o mais recente com dados) e a primeira pessoa,
 * e chama `onPronto` com esses filtros para a tela carregar sozinha.
 */
export function useFiltrosCompra(onPronto?: (f: FiltrosSelecionados) => void) {
  const [anos, setAnos] = useState<Item[]>([]);
  const [meses, setMeses] = useState<Item[]>([]);
  const [pessoas, setPessoas] = useState<Item[]>([]);
  const [cartoes, setCartoes] = useState<Item[]>([ITEM_TODOS]);
  const [categorias, setCategorias] = useState<Item[]>([]);
  const [tiposLancamento, setTiposLancamento] = useState<Item[]>([]);
  const [selecionados, setSelecionados] = useState<FiltrosSelecionados>({
    ano: '',
    mes: '',
    pessoa: '',
    cartao: TODOS,
  });
  const [carregando, setCarregando] = useState(false);

  const carregarCartoes = useCallback(async (ano: string, mes: string, pessoa: string) => {
    const lista = pessoa ? await filtrosService.cartoes(ano, mes, pessoa) : [];
    setCartoes([ITEM_TODOS, ...lista]);
  }, []);

  // Carga inicial
  useEffect(() => {
    let ativo = true;
    (async () => {
      setCarregando(true);
      try {
        const [listaAnos, listaCategorias, listaTipos] = await Promise.all([
          filtrosService.anos(),
          filtrosService.categorias(),
          filtrosService.tiposLancamento(),
        ]);
        if (!ativo) return;
        setAnos(listaAnos);
        setCategorias(listaCategorias);
        setTiposLancamento(listaTipos);
        if (listaAnos.length === 0) return;

        const hoje = new Date();
        const ano = listaAnos.find((a) => a.codigo === String(hoje.getFullYear()))?.codigo ?? listaAnos[0].codigo;
        const listaMeses = await filtrosService.meses(ano);
        if (!ativo) return;
        setMeses(listaMeses);
        const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');
        const mes =
          listaMeses.find((m) => m.codigo === mesAtual)?.codigo ?? listaMeses[listaMeses.length - 1]?.codigo ?? '';

        const listaPessoas = mes ? await filtrosService.pessoas(ano, mes) : [];
        if (!ativo) return;
        setPessoas(listaPessoas);
        const pessoa = listaPessoas[0]?.codigo ?? '';
        await carregarCartoes(ano, mes, pessoa);
        if (!ativo) return;

        const iniciais = { ano, mes, pessoa, cartao: TODOS };
        setSelecionados(iniciais);
        if (mes && pessoa) onPronto?.(iniciais);
      } finally {
        if (ativo) setCarregando(false);
      }
    })();
    return () => {
      ativo = false;
    };
    // a carga inicial roda uma única vez
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selecionarAno = useCallback(async (ano: string) => {
    setSelecionados((s) => ({ ...s, ano, mes: '' }));
    setCarregando(true);
    try {
      setMeses(await filtrosService.meses(ano));
    } finally {
      setCarregando(false);
    }
  }, []);

  const selecionarMes = useCallback(
    async (mes: string) => {
      setCarregando(true);
      try {
        const ano = selecionados.ano;
        const lista = await filtrosService.pessoas(ano, mes);
        setPessoas(lista);
        const pessoa = lista.find((p) => p.codigo === selecionados.pessoa)?.codigo ?? lista[0]?.codigo ?? '';
        await carregarCartoes(ano, mes, pessoa);
        setSelecionados((s) => ({ ...s, mes, pessoa, cartao: TODOS }));
      } finally {
        setCarregando(false);
      }
    },
    [selecionados.ano, selecionados.pessoa, carregarCartoes],
  );

  const selecionarPessoa = useCallback(
    async (pessoa: string) => {
      setSelecionados((s) => ({ ...s, pessoa, cartao: TODOS }));
      setCarregando(true);
      try {
        await carregarCartoes(selecionados.ano, selecionados.mes, pessoa);
      } finally {
        setCarregando(false);
      }
    },
    [selecionados.ano, selecionados.mes, carregarCartoes],
  );

  const selecionarCartao = useCallback(
    (cartao: string) => setSelecionados((s) => ({ ...s, cartao: cartao || TODOS })),
    [],
  );

  return {
    anos,
    meses,
    pessoas,
    cartoes,
    categorias,
    tiposLancamento,
    selecionados,
    carregando,
    selecionarAno,
    selecionarMes,
    selecionarPessoa,
    selecionarCartao,
    completos: Boolean(selecionados.ano && selecionados.mes && selecionados.pessoa),
  };
}
