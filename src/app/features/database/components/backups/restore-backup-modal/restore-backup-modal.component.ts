import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Backup } from '../../../services/backup.service';

@Component({
  selector: 'app-restore-backup-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './restore-backup-modal.component.html',
})
export class RestoreBackupModalComponent {
  @Input() showModal: boolean = false;
  @Input() backupToRestore: Backup | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() confirmRestore = new EventEmitter<void>();

  onCloseModal(): void {
    this.closeModal.emit();
  }

  onConfirmRestore(): void {
    this.confirmRestore.emit();
  }
} 