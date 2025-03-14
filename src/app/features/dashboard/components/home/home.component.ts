import { Component, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParametersComponent } from '../parameters/parameters.component';
import { ChartsComponent } from '../charts/charts.component';
import { EventsComponent } from '../events/events.component';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, ParametersComponent, ChartsComponent, EventsComponent],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  temperatureData: number[] = [];
  humidityData: number[] = [];
  lightLevelData: number[] = [];
  labels: string[] = [];
  latestTemperature: number | undefined;
  latestHumidity: number | undefined;
  latestLightLevel: number | undefined;
  latestUpdate: string | undefined;
  intervalId: any;
  isAutomatic: boolean = true; // Estado para determinar si está en modo automático
  private dashboardService = inject(DashboardService);

  constructor() {}

  ngAfterViewInit(): void {
    this.getAppState();
    this.intervalId = setInterval(() => {
      this.fetchSensorData();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  getAppState(): void {
    this.dashboardService.getAppState().subscribe(response => {
      this.isAutomatic = response.mode === 'automatico';
      this.fetchSensorData();
    }, error => {
      console.error('Error al obtener el estado de la aplicación:', error);
    });
  }

  fetchSensorData() {
    const endpoint = this.isAutomatic ? this.dashboardService.getSht3xUrlData(1, 10, false) : this.dashboardService.getSht3xUrlDataManual(1, 10, false);
    
    endpoint.subscribe(data => {
      if (data && data.length > 0) {
        data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        this.humidityData = data.map((item: any) => item.humidity);
        this.temperatureData = data.map((item: any) => item.temperature);
        this.labels = data.map((item: any) => new Date(item.timestamp).toLocaleTimeString());

        this.latestHumidity = this.humidityData[0];
        this.latestTemperature = this.temperatureData[0];
        this.latestUpdate = this.formatTimestamp(data[0].timestamp);
      }
    });

    this.dashboardService.getGy302Data(1, 10, false).subscribe(data => {
      if (data && data.length > 0) {
        data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        this.lightLevelData = data.map((item: any) => item.light_level);
        if (this.lightLevelData[0] !== undefined) {
          this.latestLightLevel = this.lightLevelData[0];
        }
      }
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
}
