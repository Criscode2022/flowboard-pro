import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  dueDate?: string;
  assignee?: { id: string; name: string };
  creator: { id: string; name: string };
  _count?: { comments: number };
}

interface Column {
  id: string;
  title: string;
  position: number;
  color?: string;
  cards: Card[];
}

interface Board {
  id: string;
  title: string;
  color: string;
  columns: Column[];
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-slate-100 flex flex-col">
      <header class="bg-white border-b border-slate-200 shrink-0">
        <div class="px-4 h-14 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0">
            <a routerLink="/dashboard" class="btn-ghost p-1.5 rounded-lg">←</a>
            @if (board()) {
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-3 h-3 rounded-full shrink-0" [style.background]="board()!.color"></span>
                <h1 class="font-semibold text-slate-900 truncate">{{ board()!.title }}</h1>
              </div>
            }
          </div>
          <button class="btn-ghost text-sm" (click)="auth.logout()">Sign out</button>
        </div>
      </header>
      @if (loading()) {
        <div class="flex-1 flex items-center justify-center text-slate-500">Loading board…</div>
      } @else if (board()) {
        <div class="flex-1 overflow-x-auto p-4 sm:p-6">
          <div class="flex gap-4 h-full min-h-[calc(100vh-8rem)] items-start">
            @for (col of board()!.columns; track col.id) {
              <div class="w-72 shrink-0 flex flex-col max-h-full bg-slate-200/60 rounded-xl">
                <div class="px-3 py-3 flex items-center gap-2">
                  @if (col.color) {
                    <span class="w-2 h-2 rounded-full" [style.background]="col.color"></span>
                  }
                  <h3 class="font-semibold text-sm text-slate-700">{{ col.title }}</h3>
                  <span class="text-xs text-slate-500 bg-slate-300/50 px-1.5 py-0.5 rounded">{{ col.cards.length }}</span>
                </div>
                <div class="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                  @for (card of col.cards; track card.id) {
                    <div class="bg-white rounded-lg border border-slate-200 p-3 shadow-sm hover:shadow cursor-pointer" (click)="openCard(card)">
                      <p class="text-sm font-medium text-slate-800">{{ card.title }}</p>
                      <div class="mt-2 flex flex-wrap items-center gap-1.5">
                        @if (card.priority !== 'MEDIUM') {
                          <span class="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded" [class]="priorityClass(card.priority)">{{ card.priority }}</span>
                        }
                        @if (card.dueDate) {
                          <span class="text-[10px] text-slate-500">{{ card.dueDate | date:'MMM d' }}</span>
                        }
                      </div>
                      @if (card.assignee) {
                        <div class="mt-2 flex items-center gap-1.5">
                          <div class="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-semibold flex items-center justify-center">{{ card.assignee.name.charAt(0) }}</div>
                          <span class="text-[11px] text-slate-500">{{ card.assignee.name }}</span>
                        </div>
                      }
                    </div>
                  }
                  <button class="w-full text-left text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-300/40 rounded-lg px-2 py-2" (click)="startAdd(col)">+ Add card</button>
                </div>
              </div>
            }
          </div>
        </div>
      }
      @if (addingColumn()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" (click)="addingColumn.set(null)">
          <div class="card w-full max-w-md p-6" (click)="$event.stopPropagation()">
            <h3 class="text-lg font-semibold">New card</h3>
            <form class="mt-4 space-y-4" (ngSubmit)="createCard()">
              <div>
                <label class="block text-sm font-medium mb-1">Title</label>
                <input class="input" [(ngModel)]="newCardTitle" name="title" required autofocus />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Priority</label>
                <select class="input" [(ngModel)]="newCardPriority" name="priority">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div class="flex justify-end gap-2">
                <button type="button" class="btn-secondary" (click)="addingColumn.set(null)">Cancel</button>
                <button type="submit" class="btn-primary" [disabled]="!newCardTitle.trim()">Add</button>
              </div>
            </form>
          </div>
        </div>
      }
      @if (selectedCard()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" (click)="selectedCard.set(null)">
          <div class="card w-full max-w-lg p-6" (click)="$event.stopPropagation()">
            <div class="flex items-start justify-between gap-4">
              <h3 class="text-lg font-semibold">{{ selectedCard()!.title }}</h3>
              <button class="btn-ghost p-1" (click)="selectedCard.set(null)">✕</button>
            </div>
            <div class="mt-4 space-y-3 text-sm">
              <div><span class="text-slate-500">Priority:</span> <span class="ml-2 font-medium">{{ selectedCard()!.priority }}</span></div>
              @if (selectedCard()!.description) {
                <p class="text-slate-700">{{ selectedCard()!.description }}</p>
              }
              <p class="text-xs text-slate-400">Created by {{ selectedCard()!.creator.name }}</p>
            </div>
            <div class="mt-6 flex gap-2">
              <button class="btn-secondary text-sm" (click)="deleteCard(selectedCard()!.id)">Delete</button>
              <button class="btn-primary text-sm ml-auto" (click)="selectedCard.set(null)">Close</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class BoardComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);
  board = signal<Board | null>(null);
  loading = signal(true);
  addingColumn = signal<Column | null>(null);
  selectedCard = signal<Card | null>(null);
  newCardTitle = '';
  newCardPriority: Card['priority'] = 'MEDIUM';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.load(id);
  }

  load(id: string) {
    this.loading.set(true);
    this.api.get<Board>(`/boards/${id}`).subscribe({
      next: (data) => { this.board.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  priorityClass(p: string) {
    const map: Record<string, string> = {
      LOW: 'bg-slate-100 text-slate-600',
      MEDIUM: 'bg-blue-50 text-blue-700',
      HIGH: 'bg-amber-50 text-amber-700',
      URGENT: 'bg-red-50 text-red-700',
    };
    return map[p] || map['MEDIUM'];
  }

  startAdd(col: Column) {
    this.addingColumn.set(col);
    this.newCardTitle = '';
    this.newCardPriority = 'MEDIUM';
  }

  createCard() {
    const col = this.addingColumn();
    if (!col || !this.newCardTitle.trim()) return;
    this.api.post<Card>('/cards', {
      columnId: col.id,
      title: this.newCardTitle.trim(),
      priority: this.newCardPriority,
    }).subscribe({
      next: (card) => {
        const b = this.board();
        if (!b) return;
        const columns = b.columns.map((c) =>
          c.id === col.id ? { ...c, cards: [...c.cards, card] } : c,
        );
        this.board.set({ ...b, columns });
        this.addingColumn.set(null);
      },
    });
  }

  openCard(card: Card) {
    this.selectedCard.set(card);
  }

  deleteCard(id: string) {
    if (!confirm('Delete this card?')) return;
    this.api.delete(`/cards/${id}`).subscribe({
      next: () => {
        const b = this.board();
        if (!b) return;
        const columns = b.columns.map((c) => ({
          ...c,
          cards: c.cards.filter((x) => x.id !== id),
        }));
        this.board.set({ ...b, columns });
        this.selectedCard.set(null);
      },
    });
  }
}
