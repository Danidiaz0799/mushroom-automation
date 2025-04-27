import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MsadService, ReportListResponse, SchedulerConfig, SchedulerStatusResponse } from '../../services/msad.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { Subject, interval } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reports.component.html',
  styles: []
})
export class ReportsComponent implements OnInit, OnDestroy {
  reports: any[] = [];
  isLoading = false;
  error: string | null = null;
  downloadedData: any[] = [];
  showReportModal = false;
  showSchedulerModal = false;
  showDeleteModal = false;
  reportToDelete: any = null;
  reportFormData = {
    start_date: '',
    end_date: '',
    data_type: 'sensors',
    format: 'json'
  };

  // Scheduler configuration
  schedulerFormData: SchedulerConfig = {
    interval_hours: 24,
    client_id: '',
    start_date: '',
    end_date: '',
    data_type: 'sensors',
    format: 'json'
  };

  // Scheduler status for active clients
  schedulerStatuses: Map<string, SchedulerStatusResponse> = new Map();
  
  // Programadores filtrados para mostrar en la UI
  filteredSchedulerStatuses: Map<string, SchedulerStatusResponse> = new Map();

  // Filter options
  selectedDataType: string = '';
  selectedFormat: string = '';
  selectedClient: string = '';
  
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

  intervalOptions = [
    { value: 1, label: 'Cada hora' },
    { value: 6, label: 'Cada 6 horas' },
    { value: 12, label: 'Cada 12 horas' },
    { value: 24, label: 'Cada día' },
    { value: 168, label: 'Cada semana' }
  ];

  clients: any[] = [];
  
  // Variable para controlar la vista actual (reportes o programadores)
  activeView: 'reports' | 'schedulers' = 'reports';
  
  // Add a storage key to maintain compatibility
  private readonly STORAGE_KEY = 'currentClientId';
  
  // Para desuscribirse de los observables cuando se destruya el componente
  private destroy$ = new Subject<void>();

  constructor(
    private msadService: MsadService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get the currently selected client from localStorage
    this.selectedClient = this.getCurrentClientId();
    
    // Load available clients
    this.loadClients();
    
    // Load reports
    this.loadReports();
    
    // Verificar programadores activos para cada cliente
    this.checkSchedulersStatus();
    
    // Configurar actualizaciones periódicas de estado de programadores (cada 30 segundos)
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
    // Desuscribirse de todos los observables
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Método para alternar entre vistas
  toggleView(view: 'reports' | 'schedulers'): void {
    this.activeView = view;
    if (view === 'schedulers') {
      this.checkSchedulersStatus();
    } else {
      this.loadReports();
    }
  }

  loadClients(): void {
    this.isLoading = true; // Indicate loading state if needed
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

  // Verificar el estado de programadores para cada cliente
  checkSchedulersStatus(): void {
    this.isLoading = true;
    this.error = null;
    this.schedulerStatuses.clear();
    
    // Si no hay clientes, terminar
    if (!this.clients || this.clients.length <= 1) {
      this.isLoading = false;
      return;
    }
    
    // Para cada cliente (excepto el primer elemento que es "Todos los clientes")
    let completedChecks = 0;
    const clientsToCheck = this.clients.filter(c => c.client_id !== '');
    
    // Si no hay clientes para verificar
    if (clientsToCheck.length === 0) {
      this.isLoading = false;
      return;
    }
    
    clientsToCheck.forEach(client => {
      this.msadService.getSchedulerStatus(client.client_id).subscribe({
        next: (response: SchedulerStatusResponse) => {
          if (response.success && response.is_running) {
            this.schedulerStatuses.set(client.client_id, response);
          }
          completedChecks++;
          if (completedChecks === clientsToCheck.length) {
            this.applySchedulerFilters(); // Aplicar filtros después de cargar todos
            this.isLoading = false;
          }
        },
        error: () => {
          // Ignorar errores, asumimos que no hay programador para este cliente
          completedChecks++;
          if (completedChecks === clientsToCheck.length) {
            this.applySchedulerFilters(); // Aplicar filtros incluso si hay errores
            this.isLoading = false;
          }
        }
      });
    });
  }

  // Aplicar filtros a programadores
  applySchedulerFilters(): void {
    this.filteredSchedulerStatuses = new Map(this.schedulerStatuses);
    
    // Filtrar por cliente específico
    if (this.selectedClient) {
      const filteredMap = new Map();
      if (this.schedulerStatuses.has(this.selectedClient)) {
        // Asegúrate de obtener el valor antes de establecerlo
        const status = this.schedulerStatuses.get(this.selectedClient);
        if (status) { // Comprobación adicional por si acaso
          filteredMap.set(this.selectedClient, status);
        }
      }
      this.filteredSchedulerStatuses = filteredMap;
    }
    
    // Filtrar por tipo de datos
    if (this.selectedDataType) {
      const filteredMap = new Map();
      this.filteredSchedulerStatuses.forEach((status, clientId) => {
        if (status.config?.data_type === this.selectedDataType) {
          filteredMap.set(clientId, status);
        }
      });
      this.filteredSchedulerStatuses = filteredMap;
    }
    
    // Filtrar por formato
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
    // Al restablecer, si hay un cliente activo, usarlo, sino mostrar todos
    this.selectedClient = this.getCurrentClientId() || ''; 
    this.applyFilters();
  }

  loadReports(): void {
    this.isLoading = true;
    this.error = null;
    
    if (!this.selectedClient) {
      this.msadService.getAllReports(this.selectedFormat, this.selectedDataType)
        .subscribe({
          next: (response: ReportListResponse) => {
            this.reports = response.reports || [];
            this.isLoading = false;
          },
          error: (err: any) => {
            this.error = 'Error al cargar los reportes. Por favor intente nuevamente.';
            this.isLoading = false;
            console.error(err);
          }
        });
    } else {
      this.msadService.getClientReports(this.selectedClient, this.selectedFormat, this.selectedDataType)
        .subscribe({
          next: (response: ReportListResponse) => {
            this.reports = response.reports || [];
            this.isLoading = false;
          },
          error: (err: any) => {
            this.error = 'Error al cargar los reportes. Por favor intente nuevamente.';
            this.isLoading = false;
            console.error(err);
          }
        });
    }
  }

  viewReportDetails(report: any): void {
    this.router.navigate(['/information/reports', report.client_id, report.report_id]);
  }

  downloadReport(report: any, event: Event): void {
    // Detener la propagación para que no se navegue a los detalles del reporte
    event.stopPropagation();
    
    // Extraer el nombre del archivo de la URL original
    const urlParts = report.download_url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    // Construir la URL correcta usando el servicio
    const correctUrl = this.msadService.getReportDownloadUrl(report.client_id, fileName);
    
    // Determinar el tipo MIME basado en el formato
    const mimeType = report.format === 'json' ? 'application/json' : 'text/csv';
    
    // Crear elemento de anclaje para descarga
    const a = document.createElement('a');
    a.style.display = 'none';
    document.body.appendChild(a);
    
    // Realizar la descarga mediante fetch para asegurar que se maneje como archivo
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
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Error downloading file:', error);
        this.error = `Error al descargar el archivo. Asegúrese de estar conectado al servidor (raspserver.local:5000).`;
      })
      .finally(() => {
        document.body.removeChild(a);
      });
  }

  // Funciones para programadores
  openSchedulerModal(): void {
    if (!this.selectedClient) {
      this.error = 'Por favor seleccione un cliente para configurar un programador';
      return;
    }
    
    // Si ya existe un programador para este cliente, cargamos su configuración
    const existingScheduler = this.schedulerStatuses.get(this.selectedClient);
    if (existingScheduler && existingScheduler.config) {
      this.schedulerFormData = {...existingScheduler.config};
    } else {
      // Inicializar formulario con valores por defecto
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      this.schedulerFormData = {
        interval_hours: 24,
        client_id: this.selectedClient,
        start_date: this.formatDateForInput(today),
        end_date: this.formatDateForInput(tomorrow),
        data_type: 'sensors',
        format: 'json'
      };
    }
    
    this.showSchedulerModal = true;
  }
  
  closeSchedulerModal(): void {
    this.showSchedulerModal = false;
  }
  
  saveScheduler(): void {
    this.isLoading = true;
    this.error = null;
    
    this.msadService.startScheduler(this.schedulerFormData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.closeSchedulerModal();
            this.checkSchedulersStatus();
          } else {
            this.error = response.error || 'Error desconocido al configurar el programador';
            this.isLoading = false;
          }
        },
        error: (err) => {
          this.error = 'Error al configurar el programador. Por favor intente nuevamente.';
          this.isLoading = false;
          console.error(err);
        }
      });
  }
  
  // Detener un programador específico por cliente
  stopScheduler(clientId: string, event: Event): void {
    event.stopPropagation();
    this.isLoading = true;
    this.error = null;
    
    this.msadService.stopScheduler(clientId)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.schedulerStatuses.delete(clientId);
          } else {
            this.error = response.error || 'Error desconocido al detener el programador';
          }
          this.isLoading = false;
          this.checkSchedulersStatus();
        },
        error: (err) => {
          this.error = 'Error al detener el programador. Por favor intente nuevamente.';
          this.isLoading = false;
          console.error(err);
        }
      });
  }

  // Funciones para reportes manuales
  openDeleteModal(report: any, event: Event): void {
    this.deleteReport(report, event);
  }

  // Abre el modal de confirmación
  deleteReport(report: any, event: Event): void {
    event.stopPropagation();
    this.reportToDelete = report;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.reportToDelete = null;
  }

  confirmDeleteReport(): void {
    if (!this.reportToDelete) return;
    
    this.isLoading = true;
    this.msadService.deleteReport(this.reportToDelete.client_id, this.reportToDelete.report_id)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            // Recargar la lista de reportes después de eliminar
            this.loadReports();
            this.closeDeleteModal();
          } else {
            this.error = response.error || 'Error desconocido al eliminar el reporte';
            this.isLoading = false;
          }
        },
        error: (err: any) => {
          this.error = 'Error al eliminar el reporte. Por favor intente nuevamente.';
          this.isLoading = false;
          console.error(err);
          this.closeDeleteModal();
        }
      });
  }

  openGenerateReportModal(): void {
    // Initialize form with today's date and yesterday's date
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    this.reportFormData = {
      start_date: this.formatDateForInput(yesterday),
      end_date: this.formatDateForInput(today),
      data_type: 'sensors',
      format: 'json'
    };
    
    this.showReportModal = true;
  }

  closeReportModal(): void {
    this.showReportModal = false;
  }

  formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  generateReport(): void {
    if (!this.selectedClient) {
      this.error = 'Por favor seleccione un cliente para generar un reporte';
      return;
    }
    
    this.msadService.generateReport(this.selectedClient, this.reportFormData)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.closeReportModal();
            this.loadReports();
          } else {
            this.error = response.error || 'Error desconocido al generar el reporte';
          }
        },
        error: (err: any) => {
          this.error = 'Error al generar el reporte. Por favor intente nuevamente.';
          console.error(err);
        }
      });
  }
  
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

  // Formatear siguiente ejecución para mostrar en la UI
  formatNextRun(dateString: string | undefined): string {
    if (!dateString) return 'No programado';
    const date = new Date(dateString);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    
    // Si es menos de un día
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
      return `En ${hours}h ${minutes}m`;
    }
    
    // Si es más de un día
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `En ${days} día${days !== 1 ? 's' : ''}`;
  }

  // Client service methods implemented directly
  getCurrentClientId(): string {
    const storedId = localStorage.getItem(this.STORAGE_KEY);
    return storedId || 'mushroom1';
  }
  
  getCurrentClientName(): string {
    if (!this.selectedClient) return '';
    const client = this.clients.find(c => c.client_id === this.selectedClient);
    return client ? client.name : '';
  }

  getClientNameById(clientId: string): string {
    const client = this.clients.find(c => c.client_id === clientId);
    return client ? client.name : clientId;
  }
  
  // Retorna el label de una opción de intervalo
  getIntervalLabel(hours: number): string {
    const option = this.intervalOptions.find(o => o.value === hours);
    return option ? option.label : `${hours} horas`;
  }
  
  // Retorna la cantidad de programadores activos después de filtrar
  getActiveSchedulersCount(): number {
    // Siempre devuelve el tamaño del mapa filtrado cuando la vista es 'schedulers'
    return this.activeView === 'schedulers' 
      ? this.filteredSchedulerStatuses.size 
      : this.schedulerStatuses.size; // Para la pestaña de reportes, muestra el total real
  }
  
  // Verifica si hay un programador activo para el cliente actual
  hasActiveScheduler(): boolean {
    return this.selectedClient ? this.schedulerStatuses.has(this.selectedClient) : false;
  }
  
  // Obtiene el estado del programador para el cliente actual
  getCurrentClientScheduler(): SchedulerStatusResponse | null {
    return this.selectedClient ? (this.schedulerStatuses.get(this.selectedClient) || null) : null;
  }
}