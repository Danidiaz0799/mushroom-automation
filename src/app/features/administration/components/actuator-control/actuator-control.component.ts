import { Component, inject, signal, OnInit, OnDestroy, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActuatorService } from '../../services/actuator.service';
import { DashboardService } from '../../../dashboard/services/dashboard.service';
import { ClientService } from 'src/app/shared/services/client.service';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ClientSelectorComponent } from 'src/app/shared/components/client-selector/client-selector.component';
import { AuthService } from 'src/app/features/auth/services/auth.service';

@Component({
  selector: 'app-actuator-control',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, ClientSelectorComponent],
  templateUrl: './actuator-control.component.html',
  styleUrls: ['./actuator-control.component.scss']
})
export class ActuatorControlComponent implements OnInit, OnDestroy {
  private actuatorService = inject(ActuatorService);
  private dashboardService = inject(DashboardService);
  public clientService = inject(ClientService);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  // Array para almacenar información de los clientes
  private clients: any[] = [];

  lucesEncendidas = signal(false);
  ventiladoresEncendidos = signal(false);
  humidificadorEncendido = signal(false);
  motorEncendido = signal(false);
  latestTemperature: number | undefined;
  latestHumidity: number | undefined;
  intervalId: any;

  minTemperatureSet: number = 20;
  maxTemperatureSet: number = 30;
  minHumiditySet: number = 40;
  maxHumiditySet: number = 80;

  mode: 'automatico' | 'manual' = 'automatico';

  // Simplificamos completamente los formularios para evitar problemas de validación
  temperatureForm = new FormGroup({
    minTemperature: new FormControl(20, [Validators.required, Validators.min(10), Validators.max(30)]),
    maxTemperature: new FormControl(30, [Validators.required, Validators.min(10), Validators.max(35)])
  });

  humidityForm = new FormGroup({
    minHumidity: new FormControl(40, [Validators.required, Validators.min(30), Validators.max(90)]),
    maxHumidity: new FormControl(80, [Validators.required, Validators.min(40), Validators.max(100)])
  });

  constructor() {
    // Efecto para responder a cambios en el ID del cliente
    effect(() => {
      // Leer el valor de la señal activa el efecto cuando cambia
      const clientId = this.clientService.currentClientId$();
      
      // No llamar a estos métodos durante la construcción
      if (this.intervalId) {
        this.resetData();
        this.getAppState();
        this.fetchSensorData();
        this.fetchActuatorStates();
        this.fetchIdealParams();
        this.loadClients(); // Cargar los clientes cuando cambia el ID
      }
    });
  }

  // Cargar la lista de clientes para obtener información
  loadClients(): void {
    this.authService.getClients().subscribe({
      next: (data) => {
        this.clients = data;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
      }
    });
  }

  // Obtener el nombre del cliente seleccionado
  getCurrentClientName(): string {
    const currentClientId = this.clientService.getCurrentClientId();
    const currentClient = this.clients.find(client => client.client_id === currentClientId);
    return currentClient ? currentClient.name : '';
  }

  ngOnInit(): void {
    this.getAppState();
    this.fetchSensorData();
    this.fetchActuatorStates();
    this.fetchIdealParams();
    this.loadClients(); // Cargar los clientes al inicializar
    
    // Validamos los valores iniciales (esto asegura que los formularios sean válidos desde el inicio)
    this.validateForms();
    
    this.intervalId = setInterval(() => {
      this.fetchSensorData();
      this.fetchActuatorStates();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  resetData(): void {
    // Resetear datos cuando cambia el cliente
    this.latestTemperature = undefined;
    this.latestHumidity = undefined;
    this.lucesEncendidas.set(false);
    this.ventiladoresEncendidos.set(false);
    this.humidificadorEncendido.set(false);
    this.motorEncendido.set(false);
    
    // Reiniciamos los formularios con valores predeterminados seguros
    this.temperatureForm.setValue({
      minTemperature: 20,
      maxTemperature: 30
    });
    
    this.humidityForm.setValue({
      minHumidity: 40,
      maxHumidity: 80
    });
    
    // Aseguramos que los formularios sean válidos después del reinicio
    this.validateForms();
  }

  validateForms(): void {
    // Forzamos la validación inicial de los formularios
    this.temperatureForm.updateValueAndValidity();
    this.humidityForm.updateValueAndValidity();
    
    Object.keys(this.temperatureForm.controls).forEach(key => {
      const control = this.temperatureForm.get(key);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });
    
    Object.keys(this.humidityForm.controls).forEach(key => {
      const control = this.humidityForm.get(key);
      control?.markAsTouched();
      control?.updateValueAndValidity();
    });
  }

  setMode(mode: 'automatico' | 'manual'): void {
    // Primero actualizamos la UI para respuesta inmediata
    this.mode = mode;
    
    const clientId = this.clientService.getCurrentClientId();
    if (!clientId) return;
    
    // Actualizamos el estado en el servidor y esperamos su respuesta antes de obtener datos actualizados
    this.dashboardService.updateAppState(clientId, mode).subscribe({
      next: () => {
        // Solo después de que el servidor confirme el cambio obtenemos los datos actualizados
        // Pequeño retraso para asegurar que el servidor procesó completamente el cambio
        setTimeout(() => {
          // Primero obtenemos los datos de los sensores
          this.fetchSensorData();
          // Después obtenemos los estados de los actuadores
          this.fetchActuatorStates();
        }, 500); // 500ms de retraso para dar tiempo al servidor
      },
      error: (error) => {
        console.error('Error al actualizar el estado de la aplicación:', error);
        // Si hay error, revertimos al modo anterior en la UI
        this.mode = mode === 'automatico' ? 'manual' : 'automatico';
      }
    });
  }

  async getAppState(): Promise<void> {
    try {
      const clientId = this.clientService.getCurrentClientId();
      if (!clientId) return;
      
      const response = await this.dashboardService.getAppState(clientId).toPromise();
      if (response) {
        this.mode = response.mode;
      }
    } catch (error) {
      console.error('Error al obtener el estado de la aplicación:', error);
    }
  }

  fetchSensorData() {
    const clientId = this.clientService.getCurrentClientId();
    if (!clientId) return;
    const endpoint = this.mode === 'automatico' ? 
      this.dashboardService.getSht3xUrlData(clientId, 1, 10, false) : 
      this.dashboardService.getSht3xUrlDataManual(clientId, 1, 10, false);
    
    endpoint.subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          this.latestHumidity = data[0].humidity;
          this.latestTemperature = data[0].temperature;
        }
      },
      error: (error) => {
        console.error('Error al obtener datos de sensores:', error);
      }
    });
  }

  fetchActuatorStates() {
    const clientId = this.clientService.getCurrentClientId();
    if (!clientId) return;
    this.dashboardService.getActuators(clientId, 1, 10, false).subscribe({
      next: (data) => {
        const luces = data.find((actuator: any) => actuator.name === 'Iluminacion');
        const ventiladores = data.find((actuator: any) => actuator.name === 'Ventilacion');
        const humidificador = data.find((actuator: any) => actuator.name === 'Humidificador');
        const motor = data.find((actuator: any) => actuator.name === 'Motor');
        if (luces) this.lucesEncendidas.set(luces.state === 'true');
        if (ventiladores) this.ventiladoresEncendidos.set(ventiladores.state === 'true');
        if (humidificador) this.humidificadorEncendido.set(humidificador.state === 'true');
        if (motor) this.motorEncendido.set(motor.state === 'true');
      },
      error: (error) => {
        console.error('Error al obtener estados de actuadores:', error);
      }
    });
  }

  fetchIdealParams() {
    const clientId = this.clientService.getCurrentClientId();
    if (!clientId) return;
    
    // Obtener parámetros ideales de temperatura
    this.actuatorService.getIdealParams(clientId, 'temperatura').subscribe({
      next: (data) => {
        if (data && data.min_value !== undefined && data.max_value !== undefined) {
          this.minTemperatureSet = data.min_value;
          this.maxTemperatureSet = data.max_value;
          
          // Actualizar el formulario con los valores actuales
          this.temperatureForm.patchValue({
            minTemperature: data.min_value,
            maxTemperature: data.max_value
          }, { emitEvent: true });
          
          // Forzar la validación
          this.temperatureForm.updateValueAndValidity();
          this.temperatureForm.get('minTemperature')?.markAsTouched();
          this.temperatureForm.get('maxTemperature')?.markAsTouched();
        }
      },
      error: (error) => {
        console.error('Error al obtener parámetros ideales de temperatura:', error);
      }
    });

    // Obtener parámetros ideales de humedad
    this.actuatorService.getIdealParams(clientId, 'humedad').subscribe({
      next: (data) => {
        if (data && data.min_value !== undefined && data.max_value !== undefined) {
          this.minHumiditySet = data.min_value;
          this.maxHumiditySet = data.max_value;
          
          // Actualizar el formulario con los valores actuales
          this.humidityForm.patchValue({
            minHumidity: data.min_value,
            maxHumidity: data.max_value
          }, { emitEvent: true });
          
          // Forzar la validación
          this.humidityForm.updateValueAndValidity();
          this.humidityForm.get('minHumidity')?.markAsTouched();
          this.humidityForm.get('maxHumidity')?.markAsTouched();
        }
      },
      error: (error) => {
        console.error('Error al obtener parámetros ideales de humedad:', error);
      }
    });
  }

  toggleLuces() {
    const clientId = this.clientService.getCurrentClientId();
    if (!clientId) return;
    
    this.lucesEncendidas.update(value => !value);
    const command = this.lucesEncendidas() ? 'true' : 'false';
    this.actuatorService.lightControl(clientId, command).subscribe({
      next: (response) => {
        console.log(response.message);
      },
      error: (error) => {
        console.error('Error al controlar luces:', error);
        // Revertir el cambio si hay error
        this.lucesEncendidas.update(value => !value);
      }
    });
  }

  toggleVentiladores() {
    const clientId = this.clientService.getCurrentClientId();
    if (!clientId) return;
    
    this.ventiladoresEncendidos.update(value => !value);
    const command = this.ventiladoresEncendidos() ? 'true' : 'false';
    this.actuatorService.fanControl(clientId, command).subscribe({
      next: (response) => {
        console.log(response.message);
      },
      error: (error) => {
        console.error('Error al controlar ventiladores:', error);
        // Revertir el cambio si hay error
        this.ventiladoresEncendidos.update(value => !value);
      }
    });
  }

  toggleHumidificador() {
    const clientId = this.clientService.getCurrentClientId();
    if (!clientId) return;
    
    this.humidificadorEncendido.update(value => !value);
    const command = this.humidificadorEncendido() ? 'true' : 'false';
    this.actuatorService.humidifierControl(clientId, command).subscribe({
      next: (response) => {
        console.log(response.message);
      },
      error: (error) => {
        console.error('Error al controlar humidificador:', error);
        // Revertir el cambio si hay error
        this.humidificadorEncendido.update(value => !value);
      }
    });
  }

  toggleMotor() {
    const clientId = this.clientService.getCurrentClientId();
    if (!clientId) return;
    
    this.motorEncendido.update(value => !value);
    const command = this.motorEncendido() ? 'true' : 'false';
    this.actuatorService.motorControl(clientId, command).subscribe({
      next: (response) => {
        console.log(response.message);
      },
      error: (error) => {
        console.error('Error al controlar motor:', error);
        // Revertir el cambio si hay error
        this.motorEncendido.update(value => !value);
      }
    });
  }

  setTemperature() {
    const clientId = this.clientService.getCurrentClientId();
    if (!clientId) return;
    
    // Verificamos explícitamente la validez del formulario
    if (this.temperatureForm.valid) {
      const { minTemperature, maxTemperature } = this.temperatureForm.value;
      
      // Verificamos que tenemos valores válidos
      if (minTemperature === null || maxTemperature === null || 
          minTemperature === undefined || maxTemperature === undefined) {
        console.error('Valores de temperatura inválidos');
        return;
      }
      
      // Verificamos que min < max
      if (minTemperature >= maxTemperature) {
        console.error('La temperatura mínima debe ser menor que la máxima');
        return;
      }
      
      const data = {
        min_value: minTemperature,
        max_value: maxTemperature
      };
      
      this.actuatorService.putIdealParams(clientId, 'temperatura', data).subscribe({
        next: () => {
          this.minTemperatureSet = minTemperature;
          this.maxTemperatureSet = maxTemperature;
        },
        error: (error) => {
          console.error('Error al actualizar parámetros de temperatura:', error);
        }
      });
    } else {
      console.error('Formulario de temperatura inválido:', this.temperatureForm.errors);
    }
  }

  setHumidity() {
    const clientId = this.clientService.getCurrentClientId();
    if (!clientId) return;
    
    // Forzamos la validación una vez más
    this.humidityForm.updateValueAndValidity();
    
    // Verificamos explícitamente la validez del formulario
    if (this.humidityForm.valid) {
      const { minHumidity, maxHumidity } = this.humidityForm.value;
      
      // Verificamos que tenemos valores válidos
      if (minHumidity === null || maxHumidity === null ||
          minHumidity === undefined || maxHumidity === undefined) {
        console.error('Valores de humedad inválidos');
        return;
      }
      
      // Verificamos que min < max
      if (minHumidity >= maxHumidity) {
        console.error('La humedad mínima debe ser menor que la máxima');
        return;
      }
      
      const data = {
        min_value: minHumidity,
        max_value: maxHumidity
      };
      
      this.actuatorService.putIdealParams(clientId, 'humedad', data).subscribe({
        next: () => {
          this.minHumiditySet = minHumidity;
          this.maxHumiditySet = maxHumidity;
        },
        error: (error) => {
          console.error('Error al actualizar parámetros de humedad:', error);
        }
      });
    } else {
      console.error('Formulario de humedad inválido:', this.humidityForm.errors);
      Object.keys(this.humidityForm.controls).forEach(key => {
        const control = this.humidityForm.get(key);
        console.error(`Control ${key} errors:`, control?.errors);
      });
    }
  }

  getTemperatureStatus(): string {
    if (!this.latestTemperature || this.minTemperatureSet === undefined || this.maxTemperatureSet === undefined) {
      return 'Sin datos';
    }
    
    if (this.latestTemperature < this.minTemperatureSet) {
      return 'Temperatura baja';
    } else if (this.latestTemperature > this.maxTemperatureSet) {
      return 'Temperatura alta';
    } else {
      return 'Temperatura ideal';
    }
  }

  getHumidityStatus(): string {
    if (!this.latestHumidity || this.minHumiditySet === undefined || this.maxHumiditySet === undefined) {
      return 'Sin datos';
    }
    
    if (this.latestHumidity < this.minHumiditySet) {
      return 'Humedad baja';
    } else if (this.latestHumidity > this.maxHumiditySet) {
      return 'Humedad alta';
    } else {
      return 'Humedad ideal';
    }
  }

  isTemperatureIdeal(): boolean {
    if (!this.latestTemperature || this.minTemperatureSet === undefined || this.maxTemperatureSet === undefined) {
      return false;
    }
    return this.latestTemperature >= this.minTemperatureSet && this.latestTemperature <= this.maxTemperatureSet;
  }

  isHumidityIdeal(): boolean {
    if (!this.latestHumidity || this.minHumiditySet === undefined || this.maxHumiditySet === undefined) {
      return false;
    }
    return this.latestHumidity >= this.minHumiditySet && this.latestHumidity <= this.maxHumiditySet;
  }
}
