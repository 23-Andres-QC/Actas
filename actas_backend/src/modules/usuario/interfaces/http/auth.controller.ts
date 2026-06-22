import { Request, Response } from 'express';
import { z } from 'zod';
import { AutenticarUsuarioUseCase } from '../../application/use-cases/autenticar-usuario.use-case';

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
});

export class AuthController {
  constructor(private readonly autenticarUsuario: AutenticarUsuarioUseCase) {}

  public login = async (req: Request, res: Response): Promise<void> => {
    const body = loginSchema.parse(req.body);
    res.json(await this.autenticarUsuario.execute(body.email, body.password));
  };
}
