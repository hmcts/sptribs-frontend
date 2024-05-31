import { Application } from 'express';

import { LandingController } from './controllers/landing';
import { UpdateLandingController } from './controllers/updateLanding';
import { Path } from './path';

export class PublicRoutes {
  public enableFor(app: Application): void {
    /**
     * @GET
     */
    app.get(Path.LANDING, LandingController);
    app.get(Path.CIC_UPDATE, UpdateLandingController);
  }
}
