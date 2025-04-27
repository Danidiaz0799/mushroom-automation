import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-backup-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './backup-actions.component.html',
})
export class BackupActionsComponent {
  @Output() createBackup = new EventEmitter<void>();
  @Output() configureScheduler = new EventEmitter<void>();

  onCreateBackup(): void {
    this.createBackup.emit();
  }

  onConfigureScheduler(): void {
    this.configureScheduler.emit();
  }
} 