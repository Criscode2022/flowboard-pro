import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div class="w-full max-w-md card p-8">
        <div class="flex items-center gap-2 mb-6">
          <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">F</div>
          <span class="text-xl font-bold">FlowBoard</span>
        </div>
        <h2 class="text-2xl font-bold text-slate-900">Create your account</h2>
        <p class="mt-1 text-slate-500">Start organizing in under a minute</p>
        @if (error()) {
          <div class="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">{{ error() }}</div>
        }
        <form class="mt-6 space-y-4" (ngSubmit)="submit()">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Full name</label>
            <input type="text" class="input" [(ngModel)]="name" name="name" required placeholder="Jane Doe" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" class="input" [(ngModel)]="email" name="email" required placeholder="you@company.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" class="input" [(ngModel)]="password" name="password" required minlength="8" placeholder="Min. 8 characters" />
          </div>
          <button type="submit" class="btn-primary w-full py-2.5" [disabled]="loading()">
            {{ loading() ? 'Creating account…' : 'Create account' }}
          </button>
        </form>
        <p class="mt-6 text-center text-sm text-slate-500">
          Already have an account?
          <a routerLink="/login" class="font-medium text-indigo-600 hover:text-indigo-700">Sign in</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  name = '';
  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  submit() {
    this.loading.set(true);
    this.error.set('');
    this.auth.register(this.email, this.password, this.name).subscribe({
      next: () => { this.loading.set(false); this.router.navigate(['/dashboard']); },
      error: (err) => { this.loading.set(false); this.error.set(err?.error?.message || 'Registration failed'); },
    });
  }
}
