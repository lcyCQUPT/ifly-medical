import { Request, Response } from 'express';
import type { AuthCredentialsInput } from '@ifly-medical/shared';
import { getRequestUser } from '../types/request-user';
import * as authService from '../services/auth.service';

export async function register(req: Request, res: Response) {
  const { username, password } = req.body as AuthCredentialsInput;
  const result = await authService.register(username, password);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const { username, password } = req.body as AuthCredentialsInput;
  const result = await authService.login(username, password);
  res.json(result);
}

export async function me(req: Request, res: Response) {
  const user = await authService.getUserById(getRequestUser(req).userId);
  res.json(user);
}
