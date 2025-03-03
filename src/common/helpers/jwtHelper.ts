import * as jwt from 'jsonwebtoken';
import { Payload } from 'src/interfaces/payload.interface';

export class PayloadHelper {
    static decode(token: string): Payload | null {
        try {
            const decoded = jwt.decode(token);
            if (!decoded || typeof decoded !== 'object') {
                return null;
            }
            return decoded as Payload;
        } catch (error) {
            console.error("Erro ao decodificar o token JWT:", error);
            return null;
        }
    }
}
