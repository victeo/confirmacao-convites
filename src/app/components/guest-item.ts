import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { Guest, RSVPStatus } from '../models/rsvp.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-guest-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-between p-4 bg-white/50 border border-outline-variant/30 rounded-2xl transition-all duration-300"
         [class.border-primary/40]="guest().status === RSVPStatus.CONFIRMED"
         [class.opacity-60]="guest().status === RSVPStatus.DECLINED">
      
      <div class="flex flex-col">
        <span class="font-semibold text-on-surface text-lg">{{ guest().name }}</span>
        <span class="text-xs uppercase tracking-widest text-outline">{{ guest().type }}</span>
      </div>

      <div class="flex gap-2">
        <button 
          (click)="updateStatus(RSVPStatus.CONFIRMED)" 
          [class.bg-primary]="guest().status === RSVPStatus.CONFIRMED"
          [class.text-on-primary]="guest().status === RSVPStatus.CONFIRMED"
          [class.bg-surface-container]="guest().status !== RSVPStatus.CONFIRMED"
          class="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-90">
          Vou
        </button>
        <button 
          (click)="updateStatus(RSVPStatus.DECLINED)" 
          [class.bg-secondary]="guest().status === RSVPStatus.DECLINED"
          [class.text-on-secondary]="guest().status === RSVPStatus.DECLINED"
          [class.bg-surface-container]="guest().status !== RSVPStatus.DECLINED"
          class="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 active:scale-90">
          Não vou
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GuestItemComponent {
  guest = input.required<Guest>();
  statusChange = output<RSVPStatus>();
  protected readonly RSVPStatus = RSVPStatus;

  updateStatus(status: RSVPStatus) {
    this.statusChange.emit(status);
  }
}
