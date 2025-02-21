import { Component, Input, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { DashboardService } from '../../services/dashboard.service';

Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './charts.component.html'
})
export class ChartsComponent implements AfterViewInit, OnInit, OnDestroy {
  @Input() temperatureData: number[] = [];
  @Input() humidityData: number[] = [];
  @Input() labels: string[] = [];

  temperatureChart: Chart | undefined;
  humidityChart: Chart | undefined;
  intervalId: any;

  constructor(private dashboardService: DashboardService) {}

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
    if (this.temperatureChart) {
      this.temperatureChart.destroy();
    }
    if (this.humidityChart) {
      this.humidityChart.destroy();
    }
  }

  ngAfterViewInit(): void {
    this.renderTemperatureChart();
    this.renderHumidityChart();
  }

  fetchSensorData() {
    this.dashboardService.getSensorData(1, 10).subscribe(data => {
      data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      this.temperatureData = data.map((item: any) => item.temperature);
      this.humidityData = data.map((item: any) => item.humidity);
      this.labels = data.map((item: any) => new Date(item.timestamp).toLocaleString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));

      if (this.temperatureChart) {
        this.updateTemperatureChart();
      } else {
        this.renderTemperatureChart();
      }

      if (this.humidityChart) {
        this.updateHumidityChart();
      } else {
        this.renderHumidityChart();
      }
    });
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
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              fill: true,
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: 'rgba(54, 54, 54, 1)'
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: 'rgba(54, 54, 54, 1)'
              }
            },
            y: {
              beginAtZero: false,
              ticks: {
                color: 'rgba(54, 54, 54, 1)'
              }
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
              tension: 0.4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: 'rgba(54, 54, 54, 1)'
              }
            }
          },
          scales: {
            x: {
              ticks: {
                color: 'rgba(54, 54, 54, 1)'
              }
            },
            y: {
              beginAtZero: false,
              ticks: {
                color: 'rgba(54, 54, 54, 1)'
              }
            }
          }
        }
      });
    }
  }

  updateTemperatureChart() {
    if (this.temperatureChart) {
      this.temperatureChart.data.labels = this.labels;
      this.temperatureChart.data.datasets[0].data = this.temperatureData;
      this.temperatureChart.update();
    }
  }

  updateHumidityChart() {
    if (this.humidityChart) {
      this.humidityChart.data.labels = this.labels;
      this.humidityChart.data.datasets[0].data = this.humidityData;
      this.humidityChart.update();
    }
  }
}
