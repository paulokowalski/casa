import { corClara as cor } from './estilo';

export interface DadosCartao {
  fotoUrl: string;
  numero: string | null;
  unidade: string | null;
  titulo: string;
  nome: string;
  data: string;
  detalhe?: string | null;
  sexo: 'M' | 'F';
}

function carregarImagem(url: string): Promise<HTMLImageElement> {
  return new Promise((ok, falha) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => falha(new Error('Não foi possível carregar a foto.'));
    img.src = url;
  });
}

function retanguloArredondado(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Cartão 1080×1350 (formato de post) com a foto, o mêsversário e o nome. */
export async function gerarCartao(d: DadosCartao): Promise<Blob> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Seu navegador não conseguiu montar o cartão.');
  await Promise.all(['500', '600', '700', '800'].map((p) => document.fonts?.load(`${p} 40px 'Inter Variable'`))).catch(
    () => undefined,
  );
  const principal = d.sexo === 'F' ? cor.rosa : cor.azul;
  const forte = d.sexo === 'F' ? cor.rosaForte : cor.azulForte;

  ctx.fillStyle = cor.creme;
  ctx.fillRect(0, 0, W, H);
  // bolinhas de confete
  const confete = [cor.rosa, cor.azul, cor.menta, cor.amarelo, cor.lilas];
  let semente = 7;
  const aleatorio = () => (semente = (semente * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 46; i++) {
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = confete[i % confete.length];
    ctx.beginPath();
    ctx.arc(aleatorio() * W, aleatorio() * H, 6 + aleatorio() * 16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // moldura tipo polaroide
  const img = await carregarImagem(d.fotoUrl);
  const fx = 110;
  const fy = 90;
  const fw = W - 220;
  const fh = 860;
  ctx.save();
  ctx.translate(W / 2, fy + fh / 2);
  ctx.rotate(-0.02);
  ctx.translate(-W / 2, -(fy + fh / 2));
  ctx.shadowColor = 'rgba(59,47,63,.18)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = '#fff';
  retanguloArredondado(ctx, fx - 24, fy - 24, fw + 48, fh + 48, 28);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  retanguloArredondado(ctx, fx, fy, fw, fh, 18);
  ctx.clip();
  const escala = Math.max(fw / img.width, fh / img.height);
  const iw = img.width * escala;
  const ih = img.height * escala;
  ctx.drawImage(img, fx + (fw - iw) / 2, fy + (fh - ih) / 2, iw, ih);
  ctx.restore();

  // selo com o número
  const sx = W - 190;
  const sy = fy + fh - 40;
  ctx.fillStyle = principal;
  ctx.beginPath();
  ctx.arc(sx, sy, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const numero = d.numero ?? '★';
  ctx.font = `800 ${numero.length > 2 ? 78 : 104}px 'Inter Variable', Arial, sans-serif`;
  ctx.fillText(numero, sx, sy - (d.unidade ? 18 : 0));
  if (d.unidade) {
    ctx.font = '700 34px "Inter Variable", Arial, sans-serif';
    ctx.fillText(d.unidade, sx, sy + 52);
  }

  // textos
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = forte;
  ctx.font = '800 76px "Inter Variable", Arial, sans-serif';
  ctx.fillText(d.titulo, 110, 1110, W - 220);
  ctx.fillStyle = cor.tinta;
  ctx.font = '600 46px "Inter Variable", Arial, sans-serif';
  ctx.fillText(d.nome, 110, 1180, W - 220);
  ctx.fillStyle = cor.tintaSuave;
  ctx.font = '500 36px "Inter Variable", Arial, sans-serif';
  ctx.fillText([d.data, d.detalhe].filter(Boolean).join('  ·  '), 110, 1240, W - 220);

  return new Promise((ok, falha) =>
    canvas.toBlob((b) => (b ? ok(b) : falha(new Error('Não foi possível gerar a imagem.'))), 'image/jpeg', 0.92),
  );
}

/** Compartilha (celular) ou baixa o cartão. Devolve "compartilhado" ou "baixado". */
export async function compartilharCartao(blob: Blob, nomeArquivo: string): Promise<'compartilhado' | 'baixado'> {
  const arquivo = new File([blob], nomeArquivo, { type: 'image/jpeg' });
  if (navigator.canShare?.({ files: [arquivo] })) {
    try {
      await navigator.share({ files: [arquivo] });
      return 'compartilhado';
    } catch (e) {
      if ((e as Error).name === 'AbortError') return 'compartilhado';
    }
  }
  // link temporário para o próprio blob (sem converter a imagem inteira em texto); liberado depois do clique
  const url = URL.createObjectURL(blob);
  try {
    const a = document.createElement('a');
    a.href = url;
    a.download = nomeArquivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    // o navegador já começou o download no clique; libera no próximo ciclo
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
  return 'baixado';
}
