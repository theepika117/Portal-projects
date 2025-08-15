// src/app/app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations'; // Required for Angular Material animations
import { provideHttpClient, withFetch } from '@angular/common/http'; // If you plan to make HTTP requests (e.g., to SAP Webservice)
//import { provideDialogConfig } from '@angular/material/dialog';

import { routes } from './app.routes'; // Import your defined routes

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), // Provides the Angular Router with your defined routes
    provideAnimations(),   // Enables Angular Material animations (e.g., ripple effects, form field animations)
    provideHttpClient(withFetch()),    // Provides HttpClient for making API calls (e.g., to SAP RFC Webservice)
    //provideDialogConfig() // Add this to provide MatDialog service
  ]
};








// import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';

// import { routes } from './app.routes';
// import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// export const appConfig: ApplicationConfig = {
//   providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(withEventReplay())]
// };
