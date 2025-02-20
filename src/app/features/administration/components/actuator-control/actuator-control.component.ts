import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActuatorService } from '../../services/actuator.service';

@Component({
  selector: 'app-actuator-control',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './actuator-control.component.html',
  styleUrls: ['./actuator-control.component.scss']
})
export class ActuatorControlComponent {
  private actuatorService = inject(ActuatorService);

  lucesEncendidas = signal(false);
  ventiladorEncendido = signal(false);

  toggleLuces() {
    this.lucesEncendidas.update(value => !value);
    this.actuatorService.toggleActuator('luces', this.lucesEncendidas()).subscribe();
  }

  toggleVentilador() {
    this.ventiladorEncendido.update(value => !value);
    this.actuatorService.toggleActuator('ventilador', this.ventiladorEncendido()).subscribe();
  }
}
