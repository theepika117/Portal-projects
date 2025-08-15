import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent {
  currentRoute = '';

  navigationItems = [
    {
      label: 'Request for Quotation',
      route: '/request-for-quotation',
      icon: '📋'
    },
    {
      label: 'Purchase Order',
      route: '/purchase-order',
      icon: '🛒'
    },
    {
      label: 'Goods Receipt',
      route: '/goods-receipt',
      icon: '📦'
    },
    {
      label: 'Invoice Details',
      route: '/invoice-details',
      icon: '🧾'
    },
    {
      label: 'Payments and Aging',
      route: '/payments-and-ageing',
      icon: '💰'
    },
    {
      label: 'Credit/Debit Memo',
      route: '/credit-debit-memo',
      icon: '📄'
    }
  ];

  constructor(private router: Router) {
    // Track current route for active state
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
    });
    
    // Set initial route
    this.currentRoute = this.router.url;
  }

  navigateTo(route: string) {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }
}













// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-side-nav',
//   imports: [],
//   templateUrl: './side-nav.component.html',
//   styleUrl: './side-nav.component.scss'
// })
// export class SideNavComponent {

// }
