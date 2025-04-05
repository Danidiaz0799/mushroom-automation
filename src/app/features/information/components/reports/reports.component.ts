import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MsadService, ReportListResponse } from '../../services/msad.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reports.component.html',
  styles: []
})
export class ReportsComponent implements OnInit {
  reports: any[] = [];
  isLoading = false;
  error: string | null = null;
  downloadedData: any[] = [];
  showReportModal = false;
  showDeleteModal = false;
  reportToDelete: any = null;
  reportFormData = {
    start_date: '',
    end_date: '',
    data_type: 'sensors',
    format: 'json'
  };
  
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

  clients: any[] = [];
  
  // Add a storage key to maintain compatibility
  private readonly STORAGE_KEY = 'currentClientId';

  constructor(
    private msadService: MsadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get the currently selected client from localStorage
    this.selectedClient = this.getCurrentClientId();
    
    // Load available clients
    this.loadClients();
    
    // Load reports
    this.loadReports();
  }

  loadClients(): void {
    // For now, use hardcoded clients until we fix the auth service integration
    this.clients = [
      { client_id: '', name: 'Todos los clientes' },
      { client_id: 'mushroom1', name: 'Mushroom 1' },
      { client_id: 'mushroom2', name: 'Mushroom 2' },
      { client_id: 'mushroom123', name: 'Mushroom 123' }
    ];
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

  applyFilters(): void {
    this.loadReports();
  }

  clearFilters(): void {
    this.selectedDataType = '';
    this.selectedFormat = '';
    this.selectedClient = this.getCurrentClientId();
    this.loadReports();
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
        this.error = `Error al descargar el archivo. Asegúrese de estar conectado al servidor (192.168.137.214:5000).`;
      })
      .finally(() => {
        document.body.removeChild(a);
      });
  }

  // Funciones para eliminar reportes
  deleteReport(report: any, event: Event): void {
    // Detener la propagación para que no se navegue a los detalles del reporte
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
} 