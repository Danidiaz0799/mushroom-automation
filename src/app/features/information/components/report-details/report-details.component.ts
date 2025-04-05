import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MsadService } from '../../services/msad.service';

// Remove problematic imports and just implement the functionality without dependencies
@Component({
  selector: 'app-report-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-details.component.html',
  styles: []
})
export class ReportDetailsComponent implements OnInit {
  reportId: string | null = null;
  clientId: string | null = null;
  report: any = null;
  isLoading = true;
  error: string | null = null;
  reportData: any[] = [];
  clients: any[] = [];
  
  // Add a storage key to maintain compatibility
  private readonly STORAGE_KEY = 'currentClientId';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private msadService: MsadService
  ) {}

  ngOnInit(): void {
    this.loadClients();
    
    this.route.paramMap.subscribe(params => {
      this.clientId = params.get('clientId');
      this.reportId = params.get('reportId');
      
      if (this.clientId && this.reportId) {
        this.loadReportDetails();
      } else {
        this.error = 'Parámetros de reporte inválidos';
        this.isLoading = false;
      }
    });
  }

  loadClients(): void {
    // For now, use hardcoded clients until we fix the auth service integration
    this.clients = [
      { client_id: 'mushroom1', name: 'Mushroom 1' },
      { client_id: 'mushroom2', name: 'Mushroom 2' },
      { client_id: 'mushroom123', name: 'Mushroom 123' }
    ];
  }

  loadReportDetails(): void {
    // In a real application, we would have an API endpoint to fetch a single report by ID
    // For now, we'll get all reports and filter by ID
    this.isLoading = true;
    
    if (this.clientId) {
      this.msadService.getClientReports(this.clientId)
        .subscribe({
          next: (response: any) => {
            const foundReport = response.reports?.find((r: any) => r.report_id === this.reportId);
            if (foundReport) {
              this.report = foundReport;
              // Load the actual report data
              this.loadReportData();
            } else {
              this.error = 'Reporte no encontrado';
              this.isLoading = false;
            }
          },
          error: (err: any) => {
            this.error = 'Error al cargar el reporte. Por favor intente nuevamente.';
            this.isLoading = false;
            console.error(err);
          }
        });
    }
  }

  loadReportData(): void {
    if (this.report && this.report.download_url) {
      // Usamos la URL del entorno desde el msadService para construir la URL correcta
      // Extraemos el nombre del archivo de la URL original
      const urlParts = this.report.download_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // Construimos la URL correcta usando el servidor real
      const correctUrl = this.msadService.getReportDownloadUrl(this.clientId || '', fileName);
      
      this.isLoading = true;
      
      // Actualizamos la URL de descarga en el reporte
      this.report.download_url = correctUrl;
      
      // Intentamos cargar los datos para previsualización
      fetch(correctUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data: any) => {
          this.reportData = data;
          this.isLoading = false;
        })
        .catch((error: any) => {
          console.error('Error downloading report data:', error);
          this.error = 'Error al cargar los datos del reporte.';
          this.isLoading = false;
        });
    } else {
      this.isLoading = false;
    }
  }

  downloadReport(): void {
    if (this.report) {
      // Usamos la URL correcta del reporte
      const urlParts = this.report.download_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      // Determinar el tipo MIME basado en el formato
      const mimeType = this.report.format === 'json' ? 'application/json' : 'text/csv';
      
      // Crear un elemento de anclaje para la descarga
      const a = document.createElement('a');
      a.style.display = 'none';
      document.body.appendChild(a);
      
      // Si ya tenemos los datos cargados, los usamos para generar un blob
      if (this.reportData && this.reportData.length > 0) {
        let content: string;
        
        if (this.report.format === 'json') {
          content = JSON.stringify(this.reportData, null, 2);
        } else {
          // Convertir JSON a CSV
          const replacer = (key: string, value: any) => value === null ? '' : value;
          const header = Object.keys(this.reportData[0]);
          const csv = [
            header.join(','),
            ...this.reportData.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
          ].join('\r\n');
          content = csv;
        }
        
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        // Si no tenemos los datos, realizar una solicitud fetch para descargar el archivo directamente
        fetch(this.report.download_url)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
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
            this.error = 'Error al descargar el archivo. Por favor intente nuevamente.';
          });
      }
      
      document.body.removeChild(a);
    }
  }

  goBack(): void {
    this.router.navigate(['/information/reports']);
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
    const currentClientId = this.getCurrentClientId();
    const currentClient = this.clients.find(client => client.client_id === currentClientId);
    return currentClient ? currentClient.name : '';
  }

  getClientNameById(clientId: string): string {
    const client = this.clients.find(c => c.client_id === clientId);
    return client ? client.name : clientId;
  }

  getReportKeys(): string[] {
    if (!this.reportData || this.reportData.length === 0) return [];
    return Object.keys(this.reportData[0]);
  }

  // Add a copyDownloadUrl method to copy the report download URL to clipboard
  copyDownloadUrl(): void {
    if (this.report?.download_url) {
      navigator.clipboard.writeText(this.report.download_url)
        .then(() => {
          alert('URL copiada al portapapeles');
        })
        .catch(err => {
          console.error('Error al copiar URL: ', err);
        });
    }
  }
} 