import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  MenuItem,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { Modal } from '../../components/ui/Modal';
import { passagensService } from '../../services/passagens';
import type { RotaPassagem, RotaPassagemInput } from '../../types/passagens';

const DIAS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

type Modo = 'datas' | 'janela';

interface LinhaData {
  ida: string;
  volta: string;
}

interface Form {
  nome: string;
  ativa: boolean;
  origem: string;
  destino: string;
  modo: Modo;
  somenteIda: boolean;
  datas: LinhaData[];
  inicio: string;
  fim: string;
  passoDias: string;
  duracaoMin: string;
  duracaoMax: string;
  diasSemana: number[];
  precoAlvo: string;
  maxEscalas: string;
  quedaPct: string;
  adultos: string;
  criancas: string;
  bebesAssento: string;
  bebesColo: string;
}

const VAZIO: Form = {
  nome: '',
  ativa: true,
  origem: '',
  destino: '',
  modo: 'datas',
  somenteIda: false,
  datas: [{ ida: '', volta: '' }],
  inicio: '',
  fim: '',
  passoDias: '1',
  duracaoMin: '5',
  duracaoMax: '7',
  diasSemana: [],
  precoAlvo: '',
  maxEscalas: '1',
  quedaPct: '25',
  adultos: '1',
  criancas: '0',
  bebesAssento: '0',
  bebesColo: '0',
};

function doRota(r: RotaPassagem): Form {
  const j = r.janela;
  return {
    nome: r.nome,
    ativa: r.ativa,
    origem: r.origem.join(', '),
    destino: r.destino.join(', '),
    modo: j ? 'janela' : 'datas',
    somenteIda: r.somenteIda,
    datas: r.datas.length ? r.datas.map((d) => ({ ida: d.ida, volta: d.volta ?? '' })) : [{ ida: '', volta: '' }],
    inicio: j?.inicio ?? '',
    fim: j?.fim ?? '',
    passoDias: String(j?.passoDias ?? 1),
    duracaoMin: String(j?.duracao?.[0] ?? 5),
    duracaoMax: String(j?.duracao?.[1] ?? 7),
    diasSemana: j?.diasSemana ?? [],
    precoAlvo: r.precoAlvo ? String(r.precoAlvo).replace('.', ',') : '',
    maxEscalas: r.maxEscalas === null ? 'qualquer' : String(r.maxEscalas),
    quedaPct: String(r.quedaPct ?? 25),
    adultos: String(r.adultos ?? 1),
    criancas: String(r.criancas ?? 0),
    bebesAssento: String(r.bebesAssento ?? 0),
    bebesColo: String(r.bebesColo ?? 0),
  };
}

const aeroportos = (t: string) =>
  t
    .split(/[\s,;/]+/)
    .map((a) => a.trim().toUpperCase())
    .filter(Boolean);

/** Inteiro sem sinal; vazio = null; qualquer outra coisa = NaN (o formulário mostra o erro). */
export const inteiro = (t: string): number | null => {
  const v = t.trim();
  if (v === '') return null;
  return /^\d+$/.test(v) ? Number(v) : Number.NaN;
};

/**
 * Valor em reais no formato brasileiro ("1.500,50", "1500,5", "1500"); vazio = null; inválido = NaN.
 * Com vírgula, os pontos são de milhar; sem vírgula, o ponto só é de milhar no formato "1.500" / "12.345.678".
 */
export const reais = (t: string): number | null => {
  const v = t
    .trim()
    .replace(/^R\$\s*/i, '')
    .trim();
  if (v === '') return null;
  let normal = '';
  if (v.includes(',')) {
    if (/^(\d{1,3}(\.\d{3})+|\d+),\d{1,2}$/.test(v)) normal = v.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(v)) {
    normal = v.replace(/\./g, '');
  } else if (/^\d+(\.\d{1,2})?$/.test(v)) {
    normal = v;
  }
  return normal === '' ? Number.NaN : Number(normal);
};

type Erros = Partial<Record<keyof Form, string>>;

/** Erros dos campos numéricos; objeto vazio = tudo certo. */
export function errosDoForm(f: Form): Erros {
  const e: Erros = {};
  const preco = reais(f.precoAlvo);
  if (preco !== null && !(preco > 0)) e.precoAlvo = 'Valor inválido. Ex.: 1.500';
  // a API e o robô trabalham com reais inteiros: centavos seriam cortados sem aviso
  else if (preco !== null && !Number.isInteger(preco)) e.precoAlvo = 'Sem centavos: o alerta compara reais inteiros';
  const queda = inteiro(f.quedaPct);
  if (queda !== null && (Number.isNaN(queda) || queda < 1 || queda > 90)) e.quedaPct = 'Número inteiro de 1 a 90';
  if (f.modo === 'janela') {
    const passo = inteiro(f.passoDias);
    if (passo !== null && (Number.isNaN(passo) || passo < 1)) e.passoDias = 'Número inteiro, 1 ou mais';
    if (!f.somenteIda) {
      const min = inteiro(f.duracaoMin);
      const max = inteiro(f.duracaoMax);
      if (min !== null && (Number.isNaN(min) || min < 1)) e.duracaoMin = 'Número inteiro, 1 ou mais';
      if (max !== null && (Number.isNaN(max) || max < 1)) e.duracaoMax = 'Número inteiro, 1 ou mais';
      else if (min !== null && max !== null && !e.duracaoMin && max < min) e.duracaoMax = 'Menor que o mínimo';
    }
  }
  return e;
}

function paraInput(f: Form): RotaPassagemInput {
  return {
    nome: f.nome.trim(),
    ativa: f.ativa,
    origem: aeroportos(f.origem),
    destino: aeroportos(f.destino),
    datas:
      f.modo === 'datas'
        ? f.datas.filter((d) => d.ida).map((d) => ({ ida: d.ida, volta: f.somenteIda || !d.volta ? null : d.volta }))
        : null,
    janela:
      f.modo === 'janela'
        ? {
            inicio: f.inicio,
            fim: f.fim,
            passoDias: inteiro(f.passoDias) ?? 1,
            duracao: f.somenteIda ? undefined : [inteiro(f.duracaoMin) ?? 1, inteiro(f.duracaoMax) ?? 1],
            diasSemana: f.diasSemana.length ? f.diasSemana : undefined,
          }
        : null,
    precoAlvo: reais(f.precoAlvo),
    maxEscalas: f.maxEscalas === 'qualquer' ? null : Number(f.maxEscalas),
    quedaPct: inteiro(f.quedaPct) ?? 25,
    adultos: inteiro(f.adultos) ?? 1,
    criancas: inteiro(f.criancas) ?? 0,
    bebesAssento: inteiro(f.bebesAssento) ?? 0,
    bebesColo: inteiro(f.bebesColo) ?? 0,
  };
}

interface FormRotaProps {
  open: boolean;
  /** Rota a editar; sem ela, cria uma nova. */
  rota: RotaPassagem | null;
  onClose: () => void;
  onSalvo: () => void;
}

export function FormRota({ open, rota, onClose, onSalvo }: Readonly<FormRotaProps>) {
  const [f, setF] = useState<Form>(VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setF(rota ? doRota(rota) : VAZIO);
      setErro(null);
    }
  }, [open, rota]);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((atual) => ({ ...atual, [k]: v }));
  const setData = (i: number, campo: keyof LinhaData, v: string) =>
    setF((atual) => ({ ...atual, datas: atual.datas.map((d, j) => (j === i ? { ...d, [campo]: v } : d)) }));

  const erros = errosDoForm(f);
  const invalido = Object.keys(erros).length > 0;

  const salvar = () => {
    if (invalido) return;
    setSalvando(true);
    setErro(null);
    const dados = paraInput(f);
    const pedido = rota ? passagensService.atualizarRota(rota.id, dados) : passagensService.criarRota(dados);
    pedido
      .then(() => {
        onSalvo();
        onClose();
      })
      .catch((e: Error) => setErro(e.message))
      .finally(() => setSalvando(false));
  };

  const grade = { display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } } as const;

  return (
    <Modal
      open={open}
      onClose={salvando ? () => undefined : onClose}
      title={rota ? 'Editar rota' : 'Nova rota'}
      maxWidth="md"
      actions={
        <>
          <Button variant="outlined" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={salvar}
            disabled={salvando || invalido}
            startIcon={salvando ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {rota ? 'Salvar' : 'Criar rota'}
          </Button>
        </>
      }
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <TextField
          label="Nome"
          value={f.nome}
          onChange={(e) => set('nome', e.target.value)}
          placeholder="Ex.: Fortaleza - São Paulo (set/2027)"
          required
          fullWidth
          autoFocus={!rota}
        />
        <Box sx={grade}>
          <TextField
            label="Origem"
            value={f.origem}
            onChange={(e) => set('origem', e.target.value)}
            placeholder="FOR"
            helperText="Código de 3 letras; vários separados por vírgula"
            required
          />
          <TextField
            label="Destino"
            value={f.destino}
            onChange={(e) => set('destino', e.target.value)}
            placeholder="GRU, CGH"
            helperText="Ex.: GRU, CGH, VCP para São Paulo"
            required
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={f.modo}
            onChange={(_, v: Modo | null) => v && set('modo', v)}
            aria-label="Tipo de datas"
          >
            <ToggleButton value="datas">Datas fixas</ToggleButton>
            <ToggleButton value="janela">Período flexível</ToggleButton>
          </ToggleButtonGroup>
          <FormControlLabel
            control={<Checkbox checked={f.somenteIda} onChange={(e) => set('somenteIda', e.target.checked)} />}
            label="Só ida"
          />
        </Box>

        {f.modo === 'datas' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {f.datas.map((d, i) => (
              <Box key={i} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <TextField
                  label="Ida"
                  type="date"
                  value={d.ida}
                  onChange={(e) => setData(i, 'ida', e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ flex: 1 }}
                />
                {!f.somenteIda && (
                  <TextField
                    label="Volta"
                    type="date"
                    value={d.volta}
                    onChange={(e) => setData(i, 'volta', e.target.value)}
                    slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: d.ida || undefined } }}
                    sx={{ flex: 1 }}
                  />
                )}
                <Tooltip title="Tirar estas datas">
                  <span>
                    <IconButton
                      aria-label="Tirar estas datas"
                      disabled={f.datas.length === 1}
                      onClick={() =>
                        set(
                          'datas',
                          f.datas.filter((_, j) => j !== i),
                        )
                      }
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            ))}
            <Box>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => set('datas', [...f.datas, { ida: '', volta: '' }])}
                disabled={f.datas.length >= 20}
              >
                Outras datas
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={grade}>
              <TextField
                label="Ida a partir de"
                type="date"
                value={f.inicio}
                onChange={(e) => set('inicio', e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Ida até"
                type="date"
                value={f.fim}
                onChange={(e) => set('fim', e.target.value)}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: f.inicio || undefined } }}
              />
            </Box>
            <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' } }}>
              <TextField
                label="Testar ida a cada"
                value={f.passoDias}
                onChange={(e) => set('passoDias', e.target.value)}
                slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                error={!!erros.passoDias}
                helperText={erros.passoDias ?? 'dias (1 = todo dia)'}
              />
              {!f.somenteIda && (
                <>
                  <TextField
                    label="Viagem de (dias)"
                    value={f.duracaoMin}
                    onChange={(e) => set('duracaoMin', e.target.value)}
                    error={!!erros.duracaoMin}
                    helperText={erros.duracaoMin}
                    slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                  />
                  <TextField
                    label="até (dias)"
                    value={f.duracaoMax}
                    onChange={(e) => set('duracaoMax', e.target.value)}
                    error={!!erros.duracaoMax}
                    helperText={erros.duracaoMax}
                    slotProps={{ htmlInput: { inputMode: 'numeric' } }}
                  />
                </>
              )}
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Só nestes dias da semana (nenhum = todos)
              </Typography>
              <ToggleButtonGroup
                size="small"
                value={f.diasSemana}
                onChange={(_, v: number[]) => set('diasSemana', [...v].sort())}
                aria-label="Dias da semana"
                sx={{ display: 'flex', flexWrap: 'wrap', mt: 0.5 }}
              >
                {DIAS.map((d, i) => (
                  <ToggleButton key={d} value={i}>
                    {d}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              O robô faz até 30 buscas por rota a cada rodada e sorteia as combinações quando há mais que isso.
            </Typography>
          </Box>
        )}

        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' } }}>
          <TextField
            label="Preço-alvo (R$)"
            value={f.precoAlvo}
            onChange={(e) => set('precoAlvo', e.target.value)}
            slotProps={{ htmlInput: { inputMode: 'decimal' } }}
            error={!!erros.precoAlvo}
            helperText={erros.precoAlvo ?? `total, ${f.somenteIda ? 'só ida' : 'ida e volta'}`}
          />
          <TextField select label="Escalas" value={f.maxEscalas} onChange={(e) => set('maxEscalas', e.target.value)}>
            <MenuItem value="0">Só direto</MenuItem>
            <MenuItem value="1">Até 1</MenuItem>
            <MenuItem value="2">Até 2</MenuItem>
            <MenuItem value="qualquer">Qualquer</MenuItem>
          </TextField>
          <TextField
            label="Queda p/ alerta (%)"
            value={f.quedaPct}
            onChange={(e) => set('quedaPct', e.target.value)}
            slotProps={{ htmlInput: { inputMode: 'numeric' } }}
            error={!!erros.quedaPct}
            helperText={erros.quedaPct ?? 'abaixo da média'}
          />
        </Box>

        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Passageiros (até 9; o preço buscado é o total de todos)
          </Typography>
          <Box sx={{ display: 'grid', gap: 2, mt: 1, gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' } }}>
            {(
              [
                ['adultos', 'Adultos', '12 anos ou mais', 1],
                ['criancas', 'Crianças', '2 a 11 anos', 0],
                ['bebesColo', 'Bebês no colo', 'até 2 anos', 0],
                ['bebesAssento', 'Bebês c/ assento', 'até 2 anos', 0],
              ] as const
            ).map(([campo, rotulo, ajuda, minimo]) => (
              <TextField
                key={campo}
                select
                label={rotulo}
                value={f[campo]}
                onChange={(e) => set(campo, e.target.value)}
                helperText={ajuda}
              >
                {Array.from({ length: 10 - minimo }, (_, i) => String(i + minimo)).map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </TextField>
            ))}
          </Box>
        </Box>

        <FormControlLabel
          control={<Switch checked={f.ativa} onChange={(e) => set('ativa', e.target.checked)} />}
          label={f.ativa ? 'Monitorando' : 'Pausada (o robô não busca)'}
        />

        {erro && <Alert severity="error">{erro}</Alert>}
      </Box>
    </Modal>
  );
}
