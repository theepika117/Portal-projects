// src/app/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private backendUrl = 'http://localhost:3000/api'; // Your Node.js backend URL
  private sapLoginApiUrl = `${this.backendUrl}/login`; // Endpoint for login

  //constructor(private http: HttpClient) { }
  constructor(
  private http: HttpClient,
  @Inject(PLATFORM_ID) private platformId: Object
) {}


  /**
   * Authenticates a user with the backend.
   * @param customerId The customer ID.
   * @param password The password.
   * @returns An Observable that emits the backend response ({ message: string, status: string }).
   */

//   getCurrentCustomerId(): string | null {
//   if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
//     return localStorage.getItem('customerId');
//   }
//   console.warn('AuthService: localStorage not available (likely non-browser context)');
//   return null;
// }

getCurrentCustomerId(): string | null {
  if (isPlatformBrowser(this.platformId)) {
    return localStorage.getItem('customerId');
  } else {
    console.warn('AuthService: localStorage not available (likely non-browser context)');
    return null;
  }
}



//   getCurrentCustomerId(): string | null {
//   if (typeof window !== 'undefined' && window.localStorage ) {
//     return localStorage.getItem('customerId');
//   }
//   console.warn('AuthService: localStorage not available (likely SSR mode)');
//   return null;
// }

login(customerId: string, password: string): Observable<{ message: string, status: string }> {
  console.log(`AuthService: Attempting login for customer ID: ${customerId}`);
  const payload = { customerId, password };

  return this.http.post<any>(this.sapLoginApiUrl, payload).pipe(
    tap(response => {
      console.log('AuthService: Login response from backend:', response);
      if (response && response.status === 'S') {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('customerId', customerId);
        } else {
          console.warn('AuthService: Cannot store customerId - localStorage not available');
        }
      }
    }),
    map(response => {
      if (response && (response.status === 'S' || response.status === 'E')) {
        return { message: response.message, status: response.status };
      } else {
        throw new Error('Unexpected response from login server.');
      }
    }),
    catchError(error => {
      console.error('AuthService: Error during login API call:', error);
      const errorMessage = error.error?.error || error.message || 'Network or backend error during login.';
      return throwError(() => new Error(errorMessage));
    })
  );
}
logout(): void {
    if (isPlatformBrowser(this.platformId)) { // Use isPlatformBrowser for consistency
      localStorage.removeItem('customerId');
      console.log('AuthService: Customer ID cleared from localStorage (logged out).');
      // Verify immediately after removal
      console.log('AuthService: customerId after removal:', localStorage.getItem('customerId'));
    } else {
      console.warn('AuthService: Cannot remove customerId - localStorage not available');
    }
  }

  isLoggedIn(): boolean {
    // This method is used by *ngIf in the header, so it needs to be reliable
    return this.getCurrentCustomerId() !== null;
  }

// logout(): void {
//   if (typeof window !== 'undefined' && window.localStorage) {
//     localStorage.removeItem('customerId');
//     console.log('AuthService: Customer ID cleared from localStorage (logged out).');
//   } else {
//     console.warn('AuthService: Cannot remove customerId - localStorage not available');
//   }

}

  // login(customerId: string, password: string): Observable<{ message: string, status: string }> {
  //   console.log(`AuthService: Attempting login for customer ID: ${customerId}`);
  //   const payload = { customerId, password };

  //   return this.http.post<any>(this.sapLoginApiUrl, payload).pipe(
  //     tap(response => {
  //       console.log('AuthService: Login response from backend:', response);
  //       // ****************************************************
  //       // Store customerId in localStorage upon successful login here
  //       // This ensures the customerId is available after a successful login
  //       // and can be retrieved by other components.
  //       // ****************************************************
  //       if (response && response.status === 'S') {
  //           localStorage.setItem('customerId', customerId);
  //       }
  //     }),
  //     map(response => {
  //       // Assuming your backend returns { status: 'S'/'E', message: '...' }
  //       if (response && (response.status === 'S' || response.status === 'E')) {
  //         return { message: response.message, status: response.status };
  //       } else {
  //         // Handle unexpected response structure from backend
  //         console.error('AuthService: Unexpected login response structure:', response);
  //         throw new Error('Unexpected response from login server.');
  //       }
  //     }),
  //     catchError(error => {
  //       console.error('AuthService: Error during login API call:', error);
  //       // Extract a more user-friendly error message
  //       const errorMessage = error.error?.error || error.message || 'Network or backend error during login.';
  //       return throwError(() => new Error(errorMessage));
  //     })
  //   );
  // }

  // /**
  //  * Retrieves the current customer ID from localStorage.
  //  * @returns The customer ID string or null if not found.
  //  */
  // getCurrentCustomerId(): string | null {
  //   return localStorage.getItem('customerId');
  // }

  // /**
  //  * Clears the customer ID from localStorage and performs logout actions.
  //  */
  // logout(): void {
  //   localStorage.removeItem('customerId');
  //   // You might want to navigate to the login page here or handle it in the component
  //   // For now, just clearing the ID.
  //   console.log('AuthService: Customer ID cleared from localStorage (logged out).');
  // }















// src/app/auth.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable, of } from 'rxjs';
// import { map, tap, catchError } from 'rxjs/operators'; // Import 'map'

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private loginUrl = 'http://localhost:3000/api/login';

//   private currentCustomerId: string | null = null;

//   constructor(private http: HttpClient) { }

//   login(customerId: string, password: string): Observable<boolean> {
//     const body = { customerId, password };

//     return this.http.post<any>(this.loginUrl, body).pipe(
//       // Use 'map' to transform the response from the backend into a boolean
//       map(response => {
//         console.log('Login API response (transformed by map):', response);
//         if (response.status === 'S') { // Check the SAP status 'S' for success
//           this.currentCustomerId = customerId;
//           return true; // Login successful
//         } else {
//           this.currentCustomerId = null;
//           // You could also store response.message here if you want to display SAP's specific error message
//           return false; // Login failed based on SAP status
//         }
//       }),
//       catchError(error => {
//         console.error('Login API error (from backend or network):', error);
//         this.currentCustomerId = null;
//         // Return false for any HTTP-level errors (e.g., 500 from Node.js, network issues)
//         return of(false);
//       })
//     );
//   }

//   logout(): void {
//     this.currentCustomerId = null;
//     // Clear any session/token if stored
//   }

//   isLoggedIn(): boolean {
//     return !!this.currentCustomerId;
//   }

//   getCurrentCustomerId(): string | null {
//     return this.currentCustomerId;
//   }
// }










// // src/app/auth.service.ts
// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Observable, of } from 'rxjs';
// import { tap, catchError } from 'rxjs/operators';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   // Update this URL to match your Node.js backend port
//   private loginUrl = 'http://localhost:3000/api/login'; // Reverted to 3000

//   private currentCustomerId: string | null = null;

//   constructor(private http: HttpClient) { }

//   login(customerId: string, password: string): Observable<boolean> {
//     const body = { customerId, password };
//     // No special headers needed for JSON to your Node.js backend
//     // Node.js backend will handle SOAP conversion and SAP authentication

//     return this.http.post<any>(this.loginUrl, body).pipe(
//       tap(response => {
//         console.log('Login API response:', response);
//         if (response.status === 'S') { // Assuming 'S' for success from your Node.js backend
//           this.currentCustomerId = customerId;
//           return true;
//         } else {
//           this.currentCustomerId = null;
//           return false;
//         }
//       }),
//       catchError(error => {
//         console.error('Login API error:', error);
//         this.currentCustomerId = null;
//         return of(false); // Return false on error
//       })
//     );
//   }

//   logout(): void {
//     this.currentCustomerId = null;
//     // Clear any session/token if stored
//   }

//   isLoggedIn(): boolean {
//     return !!this.currentCustomerId;
//   }

//   getCurrentCustomerId(): string | null {
//     return this.currentCustomerId;
//   }
// }

















// // src/app/auth.service.ts
// import { Injectable } from '@angular/core';
// import { BehaviorSubject, Observable } from 'rxjs';
// import { HttpClient } from '@angular/common/http';
// import { tap, catchError } from 'rxjs/operators';
// import { of } from 'rxjs';

// @Injectable({
//   providedIn: 'root'
// })
// export class AuthService {
//   private _customerId = new BehaviorSubject<string | null>(null);
//   public customerId$: Observable<string | null> = this._customerId.asObservable();

//   private apiUrl = 'http://localhost:3000/api/login'; // your Node backend

//   constructor(private http: HttpClient) {}

//   login(customerId: string, password: string): Observable<boolean> {
//     return this.http.post<any>(this.apiUrl, { customerId, password }).pipe(
//       tap(response => {
//         if (response.status === 'S') {
//           this._customerId.next(customerId);
//           console.log(`AuthService: Customer ${customerId} logged in.`);
//         } else {
//           console.warn('AuthService: Login failed:', response.message);
//         }
//       }),
//       // Convert result to boolean
//       tap({
//         error: () => console.error('AuthService: Login request failed.')
//       }),
//       // Convert response into a boolean success/failure
//       catchError(() => of(false)),
//       // Emit true only if login was successful
//       tap(() => of(true))
//     );
//   }

//   logout(): void {
//     this._customerId.next(null);
//     console.log('AuthService: User logged out.');
//   }

//   getCurrentCustomerId(): string | null {
//     return this._customerId.value;
//   }
// }












// // // src/app/auth.service.ts
// // import { Injectable } from '@angular/core';
// // import { BehaviorSubject, Observable } from 'rxjs';


// // @Injectable({
// //   providedIn: 'root'
// // })
// // export class AuthService {
// //   // Use BehaviorSubject to hold the current customerId and emit changes
// //   // Initialize with null, meaning no user is logged in initially
// //   private _customerId = new BehaviorSubject<string | null>(null);
// //   public customerId$: Observable<string | null> = this._customerId.asObservable();

// //   // A simple placeholder for login. In a real app, this would involve HTTP calls.
// //   // For now, we just set the customer ID.
// //   login(customerId: string, password: string): boolean {
// //     // In a real scenario, validate credentials against SAP here.
// //     // For this example, any non-empty customerId and password will be considered valid.
// //     if (customerId && password) {
// //       this._customerId.next(customerId); // Store the customer ID upon successful login
// //       console.log(`AuthService: Customer ${customerId} logged in.`);
// //       return true;
// //     }
// //     return false;
// //   }

// //   logout(): void {
// //     this._customerId.next(null); // Clear the customer ID on logout
// //     console.log('AuthService: User logged out.');
// //   }

// //   // Helper to get the current customer ID synchronously (useful for immediate access)
// //   getCurrentCustomerId(): string | null {
// //     return this._customerId.value;
// //   }
// // }










// // // import { Injectable } from '@angular/core';

// // // @Injectable({
// // //   providedIn: 'root'
// // // })
// // // export class AuthService {

// // //   constructor() { }
// // // }
