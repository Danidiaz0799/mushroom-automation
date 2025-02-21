import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-parameters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parameters.component.html',
})
export class ParametersComponent implements OnInit {
  @Input() latestTemperature: number | undefined;
  @Input() latestHumidity: number | undefined;
  @Input() latestUpdate: string | undefined;
  illuminationState: string = 'Desconocido';
  ventilationState: string = 'Desconocido';
  errorMessage: string | undefined;

  constructor() {}

  ngOnInit(): void {
  }

}
