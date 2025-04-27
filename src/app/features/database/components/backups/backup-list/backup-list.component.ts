import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Backup } from '../../../services/backup.service';

@Component({
  selector: 'app-backup-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './backup-list.component.html',
})
export class BackupListComponent {
  @Input() backups: Backup[] = [];
  @Input() isLoading: boolean = false;

  @Output() download = new EventEmitter<Backup>();
  @Output() restore = new EventEmitter<Backup>();
  @Output() delete = new EventEmitter<Backup>();

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  onDownload(backup: Backup, event: Event): void {
    event.stopPropagation();
    this.download.emit(backup);
  }

  onRestore(backup: Backup, event: Event): void {
    event.stopPropagation();
    this.restore.emit(backup);
  }

  onDelete(backup: Backup, event: Event): void {
    event.stopPropagation();
    this.delete.emit(backup);
  }
} 