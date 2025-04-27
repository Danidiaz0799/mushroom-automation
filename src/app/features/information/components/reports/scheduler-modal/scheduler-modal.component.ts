import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchedulerConfig } from '../../../models/scheduler.model';
import { Client } from '../../../models/client.model';

@Component({
  selector: 'app-scheduler-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scheduler-modal.component.html',
})
export class SchedulerModalComponent {
  @Input() showModal: boolean = false;
  @Input() schedulerFormData: SchedulerConfig = {
    interval_hours: 24,
    client_id: '',
    start_date: '',
    end_date: '',
    data_type: 'sensors',
    format: 'json'
  };
  @Input() clients: Client[] = [];
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveScheduler = new EventEmitter<void>();

  dataTypeOptions = [
    { value: 'sensors', label: 'Sensores' },
    { value: 'events', label: 'Eventos' },
    { value: 'actuators', label: 'Actuadores' }
  ];
  
  formatOptions = [
    { value: 'json', label: 'JSON' },
    { value: 'csv', label: 'CSV' }
  ];

  intervalOptions = [
    { value: 1, label: 'Cada hora' },
    { value: 6, label: 'Cada 6 horas' },
    { value: 12, label: 'Cada 12 horas' },
    { value: 24, label: 'Cada día' },
    { value: 168, label: 'Cada semana' }
  ];

  onCloseModal(): void {
    this.closeModal.emit();
  }

  onSaveScheduler(): void {
    this.saveScheduler.emit();
  }
} 