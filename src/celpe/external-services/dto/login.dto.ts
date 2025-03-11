export interface LoginRequest {
  username: string;
  password: string;
  canalSolicitante?: string;
  recaptcha?: string;
}
export interface LoginResponse {
  token: {
    ne: string;
    se: string;
  };
  retorno: {
    tipo: string;
    id: string;
    numero: string;
    mensagem: string;
  };
}
