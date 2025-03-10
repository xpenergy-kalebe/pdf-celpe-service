interface Retorno {
  e_resultado: string | null;
}

interface ProtocolResponse {
  protocoloSalesforce: number | null;
  protocoloSalesforceStr: string | null;
  protocoloLegado: number | null;
  protocoloLegadoStr: string | null;
  retorno: Retorno;
}
