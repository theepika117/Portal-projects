import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // Import RouterOutlet for routing

@Component({
  selector: 'app-root',
  standalone: true, // Crucial for standalone
  imports: [RouterOutlet], // RouterOutlet is needed for routing to work
  template: `
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'sap-customer-portal';
}




// import { Component } from '@angular/core';
// import { RouterOutlet } from '@angular/router';

// @Component({
//   selector: 'app-root',
//   imports: [RouterOutlet],
//   templateUrl: './app.component.html',
//   styleUrl: './app.component.scss'
// })
// export class AppComponent {
//   title = 'sap-customer-portal-standalone';
// }
