import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, interval } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { ReportsService } from '../../services/reports.service';
import { SchedulerService } from '../../services/scheduler.service';
import { Report, ReportRequest } from '../../models/report.model';
import { SchedulerConfig, SchedulerStatus } from '../../models/scheduler.model';
import { Client } from '../../models/client.model';
import { ReportFiltersComponent } from './report-filters/report-filters.component';
import { ReportModalComponent } from './report-modal/report-modal.component';
import { SchedulerModalComponent } from './scheduler-modal/scheduler-modal.component';
import { DeleteModalComponent } from './delete-modal/delete-modal.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReportFiltersComponent,
    ReportModalComponent,
    SchedulerModalComponent,
    DeleteModalComponent
  ],
  templateUrl: './reports.component.html',
})
export class ReportsComponent implements OnInit, OnDestroy {
  reports: Report[] = [];
  isLoading = false;
  error: string | null = null;
  successMessage: string | null = null;
  showReportModal = false;
  showSchedulerModal = false;
  showDeleteModal = false;
  reportToDelete: Report | null = null;
  reportFormData: ReportRequest = {
    start_date: '',
    end_date: '',
    data_type: 'sensors',
    format: 'json'
  };

  schedulerFormData: SchedulerConfig = {
    interval_hours: 24,
    client_id: '',
    start_date: '',
    end_date: '',
    data_type: 'sensors',
    format: 'json'
  };

  schedulerStatuses: Map<string, SchedulerStatus> = new Map();
  filteredSchedulerStatuses: Map<string, SchedulerStatus> = new Map();

  selectedDataType: string = '';
  selectedFormat: string = '';
  selectedClient: string = '';
  
  clients: Client[] = [];
  activeView: 'reports' | 'schedulers' = 'reports';
  
  get filteredClientsForModal(): Client[] {
    return this.clients.filter(c => c.client_id !== '');
  }

  private readonly STORAGE_KEY = 'currentClientId';
  private destroy$ = new Subject<void>();

  constructor(
    private reportsService: ReportsService,
    private schedulerService: SchedulerService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.selectedClient = this.getCurrentClientId();
    this.loadClients();
    this.loadReports();
    this.checkSchedulersStatus();
    
    interval(30000).pipe(
      takeUntil(this.destroy$),
      switchMap(() => {
        if (this.activeView === 'schedulers') {
          return new Promise(resolve => {
            this.checkSchedulersStatus();
            resolve(null);
          });
        }
        return Promise.resolve(null);
      })
    ).subscribe();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleView(view: 'reports' | 'schedulers'): void {
    this.activeView = view;
    if (view === 'schedulers') {
      this.checkSchedulersStatus();
    } else {
      this.loadReports();
    }
  }

  loadClients(): void {
    this.isLoading = true;
    this.authService.getClients().subscribe({
      next: (response: any) => {
        this.clients = [{ client_id: '', name: 'Todos los clientes' }, ...response];
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading clients:', err);
        this.error = 'Error al cargar los clientes.';
        this.clients = [{ client_id: '', name: 'Todos los clientes' }];
        this.isLoading = false;
      }
    });
  }

  checkSchedulersStatus(): void {
    this.isLoading = true;
    this.error = null;
    this.schedulerStatuses.clear();
    
    if (!this.clients || this.clients.length <= 1) {
      this.isLoading = false;
      return;
    }
    
    let completedChecks = 0;
    const clientsToCheck = this.clients.filter(c => c.client_id !== '');
    
    if (clientsToCheck.length === 0) {
      this.isLoading = false;
      return;
    }
    
    clientsToCheck.forEach(client => {
      this.schedulerService.getSchedulerStatus(client.client_id).subscribe({
        next: (response: SchedulerStatus) => {
          if (response.success && response.is_running) {
            this.schedulerStatuses.set(client.client_id, response);
          }
          completedChecks++;
          if (completedChecks === clientsToCheck.length) {
            this.applySchedulerFilters();
            this.isLoading = false;
          }
        },
        error: () => {
          completedChecks++;
          if (completedChecks === clientsToCheck.length) {
            this.applySchedulerFilters();
            this.isLoading = false;
          }
        }
      });
    });
  }

  applySchedulerFilters(): void {
    this.filteredSchedulerStatuses = new Map(this.schedulerStatuses);
    
    if (this.selectedClient) {
      const filteredMap = new Map();
      if (this.schedulerStatuses.has(this.selectedClient)) {
        const status = this.schedulerStatuses.get(this.selectedClient);
        if (status) {
          filteredMap.set(this.selectedClient, status);
        }
      }
      this.filteredSchedulerStatuses = filteredMap;
    }
    
    if (this.selectedDataType) {
      const filteredMap = new Map();
      this.filteredSchedulerStatuses.forEach((status, clientId) => {
        if (status.config?.data_type === this.selectedDataType) {
          filteredMap.set(clientId, status);
        }
      });
      this.filteredSchedulerStatuses = filteredMap;
    }
    
    if (this.selectedFormat) {
      const filteredMap = new Map();
      this.filteredSchedulerStatuses.forEach((status, clientId) => {
        if (status.config?.format === this.selectedFormat) {
          filteredMap.set(clientId, status);
        }
      });
      this.filteredSchedulerStatuses = filteredMap;
    }
  }

  loadReports(): void {
    this.isLoading = true;
    this.error = null;

    const observable = this.selectedClient
      ? this.reportsService.getClientReports(this.selectedClient, this.selectedFormat, this.selectedDataType)
      : this.reportsService.getAllReports(this.selectedFormat, this.selectedDataType);

    observable.subscribe({
      next: (response) => {
        if (response.success) {
          this.reports = response.reports || [];
        } else {
          this.error = response.error || 'Error al cargar los reportes';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading reports:', err);
        this.error = 'Error al cargar los reportes';
        this.isLoading = false;
      }
    });
  }

  // Add helper for date formatting
  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  openGenerateReportModal(): void {
    const today = this.formatDateForInput(new Date());
    this.reportFormData = {
      start_date: today, // Initialize with today
      end_date: today,   // Initialize with today
      data_type: 'sensors',
      format: 'json'
    };
    this.showReportModal = true;
  }

  closeReportModal(): void {
    this.showReportModal = false;
  }

  generateReport(): void {
    if (!this.selectedClient) {
      this.error = 'Debe seleccionar un cliente para generar el reporte';
      return;
    }

    this.isLoading = true;
    this.reportsService.generateReport(this.selectedClient, this.reportFormData).subscribe({
      next: (response) => {
        this.error = null;
        this.successMessage = null;
        if (response.success) {
          this.successMessage = response.message || 'Reporte generado con éxito.';
          this.loadReports();
          this.showReportModal = false;
        } else {
          this.error = response.error || 'Error al generar el reporte';
        }
        this.isLoading = false;
        setTimeout(() => this.successMessage = null, 5000);
      },
      error: (err) => {
        console.error('Error generating report:', err);
        this.error = 'Error al generar el reporte';
        this.isLoading = false;
        this.successMessage = null;
      }
    });
  }

  openSchedulerModal(): void {
    const today = this.formatDateForInput(new Date());
    // Default client to current selected if available
    const currentClientId = this.getCurrentClientId() || ''; 
    this.schedulerFormData = {
      interval_hours: 24,
      client_id: currentClientId,
      start_date: today, // Initialize with today
      end_date: today,   // Initialize with today
      data_type: 'sensors',
      format: 'json'
    };
    // Ensure the selected client in the modal matches, or is null if none selected
    this.schedulerFormData.client_id = this.clients.some(c => c.client_id === currentClientId) ? currentClientId : '';
    
    this.showSchedulerModal = true;
  }

  closeSchedulerModal(): void {
    this.showSchedulerModal = false;
  }

  saveScheduler(): void {
    if (!this.schedulerFormData.client_id) {
      this.error = 'Debe seleccionar un cliente para el programador';
      return;
    }

    this.isLoading = true;
    this.schedulerService.startScheduler(this.schedulerFormData).subscribe({
      next: (response) => {
        this.error = null;
        this.successMessage = null;
        if (response.success) {
          this.successMessage = response.message || 'Programador configurado con éxito.';
          this.checkSchedulersStatus();
          this.showSchedulerModal = false;
        } else {
          this.error = response.error || 'Error al configurar el programador';
        }
        this.isLoading = false;
        setTimeout(() => this.successMessage = null, 5000);
      },
      error: (err) => {
        console.error('Error saving scheduler:', err);
        this.error = 'Error al configurar el programador';
        this.isLoading = false;
        this.successMessage = null;
      }
    });
  }

  stopScheduler(clientId: string): void {
    this.isLoading = true;
    this.schedulerService.stopScheduler(clientId).subscribe({
      next: (response) => {
        this.error = null;
        this.successMessage = null;
        if (response.success) {
          this.successMessage = response.message || 'Programador detenido con éxito.';
          this.checkSchedulersStatus();
        } else {
          this.error = response.error || 'Error al detener el programador';
        }
        this.isLoading = false;
        setTimeout(() => this.successMessage = null, 5000);
      },
      error: (err) => {
        console.error('Error stopping scheduler:', err);
        this.error = 'Error al detener el programador';
        this.isLoading = false;
        this.successMessage = null;
      }
    });
  }

  openDeleteModal(report: Report): void {
    this.reportToDelete = report;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.reportToDelete = null;
  }

  confirmDeleteReport(): void {
    if (!this.reportToDelete || !this.reportToDelete.client_id || !this.reportToDelete.report_id) {
      this.error = 'No se puede eliminar el reporte';
      return;
    }

    this.isLoading = true;
    this.reportsService.deleteReport(this.reportToDelete.client_id, this.reportToDelete.report_id).subscribe({
      next: (response) => {
        this.error = null;
        this.successMessage = null;
        if (response.success) {
          this.successMessage = response.message || 'Reporte eliminado con éxito.';
          this.loadReports();
          this.showDeleteModal = false;
          this.reportToDelete = null;
        } else {
          this.error = response.error || 'Error al eliminar el reporte';
        }
        this.isLoading = false;
        setTimeout(() => this.successMessage = null, 5000);
      },
      error: (err) => {
        console.error('Error deleting report:', err);
        this.error = 'Error al eliminar el reporte';
        this.isLoading = false;
        this.successMessage = null;
      }
    });
  }

  getCurrentClientId(): string {
    return localStorage.getItem(this.STORAGE_KEY) || '';
  }

  getCurrentClientName(): string {
    const client = this.clients.find(c => c.client_id === this.selectedClient);
    return client ? client.name : '';
  }

  getClientNameById(clientId: string): string {
    const client = this.clients.find(c => c.client_id === clientId);
    return client ? client.name : clientId;
  }

  applyFilters(): void {
    if (this.activeView === 'reports') {
      this.loadReports();
    } else {
      this.applySchedulerFilters();
    }
  }

  clearFilters(): void {
    this.selectedDataType = '';
    this.selectedFormat = '';
    this.selectedClient = this.getCurrentClientId() || ''; 
    this.applyFilters();
  }

  downloadReport(report: Report): void {
    if (!report || !report.client_id || !report.filename) {
      this.error = 'No se puede descargar el reporte seleccionado.';
      return;
    }
    
    const correctUrl = this.reportsService.getReportDownloadUrl(report.client_id, report.filename);
    const mimeType = report.format === 'json' ? 'application/json' : 'text/csv';
    
    const a = document.createElement('a');
    a.style.display = 'none';
    document.body.appendChild(a);
    
    fetch(correctUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Error al descargar el archivo');
        }
        return response.blob();
      })
      .then(blob => {
        const url = window.URL.createObjectURL(new Blob([blob], { type: mimeType }));
        a.href = url;
        a.download = report.filename;
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Error downloading file:', error);
        this.error = `Error al descargar el archivo. ${error.message || ''}`;
      })
      .finally(() => {
        document.body.removeChild(a);
      });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  }

  formatNextRun(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const nextRun = new Date(dateString);
    const now = new Date();
    const diff = nextRun.getTime() - now.getTime();
    
    if (diff < 0) return 'En progreso';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `En ${hours}h ${minutes}m`;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getIntervalLabel(hours: number): string {
    const intervalOptions = [
      { value: 1, label: 'Cada hora' },
      { value: 6, label: 'Cada 6 horas' },
      { value: 12, label: 'Cada 12 horas' },
      { value: 24, label: 'Cada día' },
      { value: 168, label: 'Cada semana' }
    ];
    const option = intervalOptions.find(o => o.value === hours);
    return option ? option.label : `${hours} horas`;
  }

  getActiveSchedulersCount(): number {
    return this.filteredSchedulerStatuses.size;
  }

  hasActiveScheduler(): boolean {
    return this.selectedClient ? this.schedulerStatuses.has(this.selectedClient) : false;
  }
}