export interface FileResponse {
  fileName: string | null;
  fileSize: string | null;
  fileData: string | null;
  fileExtension: string | null;
  retorno: ReturnData;
}

export interface ReturnData {
  tipo: string | null;
  id: string | null;
  numero: string | null;
  mensagem: string | null;
  e_resultado: string | null;
}
