import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActuatorService } from '../../services/actuator.service';
import { DashboardService } from '../../../dashboard/services/dashboard.service';
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
    minHumidity: ['', [Validators.required, Validators.min(40), Validators.max(110)]],
    maxHumidity: ['', [Validators.required, Validators.min(40), Validators.max(110), this.maxGreaterThanMin('minHumidity')]]
  });

  ngOnInit(): void {
    this.getAppState().then(() => {
      this.fetchSensorData();
      this.fetchActuatorStates();
      this.fetchIdealParams();
      this.intervalId = setInterval(() => {
        this.fetchSensorData();
      }, 5000);
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  async getAppState(): Promise<void> {
    try {
      const response = await this.dashboardService.getAppState().toPromise();
      if (response) {
        this.mode = response.mode;
      }
    } catch (error) {
      console.error('Error al obtener el estado de la aplicación:', error);
    }
  }

  updateAppState(mode: 'automatico' | 'manual'): void {
    this.dashboardService.updateAppState(mode).subscribe(() => {
      console.log('Estado de la aplicación actualizado exitosamente');
    }, error => {
      console.error('Error al actualizar el estado de la aplicación:', error);
    });
  }

  fetchSensorData() {
    const endpoint = this.mode === 'automatico' ? this.dashboardService.getSht3xUrlData(1, 10, false) : this.dashboardService.getSht3xUrlDataManual(1, 10, false);
    
    endpoint.subscribe(data => {
      data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      this.latestHumidity = data[0].humidity;
      this.latestTemperature = data[0].temperature;
    });
  }

  fetchActuatorStates() {
    this.dashboardService.getActuators(1, 10, false).subscribe(data => {
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
    this.actuatorService.getIdealParams('temperatura').subscribe(data => {
      this.minTemperatureSet = data.min_value;
      this.maxTemperatureSet = data.max_value;
    });

    this.actuatorService.getIdealParams('humedad').subscribe(data => {
      this.minHumiditySet = data.min_value;
      this.maxHumiditySet = data.max_value;
    });
  }

  toggleLuces() {
    this.lucesEncendidas.update(value => !value);
    const command = this.lucesEncendidas() ? 'true' : 'false';
    this.actuatorService.lightControl(command).subscribe(response => {
      console.log(response.message);
    }, error => {
      console.error(error);
    });
  }

  toggleVentiladores() {
    this.ventiladoresEncendidos.update(value => !value);
    const command = this.ventiladoresEncendidos() ? 'true' : 'false';
    this.actuatorService.fanControl(command).subscribe(response => {
      console.log(response.message);
    }, error => {
      console.error(error);
    });
  }

  toggleHumidificador() {
    this.humidificadorEncendido.update(value => !value);
    const command = this.humidificadorEncendido() ? 'true' : 'false';
    this.actuatorService.humidifierControl(command).subscribe(response => {
      console.log(response.message);
    }, error => {
      console.error(error);
    });
  }

  toggleMotor() {
    this.motorEncendido.update(value => !value);
    const command = this.motorEncendido() ? 'true' : 'false';
    this.actuatorService.motorControl(command).subscribe(response => {
      console.log(response.message);
    }, error => {
      console.error(error);
    });
  }

  setTemperature() {
    if (this.temperatureForm.invalid) {
      this.temperatureForm.markAllAsTouched();
      return;
    }
    const { minTemperature, maxTemperature } = this.temperatureForm.value;
    const temperatureParams = {
      min_value: minTemperature,
      max_value: maxTemperature
    };
    this.actuatorService.putIdealParams('temperatura', temperatureParams).subscribe(response => {
      console.log('Temperatura actualizada:', response);
      this.fetchIdealParams(); // Recargar los valores establecidos
      this.temperatureForm.reset(); // Limpiar los campos de temperatura
    }, error => {
      console.error('Error al actualizar la temperatura:', error);
    });
  }

  setHumidity() {
    if (this.humidityForm.invalid) {
      this.humidityForm.markAllAsTouched();
      return;
    }
    const { minHumidity, maxHumidity } = this.humidityForm.value;
    const humidityParams = {
      min_value: minHumidity,
      max_value: maxHumidity
    };
    this.actuatorService.putIdealParams('humedad', humidityParams).subscribe(response => {
      console.log('Humedad actualizada:', response);
      this.fetchIdealParams(); // Recargar los valores establecidos
      this.humidityForm.reset(); // Limpiar los campos de humedad
    }, error => {
      console.error('Error al actualizar la humedad:', error);
    });
  }

  setMode(mode: 'automatico' | 'manual') {
    this.mode = mode;
    this.updateAppState(mode); // Actualizar el estado de la aplicación a través del endpoint
    if (mode === 'manual') {
      this.fetchActuatorStates();
    }
  }

  maxGreaterThanMin(minControlName: string) {
    return (control: any) => {
      if (!control.parent) {
        return null;
      }
      const minControl = control.parent.get(minControlName);
      if (minControl && control.value <= minControl.value) {
        return { maxLessThanMin: true };
      }
      return null;
    };
  }

  getTemperatureStatus(): string {
    if (this.latestTemperature === undefined || this.minTemperatureSet === undefined || this.maxTemperatureSet === undefined) {
      return '';
    }
    if (this.latestTemperature < this.minTemperatureSet) {
      return 'Baja';
    } else if (this.latestTemperature > this.maxTemperatureSet) {
      return 'Alta';
    } else {
      return 'Ideal';
    }
  }

  isTemperatureIdeal(): boolean {
    return this.getTemperatureStatus() === 'Ideal';
  }

  getHumidityStatus(): string {
    if (this.latestHumidity === undefined || this.minHumiditySet === undefined || this.maxHumiditySet === undefined) {
      return '';
    }
    if (this.latestHumidity < this.minHumiditySet) {
      return 'Baja';
    } else if (this.latestHumidity > this.maxHumiditySet) {
      return 'Alta';
    } else {
      return 'Ideal';
    }
  }

  isHumidityIdeal(): boolean {
    return this.getHumidityStatus() === 'Ideal';
  }
}
