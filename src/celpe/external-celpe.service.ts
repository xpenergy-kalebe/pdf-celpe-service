import { Injectable } from '@nestjs/common';
import { ApiHelper } from 'src/common/helpers/apiHelper';
import { LoginRequest, LoginResponse } from './dto/login.dto';
import { LoginBot } from './bot/loginbot';

const api = 'https://apineprd.neoenergia.com';

@Injectable()
export class ExternalApiService {
    constructor(private readonly apiHelper: ApiHelper, private readonly loginBot: LoginBot) {}

    async Login(loginData: LoginRequest): Promise<LoginResponse> {
        return this.loginBot.executeLogin(loginData);

    }
}
