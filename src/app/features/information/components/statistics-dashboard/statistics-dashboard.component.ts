import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { StatisticsService } from '../../services/statistics.service';

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

  constructor(
    private fb: FormBuilder,
    private statisticsService: StatisticsService
  ) {
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
    
    this.statisticsService.getDashboardStatistics(formValues.days).subscribe({
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