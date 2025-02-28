import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { ExecuteLoginUseCase } from './usecases/login.usecase';
import { LoginRequest, LoginResponse } from './dto/login.dto';
@Controller('celpe')
export class CelpeController {
    constructor(private readonly executeLoginUseCase: ExecuteLoginUseCase) {}
    
    @Post('login')
    async login(@Body() loginData: LoginRequest): Promise<LoginResponse> {
        try {
            const response = await this.executeLoginUseCase.execute(loginData);
            return response;
        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
