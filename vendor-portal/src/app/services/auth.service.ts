import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  // Get the logged-in vendor ID
  getLoggedInVendorId(): string | null {
    return localStorage.getItem('loggedInVendorId');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return localStorage.getItem('loginStatus') === 'authenticated';
  }

  // Clear authentication data (for logout)
  logout(): void {
    localStorage.removeItem('loggedInVendorId');
    localStorage.removeItem('loginStatus');
  }

  // Set authentication data
  setAuthData(vendorId: string): void {
    localStorage.setItem('loggedInVendorId', vendorId);
    localStorage.setItem('loginStatus', 'authenticated');
  }
}
