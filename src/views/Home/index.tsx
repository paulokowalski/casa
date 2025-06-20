import { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Chip, Alert, Skeleton, Avatar, Stack, Tooltip } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EuroIcon from '@mui/icons-material/Euro';

const CEARA_API = 'https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=4351&s=2025';
const FIPE_URL = 'https://parallelum.com.br/fipe/api/v2/cars/brands/23/models/9048/years/2021-1';
const USD_API = 'https://economia.awesomeapi.com.br/last/USD-BRL';
const EUR_API = 'https://economia.awesomeapi.com.br/last/EUR-BRL';

function CearaTableCard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(CEARA_API)
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao buscar dados da tabela');
        const d = await res.json();
        const ceara = d.table.find((t: any) => t.strTeam === 'Ceará');
        setData(ceara);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card sx={{ minWidth: 300, maxWidth: 360, width: '100%', height: 260, borderRadius: 4, boxShadow: 4, p: 3, background: 'linear-gradient(120deg, #e3f2fd 0%, #fff 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="circular" width={48} height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton variant="text" width="40%" height={20} />
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!data) return null;

  return (
    <Card
      sx={{
        minWidth: 300,
        maxWidth: 360,
        width: '100%',
        height: 260,
        borderRadius: 4,
        boxShadow: 4,
        background: 'linear-gradient(120deg, #e3f2fd 0%, #fff 100%)',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={1} gap={1}>
          <Avatar src={data.strBadge} alt="Ceará" sx={{ width: 48, height: 48, bgcolor: '#222' }} />
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Ceará
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Brasileirão 2025
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Posição
        </Typography>
        <Typography variant="h3" fontWeight={700} color="primary" mb={0.5}>
          {data.intRank}º
        </Typography>
        <Chip label={`Pontos: ${data.intPoints}`} color="success" sx={{ fontSize: 15, height: 28, mb: 1 }} />
        <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
          <Tooltip title="Jogos"><Chip label={`J: ${data.intPlayed}`} size="small" /></Tooltip>
          <Tooltip title="Vitórias"><Chip label={`V: ${data.intWin}`} size="small" color="success" /></Tooltip>
          <Tooltip title="Empates"><Chip label={`E: ${data.intDraw}`} size="small" color="warning" /></Tooltip>
          <Tooltip title="Derrotas"><Chip label={`D: ${data.intLoss}`} size="small" color="error" /></Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
}

function CarFipeCard({ url }: { url: string }) {
  const [data, setData] = useState<any>(null);
  const [previous, setPrevious] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao buscar dados da FIPE');
        const d = await res.json();
        setData(d);
        // Buscar valor do mês anterior corretamente
        fetch('https://parallelum.com.br/fipe/api/v2/cars/brands/23/models/9048/years')
          .then(async (res) => {
            if (!res.ok) throw new Error('Erro ao buscar anos FIPE');
            const anos = await res.json();
            if (anos && anos.length > 1) {
              // Encontrar o índice do ano/mês atual
              const idxAtual = anos.findIndex((a: any) => a.code === url.split('/').pop());
              if (idxAtual > 0) {
                const anterior = anos[idxAtual - 1];
                fetch(`https://parallelum.com.br/fipe/api/v2/cars/brands/23/models/9048/years/${anterior.code}`)
                  .then(async (res) => {
                    if (!res.ok) throw new Error('Erro ao buscar valor anterior FIPE');
                    const prev = await res.json();
                    setPrevious(prev);
                  })
                  .catch(() => setPrevious(null));
              }
            }
          })
          .catch(() => setPrevious(null));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [url]);

  if (loading) {
    return (
      <Card sx={{ minWidth: 300, maxWidth: 360, width: '100%', height: 260, borderRadius: 4, boxShadow: 4, p: 3, background: 'linear-gradient(120deg, #f8fafc 0%, #e3f2fd 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="circular" width={48} height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" height={28} />
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="rounded" width="100%" height={32} sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!data) return null;

  return (
    <Card
      sx={{
        minWidth: 300,
        maxWidth: 360,
        width: '100%',
        height: 260,
        borderRadius: 4,
        boxShadow: 4,
        background: 'linear-gradient(120deg, #f8fafc 0%, #e3f2fd 100%)',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={1} gap={1}>
          <Avatar sx={{ width: 48, height: 48, bgcolor: '#1976d2' }}>
            <DirectionsCarIcon sx={{ fontSize: 28, color: '#fff' }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {data.brand} {data.model}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Ano {data.modelYear} • {data.fuel}
            </Typography>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Valor FIPE ({data.referenceMonth})
        </Typography>
        <Typography variant="h4" fontWeight={700} color="primary" mb={1}>
          {data.price}
        </Typography>
        <Chip label={`FIPE: ${data.codeFipe}`} color="info" sx={{ fontSize: 13, height: 24, mb: 1 }} />
        <Box display="flex" justifyContent="flex-end">
          <a
            href={`https://www.webmotors.com.br/carros-usados/${encodeURIComponent(data.brand.split(' - ')[1] || data.brand)}/${encodeURIComponent(data.model.split(' ')[0])}?ano=${data.modelYear}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <Chip label="Mercado" color="primary" clickable sx={{ fontWeight: 600, fontSize: 13, height: 24 }} />
          </a>
        </Box>
      </CardContent>
    </Card>
  );
}

function CurrencyCard({ url, icon, label, color }: { url: string; icon: React.ReactNode; label: string; color: string }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(url)
      .then(async (res) => {
        if (!res.ok) throw new Error('Erro ao buscar cotação');
        const d = await res.json();
        setData(Object.values(d)[0]);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [url]);

  if (loading) {
    return (
      <Card sx={{ minWidth: 220, maxWidth: 240, width: '100%', height: 150, borderRadius: 4, boxShadow: 4, p: 3, background: color, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="circular" width={36} height={36} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="60%" height={24} />
        </CardContent>
      </Card>
    );
  }
  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }
  if (!data) return null;

  return (
    <Card
      sx={{
        minWidth: 220,
        maxWidth: 240,
        width: '100%',
        height: 150,
        borderRadius: 4,
        boxShadow: 4,
        background: color,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: '#fff' }}>{icon}</Avatar>
          <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            {label}
          </Typography>
        </Box>
        <Typography variant="h5" fontWeight={700} color="primary" mb={0.5}>
          R$ {Number(data.bid).toLocaleString('pt-BR', { minimumFractionDigits: 4 })}
        </Typography>
        <Chip label={`${data.pctChange}%`} color="info" size="small" sx={{ fontSize: 12, height: 20 }} />
      </CardContent>
    </Card>
  );
}

export function Home() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '60vh', justifyContent: 'flex-start', mt: 6 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="center" alignItems="stretch" width="100%" maxWidth={1200}>
        <CearaTableCard />
        <CarFipeCard url={FIPE_URL} />
        <CurrencyCard url={USD_API} icon={<AttachMoneyIcon sx={{ color: '#388e3c' }} />} label="Dólar" color="linear-gradient(120deg, #e0f7fa 0%, #b2ebf2 100%)" />
        <CurrencyCard url={EUR_API} icon={<EuroIcon sx={{ color: '#1976d2' }} />} label="Euro" color="linear-gradient(120deg, #e3e0fa 0%, #c5cae9 100%)" />
      </Stack>
    </Box>
  );
}