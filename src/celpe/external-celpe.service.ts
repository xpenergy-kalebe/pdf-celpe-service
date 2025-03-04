import { Injectable } from '@nestjs/common';
import { ApiHelper } from 'src/common/helpers/apiHelper';
import { LoginRequest, LoginResponse } from './dto/login.dto';
import { UcResponse, ucsResponse } from './dto/ucs.dto';
import { LoginBot } from './bot/loginbot';
import { invoicesResponse } from './dto/fatura.dto';
export const api = 'https://apineprd.neoenergia.com';

@Injectable()
export class ExternalApiService {
  constructor(
    private readonly apiHelper: ApiHelper,
    private readonly loginBot: LoginBot,
  ) {}

  async Login(loginData: LoginRequest): Promise<LoginResponse> {
    return this.loginBot.executeLogin(loginData);
  }
  async getUcs(document: string, jwt: string): Promise<ucsResponse> {
    const url = `${api}/imoveis/1.1.0/clientes/${document}/ucs?documento=${document}&canalSolicitante=AGP&distribuidora=CELPE&usuario=WSO2_CONEXAO&indMaisUcs=X&protocolo=123&opcaoSSOS=S&tipoPerfil=1`;
    return this.apiHelper.get<ucsResponse>(url, jwt);
  }
  async getUc(ucId: string, jwt: string): Promise<UcResponse> {
    const url = `${api}/multilogin/2.0.0/servicos/imoveis/ucs/${ucId}?usuario=WSO2_CONEXAO&canalSolicitante=AGP&distribuidora=CELPE&protocolo=123&tipoPerfil=1&opcaoSSOS=N`;
    return this.apiHelper.get<UcResponse>(url, jwt);
  }
  async getUcProtocol(
    ucId: string,
    jwt: string,
    document: string,
  ): Promise<ProtocolResponse> {
    const url = `${api}/protocolo/1.1.0/obterProtocolo?distribuidora=CELP&canalSolicitante=AGP&documento=${document}&codCliente=${ucId}&recaptchaAnl=true&regiao=NE`;
    return this.apiHelper.get<ProtocolResponse>(url, jwt);
  }
  async getInvoices(
    ucId: string,
    jwt: string,
    document: string,
    protocol: string,
  ): Promise<invoicesResponse> {
    const url = `${api}/multilogin/2.0.0/servicos/faturas/ucs/faturas?codigo=${ucId}&documento=${document}&canalSolicitante=AGP&usuario=WSO2_CONEXAO&protocolo=${protocol}&tipificacao=&byPassActiv=X&documentoSolicitante=${document}&documentoCliente=${document}&distribuidora=CELPE&tipoPerfil=1`;
    return this.apiHelper.get<invoicesResponse>(url, jwt);
  }

  async downloadPDFS(
    ucId: string,
    jwt: string,
    document: string,
    protocol: string,
    InvoiceId: string
  ): Promise<invoicesResponse> {
    const url = `${api}/multilogin/2.0.0/servicos/faturas/${InvoiceId}/pdf?codigo=${ucId}&protocolo=${protocol}&tipificacao=1031607&usuario=WSO2_CONEXAO&canalSolicitante=AGP&motivo=10&distribuidora=CELPE&regiao=NE&tipoPerfil=1&documento=${document}&documentoSolicitante=${document}&byPassActiv=`;
    return this.apiHelper.get<invoicesResponse>(url, jwt);
  }
}
