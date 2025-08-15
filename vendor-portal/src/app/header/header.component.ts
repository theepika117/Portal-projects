import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(private router: Router) {}

  goToHome() {
    this.router.navigate(['/home']);
  }

  logout() {
    this.router.navigate(['/login']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }
}













// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-header',
//   imports: [],
//   templateUrl: './header.component.html',
//   styleUrl: './header.component.scss'
// })
// export class HeaderComponent {

// }
