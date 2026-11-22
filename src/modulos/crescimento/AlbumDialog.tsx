import { useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import IosShareRoundedIcon from '@mui/icons-material/IosShareRounded';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToast } from '../../contexts/ToastContext';
import { crescimentoApi } from './api';
import { compartilharCartao, gerarCartao } from './cartao';
import { SeletorFotos } from './componentes';
import { descartarNovas } from './fotos';
import { AVISO_NUMERO, dataLonga, hojeISO, kg, numero, numeroInvalido, numeroParaTexto, primeiroNome } from './formato';
import type { Crianca, Foto, Lugar } from './tipos';

/** Um lugar do álbum: escolher fotos, legenda, peso (mêsversário) e gerar o cartão. `lugar` null = novo momento especial. */
export function AlbumDialog({
  crianca,
  aberto,
  lugar,
  onFechar,
  onSalvo,
}: Readonly<{ crianca: Crianca; aberto: boolean; lugar: Lugar | null; onFechar: () => void; onSalvo: () => void }>) {
  const { notify } = useToast();
  const [titulo, setTitulo] = useState('');
  const [data, setData] = useState('');
  const [legenda, setLegenda] = useState('');
  const [peso, setPeso] = useState('');
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const [enviandoFotos, setEnviandoFotos] = useState(false);
  const novas = useRef(new Set<string>());
  /** salvando ou enviando fotos: não deixa salvar nem fechar no meio */
  const travado = salvando || enviandoFotos;
  const especial = !lugar || lugar.tipo === 'ESPECIAL';
  const mesversario = lugar?.tipo === 'MESVERSARIO';
  const pesoInvalido = mesversario && numeroInvalido(peso);

  useEffect(() => {
    if (!aberto) return;
    novas.current.clear();
    setErro(null);
    setTitulo(lugar?.tipo === 'ESPECIAL' ? lugar.titulo : '');
    setLegenda(lugar?.texto ?? '');
    setPeso(numeroParaTexto(lugar?.pesoKg));
    const prevista = lugar?.dataPrevista;
    setData(lugar?.data ?? (prevista && prevista <= hojeISO() ? prevista : hojeISO()));
    setFotos([]);
    setCarregando(false);
    if (!lugar?.registroId) return;
    // o diálogo pode fechar ou trocar de lugar antes da resposta: aí ela não pode preencher o formulário
    let ativo = true;
    setCarregando(true);
    crescimentoApi
      .registro(crianca.id, lugar.registroId)
      .then((r) => {
        if (!ativo) return;
        setFotos(r.fotos);
        setData(r.data);
        setLegenda(r.texto ?? '');
        if (r.medicao?.peso) setPeso(numeroParaTexto(r.medicao.peso.valor));
      })
      .catch((e: Error) => {
        if (ativo) setErro(e.message);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [aberto, lugar, crianca.id]);

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
        texto: legenda,
        albumTitulo: especial ? titulo : null,
        pesoKg: mesversario ? numero(peso) : null,
        fotoIds: fotos.map((f) => f.id),
      };
      if (lugar) await crescimentoApi.salvarNoAlbum(crianca.id, lugar.chave, dados);
      else await crescimentoApi.novoEspecial(crianca.id, dados);
      novas.current.clear();
      notify('Guardado no álbum');
      onSalvo();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function tirar() {
    if (!lugar) return;
    setSalvando(true);
    try {
      await crescimentoApi.tirarDoAlbum(crianca.id, lugar.chave);
      setConfirmar(false);
      onSalvo();
    } catch (e) {
      setErro((e as Error).message);
      setConfirmar(false);
    } finally {
      setSalvando(false);
    }
  }

  async function cartao() {
    const capa = fotos[fotos.length - 1];
    if (!capa) return;
    setGerando(true);
    try {
      const blob = await gerarCartao({
        fotoUrl: capa.urls.media,
        numero: lugar?.numero ?? null,
        unidade: lugar?.unidade ?? null,
        titulo: especial ? titulo || 'Momento especial' : (lugar?.titulo ?? ''),
        nome: crianca.nome,
        data: dataLonga(data),
        detalhe: mesversario && numero(peso) ? kg(numero(peso)) : null,
        sexo: crianca.sexo,
      });
      const r = await compartilharCartao(blob, `${primeiroNome(crianca.nome)}-${lugar?.chave ?? 'momento'}.jpg`);
      if (r === 'baixado') notify('Cartão baixado');
    } catch (e) {
      notify((e as Error).message, 'error');
    } finally {
      setGerando(false);
    }
  }

  const salvo = Boolean(lugar?.registroId);
  return (
    <>
      <Modal
        open={aberto}
        onClose={travado ? () => undefined : fechar}
        title={
          lugar
            ? lugar.tipo === 'MESVERSARIO'
              ? `Mêsversário · ${lugar.titulo}`
              : lugar.titulo
            : 'Novo momento especial'
        }
        actions={
          <>
            {salvo && crianca.podeEditar && (
              <Button color="error" onClick={() => setConfirmar(true)} disabled={travado} sx={{ mr: 'auto' }}>
                Tirar do álbum
              </Button>
            )}
            {salvo && fotos.length > 0 && (
              <Button
                variant="outlined"
                onClick={cartao}
                disabled={gerando}
                startIcon={gerando ? <CircularProgress size={16} /> : <IosShareRoundedIcon />}
              >
                Cartão
              </Button>
            )}
            {crianca.podeEditar && (
              <Button
                variant="contained"
                onClick={salvar}
                disabled={travado || carregando || fotos.length === 0 || pesoInvalido}
                startIcon={salvando ? <CircularProgress size={16} color="inherit" /> : undefined}
              >
                Guardar
              </Button>
            )}
          </>
        }
      >
        {carregando ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2}>
            {mesversario && lugar?.dataPrevista && (
              <Typography variant="body2" color="text.secondary">
                {lugar.chave === 'nascimento' ? 'Nascimento' : 'Mêsversário'} em {dataLonga(lugar.dataPrevista)}.
              </Typography>
            )}
            {especial && (
              <TextField
                label="Nome do momento"
                placeholder="Batizado, primeira praia..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                slotProps={{ htmlInput: { maxLength: 50 } }}
                disabled={!crianca.podeEditar}
                autoFocus={!lugar}
              />
            )}
            <SeletorFotos
              criancaId={crianca.id}
              fotos={fotos}
              onChange={setFotos}
              novas={novas}
              comCapa
              onEnviando={setEnviandoFotos}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: mesversario ? '1fr 1fr' : '1fr', gap: 1 }}>
              <TextField
                label="Data"
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                disabled={!crianca.podeEditar}
                slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: crianca.nascimento, max: hojeISO() } }}
              />
              {mesversario && (
                <TextField
                  label="Peso no dia (kg)"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  disabled={!crianca.podeEditar}
                  error={pesoInvalido}
                  helperText={pesoInvalido ? AVISO_NUMERO : undefined}
                  slotProps={{ htmlInput: { inputMode: 'decimal' } }}
                />
              )}
            </Box>
            <TextField
              label="Legenda"
              value={legenda}
              onChange={(e) => setLegenda(e.target.value)}
              multiline
              minRows={2}
              disabled={!crianca.podeEditar}
              slotProps={{ htmlInput: { maxLength: 3000 } }}
            />
            {erro && <Alert severity="error">{erro}</Alert>}
          </Stack>
        )}
      </Modal>
      <ConfirmDialog
        open={confirmar}
        title="Tirar do álbum?"
        description="O registro e as fotos dele serão apagados (a foto de perfil continua guardada)."
        confirmLabel="Tirar"
        destructive
        loading={salvando}
        onConfirm={tirar}
        onClose={() => setConfirmar(false)}
      />
    </>
  );
}
