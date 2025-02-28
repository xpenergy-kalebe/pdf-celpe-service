export interface LoginRequest {
    usuario: string,
    senha: string,
    canalSolicitante?: string,
    recaptcha?: string
}
export interface LoginResponse {
    token: {
        ne: string,
        se: string
    },
    retorno: {
        tipo: string,
        id: string,
        numero: string,
        mensagem: string
    }
}
