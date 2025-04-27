import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SchedulerStatus } from '../../../services/backup.service';

@Component({
  selector: 'app-scheduler-config-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './scheduler-config-modal.component.html',
})
export class SchedulerConfigModalComponent implements OnInit, OnChanges {
  @Input() showModal: boolean = false;
  @Input() schedulerStatus: SchedulerStatus | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() saveConfig = new EventEmitter<{ enabled: boolean; interval_hours: number }>();

  // Local state for form binding
  isEnabled: boolean = false;
  intervalHours: number = 24;

  intervalOptions = [
    { value: 1, label: 'Cada hora' },
    { value: 6, label: 'Cada 6 horas' },
    { value: 12, label: 'Cada 12 horas' },
    { value: 24, label: 'Cada día' },
    { value: 7 * 24, label: 'Cada semana' }
  ];

  ngOnInit(): void {
    this.updateLocalState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['schedulerStatus']) {
      this.updateLocalState();
    }
  }

  updateLocalState(): void {
    if (this.schedulerStatus) {
      this.isEnabled = this.schedulerStatus.is_running;
      this.intervalHours = this.schedulerStatus.interval_hours;
    } else {
      this.isEnabled = false;
      this.intervalHours = 24; // Default
    }
  }

  onCloseModal(): void {
    this.closeModal.emit();
  }

  onSaveConfig(): void {
    this.saveConfig.emit({ enabled: this.isEnabled, interval_hours: this.intervalHours });
  }
} 