import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActuatorService } from '../../services/actuator.service';
import { DashboardService } from '../../../dashboard/services/dashboard.service';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';

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

  lucesEncendidas = signal(false);
  ventiladoresEncendidos = signal(false);
  latestTemperature: number | undefined;
  latestHumidity: number | undefined;
  intervalId: any;

  minTemperatureSet: number | undefined;
  maxTemperatureSet: number | undefined;
  minHumiditySet: number | undefined;
  maxHumiditySet: number | undefined;

  temperatureForm: FormGroup = this.fb.group({
    minTemperature: ['', [Validators.required, Validators.min(10), Validators.max(30)]],
    maxTemperature: ['', [Validators.required, Validators.min(10), Validators.max(30), this.maxGreaterThanMin('minTemperature')]]
  });

  humidityForm: FormGroup = this.fb.group({
    minHumidity: ['', [Validators.required, Validators.min(40), Validators.max(110)]],
    maxHumidity: ['', [Validators.required, Validators.min(40), Validators.max(110), this.maxGreaterThanMin('minHumidity')]]
  });

  ngOnInit(): void {
    this.fetchSensorData();
    this.fetchActuatorStates();
    this.fetchIdealParams();
    this.intervalId = setInterval(() => {
      this.fetchSensorData();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  fetchSensorData() {
    this.dashboardService.getDht11Data(1, 10, false).subscribe(data => {
      data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      this.latestHumidity = data[0].humidity;
    });

    this.dashboardService.getBmp280Data(1, 10, false).subscribe(data => {
      data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      this.latestTemperature = data[0].temperature;
    });
  }

  fetchActuatorStates() {
    this.dashboardService.getActuators(1, 10, false).subscribe(data => {
      const luces = data.find((actuator: any) => actuator.name === 'Iluminacion');
      const ventiladores = data.find((actuator: any) => actuator.name === 'Ventilacion');
      this.lucesEncendidas.set(luces.state === 1);
      this.ventiladoresEncendidos.set(ventiladores.state === 1);
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
    const command = this.lucesEncendidas() ? true : false;
    this.actuatorService.lightControl(command).subscribe(response => {
      console.log(response.message);
    }, error => {
      console.error(error);
    });
  }

  toggleVentiladores() {
    this.ventiladoresEncendidos.update(value => !value);
    const command = this.ventiladoresEncendidos() ? true : false;
    this.actuatorService.fanControl(command).subscribe(response => {
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
}
