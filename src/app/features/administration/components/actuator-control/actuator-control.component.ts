import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActuatorService } from '../../services/actuator.service';
import { DashboardService } from '../../../dashboard/services/dashboard.service';
import { ClientService } from 'src/app/shared/services/client.service';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-actuator-control',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './actuator-control.component.html',
  styleUrls: ['./actuator-control.component.scss']
})
export class ActuatorControlComponent implements OnInit, OnDestroy {
  private actuatorService = inject(ActuatorService);
  private dashboardService = inject(DashboardService);
  private clientService = inject(ClientService);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);

  lucesEncendidas = signal(false);
  ventiladoresEncendidos = signal(false);
  humidificadorEncendido = signal(false);
  motorEncendido = signal(false);
  latestTemperature: number | undefined;
  latestHumidity: number | undefined;
  intervalId: any;

  minTemperatureSet: number | undefined;
  maxTemperatureSet: number | undefined;
  minHumiditySet: number | undefined;
  maxHumiditySet: number | undefined;

  mode: 'automatico' | 'manual' = 'automatico';

  temperatureForm: FormGroup = this.fb.group({
    minTemperature: ['', [Validators.required, Validators.min(10), Validators.max(30)]],
    maxTemperature: ['', [Validators.required, Validators.min(10), Validators.max(30), this.maxGreaterThanMin('minTemperature')]]
  });

  humidityForm: FormGroup = this.fb.group({
    minHumidity: ['', [Validators.required, Validators.min(40), Validators.max(90)]],
    maxHumidity: ['', [Validators.required, Validators.min(40), Validators.max(90), this.maxGreaterThanMin('minHumidity')]]
  });

  constructor() {
    this.temperatureForm = this.fb.group({
      minTemperature: ['', [Validators.required, Validators.min(10), Validators.max(30)]],
      maxTemperature: ['', [Validators.required, Validators.min(10), Validators.max(30), this.maxGreaterThanMin('minTemperature')]]
    });

    this.humidityForm = this.fb.group({
      minHumidity: ['', [Validators.required, Validators.min(40), Validators.max(90)]],
      maxHumidity: ['', [Validators.required, Validators.min(40), Validators.max(90), this.maxGreaterThanMin('minHumidity')]]
    });
  }

  ngOnInit(): void {
    this.getAppState();
    this.fetchSensorData();
    this.fetchActuatorStates();
    this.fetchIdealParams();
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

  setMode(mode: 'automatico' | 'manual'): void {
    this.mode = mode;
    this.updateAppState(mode);
    if (mode === 'manual') {
      this.fetchActuatorStates();
    }
  }

  async getAppState(): Promise<void> {
    try {
      const response = await this.dashboardService.getAppState(this.clientService.getCurrentClientId()).toPromise();
      if (response) {
        this.mode = response.mode;
      }
    } catch (error) {
      console.error('Error al obtener el estado de la aplicación:', error);
    }
  }

  updateAppState(mode: 'automatico' | 'manual'): void {
    this.dashboardService.updateAppState(this.clientService.getCurrentClientId(), mode).subscribe(() => {
      console.log('Estado de la aplicación actualizado exitosamente');
    }, error => {
      console.error('Error al actualizar el estado de la aplicación:', error);
    });
  }

  fetchSensorData() {
    const clientId = this.clientService.getCurrentClientId();
    const endpoint = this.mode === 'automatico' ? 
      this.dashboardService.getSht3xUrlData(clientId, 1, 10, false) : 
      this.dashboardService.getSht3xUrlDataManual(clientId, 1, 10, false);
    
    endpoint.subscribe(data => {
      data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      this.latestHumidity = data[0].humidity;
      this.latestTemperature = data[0].temperature;
    });
  }

  fetchActuatorStates() {
    const clientId = this.clientService.getCurrentClientId();
    this.dashboardService.getActuators(clientId, 1, 10, false).subscribe(data => {
      const luces = data.find((actuator: any) => actuator.name === 'Iluminacion');
      const ventiladores = data.find((actuator: any) => actuator.name === 'Ventilacion');
      const humidificador = data.find((actuator: any) => actuator.name === 'Humidificador');
      const motor = data.find((actuator: any) => actuator.name === 'Motor');
      this.lucesEncendidas.set(luces.state === 'true');
      this.ventiladoresEncendidos.set(ventiladores.state === 'true');
      this.humidificadorEncendido.set(humidificador.state === 'true');
      this.motorEncendido.set(motor.state === 'true');
    });
  }

  fetchIdealParams() {
    const clientId = this.clientService.getCurrentClientId();
    this.actuatorService.getIdealParams(clientId, 'temperatura').subscribe(data => {
      this.minTemperatureSet = data.min_value;
      this.maxTemperatureSet = data.max_value;
    });

    this.actuatorService.getIdealParams(clientId, 'humedad').subscribe(data => {
      this.minHumiditySet = data.min_value;
      this.maxHumiditySet = data.max_value;
    });
  }

  toggleLuces() {
    const clientId = this.clientService.getCurrentClientId();
    this.lucesEncendidas.update(value => !value);
    const command = this.lucesEncendidas() ? 'true' : 'false';
    this.actuatorService.lightControl(clientId, command).subscribe(response => {
      console.log(response.message);
    }, error => {
      console.error(error);
    });
  }

  toggleVentiladores() {
    const clientId = this.clientService.getCurrentClientId();
    this.ventiladoresEncendidos.update(value => !value);
    const command = this.ventiladoresEncendidos() ? 'true' : 'false';
    this.actuatorService.fanControl(clientId, command).subscribe(response => {
      console.log(response.message);
    }, error => {
      console.error(error);
    });
  }

  toggleHumidificador() {
    const clientId = this.clientService.getCurrentClientId();
    this.humidificadorEncendido.update(value => !value);
    const command = this.humidificadorEncendido() ? 'true' : 'false';
    this.actuatorService.humidifierControl(clientId, command).subscribe(response => {
      console.log(response.message);
    }, error => {
      console.error(error);
    });
  }

  toggleMotor() {
    const clientId = this.clientService.getCurrentClientId();
    this.motorEncendido.update(value => !value);
    const command = this.motorEncendido() ? 'true' : 'false';
    this.actuatorService.motorControl(clientId, command).subscribe(response => {
      console.log(response.message);
    }, error => {
      console.error(error);
    });
  }

  maxGreaterThanMin(controlName: string) {
    return (group: FormGroup) => {
      const min = group.get(controlName)?.value;
      const max = group.get(controlName === 'minTemperature' ? 'maxTemperature' : 'maxHumidity')?.value;
      if (min && max && max <= min) {
        return { maxGreaterThanMin: true };
      }
      return null;
    };
  }

  setTemperature() {
    if (this.temperatureForm.invalid) {
      this.temperatureForm.markAllAsTouched();
      return;
    }
    const clientId = this.clientService.getCurrentClientId();
    const { minTemperature, maxTemperature } = this.temperatureForm.value;
    const temperatureParams = {
      min_value: minTemperature,
      max_value: maxTemperature
    };
    this.actuatorService.putIdealParams(clientId, 'temperatura', temperatureParams).subscribe(response => {
      console.log('Temperatura actualizada:', response);
      this.fetchIdealParams();
      this.temperatureForm.reset();
    }, error => {
      console.error('Error al actualizar la temperatura:', error);
    });
  }

  setHumidity() {
    if (this.humidityForm.invalid) {
      this.humidityForm.markAllAsTouched();
      return;
    }
    const clientId = this.clientService.getCurrentClientId();
    const { minHumidity, maxHumidity } = this.humidityForm.value;
    const humidityParams = {
      min_value: minHumidity,
      max_value: maxHumidity
    };
    this.actuatorService.putIdealParams(clientId, 'humedad', humidityParams).subscribe(response => {
      console.log('Humedad actualizada:', response);
      this.fetchIdealParams();
      this.humidityForm.reset();
    }, error => {
      console.error('Error al actualizar la humedad:', error);
    });
  }

  getTemperatureStatus(): string {
    if (!this.latestTemperature || !this.minTemperatureSet || !this.maxTemperatureSet) {
      return 'Desconocido';
    }
    if (this.latestTemperature < this.minTemperatureSet) {
      return 'Bajo';
    }
    if (this.latestTemperature > this.maxTemperatureSet) {
      return 'Alto';
    }
    return 'Ideal';
  }

  getHumidityStatus(): string {
    if (!this.latestHumidity || !this.minHumiditySet || !this.maxHumiditySet) {
      return 'Desconocido';
    }
    if (this.latestHumidity < this.minHumiditySet) {
      return 'Bajo';
    }
    if (this.latestHumidity > this.maxHumiditySet) {
      return 'Alto';
    }
    return 'Ideal';
  }

  isTemperatureIdeal(): boolean {
    return this.getTemperatureStatus() === 'Ideal';
  }

  isHumidityIdeal(): boolean {
    return this.getHumidityStatus() === 'Ideal';
  }
}
