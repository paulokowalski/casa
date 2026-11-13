import { useState } from 'react';
import { Avatar, Box, IconButton, Tooltip, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { PageHeader } from '../../components/ui/PageHeader';
import { SectionCard } from '../../components/ui/SectionCard';
import { DataTable, type DataColumn } from '../../components/ui/DataTable';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { FloatingAction } from '../../components/ui/FloatingAction';
import { usePessoa, type Pessoa } from '../../contexts/PessoaContext';
import { useToast } from '../../contexts/ToastContext';
import { useUsuario } from '../../contexts/AuthContext';
import { StatusPill } from '../../components/ui/StatusPill';
import { palette } from '../../styles/tokens';
import { CadastroModal } from './CadastroModal';

const iniciais = (nome: string) =>
  nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

function PessoaAvatar({ nome }: Readonly<{ nome: string }>) {
  return (
    <Avatar
      sx={{
        width: 36,
        height: 36,
        fontSize: '0.8125rem',
        fontWeight: 600,
        bgcolor: palette.brand[100],
        color: palette.brand[700],
      }}
    >
      {iniciais(nome)}
    </Avatar>
  );
}

function AcessoPill({ pessoa }: Readonly<{ pessoa: Pessoa }>) {
  if (!pessoa.ativo)
    return (
      <StatusPill tone="error" size="sm">
        Bloqueado
      </StatusPill>
    );
  if (!pessoa.temAcesso) return <StatusPill size="sm">Sem senha</StatusPill>;
  if (pessoa.papel === 'ADMIN')
    return (
      <StatusPill tone="violet" size="sm">
        Administrador
      </StatusPill>
    );
  return (
    <StatusPill tone="success" size="sm">
      Usuário
    </StatusPill>
  );
}

export function PessoaView() {
  const { pessoas, loading, excluirPessoa } = usePessoa();
  const { notify } = useToast();
  const { id: usuarioId } = useUsuario();
  const [modalAberto, setModalAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Pessoa | null>(null);
  const [paraExcluir, setParaExcluir] = useState<Pessoa | null>(null);
  const [excluindo, setExcluindo] = useState(false);
  const [erroExclusao, setErroExclusao] = useState<string | null>(null);

  const abrirCadastro = (pessoa: Pessoa | null) => {
    setEmEdicao(pessoa);
    setModalAberto(true);
  };

  async function confirmarExclusao() {
    if (!paraExcluir) return;
    setExcluindo(true);
    setErroExclusao(null);
    try {
      await excluirPessoa(paraExcluir.id);
      notify('Pessoa excluída.');
      setParaExcluir(null);
    } catch (error) {
      setErroExclusao(error instanceof Error ? error.message : 'Erro ao excluir.');
    } finally {
      setExcluindo(false);
    }
  }

  const acoes = (p: Pessoa) => (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Tooltip title="Editar">
        <IconButton aria-label={`Editar ${p.nome}`} onClick={() => abrirCadastro(p)}>
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Tooltip title={p.id === usuarioId ? 'Você não pode excluir a si mesmo' : 'Excluir'}>
        <span>
          <IconButton
            aria-label={`Excluir ${p.nome}`}
            onClick={() => setParaExcluir(p)}
            disabled={p.id === usuarioId}
            sx={{ color: 'error.main' }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );

  const columns: DataColumn<Pessoa>[] = [
    {
      id: 'nome',
      header: 'Nome',
      render: (p) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <PessoaAvatar nome={p.nome} />
          <Typography sx={{ fontWeight: 500 }}>{p.nome}</Typography>
        </Box>
      ),
    },
    {
      id: 'email',
      header: 'E-mail',
      render: (p) => <Typography sx={{ color: 'text.secondary' }}>{p.email}</Typography>,
    },
    { id: 'acesso', header: 'Acesso', render: (p) => <AcessoPill pessoa={p} /> },
    { id: 'acoes', header: '', align: 'right', width: 112, render: acoes },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <PageHeader section="Cadastros" title="Pessoas" subtitle="Quem tem compras no sistema e quem pode entrar" />

      <SectionCard
        title="Pessoas cadastradas"
        subtitle={`${pessoas.length} ${pessoas.length === 1 ? 'pessoa' : 'pessoas'}`}
        padding="flush"
      >
        <DataTable
          columns={columns}
          rows={pessoas}
          getRowKey={(p) => p.id}
          loading={loading}
          minWidth={560}
          emptyMessage="Nenhuma pessoa cadastrada."
          renderMobileRow={(p) => (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PessoaAvatar nome={p.nome} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>{p.nome}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                  {p.email}
                </Typography>
                <AcessoPill pessoa={p} />
              </Box>
              {acoes(p)}
            </Box>
          )}
        />
      </SectionCard>

      <CadastroModal open={modalAberto} pessoa={emEdicao} onClose={() => setModalAberto(false)} onSuccess={notify} />

      <ConfirmDialog
        open={Boolean(paraExcluir)}
        title="Excluir pessoa"
        description={
          <>
            Excluir <b>{paraExcluir?.nome}</b>? Esta ação não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir"
        destructive
        loading={excluindo}
        error={erroExclusao}
        onConfirm={confirmarExclusao}
        onClose={() => {
          setParaExcluir(null);
          setErroExclusao(null);
        }}
      />

      <FloatingAction label="Nova pessoa" icon={<AddIcon />} onClick={() => abrirCadastro(null)} />
    </Box>
  );
}
