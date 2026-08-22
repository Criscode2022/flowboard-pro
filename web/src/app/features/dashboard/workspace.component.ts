import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-workspace',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-50">
      <header class="bg-white border-b border-slate-200">
        <div class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div class="flex items-center gap-3">
            <a routerLink="/dashboard" class="btn-ghost p-1.5">←</a>
            <span class="font-semibold">{{ workspace()?.name || 'Workspace' }}</span>
          </div>
          <button class="btn-ghost text-sm" (click)="auth.logout()">Sign out</button>
        </div>
      </header>
      <main class="max-w-7xl mx-auto px-4 py-8">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-xl font-bold">Boards</h1>
          <button class="btn-primary" (click)="showCreate.set(true)">+ New board</button>
        </div>
        @if (loading()) {
          <p class="text-slate-500">Loading…</p>
        } @else {
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            @for (b of boards(); track b.id) {
              <a [routerLink]="['/boards', b.id]" class="card p-5 hover:shadow-md transition block">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full" [style.background]="b.color"></span>
                  <h3 class="font-semibold">{{ b.title }}</h3>
                </div>
                <p class="text-sm text-slate-500 mt-2">{{ b.description || 'Open board' }}</p>
              </a>
            }
          </div>
        }
      </main>
      @if (showCreate()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" (click)="showCreate.set(false)">
          <div class="card w-full max-w-md p-6" (click)="$event.stopPropagation()">
            <h3 class="text-lg font-semibold">Create board</h3>
            <form class="mt-4 space-y-4" (ngSubmit)="create()">
              <div>
                <label class="block text-sm font-medium mb-1">Title</label>
                <input class="input" [(ngModel)]="title" name="title" required />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Description</label>
                <textarea class="input" rows="2" [(ngModel)]="desc" name="desc"></textarea>
              </div>
              <div class="flex justify-end gap-2">
                <button type="button" class="btn-secondary" (click)="showCreate.set(false)">Cancel</button>
                <button type="submit" class="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
})
export class WorkspaceComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);
  workspace = signal<any>(null);
  boards = signal<any[]>([]);
  loading = signal(true);
  showCreate = signal(false);
  title = '';
  desc = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.api.get<any>(`/workspaces/${id}`).subscribe({
      next: (ws) => {
        this.workspace.set(ws);
        this.boards.set(ws.boards || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  create() {
    if (!this.title.trim() || !this.workspace()) return;
    this.api.post('/boards', {
      workspaceId: this.workspace().id,
      title: this.title,
      description: this.desc || undefined,
    }).subscribe({
      next: (board: any) => {
        this.boards.update((b) => [board, ...b]);
        this.showCreate.set(false);
        this.title = '';
        this.desc = '';
      },
    });
  }
}
