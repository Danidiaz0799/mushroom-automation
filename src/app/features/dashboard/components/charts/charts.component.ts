import { Component, Input, AfterViewInit, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './charts.component.html'
})
export class ChartsComponent implements AfterViewInit, OnInit, OnDestroy, OnChanges {
  @Input() temperatureData: number[] = [];
  @Input() humidityData: number[] = [];
  @Input() labels: string[] = [];
  @Input() lightLevelData: number[] = [];

  temperatureChart: Chart | undefined;
  humidityChart: Chart | undefined;
  lightLevelChart: Chart | undefined;
  intervalId: any;

  constructor() {}

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
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
    if (this.lightLevelChart) {
      this.lightLevelChart.destroy();
    }
  }

  ngAfterViewInit(): void {
    this.renderTemperatureChart();
    this.renderHumidityChart();
    this.renderLightLevelChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['temperatureData'] || changes['humidityData'] || changes['labels'] || changes['lightLevelData']) {
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

      if (this.lightLevelChart) {
        this.updateLightLevelChart();
      } else {
        this.renderLightLevelChart();
      }
    }
  }

  renderTemperatureChart() {
    const ctx = document.getElementById('temperatureChart') as HTMLCanvasElement;
    if (ctx) {
      if (this.temperatureChart) {
        this.temperatureChart.destroy();
      }
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
                color: 'rgba(54, 54, 54, 1)',
                maxTicksLimit: 8
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
      if (this.humidityChart) {
        this.humidityChart.destroy();
      }
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
                color: 'rgba(54, 54, 54, 1)',
                maxTicksLimit: 8
              }
            }
          }
        }
      });
    }
  }

  renderLightLevelChart() {
    const ctx = document.getElementById('lightLevelChart') as HTMLCanvasElement;
    if (ctx) {
      if (this.lightLevelChart) {
        this.lightLevelChart.destroy();
      }
      this.lightLevelChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.labels,
          datasets: [
            {
              label: 'Nivel de Luz',
              data: this.lightLevelData,
              borderColor: 'rgba(255, 206, 86, 1)',
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
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
                color: 'rgba(54, 54, 54, 1)',
                maxTicksLimit: 8
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

  updateLightLevelChart() {
    if (this.lightLevelChart) {
      this.lightLevelChart.data.labels = this.labels;
      this.lightLevelChart.data.datasets[0].data = this.lightLevelData;
      this.lightLevelChart.update();
    }
  }
}
