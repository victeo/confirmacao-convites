import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { RSVPService } from './services/rsvp.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <!-- TopAppBar -->
    <header class="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm flex items-center justify-between px-6 h-16">
      <button (click)="showDrawer.set(true)" aria-label="Menu" class="text-on-surface-variant hover:text-primary transition-colors duration-300 active:scale-95 flex items-center justify-center p-2 rounded-full">
        <span class="material-symbols-outlined text-[24px]">menu</span>
      </button>
      <h1 class="font-display text-xl md:text-2xl text-primary tracking-tight font-semibold">15 Anos da Victória</h1>
      <div class="w-10"></div> 
    </header>

    <!-- Side Drawer -->
    @if (showDrawer()) {
      <div class="fixed inset-0 z-[100] flex animate-in fade-in duration-300">
        <!-- Backdrop -->
        <div (click)="showDrawer.set(false)" class="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        
        <!-- Drawer Content -->
        <aside class="relative w-80 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
          <div class="p-6 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low">
            <h2 class="font-display text-xl text-primary font-bold">Menu</h2>
            <button (click)="showDrawer.set(false)" class="text-on-surface-variant hover:text-primary p-2">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <nav class="flex-grow p-4 space-y-2">
            <a (click)="navigateToHome()" class="flex items-center gap-4 p-4 rounded-2xl hover:bg-primary/5 text-on-surface font-medium transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-primary">home</span>
              Página Principal
            </a>
            <a (click)="openLocation()" class="flex items-center gap-4 p-4 rounded-2xl hover:bg-primary/5 text-on-surface font-medium transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-primary">location_on</span>
              Localização
            </a>
            <a (click)="showDrawer.set(false)" class="flex items-center gap-4 p-4 rounded-2xl hover:bg-primary/5 text-on-surface font-medium transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-primary">redeem</span>
              Presentes
            </a>
            <a (click)="showDrawer.set(false)" class="flex items-center gap-4 p-4 rounded-2xl hover:bg-primary/5 text-on-surface font-medium transition-colors cursor-pointer">
              <span class="material-symbols-outlined text-primary">checkroom</span>
              Traje
            </a>
          </nav>

          <div class="p-6 border-t border-outline-variant/30 text-center">
            <p class="text-xs text-outline italic">Victória 15 Anos • 2026</p>
          </div>
        </aside>
      </div>
    }

    <!-- Main Content -->
    <main class="flex-grow pt-16 min-h-screen">
      <router-outlet></router-outlet>
    </main>

    <!-- Footer -->
    <footer class="w-full bg-surface-container-low flex flex-col items-center gap-6 py-12 px-6 text-center pb-32 md:pb-12">
      <h3 class="font-display text-2xl text-primary">Com carinho, Victória • 2026</h3>
      <nav class="flex flex-wrap justify-center gap-6">
        <a (click)="openLocation()" class="text-on-surface-variant hover:text-primary transition-all duration-300 opacity-80 hover:opacity-100 cursor-pointer">Localização</a>
        <a class="text-on-surface-variant hover:text-primary transition-all duration-300 opacity-80 hover:opacity-100 cursor-pointer">Traje</a>
        <a class="text-on-surface-variant hover:text-primary transition-all duration-300 opacity-80 hover:opacity-100 cursor-pointer">Presentes</a>
      </nav>
    </footer>

    <!-- BottomNavBar (Mobile Only) -->
    <nav class="fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-4 bg-surface/80 backdrop-blur-md border-t border-outline-variant/30 shadow-[0_-8px_30px_rgba(183,110,121,0.12)] z-50 rounded-t-xl md:hidden">
      <a (click)="navigateToHome()" class="flex flex-col items-center justify-center text-on-surface-variant hover:bg-secondary-container/50 transition-all rounded-full px-4 py-1 active:scale-90 duration-200 cursor-pointer">
        <span class="material-symbols-outlined">home</span>
        <span class="text-xs mt-1">Início</span>
      </a>
      <a class="flex flex-col items-center justify-center text-on-surface-variant hover:bg-secondary-container/50 transition-all rounded-full px-4 py-1 active:scale-90 duration-200 cursor-pointer">
        <span class="material-symbols-outlined">auto_awesome</span>
        <span class="text-xs mt-1">Convite</span>
      </a>
      <a (click)="openLocation()" 
         class="flex flex-col items-center justify-center text-on-surface-variant hover:bg-secondary-container/50 transition-all rounded-full px-4 py-1 active:scale-90 duration-200 cursor-pointer">
        <span class="material-symbols-outlined">location_on</span>
        <span class="text-xs mt-1">Local</span>
      </a>
    </nav>

    <!-- Global Location Modal -->
    @if (rsvpService.showLocationModal() && rsvpService.eventConfig(); as config) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
        <div (click)="$event.stopPropagation()" 
             class="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
          
          <!-- Modal Header -->
          <div class="p-6 bg-primary text-on-primary flex justify-between items-center">
            <h3 class="font-display text-2xl flex items-center gap-2">
              <span class="material-symbols-outlined">location_on</span>
              Informações do Local
            </h3>
            <button (click)="rsvpService.showLocationModal.set(false)" class="text-on-primary/80 hover:text-on-primary">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <!-- Modal Content -->
          <div class="p-8">
            <div class="mb-6">
              <p class="text-xs uppercase tracking-widest text-outline font-bold mb-1">Local</p>
              <p class="text-xl font-bold text-on-surface">{{ config.locationName }}</p>
            </div>

            <div class="mb-6">
              <p class="text-xs uppercase tracking-widest text-outline font-bold mb-1">Endereço</p>
              <p class="text-on-surface-variant">{{ config.address }}</p>
            </div>

            @if (config.additionalInfo) {
              <div class="mb-8 p-4 bg-surface-container rounded-xl border border-outline-variant/30">
                <p class="text-xs uppercase tracking-widest text-outline font-bold mb-1">Informações Adicionais</p>
                <p class="text-sm italic text-on-surface">{{ config.additionalInfo }}</p>
              </div>
            }

            <div class="flex flex-col gap-3">
              <a [href]="config.googleMapsLink" 
                 target="_blank" 
                 class="w-full py-4 bg-primary text-on-primary rounded-xl font-bold text-center flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
                <span class="material-symbols-outlined">directions</span>
                Abrir no Google Maps
              </a>
              <button (click)="rsvpService.showLocationModal.set(false)" 
                      class="w-full py-3 text-outline font-medium hover:text-primary transition-colors">
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
    @keyframes slide-in-left { from { transform: translateX(-100%); } to { transform: translateX(0); } }
    
    .animate-in { animation: var(--animation-name) 0.3s ease-out; }
    .fade-in { --animation-name: fade-in; }
    .zoom-in { --animation-name: zoom-in; }
    .slide-in-from-left { --animation-name: slide-in-left; }
  `]
})
export class App implements OnInit {
  auth = inject(AuthService);
  rsvpService = inject(RSVPService);
  showDrawer = signal(false);

  ngOnInit() {
    this.rsvpService.getEventConfig();
  }

  openLocation() {
    this.showDrawer.set(false);
    this.rsvpService.showLocationModal.set(true);
  }

  navigateToHome() {
    this.showDrawer.set(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
