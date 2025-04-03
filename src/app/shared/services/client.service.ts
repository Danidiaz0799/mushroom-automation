import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private currentClientId = signal<string>('mushroom1'); // Default client ID
  currentClientId$ = this.currentClientId.asReadonly();

  setCurrentClientId(clientId: string): void {
    this.currentClientId.set(clientId);
  }

  getCurrentClientId(): string {
    return this.currentClientId();
  }
} 