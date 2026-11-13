export type Papel = 'ADMIN' | 'USUARIO';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: Papel;
}

export interface Sessao {
  token: string;
  expiraEm: string;
  usuario: Usuario;
}
