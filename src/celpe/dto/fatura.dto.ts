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
    mesReferencia: string;
    numeroFatura: string;
    origemFatura: string | null;
    situacaoComercial: string | null;
    tipoArrecadacao: string | null;
    tipoEntrega: string | null;
    tipoLeitura: string | null;
    uc: string;
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
export interface retorno {
      e_resultado: string
}
  export interface invoicesResponse {
    entregaFaturas: EntregaFaturas;
    retorno: retorno;
    faturas: Fatura[];
  }
  
  