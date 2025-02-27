import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-parameters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parameters.component.html',
})
export class ParametersComponent implements OnInit, OnDestroy {
  @Input() latestTemperature: number | undefined;
  @Input() latestHumidity: number | undefined;
  @Input() latestUpdate: string | undefined;
  illuminationState: string = 'Desconocido';
  ventilationState: string = 'Desconocido';
  errorMessage: string | undefined;
  intervalId: any;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.fetchActuatorStates();
    this.intervalId = setInterval(() => {
      this.fetchActuatorStates();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  fetchActuatorStates() {
    this.dashboardService.getActuators(1, 10).subscribe(data => {
      const luces = data.find((actuator: any) => actuator.name === 'Iluminacion');
      const ventiladores = data.find((actuator: any) => actuator.name === 'Ventilacion');
      this.illuminationState = luces.state === 1 ? 'Encendido' : 'Apagado';
      this.ventilationState = ventiladores.state === 1 ? 'Encendido' : 'Apagado';
    }, error => {
      this.errorMessage = error;
    });
  }
}
