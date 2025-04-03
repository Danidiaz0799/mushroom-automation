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
  showEditForm = false;
  editClientForm: FormGroup;
  editingClientId: string | null = null;
  confirmDeleteClientId: string | null = null;

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

    this.editClientForm = this.fb.group({
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

  openEditForm(client: any): void {
    this.editingClientId = client.client_id;
    this.showEditForm = true;
    this.editClientForm.patchValue({
      name: client.name,
      description: client.description || ''
    });
    this.error = null;
    this.success = null;
  }

  closeEditForm(): void {
    this.showEditForm = false;
    this.editingClientId = null;
    this.editClientForm.reset();
    this.error = null;
    this.success = null;
  }

  updateClient(): void {
    this.formSubmitted = true;
    this.error = null;
    this.success = null;
    
    if (this.editClientForm.valid && this.editingClientId) {
      const clientData = this.editClientForm.value;
      
      this.authService.updateClientInfo(this.editingClientId, clientData).subscribe({
        next: () => {
          this.success = 'Cultivo actualizado con éxito.';
          this.loadClients();
          
          // Si actualizamos el cultivo actualmente seleccionado, actualizamos la UI
          if (this.editingClientId === this.getSelectedClientId()) {
            const updatedClient = this.clients.find(client => client.client_id === this.editingClientId);
            if (updatedClient) {
              updatedClient.name = clientData.name;
              updatedClient.description = clientData.description;
            }
          }
          
          setTimeout(() => {
            this.closeEditForm();
            this.success = null;
          }, 3000);
        },
        error: (err) => {
          console.error('Error al actualizar cultivo:', err);
          this.error = 'Error al actualizar el cultivo. Por favor, intente nuevamente.';
        }
      });
    }
  }

  showDeleteConfirmation(clientId: string): void {
    this.confirmDeleteClientId = clientId;
  }

  cancelDelete(): void {
    this.confirmDeleteClientId = null;
  }

  deleteClient(clientId: string): void {
    this.error = null;
    this.success = null;
    
    this.authService.deleteClient(clientId).subscribe({
      next: () => {
        // Cerrar modal inmediatamente
        this.confirmDeleteClientId = null;
        
        // Si eliminamos el cultivo actualmente seleccionado, cambiamos a otro
        if (clientId === this.getSelectedClientId()) {
          // Encuentra otro cultivo para seleccionar
          const otherClient = this.clients.find(client => client.client_id !== clientId);
          if (otherClient) {
            this.clientService.setCurrentClientId(otherClient.client_id);
          }
        }
        
        // Actualizar lista de clientes y mostrar mensaje de éxito
        this.loadClients();
        this.success = 'Cultivo eliminado con éxito.';
        
        // Limpiar mensaje después de un tiempo
        setTimeout(() => {
          this.success = null;
        }, 3000);
      },
      error: (err) => {
        console.error('Error al eliminar cultivo:', err);
        
        // Cerrar modal inmediatamente
        this.confirmDeleteClientId = null;
        
        // Actualizar lista de clientes de todos modos
        this.loadClients();
        
        // Mostrar mensaje de error adecuado
        if (err?.error?.error && err.error.error.includes('no such table: sensor_data')) {
          this.error = 'No se pudo eliminar el cultivo debido a un problema con la base de datos. Contacte al administrador del sistema.';
        } else {
          this.error = 'Error al eliminar el cultivo. Por favor, intente nuevamente.';
        }
        
        // Limpiar mensaje después de un tiempo
        setTimeout(() => {
          this.error = null;
        }, 3000);
      }
    });
  }
} 