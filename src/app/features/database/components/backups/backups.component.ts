import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BackupService, Backup, SchedulerStatus } from '../../services/backup.service';

@Component({
  selector: 'app-backups',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './backups.component.html',
  styles: []
})
export class BackupsComponent implements OnInit {
  backups: Backup[] = [];
  isLoading: boolean = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Filtro de tipo de backup
  selectedType: string = '';
  
  // Modal de confirmación para eliminar
  showDeleteModal: boolean = false;
  backupToDelete: Backup | null = null;
  
  // Modal de confirmación para restaurar
  showRestoreModal: boolean = false;
  backupToRestore: Backup | null = null;
  
  // Modal de configuración del programador
  showSchedulerModal: boolean = false;
  schedulerStatus: SchedulerStatus | null = null;
  schedulerEnabled: boolean = false;
  schedulerInterval: number = 24;

  constructor(private backupService: BackupService) {}

  ngOnInit(): void {
    this.loadBackups();
    this.loadSchedulerStatus();
  }

  loadBackups(): void {
    this.isLoading = true;
    this.error = null;
    
    this.backupService.getBackups(this.selectedType)
      .subscribe({
        next: (response) => {
          this.backups = response.backups || [];
          console.log('Backups cargados:', this.backups);
          console.log('Filtro actual:', this.selectedType);
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Error al cargar los backups. Por favor intente nuevamente.';
          this.isLoading = false;
          console.error(err);
        }
      });
  }

  loadSchedulerStatus(): void {
    this.backupService.getSchedulerStatus()
      .subscribe({
        next: (response) => {
          if (response.success && response.status) {
            this.schedulerStatus = response.status;
            this.schedulerEnabled = response.status.active;
            this.schedulerInterval = response.status.interval_hours;
          }
        },
        error: (err) => {
          console.error('Error al cargar el estado del programador:', err);
        }
      });
  }

  createBackup(): void {
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;
    
    this.backupService.createBackup()
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Backup creado correctamente.';
            this.loadBackups();
          } else {
            this.error = response.error || 'Error desconocido al crear backup.';
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.error = 'Error al crear backup. Por favor intente nuevamente.';
          this.isLoading = false;
          console.error(err);
        }
      });
  }

  downloadBackup(backup: Backup, event: Event): void {
    event.stopPropagation();
    
    const downloadUrl = this.backupService.getBackupDownloadUrl(backup.filename);
    
    // Crear elemento de anclaje para descarga
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = downloadUrl;
    a.download = backup.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // Modal de eliminación de backup
  openDeleteModal(backup: Backup, event: Event): void {
    event.stopPropagation();
    this.backupToDelete = backup;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.backupToDelete = null;
  }

  confirmDeleteBackup(): void {
    if (!this.backupToDelete) return;
    
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;
    
    this.backupService.deleteBackup(this.backupToDelete.filename)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Backup eliminado correctamente.';
            this.loadBackups();
            this.closeDeleteModal();
          } else {
            this.error = response.error || 'Error desconocido al eliminar backup.';
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.error = 'Error al eliminar backup. Por favor intente nuevamente.';
          this.isLoading = false;
          console.error(err);
          this.closeDeleteModal();
        }
      });
  }

  // Modal de restauración de backup
  openRestoreModal(backup: Backup, event: Event): void {
    event.stopPropagation();
    this.backupToRestore = backup;
    this.showRestoreModal = true;
  }

  closeRestoreModal(): void {
    this.showRestoreModal = false;
    this.backupToRestore = null;
  }

  confirmRestoreBackup(): void {
    if (!this.backupToRestore) return;
    
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;
    
    this.backupService.restoreBackup(this.backupToRestore.filename)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Base de datos restaurada correctamente.';
            this.closeRestoreModal();
            this.isLoading = false;
          } else {
            this.error = response.error || 'Error desconocido al restaurar backup.';
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.error = 'Error al restaurar backup. Por favor intente nuevamente.';
          this.isLoading = false;
          console.error(err);
          this.closeRestoreModal();
        }
      });
  }

  // Modal de configuración del programador
  openSchedulerModal(): void {
    this.loadSchedulerStatus();
    this.showSchedulerModal = true;
  }

  closeSchedulerModal(): void {
    this.showSchedulerModal = false;
  }

  saveSchedulerConfig(): void {
    this.isLoading = true;
    this.error = null;
    this.successMessage = null;
    
    const config = {
      enabled: this.schedulerEnabled,
      interval_hours: this.schedulerInterval
    };
    
    this.backupService.configureScheduler(config)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Programador configurado correctamente.';
            this.schedulerStatus = response.status || null;
            this.closeSchedulerModal();
            this.isLoading = false;
          } else {
            this.error = response.error || 'Error desconocido al configurar programador.';
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.error = 'Error al configurar programador. Por favor intente nuevamente.';
          this.isLoading = false;
          console.error(err);
        }
      });
  }

  filterByType(type: string): void {
    this.selectedType = type.toLowerCase();
    this.loadBackups();
  }

  clearFilters(): void {
    this.selectedType = '';
    this.loadBackups();
  }
  
  // Utilidades
  formatFileSize(bytes: number): string {
    return this.backupService.formatFileSize(bytes);
  }

  formatDate(dateString: string): string {
    return this.backupService.formatDate(dateString);
  }
  
  // Helper para cálculos con Math
  calculateDays(hours: number): number {
    return Math.floor(hours / 24);
  }
  
  // Determinar si un backup coincide con el tipo seleccionado
  isTypeMatch(backup: Backup): boolean {
    if (!this.selectedType) return true;
    return backup.type.toLowerCase() === this.selectedType.toLowerCase();
  }
} 