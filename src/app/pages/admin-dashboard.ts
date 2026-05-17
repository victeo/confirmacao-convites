import { Component, inject, OnDestroy, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import {
  Firestore,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
} from '@angular/fire/firestore';
import { RSVPGroup, GuestType, RSVPStatus } from '../models/rsvp.model';

type FilterStatus = 'ALL' | RSVPStatus;

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-6 md:p-12 max-w-7xl mx-auto animate-in fade-in duration-700">

      <!-- Nav -->
      <nav class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12 pb-6 border-b border-outline-variant/30">
        <div>
          <h1 class="font-display text-4xl text-primary font-bold">Painel Administrativo</h1>
          <p class="text-on-surface-variant">Gerencie a lista de convidados e acompanhantes.</p>
        </div>
        <div class="flex items-center gap-4 bg-surface-container p-3 rounded-2xl border border-outline-variant/20 shadow-sm">
          <span class="text-sm font-medium text-on-surface">{{ (auth.user$ | async)?.email }}</span>
          <button (click)="auth.logout()" class="px-4 py-2 bg-error text-on-error rounded-xl text-sm font-bold active:scale-95 transition-all">Sair</button>
        </div>
      </nav>

      <!-- Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div class="bg-white p-8 rounded-2xl border border-outline-variant/30 shadow-sm">
          <h3 class="text-sm uppercase tracking-widest text-outline mb-2">Total de Convites</h3>
          <p class="text-5xl font-display font-bold text-primary">{{ groups().length }}</p>
        </div>
        <div class="bg-white p-8 rounded-2xl border border-outline-variant/30 shadow-sm">
          <h3 class="text-sm uppercase tracking-widest text-outline mb-2">Total de Convidados</h3>
          <p class="text-5xl font-display font-bold text-primary">{{ totalGuests() }}</p>
        </div>
        <div class="bg-white p-8 rounded-2xl border border-outline-variant/30 shadow-sm">
          <h3 class="text-sm uppercase tracking-widest text-outline mb-2">Confirmados</h3>
          <p class="text-5xl font-display font-bold text-green-600">{{ totalConfirmed() }}</p>
        </div>
      </div>

      <!-- Barra de Filtros -->
      <section class="mb-8 flex flex-wrap items-center gap-4">
        <span class="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Filtrar por Status:</span>
        <div class="flex p-1 bg-surface-container rounded-xl border border-outline-variant/20">
          @for (option of filterOptions; track option.value) {
            <button
              (click)="currentFilter.set(option.value)"
              [class.active-filter]="currentFilter() === option.value"
              class="px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all duration-200">
              {{ option.label }}
            </button>
          }
        </div>
        <span class="text-xs text-outline italic ml-2">Exibindo {{ filteredGroups().length }} convite(s)</span>
      </section>

      <!-- Formulário de Novo/Edição -->
      @if (showAddForm()) {
        <section class="mb-12 animate-in zoom-in duration-500">
          <div class="bg-white p-8 rounded-3xl border border-primary/20 shadow-xl relative overflow-hidden">
            <div class="absolute top-0 left-0 w-2 h-full bg-primary"></div>

            <h2 class="font-display text-2xl text-primary font-bold mb-8">{{ editingId() ? 'Editar Convite' : 'Novo Convite' }}</h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-bold text-on-surface-variant uppercase tracking-tight">Nome do Titular</label>
                <input type="text" [(ngModel)]="newGroup.titularName" placeholder="Ex: Victor Átomo" class="w-full p-4 bg-surface-container border border-outline-variant/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all">
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-bold text-on-surface-variant uppercase tracking-tight">Telefone</label>
                <input type="text" [(ngModel)]="newGroup.phone" (input)="applyPhoneMask($event)" placeholder="(XX) 9 9999-9999" class="w-full p-4 bg-surface-container border border-outline-variant/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all">
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-bold text-on-surface-variant uppercase tracking-tight">Limite de Extras</label>
                <input type="number" [(ngModel)]="newGroup.maxExtras" class="w-full p-4 bg-surface-container border border-outline-variant/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all">
              </div>
            </div>

            <div class="mt-10 p-6 bg-surface-container/50 rounded-2xl border border-outline-variant/20">
              <label class="text-sm font-bold text-on-surface-variant uppercase tracking-tight mb-4 block">Dependentes (Filhos/Cônjuge)</label>
              <div class="flex gap-3 mb-6">
                <input type="text" [(ngModel)]="newDependentName" placeholder="Nome do dependente" (keyup.enter)="addDependent()" class="flex-1 p-4 bg-white border border-outline-variant/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all">
                <button (click)="addDependent()" class="w-14 h-14 rounded-xl bg-primary text-on-primary font-bold text-2xl flex items-center justify-center active:scale-95 transition-all shadow-md">+</button>
              </div>

              <div class="flex flex-wrap gap-3">
                @for (name of dependentsList(); track $index) {
                  <div class="pl-5 pr-3 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full flex items-center gap-3 font-semibold shadow-sm">
                    {{ name }}
                    <button (click)="removeDependent($index)" class="w-6 h-6 rounded-full bg-primary/20 text-primary hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center font-bold text-xs leading-none">×</button>
                  </div>
                } @empty {
                  <p class="text-sm text-outline italic py-2">Nenhum dependente adicionado ainda.</p>
                }
              </div>
            </div>

            <div class="flex justify-end gap-4 mt-12">
              <button (click)="cancelEdit()" class="px-8 py-4 bg-surface-container text-on-surface font-bold rounded-xl active:scale-95 transition-all">Cancelar</button>
              <button (click)="saveGroup()" class="px-12 py-4 bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50" [disabled]="loading()">
                {{ editingId() ? 'Atualizar' : 'Salvar' }} Convite
              </button>
            </div>
          </div>
        </section>
      }

      <!-- Table -->
      <section class="bg-white rounded-3xl border border-outline-variant/30 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <div class="p-8 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container/30">
          <h2 class="text-2xl font-display font-bold text-on-surface">Lista de Convidados</h2>
          @if (!showAddForm()) {
            <button (click)="showAddForm.set(true)" class="px-6 py-3 bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-primary/10 hover:accent-on-background">Novo Convite +</button>
          }
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-container/50">
                <th class="p-6 text-sm font-bold uppercase tracking-widest text-outline border-b border-outline-variant/30">Titular</th>
                <th class="p-6 text-sm font-bold uppercase tracking-widest text-outline border-b border-outline-variant/30">Telefone</th>
                <th class="p-6 text-sm font-bold uppercase tracking-widest text-outline border-b border-outline-variant/30">Status do Grupo (Presença)</th>
                <th class="p-6 text-sm font-bold uppercase tracking-widest text-outline border-b border-outline-variant/30">Extras</th>
                <th class="p-6 text-sm font-bold uppercase tracking-widest text-outline border-b border-outline-variant/30">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/20">
              @for (group of filteredGroups(); track group.id) {
                <tr class="hover:bg-surface-container/20 transition-colors">
                  <td class="p-6">
                    <div class="flex flex-col">
                      <span class="font-bold text-on-surface text-lg">{{ group.titularName || group.preRegisteredGuests[0]?.name }}</span>
                      <span class="text-xs text-outline italic">ID: {{ group.id }}</span>
                    </div>
                  </td>
                  <td class="p-6 text-on-surface-variant font-medium">{{ group.phone || '-' }}</td>
                  <td class="p-6">
                    <div class="flex flex-wrap gap-2">
                      @for (g of group.preRegisteredGuests; track g.name) {
                        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border"
                            [ngClass]="getStatusClass(g.status)">
                          <span class="material-symbols-outlined text-[14px]">{{ getStatusIcon(g.status) }}</span>
                          {{ g.name }}
                        </div>
                      }

                      @for (g of group.extraGuests; track g.name) {
                        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border border-primary/30 bg-primary/5 text-primary">
                          <span class="material-symbols-outlined text-[14px]">add_circle</span>
                          {{ g.name }} (Extra)
                        </div>
                      }
                    </div>
                  </td>
                  <td class="p-6">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-primary">{{ group.extraGuests.length }}</span>
                      <span class="text-outline">/ {{ group.maxExtras }}</span>
                    </div>
                  </td>
                  <td class="p-6">
                    <div class="flex gap-2">
                      <button (click)="editGroup(group)" class="w-10 h-10 rounded-lg flex items-center justify-center border border-outline-variant/50 hover:bg-surface-container transition-colors" title="Editar">✏️</button>
                      <button (click)="deleteGroup(group.id)" class="w-10 h-10 rounded-lg flex items-center justify-center border border-error/30 text-error hover:bg-error/5 transition-colors" title="Excluir">🗑️</button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="p-12 text-center text-outline italic">Nenhum convidado encontrado com este filtro.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .status-confirmed { background-color: #dcfce7; color: #15803d; border-color: #bbf7d0; }
    .status-declined { background-color: #fee2e2; color: #b91c1c; border-color: #fecaca; }
    .status-pending { background-color: #f3f4f6; color: #6b7280; border-color: #e5e7eb; }
    .active-filter { background-color: #8a4853; color: white !important; box-shadow: 0 4px 12px rgba(138, 72, 83, 0.2); }
    button:not(.active-filter):hover { background-color: rgba(0,0,0,0.03); }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminDashboardComponent implements OnDestroy {
  public auth = inject(AuthService);
  private firestore = inject(Firestore);

  groups = signal<RSVPGroup[]>([]);
  currentFilter = signal<FilterStatus>('ALL');

  protected readonly RSVPStatus = RSVPStatus;

  showAddForm = signal(false);
  loading = signal(false);
  editingId = signal<string | null>(null);

  newGroup = { titularName: '', phone: '', maxExtras: 0 };
  newDependentName = '';
  dependentsList = signal<string[]>([]);

  readonly filterOptions: { label: string, value: FilterStatus }[] = [
    { label: 'Todos', value: 'ALL' },
    { label: 'Pendentes', value: RSVPStatus.PENDING },
    { label: 'Confirmados', value: RSVPStatus.CONFIRMED },
    { label: 'Recusados', value: RSVPStatus.DECLINED }
  ];

  totalGuests = computed(() => this.groups().reduce((acc, g) => acc + g.preRegisteredGuests.length + g.extraGuests.length, 0));
  totalConfirmed = computed(() => this.groups().reduce((acc, group) => {
      const pre = group.preRegisteredGuests.filter(g => g.status === RSVPStatus.CONFIRMED).length;
      const extra = group.extraGuests.filter(g => g.status === RSVPStatus.CONFIRMED).length;
      return acc + pre + extra;
    }, 0));

  filteredGroups = computed(() => {
    const list = this.groups();
    const filter = this.currentFilter();
    if (filter === 'ALL') return list;
    return list.filter(group => [...group.preRegisteredGuests, ...group.extraGuests].some(member => member.status === filter));
  });

  private unsubscribe: any;

  constructor() {
    const groupsRef = collection(this.firestore, 'groups');
    this.unsubscribe = onSnapshot(groupsRef, (snapshot) => {
      this.groups.set(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RSVPGroup[]);
    });
  }

  ngOnDestroy() { if (this.unsubscribe) this.unsubscribe(); }

  getStatusClass(status: RSVPStatus) {
    switch (status) {
      case RSVPStatus.CONFIRMED: return 'status-confirmed';
      case RSVPStatus.DECLINED: return 'status-declined';
      default: return 'status-pending';
    }
  }

  getStatusIcon(status: RSVPStatus) {
    switch (status) {
      case RSVPStatus.CONFIRMED: return 'check_circle';
      case RSVPStatus.DECLINED: return 'cancel';
      default: return 'schedule';
    }
  }

  applyPhoneMask(event: any) {
    let value = event.target.value.replace(/\D/g, "");
    if (value.length > 0) {
      value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
      if (value.length > 9) value = value.replace(/(\d{1})(\d{4})(\d{4})$/, "$1 $2-$3");
    }
    this.newGroup.phone = value;
  }

  addDependent() {
    if (this.newDependentName.trim()) {
      this.dependentsList.update(list => [...list, this.newDependentName.trim()]);
      this.newDependentName = '';
    }
  }

  removeDependent(index: number) {
    this.dependentsList.update(list => list.filter((_, i) => i !== index));
  }

  editGroup(group: RSVPGroup) {
    this.editingId.set(group.id || null);
    this.newGroup = { titularName: group.titularName, phone: group.phone || '', maxExtras: group.maxExtras };
    this.dependentsList.set(group.preRegisteredGuests.filter(g => g.type === GuestType.DEPENDENT).map(g => g.name));
    this.showAddForm.set(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.showAddForm.set(false);
    this.editingId.set(null);
    this.newGroup = { titularName: '', phone: '', maxExtras: 0 };
    this.dependentsList.set([]);
    this.newDependentName = '';
  }

  async saveGroup() {
    if (!this.newGroup.titularName) return;
    this.loading.set(true);
    try {
      const dependents = this.dependentsList().map(name => ({ name, type: GuestType.DEPENDENT, status: RSVPStatus.PENDING }));
      const groupData: any = {
        titularName: this.newGroup.titularName,
        phone: this.newGroup.phone,
        maxExtras: this.newGroup.maxExtras,
        preRegisteredGuests: [{ name: this.newGroup.titularName, type: GuestType.TITULAR, status: RSVPStatus.PENDING }, ...dependents]
      };

      if (this.editingId()) {
        const existingGroup = this.groups().find(g => g.id === this.editingId());
        groupData.extraGuests = existingGroup?.extraGuests || [];
        await updateDoc(doc(this.firestore, `groups/${this.editingId()}`), groupData);
      } else {
        groupData.extraGuests = [];
        await addDoc(collection(this.firestore, 'groups'), groupData);
      }
      this.cancelEdit();
    } catch (e) {
      alert('Erro ao salvar convite.');
    } finally {
      this.loading.set(false);
    }
  }

  async deleteGroup(id: string | undefined) {
    if (!id || !confirm('Tem certeza que deseja excluir este convite?')) return;
    try { await deleteDoc(doc(this.firestore, `groups/${id}`)); } catch (e) {}
  }
}
