import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActuatorService } from '../../services/actuator.service';
import { DashboardService } from '../../../dashboard/services/dashboard.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-actuator-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './actuator-control.component.html',
  styleUrls: ['./actuator-control.component.scss']
})
export class ActuatorControlComponent implements OnInit, OnDestroy {
  private actuatorService = inject(ActuatorService);
  private dashboardService = inject(DashboardService);

  lucesEncendidas = signal(false);
  ventiladoresEncendidos: boolean = false;
  humidificadorEncendido: boolean = false;
  desiredTemperature!: number;
  desiredHumidity!: number;
  latestTemperature: number | undefined;
  latestHumidity: number | undefined;
  intervalId: any;

  ngOnInit(): void {
    this.fetchSensorData();
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
    this.dashboardService.getSensorData(1, 10, false).subscribe(data => {
      data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      this.latestTemperature = data[0].temperature;
      this.latestHumidity = data[0].humidity;
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
    this.ventiladoresEncendidos = !this.ventiladoresEncendidos;
  }

  toggleHumidificador() {
    this.humidificadorEncendido = !this.humidificadorEncendido;
  }

  setTemperature() {
    console.log(`Temperatura establecida a: ${this.desiredTemperature}°C`);
    // Lógica para establecer la temperatura
  }

  setHumidity() {
    console.log(`Humedad establecida a: ${this.desiredHumidity}%`);
    // Lógica para establecer la humedad
  }
}
