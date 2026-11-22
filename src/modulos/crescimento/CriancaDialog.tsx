import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { crescimentoApi } from './api';
import { SeletorFotos } from './componentes';
import { descartarNovas } from './fotos';
import { AVISO_NUMERO, hojeISO, numero, numeroInvalido, numeroParaTexto } from './formato';
import type { Crianca, Foto, Sexo } from './tipos';

/** Cadastro ou edição da criança (com a foto de perfil). */
export function CriancaDialog({
  familiaId,
  aberto,
  crianca,
  onFechar,
  onSalvo,
}: Readonly<{
  familiaId: string;
  aberto: boolean;
  crianca?: Crianca | null;
  onFechar: () => void;
  onSalvo: (c: Crianca | null) => void;
}>) {
  const [nome, setNome] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [sexo, setSexo] = useState<Sexo>('F');
  const [semanas, setSemanas] = useState('');
  const [peso, setPeso] = useState('');
  const [comprimento, setComprimento] = useState('');
  const [perimetro, setPerimetro] = useState('');
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [confirmacao, setConfirmacao] = useState('');
  const [enviandoFotos, setEnviandoFotos] = useState(false);
  const novas = useRef(new Set<string>());
  /** salvando ou enviando a foto: não deixa salvar nem fechar no meio */
  const travado = salvando || enviandoFotos;
  const invalido = {
    semanas: numeroInvalido(semanas),
    peso: numeroInvalido(peso),
    comprimento: numeroInvalido(comprimento),
    perimetro: numeroInvalido(perimetro),
  };
  const algumInvalido = Object.values(invalido).some(Boolean);
  const nomeConfere = Boolean(crianca) && confirmacao.trim().toLowerCase() === crianca?.nome.trim().toLowerCase();

  useEffect(() => {
    if (!aberto) return;
    setNome(crianca?.nome ?? '');
    setNascimento(crianca?.nascimento ?? '');
    setSexo(crianca?.sexo ?? 'F');
    setSemanas(numeroParaTexto(crianca?.idadeGestacionalSemanas));
    setPeso(numeroParaTexto(crianca?.pesoNascerKg));
    setComprimento(numeroParaTexto(crianca?.comprimentoNascerCm));
    setPerimetro(numeroParaTexto(crianca?.perimetroNascerCm));
    setFotos(crianca?.foto ? [crianca.foto] : []);
    setErro(null);
    novas.current.clear();
  }, [aberto, crianca]);

  async function fechar() {
    await descartarNovas(novas.current);
    onFechar();
  }

  async function salvar() {
    setSalvando(true);
    setErro(null);
    try {
      const dados = {
        nome,
        nascimento,
        sexo,
        idadeGestacionalSemanas: numero(semanas),
        pesoNascerKg: numero(peso),
        comprimentoNascerCm: numero(comprimento),
        perimetroNascerCm: numero(perimetro),
        fotoId: crianca ? (fotos[fotos.length - 1]?.id ?? null) : null,
      };
      // a foto de perfil se escolhe depois de criar: a foto pertence à criança
      const c = crianca
        ? await crescimentoApi.atualizarCrianca(crianca.id, dados)
        : await crescimentoApi.criarCrianca(familiaId, dados);
      await descartarNovas(novas.current, c.foto ? [c.foto.id] : []);
      onSalvo(c);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir() {
    if (!crianca) return;
    setSalvando(true);
    try {
      await crescimentoApi.excluirCrianca(crianca.id);
      setConfirmar(false);
      setConfirmacao('');
      onSalvo(null);
    } catch (e) {
      setErro((e as Error).message);
      setConfirmar(false);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <Modal
        open={aberto}
        onClose={travado ? () => undefined : fechar}
        title={crianca ? `Dados de ${crianca.nome}` : 'Nova criança'}
        actions={
          <>
            {crianca && (
              <Button color="error" onClick={() => setConfirmar(true)} disabled={travado} sx={{ mr: 'auto' }}>
                Excluir
              </Button>
            )}
            <Button variant="outlined" onClick={fechar} disabled={travado}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              onClick={salvar}
              disabled={travado || algumInvalido || !nome.trim() || !nascimento}
              startIcon={salvando ? <CircularProgress size={16} color="inherit" /> : undefined}
            >
              Salvar
            </Button>
          </>
        }
      >
        <Stack spacing={2}>
          {crianca && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Foto de perfil
              </Typography>
              <Box sx={{ maxWidth: 200 }}>
                <SeletorFotos
                  criancaId={crianca.id}
                  fotos={fotos}
                  onChange={(f) => setFotos(f.slice(-1))}
                  novas={novas}
                  onEnviando={setEnviandoFotos}
                />
              </Box>
            </Box>
          )}
          <TextField label="Nome" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus={!crianca} />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, alignItems: 'center' }}>
            <TextField
              label="Nascimento"
              type="date"
              value={nascimento}
              onChange={(e) => setNascimento(e.target.value)}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: hojeISO() } }}
            />
            <RadioGroup row value={sexo} onChange={(e) => setSexo(e.target.value as Sexo)} aria-label="Sexo">
              <FormControlLabel value="F" control={<Radio />} label="Menina" />
              <FormControlLabel value="M" control={<Radio />} label="Menino" />
            </RadioGroup>
          </Box>
          <Typography variant="body2" color="text.secondary">
            O sexo escolhe a curva da OMS. Dados do nascimento (opcionais) entram nas curvas como primeiro ponto.
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
            <TextField
              label="Semanas de gestação"
              value={semanas}
              onChange={(e) => setSemanas(e.target.value)}
              error={invalido.semanas}
              helperText={invalido.semanas ? AVISO_NUMERO : 'Abaixo de 37: idade corrigida'}
              slotProps={{ htmlInput: { inputMode: 'decimal' } }}
            />
            <TextField
              label="Peso ao nascer (kg)"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              error={invalido.peso}
              helperText={invalido.peso ? AVISO_NUMERO : undefined}
              slotProps={{ htmlInput: { inputMode: 'decimal' } }}
            />
            <TextField
              label="Comprimento (cm)"
              value={comprimento}
              onChange={(e) => setComprimento(e.target.value)}
              error={invalido.comprimento}
              helperText={invalido.comprimento ? AVISO_NUMERO : undefined}
              slotProps={{ htmlInput: { inputMode: 'decimal' } }}
            />
            <TextField
              label="Perímetro cefálico (cm)"
              value={perimetro}
              onChange={(e) => setPerimetro(e.target.value)}
              error={invalido.perimetro}
              helperText={invalido.perimetro ? AVISO_NUMERO : undefined}
              slotProps={{ htmlInput: { inputMode: 'decimal' } }}
            />
          </Box>
          {erro && <Alert severity="error">{erro}</Alert>}
        </Stack>
      </Modal>
      <ConfirmDialog
        open={confirmar}
        title={`Excluir ${crianca?.nome ?? ''}?`}
        description="Apaga para sempre todas as medidas, fotos, registros, marcos e vacinas. Para confirmar, escreva o nome."
        confirmLabel="Excluir tudo"
        destructive
        loading={salvando}
        confirmDisabled={!nomeConfere}
        onConfirm={() => nomeConfere && excluir()}
        onClose={() => {
          setConfirmar(false);
          setConfirmacao('');
        }}
      >
        <TextField
          fullWidth
          size="small"
          sx={{ mt: 2 }}
          placeholder={crianca?.nome}
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          error={confirmacao.trim() !== '' && !nomeConfere}
          helperText={confirmacao.trim() !== '' && !nomeConfere ? 'O nome não confere' : undefined}
        />
      </ConfirmDialog>
    </>
  );
}
