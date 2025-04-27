import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Backup } from '../../../services/backup.service';

@Component({
  selector: 'app-delete-backup-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-backup-modal.component.html',
})
export class DeleteBackupModalComponent {
  @Input() showModal: boolean = false;
  @Input() backupToDelete: Backup | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() confirmDelete = new EventEmitter<void>();

  onCloseModal(): void {
    this.closeModal.emit();
  }

  onConfirmDelete(): void {
    this.confirmDelete.emit();
  }
} 