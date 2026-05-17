import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="w-full flex flex-col gap-4">
      <div class="relative w-full">
        <label class="sr-only">Nome ou Telefone</label>
        <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <span class="material-symbols-outlined text-outline">search</span>
        </div>
        <input 
          class="w-full pl-12 pr-4 py-4 bg-surface-container border border-outline-variant/60 rounded-xl font-body text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 shadow-sm"
          type="text" 
          [(ngModel)]="searchTerm" 
          placeholder="Digite seu Nome ou Telefone..."
          (keyup.enter)="onSearch()"
          (input)="applyMask($event)"
        />
      </div>
      <button 
        (click)="onSearch()" 
        class="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl font-semibold uppercase tracking-widest hover:shadow-xl active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 shadow-lg"
      >
        Buscar Meu Convite
        <span class="material-symbols-outlined text-[20px]">arrow_forward</span>
      </button>
    </div>
  `
})
export class SearchInputComponent {
  searchTerm = '';
  search = output<string>();

  applyMask(event: any) {
    let value = event.target.value.replace(/\D/g, "");
    if (value.length > 0 && /^\d+$/.test(value)) {
      if (value.length <= 11) {
        value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
        if (value.length > 9) {
            value = value.replace(/(\d{1})(\d{4})(\d{4})$/, "$1 $2-$3");
        }
      }
    } else {
        value = event.target.value;
    }
    this.searchTerm = value;
  }

  onSearch() {
    if (this.searchTerm.trim()) {
      this.search.emit(this.searchTerm.trim());
    }
  }
}
