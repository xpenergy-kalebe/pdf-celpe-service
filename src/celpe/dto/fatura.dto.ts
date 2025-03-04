interface Fatura {
    tipoFatura: {
      codigo: string | null;
      descricao: string | null;
    };
    statusFatura: string | null;
    dataCompetencia: string | null;
    dataEmissao: string | null;
    dataPagamento: string | null;
    dataVencimento: string | null;
    grupoTensao: string | null;
    mesReferencia: string | null;
    numeroFatura: string | null;
    origemFatura: string | null;
    situacaoComercial: string | null;
    tipoArrecadacao: string | null;
    tipoEntrega: string | null;
    tipoLeitura: string | null;
    uc: string | null;
    valorEmissao: string | null;
    dataInicioPeriodo: string | null;
    dataFimPeriodo: string | null;
    emitidoFatAgrupadora: string | null;
    nroFatAgrupadora: string | null;
    vencFatAgrupada: string | null;
    valorFatAgrupada: string | null;
    tipoDoc: string | null;
    codigoCm: string | null;
    numeroBoletoUnico: string | null;
    agrupadorContaMinima: string | null;
    valorTotalCMAgrupada: string | null;
    aceitaPix: string | null;
  }
  
 interface EntregaFaturas {
    codigoTipoEntrega: string | null;
    descricaoTipoEntrega: string | null;
    enderecoEntrega: string | null;
    codigoTipoArrecadacao: string | null;
    descricaoTipoArrecadacao: string | null;
    dataCertaValida: string | null;
    dataVencimento: string | null;
    dataCorte: string | null;
  }
export interface invoicesResponse {
      e_resultado: string
}
  export interface Dados {
    entregaFaturas: EntregaFaturas;
    retorno: Retorno;
    faturas: Fatura[];
  }
  
  