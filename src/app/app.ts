import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  template: `
    <!-- TopAppBar -->
    <header class="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 shadow-sm flex items-center justify-between px-6 h-16">
      <button aria-label="Menu" class="text-on-surface-variant hover:text-primary transition-colors duration-300 active:scale-95 flex items-center justify-center p-2 rounded-full">
        <span class="material-symbols-outlined text-[24px]">menu</span>
      </button>
      <h1 class="font-display text-xl md:text-2xl text-primary tracking-tight font-semibold">15 Anos da Victória</h1>
      <div class="w-10"></div> 
    </header>

    <!-- Main Content -->
    <main class="flex-grow pt-16 min-h-screen">
      <router-outlet></router-outlet>
    </main>

    <!-- Footer -->
    <footer class="w-full bg-surface-container-low flex flex-col items-center gap-6 py-12 px-6 text-center pb-32 md:pb-12">
      <h3 class="font-display text-2xl text-primary">Com carinho, Victória • 2026</h3>
      <nav class="flex flex-wrap justify-center gap-6">
        <a class="text-on-surface-variant hover:text-primary transition-all duration-300 opacity-80 hover:opacity-100 cursor-pointer">Localização</a>
        <a class="text-on-surface-variant hover:text-primary transition-all duration-300 opacity-80 hover:opacity-100 cursor-pointer">Traje</a>
        <a class="text-on-surface-variant hover:text-primary transition-all duration-300 opacity-80 hover:opacity-100 cursor-pointer">Presentes</a>
      </nav>
    </footer>

    <!-- BottomNavBar (Mobile Only) -->
    <nav class="fixed bottom-0 left-0 w-full flex justify-around items-center py-2 px-4 bg-surface/80 backdrop-blur-md border-t border-outline-variant/30 shadow-[0_-8px_30px_rgba(183,110,121,0.12)] z-50 rounded-t-xl md:hidden">
      <a class="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 active:scale-90 transition-transform duration-200 cursor-pointer">
        <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">home</span>
        <span class="text-xs mt-1">Início</span>
      </a>
      <a class="flex flex-col items-center justify-center text-on-surface-variant hover:bg-secondary-container/50 transition-all rounded-full px-4 py-1 active:scale-90 duration-200 cursor-pointer">
        <span class="material-symbols-outlined">auto_awesome</span>
        <span class="text-xs mt-1">Convite</span>
      </a>
      <a class="flex flex-col items-center justify-center text-on-surface-variant hover:bg-secondary-container/50 transition-all rounded-full px-4 py-1 active:scale-90 duration-200 cursor-pointer">
        <span class="material-symbols-outlined">location_on</span>
        <span class="text-xs mt-1">Local</span>
      </a>
      <a class="flex flex-col items-center justify-center text-on-surface-variant hover:bg-secondary-container/50 transition-all rounded-full px-4 py-1 active:scale-90 duration-200 cursor-pointer">
        <span class="material-symbols-outlined">how_to_reg</span>
        <span class="text-xs mt-1">RSVP</span>
      </a>
    </nav>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
  `]
})
export class App {
  auth = inject(AuthService);
}
