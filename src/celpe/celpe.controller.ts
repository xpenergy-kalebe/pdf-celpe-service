import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ExecuteLoginUseCase } from './usecases/login.usecase';
import { GetUcsUseCase } from './usecases/getUcs.usecase';
import { GetUcUseCase } from './usecases/getUc.usecase';
import { LoginRequest, LoginResponse } from './external-services/dto/login.dto';
import { UcResponse, ucsResponse } from './external-services/dto/ucs.dto';
import { invoicesResponse } from './external-services/dto/fatura.dto';
import { GetProtocolUseCase } from './usecases/getProtocol.usecase';
import { GetInvoicesUseCase } from './usecases/getInvoices.usecase';
import { DownloadPdfsUseCase } from './usecases/downloadpdfs.usecase';
import { GetUCPix } from './usecases/getUcPix.usecase';
import { Pix } from './dto/pix.dto';
@Controller('celpe')
export class CelpeController {
  constructor(
    private readonly executeLoginUseCase: ExecuteLoginUseCase,
    private readonly getUcsUseCase: GetUcsUseCase,
    private readonly getUcUseCase: GetUcUseCase,
    private readonly getProtocolUseCase: GetProtocolUseCase,
    private readonly getInvoicesUseCase: GetInvoicesUseCase,
    private readonly downloadPdfsUseCase: DownloadPdfsUseCase,
    private readonly getUcPixUseCase: GetUCPix,
  ) {}

  @Post('login')
  async login(@Body() loginData: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await this.executeLoginUseCase.execute(loginData);
      return response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Post('unidades')
  async getUcs(@Body() loginData: LoginRequest): Promise<ucsResponse | null> {
    try {
      const response = await this.getUcsUseCase.execute(loginData);
      return response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Post('unidade/:id')
  async getUc(
    @Param('id') id: string,
    @Body() loginData: LoginRequest,
  ): Promise<UcResponse | null> {
    try {
      const response = await this.getUcUseCase.execute(loginData, id);
      return response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Post('protocolo/:id')
  async getProtocol(
    @Param('id') id: string,
    @Body() loginData: LoginRequest,
  ): Promise<ProtocolResponse | null> {
    try {
      const response = await this.getProtocolUseCase.execute(loginData, id);
      return response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Post('faturas/:id')
  async getInvoices(
    @Param('id') id: string,
    @Body() loginData: LoginRequest,
  ): Promise<invoicesResponse | undefined> {
    try {
      const response = await this.getInvoicesUseCase.execute(loginData, id);
      return response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Post('download/:month')
  async downloadPdfs(
    @Param('month') month: string,
    @Body() loginData: LoginRequest,
  ): Promise<void> {
    try {
      await this.downloadPdfsUseCase.execute(loginData, Number(month));
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Post('pix/uc/:ucId')
  async getPix(
    @Param('ucId') ucId: string,
    @Body() loginData: LoginRequest,
  ): Promise<Pix> {
    try {
      return await this.getUcPixUseCase.execute(loginData, ucId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
