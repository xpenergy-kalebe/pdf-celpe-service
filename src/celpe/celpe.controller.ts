import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ExecuteLoginUseCase } from './usecases/login.usecase';
import { GetUcsUseCase } from './usecases/getUcs.usecase';
import { LoginRequest, LoginResponse } from './dto/login.dto';
import { ucsResponse } from './dto/ucs.dto';
@Controller('celpe')
export class CelpeController {
  constructor(
    private readonly executeLoginUseCase: ExecuteLoginUseCase,
    private readonly getUcsUseCase: GetUcsUseCase,
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
}
