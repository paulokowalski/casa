/** Contratos da API /v1/crescimento (casa-api). Campos opcionais vêm como null. */

export type Papel = 'RESPONSAVEL' | 'LEITOR';
export type Sexo = 'M' | 'F';
export type Indicador = 'PESO' | 'COMPRIMENTO' | 'PERIMETRO';
export type Faixa = 'ABAIXO' | 'LIMITE_INFERIOR' | 'ESPERADA' | 'LIMITE_SUPERIOR' | 'ACIMA';
export type TipoRegistro = 'PESAGEM' | 'MOMENTO' | 'CONSULTA';

export interface Membro {
  usuarioId: number;
  nome: string | null;
  papel: Papel;
  desde: string;
}

export interface Familia {
  id: string;
  nome: string;
  meuPapel: Papel;
  membros: Membro[];
}

export interface FotoUrls {
  mini: string;
  media: string;
  original: string;
  expiramEm: string;
}

export interface Foto {
  id: string;
  criancaId: string;
  largura: number;
  altura: number;
  tiradaEm: string | null;
  enviadaEm: string;
  enviadaPor: number | null;
  registroId: string | null;
  jaExistia: boolean;
  urls: FotoUrls;
}

export interface CriancaInput {
  nome: string;
  nascimento: string;
  sexo: Sexo;
  idadeGestacionalSemanas?: number | null;
  pesoNascerKg?: number | null;
  comprimentoNascerCm?: number | null;
  perimetroNascerCm?: number | null;
  fotoId?: string | null;
}

export interface Crianca {
  id: string;
  familiaId: string;
  nome: string;
  nascimento: string;
  sexo: Sexo;
  idadeGestacionalSemanas: number | null;
  pesoNascerKg: number | null;
  comprimentoNascerCm: number | null;
  perimetroNascerCm: number | null;
  prematuro: boolean;
  idadeDias: number;
  idadeCorrigidaDias: number | null;
  idade: string;
  foto: Foto | null;
  podeEditar: boolean;
}

export interface MedidaAvaliada {
  valor: number;
  z: number | null;
  percentil: number | null;
  faixa: Faixa | null;
}

export interface Medicao {
  id: string;
  data: string;
  idadeDias: number;
  idade: string;
  peso: MedidaAvaliada | null;
  comprimento: MedidaAvaliada | null;
  perimetro: MedidaAvaliada | null;
  imc: number | null;
  observacao: string | null;
  criadoPor: number | null;
}

export interface UltimaMedida {
  data: string;
  valor: number;
  z: number | null;
  percentil: number | null;
  faixa: Faixa | null;
}

export interface GanhoPeso {
  gramas: number;
  dias: number;
  gramasPorDia: number;
  esperadoMinimo: number | null;
  esperadoMaximo: number | null;
  situacao: string | null;
}

export interface Alerta {
  codigo: string;
  nivel: 'ATENCAO' | 'INFO';
  indicador: Indicador | null;
  titulo: string;
  texto: string;
}

export interface Resumo {
  criancaId: string;
  hoje: string;
  idadeDias: number;
  idadeCorrigidaDias: number | null;
  idade: string;
  ultimas: Partial<Record<Indicador, UltimaMedida>>;
  ganhoPeso: GanhoPeso | null;
  diasDesdeUltimaPesagem: number | null;
  proximaConsulta: string | null;
  alertas: Alerta[];
}

export interface PontoReferencia {
  dias: number;
  p3: number;
  p15: number;
  p50: number;
  p85: number;
  p97: number;
}

export interface PontoCrianca {
  data: string;
  dias: number;
  valor: number;
  z: number | null;
  percentil: number | null;
  nascimento: boolean;
}

export interface Curva {
  indicador: Indicador;
  nome: string;
  unidade: string;
  idadeCorrigida: boolean;
  referencia: PontoReferencia[];
  pontos: PontoCrianca[];
}

export interface AlbumRef {
  chave: string;
  titulo: string;
  rotulo: string;
}

export interface Registro {
  id: string;
  criancaId: string;
  data: string;
  idadeDias: number;
  idade: string;
  mesDeVida: number;
  tipo: TipoRegistro;
  texto: string | null;
  profissional: string | null;
  proximaConsulta: string | null;
  album: AlbumRef | null;
  medicao: Medicao | null;
  fotos: Foto[];
  criadoPor: number | null;
  criadoPorNome: string | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface RegistroInput {
  data: string;
  tipo: TipoRegistro;
  texto?: string | null;
  profissional?: string | null;
  proximaConsulta?: string | null;
  albumChave?: string | null;
  albumTitulo?: string | null;
  pesoKg?: number | null;
  comprimentoCm?: number | null;
  perimetroCm?: number | null;
  fotoIds?: string[] | null;
}

export interface ItemLinhaDoTempo {
  origem: 'REGISTRO' | 'MEDICAO';
  tipo: TipoRegistro;
  data: string;
  idadeDias: number;
  idade: string;
  mesDeVida: number;
  registro: Registro | null;
  medicao: Medicao | null;
  ganhoPesoGramas: number | null;
  ganhoPesoDias: number | null;
}

export interface LinhaDoTempo {
  itens: ItemLinhaDoTempo[];
  pagina: number;
  tamanho: number;
  total: number;
  temMais: boolean;
}

export type TipoLugar = 'MESVERSARIO' | 'PRIMEIRA_VEZ' | 'ESPECIAL';
export type SituacaoLugar = 'FEITO' | 'PENDENTE' | 'HOJE' | 'FUTURO';

export interface Lugar {
  chave: string;
  tipo: TipoLugar;
  titulo: string;
  numero: string | null;
  unidade: string | null;
  dataPrevista: string | null;
  situacao: SituacaoLugar;
  dias: number | null;
  registroId: string | null;
  data: string | null;
  texto: string | null;
  capa: Foto | null;
  quantidadeFotos: number;
  pesoKg: number | null;
}

export interface Chamada {
  chave: string;
  titulo: string;
  numero: string | null;
  unidade: string | null;
  data: string;
  dias: number;
}

export interface Album {
  criancaId: string;
  totalFotos: number;
  mesversariosComFoto: number;
  mesversariosPassados: number;
  primeirasVezesFeitas: number;
  chamada: Chamada | null;
  mesversarios: Lugar[];
  primeirasVezes: Lugar[];
  especiais: Lugar[];
}

export interface AlbumInput {
  data?: string | null;
  texto?: string | null;
  albumTitulo?: string | null;
  pesoKg?: number | null;
  fotoIds: string[];
}

export type Area = 'MOTOR' | 'SOCIAL' | 'LINGUAGEM' | 'COGNITIVO';

export interface Marco {
  id: string;
  area: Area;
  texto: string;
  situacao: 'ATINGIDO' | 'ESPERADO' | 'ATENCAO' | 'FUTURO';
  atingidoEm: string | null;
  idadeAoAtingir: string | null;
  nota: string | null;
}

export interface FaixaMarcos {
  id: string;
  nome: string;
  inicioMeses: number;
  fimMeses: number;
  situacao: 'PASSADA' | 'ATUAL' | 'PROXIMA' | 'FUTURA';
  brincadeiras: string[];
  atingidos: number;
  total: number;
  marcos: Marco[];
}

export interface Marcos {
  versaoCatalogo: string;
  fonte: string;
  idadeDias: number;
  idadeCorrigida: boolean;
  faixaAtualId: string;
  marcosAtencao: number;
  aviso: string;
  faixas: FaixaMarcos[];
}

export type SituacaoVacina = 'APLICADA' | 'TOMAR_AGORA' | 'ATRASADA' | 'PROXIMA' | 'FUTURA' | 'PRAZO_ENCERRADO';

export interface Dose {
  id: string;
  vacina: string;
  dose: string;
  idadeMeses: number;
  dataPrevista: string;
  dataLimite: string | null;
  situacao: SituacaoVacina;
  aplicadaEm: string | null;
  lote: string | null;
  local: string | null;
}

export interface GrupoVacinas {
  idadeMeses: number;
  rotulo: string;
  data: string;
  aplicadas: number;
  total: number;
  doses: Dose[];
}

export interface VacinaExtra {
  id: string;
  nome: string;
  aplicadaEm: string;
  lote: string | null;
  local: string | null;
}

export interface Vacinas {
  versaoCalendario: string;
  aviso: string;
  aplicadas: number;
  total: number;
  pendentes: number;
  proximaData: string | null;
  grupos: GrupoVacinas[];
  extras: VacinaExtra[];
}

export interface VacinaInput {
  aplicadaEm?: string | null;
  lote?: string | null;
  local?: string | null;
}

export interface Compromisso {
  tipo: 'VACINA' | 'CONSULTA' | 'MESVERSARIO';
  data: string;
  dias: number;
  atrasado: boolean;
  titulo: string;
  detalhe: string | null;
  referencias: string[];
}

export type TipoExame = 'PDF' | 'JPEG';

export interface Exame {
  id: string;
  criancaId: string;
  titulo: string;
  data: string;
  observacao: string | null;
  nomeArquivo: string;
  tipo: TipoExame;
  bytes: number;
  criadoEm: string;
  jaExistia: boolean;
}

export interface ExameInput {
  titulo: string;
  data: string;
  observacao?: string | null;
}
