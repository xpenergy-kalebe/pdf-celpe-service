

interface Local {
    endereco: string | null;
    bairro: string | null;
    municipio: string | null;
    cep: string | null;
    uf: string | null;
}

interface UnidadeConsumidora {
    status: string | null;
    uc: string | null;
    nomeCliente: string | null;
    instalacao: string | null;
    local: Local | null;
    contrato: string | null;
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
    ucs: UnidadeConsumidora[] | null;
    retorno: Retorno | null;
}
