import { Injectable } from '@nestjs/common';
import { ApiHelper } from 'src/common/helpers/apiHelper';
import { LoginRequest, LoginResponse } from './dto/login.dto';

const api = 'https://apineprd.neoenergia.com';

@Injectable()
export class ExternalApiService {
    constructor(private readonly apiHelper: ApiHelper) {}

    async getExternalData(loginData: LoginRequest): Promise<any> {
        return this.apiHelper.post(`${api}/areanaologada/2.0.0/autentica`, loginData, {});
    }
}
