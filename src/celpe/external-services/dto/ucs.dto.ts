interface Local {
  endereco: string;
  bairro: string | null;
  municipio: string | null;
  cep: string | null;
  uf: string | null;
}

interface UnidadeConsumidora {
  status: string | null;
  uc: string;
  nomeCliente: string | null;
  instalacao: string | null;
  local: Local | null;
  contrato: string;
  dt_inicio: string | null;
  dt_fim: string | null;
}

interface Retorno {
  id: string | null;
  tipo: string | null;
  numero: string | null;
  mensagem: string | null;
}

export interface ucsResponse {
  ucs: UnidadeConsumidora[];
  retorno: Retorno | null;
}

interface Endereco {
  endereco: string | null;
  bairro: string | null;
  codLocalidade: string | null;
  localidade: string | null;
  codMunicipio: string | null;
  municipio: string | null;
  cep: string | null;
  localizacao: {
    sigla: string | null;
    codigo: string | null;
    descricao: string | null;
  };
  uf: string | null;
  tipoLogradouro: string | null;
  nomeLogradouro: string | null;
  numero: string | null;
  complementoEndereco: string | null;
}

interface Documento {
  tipo: {
    codigo: string | null;
    descricao: string | null;
  };
  numero: string | null;
}

interface SegundoDocumento {
  uf: string | null;
  orgaoExpedidor: {
    codigo: string | null;
    descricao: string | null;
  };
  tipo: {
    codigo: string | null;
    descricao: string | null;
  };
  numero: string | null;
}

interface Contato {
  email: string | null;
  celular: {
    ddd: string | null;
    numero: string | null;
  };
  telefone: {
    ddd: string | null;
    numero: string | null;
  };
}

interface Cliente {
  codigo: string | null;
  nome: string | null;
  dataAtualizacao: string | null;
  documento: Documento;
  segundoDocumento: SegundoDocumento;
  contato: Contato;
  dataNascimento: string | null;
}

interface Situacao {
  codigo: string | null;
  descricao: string | null;
  dataSituacaoUC: string | null;
  cargaInstalada: string | null;
}

interface Servicos {
  baixaRenda: string | null;
  faturaEmail: string | null;
  dataCerta: string | null;
  debitoAutomatico: string | null;
  faturaBraile: string | null;
  entregaAlternativa: string | null;
  debitosVencidos: string | null;
  contaMinima: string | null;
  parcelamentoAbertoUc: string | null;
}

interface Caracteristicas {
  grandeCliente: string | null;
  irrigacao: string | null;
  fotovoltaico: string | null;
  vip7: string | null;
  espelho: string | null;
  microMiniGeracaoD: string | null;
}

export interface UcResponse {
  codigo: string;
  instalacao: string | null;
  medidor: string | null;
  fase: string | null;
  local: Endereco;
  enderecoEntrega: Endereco;
  situacao: Situacao;
  dataLigacao: string | null;
  cliente: Cliente;
  servicos: Servicos;
  caracteristicas: Caracteristicas;
  mini_micro: string | null;
  utd: string | null;
  carga: string | null;
  e_resultado: string | null;
}
