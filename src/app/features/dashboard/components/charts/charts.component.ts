import {
  Component,
  Input,
  type AfterViewInit,
  type OnInit,
  type OnDestroy,
  type OnChanges,
  type SimpleChanges,
  effect,
  inject
} from "@angular/core"
import { CommonModule } from "@angular/common"
import { Chart, registerables } from "chart.js"
import { ClientService } from "src/app/shared/services/client.service"

Chart.register(...registerables)

@Component({
  selector: "app-charts",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./charts.component.html",
})
export class ChartsComponent implements AfterViewInit, OnInit, OnDestroy, OnChanges {
  @Input() temperatureData: number[] = []
  @Input() humidityData: number[] = []
  @Input() labels: string[] = []
  @Input() lightLevelData: number[] = []

  temperatureChart: Chart | undefined
  humidityChart: Chart | undefined
  lightLevelChart: Chart | undefined
  intervalId: any
  private clientService = inject(ClientService)

  constructor() {
    // Efecto para responder a cambios en el ID del cliente
    effect(() => {
      // Leer el valor de la señal activa el efecto cuando cambia
      const clientId = this.clientService.currentClientId$()
      
      // Destruir los gráficos existentes para recrearlos con los nuevos datos
      this.destroyCharts()
      
      // Los gráficos se recrearán cuando lleguen los nuevos datos
    })
  }

  ngOnInit(): void {
    this.intervalId = setInterval(() => {}, 5000)
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
    }
    this.destroyCharts()
  }

  destroyCharts(): void {
    if (this.temperatureChart) {
      this.temperatureChart.destroy()
      this.temperatureChart = undefined
    }
    if (this.humidityChart) {
      this.humidityChart.destroy()
      this.humidityChart = undefined
    }
    if (this.lightLevelChart) {
      this.lightLevelChart.destroy()
      this.lightLevelChart = undefined
    }
  }

  ngAfterViewInit(): void {
    this.renderTemperatureChart()
    this.renderHumidityChart()
    this.renderLightLevelChart()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["temperatureData"] || changes["humidityData"] || changes["labels"] || changes["lightLevelData"]) {
      if (this.temperatureChart) {
        this.updateTemperatureChart()
      } else {
        this.renderTemperatureChart()
      }

      if (this.humidityChart) {
        this.updateHumidityChart()
      } else {
        this.renderHumidityChart()
      }

      if (this.lightLevelChart) {
        this.updateLightLevelChart()
      } else {
        this.renderLightLevelChart()
      }
    }
  }

  renderTemperatureChart() {
    const ctx = document.getElementById("temperatureChart") as HTMLCanvasElement
    if (ctx) {
      if (this.temperatureChart) {
        this.temperatureChart.destroy()
      }
      this.temperatureChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: this.labels,
          datasets: [
            {
              label: "Temperatura (°C)",
              data: this.temperatureData,
              borderColor: "rgba(244, 63, 94, 1)", // Color rose-500
              backgroundColor: "rgba(244, 63, 94, 0.1)", // Fondo más sutil
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "rgba(244, 63, 94, 1)",
              pointBorderColor: "#fff",
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: "rgba(54, 54, 54, 1)",
                font: {
                  weight: 500,
                },
              },
            },
            tooltip: {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              titleColor: "rgba(54, 54, 54, 1)",
              bodyColor: "rgba(54, 54, 54, 1)",
              borderColor: "rgba(244, 63, 94, 0.5)",
              borderWidth: 1,
              padding: 10,
              boxPadding: 5,
              usePointStyle: true,
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: "rgba(54, 54, 54, 0.8)",
                font: {
                  size: 10,
                },
              },
            },
            y: {
              beginAtZero: false,
              grid: {
                color: "rgba(0, 0, 0, 0.05)",
              },
              ticks: {
                color: "rgba(54, 54, 54, 0.8)",
                maxTicksLimit: 6,
                font: {
                  size: 10,
                },
              },
            },
          },
        },
      })
    }
  }

  renderHumidityChart() {
    const ctx = document.getElementById("humidityChart") as HTMLCanvasElement
    if (ctx) {
      if (this.humidityChart) {
        this.humidityChart.destroy()
      }
      this.humidityChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: this.labels,
          datasets: [
            {
              label: "Humedad (%)",
              data: this.humidityData,
              borderColor: "rgba(14, 165, 233, 1)", // Color sky-500
              backgroundColor: "rgba(14, 165, 233, 0.1)", // Fondo más sutil
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "rgba(14, 165, 233, 1)",
              pointBorderColor: "#fff",
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: "rgba(54, 54, 54, 1)",
                font: {
                  weight: 500,
                },
              },
            },
            tooltip: {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              titleColor: "rgba(54, 54, 54, 1)",
              bodyColor: "rgba(54, 54, 54, 1)",
              borderColor: "rgba(14, 165, 233, 0.5)",
              borderWidth: 1,
              padding: 10,
              boxPadding: 5,
              usePointStyle: true,
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: "rgba(54, 54, 54, 0.8)",
                font: {
                  size: 10,
                },
              },
            },
            y: {
              beginAtZero: false,
              grid: {
                color: "rgba(0, 0, 0, 0.05)",
              },
              ticks: {
                color: "rgba(54, 54, 54, 0.8)",
                maxTicksLimit: 6,
                font: {
                  size: 10,
                },
              },
            },
          },
        },
      })
    }
  }

  renderLightLevelChart() {
    const ctx = document.getElementById("lightLevelChart") as HTMLCanvasElement
    if (ctx) {
      if (this.lightLevelChart) {
        this.lightLevelChart.destroy()
      }
      this.lightLevelChart = new Chart(ctx, {
        type: "line",
        data: {
          labels: this.labels,
          datasets: [
            {
              label: "Nivel de Luz (lx)",
              data: this.lightLevelData,
              borderColor: "rgba(245, 158, 11, 1)", // Color amber-500
              backgroundColor: "rgba(245, 158, 11, 0.1)", // Fondo más sutil
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: "rgba(245, 158, 11, 1)",
              pointBorderColor: "#fff",
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              labels: {
                color: "rgba(54, 54, 54, 1)",
                font: {
                  weight: 500,
                },
              },
            },
            tooltip: {
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              titleColor: "rgba(54, 54, 54, 1)",
              bodyColor: "rgba(54, 54, 54, 1)",
              borderColor: "rgba(245, 158, 11, 0.5)",
              borderWidth: 1,
              padding: 10,
              boxPadding: 5,
              usePointStyle: true,
            },
          },
          scales: {
            x: {
              grid: {
                display: false,
              },
              ticks: {
                color: "rgba(54, 54, 54, 0.8)",
                font: {
                  size: 10,
                },
              },
            },
            y: {
              beginAtZero: false,
              grid: {
                color: "rgba(0, 0, 0, 0.05)",
              },
              ticks: {
                color: "rgba(54, 54, 54, 0.8)",
                maxTicksLimit: 6,
                font: {
                  size: 10,
                },
              },
            },
          },
        },
      })
    }
  }

  updateTemperatureChart() {
    if (this.temperatureChart) {
      this.temperatureChart.data.labels = this.labels
      this.temperatureChart.data.datasets[0].data = this.temperatureData
      this.temperatureChart.update()
    }
  }

  updateHumidityChart() {
    if (this.humidityChart) {
      this.humidityChart.data.labels = this.labels
      this.humidityChart.data.datasets[0].data = this.humidityData
      this.humidityChart.update()
    }
  }

  updateLightLevelChart() {
    if (this.lightLevelChart) {
      this.lightLevelChart.data.labels = this.labels
      this.lightLevelChart.data.datasets[0].data = this.lightLevelData
      this.lightLevelChart.update()
    }
  }
}

