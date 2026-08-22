import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'workspaces/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/workspace.component').then((m) => m.WorkspaceComponent),
  },
  {
    path: 'boards/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/board/board.component').then((m) => m.BoardComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
