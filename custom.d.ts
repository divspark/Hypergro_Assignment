// types/express/index.d.ts or custom.d.ts
import { Request } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}
