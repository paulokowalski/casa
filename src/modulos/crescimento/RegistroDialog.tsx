import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Stack, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import MonitorWeightOutlinedIcon from '@mui/icons-material/MonitorWeightOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { crescimentoApi } from './api';
import { SeletorFotos } from './componentes';
import { descartarNovas } from './fotos';
import { AVISO_NUMERO, hojeISO, numero, numeroInvalido, numeroParaTexto } from './formato';
import type { Crianca, Foto, Registro, TipoRegistro } from './tipos';

const TIPOS: { valor: TipoRegistro; rotulo: string; icone: React.ReactNode }[] = [
  { valor: 'MOMENTO', rotulo: 'Momento', icone: <FavoriteBorderRoundedIcon fontSize="small" /> },
  { valor: 'PESAGEM', rotulo: 'Pesagem', icone: <MonitorWeightOutlinedIcon fontSize="small" /> },
  { valor: 'CONSULTA', rotulo: 'Consulta', icone: <MedicalServicesOutlinedIcon fontSize="small" /> },
];

/** Novo registro do diário ou edição de um existente. */
export function RegistroDialog({
  crianca,
  aberto,
  registro,
  tipoInicial = 'MOMENTO',
  onFechar,
  onSalvo,
}: Readonly<{
  crianca: Crianca;
  aberto: boolean;
  registro?: Registro | null;
  tipoInicial?: TipoRegistro;
  onFechar: () => void;
  onSalvo: (r: Registro | null) => void;
}>) {
  const [tipo, setTipo] = useState<TipoRegistro>(tipoInicial);
  const [data, setData] = useState(hojeISO());
  const [descricao, setDescricao] = useState('');
  const [peso, setPeso] = useState('');
  const [comprimento, setComprimento] = useState('');
  const [perimetro, setPerimetro] = useState('');
  const [profissional, setProfissional] = useState('');
  const [retorno, setRetorno] = useState('');
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [enviandoFotos, setEnviandoFotos] = useState(false);
  const novas = useRef(new Set<string>());
  /** salvando ou enviando fotos: não deixa salvar nem fechar no meio */
  const travado = salvando || enviandoFotos;

  useEffect(() => {
    if (!aberto) return;
    const m = registro?.medicao;
    setTipo(registro?.tipo ?? tipoInicial);
    setData(registro?.data ?? hojeISO());
    setDescricao(registro?.texto ?? '');
    setPeso(numeroParaTexto(m?.peso?.valor));
    setComprimento(numeroParaTexto(m?.comprimento?.valor));
    setPerimetro(numeroParaTexto(m?.perimetro?.valor));
    setProfissional(registro?.profissional ?? '');
    setRetorno(registro?.proximaConsulta ?? '');
    setFotos(registro?.fotos ?? []);
    setErro(null);
    novas.current.clear();
  }, [aberto, registro, tipoInicial]);

  async function fechar() {
    await descartarNovas(novas.current);
    onFechar();
  }

  async function salvar() {
    setSalvando(true);
    setErro(null);
    try {
      const dados = {
        data,
        tipo,
        texto: descricao,
        profissional: tipo === 'CONSULTA' ? profissional : null,
        proximaConsulta: tipo === 'CONSULTA' && retorno ? retorno : null,
        albumChave: registro?.album?.chave ?? null,
        albumTitulo: registro?.album && registro.album.chave.startsWith('especial-') ? registro.album.titulo : null,
        pesoKg: tipo === 'MOMENTO' ? null : numero(peso),
        comprimentoCm: tipo === 'MOMENTO' ? null : numero(comprimento),
        perimetroCm: tipo === 'MOMENTO' ? null : numero(perimetro),
        fotoIds: fotos.map((f) => f.id),
      };
      const r = registro
        ? await crescimentoApi.atualizarRegistro(crianca.id, registro.id, dados)
        : await crescimentoApi.criarRegistro(crianca.id, dados);
      novas.current.clear();
      onSalvo(r);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!registro) return;
    setSalvando(true);
    try {
      await crescimentoApi.excluirRegistro(crianca.id, registro.id);
      setConfirmarExclusao(false);
      onSalvo(null);
    } catch (e) {
      setErro((e as Error).message);
      setConfirmarExclusao(false);
    } finally {
      setSalvando(false);
    }
  }

  const medidas = tipo !== 'MOMENTO';
  const invalido = {
    peso: medidas && numeroInvalido(peso),
    comprimento: medidas && numeroInvalido(comprimento),
    perimetro: medidas && numeroInvalido(perimetro),
  };
  const algumInvalido = invalido.peso || invalido.comprimento || invalido.perimetro;
  return (
    <>
      <Modal
        open={aberto}
        onClose={travado ? () => undefined : fechar}
        title={registro ? 'Editar registro' : 'Novo registro'}
        actions={
          <>
            {registro && (
              <Button color="error" onClick={() => setConfirmarExclusao(true)} disabled={travado} sx={{ mr: 'auto' }}>
                Excluir
              </Button>
            )}
            <Button variant="outlined" onClick={fechar} disabled={travado}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={salvar}
              disabled={travado || algumInvalido}
              startIcon={salvando ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              Salvar
            </Button>
          </>
        }
      >
        <Stack spacing={2}>
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            value={tipo}
            onChange={(_e, v: TipoRegistro | null) => v && setTipo(v)}
            aria-label="Tipo de registro"
          >
            {TIPOS.map((t) => (
              <ToggleButton key={t.valor} value={t.valor} sx={{ gap: 0.75 }}>
                {t.icone}
                {t.rotulo}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
          {registro?.album && <Alert severity="info">Este registro está no álbum: {registro.album.rotulo}.</Alert>}
          <TextField
            label="Data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: crianca.nascimento, max: hojeISO() } }}
          />
          {medidas && (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              <TextField
                label="Peso (kg)"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                error={invalido.peso}
                helperText={invalido.peso ? AVISO_NUMERO : undefined}
                slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                autoFocus={tipo === 'PESAGEM' && !registro}
              />
              <TextField
                label="Altura (cm)"
                value={comprimento}
                onChange={(e) => setComprimento(e.target.value)}
                error={invalido.comprimento}
                helperText={invalido.comprimento ? AVISO_NUMERO : undefined}
                slotProps={{ htmlInput: { inputMode: 'decimal' } }}
              />
              <TextField
                label="Cabeça (cm)"
                value={perimetro}
                onChange={(e) => setPerimetro(e.target.value)}
                error={invalido.perimetro}
                helperText={invalido.perimetro ? AVISO_NUMERO : undefined}
                slotProps={{ htmlInput: { inputMode: 'decimal' } }}
              />
            </Box>
          )}
          {tipo === 'CONSULTA' && (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 1 }}>
              <TextField
                label="Profissional ou local"
                value={profissional}
                onChange={(e) => setProfissional(e.target.value)}
                slotProps={{ htmlInput: { maxLength: 80 } }}
              />
              <TextField
                label="Retorno"
                type="date"
                value={retorno}
                onChange={(e) => setRetorno(e.target.value)}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: data } }}
              />
            </Box>
          )}
          <TextField
            label={
              tipo === 'CONSULTA' ? 'O que o médico disse' : tipo === 'PESAGEM' ? 'Observação' : 'O que aconteceu?'
            }
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            multiline
            minRows={tipo === 'MOMENTO' ? 3 : 2}
            slotProps={{ htmlInput: { maxLength: 3000 } }}
            autoFocus={tipo === 'MOMENTO' && !registro}
          />
          <SeletorFotos
            criancaId={crianca.id}
            fotos={fotos}
            onChange={setFotos}
            novas={novas}
            onEnviando={setEnviandoFotos}
          />
          {erro && <Alert severity="error">{erro}</Alert>}
        </Stack>
      </Modal>
      <ConfirmDialog
        open={confirmarExclusao}
        title="Excluir registro?"
        description="As fotos e as medidas deste registro também serão apagadas."
        confirmLabel="Excluir"
        destructive
        loading={salvando}
        onConfirm={excluir}
        onClose={() => setConfirmarExclusao(false)}
      />
    </>
  );
}
