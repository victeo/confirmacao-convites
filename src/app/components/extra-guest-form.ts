import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-extra-guest-form',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="w-full p-6 bg-primary-container/10 border border-primary/20 rounded-2xl mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
      <div class="flex items-center gap-3 mb-4">
        <span class="material-symbols-outlined text-primary">person_add</span>
        <h3 class="font-display text-xl text-primary font-semibold">Acompanhante Extra</h3>
      </div>
      
      <p class="text-sm text-on-surface-variant mb-4">
        Você ainda possui <span class="font-bold text-primary">{{ remaining() }}</span> vaga(s) para acompanhantes extras.
      </p>
      
      <div class="flex gap-2">
        <input 
          type="text" 
          [(ngModel)]="newName" 
          placeholder="Nome do acompanhante..."
          class="flex-1 px-4 py-3 bg-white border border-outline-variant/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          [disabled]="remaining() <= 0"
        />
        <button 
          (click)="onAdd()" 
          [disabled]="!newName.trim() || remaining() <= 0"
          class="bg-primary text-on-primary px-6 py-3 rounded-xl font-bold hover:shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
        >
          Incluir
        </button>
      </div>
    </div>
  `
})
export class ExtraGuestFormComponent {
  remaining = input.required<number>();
  addExtra = output<string>();

  newName = '';

  onAdd() {
    if (this.newName.trim() && this.remaining() > 0) {
      this.addExtra.emit(this.newName.trim());
      this.newName = '';
    }
  }
}
