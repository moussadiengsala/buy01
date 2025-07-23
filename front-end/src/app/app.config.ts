import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import {Mypreset} from "../mypreset";
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { ConfirmationService, MessageService } from "primeng/api";
import {provideNgxStripe} from "ngx-stripe";

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: JWT_OPTIONS, useValue: {} },
    JwtHelperService,
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(),
    provideHttpClient(),
    ConfirmationService,
    MessageService,
    provideNgxStripe(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Mypreset,
        options: {
          darkModeSelector: false || 'none',

        }
      }
    })
  ]
};
