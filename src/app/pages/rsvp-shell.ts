import { Component, computed, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RSVPService } from '../services/rsvp.service';
import { SearchInputComponent } from '../components/search-input';
import { GuestItemComponent } from '../components/guest-item';
import { ExtraGuestFormComponent } from '../components/extra-guest-form';
import { Guest, GuestType, RSVPStatus } from '../models/rsvp.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-rsvp-shell',
  standalone: true,
  imports: [
    CommonModule, 
    SearchInputComponent, 
    GuestItemComponent, 
    ExtraGuestFormComponent
  ],
  template: `
    <div class="w-full flex flex-col items-center">
      <!-- Hero & Action Card Section -->
      <section class="w-full relative min-h-[600px] flex items-center justify-center p-6 overflow-hidden">
        <!-- Hero Background Image -->
        <div class="absolute inset-0 z-0 bg-cover bg-center transition-all duration-700" 
             style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCsprMEViMuYQbFSfb1OFcgQ8UgkgG8mr1urGhcxHNXcDtc34CjWw8PperA2XNFSvzIF2A522RrUHvwVOr93cGLubps9UzOcJSIPT6YYFoRzrCz3Mwc420NmB_Lvhm5s4ag2ojFQpjNh-Kt9rlQ4G3QTAQrQSL8fI5VSr8NV5IpBAjP1HOuN6MboMgYQGDG92B4IiIQVWrnLIIgTLPmA6P8wFQTQdxZ0T2oEEQWOhVFe-_WpsTQjtDhS2iVgajKrpNjLSkoUMaAnmSS');">
          <!-- Overlay -->
          <div class="absolute inset-0 bg-surface/40 backdrop-blur-[2px]"></div>
        </div>

        <!-- Glassmorphism Container -->
        <div class="relative z-10 w-full max-w-xl bg-surface/90 backdrop-blur-lg border border-outline-variant/50 rounded-2xl p-8 md:p-12 shadow-2xl flex flex-col items-center">
          
          <!-- Header Secret Login -->
          <div class="text-center mb-8">
            <h2 (click)="onHeaderClick()" class="font-display text-3xl md:text-4xl text-primary tracking-wide mb-4 cursor-default select-none">
              Sua presença tornará esse sonho real
            </h2>
            <p class="text-on-surface-variant text-lg">
              Por favor, confirme sua presença para celebrarmos este momento inesquecível.
            </p>
          </div>

          <!-- Search Section -->
          @if (!service.currentGroup() && !submitted()) {
            <div class="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              <app-search-input (search)="onSearch($event)"></app-search-input>
              @if (service.error()) {
                <p class="text-error text-center mt-4 font-medium">{{ service.error() }}</p>
              }
              @if (service.loading()) {
                <div class="flex items-center justify-center mt-4">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span class="ml-3 text-primary font-medium">Buscando...</span>
                </div>
              }
            </div>
          }

          <!-- Confirmation Section -->
          @if (service.currentGroup(); as group) {
            <div class="w-full animate-in fade-in zoom-in duration-500">
              <div class="mb-8 text-center">
                <h3 class="text-2xl font-display text-primary mb-2">Olá, {{ group.titularName || group.preRegisteredGuests[0].name }}!</h3>
                <p class="text-on-surface-variant">Confirme quem estará presente no evento:</p>
              </div>

              <div class="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                @for (guest of group.preRegisteredGuests; track guest.name; let i = $index) {
                  <app-guest-item 
                    [guest]="guest"
                    (statusChange)="updateGuestStatus('pre', i, $event)">
                  </app-guest-item>
                }

                @for (guest of group.extraGuests; track guest.name; let i = $index) {
                  <app-guest-item 
                    [guest]="guest"
                    (statusChange)="updateGuestStatus('extra', i, $event)">
                  </app-guest-item>
                }
              </div>

              @if (remainingExtras() > 0) {
                <app-extra-guest-form 
                  [remaining]="remainingExtras()"
                  (addExtra)="onAddExtra($event)">
                </app-extra-guest-form>
              }

              <div class="flex flex-col gap-4 mt-8">
                <button (click)="submit()" 
                        class="w-full py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-semibold uppercase tracking-widest hover:shadow-lg active:scale-95 transition-all duration-200 disabled:opacity-50"
                        [disabled]="service.loading()">
                  {{ service.loading() ? 'Salvando...' : 'Confirmar Presença' }}
                </button>
                <button (click)="service.reset()" class="text-outline hover:text-primary transition-colors font-medium">
                  Voltar à busca
                </button>
              </div>
            </div>
          }

          <!-- Success Screen -->
          @if (submitted()) {
            <div class="text-center py-8 animate-in fade-in zoom-in duration-500 w-full">
              <div class="text-6xl mb-6">🎉</div>
              <h2 class="text-3xl font-display text-primary mb-4">Presença Confirmada!</h2>
              <p class="text-on-surface-variant text-lg mb-8">Mal podemos esperar para celebrar com você!</p>
              
              @if (service.eventConfig(); as config) {
                <div class="mb-8">
                  <button (click)="service.showLocationModal.set(true)" 
                          class="text-primary font-bold hover:underline flex items-center justify-center gap-2 mx-auto">
                    <span class="material-symbols-outlined">location_on</span>
                    Ver informações do local
                  </button>
                </div>
              }

              <button (click)="submitted.set(false); service.reset()" 
                      class="px-8 py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary hover:text-on-primary transition-all">
                Voltar ao início
              </button>
            </div>
          }

        </div>
      </section>
    </div>
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #d7c1c3; border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #8a4853; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RSVPShellComponent implements OnInit {
  service = inject(RSVPService);
  auth = inject(AuthService);
  route = inject(ActivatedRoute);

  submitted = signal(false);
  protected readonly RSVPStatus = RSVPStatus;

  private clickCount = 0;
  private clickTimer: any;

  onHeaderClick() {
    this.clickCount++;
    if (this.clickTimer) clearTimeout(this.clickTimer);
    
    this.clickTimer = setTimeout(() => {
      this.clickCount = 0;
    }, 2000);

    if (this.clickCount >= 5) {
      this.auth.loginWithGoogle();
      this.clickCount = 0;
    }
  }

  remainingExtras = computed(() => {
    const group = this.service.currentGroup();
    if (!group) return 0;
    return group.maxExtras - group.extraGuests.length;
  });

  ngOnInit() {
    // Carregar configurações do evento (local, endereço, etc)
    this.service.getEventConfig();

    // Escuta tanto parâmetros de rota quanto de busca para reagir a mudanças
    this.route.paramMap.subscribe(params => {
      const nameParam = params.get('name');
      if (nameParam) {
        this.loadByName(nameParam);
      }
    });

    this.route.queryParamMap.subscribe(params => {
      const id = params.get('c');
      if (id) {
        this.service.getGroupById(id);
        return;
      }

      const convidadoParam = params.get('convidado');
      if (convidadoParam) {
        this.loadByName(convidadoParam);
      }
    });
  }

  private loadByName(name: string) {
    // Remove aspas se o usuário tiver incluído no link (ex: convidado="Nome")
    const cleanName = name.replace(/^["']|["']$/g, '').replace(/_/g, ' ');
    this.service.searchGroup(cleanName);
  }

  onSearch(term: string) {
    this.service.searchGroup(term);
  }

  updateGuestStatus(type: 'pre' | 'extra', index: number, status: RSVPStatus) {
    const group = this.service.currentGroup();
    if (!group) return;

    if (type === 'pre') {
      group.preRegisteredGuests[index].status = status;
    } else {
      group.extraGuests[index].status = status;
    }
    
    this.service.currentGroup.set({ ...group });
  }

  onAddExtra(name: string) {
    const group = this.service.currentGroup();
    if (!group) return;

    group.extraGuests.push({
      name,
      type: GuestType.EXTRA,
      status: RSVPStatus.CONFIRMED
    });

    this.service.currentGroup.set({ ...group });
  }

  async submit() {
    const group = this.service.currentGroup();
    if (!group) return;

    try {
      await this.service.confirmRSVP(group);
      this.submitted.set(true);
      this.service.currentGroup.set(null);
    } catch (e) {
      // Erro tratado no service
    }
  }
}
