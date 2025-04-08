import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClientService } from '../../../../shared/services/client.service';
import { AuthService } from '../../../auth/services/auth.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DashboardService } from '../../../dashboard/services/dashboard.service';
import { ActuatorService } from '../../services/actuator.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export class Client {
  client_id: string = '';
  name: string = '';
  description: string = '';
  status: 'online' | 'offline' = 'offline';
  last_seen: Date = new Date();
  controlMode: 'automatico' | 'manual' = 'automatico';
  idealTemp: string = '';
  idealHumidity: string = '';
  currentTemp: number | null = null;
  currentHumidity: number | null = null;
  currentTempStatus: 'ideal' | 'warning' | 'critical' | 'unknown' = 'unknown';
  currentHumidityStatus: 'ideal' | 'warning' | 'critical' | 'unknown' = 'unknown';
  // Estados de actuadores
  lucesEncendidas: boolean = false;
  ventiladoresEncendidos: boolean = false;
  humidificadorEncendido: boolean = false;
  motorEncendido: boolean = false;
}

@Component({
  selector: 'app-client-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './client-management.component.html'
})
export class ClientManagementComponent implements OnInit {
  clients: Client[] = [];
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
  
  private dashboardService = inject(DashboardService);
  private actuatorService = inject(ActuatorService);

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
        // Obtener información básica de los clientes
        this.clients = data;
        
        // Para cada cliente, obtener datos adicionales
        this.clients.forEach(client => {
          this.enrichClientData(client);
        });
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.isLoading = false;
        this.error = 'Error al cargar los cultivos. Por favor, intente nuevamente.';
      }
    });
  }
  
  enrichClientData(client: any): void {
    // Obtener el modo de control (automático/manual)
    this.dashboardService.getAppState(client.client_id).pipe(
      catchError(error => {
        console.error(`Error al obtener estado para ${client.client_id}:`, error);
        return of({ mode: 'no-definido' });
      })
    ).subscribe(state => {
      client.controlMode = state.mode || 'no-definido';
    });
    
    // Obtener parámetros ideales de temperatura y humedad
    forkJoin({
      temp: this.actuatorService.getIdealParams(client.client_id, 'temperatura').pipe(
        catchError(error => {
          console.error(`Error al obtener parámetros de temperatura para ${client.client_id}:`, error);
          return of({ min_value: 20, max_value: 28 });
        })
      ),
      humidity: this.actuatorService.getIdealParams(client.client_id, 'humedad').pipe(
        catchError(error => {
          console.error(`Error al obtener parámetros de humedad para ${client.client_id}:`, error);
          return of({ min_value: 70, max_value: 90 });
        })
      )
    }).subscribe(params => {
      client.idealTemp = `${params.temp.min_value}-${params.temp.max_value}`;
      client.idealHumidity = `${params.humidity.min_value}-${params.humidity.max_value}`;
      
      // Obtener datos actuales de sensores
      const endpoint = client.controlMode === 'automatico' ? 
        this.dashboardService.getSht3xUrlData(client.client_id, 1, 1, false) : 
        this.dashboardService.getSht3xUrlDataManual(client.client_id, 1, 1, false);
      
      endpoint.pipe(
        catchError(error => {
          console.error(`Error al obtener datos de sensores para ${client.client_id}:`, error);
          return of([]);
        })
      ).subscribe(sensorData => {
        if (sensorData && sensorData.length > 0) {
          // Obtener los valores más recientes
          client.currentTemp = sensorData[0].temperature;
          client.currentHumidity = sensorData[0].humidity;
          
          // Determinar estado basado en los rangos ideales
          const minTemp = params.temp.min_value;
          const maxTemp = params.temp.max_value;
          const minHumidity = params.humidity.min_value;
          const maxHumidity = params.humidity.max_value;
          
          client.currentTempStatus = 
            client.currentTemp < minTemp ? 'warning' : 
            client.currentTemp > maxTemp ? 'critical' : 'ideal';
            
          client.currentHumidityStatus = 
            client.currentHumidity < minHumidity ? 'warning' : 
            client.currentHumidity > maxHumidity ? 'critical' : 'ideal';
        }
      });
    });
    
    // Obtener estados de actuadores
    this.dashboardService.getActuators(client.client_id, 1, 10, false).pipe(
      catchError(error => {
        console.error(`Error al obtener estados de actuadores para ${client.client_id}:`, error);
        return of([]);
      })
    ).subscribe(data => {
      if (data && data.length > 0) {
        const luces = data.find((actuator: any) => actuator.name === 'Iluminacion');
        const ventiladores = data.find((actuator: any) => actuator.name === 'Ventilacion');
        const humidificador = data.find((actuator: any) => actuator.name === 'Humidificador');
        const motor = data.find((actuator: any) => actuator.name === 'Motor');
        
        client.lucesEncendidas = luces?.state === 'true';
        client.ventiladoresEncendidos = ventiladores?.state === 'true';
        client.humidificadorEncendido = humidificador?.state === 'true';
        client.motorEncendido = motor?.state === 'true';
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

  onClientSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const clientId = selectElement.value;
    this.clientService.setCurrentClientId(clientId);
  }

  getSelectedClientId(): string {
    return this.clientService.getCurrentClientId();
  }

  getCurrentClientName(): string {
    const currentClientId = this.getSelectedClientId();
    const currentClient = this.clients.find(client => client.client_id === currentClientId);
    return currentClient ? currentClient.name : '';
  }

  formatNumber(value: number | null): string {
    if (value === null || value === undefined) return '--';
    return value.toFixed(4);
  }

  // Verifica si un valor está dentro del rango ideal
  isInRange(value: number, rangeString: string, type: 'temp' | 'humidity'): boolean {
    if (!rangeString) {
      // Valores predeterminados si no hay rango definido
      if (type === 'temp') rangeString = '20-28';
      else rangeString = '70-90';
    }
    
    const [min, max] = rangeString.split('-').map(n => parseFloat(n));
    return value >= min && value <= max;
  }
  
  // Obtiene la posición inicial del rango ideal como porcentaje (0-100)
  getRangeStart(rangeString: string, type: 'temp' | 'humidity'): number {
    if (!rangeString) {
      // Valores predeterminados si no hay rango definido
      if (type === 'temp') rangeString = '20-28';
      else rangeString = '70-90';
    }
    
    const [min] = rangeString.split('-').map(n => parseFloat(n));
    
    // Convertimos a porcentaje según el tipo
    if (type === 'temp') {
      // Consideramos un rango total de 0-40°C
      return (min / 40) * 100;
    } else {
      // Consideramos un rango total de 0-100%
      return min;
    }
  }
  
  // Obtiene la posición final del rango ideal como porcentaje (0-100)
  getRangeEnd(rangeString: string, type: 'temp' | 'humidity'): number {
    if (!rangeString) {
      // Valores predeterminados si no hay rango definido
      if (type === 'temp') rangeString = '20-28';
      else rangeString = '70-90';
    }
    
    const [_, max] = rangeString.split('-').map(n => parseFloat(n));
    
    // Convertimos a porcentaje según el tipo
    if (type === 'temp') {
      // Consideramos un rango total de 0-40°C
      return (max / 40) * 100;
    } else {
      // Consideramos un rango total de 0-100%
      return max;
    }
  }
  
  // Obtiene el ancho del rango ideal como porcentaje (0-100)
  getRangeWidth(rangeString: string, type: 'temp' | 'humidity'): number {
    return this.getRangeEnd(rangeString, type) - this.getRangeStart(rangeString, type);
  }
  
  // Obtiene la posición del valor actual como porcentaje (0-100)
  getValuePosition(value: number, type: 'temp' | 'humidity'): number {
    // Convertimos a porcentaje según el tipo
    if (type === 'temp') {
      // Consideramos un rango total de 0-40°C
      return (value / 40) * 100;
    } else {
      // Consideramos un rango total de 0-100%
      return value;
    }
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