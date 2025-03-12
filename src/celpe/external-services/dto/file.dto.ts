export interface FileResponse {
  fileName: string;
  fileSize: string;
  fileData: string;
  fileExtension: string;
  retorno: ReturnData;
}

export interface ReturnData {
  tipo: string | null;
  id: string | null;
  numero: string | null;
  mensagem: string | null;
  e_resultado: string | null;
}
