import { TokenPayload } from '../../../domain/interfaces/services/token.service.interface';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      tenantId?: string;
    }
  }
}
