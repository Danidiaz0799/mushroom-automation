import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Client } from '../../../models/client.model';

@Component({
  selector: 'app-report-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './report-filters.component.html',
})
export class ReportFiltersComponent {
  @Input() selectedDataType: string = '';
  @Input() selectedFormat: string = '';
  @Input() selectedClient: string = '';
  @Input() clients: Client[] = [];
  
  @Output() selectedClientChange = new EventEmitter<string>();
  @Output() selectedDataTypeChange = new EventEmitter<string>();
  @Output() selectedFormatChange = new EventEmitter<string>();
  @Output() filtersCleared = new EventEmitter<void>();

  dataTypeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'sensors', label: 'Sensores' },
    { value: 'events', label: 'Eventos' },
    { value: 'actuators', label: 'Actuadores' }
  ];
  
  formatOptions = [
    { value: '', label: 'Todos los formatos' },
    { value: 'json', label: 'JSON' },
    { value: 'csv', label: 'CSV' }
  ];

  onClientChange(value: string): void {
    this.selectedClientChange.emit(value);
  }

  onDataTypeChange(value: string): void {
    this.selectedDataTypeChange.emit(value);
  }

  onFormatChange(value: string): void {
    this.selectedFormatChange.emit(value);
  }

  clearFilters(): void {
    this.selectedDataType = '';
    this.selectedFormat = '';
    this.selectedClient = '';
    this.filtersCleared.emit();
  }
} 