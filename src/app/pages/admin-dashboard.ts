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
import { RSVPGroup, GuestType, RSVPStatus, EventConfig } from '../models/rsvp.model';
import { RSVPService } from '../services/rsvp.service';

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
          <p class="text-on-surface-variant">Gerencie o evento e a lista de convidados.</p>
        </div>
        <div class="flex items-center gap-4">
          <button (click)="showSettings.set(!showSettings())" 
                  class="px-6 py-3 rounded-xl font-bold transition-all border border-primary/20"
                  [class.bg-primary]="showSettings()"
                  [class.text-on-primary]="showSettings()"
                  [class.text-primary]="!showSettings()">
            ⚙️ Configurações do Evento
          </button>
          <div class="flex items-center gap-4 bg-surface-container p-3 rounded-2xl border border-outline-variant/20 shadow-sm">
            <span class="text-sm font-medium text-on-surface">{{ (auth.user$ | async)?.email }}</span>
            <button (click)="auth.logout()" class="px-4 py-2 bg-error text-on-error rounded-xl text-sm font-bold active:scale-95 transition-all">Sair</button>
          </div>
        </div>
      </nav>

      <!-- Event Settings Section -->
      @if (showSettings()) {
        <section class="mb-12 animate-in slide-in-from-top-4 duration-500">
          <div class="bg-white p-8 rounded-3xl border border-primary/20 shadow-xl">
            <h2 class="font-display text-2xl text-primary font-bold mb-8">Localização do Evento</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="flex flex-col gap-2">
                <label class="text-sm font-bold text-on-surface-variant uppercase tracking-tight">Nome do Local *</label>
                <input type="text" [(ngModel)]="eventConfig.locationName" placeholder="Ex: Mansão das Flores" class="w-full p-4 bg-surface-container border border-outline-variant/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all">
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-bold text-on-surface-variant uppercase tracking-tight">Add Endereço *</label>
                <input type="text" [(ngModel)]="eventConfig.address" placeholder="Rua Exemplo, 123 - Bairro" class="w-full p-4 bg-surface-container border border-outline-variant/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all">
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-bold text-on-surface-variant uppercase tracking-tight">Link do Google Maps *</label>
                <input type="text" [(ngModel)]="eventConfig.googleMapsLink" placeholder="https://goo.gl/maps/..." class="w-full p-4 bg-surface-container border border-outline-variant/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all">
              </div>
              <div class="flex flex-col gap-2">
                <label class="text-sm font-bold text-on-surface-variant uppercase tracking-tight">Informações Adicionais (Opcional)</label>
                <input type="text" [(ngModel)]="eventConfig.additionalInfo" placeholder="Ex: Entrada pelo portão lateral" class="w-full p-4 bg-surface-container border border-outline-variant/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all">
              </div>
            </div>
            <div class="flex justify-end mt-8">
              <button (click)="saveSettings()" class="px-12 py-4 bg-primary text-on-primary font-bold rounded-xl active:scale-95 transition-all shadow-lg" [disabled]="loadingSettings()">
                {{ loadingSettings() ? 'Salvando...' : 'Salvar Configurações' }}
              </button>
            </div>
          </div>
        </section>
      }

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
                      <button type="button" (click)="copyLink(group)" class="w-10 h-10 rounded-lg flex items-center justify-center border border-primary/30 text-primary hover:bg-primary/5 transition-colors" title="Copiar Link de Convite">🔗</button>
                      <button type="button" (click)="shareWhatsApp(group)" class="w-10 h-10 rounded-lg flex items-center justify-center border border-green-600/30 text-green-600 hover:bg-green-600/5 transition-colors" title="Enviar via WhatsApp">
                        <svg viewBox="0 0 24 24" class="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      </button>
                      <button type="button" (click)="editGroup(group)" class="w-10 h-10 rounded-lg flex items-center justify-center border border-outline-variant/50 hover:bg-surface-container transition-colors" title="Editar">✏️</button>
                      <button type="button" (click)="deleteGroup(group.id)" class="w-10 h-10 rounded-lg flex items-center justify-center border border-error/30 text-error hover:bg-error/5 transition-colors" title="Excluir">🗑️</button>
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
  private rsvpService = inject(RSVPService);

  groups = signal<RSVPGroup[]>([]);
  currentFilter = signal<FilterStatus>('ALL');

  protected readonly RSVPStatus = RSVPStatus;

  showAddForm = signal(false);
  showSettings = signal(false);
  loading = signal(false);
  loadingSettings = signal(false);
  editingId = signal<string | null>(null);

  eventConfig: EventConfig = {
    locationName: '',
    address: '',
    googleMapsLink: '',
    additionalInfo: ''
  };

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

    // Carregar configurações iniciais
    this.loadEventConfig();
  }

  async loadEventConfig() {
    await this.rsvpService.getEventConfig();
    const config = this.rsvpService.eventConfig();
    if (config) {
      this.eventConfig = { ...config };
    }
  }

  async saveSettings() {
    if (!this.eventConfig.locationName || !this.eventConfig.address || !this.eventConfig.googleMapsLink) {
      alert('Por favor, preencha todos os campos obrigatórios (*)');
      return;
    }

    this.loadingSettings.set(true);
    try {
      await this.rsvpService.saveEventConfig(this.eventConfig);
      alert('Configurações salvas com sucesso!');
      this.showSettings.set(false);
    } catch (e) {
      alert('Erro ao salvar configurações.');
    } finally {
      this.loadingSettings.set(false);
    }
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
    const titularName = this.newGroup.titularName.trim();
    if (!titularName) return;
    this.loading.set(true);
    try {
      const dependents = this.dependentsList().map(name => ({ name: name.trim(), type: GuestType.DEPENDENT, status: RSVPStatus.PENDING }));
      const groupData: any = {
        titularName,
        phone: this.newGroup.phone,
        maxExtras: this.newGroup.maxExtras,
        preRegisteredGuests: [{ name: titularName, type: GuestType.TITULAR, status: RSVPStatus.PENDING }, ...dependents]
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

  async copyLink(group: RSVPGroup) {
    const name = (group.titularName || group.preRegisteredGuests[0]?.name || '').replace(/ /g, '_');
    const url = `${window.location.origin}/convidado/${name}`;
    try {
      await navigator.clipboard.writeText(url);
      alert('Link do convite copiado!');
    } catch (err) {
      console.error('Erro ao copiar link:', err);
      alert('Não foi possível copiar o link automaticamente.');
    }
  }

  shareWhatsApp(group: RSVPGroup) {
    const name = group.titularName || group.preRegisteredGuests[0]?.name || '';
    const linkName = name.replace(/ /g, '_');
    const url = `${window.location.origin}/convidado/${linkName}`;
    const phone = (group.phone || '').replace(/\D/g, '');
    
    const message = `Olá ${name}! Ficaremos muito felizes com sua presença em nosso evento. Por favor, confirme sua participação através deste link: ${url}`;
    const encodedMessage = encodeURIComponent(message);
    
    if (phone) {
      window.open(`https://wa.me/55${phone}?text=${encodedMessage}`, '_blank');
    } else {
      // Se não tiver telefone, apenas abre o WhatsApp Web para escolher o contato
      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    }
  }
}
