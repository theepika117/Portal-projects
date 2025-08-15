import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  constructor(private router: Router, private http: HttpClient, private authService: AuthService) {}

  vendorId = '';
  password = '';
  loginError = '';
  isLoading = false;


  onLogin() {
    this.loginError = '';
    this.isLoading = true;
    
    // Validate input fields
    if (!this.vendorId.trim()) {
      this.loginError = 'Please enter your Vendor ID.';
      this.isLoading = false;
      return;
    }
    
    if (!this.password.trim()) {
      this.loginError = 'Please enter your password.';
      this.isLoading = false;
      return;
    }
    
    // Call backend API for login
    const loginData = {
      vendorId: this.vendorId.trim(),
      password: this.password.trim()
    };

    console.log('[Frontend] Sending login request to backend...');
    
    this.http.post<any>('http://localhost:3000/api/login', loginData).subscribe({
      next: (response) => {
        console.log('[Frontend] Login response received:', response);
        
        if (response.status === 'S') {
          // Login successful
          console.log('[Frontend] Login successful!');
          
          // Store vendor ID using AuthService
          this.authService.setAuthData(response.vendorId);
          
          // Navigate to home page
          this.router.navigate(['/home']).then(success => {
            if (success) {
              console.log('[Frontend] Navigation to home successful');
            } else {
              console.error('[Frontend] Navigation to home failed');
              this.loginError = 'Navigation failed. Please try again.';
            }
          }).catch(error => {
            console.error('[Frontend] Navigation error:', error);
            this.loginError = 'Navigation error. Please try again.';
          });
        } else {
          // Login failed
          this.loginError = response.message || 'Login failed. Please try again.';
          console.error('[Frontend] Login failed:', response.message);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[Frontend] Login request failed:', error);
        
        if (error.error && error.error.error) {
          this.loginError = error.error.error;
        } else if (error.message) {
          this.loginError = error.message;
        } else {
          this.loginError = 'Unable to connect to server. Please try again.';
        }
        
        this.isLoading = false;
      }
    });
  }
}
