import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class ApiHelper {
  constructor(private readonly httpService: HttpService) {}

  private async request<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    jwt: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    try {
      const headers = {
        Authorization: `Bearer ${jwt}`,
        ...config?.headers,
      };

      const response: AxiosResponse<T> = await firstValueFrom(
        this.httpService.request({
          method,
          url,
          data,
          headers,
          ...config,
        }),
      );
      return response.data;
    } catch (error) {
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
