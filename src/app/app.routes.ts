import { Routes } from '@angular/router';
import { RSVPShellComponent } from './pages/rsvp-shell';
import { AdminDashboardComponent } from './pages/admin-dashboard';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', component: RSVPShellComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];
