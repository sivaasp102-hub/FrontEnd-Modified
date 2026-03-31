import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { errorInterceptor } from './interceptors/error.interceptor';
import { provideHighcharts } from 'highcharts-angular';
import * as Highcharts from 'highcharts';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(), 
      withInterceptors([errorInterceptor])
    ),
    provideHighcharts({
      instance: () => Promise.resolve(Highcharts)
    })
  ]
};
