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
import { LoginRequest, LoginResponse } from './dto/login.dto';
import { UcResponse, ucsResponse } from './dto/ucs.dto';
import { GetProtocolUseCase } from './usecases/getProtocol.usecase';

@Controller('celpe')
export class CelpeController {
  constructor(
    private readonly executeLoginUseCase: ExecuteLoginUseCase,
    private readonly getUcsUseCase: GetUcsUseCase,
    private readonly getUcUseCase: GetUcUseCase,
    private readonly getProtocolUseCase: GetProtocolUseCase,
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
  async getUc(@Param('id') id: string, @Body() loginData: LoginRequest): Promise<UcResponse | null> {
    try {
      const response = await this.getUcUseCase.execute(loginData, id); 
      return response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Post('protocolo/:id')  
  async getProtocol(@Param('id') id: string, @Body() loginData: LoginRequest): Promise<ProtocolResponse | null> {
    try {
      const response = await this.getProtocolUseCase.execute(loginData, id); 
      return response;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
