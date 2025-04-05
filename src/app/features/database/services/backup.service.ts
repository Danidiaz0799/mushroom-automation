import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface Backup {
  filename: string;
  path: string;
  size: number;
  created_at: string;
  type: string;
}

export interface BackupListResponse {
  success: boolean;
  backups: Backup[];
  error?: string;
}

export interface BackupResponse {
  success: boolean;
  message?: string;
  filename?: string;
  path?: string;
  error?: string;
}

export interface SchedulerStatus {
  active: boolean;
  interval_hours: number;
  next_backup: string;
  last_backup: string;
}

export interface SchedulerResponse {
  success: boolean;
  status?: SchedulerStatus;
  message?: string;
  error?: string;
}

export interface SchedulerConfig {
  enabled: boolean;
  interval_hours: number;
}

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private baseUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  // Listar backups
  getBackups(type?: string): Observable<BackupListResponse> {
    // Si no hay tipo especificado o está vacío, obtenemos todos los backups
    if (!type) {
      return this.http.get<BackupListResponse>(`${this.baseUrl}/msad/backups`)
        .pipe(
          catchError(error => {
            console.error('Error al obtener backups:', error);
            return throwError(() => error);
          })
        );
    }
    
    // Si hay un tipo especificado, intentamos filtrar desde el backend
    let params = new HttpParams().set('type', type);
    
    return this.http.get<BackupListResponse>(`${this.baseUrl}/msad/backups`, { params })
      .pipe(
        // En caso de que el backend no soporte el filtrado por tipo o lo implemente diferente,
        // hacemos un filtrado adicional en el cliente
        map(response => {
          if (response.success && response.backups) {
            // Verificamos si ya viene filtrado o hay que filtrarlo manualmente
            const typeLower = type.toLowerCase();
            if (response.backups.length > 0 && 
                response.backups.some(b => b.type && b.type.toLowerCase() !== typeLower)) {
              // Si encontramos backups que no coinciden con el filtro, filtramos manualmente
              const filteredBackups = response.backups.filter(
                b => b.type && b.type.toLowerCase() === typeLower
              );
              console.log('Filtrando manualmente por tipo:', typeLower);
              console.log('Backups originales:', response.backups.length);
              console.log('Backups filtrados:', filteredBackups.length);
              return {
                ...response,
                backups: filteredBackups
              };
            }
          }
          return response;
        }),
        catchError(error => {
          console.error('Error al obtener backups:', error);
          return throwError(() => error);
        })
      );
  }

  // Crear backup manual
  createBackup(): Observable<BackupResponse> {
    return this.http.post<BackupResponse>(`${this.baseUrl}/msad/backups/create`, {})
      .pipe(
        catchError(error => {
          console.error('Error al crear backup:', error);
          return throwError(() => error);
        })
      );
  }

  // Eliminar backup
  deleteBackup(filename: string): Observable<BackupResponse> {
    return this.http.delete<BackupResponse>(`${this.baseUrl}/msad/backups/${filename}`)
      .pipe(
        catchError(error => {
          console.error('Error al eliminar backup:', error);
          return throwError(() => error);
        })
      );
  }

  // Restaurar backup
  restoreBackup(filename: string): Observable<BackupResponse> {
    return this.http.post<BackupResponse>(`${this.baseUrl}/msad/backups/restore/${filename}`, {})
      .pipe(
        catchError(error => {
          console.error('Error al restaurar backup:', error);
          return throwError(() => error);
        })
      );
  }

  // Obtener URL de descarga de backup
  getBackupDownloadUrl(filename: string): string {
    return `${this.baseUrl}/msad/backups/download/${filename}`;
  }

  // Obtener estado del programador
  getSchedulerStatus(): Observable<SchedulerResponse> {
    return this.http.get<SchedulerResponse>(`${this.baseUrl}/msad/backups/scheduler`)
      .pipe(
        catchError(error => {
          console.error('Error al obtener estado del programador:', error);
          return throwError(() => error);
        })
      );
  }

  // Configurar programador
  configureScheduler(config: SchedulerConfig): Observable<SchedulerResponse> {
    return this.http.post<SchedulerResponse>(`${this.baseUrl}/msad/backups/scheduler`, config)
      .pipe(
        catchError(error => {
          console.error('Error al configurar programador:', error);
          return throwError(() => error);
        })
      );
  }

  // Utilidades
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
} 