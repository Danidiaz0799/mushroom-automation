import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientService } from '../../services/client.service';
import { AuthService } from '../../../features/auth/services/auth.service';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-client-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-selector.component.html'
})
export class ClientSelectorComponent implements OnInit {
  clients: any[] = [];
  selectedClientId: string = '';
  isLoading = true;

  constructor(
    private clientService: ClientService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.selectedClientId = this.clientService.getCurrentClientId();
    this.loadClients();
  }

  loadClients(): void {
    this.isLoading = true;
    this.authService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.isLoading = false;
      }
    });
  }

  onClientChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const clientId = selectElement.value;
    this.clientService.setCurrentClientId(clientId);
    this.selectedClientId = clientId;
  }
} 