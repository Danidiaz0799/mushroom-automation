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

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.fetchActuatorStates();
  }

  fetchActuatorStates() {
    this.dashboardService.getActuators(1, 10).subscribe(data => {
      const latestActuator = data[0];
      this.illuminationState = latestActuator.illumination ? 'Encendido' : 'Apagado';
      this.ventilationState = latestActuator.ventilation ? 'Encendido' : 'Apagado';
    }, error => {
      this.errorMessage = error;
    });
  }
}
