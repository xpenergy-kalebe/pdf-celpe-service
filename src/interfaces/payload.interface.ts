export interface Payload {
  sub: string;
  aut: string | null;
  aud: string | null;
  nbf: number | null;
  usuarioAcesso: string | null;
  azp: string | null;
  scope: string | null;
  iss: string | null;
  nome: string | null;
  exp: number | null;
  iat: number | null;
  jti: string | null;
}
