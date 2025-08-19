import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
// import { HttpsProxyAgent } from 'https-proxy-agent';

@Injectable()
export class ApiHelper {
  // private readonly proxyAgent: HttpsProxyAgent<string>;

  constructor(private readonly httpService: HttpService) {
    const proxyUrl = 'http://vkzfpggc:51380i8274y2@198.23.239.134:6540';
    // this.proxyAgent = new HttpsProxyAgent<string>(proxyUrl);
  }

  private async request<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    jwt: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      // Mescla headers padrão com quaisquer headers extras vindos de config
      const headers = {
        Authorization: `Bearer ${jwt}`,
        ...config?.headers,
      };

      // Prepara o config do axios, incluindo o proxy agent
      const axiosConfig: AxiosRequestConfig = {
        ...config,
        method,
        url,
        data,
        headers,
        // Injeta o agent para HTTP e HTTPS
        // httpAgent: this.proxyAgent,
        // httpsAgent: this.proxyAgent,
        // Desabilita o handler interno de proxy do axios
        proxy: false,
      };

      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.request<T>(axiosConfig),
      );
      return response.data;
    } catch (error: any) {
      console.error(
        'Erro na requisição à API externa:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        error.response?.data?.message || 'Erro ao consultar a API externa',
        error.response?.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  async get<T>(
    url: string,
    jwt: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('get', url, jwt, undefined, config);
  }

  async post<T>(
    url: string,
    jwt: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('post', url, jwt, data, config);
  }

  async put<T>(
    url: string,
    jwt: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('put', url, jwt, data, config);
  }

  async delete<T>(
    url: string,
    jwt: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>('delete', url, jwt, undefined, config);
  }
}
