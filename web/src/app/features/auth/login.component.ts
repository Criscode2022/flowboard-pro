import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex">
      <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-12 flex-col justify-between text-white">
        <div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-xl">F</div>
            <span class="text-2xl font-bold tracking-tight">FlowBoard</span>
          </div>
          <p class="mt-2 text-indigo-100">Ship projects faster with clarity</p>
        </div>
        <div class="space-y-6">
          <h1 class="text-4xl font-bold leading-tight">Kanban that teams actually love.</h1>
          <p class="text-lg text-indigo-100 max-w-md">Workspaces, boards, cards, priorities — powered by NestJS, Angular & Neon.</p>
        </div>
        <p class="text-sm text-indigo-200">Production-ready · Open source</p>
      </div>
      <div class="flex-1 flex items-center justify-center p-8">
        <div class="w-full max-w-md">
          <h2 class="text-2xl font-bold text-slate-900">Welcome back</h2>
          <p class="mt-1 text-slate-500">Sign in to your account</p>
          @if (error()) {
            <div class="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{{ error() }}</div>
          }
          <form class="mt-8 space-y-5" (ngSubmit)="submit()">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" class="input" [(ngModel)]="email" name="email" required placeholder="you@company.com" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input type="password" class="input" [(ngModel)]="password" name="password" required placeholder="••••••••" />
            </div>
            <button type="submit" class="btn-primary w-full py-2.5" [disabled]="loading()">
              {{ loading() ? 'Signing in…' : 'Sign in' }}
            </button>
          </form>
          <p class="mt-6 text-center text-sm text-slate-500">
            Don't have an account?
            <a routerLink="/register" class="font-medium text-indigo-600 hover:text-indigo-700">Create one</a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  submit() {
    this.loading.set(true);
    this.error.set('');
    this.auth.login(this.email, this.password).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/dashboard']); },
      error: (err) => { this.loading.set(false); this.error.set(err?.error?.message || 'Invalid email or password'); },
    });
  }
}
