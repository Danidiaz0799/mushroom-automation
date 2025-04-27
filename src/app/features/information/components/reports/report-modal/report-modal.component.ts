import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportRequest } from '../../../models/report.model';

@Component({
  selector: 'app-report-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-modal.component.html',
})
export class ReportModalComponent {
  @Input() showModal: boolean = false;
  @Input() reportFormData: ReportRequest = {
    start_date: '',
    end_date: '',
    data_type: 'sensors',
    format: 'json'
  };
  
  @Output() closeModal = new EventEmitter<void>();
  @Output() generateReport = new EventEmitter<void>();

  dataTypeOptions = [
    { value: 'sensors', label: 'Sensores' },
    { value: 'events', label: 'Eventos' },
    { value: 'actuators', label: 'Actuadores' }
  ];
  
  formatOptions = [
    { value: 'json', label: 'JSON' },
    { value: 'csv', label: 'CSV' }
  ];

  onCloseModal(): void {
    this.closeModal.emit();
  }

  onGenerateReport(): void {
    this.generateReport.emit();
  }
} 