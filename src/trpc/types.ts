import { Context as HonoContext } from 'hono';
import { Response } from 'hono/utils/response';

export interface CreateHonoContextOptions {
  req: Request;
  res: Response;
}

export interface TRPCContext {
  req: Request;
  res: Response;
  prisma: any; // Replace with actual Prisma client type
  user: any; // Replace with actual user type
}
