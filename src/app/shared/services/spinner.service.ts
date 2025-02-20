import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {
  private isLoading = signal(false);
  isLoading$ = this.isLoading.asReadonly();

  show(): void {
    this.isLoading.set(true);
  }

  hide(): void {
    this.isLoading.set(false);
  }
}
