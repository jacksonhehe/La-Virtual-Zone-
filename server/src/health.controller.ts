import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class HealthController {
  @Get('healthz')
  getHealth() {
    return 'ok';
  }

  @Get('favicon.ico')
  getFavicon(@Res() res: Response) {
    // Redirigir a un favicon por defecto o devolver 204 (No Content)
    res.status(204).send();
  }
}
