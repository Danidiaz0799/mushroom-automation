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

  toggleLuces() {
    this.lucesEncendidas.update(value => !value);
    const command = this.lucesEncendidas() ? true : false;
    this.actuatorService.lightControl(command).subscribe(response => {
      console.log(response.message);
    }, error => {
      console.error(error);
    });
  }

}
