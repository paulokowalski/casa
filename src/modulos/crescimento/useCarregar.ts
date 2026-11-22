import { useCallback, useEffect, useRef, useState } from 'react';

/** Carrega dados com a função dada sempre que as dependências (ou a versão) mudam. */
export function useCarregar<T>(carregar: () => Promise<T>, deps: unknown[]) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const seq = useRef(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fn = useCallback(carregar, deps);

  const recarregar = useCallback(() => {
    const atual = ++seq.current;
    setCarregando(true);
    fn()
      .then((d) => {
        if (atual !== seq.current) return;
        setDados(d);
        setErro(null);
      })
      .catch((e: Error) => atual === seq.current && setErro(e.message))
      .finally(() => atual === seq.current && setCarregando(false));
  }, [fn]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { dados, erro, carregando, recarregar, setDados };
}
