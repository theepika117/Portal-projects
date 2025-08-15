import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(private router: Router) {}

  logout(): void {
    // Clear any stored authentication data
    localStorage.removeItem('token');
    sessionStorage.clear();
    
    // Redirect to login page
    this.router.navigate(['/login']);
  }
}
