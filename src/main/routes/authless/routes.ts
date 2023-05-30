import { Application } from 'express';

import { LandingController } from './controllers/landing';
import { Path } from './path';

export class PublicRoutes {
  public enableFor(app: Application): void {
    /**
     * @GET
     */
    app.get(Path.LANDING, LandingController);
    app.get(Path.CIC_SUBMIT, LandingController);
  }
}
