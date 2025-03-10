export interface PixResponse {
  dadosFatura: {
    copiaColaPix: string;
    qrCodePix: string;
  };
  e_resultado: string;
  retorno: {
    tipo: string | null;
    id: string | null;
    numero: string | null;
    mensagem: string | null;
  };
}

export interface PixRequest {
  canalSolicitante: string;
  codigo: string;
  distribuidora: string;
  documentoSolicitante: string;
  documento: string;
  numeroFatura: string;
  protocolo: string;
  usuario: string;
  tipoPerfil: number;
  tamanhoQrCode: string;
  geraSsOs: string;
}
