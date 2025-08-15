import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, LoginComponent],
  template: `
    <div *ngIf="showSplash()" class="splash-screen">
      <img src="assets/logovista.png" alt="VendorVista Logo" class="logo-transition"/>
    </div>
    <div *ngIf="!showSplash() && showLogin()" class="login-page">
      <app-login></app-login>
    </div>
    <div *ngIf="!showSplash() && !showLogin()">
      <router-outlet></router-outlet>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'vendor-portal';
  showSplash = signal(true);
  showLogin = signal(true);

  constructor(private router: Router) {
    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Hide login component when navigating away from login
      this.showLogin.set(event.url === '/login' || event.url === '/');
    });
  }

  ngOnInit() {
    setTimeout(() => {
      this.showSplash.set(false);
      // Navigate to login after splash screen
      this.router.navigate(['/login']);
    }, 3000); // 3-second splash screen
  }
}













// import { Component, OnInit, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { LoginComponent } from './login/login.component';
// import { RouterOutlet } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [RouterOutlet, CommonModule, LoginComponent],
//   template: `
//     <div *ngIf="showSplash()" class="splash-screen">
//       <img src="C:\Users\Theepika\Desktop\Theeps\Vendor portal\vendor-portal\src\assets\logovista.png" alt="VendorVista Logo" class="logo-transition"/>
//     </div>
//     <div *ngIf="!showSplash()" class="login-page">
//       <app-login></app-login>
//     </div>
//   `,
//   styleUrls: ['./app.component.scss']
// })
// export class AppComponent implements OnInit {
//   title = 'vendor-portal';
//   showSplash = signal(true);

//   ngOnInit() {
//     setTimeout(() => {
//       this.showSplash.set(false);
//     }, 3000); // 3-second splash screen
//   }
// }









// // import { Component } from '@angular/core';
// // import { RouterOutlet } from '@angular/router';

// // @Component({
// //   selector: 'app-root',
// //   imports: [RouterOutlet],
// //   templateUrl: './app.component.html',
// //   styleUrl: './app.component.scss'
// // })
// // export class AppComponent {
// //   title = 'vendor-portal';
// // }
