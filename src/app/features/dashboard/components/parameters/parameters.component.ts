import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { ActuatorService } from '../../../administration/services/actuator.service';

@Component({
  selector: 'app-parameters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parameters.component.html',
})
export class ParametersComponent implements OnInit, OnDestroy {
  @Input() latestTemperature: number | undefined;
  @Input() latestHumidity: number | undefined;
  @Input() latestUpdate: string | undefined;
  @Input() latestLightLevel: number | undefined;
  illuminationState: string = 'Desconocido';
  ventilationState: string = 'Desconocido';
  humidifierState: string = 'Desconocido';
  motorState: string = 'Desconocido';
  errorMessage: string | undefined;
  intervalId: any;
  minTemperatureSet: number | undefined;
  maxTemperatureSet: number | undefined;
  minHumiditySet: number | undefined;
  maxHumiditySet: number | undefined;

  constructor(private dashboardService: DashboardService, private actuatorService: ActuatorService) {}

  ngOnInit(): void {
    this.fetchActuatorStates();
    this.fetchIdealParams();
    this.intervalId = setInterval(() => {
      this.fetchActuatorStates();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
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

  fetchActuatorStates() {
    this.dashboardService.getActuators(1, 10, false).subscribe(data => {
      const luces = data.find((actuator: any) => actuator.name === 'Iluminacion');
      const ventiladores = data.find((actuator: any) => actuator.name === 'Ventilacion');
      const humidificador = data.find((actuator: any) => actuator.name === 'Humidificador');
      const motor = data.find((actuator: any) => actuator.name === 'Motor');
      this.illuminationState = luces.state === 'true' ? 'Encendido' : 'Apagado';
      this.ventilationState = ventiladores.state === 'true' ? 'Encendido' : 'Apagado';
      this.humidifierState = humidificador.state === 'true' ? 'Encendido' : 'Apagado';
      this.motorState = motor.state === 'true' ? 'Encendido' : 'Apagado';
      if (luces.light_level !== undefined) {
        this.latestLightLevel = luces.light_level;
      }
    }, error => {
      this.errorMessage = error;
    });
  }
}
