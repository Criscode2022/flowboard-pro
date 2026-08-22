import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

interface Workspace {
  id: string;
  name: string;
  description?: string;
  boards: { id: string; title: string; color: string }[];
  _count: { boards: number; members: number };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50">
      <header class="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">F</div>
            <span class="font-bold text-lg">FlowBoard</span>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-slate-600 hidden sm:inline">{{ auth.user()?.name }}</span>
            <button class="btn-ghost text-sm" (click)="auth.logout()">Sign out</button>
          </div>
        </div>
      </header>
      <main class="max-w-7xl mx-auto px-4 py-10">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 class="text-2xl font-bold text-slate-900">Workspaces</h1>
            <p class="text-slate-500 mt-1">Organize projects across teams</p>
          </div>
          <button class="btn-primary" (click)="showCreate.set(true)">+ New workspace</button>
        </div>
        @if (loading()) {
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            @for (i of [1,2,3]; track i) {
              <div class="card p-6 animate-pulse h-40 bg-slate-100"></div>
            }
          </div>
        } @else {
          <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            @for (ws of workspaces(); track ws.id) {
              <div class="card p-6 hover:shadow-md transition">
                <h3 class="font-semibold text-lg text-slate-900">{{ ws.name }}</h3>
                <p class="text-sm text-slate-500 mt-1 line-clamp-2">{{ ws.description || 'No description' }}</p>
                <div class="mt-4 flex items-center gap-4 text-xs text-slate-500">
                  <span>{{ ws._count.boards }} boards</span>
                  <span>{{ ws._count.members }} members</span>
                </div>
                @if (ws.boards?.length) {
                  <div class="mt-4 space-y-2">
                    @for (b of ws.boards.slice(0, 3); track b.id) {
                      <a [routerLink]="['/boards', b.id]" class="flex items-center gap-2 text-sm text-slate-700 hover:text-indigo-600">
                        <span class="w-2.5 h-2.5 rounded-full" [style.background]="b.color"></span>
                        {{ b.title }}
                      </a>
                    }
                  </div>
                }
                <div class="mt-5 pt-4 border-t border-slate-100">
                  <a [routerLink]="['/workspaces', ws.id]" class="text-sm font-medium text-indigo-600 hover:text-indigo-700">Open workspace →</a>
                </div>
              </div>
            }
          </div>
        }
      </main>
      @if (showCreate()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" (click)="showCreate.set(false)">
          <div class="card w-full max-w-md p-6" (click)="$event.stopPropagation()">
            <h3 class="text-lg font-semibold">Create workspace</h3>
            <form class="mt-4 space-y-4" (ngSubmit)="createWorkspace()">
              <div>
                <label class="block text-sm font-medium mb-1">Name</label>
                <input class="input" [(ngModel)]="newName" name="name" required placeholder="Acme Product" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Description</label>
                <textarea class="input" rows="2" [(ngModel)]="newDesc" name="desc"></textarea>
              </div>
              <div class="flex justify-end gap-2">
                <button type="button" class="btn-secondary" (click)="showCreate.set(false)">Cancel</button>
                <button type="submit" class="btn-primary" [disabled]="creating()">Create</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  auth = inject(AuthService);
  workspaces = signal<Workspace[]>([]);
  loading = signal(true);
  showCreate = signal(false);
  creating = signal(false);
  newName = '';
  newDesc = '';

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.get<Workspace[]>('/workspaces').subscribe({
      next: (data) => { this.workspaces.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  createWorkspace() {
    if (!this.newName.trim()) return;
    this.creating.set(true);
    this.api.post('/workspaces', { name: this.newName, description: this.newDesc || undefined }).subscribe({
      next: () => {
        this.creating.set(false);
        this.showCreate.set(false);
        this.newName = '';
        this.newDesc = '';
        this.load();
      },
      error: () => this.creating.set(false),
    });
  }
}
