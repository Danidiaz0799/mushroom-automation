import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientService } from '../../../../shared/services/client.service';
import { AuthService } from '../../../auth/services/auth.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ClientSelectorComponent } from '../../../../shared/components/client-selector/client-selector.component';

@Component({
  selector: 'app-client-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ClientSelectorComponent],
  templateUrl: './client-management.component.html'
})
export class ClientManagementComponent implements OnInit {
  clients: any[] = [];
  isLoading = true;
  showAddForm = false;
  newClientForm: FormGroup;
  formSubmitted = false;
  error: string | null = null;
  success: string | null = null;

  constructor(
    private authService: AuthService,
    private clientService: ClientService,
    private fb: FormBuilder
  ) {
    this.newClientForm = this.fb.group({
      client_id: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9_-]+$')]],
      name: ['', Validators.required],
      description: ['']
    });
  }

  ngOnInit(): void {
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
        this.error = 'Error al cargar los cultivos. Por favor, intente nuevamente.';
      }
    });
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.newClientForm.reset();
      this.formSubmitted = false;
      this.error = null;
      this.success = null;
    }
  }

  registerClient(): void {
    this.formSubmitted = true;
    this.error = null;
    this.success = null;
    
    if (this.newClientForm.valid) {
      const clientData = this.newClientForm.value;
      
      this.authService.registerClient(clientData).subscribe({
        next: () => {
          this.success = 'Cultivo registrado con éxito.';
          this.loadClients();
          this.newClientForm.reset();
          this.formSubmitted = false;
          setTimeout(() => {
            this.showAddForm = false;
            this.success = null;
          }, 3000);
        },
        error: (err) => {
          console.error('Error al registrar cultivo:', err);
          this.error = 'Error al registrar el cultivo. Por favor, intente nuevamente.';
        }
      });
    }
  }

  updateClientStatus(client: any): void {
    const newStatus = client.status === 'online' ? 'offline' : 'online';
    
    this.authService.updateClientStatus(client.client_id, { status: newStatus }).subscribe({
      next: () => {
        client.status = newStatus;
        if (newStatus === 'online') {
          client.manually_disabled = false;
        } else {
          client.manually_disabled = true;
        }
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        this.error = 'Error al actualizar el estado del cultivo.';
        setTimeout(() => this.error = null, 3000);
      }
    });
  }

  setAsCurrentClient(client: any): void {
    this.clientService.setCurrentClientId(client.client_id);
  }

  getSelectedClientId(): string {
    return this.clientService.getCurrentClientId();
  }

  getCurrentClientName(): string {
    const currentClientId = this.getSelectedClientId();
    const currentClient = this.clients.find(client => client.client_id === currentClientId);
    return currentClient ? currentClient.name : '';
  }
} 