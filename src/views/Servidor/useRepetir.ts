import { useEffect, useRef } from 'react';

/** Repete a função enquanto a aba está visível e roda de novo assim que ela volta a aparecer. */
export function useRepetir(fn: () => void, intervaloMs: number) {
  useEffect(() => {
    fn();
    const timer = window.setInterval(() => {
      if (!document.hidden) fn();
    }, intervaloMs);
    const aoVoltar = () => {
      if (!document.hidden) fn();
    };
    document.addEventListener('visibilitychange', aoVoltar);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', aoVoltar);
    };
  }, [fn, intervaloMs]);
}

/**
 * Roda as leituras quando o contador {@code pedido} muda (botão "Atualizar agora" do cabeçalho). Ignora o valor
 * inicial: na montagem quem lê é o useRepetir.
 */
export function useAtualizarAoPedir(pedido: number, ...leituras: (() => void)[]) {
  const atendido = useRef(pedido);
  const atuais = useRef(leituras);
  useEffect(() => {
    atuais.current = leituras;
  });
  useEffect(() => {
    if (pedido === atendido.current) return;
    atendido.current = pedido;
    atuais.current.forEach((ler) => ler());
  }, [pedido]);
}
