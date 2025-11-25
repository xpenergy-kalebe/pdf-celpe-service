import { Storage } from '@google-cloud/storage';

// Cria o client diretamente sem chamar keyFilename.
// Dessa forma, o SDK vai buscar as credenciais no próprio ambiente (IAM da Cloud Function).
const storage = new Storage();
const bucket = storage.bucket('xperesidencial.appspot.com');

export async function getFileFromGCSAsBuffer(fileName) {
  console.log(`[GCS] Iniciando download de "procuracao/${fileName}" do bucket`);
  try {
    const file = bucket.file(`procuracao/${fileName}`);

    const [exists] = await file.exists();
    if (!exists) {
      console.log(`[GCS] O arquivo ${fileName} não existe no bucket.`);
      return null;
    }

    const [buffer] = await file.download();
    console.log('[GCS] Download concluído com sucesso');
    return buffer;
  } catch (error) {
    throw new Error(`[GCS] Erro ao obter o arquivo: ${error.message}`);
  }
}

export async function storePrint(buffer) {
  const destination = 'screenshots/final_state.png';
  const file = bucket.file(destination);

  try {
    await file.save(buffer);
    console.log('[GCS] Print armazenado com sucesso em ' + destination);
  } catch (error) {
    throw new Error(`[GCS] Erro ao armazenar o print: ${error.message}`);
  }
}
