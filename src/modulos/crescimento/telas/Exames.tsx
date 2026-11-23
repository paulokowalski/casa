import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Modal } from '../../../components/ui/Modal';
import { useToast } from '../../../contexts/ToastContext';
import { crescimentoApi } from '../api';
import { Carregando, Erro } from '../componentes';
import { cor } from '../estilo';
import { dataCurta, dataLonga, hojeISO } from '../formato';
import { useCarregar } from '../useCarregar';
import type { Crianca, Exame } from '../tipos';
import type { PropsAba } from '.';

const ACEITOS = 'application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png';
const LIMITE = 25 * 1024 * 1024;

function tamanho(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`;
}

/** "hemograma_completo.pdf" → "hemograma completo" (sugestão de nome do exame). */
function nomeSugerido(arquivo: File): string {
  return arquivo.name
    .replace(/\.[^.]+$/, '')
    .replace(/[_-]+/g, ' ')
    .trim()
    .slice(0, 120);
}

type Edicao = { exame: Exame | null; arquivo: File | null };

export function ExamesTela({ crianca, versao }: Readonly<PropsAba>) {
  const { notify } = useToast();
  const { dados, erro, recarregar } = useCarregar(() => crescimentoApi.exames(crianca.id), [crianca.id, versao]);
  const [edicao, setEdicao] = useState<Edicao | null>(null);
  const [aberto, setAberto] = useState<Exame | null>(null);
  const [aExcluir, setAExcluir] = useState<Exame | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExcluir, setErroExcluir] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  const porAno = useMemo(() => {
    const grupos = new Map<string, Exame[]>();
    for (const e of dados ?? []) {
      const ano = e.data.slice(0, 4);
      grupos.set(ano, [...(grupos.get(ano) ?? []), e]);
    }
    return [...grupos.entries()];
  }, [dados]);

  function escolher(arquivos: FileList | null) {
    const arquivo = arquivos?.[0];
    if (input.current) input.current.value = '';
    if (!arquivo) return;
    if (arquivo.size > LIMITE) {
      notify('O arquivo é grande demais. O limite é de 25 MB.', 'error');
      return;
    }
    setEdicao({ exame: null, arquivo });
  }

  function pedirExclusao(e: Exame) {
    if (excluindo) return;
    setErroExcluir(null);
    setAExcluir(e);
  }

  async function excluir() {
    if (!aExcluir || excluindo) return;
    setExcluindo(true);
    setErroExcluir(null);
    try {
      await crescimentoApi.excluirExame(crianca.id, aExcluir.id);
      setAExcluir(null);
      setAberto(null);
      notify('Exame excluído');
      recarregar();
    } catch (err) {
      setErroExcluir((err as Error).message);
    } finally {
      setExcluindo(false);
    }
  }

  if (erro && !dados) return <Erro mensagem={erro} tentar={recarregar} />;
  if (!dados) return <Carregando />;

  return (
    <Box sx={{ maxWidth: 820, pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography sx={{ fontWeight: 700 }}>
            {dados.length === 0
              ? 'Nenhum exame guardado'
              : `${dados.length} ${dados.length === 1 ? 'exame' : 'exames'}`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Resultados em PDF ou foto (JPG, PNG), vistos só pela família.
          </Typography>
        </Box>
        {crianca.podeEditar && (
          <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => input.current?.click()}>
            Enviar exame
          </Button>
        )}
        <input
          ref={input}
          type="file"
          accept={ACEITOS}
          hidden
          aria-label="Arquivo do exame"
          onChange={(e) => escolher(e.target.files)}
        />
      </Box>

      {dados.length === 0 && (
        <Box
          sx={{
            textAlign: 'center',
            py: 6,
            px: 2,
            border: `2px dashed ${cor.borda}`,
            borderRadius: 4,
            color: 'text.secondary',
          }}
        >
          <UploadFileRoundedIcon sx={{ fontSize: 48, color: cor.lilasForte, mb: 1 }} />
          <Typography>
            {crianca.podeEditar
              ? 'Envie hemogramas, ultrassons, teste do pezinho e outros resultados para tê-los sempre à mão nas consultas.'
              : 'Os responsáveis ainda não enviaram exames.'}
          </Typography>
        </Box>
      )}

      {porAno.map(([ano, lista]) => (
        <Box key={ano} sx={{ mb: 3 }}>
          <Typography component="h2" variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            {ano}
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
            {lista.map((e) => (
              <CartaoExame key={e.id} exame={e} onAbrir={() => setAberto(e)} />
            ))}
          </Box>
        </Box>
      ))}

      <ExameDialog
        crianca={crianca}
        edicao={edicao}
        onFechar={() => setEdicao(null)}
        onSalvo={(e) => {
          setEdicao(null);
          if (aberto?.id === e.id) setAberto(e);
          recarregar();
        }}
      />
      <VisualizadorExame
        crianca={crianca}
        exame={aberto}
        onFechar={() => setAberto(null)}
        onEditar={(e) => setEdicao({ exame: e, arquivo: null })}
        onExcluir={pedirExclusao}
        excluindo={excluindo}
      />
      <ConfirmDialog
        open={aExcluir !== null}
        title="Excluir exame"
        description={`Excluir o exame "${aExcluir?.titulo ?? ''}"? O arquivo também será apagado.`}
        confirmLabel="Excluir"
        destructive
        loading={excluindo}
        error={erroExcluir}
        onConfirm={excluir}
        onClose={() => setAExcluir(null)}
      />
    </Box>
  );
}

function CartaoExame({ exame, onAbrir }: Readonly<{ exame: Exame; onAbrir: () => void }>) {
  const pdf = exame.tipo === 'PDF';
  return (
    <Box
      component="button"
      type="button"
      onClick={onAbrir}
      aria-label={`Ver exame ${exame.titulo}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        textAlign: 'left',
        font: 'inherit',
        color: 'inherit',
        cursor: 'pointer',
        bgcolor: cor.papel,
        border: `1px solid ${cor.borda}`,
        borderRadius: 3,
        minWidth: 0,
        transition: 'border-color .15s, transform .15s',
        '&:hover': { borderColor: cor.lilas, transform: 'translateY(-1px)' },
        '&:focus-visible': { outline: `2px solid ${cor.lilasForte}`, outlineOffset: 2 },
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: pdf ? cor.rosaClaro : cor.azulClaro,
          color: pdf ? cor.rosaForte : cor.azulForte,
        }}
      >
        {pdf ? <PictureAsPdfOutlinedIcon /> : <ImageOutlinedIcon />}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontWeight: 700 }} noWrap>
          {exame.titulo}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {dataCurta(exame.data)} · {pdf ? 'PDF' : 'Imagem'} · {tamanho(exame.bytes)}
        </Typography>
        {exame.observacao && (
          <Typography variant="body2" color="text.secondary" noWrap>
            {exame.observacao}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/** Enviar um exame novo (com o arquivo escolhido) ou editar nome, data e observação de um existente. */
function ExameDialog({
  crianca,
  edicao,
  onFechar,
  onSalvo,
}: Readonly<{ crianca: Crianca; edicao: Edicao | null; onFechar: () => void; onSalvo: (e: Exame) => void }>) {
  const { notify } = useToast();
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [observacao, setObservacao] = useState('');
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    if (!edicao) return;
    setTitulo(edicao.exame?.titulo ?? (edicao.arquivo ? nomeSugerido(edicao.arquivo) : ''));
    setData(edicao.exame?.data ?? hojeISO());
    setObservacao(edicao.exame?.observacao ?? '');
  }, [edicao]);

  const hoje = hojeISO();
  const dataInvalida = !data || data > hoje;
  const pode = titulo.trim().length > 0 && !dataInvalida && !ocupado;

  async function salvar() {
    if (!edicao || !pode) return;
    setOcupado(true);
    const corpo = { titulo: titulo.trim(), data, observacao: observacao.trim() || null };
    try {
      if (edicao.exame) {
        onSalvo(await crescimentoApi.atualizarExame(crianca.id, edicao.exame.id, corpo));
        notify('Exame salvo');
      } else if (edicao.arquivo) {
        const e = await crescimentoApi.enviarExame(crianca.id, edicao.arquivo, corpo);
        onSalvo(e);
        notify(e.jaExistia ? `Este arquivo já estava guardado como "${e.titulo}"` : 'Exame enviado');
      }
    } catch (err) {
      notify((err as Error).message, 'error');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <Modal
      open={edicao !== null}
      onClose={() => !ocupado && onFechar()}
      title={edicao?.exame ? 'Editar exame' : 'Enviar exame'}
      actions={
        <>
          <Button onClick={onFechar} disabled={ocupado}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={salvar}
            disabled={!pode}
            startIcon={ocupado ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {edicao?.exame ? 'Salvar' : 'Enviar'}
          </Button>
        </>
      }
    >
      <Stack spacing={2} sx={{ pt: 0.5 }}>
        {edicao?.arquivo && (
          <Alert severity="info" icon={<UploadFileRoundedIcon />}>
            {edicao.arquivo.name} · {tamanho(edicao.arquivo.size)}
          </Alert>
        )}
        <TextField
          label="Nome do exame"
          placeholder="Hemograma, ultrassom, teste do pezinho…"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          slotProps={{ htmlInput: { maxLength: 120 } }}
          required
          autoFocus
        />
        <TextField
          label="Data do exame"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          error={data > hoje}
          helperText={data > hoje ? 'A data não pode ser no futuro' : ' '}
          slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: hoje } }}
          required
        />
        <TextField
          label="Observação"
          placeholder="Laboratório, médico que pediu, resultado…"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          multiline
          minRows={2}
          slotProps={{ htmlInput: { maxLength: 1000 } }}
        />
      </Stack>
    </Modal>
  );
}

/** Abre o exame em tela cheia: imagem na tela, PDF embutido (no celular, botão para abrir no leitor de PDF). */
function VisualizadorExame({
  crianca,
  exame,
  onFechar,
  onEditar,
  onExcluir,
  excluindo,
}: Readonly<{
  crianca: Crianca;
  exame: Exame | null;
  onFechar: () => void;
  onEditar: (e: Exame) => void;
  onExcluir: (e: Exame) => void;
  /** enquanto a exclusão roda, o botão Excluir fica desativado */
  excluindo: boolean;
}>) {
  const [url, setUrl] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [tentativa, setTentativa] = useState(0);
  // celulares (Chrome do Android não mostra PDF embutido): PDF abre no leitor do aparelho
  const toque = useMediaQuery('(pointer: coarse)');
  const exameId = exame?.id;

  useEffect(() => {
    if (!exameId) return;
    let ativo = true;
    let criado: string | null = null;
    setUrl(null);
    setErro(null);
    crescimentoApi
      .arquivoExame(crianca.id, exameId)
      .then((blob) => {
        if (!ativo) return;
        criado = URL.createObjectURL(blob);
        setUrl(criado);
      })
      .catch((e: Error) => ativo && setErro(e.message));
    return () => {
      ativo = false;
      if (criado) URL.revokeObjectURL(criado);
    };
  }, [crianca.id, exameId, tentativa]);

  const pdf = exame?.tipo === 'PDF';

  return (
    <Dialog
      open={exame !== null}
      onClose={onFechar}
      fullScreen
      aria-labelledby="exame-titulo"
      slotProps={{ paper: { sx: { bgcolor: '#111', color: '#eee' } } }}
    >
      {exame && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: { xs: 1, sm: 2 }, py: 1 }}>
            <Box sx={{ minWidth: 0, flex: 1, pl: 1 }}>
              <Typography id="exame-titulo" sx={{ fontWeight: 700 }} noWrap>
                {exame.titulo}
              </Typography>
              <Typography variant="body2" sx={{ color: '#aaa' }} noWrap>
                {dataLonga(exame.data)}
                {exame.observacao ? ` · ${exame.observacao}` : ''}
              </Typography>
            </Box>
            {url && (
              <Tooltip title="Baixar">
                <IconButton
                  component="a"
                  href={url}
                  download={exame.nomeArquivo}
                  aria-label="Baixar"
                  sx={{ color: '#eee' }}
                >
                  <DownloadRoundedIcon />
                </IconButton>
              </Tooltip>
            )}
            {crianca.podeEditar && (
              <>
                <Tooltip title="Editar">
                  <IconButton onClick={() => onEditar(exame)} aria-label="Editar" sx={{ color: '#eee' }}>
                    <EditOutlinedIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Excluir">
                  {/* span: o Tooltip precisa de um filho que receba eventos mesmo com o botão desativado */}
                  <span>
                    <IconButton
                      onClick={() => onExcluir(exame)}
                      disabled={excluindo}
                      aria-label="Excluir"
                      sx={{ color: '#eee' }}
                    >
                      <DeleteOutlineRoundedIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            )}
            <IconButton onClick={onFechar} aria-label="Fechar" sx={{ color: '#eee' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}>
            {erro ? (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={() => setTentativa((t) => t + 1)}>
                    Tentar de novo
                  </Button>
                }
              >
                {erro}
              </Alert>
            ) : !url ? (
              <CircularProgress aria-label="Carregando o exame" sx={{ color: '#eee' }} />
            ) : !pdf ? (
              <Box
                component="img"
                src={url}
                alt={exame.titulo}
                sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            ) : toque ? (
              <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', px: 2 }}>
                <PictureAsPdfOutlinedIcon sx={{ fontSize: 72, color: cor.rosa }} />
                <Typography>{exame.nomeArquivo}</Typography>
                <Button
                  variant="contained"
                  startIcon={<OpenInNewRoundedIcon />}
                  component="a"
                  href={url}
                  target="_blank"
                  rel="noopener"
                >
                  Abrir PDF
                </Button>
              </Stack>
            ) : (
              <Box
                component="iframe"
                src={url}
                title={exame.titulo}
                sx={{ width: '100%', height: '100%', border: 0, bgcolor: '#fff', borderRadius: 1 }}
              />
            )}
          </Box>
        </Box>
      )}
    </Dialog>
  );
}
