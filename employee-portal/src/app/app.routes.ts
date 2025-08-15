import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile.component';
import { LeaveRequestComponent } from './leave-request/leave-request.component';
import { PayslipComponent } from './pay-slip/pay-slip.component'; 

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'leave', component: LeaveRequestComponent },
  { path: 'payslip', component: PayslipComponent },
];
