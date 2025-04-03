import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { StatisticsService } from '../../services/statistics.service';
import { ClientService } from 'src/app/shared/services/client.service';

interface SensorStats {
  mean: number;
  median: number;
  min: number;
  max: number;
  count: number;
  mode: number;
  std_dev: number;
}

@Component({
  selector: 'app-statistics-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './statistics-dashboard.component.html'
})
export class StatisticsDashboardComponent implements OnInit {
  filterForm: FormGroup;
  temperatureStats: SensorStats | null = null;
  humidityStats: SensorStats | null = null;
  noData = false;

  private fb = inject(FormBuilder);
  private statisticsService = inject(StatisticsService);
  private clientService = inject(ClientService);

  constructor() {
    this.filterForm = this.fb.group({
      days: [7]
    });
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.noData = false;
    const formValues = this.filterForm.value;
    const clientId = this.clientService.getCurrentClientId();
    
    this.statisticsService.getDashboardStatistics(clientId, formValues.days).subscribe({
      next: (data) => {
        if (!data?.sht3x_stats?.temperature || !data?.sht3x_stats?.humidity) {
          this.noData = true;
          return;
        }
        
        this.temperatureStats = data.sht3x_stats.temperature;
        this.humidityStats = data.sht3x_stats.humidity;
      },
      error: () => {
        this.noData = true;
      }
    });
  }

  onFilterChange(): void {
    this.loadDashboard();
  }
}