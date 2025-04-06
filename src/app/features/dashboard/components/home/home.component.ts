import { Component, AfterViewInit, OnDestroy, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParametersComponent } from '../parameters/parameters.component';
import { ChartsComponent } from '../charts/charts.component';
import { EventsComponent } from '../events/events.component';
import { DashboardService } from '../../services/dashboard.service';
import { ClientService } from 'src/app/shared/services/client.service';
import { ClientSelectorComponent } from 'src/app/shared/components/client-selector/client-selector.component';
import { AuthService } from 'src/app/features/auth/services/auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterModule, FormsModule, ParametersComponent, ChartsComponent, EventsComponent, ClientSelectorComponent],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  temperatureData: number[] = [];
  humidityData: number[] = [];
  lightLevelData: number[] = [];
  labels: string[] = [];
  latestTemperature: number | undefined;
  latestHumidity: number | undefined;
  latestLightLevel: number | undefined;
  latestUpdate: string | undefined;
  intervalId: any;
  isAutomatic: boolean = true; // Estado para determinar si está en modo automático
  private dashboardService = inject(DashboardService);
  clientService = inject(ClientService);
  private authService = inject(AuthService);
  
  // Array para almacenar información de los clientes
  clients: any[] = [];

  constructor() {
    // Create an effect to respond to client ID changes with allowSignalWrites: true
    effect(() => {
      // Reading the signal value triggers the effect when it changes
      const clientId = this.clientService.currentClientId$();
      // Limpiar los datos existentes
      this.clearData();
      
      // Don't call these methods during construction
      if (this.intervalId) {
        this.getAppState();
        this.fetchSensorData();
        // Usar una promesa para cargar los clientes sin escribir señales directamente en el efecto
        this.loadClientsInEffect();
      }
    }, { allowSignalWrites: true }); // Permitir escrituras de señales en el efecto
  }

  // Método seguro para llamar en el efecto
  loadClientsInEffect(): void {
    setTimeout(() => {
      this.loadClients().catch(err => console.error('Error loading clients in effect:', err));
    }, 0);
  }

  ngAfterViewInit(): void {
    // Primero cargamos los clientes para asegurar que tenemos la lista actualizada
    this.loadClients().then(() => {
      // Una vez cargados los clientes, obtenemos el estado y los datos del sensor
      this.getAppState();
      this.fetchSensorData();
    });
    
    // Configurar la actualización periódica
    this.intervalId = setInterval(() => {
      this.fetchSensorData();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  // Cargar la lista de clientes para obtener información
  loadClients(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.authService.getClients().subscribe({
        next: (data) => {
          this.clients = data;
          resolve();
        },
        error: (error) => {
          console.error('Error loading clients:', error);
          reject(error); // Rechazar la promesa para mejor manejo de errores
        }
      });
    });
  }

  // Obtener el nombre del cliente seleccionado
  getCurrentClientName(): string {
    const currentClientId = this.clientService.getCurrentClientId();
    const currentClient = this.clients.find(client => client.client_id === currentClientId);
    return currentClient ? currentClient.name : '';
  }

  // Verificar si un cliente está online
  isClientOnline(clientId: string): boolean {
    const client = this.clients.find(c => c.client_id === clientId);
    return client ? client.status === 'online' : false;
  }

  // Manejar la selección de cultivo
  onClientSelect(clientId: string): void {
    // Actualizar el cultivo seleccionado
    this.clientService.setCurrentClientId(clientId);
    
    // Recargar los datos en lugar de recargar la página completa
    this.clearData();
    this.loadClients().then(() => {
      this.getAppState();
      this.fetchSensorData();
    }).catch(err => console.error('Error after client selection:', err));
  }

  clearData(): void {
    // Limpiar todos los datos actuales
    this.temperatureData = [];
    this.humidityData = [];
    this.lightLevelData = [];
    this.labels = [];
    this.latestTemperature = undefined;
    this.latestHumidity = undefined;
    this.latestLightLevel = undefined;
    this.latestUpdate = undefined;
  }

  getAppState(): void {
    this.dashboardService.getAppState(this.clientService.getCurrentClientId()).subscribe({
      next: (response) => {
        this.isAutomatic = response.mode === 'automatico';
        this.fetchSensorData();
      },
      error: (error) => {
        console.error('Error al obtener el estado de la aplicación:', error);
      }
    });
  }

  fetchSensorData() {
    const clientId = this.clientService.getCurrentClientId();
    const endpoint = this.isAutomatic ? 
      this.dashboardService.getSht3xUrlData(clientId, 1, 10, false) : 
      this.dashboardService.getSht3xUrlDataManual(clientId, 1, 10, false);
    
    endpoint.subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

          this.humidityData = data.map((item: any) => item.humidity);
          this.temperatureData = data.map((item: any) => item.temperature);
          this.labels = data.map((item: any) => new Date(item.timestamp).toLocaleTimeString());

          this.latestHumidity = this.humidityData[0];
          this.latestTemperature = this.temperatureData[0];
          this.latestUpdate = this.formatTimestamp(data[0].timestamp);
        } else {
          // Si no hay datos, asegurarse de que los arrays estén vacíos
          this.clearData();
        }
      },
      error: (error) => {
        console.error('Error al obtener datos de sensores:', error);
        // En caso de error, limpiar los datos
        this.clearData();
      }
    });
  }

  formatTimestamp(timestamp: string): string {
    return new Date(timestamp).toLocaleString();
  }
}
