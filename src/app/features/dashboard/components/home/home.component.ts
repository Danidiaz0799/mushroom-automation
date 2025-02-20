import { Component, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit {
  temperatureChart: Chart | undefined;
  humidityChart: Chart | undefined;

  temperatureData: number[] = [];
  humidityData: number[] = [];
  labels: string[] = [];
  latestTemperature: number | undefined;
  latestHumidity: number | undefined;
  latestUpdate: string | undefined;
  events: any[] = [];
  actuators: any[] = [];
  illuminationState: string = 'Desconocido';
  ventilationState: string = 'Desconocido';

  constructor(private dashboardService: DashboardService) {}

  ngAfterViewInit(): void {
    this.fetchSensorData();
    this.fetchEvents();
    this.fetchActuators();
  }

  fetchSensorData() {
    this.dashboardService.getSensorData(1, 10).subscribe(data => {
      data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      this.temperatureData = data.map((item: any) => item.temperature);
      this.humidityData = data.map((item: any) => item.humidity);
      this.labels = data.map((item: any) => new Date(item.timestamp).toLocaleTimeString());

      this.latestTemperature = this.temperatureData[0];
      this.latestHumidity = this.humidityData[0];
      this.latestUpdate = this.formatTimestamp(data[0].timestamp);

      this.renderTemperatureChart();
      this.renderHumidityChart();
    });
  }

  fetchEvents() {
    this.dashboardService.getEvents(1, 10).subscribe(data => {
      this.events = data.map((event: any) => ({
        ...event,
        formattedTimestamp: this.formatTimestamp(event.timestamp)
      }));
    });
  }

  fetchActuators() {
    this.dashboardService.getActuators(1, 10).subscribe(data => {
      this.actuators = data;
      const illumination = this.actuators.find(actuator => actuator.name === 'Iluminación');
      const ventilation = this.actuators.find(actuator => actuator.name === 'Ventilación');
      this.illuminationState = illumination ? (illumination.state ? 'Encendida' : 'Apagada') : 'Desconocido';
      this.ventilationState = ventilation ? (ventilation.state ? 'Encendida' : 'Apagada') : 'Desconocido';
    });
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour12: true
    };
    return date.toLocaleString('es-ES', options);
  }

  renderTemperatureChart() {
    const ctx = document.getElementById('temperatureChart') as HTMLCanvasElement;
    if (ctx) {
      this.temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.labels,
          datasets: [
            {
              label: 'Temperatura (°C)',
              data: this.temperatureData,
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              fill: true,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true
            }
          },
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });
    }
  }

  renderHumidityChart() {
    const ctx = document.getElementById('humidityChart') as HTMLCanvasElement;
    if (ctx) {
      this.humidityChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.labels,
          datasets: [
            {
              label: 'Humedad (%)',
              data: this.humidityData,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              fill: true,
              tension: 0.3
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true
            }
          },
          scales: {
            y: {
              beginAtZero: false
            }
          }
        }
      });
    }
  }
}
