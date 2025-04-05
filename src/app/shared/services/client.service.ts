import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  // Clave para almacenar el ID del cliente en localStorage
  private readonly STORAGE_KEY = 'currentClientId';
  
  // Inicializar con el valor almacenado en localStorage o usar el valor por defecto
  private currentClientId = signal<string>(this.getStoredClientId());
  currentClientId$ = this.currentClientId.asReadonly();

  // Obtener el ID del cliente desde localStorage o usar el valor por defecto
  private getStoredClientId(): string {
    const storedId = localStorage.getItem(this.STORAGE_KEY);
    return storedId || 'mushroom1'; // Si no hay valor almacenado, usar el valor por defecto
  }

  setCurrentClientId(clientId: string): void {
    // Guardar en localStorage para persistencia entre recargas
    localStorage.setItem(this.STORAGE_KEY, clientId);
    // Actualizar la señal
    this.currentClientId.set(clientId);
  }

  getCurrentClientId(): string {
    return this.currentClientId();
  }
} 