import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SideNavComponent } from '../side-nav/side-nav.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SideNavComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent {}















// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-layout',
//   imports: [],
//   templateUrl: './layout.component.html',
//   styleUrl: './layout.component.scss'
// })
// export class LayoutComponent {

// }
