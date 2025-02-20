import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { SpinnerService } from '../../services/spinner.service';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isLoading$ | async" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
    </div>
  `,
})
export class SpinnerComponent {
  private spinnerService = inject(SpinnerService);
  isLoading$ = toObservable(this.spinnerService.isLoading$);
}
