import { Component, AfterViewInit, OnDestroy } from '@angular/core';
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

  constructor(private dashboardService: DashboardService) {}

  ngAfterViewInit(): void {
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
    this.dashboardService.getSht3xUrlData(1, 10, false).subscribe(data => {
      data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      this.humidityData = data.map((item: any) => item.humidity);
      this.temperatureData = data.map((item: any) => item.temperature);
      this.labels = data.map((item: any) => new Date(item.timestamp).toLocaleTimeString());

      this.latestHumidity = this.humidityData[0];
      this.latestTemperature = this.temperatureData[0];
      this.latestUpdate = this.formatTimestamp(data[0].timestamp);
    });

    this.dashboardService.getGy302Data(1, 10, false).subscribe(data => {
      data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      this.lightLevelData = data.map((item: any) => item.light_level);
      if (this.lightLevelData[0] !== undefined) {
        this.latestLightLevel = this.lightLevelData[0];
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
