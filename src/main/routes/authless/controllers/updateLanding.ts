import config from 'config';
import { Request, Response } from 'express';

export const UpdateLandingController = (req: Request, res: Response): void => {
  res.redirect(config.get('services.fisDssUpdate.url'));
};
